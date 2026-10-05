-- =============================================================================
-- GIO4X · 0032_page_feedback · "Was this page helpful?"
-- =============================================================================
-- Apply after 0004 (it uses staff_can and role_capabilities). Re-runnable and
-- purely additive: one new table, three functions, one capability. Nothing that
-- exists is altered.
--
-- A content page of the website (a lesson, a primer, a glossary entry, a tool,
-- the FAQ, a blog post, an instrument page, a legal page) ends with a small
-- question: "Was this page helpful?" Yes or No, and an optional comment.
--
-- What is kept, in full:
--
--   page_feedback (id, created_at, path, helpful, comment)
--
--   path      the page the answer is about: a same-site path, lower-case path
--             characters only, so no query string, no fragment and no e-mail
--             address can be stored in it ('?', '=', '&', '@', '%' are refused)
--   helpful   yes or no
--   comment   what the visitor chose to add, up to 500 characters; '' when
--             nothing was added
--   created_at  stamped by the database, whatever was sent
--
-- Nothing about the visitor: no IP address, no user agent, no identifier, no
-- cookie value, no session value. Two answers from the same person cannot be
-- told from two answers from two people. (A visitor may type something
-- personal into the comment; the form asks them not to.)
--
-- Who may do what:
--   anon, authenticated   INSERT one row, supplying path, helpful and comment
--                         only. They can read nothing, their own row included.
--   feedback.read         staff read the rows (comments), page_feedback_tallies()
--                         and may record an export (admin, compliance, agent,
--                         sales, support: the roles that hold content.read, 0016).
--   nobody                updates or deletes a row through the API. There is no
--                         UPDATE or DELETE privilege and no such policy.
--
-- Limits, stated plainly:
--   · Anyone holding the publishable key can insert rows directly, skipping the
--     API's per-address limit and its check that the path is one of the site's
--     published pages. The tallies are for orientation, not audited figures.
--   · A global throttle of 60 rows a minute (SQLSTATE PT429, as 0003). Past it,
--     an answer is refused until the minute ends; the website's control then
--     simply puts itself away.
--   · There is no retention rule: rows are kept until removed in SQL.
--
-- ROLLBACK
--   drop function if exists public.record_page_feedback_export(integer);
--   drop function if exists public.page_feedback_tallies();
--   drop table if exists public.page_feedback;
--   drop function if exists public.page_feedback_before_insert();
--   delete from public.role_capabilities where capability = 'feedback.read';
-- =============================================================================

do $guard$
begin
  if not exists (
    select 1 from pg_catalog.pg_roles r
    where r.rolname = current_user and (r.rolbypassrls or r.rolsuper)
  ) then
    raise exception
      'GIO4X migrations must be applied by a role with BYPASSRLS (on Supabase: postgres). Current role: %', current_user;
  end if;
end
$guard$;

-- The roles that read the website's content in the console (content.read, 0016) read what readers say about it.
insert into public.role_capabilities (role, capability) values
  ('admin', 'feedback.read'), ('compliance', 'feedback.read'), ('agent', 'feedback.read'),
  ('sales', 'feedback.read'), ('support', 'feedback.read')
on conflict do nothing;

-- ---- the table --------------------------------------------------------------
-- (An identity column, as audit_log: no separately-grantable sequence and no
-- way to supply an id by hand.)
create table if not exists public.page_feedback (
  id         bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  path       text not null,
  helpful    boolean not null,
  comment    text not null default '',
  -- a same-site path of lower-case path characters: no '?', '=', '&', '@', '%', no spaces
  constraint page_feedback_path_valid check (
    char_length(path) between 2 and 200
    and path ~ '^/[a-z0-9/_.-]*$'
    and path !~ '//'
    and path !~ '\.\.'
  ),
  -- tab and line feed allowed, no other control character; never markup
  constraint page_feedback_comment_valid check (
    char_length(comment) <= 500
    and comment !~ '[\x01-\x08\x0b-\x1f\x7f]'
    and comment !~ '[<>]'
  )
);
comment on table public.page_feedback is 'Answers to "Was this page helpful?". A path, yes or no, an optional comment and a time. Nothing about the visitor. Insert-only for the public; read by staff holding feedback.read.';
comment on column public.page_feedback.path is 'The page the answer is about. Lower-case path characters only: no query string, no fragment.';
comment on column public.page_feedback.comment is 'What the visitor chose to add, at most 500 characters. Empty when nothing was added.';

alter table public.page_feedback enable row level security;
alter table public.page_feedback force row level security;

create index if not exists page_feedback_created_at_idx on public.page_feedback (created_at desc);
create index if not exists page_feedback_path_idx on public.page_feedback (path, created_at desc);

-- ---- grants and policies ----------------------------------------------------
revoke all on table public.page_feedback from public, anon, authenticated;
-- the three visitor columns and nothing else: `id` and `created_at` cannot be supplied
grant insert (path, helpful, comment) on public.page_feedback to anon, authenticated;
grant select on public.page_feedback to authenticated;

-- The shape of a row is held by the CHECK constraints and the column grant; the
-- policy restates the two bounds that matter most, so it is never "always true".
drop policy if exists page_feedback_public_insert on public.page_feedback;
create policy page_feedback_public_insert on public.page_feedback
  for insert
  to anon, authenticated
  with check (path ~ '^/[a-z0-9/_.-]*$' and char_length(comment) <= 500);

drop policy if exists page_feedback_staff_select on public.page_feedback;
create policy page_feedback_staff_select on public.page_feedback
  for select
  to authenticated
  using ((select public.staff_can('feedback.read')));

-- No UPDATE and no DELETE policy, and no such privilege: an answer is never
-- changed or removed through the API, by anyone.

-- ---- the time is the database's; and the table cannot be flooded ------------
create or replace function public.page_feedback_before_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  recent_all integer;
begin
  new.created_at := now();

  -- as 0003: statements run in SQL by the owner carry no API role and are not throttled
  if coalesce((select auth.role()), '') not in ('anon', 'authenticated') then
    return new;
  end if;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext('gio4x.throttle.page_feedback'));

  select count(*) into recent_all
  from public.page_feedback f
  where f.created_at > now() - interval '1 minute';
  if recent_all >= 60 then
    raise exception 'Too many requests' using errcode = 'PT429';
  end if;

  return new;
end;
$$;
revoke all on function public.page_feedback_before_insert() from public, anon, authenticated;

drop trigger if exists page_feedback_before_insert on public.page_feedback;
create trigger page_feedback_before_insert
  before insert on public.page_feedback
  for each row execute function public.page_feedback_before_insert();

-- ---- what staff read ---------------------------------------------------------
-- One row per page: answers of each kind, over all time and over the last 30
-- days, and when the newest arrived. The 2000 pages with the most answers.
create or replace function public.page_feedback_tallies()
returns table (
  path text, yes_all bigint, no_all bigint, yes_30 bigint, no_30 bigint, last_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not (select public.staff_can('feedback.read')) then
    raise exception 'not authorised' using errcode = '42501';
  end if;
  return query
    select
      f.path,
      count(*) filter (where f.helpful),
      count(*) filter (where not f.helpful),
      count(*) filter (where f.helpful and f.created_at > now() - interval '30 days'),
      count(*) filter (where not f.helpful and f.created_at > now() - interval '30 days'),
      max(f.created_at)
    from public.page_feedback f
    group by f.path
    order by count(*) desc, f.path
    limit 2000;
end;
$$;
comment on function public.page_feedback_tallies() is 'Per page: helpful and not, all time and last 30 days. feedback.read only.';

-- The audit entry for an export of the answers. The console calls it BEFORE it
-- sends the file (as record_report_download, 0015).
create or replace function public.record_page_feedback_export(p_rows integer)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
begin
  if not (select public.staff_can('feedback.read')) then
    raise exception 'not authorised' using errcode = '42501';
  end if;
  if p_rows is null or p_rows < 0 or p_rows > 100000 then
    raise exception 'invalid row count' using errcode = '22023';
  end if;
  insert into public.audit_log (actor, action, entity, entity_id, detail)
  values ((select auth.uid()), 'feedback.export', 'page_feedback', null, jsonb_build_object('format', 'csv', 'rows', p_rows));
end;
$$;

revoke all on function public.page_feedback_tallies() from public, anon;
revoke all on function public.record_page_feedback_export(integer) from public, anon;
grant execute on function public.page_feedback_tallies() to authenticated;
grant execute on function public.record_page_feedback_export(integer) to authenticated;

-- Self-test: what the anonymous role may and may not do. Everything it writes is rolled back.
do $selftest$
declare
  v_n integer;
begin
  begin
    set local role anon;
    insert into public.page_feedback (path, helpful, comment) values ('/selftest/page-feedback', true, 'selftest');
    insert into public.page_feedback (path, helpful) values ('/selftest/page-feedback', false);
    -- the public cannot read an answer back, its own included
    begin
      select count(*) into v_n from public.page_feedback;
      if v_n <> 0 then raise exception 'SELFTEST: an answer is visible to anon'; end if;
    exception when insufficient_privilege then null;
    end;
    begin
      insert into public.page_feedback (path, helpful) values ('/selftest?email=a@example.com', true);
      raise exception 'SELFTEST: a path with a query string was accepted';
    -- refused by the policy (42501) or by the constraint (23514), whichever the database evaluates first
    exception when check_violation or insufficient_privilege then null;
    end;
    begin
      insert into public.page_feedback (path, helpful, comment) values ('/selftest/page-feedback', true, repeat('x', 501));
      raise exception 'SELFTEST: a comment of 501 characters was accepted';
    -- refused by the policy (42501) or by the constraint (23514), whichever the database evaluates first
    exception when check_violation or insufficient_privilege then null;
    end;
    begin
      insert into public.page_feedback (path, helpful, created_at) values ('/selftest/page-feedback', true, now() - interval '1 year');
      raise exception 'SELFTEST: anon supplied created_at';
    exception when insufficient_privilege then null;
    end;
    begin
      update public.page_feedback set helpful = false where path = '/selftest/page-feedback';
      raise exception 'SELFTEST: anon may update';
    exception when insufficient_privilege then null;
    end;
    begin
      delete from public.page_feedback where path = '/selftest/page-feedback';
      raise exception 'SELFTEST: anon may delete';
    exception when insufficient_privilege then null;
    end;
    begin
      perform public.page_feedback_tallies();
      raise exception 'SELFTEST: anon may read the tallies';
    exception when insufficient_privilege then null;
    end;
    reset role;
    select count(*) into v_n from public.page_feedback where path = '/selftest/page-feedback';
    if v_n <> 2 then raise exception 'SELFTEST: the answers were not stored (found %)', v_n; end if;
    raise exception 'SELFTEST_DONE';
  exception when others then
    reset role;
    if sqlerrm <> 'SELFTEST_DONE' then raise; end if;
  end;
end;
$selftest$;
