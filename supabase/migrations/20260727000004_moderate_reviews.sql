-- ============================================================================
-- ReCoffee — review moderation and length limits.
--
-- `"Anyone can create a review" ... with check (true)` plus a public SELECT
-- policy meant anyone could POST unlimited reviews for any product under any
-- name, and have them appear instantly on the storefront. Ratings feed the
-- product-page average, so that is direct rating manipulation. Neither
-- `author_name` nor `comment` had a length cap, so one insert could carry
-- megabytes.
--
-- Three changes, and the third is the one that makes the other two mean
-- anything:
--
--   1. length constraints on author_name and comment;
--   2. `approved`, defaulting to false, with the public SELECT policy gated on
--      it and admins able to see and update everything;
--   3. the INSERT policy narrowed to `with check (approved = false)`.
--
-- Without (3), gating SELECT on `approved` would be theatre: the insert policy
-- was unconditional, so a client could simply POST `{"approved": true}` and
-- publish straight past the queue. This is a pure SPA — the anon key is in the
-- bundle and every column is writable over PostgREST unless a policy says
-- otherwise.
--
-- Existing rows are approved on the way in, so live reviews do not vanish. That
-- backfill is inside the "column did not exist" branch so re-running this file
-- can never bulk-approve a pending queue.
--
-- Idempotent, like every file in this directory: re-running it is safe.
-- ============================================================================

do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'reviews' and column_name = 'approved'
  ) then
    alter table reviews add column approved boolean not null default false;
    -- Only reached the first time. Reviews that predate moderation were already
    -- public, so hiding them retroactively would be a visible regression.
    update reviews set approved = true;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'reviews_author_name_length' and conrelid = 'reviews'::regclass
  ) then
    alter table reviews add constraint reviews_author_name_length
      check (length(author_name) between 1 and 80);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'reviews_comment_length' and conrelid = 'reviews'::regclass
  ) then
    alter table reviews add constraint reviews_comment_length
      check (comment is null or length(comment) <= 2000);
  end if;
end
$$;

create index if not exists reviews_approved_idx on reviews(product_id, approved);

-- ── policies ────────────────────────────────────────────────────────────────

drop policy if exists "Reviews are viewable by everyone"          on reviews;
drop policy if exists "Approved reviews are viewable by everyone" on reviews;
drop policy if exists "Admins can view all reviews"               on reviews;
drop policy if exists "Anyone can create a review"                on reviews;
drop policy if exists "Anyone can submit a review for approval"   on reviews;
drop policy if exists "Admins can update reviews"                 on reviews;
drop policy if exists "Admins can delete reviews"                 on reviews;

create policy "Approved reviews are viewable by everyone"
  on reviews for select using (approved);

-- Permissive policies OR together, so this widens admin visibility to the whole
-- queue without widening anyone else's.
create policy "Admins can view all reviews"
  on reviews for select using (is_admin());

-- The `approved = false` check is the point: submission stays open to the
-- public, publication does not.
create policy "Anyone can submit a review for approval"
  on reviews for insert to anon, authenticated with check (approved = false);

create policy "Admins can update reviews"
  on reviews for update using (is_admin()) with check (is_admin());

create policy "Admins can delete reviews"
  on reviews for delete using (is_admin());
