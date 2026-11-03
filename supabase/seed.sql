-- Демо-данные. Пользователи создаются вручную в Supabase (Authentication -> Users).
-- Роли и имена назначаются по email; профили создаются при необходимости.
-- Если пользователей нет или данные уже есть, seed пропускается.

create function pg_temp.act_as(p_uid uuid) returns void
language sql as $$
  select set_config('request.jwt.claims', json_build_object('sub', p_uid, 'role', 'authenticated')::text, true);
$$;

do $$
declare
  v_manager uuid := (select id from auth.users where email = 'manager@test.com');
  v_user1 uuid := (select id from auth.users where email = 'user1@test.com');
  v_user2 uuid := (select id from auth.users where email = 'user2@test.com');
  v_obj1 uuid;
  v_obj2 uuid;
  v_obj3 uuid;
  v_task uuid;
begin
  if v_manager is null or v_user1 is null or v_user2 is null then
    raise notice 'seed skipped: test users not found';
    return;
  end if;
  if exists (select 1 from public.objects) then
    raise notice 'seed skipped: data already exists';
    return;
  end if;

  insert into public.profiles (id, full_name)
  select u.id, split_part(u.email, '@', 1) from auth.users u where u.id in (v_manager, v_user1, v_user2)
  on conflict (id) do nothing;

  update public.profiles set role = 'manager', full_name = 'Анна Постановщик' where id = v_manager;
  update public.profiles set full_name = 'Иван Исполнитель' where id = v_user1;
  update public.profiles set full_name = 'Пётр Исполнитель' where id = v_user2;

  perform pg_temp.act_as(v_manager);

  insert into public.objects (name, address) values ('ЖК «Северный»', 'г. Москва, ул. Ленина, 12') returning id into v_obj1;
  insert into public.objects (name, address) values ('Склад на Промышленной', 'г. Казань, ул. Промышленная, 5') returning id into v_obj2;
  insert into public.objects (name, address) values ('Офисный центр «Атриум»', 'г. Санкт-Петербург, Невский пр., 88') returning id into v_obj3;

  -- new
  insert into public.tasks (title, description, object_id, assignee_id)
  values ('Закупить арматуру', 'Арматура А500С, 12 мм, 4 тонны', v_obj1, v_user1);

  insert into public.tasks (title, description, object_id, assignee_id)
  values ('Согласовать смету по фасаду', '', v_obj3, v_user1);

  -- in_progress
  insert into public.tasks (title, description, object_id, assignee_id)
  values ('Залить фундамент секции Б', 'Бетон В25, контроль температуры', v_obj1, v_user1) returning id into v_task;
  perform pg_temp.act_as(v_user1);
  perform public.change_task_status(v_task, 'in_progress');

  perform pg_temp.act_as(v_manager);
  insert into public.tasks (title, description, object_id, assignee_id)
  values ('Проверить кровлю склада', 'Осмотр после дождей, фото протечек', v_obj2, v_user2) returning id into v_task;
  perform pg_temp.act_as(v_user2);
  perform public.change_task_status(v_task, 'in_progress');

  -- review
  perform pg_temp.act_as(v_manager);
  insert into public.tasks (title, description, object_id, assignee_id)
  values ('Смонтировать опалубку', 'Секция А, 2 этаж', v_obj1, v_user2) returning id into v_task;
  perform pg_temp.act_as(v_user2);
  perform public.change_task_status(v_task, 'in_progress');
  perform public.change_task_status(v_task, 'review');

  -- rework
  perform pg_temp.act_as(v_manager);
  insert into public.tasks (title, description, object_id, assignee_id)
  values ('Уложить электрокабель', 'Трасса от щита до цеха', v_obj2, v_user2) returning id into v_task;
  perform pg_temp.act_as(v_user2);
  perform public.change_task_status(v_task, 'in_progress');
  perform public.change_task_status(v_task, 'review');
  perform pg_temp.act_as(v_manager);
  perform public.change_task_status(v_task, 'rework', 'Не хватает акта скрытых работ, приложите фото трассы');

  -- accepted
  insert into public.tasks (title, description, object_id, assignee_id)
  values ('Вывезти строительный мусор', '', v_obj3, v_user1) returning id into v_task;
  perform pg_temp.act_as(v_user1);
  perform public.change_task_status(v_task, 'in_progress');
  perform public.change_task_status(v_task, 'review');
  perform pg_temp.act_as(v_manager);
  perform public.change_task_status(v_task, 'accepted');

  -- rework -> in_progress
  insert into public.tasks (title, description, object_id, assignee_id)
  values ('Покрасить ограждение', 'Два слоя, цвет RAL 7016', v_obj3, v_user2) returning id into v_task;
  perform pg_temp.act_as(v_user2);
  perform public.change_task_status(v_task, 'in_progress');
  perform public.change_task_status(v_task, 'review');
  perform pg_temp.act_as(v_manager);
  perform public.change_task_status(v_task, 'rework', 'Нужен второй слой');
  perform pg_temp.act_as(v_user2);
  perform public.change_task_status(v_task, 'in_progress');
end;
$$;
