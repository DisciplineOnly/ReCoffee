-- ============================================================================
-- ReCoffee — deleting a product must not be blocked by, or destroy, history.
--
-- `order_items.product_id references products(id)` had no `on delete` clause,
-- so it defaulted to NO ACTION: any product that had ever been ordered could
-- not be deleted, and the admin got a raw Postgres FK error in an alert().
--
-- `on delete cascade` is the tempting fix and the wrong one — it would silently
-- delete order line items and corrupt historical revenue. `set null` keeps the
-- line, and T1's `product_name` snapshot means the line still says what was
-- bought after the catalog row is gone.
--
-- Also adds the missing index. `order_items` indexed `order_id` only, so the
-- admin orders join and every FK check on delete did a sequential scan.
--
-- Idempotent, like every file in this directory: re-running it is safe.
-- ============================================================================

do $$
begin
  -- Only rebuild the constraint if it is not already ON DELETE SET NULL, so
  -- re-running does not churn the table.
  if exists (
    select 1 from pg_constraint
    where conname = 'order_items_product_id_fkey'
      and conrelid = 'order_items'::regclass
      and confdeltype <> 'n'          -- 'n' = SET NULL
  ) then
    alter table order_items drop constraint order_items_product_id_fkey;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'order_items_product_id_fkey' and conrelid = 'order_items'::regclass
  ) then
    alter table order_items
      add constraint order_items_product_id_fkey
      foreign key (product_id) references products(id) on delete set null;
  end if;
end
$$;

create index if not exists order_items_product_id_idx on order_items(product_id);

-- Backfill the snapshot for rows written before T1 added the column, where the
-- product still resolves. Rows whose product is already gone cannot be
-- recovered — there is nothing left to read the name from.
update order_items i
set product_name = p.name_bg
from products p
where i.product_id = p.id
  and i.product_name is null;
