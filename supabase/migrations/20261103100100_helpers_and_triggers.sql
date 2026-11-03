-- Хелперы и триггеры. Все функции security definer живут в схеме private,
-- которую не отдаёт Data API, и работают с пустым search_path.

create function private.is_manager()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'manager'
  );
$$;

create function private.has_task_in_object(p_object_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.tasks t
    where t.object_id = p_object_id and t.assignee_id = (select auth.uid())
  );
$$;

-- Профиль создаётся автоматически; роль всегда executor, менять её может только администратор БД.
create function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

create function private.objects_before_insert()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'auth_required' using errcode = '42501';
  end if;
  new.created_by := (select auth.uid());
  new.created_at := now();
  return new;
end;
$$;

create trigger objects_before_insert
  before insert on public.objects
  for each row execute function private.objects_before_insert();

-- Автор, дата и стартовый статус проставляются базой, что бы ни прислал клиент.
create function private.tasks_before_insert()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'auth_required' using errcode = '42501';
  end if;
  new.author_id := (select auth.uid());
  new.status := 'new';
  new.created_at := now();
  new.updated_at := now();
  return new;
end;
$$;

create trigger tasks_before_insert
  before insert on public.tasks
  for each row execute function private.tasks_before_insert();

create function private.tasks_validate_assignee()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.profiles p where p.id = new.assignee_id and p.role = 'executor'
  ) then
    raise exception 'assignee_must_be_executor' using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger tasks_validate_assignee
  before insert or update of assignee_id on public.tasks
  for each row execute function private.tasks_validate_assignee();

-- Вторая линия защиты: статус и служебные поля нельзя изменить мимо change_task_status.
create function private.tasks_before_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.author_id is distinct from old.author_id or new.created_at is distinct from old.created_at then
    raise exception 'immutable_field' using errcode = '42501';
  end if;
  if new.status is distinct from old.status
     and coalesce(current_setting('app.status_change', true), '') <> 'on' then
    raise exception 'status_change_via_rpc_only' using errcode = '42501';
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create trigger tasks_before_update
  before update on public.tasks
  for each row execute function private.tasks_before_update();

-- Первая запись истории при создании задачи.
create function private.tasks_after_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.task_status_history (task_id, from_status, to_status, changed_by)
  values (new.id, null, new.status, new.author_id);
  return new;
end;
$$;

create trigger tasks_after_insert
  after insert on public.tasks
  for each row execute function private.tasks_after_insert();

revoke execute on all functions in schema private from public, anon;
grant execute on function private.is_manager() to authenticated;
grant execute on function private.has_task_in_object(uuid) to authenticated;
