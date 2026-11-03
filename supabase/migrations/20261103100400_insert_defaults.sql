alter table public.objects alter column created_by set default auth.uid();
alter table public.tasks alter column author_id set default auth.uid();
