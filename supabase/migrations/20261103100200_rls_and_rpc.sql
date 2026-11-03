-- Права доступа: RLS + права на колонки + единственный путь смены статуса (RPC).

alter table public.profiles enable row level security;
alter table public.objects enable row level security;
alter table public.tasks enable row level security;
alter table public.task_status_history enable row level security;

revoke all on public.profiles, public.objects, public.tasks, public.task_status_history
  from public, anon, authenticated;

grant select on public.profiles to authenticated;

grant select, delete on public.objects to authenticated;
grant insert (name, address), update (name, address) on public.objects to authenticated;

grant select, delete on public.tasks to authenticated;
grant insert (title, description, object_id, assignee_id),
      update (title, description, object_id, assignee_id)
  on public.tasks to authenticated;

grant select on public.task_status_history to authenticated;

-- profiles: только чтение (имена нужны для отображения автора и исполнителя)
create policy profiles_select on public.profiles
  for select to authenticated
  using (true);

-- objects: постановщик видит всё, исполнитель только объекты со своими задачами
create policy objects_select on public.objects
  for select to authenticated
  using ((select private.is_manager()) or private.has_task_in_object(id));

create policy objects_insert on public.objects
  for insert to authenticated
  with check ((select private.is_manager()));

create policy objects_update on public.objects
  for update to authenticated
  using ((select private.is_manager()))
  with check ((select private.is_manager()));

create policy objects_delete on public.objects
  for delete to authenticated
  using ((select private.is_manager()));

-- tasks: постановщик видит всё, исполнитель только свои; менять может только постановщик
create policy tasks_select on public.tasks
  for select to authenticated
  using ((select private.is_manager()) or assignee_id = (select auth.uid()));

create policy tasks_insert on public.tasks
  for insert to authenticated
  with check ((select private.is_manager()));

create policy tasks_update on public.tasks
  for update to authenticated
  using ((select private.is_manager()))
  with check ((select private.is_manager()));

create policy tasks_delete on public.tasks
  for delete to authenticated
  using ((select private.is_manager()));

-- история: видна, если видна сама задача (RLS tasks применяется внутри exists);
-- политик на запись нет, прав на запись нет, записи создают только триггер и RPC
create policy task_status_history_select on public.task_status_history
  for select to authenticated
  using (exists (select 1 from public.tasks t where t.id = task_status_history.task_id));

-- Единственный способ сменить статус.
create function public.change_task_status(
  p_task_id uuid,
  p_to_status public.task_status,
  p_comment text default null
)
returns public.tasks
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_task public.tasks;
  v_rule private.task_transitions;
  v_comment text := nullif(btrim(p_comment), '');
begin
  if v_uid is null then
    raise exception 'auth_required' using errcode = '42501';
  end if;

  select * into v_task from public.tasks where id = p_task_id for update;

  -- чужую задачу не раскрываем: для исполнителя она "не существует"
  if not found or not (private.is_manager() or v_task.assignee_id = v_uid) then
    raise exception 'task_not_found' using errcode = 'P0002';
  end if;

  select * into v_rule
  from private.task_transitions
  where from_status = v_task.status and to_status = p_to_status;

  if not found then
    raise exception 'transition_not_allowed' using errcode = '23514';
  end if;

  if (v_rule.actor = 'assignee' and v_task.assignee_id <> v_uid)
     or (v_rule.actor = 'manager' and not private.is_manager()) then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  if v_rule.requires_comment and v_comment is null then
    raise exception 'comment_required' using errcode = '23514';
  end if;

  perform set_config('app.status_change', 'on', true);

  update public.tasks set status = p_to_status where id = p_task_id
  returning * into v_task;

  insert into public.task_status_history (task_id, from_status, to_status, changed_by, comment)
  values (p_task_id, v_rule.from_status, p_to_status, v_uid, v_comment);

  return v_task;
end;
$$;

revoke execute on function public.change_task_status(uuid, public.task_status, text) from public, anon;
grant execute on function public.change_task_status(uuid, public.task_status, text) to authenticated;
