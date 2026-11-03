alter table public.objects add column deleted_at timestamptz;
alter table public.tasks add column deleted_at timestamptz;

create or replace function private.has_task_in_object(p_object_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.tasks t
    where t.object_id = p_object_id
      and t.assignee_id = (select auth.uid())
      and t.deleted_at is null
  );
$$;

drop policy objects_select on public.objects;
create policy objects_select on public.objects
  for select to authenticated
  using (deleted_at is null and ((select private.is_manager()) or private.has_task_in_object(id)));

drop policy tasks_select on public.tasks;
create policy tasks_select on public.tasks
  for select to authenticated
  using (deleted_at is null and ((select private.is_manager()) or assignee_id = (select auth.uid())));

drop policy tasks_insert on public.tasks;
create policy tasks_insert on public.tasks
  for insert to authenticated
  with check (
    (select private.is_manager())
    and exists (select 1 from public.objects o where o.id = object_id)
  );

drop policy tasks_update on public.tasks;
create policy tasks_update on public.tasks
  for update to authenticated
  using ((select private.is_manager()))
  with check (
    (select private.is_manager())
    and exists (select 1 from public.objects o where o.id = object_id)
  );

drop policy objects_delete on public.objects;
drop policy tasks_delete on public.tasks;
revoke delete on public.objects, public.tasks from authenticated;

create function public.delete_task(p_task_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'auth_required' using errcode = '42501';
  end if;
  if not private.is_manager() then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  update public.tasks set deleted_at = now() where id = p_task_id and deleted_at is null;
  if not found then
    raise exception 'task_not_found' using errcode = 'P0002';
  end if;
end;
$$;

create function public.delete_object(p_object_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'auth_required' using errcode = '42501';
  end if;
  if not private.is_manager() then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  update public.objects set deleted_at = now() where id = p_object_id and deleted_at is null;
  if not found then
    raise exception 'object_not_found' using errcode = 'P0002';
  end if;

  update public.tasks set deleted_at = now() where object_id = p_object_id and deleted_at is null;
end;
$$;

revoke execute on function public.delete_task(uuid) from public, anon;
revoke execute on function public.delete_object(uuid) from public, anon;
grant execute on function public.delete_task(uuid) to authenticated;
grant execute on function public.delete_object(uuid) to authenticated;
