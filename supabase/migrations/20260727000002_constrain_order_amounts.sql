-- ============================================================================
-- ReCoffee — order money constraints.
--
-- `subtotal`, `delivery_fee` and `total` were `decimal(10,2) not null` with no
-- lower bound and nothing tying them together, and `order_items.unit_price` was
-- likewise unconstrained (only `quantity > 0` existed, with no upper bound).
-- Negative-total orders were insertable.
--
-- place_order() already computes all of these server-side, so in the normal path
-- these constraints should never fire. That is the point: they are the backstop
-- for every *other* path — a future admin tool, an Edge Function, a migration, a
-- direct service_role write, or a bug in the RPC itself. Unlike RLS, a CHECK
-- applies to every role including the table owner and service_role.
--
-- Verified before applying: zero violating rows (both tables were empty).
--
-- Idempotent, like every file in this directory: each constraint is guarded on
-- pg_constraint, since Postgres has no `add constraint if not exists`.
-- ============================================================================

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'orders_amounts_nonneg' and conrelid = 'orders'::regclass
  ) then
    alter table orders add constraint orders_amounts_nonneg
      check (subtotal >= 0 and delivery_fee >= 0 and total >= 0);
  end if;

  -- NOTE: if a discount, coupon or credit column is ever added to `orders`, it
  -- has to be folded into this equation or every order will fail to insert.
  -- Both sides are decimal(10,2), so this is exact arithmetic, not float.
  if not exists (
    select 1 from pg_constraint
    where conname = 'orders_total_consistent' and conrelid = 'orders'::regclass
  ) then
    alter table orders add constraint orders_total_consistent
      check (total = subtotal + delivery_fee);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'order_items_unit_price_nonneg' and conrelid = 'order_items'::regclass
  ) then
    alter table order_items add constraint order_items_unit_price_nonneg
      check (unit_price >= 0);
  end if;

  -- Overlaps the table's original `quantity > 0`, which is left in place: it is
  -- part of the create table in init_schema.sql and costs nothing to keep.
  if not exists (
    select 1 from pg_constraint
    where conname = 'order_items_quantity_sane' and conrelid = 'order_items'::regclass
  ) then
    alter table order_items add constraint order_items_quantity_sane
      check (quantity between 1 and 999);
  end if;
end
$$;
