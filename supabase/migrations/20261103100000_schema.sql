-- Схема данных: профили, объекты, задачи, история статусов.

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create type public.user_role as enum ('manager', 'executor');
create type public.task_status as enum ('new', 'in_progress', 'review', 'rework', 'accepted');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  role public.user_role not null default 'executor',
  created_at timestamptz not null default now()
);

create table public.objects (
  id uuid primary key default gen_random_uuid(),
  name text not null check (btrim(name) <> ''),
  address text not null check (btrim(address) <> ''),
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now()
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null check (btrim(title) <> ''),
  description text not null default '',
  object_id uuid not null references public.objects (id) on delete cascade,
  assignee_id uuid not null references public.profiles (id),
  status public.task_status not null default 'new',
  author_id uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.task_status_history (
  id bigint generated always as identity primary key,
  task_id uuid not null references public.tasks (id) on delete cascade,
  from_status public.task_status,
  to_status public.task_status not null,
  changed_by uuid not null references public.profiles (id),
  comment text,
  created_at timestamptz not null default now()
);

create index tasks_assignee_id_idx on public.tasks (assignee_id);
create index tasks_object_id_idx on public.tasks (object_id);
create index task_status_history_task_id_idx on public.task_status_history (task_id, created_at);

-- Допустимые переходы: единственный источник правды для проверки на стороне БД.
create table private.task_transitions (
  from_status public.task_status not null,
  to_status public.task_status not null,
  actor text not null check (actor in ('assignee', 'manager')),
  requires_comment boolean not null default false,
  primary key (from_status, to_status)
);

insert into private.task_transitions (from_status, to_status, actor, requires_comment) values
  ('new', 'in_progress', 'assignee', false),
  ('in_progress', 'review', 'assignee', false),
  ('review', 'accepted', 'manager', false),
  ('review', 'rework', 'manager', true),
  ('rework', 'in_progress', 'assignee', false);
