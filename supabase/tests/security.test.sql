begin;
select no_plan();

-- тесты не зависят от демо-данных: всё откатывается в конце
delete from public.tasks;
delete from public.objects;

create function pg_temp.set_uid(p_uid uuid) returns void language sql as $$
  select set_config('request.jwt.claims', json_build_object('sub', p_uid, 'role', 'authenticated')::text, true);
$$;

create function pg_temp.act_as(p_uid uuid) returns void language plpgsql as $$
begin
  perform pg_temp.set_uid(p_uid);
  set local role authenticated;
end;
$$;

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-00000000a001', 'manager@t.test'),
  ('00000000-0000-0000-0000-00000000b001', 'exec1@t.test'),
  ('00000000-0000-0000-0000-00000000b002', 'exec2@t.test');

update public.profiles set role = 'manager' where id = '00000000-0000-0000-0000-00000000a001';

select pg_temp.set_uid('00000000-0000-0000-0000-00000000a001');
insert into public.objects (id, name, address) values
  ('00000000-0000-0000-0000-00000000c001', 'Объект 1', 'Адрес 1'),
  ('00000000-0000-0000-0000-00000000c002', 'Объект 2', 'Адрес 2');
insert into public.tasks (id, title, object_id, assignee_id) values
  ('00000000-0000-0000-0000-00000000d001', 'Задача A', '00000000-0000-0000-0000-00000000c001', '00000000-0000-0000-0000-00000000b001'),
  ('00000000-0000-0000-0000-00000000d002', 'Задача B', '00000000-0000-0000-0000-00000000c001', '00000000-0000-0000-0000-00000000b002'),
  ('00000000-0000-0000-0000-00000000d003', 'Задача C', '00000000-0000-0000-0000-00000000c002', '00000000-0000-0000-0000-00000000b002');

select ok(
  (select bool_and(relrowsecurity) from pg_class
   where oid in ('public.profiles'::regclass, 'public.objects'::regclass, 'public.tasks'::regclass, 'public.task_status_history'::regclass)),
  'RLS включён на всех таблицах'
);

-- анонимный пользователь
set local role anon;
select throws_ok('select * from public.tasks', '42501', null, 'anon не читает задачи');
select throws_ok('select public.change_task_status(''00000000-0000-0000-0000-00000000d001'', ''in_progress'')', '42501', null, 'anon не вызывает RPC');
reset role;

-- исполнитель 1
select pg_temp.act_as('00000000-0000-0000-0000-00000000b001');

select is((select count(*) from public.tasks), 1::bigint, 'исполнитель видит только свои задачи');
select is((select count(*) from public.objects), 1::bigint, 'исполнитель видит только объекты со своими задачами');
select is((select count(*) from public.task_status_history), 1::bigint, 'исполнитель видит историю только своих задач');
select is_empty($$select 1 from public.tasks where id = '00000000-0000-0000-0000-00000000d002'$$, 'чужая задача не читается');
select is_empty($$select 1 from public.objects where id = '00000000-0000-0000-0000-00000000c002'$$, 'чужой объект не читается');

select throws_ok($$update public.tasks set status = 'accepted' where id = '00000000-0000-0000-0000-00000000d001'$$, '42501', null, 'прямой update статуса запрещён');
select lives_ok($$update public.tasks set title = 'x' where id = '00000000-0000-0000-0000-00000000d001'$$, 'update исполнителя не падает, но ничего не меняет');
select throws_ok($$insert into public.tasks (title, object_id, assignee_id) values ('x', '00000000-0000-0000-0000-00000000c001', '00000000-0000-0000-0000-00000000b001')$$, '42501', null, 'исполнитель не создаёт задачи');
select throws_ok($$insert into public.objects (name, address) values ('x', 'y')$$, '42501', null, 'исполнитель не создаёт объекты');
select lives_ok($$delete from public.tasks where id = '00000000-0000-0000-0000-00000000d001'$$, 'delete исполнителя не падает, но ничего не удаляет');
select throws_ok($$insert into public.task_status_history (task_id, to_status, changed_by) values ('00000000-0000-0000-0000-00000000d001', 'accepted', '00000000-0000-0000-0000-00000000b001')$$, '42501', null, 'запись в историю запрещена');
select throws_ok($$update public.task_status_history set comment = 'x'$$, '42501', null, 'изменение истории запрещено');
select throws_ok($$delete from public.task_status_history$$, '42501', null, 'удаление истории запрещено');

select throws_ok($$select public.change_task_status('00000000-0000-0000-0000-00000000d002', 'in_progress')$$, 'P0002', 'task_not_found', 'чужую задачу RPC не раскрывает');
select throws_ok($$select public.change_task_status('00000000-0000-0000-0000-00000000d001', 'review')$$, '23514', 'transition_not_allowed', 'new -> review запрещён');
select throws_ok($$select public.change_task_status('00000000-0000-0000-0000-00000000d001', 'accepted')$$, '23514', 'transition_not_allowed', 'new -> accepted запрещён');
select lives_ok($$select public.change_task_status('00000000-0000-0000-0000-00000000d001', 'in_progress')$$, 'new -> in_progress разрешён исполнителю');
select is((select status from public.tasks where id = '00000000-0000-0000-0000-00000000d001'), 'in_progress'::public.task_status, 'статус изменился');
select is((select count(*) from public.task_status_history), 2::bigint, 'в историю добавилась запись');
select lives_ok($$select public.change_task_status('00000000-0000-0000-0000-00000000d001', 'review')$$, 'in_progress -> review разрешён исполнителю');
select throws_ok($$select public.change_task_status('00000000-0000-0000-0000-00000000d001', 'accepted')$$, '42501', 'forbidden', 'исполнитель не принимает задачу');
select throws_ok($$select public.change_task_status('00000000-0000-0000-0000-00000000d001', 'rework', 'x')$$, '42501', 'forbidden', 'исполнитель не возвращает на доработку');
reset role;

select is((select count(*) from public.tasks), 3::bigint, 'после попытки удаления все задачи на месте');
select is((select title from public.tasks where id = '00000000-0000-0000-0000-00000000d001'), 'Задача A', 'название не изменилось');

-- исполнитель 2 не может двигать задачу исполнителя 1
select pg_temp.act_as('00000000-0000-0000-0000-00000000b002');
select throws_ok($$select public.change_task_status('00000000-0000-0000-0000-00000000d001', 'accepted')$$, 'P0002', 'task_not_found', 'другой исполнитель не видит задачу в RPC');
reset role;

-- постановщик
select pg_temp.act_as('00000000-0000-0000-0000-00000000a001');
select is((select count(*) from public.tasks), 3::bigint, 'постановщик видит все задачи');
select is((select count(*) from public.objects), 2::bigint, 'постановщик видит все объекты');

select throws_ok($$update public.tasks set status = 'accepted' where id = '00000000-0000-0000-0000-00000000d002'$$, '42501', null, 'постановщик не меняет статус напрямую');
select throws_ok($$insert into public.tasks (title, object_id, assignee_id, status) values ('x', '00000000-0000-0000-0000-00000000c001', '00000000-0000-0000-0000-00000000b001', 'accepted')$$, '42501', null, 'нельзя создать задачу сразу с чужим статусом');
select throws_ok($$insert into public.tasks (title, object_id, assignee_id) values ('x', '00000000-0000-0000-0000-00000000c001', '00000000-0000-0000-0000-00000000a001')$$, '23514', 'assignee_must_be_executor', 'исполнителем может быть только executor');
select throws_ok($$insert into public.task_status_history (task_id, to_status, changed_by) values ('00000000-0000-0000-0000-00000000d001', 'accepted', '00000000-0000-0000-0000-00000000a001')$$, '42501', null, 'постановщик не пишет в историю напрямую');

select throws_ok($$select public.change_task_status('00000000-0000-0000-0000-00000000d001', 'rework')$$, '23514', 'comment_required', 'доработка без комментария запрещена');
select throws_ok($$select public.change_task_status('00000000-0000-0000-0000-00000000d001', 'rework', '   ')$$, '23514', 'comment_required', 'пробелы вместо комментария не проходят');
select throws_ok($$select public.change_task_status('00000000-0000-0000-0000-00000000d002', 'in_progress')$$, '42501', 'forbidden', 'постановщик не берёт задачу в работу');
select lives_ok($$select public.change_task_status('00000000-0000-0000-0000-00000000d001', 'rework', 'Исправить замечания')$$, 'review -> rework с комментарием разрешён');
select is((select comment from public.task_status_history where task_id = '00000000-0000-0000-0000-00000000d001' order by id desc limit 1), 'Исправить замечания', 'комментарий сохранён в истории');
select throws_ok($$select public.change_task_status('00000000-0000-0000-0000-00000000d001', 'accepted')$$, '23514', 'transition_not_allowed', 'rework -> accepted запрещён');

select lives_ok($$insert into public.tasks (title, object_id, assignee_id) values ('Новая', '00000000-0000-0000-0000-00000000c002', '00000000-0000-0000-0000-00000000b001')$$, 'постановщик создаёт задачу');
select is((select author_id from public.tasks where title = 'Новая'), '00000000-0000-0000-0000-00000000a001'::uuid, 'автор проставлен базой');
select is((select status from public.tasks where title = 'Новая'), 'new'::public.task_status, 'стартовый статус - new');
select is((select count(*) from public.task_status_history h join public.tasks t on t.id = h.task_id where t.title = 'Новая' and h.from_status is null and h.to_status = 'new'), 1::bigint, 'первая запись истории создана триггером');

select lives_ok($$delete from public.tasks where title = 'Новая'$$, 'постановщик удаляет задачу');
select is((select count(*) from public.tasks where title = 'Новая'), 0::bigint, 'задача удалена');
select is((select count(*) from public.task_status_history), 6::bigint, 'история удалённой задачи ушла вместе с ней, остальная осталась');
reset role;

select * from finish();
rollback;
