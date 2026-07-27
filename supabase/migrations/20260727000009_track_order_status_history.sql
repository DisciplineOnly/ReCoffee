-- ============================================================================
-- ReCoffee — orders.updated_at becomes trustworthy, and status changes get an
-- audit trail.
--
-- `orders.updated_at` had a default and no trigger. The only writer was
-- src/pages/admin/Orders.jsx, which set it by hand and only on a status change,
-- so every other write path left it stale — a column that is right sometimes is
-- worse than one that is obviously absent, because it gets believed. A BEFORE
-- UPDATE trigger makes it true for every write, from any client, including a
-- direct PostgREST call or a future migration.
--
-- `order_status_history` answers the other half: *who* moved an order to
-- 'cancelled', and what it was before. That matters for a customer dispute and
-- for insider risk alike, and neither is answerable from a single mutable
-- `status` column.
--
-- The history table is written **only** by the trigger. It has no INSERT policy
-- and the privilege is revoked, so a client cannot forge, amend or erase an
-- entry — an audit log a caller can write is not an audit log.
--
-- Idempotent, like every file in this directory: re-running it is safe.
-- ============================================================================

create table if not exists order_status_history (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references orders(id) on delete cascade,
  -- Null on the genesis row: an order's creation is a transition from nothing
  -- to 'pending', and recording it keeps the trail complete rather than
  -- starting it at the first edit.
  from_status text,
  to_status   text not null,
  -- Deliberately **not** a foreign key to auth.users. An audit row has to
  -- outlive the account it names; an FK would either block deleting that user
  -- or null out the attribution, and both destroy the record's only purpose.
  -- Null means the change was not made by a logged-in caller (a migration, a
  -- service_role script, or an order placed by a guest).
  changed_by  uuid,
  changed_at  timestamptz not null default now()
);

-- The access pattern is "this order's history, newest first".
create index if not exists order_status_history_order_idx
  on order_status_history(order_id, changed_at desc);


-- ── updated_at ──────────────────────────────────────────────────────────────
-- LOOP.md named `moddatetime`. This is the same behaviour written in plpgsql
-- instead: moddatetime lives in the `extensions` schema, which is not on the
-- search_path while migrations run — the same trap documented for
-- uuid_generate_v4() at the top of init_schema.sql. A four-line function has no
-- such dependency.
create or replace function set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end
$$;

drop trigger if exists orders_set_updated_at on orders;
create trigger orders_set_updated_at
  before update on orders
  for each row execute function set_updated_at();


-- ── status history ──────────────────────────────────────────────────────────
-- security definer so the trigger can write a table nobody else may write.
-- search_path is pinned for the same reason it is on is_admin() and
-- place_order(): a definer function with a mutable search_path is how a
-- privilege escalation starts.
create or replace function record_order_status_change()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into order_status_history (order_id, from_status, to_status, changed_by)
    values (new.id, null, new.status, auth.uid());
  elsif new.status is distinct from old.status then
    -- `is distinct from` rather than `<>`: status is nullable, and a null on
    -- either side would make `<>` evaluate to NULL and silently skip the row.
    insert into order_status_history (order_id, from_status, to_status, changed_by)
    values (new.id, old.status, new.status, auth.uid());
  end if;
  return null;   -- AFTER trigger: the return value is ignored.
end
$$;

drop trigger if exists orders_record_status_change on orders;
create trigger orders_record_status_change
  after insert or update of status on orders
  for each row execute function record_order_status_change();


-- ── who may read it ─────────────────────────────────────────────────────────
alter table order_status_history enable row level security;

drop policy if exists "Admins can view order status history" on order_status_history;
create policy "Admins can view order status history"
  on order_status_history for select using (is_admin());

-- Supabase grants INSERT/UPDATE/DELETE on new `public` tables to anon and
-- authenticated by default, and a policy is only consulted *after* the
-- privilege check — so the absence of a write policy is not by itself a lock.
revoke insert, update, delete on order_status_history from anon, authenticated;

-- No backfill. Existing orders get no genesis row on purpose: their current
-- status is not necessarily the status they were created with, so a synthesised
-- row would state as fact something nobody recorded. An audit trail that starts
-- today is honest; one that invents its own past is not.
