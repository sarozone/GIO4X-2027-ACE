-- 0030_trader_files.sql
--
-- Traders' files: a visitor may send the source of an Expert Advisor, an
-- indicator or a script (MQL4, MQL5, Pine Script or plain text) from the Rule
-- bench page. A file is kept for staff to read. It is never run, never
-- compiled and never shown on the website.
--
--   anon            may insert a file, always as 'received'; may read nothing
--   content.read    staff see every file
--   content.publish staff mark a file read or put it away; only the status changes
--
-- What is kept: a title, what kind of thing it is, the platform it was written
-- for, an optional note, the file's name and its text (up to 200,000
-- characters), optional initials, and that the sender ticked the box saying
-- the file is theirs to share. No e-mail address, no IP address, no
-- identifier. At most 100 files may wait unread at once, so the table cannot
-- be flooded.
--
-- ROLLBACK
--   drop table if exists public.trader_files;
--   drop function if exists public.tg_trader_files_insert();
--   drop function if exists public.tg_trader_files_decide();

create table if not exists public.trader_files (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  kind        text not null,
  platform    text not null,
  note        text not null default '',
  file_name   text not null,
  code        text not null,
  byline      text not null default '',
  rights      boolean not null,
  status      text not null default 'received',
  created_at  timestamptz not null default now(),
  decided_at  timestamptz,
  decided_by  uuid,
  constraint trader_files_title_valid check (char_length(title) between 3 and 80 and title !~ '[\x00-\x1f]' and title !~* '(https?:|www\.|<|>)'),
  constraint trader_files_kind_valid check (kind in ('ea', 'indicator', 'script', 'other')),
  constraint trader_files_platform_valid check (platform in ('mt4', 'mt5', 'pine', 'other')),
  constraint trader_files_note_valid check (char_length(note) <= 1000 and note !~ '[\x00-\x09\x0b-\x1f]'),
  constraint trader_files_name_valid check (file_name ~ '^[A-Za-z0-9][A-Za-z0-9 ._-]{0,79}\.(mq4|mq5|mqh|pine|txt)$'),
  constraint trader_files_code_valid check (char_length(code) between 20 and 200000 and code !~ '[\x00-\x08\x0b\x0c\x0e-\x1f]'),
  constraint trader_files_byline_valid check (char_length(byline) <= 24 and byline !~ '[\x00-\x1f]' and byline !~* '(https?:|www\.|@|<|>)'),
  constraint trader_files_rights_given check (rights),
  constraint trader_files_status_valid check (status in ('received', 'read', 'archived'))
);

create index if not exists trader_files_status_idx on public.trader_files (status, created_at desc);

alter table public.trader_files enable row level security;

revoke all on public.trader_files from anon, authenticated;
grant insert (title, kind, platform, note, file_name, code, byline, rights) on public.trader_files to anon, authenticated;
grant select on public.trader_files to authenticated;
grant update (status) on public.trader_files to authenticated;

drop policy if exists trader_files_public_insert on public.trader_files;
create policy trader_files_public_insert on public.trader_files
  for insert
  to anon, authenticated
  with check (status = 'received' and decided_at is null and decided_by is null and rights);

drop policy if exists trader_files_staff_select on public.trader_files;
create policy trader_files_staff_select on public.trader_files
  for select
  to authenticated
  using ((select public.staff_can('content.read')));

drop policy if exists trader_files_staff_update on public.trader_files;
create policy trader_files_staff_update on public.trader_files
  for update
  to authenticated
  using ((select public.staff_can('content.publish')))
  with check ((select public.staff_can('content.publish')));

-- A new file always starts as received, whatever was sent; and no more than 100 may wait at once.
create or replace function public.tg_trader_files_insert() returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.status := 'received';
  new.decided_at := null;
  new.decided_by := null;
  new.created_at := now();
  if (select count(*) from public.trader_files f where f.status = 'received') >= 100 then
    raise exception 'too many files are waiting to be read' using errcode = '23514';
  end if;
  return new;
end;
$$;
revoke all on function public.tg_trader_files_insert() from public, anon, authenticated;
drop trigger if exists trader_files_insert on public.trader_files;
create trigger trader_files_insert before insert on public.trader_files
  for each row execute function public.tg_trader_files_insert();

-- A decision records who made it and when; what was sent is never changed.
create or replace function public.tg_trader_files_decide() returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.title is distinct from old.title or new.kind is distinct from old.kind or new.platform is distinct from old.platform
     or new.note is distinct from old.note or new.file_name is distinct from old.file_name or new.code is distinct from old.code
     or new.byline is distinct from old.byline or new.rights is distinct from old.rights then
    raise exception 'a file that was sent cannot be changed' using errcode = '23514';
  end if;
  if new.status is distinct from old.status then
    new.decided_at := now();
    new.decided_by := (select auth.uid());
  end if;
  return new;
end;
$$;
revoke all on function public.tg_trader_files_decide() from public, anon, authenticated;
drop trigger if exists trader_files_decide on public.trader_files;
create trigger trader_files_decide before update on public.trader_files
  for each row execute function public.tg_trader_files_decide();

-- Self-test: what the anonymous role may and may not do. Everything it writes is rolled back.
do $selftest$
declare
  v_id uuid;
  v_n integer;
begin
  begin
    set local role anon;
    insert into public.trader_files (title, kind, platform, file_name, code, byline, rights)
      values ('Selftest average cross', 'ea', 'mt5', 'selftest.mq5', '// selftest: nothing here is ever run', 'T.T.', true);
    -- the public cannot read a file back, its own included
    begin
      select count(*) into v_n from public.trader_files;
      if v_n <> 0 then raise exception 'SELFTEST: a file is visible to anon'; end if;
    exception when insufficient_privilege then null;
    end;
    begin
      insert into public.trader_files (title, kind, platform, file_name, code, rights)
        values ('Selftest without consent', 'ea', 'mt5', 'selftest.mq5', '// selftest: nothing here is ever run', false);
      raise exception 'SELFTEST: a file without the rights box was accepted';
    exception when check_violation or insufficient_privilege then null;
    end;
    begin
      insert into public.trader_files (title, kind, platform, file_name, code, rights)
        values ('Selftest bad name', 'ea', 'mt5', 'selftest.exe', '// selftest: nothing here is ever run', true);
      raise exception 'SELFTEST: a file name that is not source was accepted';
    exception when check_violation then null;
    end;
    reset role;
    select id into v_id from public.trader_files where byline = 'T.T.' and file_name = 'selftest.mq5' limit 1;
    if v_id is null then raise exception 'SELFTEST: the file was not stored'; end if;
    if (select status from public.trader_files where id = v_id) <> 'received' then raise exception 'SELFTEST: not received'; end if;
    raise exception 'SELFTEST_DONE';
  exception when others then
    reset role;
    if sqlerrm <> 'SELFTEST_DONE' then raise; end if;
  end;
end;
$selftest$;
