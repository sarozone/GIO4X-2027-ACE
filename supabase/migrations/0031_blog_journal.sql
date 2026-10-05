-- =============================================================================
-- GIO4X · 0031_blog_journal · format, lead and pinned posts, a reviewer, old addresses
-- =============================================================================
-- Four columns on `blog_posts` (0011) and one new table. Nothing that exists is
-- changed: no column is altered or dropped, the triggers and policies of 0011
-- and 0020 are left exactly as they are, and no capability is added.
--
-- blog_posts.format        what kind of piece the post is (a note, an explainer,
--                          a guide, a how-to, analysis, news), beside its
--                          category. Every post that exists today becomes a
--                          'note', which is what the daily blog has published.
-- blog_posts.is_lead       the one post that leads the public index. At most one
--                          row can hold it (a unique index); giving it to a post
--                          takes it from the post that had it, in the same
--                          statement.
-- blog_posts.is_pinned     pinned posts come before the others on the index.
-- blog_posts.reviewed_by   who read the post before it was published, as a
--                          reader is told ("Reviewed by ..."). Free text, like
--                          the byline; empty when nobody is named.
--
-- blog_slug_redirects      one row per address a PUBLISHED post has left: the
--                          old slug, and the post it belonged to. The public
--                          post page answers an old address with a permanent
--                          redirect to the post's current one. Written only by
--                          the trigger `blog_posts_keep_slug`; the trigger can
--                          never fail a save (as `blog_posts_keep_revision`).
--
-- Who may do what:
--   blog.publish   make a post the lead, pin it, or undo either (placing a post
--                  on the public index is a publishing decision). Enforced by
--                  the trigger `blog_posts_placement`, whatever the caller sent.
--   blog.write     set the format and the reviewer of a post they may edit
--                  (the rules of 0011 for published posts apply unchanged)
--   blog.read      read every old address, in the console
--   anon           read the four new columns of a public post, and an old
--                  address only while the post it points to is public
--   nobody         insert, change or delete an old address through the API
--
-- What happens to the rows that exist: each gets format 'note', is_lead false,
-- is_pinned false and reviewed_by ''. Adding a column with a constant default
-- rewrites nothing and fires no trigger, so no post's `updated_at` moves, no
-- revision is written and no audit entry is made by this file.
--
-- One side effect to know of: when a new lead is chosen, the previous lead's
-- row is updated (is_lead false) by the trigger. That update goes through the
-- triggers of 0011 like any other, so the previous lead's `updated_at` moves
-- and, if it is published, the audit log records 'blog.edit_published' for it
-- under the name of the person who chose the new lead.
--
-- Re-runnable and additive.
--
-- ROLLBACK
--   drop trigger if exists blog_posts_keep_slug on public.blog_posts;
--   drop trigger if exists blog_posts_placement on public.blog_posts;
--   drop function if exists public.blog_posts_keep_slug();
--   drop function if exists public.blog_posts_placement();
--   drop table if exists public.blog_slug_redirects;
--   drop index if exists public.blog_posts_one_lead;
--   drop index if exists public.blog_posts_front_idx;
--   alter table public.blog_posts drop column if exists format, drop column if exists is_lead,
--     drop column if exists is_pinned, drop column if exists reviewed_by;
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

-- ---- the four columns -------------------------------------------------------
alter table public.blog_posts add column if not exists format text not null default 'note';
alter table public.blog_posts add column if not exists is_lead boolean not null default false;
alter table public.blog_posts add column if not exists is_pinned boolean not null default false;
alter table public.blog_posts add column if not exists reviewed_by text not null default '';

-- Must equal BLOG_FORMATS in src/lib/blog.ts.
alter table public.blog_posts drop constraint if exists blog_posts_format_valid;
alter table public.blog_posts add constraint blog_posts_format_valid
  check (format in ('note', 'explainer', 'guide', 'how-to', 'analysis', 'news'));

alter table public.blog_posts drop constraint if exists blog_posts_reviewed_by_valid;
alter table public.blog_posts add constraint blog_posts_reviewed_by_valid
  check (char_length(reviewed_by) <= 80 and reviewed_by !~ '[\x00-\x1f]');

comment on column public.blog_posts.format is 'What kind of piece the post is. Beside the category, which says what it is about.';
comment on column public.blog_posts.is_lead is 'The one post that leads the public index. At most one row; set and cleared by blog.publish.';
comment on column public.blog_posts.is_pinned is 'Pinned posts come before the others on the public index. Set by blog.publish.';
comment on column public.blog_posts.reviewed_by is 'Who reviewed the post, as shown to a reader. Empty when nobody is named.';

-- at most one lead, whatever any caller does
create unique index if not exists blog_posts_one_lead on public.blog_posts ((true)) where is_lead;
-- the public index reads: the lead, then the pinned, then the newest
create index if not exists blog_posts_front_idx on public.blog_posts (is_lead desc, is_pinned desc, published_at desc) where status = 'published';

-- A visitor reads them on the page; staff write them with the rest of the post.
grant select (format, is_lead, is_pinned, reviewed_by) on public.blog_posts to anon;
grant insert (format, is_lead, is_pinned, reviewed_by) on public.blog_posts to authenticated;
grant update (format, is_lead, is_pinned, reviewed_by) on public.blog_posts to authenticated;

-- ---- lead and pinned: blog.publish, and one lead at a time ------------------
-- A trigger of its own, so that `blog_posts_before_write` (0011) is not touched.
-- BEFORE triggers on a table run in the order of their names: this one runs
-- after `blog_posts_before_write`, which has already had its say.
create or replace function public.blog_posts_placement()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  api boolean := coalesce((select auth.role()), '') in ('anon', 'authenticated');
  placed boolean;
begin
  if tg_op = 'INSERT' then
    placed := new.is_lead or new.is_pinned;
  else
    placed := new.is_lead is distinct from old.is_lead or new.is_pinned is distinct from old.is_pinned;
  end if;
  if not placed then
    return new; -- nothing about the post's place on the index is changing
  end if;

  if api and not (select public.staff_can('blog.publish')) then
    raise exception 'placing a post on the index needs blog.publish' using errcode = '42501';
  end if;

  if new.is_lead and (tg_op = 'INSERT' or not old.is_lead) then
    -- two people choosing a lead at the same moment take turns, so that neither meets the unique index
    perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext('public.blog_posts.is_lead'));
    -- the post that led until now steps down, in this same statement
    update public.blog_posts p set is_lead = false where p.is_lead and p.id is distinct from new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists blog_posts_placement on public.blog_posts;
create trigger blog_posts_placement
  before insert or update on public.blog_posts
  for each row execute function public.blog_posts_placement();

revoke all on function public.blog_posts_placement() from public, anon, authenticated;

-- ---- old addresses ----------------------------------------------------------
create table if not exists public.blog_slug_redirects (
  -- the address the post used to have; an address leads to one post only
  old_slug   text primary key,
  post_id    uuid not null references public.blog_posts (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint blog_slug_redirects_slug_valid check (old_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(old_slug) between 3 and 96)
);
comment on table public.blog_slug_redirects is 'Addresses that published blog posts have left. Written only by a trigger on blog_posts; the public post page redirects an old address to the post''s current one.';

create index if not exists blog_slug_redirects_post_idx on public.blog_slug_redirects (post_id);

alter table public.blog_slug_redirects enable row level security;
alter table public.blog_slug_redirects force row level security;
revoke all on table public.blog_slug_redirects from public, anon, authenticated;

-- Read only. No insert, update or delete for any API role.
grant select (old_slug, post_id) on public.blog_slug_redirects to anon;
grant select on public.blog_slug_redirects to authenticated;

-- A visitor learns of an old address only while the post it leads to is public:
-- the same condition as `blog_posts_public_select` (0011), so an old address
-- says nothing about a draft, a scheduled post or an archived one.
-- (A visitor's policy must not call a staff function: the anonymous role may not execute it.)
drop policy if exists blog_slug_redirects_public_select on public.blog_slug_redirects;
create policy blog_slug_redirects_public_select on public.blog_slug_redirects
  for select
  to anon
  using (exists (
    select 1 from public.blog_posts p
    where p.id = blog_slug_redirects.post_id and p.status = 'published' and p.published_at <= now()
  ));

drop policy if exists blog_slug_redirects_signed_in_select on public.blog_slug_redirects;
create policy blog_slug_redirects_signed_in_select on public.blog_slug_redirects
  for select
  to authenticated
  using (
    exists (
      select 1 from public.blog_posts p
      where p.id = blog_slug_redirects.post_id and p.status = 'published' and p.published_at <= now()
    )
    or (select public.staff_can('blog.read'))
  );

-- Records the address a published post has just left. AFTER the row is written,
-- so it sees what was actually stored. It returns null and never raises: a post
-- is saved whether or not its old address could be kept.
create or replace function public.blog_posts_keep_slug()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  begin
    -- the post is back at an address it once left: that address is its page again, not a redirect
    delete from public.blog_slug_redirects r where r.old_slug = new.slug and r.post_id = new.id;

    -- only an address the public could have been given is worth keeping: a draft's address was never linked to
    if old.status = 'published' then
      insert into public.blog_slug_redirects (old_slug, post_id)
      values (old.slug, new.id)
      on conflict (old_slug) do update set post_id = excluded.post_id, created_at = now();
    end if;
  exception when others then
    raise warning 'blog_posts_keep_slug: an old address was not recorded (SQLSTATE %)', sqlstate;
  end;
  return null;
end;
$$;

drop trigger if exists blog_posts_keep_slug on public.blog_posts;
create trigger blog_posts_keep_slug
  after update on public.blog_posts
  for each row
  when (old.slug is distinct from new.slug)
  execute function public.blog_posts_keep_slug();

revoke all on function public.blog_posts_keep_slug() from public, anon, authenticated;
