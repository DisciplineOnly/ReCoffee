-- ============================================================================
-- ReCoffee — server-authoritative order placement.
--
-- Before this migration the browser posted `subtotal`, `delivery_fee`, `total`
-- and every `order_items.unit_price` straight from localStorage, and the RLS
-- policy on `orders` constrained ownership only — nothing about money. This is
-- a pure SPA, so the anon key is in the shipped bundle and every table is
-- reachable over PostgREST directly: editing one number in devtools bought a
-- machine for 0.01 BGN, and cash on delivery ships real goods against it.
--
-- place_order() is the single entry point from here on. It ignores anything
-- price-shaped in its payload, prices every line from `products`, computes the
-- delivery fee from `store_settings`, pins `status` to 'pending', and writes
-- the order and all of its lines inside one transaction. Tasks T2 (frontend)
-- and T3 (revoke the direct-insert policies) complete the move.
--
-- Idempotent, like every file in this directory: re-running it is safe.
-- ============================================================================


-- ============================================================================
-- 1. AUTHORITATIVE DELIVERY THRESHOLDS
--
-- The mirror of src/lib/siteConfig.js `delivery`. The client copy stays, but
-- as display only — this row is what the money is actually computed from.
-- ============================================================================

create table if not exists store_settings (
  id                        smallint primary key default 1 check (id = 1),
  free_delivery_over_bgn    decimal(10,2) not null default 100
                            check (free_delivery_over_bgn >= 0),
  standard_delivery_fee_bgn decimal(10,2) not null default 5
                            check (standard_delivery_fee_bgn >= 0),
  updated_at                timestamptz not null default now()
);

insert into store_settings (id) values (1) on conflict (id) do nothing;

alter table store_settings enable row level security;

drop policy if exists "Store settings are viewable by everyone" on store_settings;
drop policy if exists "Admins can update store settings"        on store_settings;

-- Public read so the storefront can eventually display the live threshold; no
-- insert or delete policy at all, so the single row cannot be removed or
-- duplicated by a client.
create policy "Store settings are viewable by everyone"
  on store_settings for select using (true);
create policy "Admins can update store settings"
  on store_settings for update using (is_admin());


-- ============================================================================
-- 2. HISTORICAL PRODUCT NAME ON EVERY ORDER LINE
--
-- order_items.product_id is a live FK, so renaming or deleting a product used
-- to rewrite history. The name is snapshotted at order time instead.
-- ============================================================================

alter table order_items add column if not exists product_name text;


-- ============================================================================
-- 3. place_order()
-- ============================================================================

-- Dropped first so a future change to the return columns can still be applied
-- by re-running this file (create or replace cannot change a return type).
drop function if exists public.place_order(jsonb, jsonb, jsonb, text);

create function public.place_order(
  p_items          jsonb,   -- [{product_id uuid, quantity int, grind_type text}, ...]
  p_client         jsonb,
  p_delivery       jsonb,
  p_payment_method text
)
returns table (
  order_number text,
  subtotal     numeric,
  delivery_fee numeric,
  total        numeric,
  created_at   timestamptz,
  items        jsonb
)
language plpgsql
security definer
set search_path = public
as $fn$
declare
  -- Crockford-style base32 — I, L, O and U are left out so an order number read
  -- out over the phone can't be mistyped. 256 % 32 === 0, so indexing a random
  -- byte into it is unbiased. Ported verbatim from the client generator this
  -- replaces (src/components/checkout/ReviewStep.jsx), including the retry.
  c_alphabet  constant text   := '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
  c_code_len  constant int    := 6;
  c_attempts  constant int    := 5;
  c_max_lines constant int    := 50;
  c_grinds    constant text[] := array['whole-bean', 'espresso', 'filter', 'french-press', 'none'];
  c_methods   constant text[] := array['card', 'cash', 'bank'];
  c_uuid_re   constant text   := '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

  v_lines        jsonb;
  v_subtotal     numeric(10,2);
  v_delivery_fee numeric(10,2);
  v_total        numeric(10,2);
  v_free_over    numeric(10,2);
  v_flat_fee     numeric(10,2);
  v_order_number text;
  v_order_id     uuid;
  v_created_at   timestamptz;
  v_code         text;
  v_bytes        bytea;
  v_attempt      int;
  v_i            int;
  v_bad          text;
begin
  -- ── payload shape ────────────────────────────────────────────────────────
  -- Every message below is a stable token the frontend matches on; the human
  -- text lives in the locale files, not here.

  if p_payment_method is null or p_payment_method <> all (c_methods) then
    raise exception 'ORDER_INVALID_PAYMENT_METHOD'
      using detail = 'expected one of card, cash, bank';
  end if;

  if p_client is null or jsonb_typeof(p_client) <> 'object'
     or p_delivery is null or jsonb_typeof(p_delivery) <> 'object' then
    raise exception 'ORDER_INVALID_DETAILS';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array'
     or jsonb_array_length(p_items) = 0 then
    raise exception 'ORDER_EMPTY_CART';
  end if;

  if jsonb_array_length(p_items) > c_max_lines then
    raise exception 'ORDER_TOO_MANY_LINES'
      using detail = format('%s lines, maximum %s', jsonb_array_length(p_items), c_max_lines);
  end if;

  -- Types first, in their own pass: a malformed payload must come back as this
  -- token rather than as an opaque 22P02 from a failed cast below.
  if exists (
    select 1
    from jsonb_array_elements(p_items) as e
    where jsonb_typeof(e) <> 'object'
       or coalesce(e ->> 'product_id', '') !~* c_uuid_re
       or jsonb_typeof(e -> 'quantity') <> 'number'
  ) then
    raise exception 'ORDER_INVALID_LINE' using detail = 'product_id must be a uuid and quantity a number';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_items) as e
    where (e ->> 'quantity')::numeric <> trunc((e ->> 'quantity')::numeric)
       or (e ->> 'quantity')::numeric < 1
       or (e ->> 'quantity')::numeric > 999
       or coalesce(nullif(e ->> 'grind_type', ''), 'none') <> all (c_grinds)
  ) then
    raise exception 'ORDER_INVALID_LINE' using detail = 'quantity must be a whole number in 1..999 and grind_type a known value';
  end if;

  -- ── resolve against the catalog ──────────────────────────────────────────
  -- Unknown ids are reported before out-of-stock ones so a bad id is never
  -- mislabelled as a stock problem.

  select string_agg(distinct l.product_id::text, ', ')
    into v_bad
  from (
    select (e ->> 'product_id')::uuid as product_id
    from jsonb_array_elements(p_items) as e
  ) l
  left join products p on p.id = l.product_id
  where p.id is null;

  if v_bad is not null then
    raise exception 'ORDER_PRODUCT_UNKNOWN' using detail = v_bad;
  end if;

  select string_agg(distinct p.name_bg, ', ')
    into v_bad
  from (
    select (e ->> 'product_id')::uuid as product_id
    from jsonb_array_elements(p_items) as e
  ) l
  join products p on p.id = l.product_id
  where p.in_stock is not true;

  if v_bad is not null then
    raise exception 'ORDER_PRODUCT_OUT_OF_STOCK' using detail = v_bad;
  end if;

  -- ── price every line from `products`, never from the payload ─────────────
  -- coalesce(sale_price, price) where sale_price < price — the same rule as
  -- `effectivePrice` in src/hooks/useProducts.jsx.

  select jsonb_agg(
           jsonb_build_object(
             'product_id',   l.product_id,
             'product_name', p.name_bg,
             'quantity',     l.quantity,
             'unit_price',   case when p.sale_price is not null and p.sale_price < p.price
                                  then p.sale_price else p.price end,
             'grind_type',   l.grind_type
           )
           order by l.line_no
         ),
         round(sum(
           (case when p.sale_price is not null and p.sale_price < p.price
                 then p.sale_price else p.price end) * l.quantity
         ), 2)
    into v_lines, v_subtotal
  from (
    select (e ->> 'product_id')::uuid                       as product_id,
           (e ->> 'quantity')::int                          as quantity,
           coalesce(nullif(e ->> 'grind_type', ''), 'none') as grind_type,
           n                                                as line_no
    from jsonb_array_elements(p_items) with ordinality as t(e, n)
  ) l
  join products p on p.id = l.product_id;

  -- ── delivery fee ─────────────────────────────────────────────────────────

  select s.free_delivery_over_bgn, s.standard_delivery_fee_bgn
    into v_free_over, v_flat_fee
  from store_settings s
  where s.id = 1;

  if not found then
    -- Unreachable: the row is seeded above. Charge the documented fee rather
    -- than nothing if it ever is.
    v_free_over := 100;
    v_flat_fee  := 5;
  end if;

  v_delivery_fee := case when v_subtotal >= v_free_over then 0 else v_flat_fee end;
  v_total        := v_subtotal + v_delivery_fee;

  -- ── insert ───────────────────────────────────────────────────────────────
  -- A taken order number is recoverable: draw another one rather than failing
  -- an order the customer has already confirmed. gen_random_uuid() is core
  -- Postgres and cryptographically random; bytes 0..5 of a v4 uuid carry no
  -- version or variant bits, so they are six uniform random bytes.

  for v_attempt in 1 .. c_attempts loop
    v_bytes := decode(replace(gen_random_uuid()::text, '-', ''), 'hex');
    v_code  := '';
    for v_i in 0 .. c_code_len - 1 loop
      v_code := v_code || substr(c_alphabet, (get_byte(v_bytes, v_i) % 32) + 1, 1);
    end loop;
    v_order_number := 'RC-' || to_char(now(), 'YYYY') || '-' || v_code;

    begin
      insert into orders (
        order_number, status, subtotal, delivery_fee, total,
        client_info, delivery_info, payment_info, user_id
      ) values (
        v_order_number,
        'pending',                                          -- never from the caller
        v_subtotal, v_delivery_fee, v_total,
        p_client, p_delivery,
        jsonb_build_object('method', p_payment_method),      -- nothing else reaches this column
        auth.uid()                                           -- null for guests; never a parameter
      )
      returning id, orders.created_at into v_order_id, v_created_at;
      exit;
    exception when unique_violation then
      v_order_id := null;
    end;
  end loop;

  if v_order_id is null then
    raise exception 'ORDER_NUMBER_EXHAUSTED';
  end if;

  -- Same transaction as the order itself, so a failure here can no longer
  -- leave an order row with zero lines behind.
  insert into order_items (order_id, product_id, product_name, quantity, unit_price, grind_type)
  select v_order_id,
         (l ->> 'product_id')::uuid,
         l ->> 'product_name',
         (l ->> 'quantity')::int,
         (l ->> 'unit_price')::numeric,
         l ->> 'grind_type'
  from jsonb_array_elements(v_lines) as l;

  -- Enough for the confirmation page to render without trusting localStorage.
  return query
    select v_order_number, v_subtotal, v_delivery_fee, v_total, v_created_at, v_lines;
end
$fn$;

revoke all    on function public.place_order(jsonb, jsonb, jsonb, text) from public;
grant  execute on function public.place_order(jsonb, jsonb, jsonb, text) to anon, authenticated;
