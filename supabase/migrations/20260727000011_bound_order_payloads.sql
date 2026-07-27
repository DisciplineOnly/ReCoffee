-- ============================================================================
-- ReCoffee — bound the jsonb payload columns on orders.
--
-- `client_info` and `delivery_info` were written straight from the caller:
-- `insert into orders (...) values (..., p_client, p_delivery, ...)`. Both are
-- jsonb with no size or shape validation, so a direct RPC call could carry
-- arbitrary keys and megabytes into a column the admin dashboard renders. React
-- escapes the values, so this is storage abuse rather than XSS — but a table
-- anyone can inflate is still a table anyone can inflate.
--
-- Two independent layers, because they fail differently:
--
--   1. place_order() now **projects** both objects onto their known keys and
--      rejects over-length values. Nothing the client did not have a field for
--      is stored at all. This mirrors what T1 already did for payment_info,
--      which is built as jsonb_build_object('method', ...) rather than passed
--      through.
--   2. CHECK constraints cap the stored size regardless of who wrote the row.
--      Unlike RLS, a CHECK applies to every role including service_role and to
--      every future write path — a migration, an Edge Function, a gateway
--      callback. Layer 1 is the one that runs today; layer 2 is the one that
--      still holds when someone adds a second writer.
--
-- `inquiries.details` is already capped at 4096 bytes by
-- 20260727000005_rate_limit_public_writes.sql, both as a CHECK and inside
-- submit_inquiry(), so it needs nothing here.
--
-- Idempotent, like every file in this directory: re-running it is safe.
-- ============================================================================

-- Existing rows first: report rather than force. Postgres would refuse the
-- constraint anyway, but with "check constraint is violated by some row" and no
-- indication of which column or how many.
do $$
declare
  v_client   int;
  v_delivery int;
  v_payment  int;
begin
  select count(*) into v_client   from orders where pg_column_size(client_info)   >= 8192;
  select count(*) into v_delivery from orders where pg_column_size(delivery_info) >= 8192;
  select count(*) into v_payment  from orders where payment_info is not null
                                                and pg_column_size(payment_info) >= 1024;

  if v_client > 0 or v_delivery > 0 or v_payment > 0 then
    raise exception
      'Refusing to add the payload size constraints: % client_info, % delivery_info and % payment_info rows already exceed them. Inspect and trim those rows first.',
      v_client, v_delivery, v_payment;
  end if;
end
$$;

-- Postgres has no `add constraint if not exists`, hence the pg_constraint guard
-- (same pattern as the money constraints in 20260727000002).
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'orders_client_info_bounded' and conrelid = 'orders'::regclass
  ) then
    alter table orders add constraint orders_client_info_bounded
      check (pg_column_size(client_info) < 8192);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'orders_delivery_info_bounded' and conrelid = 'orders'::regclass
  ) then
    alter table orders add constraint orders_delivery_info_bounded
      check (pg_column_size(delivery_info) < 8192);
  end if;

  -- payment_info holds exactly {"method": "..."} today. The cap is deliberately
  -- tight so that whatever a payment gateway integration decides to store here
  -- has to be a decision, not an accident.
  if not exists (
    select 1 from pg_constraint
    where conname = 'orders_payment_info_bounded' and conrelid = 'orders'::regclass
  ) then
    alter table orders add constraint orders_payment_info_bounded
      check (payment_info is null or pg_column_size(payment_info) < 1024);
  end if;
end
$$;


-- ============================================================================
-- place_order(), reissued with jsonb projection and length validation.
-- Kept byte-identical to section 7 of 20260723000000_init_schema.sql.
-- ============================================================================

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
  c_dtypes    constant text[] := array['home', 'office'];
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
  v_client       jsonb;
  v_delivery     jsonb;
  v_dtype        text;
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

  -- ── bound the two client-supplied jsonb columns ──────────────────────────
  -- Reject over-length values rather than truncating them: a silently
  -- shortened street address is a failed delivery and a shortened phone number
  -- is an uncontactable customer. The caps are generous — these are names and
  -- addresses, not documents.
  if length(coalesce(p_client ->> 'firstName', '')) > 80
     or length(coalesce(p_client ->> 'lastName',  '')) > 80
     or length(coalesce(p_client ->> 'email',     '')) > 160
     or length(coalesce(p_client ->> 'phone',     '')) > 40 then
    raise exception 'ORDER_INVALID_DETAILS' using detail = 'a client field exceeds its maximum length';
  end if;

  v_dtype := coalesce(p_delivery ->> 'type', '');
  if v_dtype <> all (c_dtypes) then
    raise exception 'ORDER_INVALID_DETAILS' using detail = 'delivery type must be home or office';
  end if;

  if length(coalesce(p_delivery #>> '{address,street}',     '')) > 200
     or length(coalesce(p_delivery #>> '{address,city}',       '')) > 80
     or length(coalesce(p_delivery #>> '{address,postalCode}', '')) > 20
     or length(coalesce(p_delivery #>> '{address,notes}',      '')) > 500
     or length(coalesce(p_delivery ->> 'courier',              '')) > 40
     or length(coalesce(p_delivery ->> 'courierCity',          '')) > 80
     or length(coalesce(p_delivery ->> 'courierOffice',        '')) > 160 then
    raise exception 'ORDER_INVALID_DETAILS' using detail = 'a delivery field exceeds its maximum length';
  end if;

  -- Projection, not pass-through: whatever else the payload carried — extra
  -- keys, nested junk, megabytes of it — is not stored, by construction. Same
  -- treatment payment_info already gets at the insert below. The CHECK
  -- constraints on these columns are the backstop for every *other* writer.
  v_client := jsonb_strip_nulls(jsonb_build_object(
    'firstName', nullif(btrim(p_client ->> 'firstName'), ''),
    'lastName',  nullif(btrim(p_client ->> 'lastName'),  ''),
    'email',     nullif(btrim(p_client ->> 'email'),     ''),
    'phone',     nullif(btrim(p_client ->> 'phone'),     '')
  ));

  -- `address` stays an object even when empty, and the courier keys are only
  -- kept for office delivery, so the stored shape matches what the checkout
  -- already sent and src/pages/admin/Orders.jsx already reads.
  v_delivery := jsonb_strip_nulls(jsonb_build_object(
    'type', v_dtype,
    'address',
      case when v_dtype = 'home' then jsonb_strip_nulls(jsonb_build_object(
        'street',     nullif(btrim(p_delivery #>> '{address,street}'),     ''),
        'city',       nullif(btrim(p_delivery #>> '{address,city}'),       ''),
        'postalCode', nullif(btrim(p_delivery #>> '{address,postalCode}'), ''),
        'notes',      nullif(btrim(p_delivery #>> '{address,notes}'),      '')
      )) else '{}'::jsonb end,
    'courier',       case when v_dtype = 'office' then nullif(btrim(p_delivery ->> 'courier'),       '') end,
    'courierCity',   case when v_dtype = 'office' then nullif(btrim(p_delivery ->> 'courierCity'),   '') end,
    'courierOffice', case when v_dtype = 'office' then nullif(btrim(p_delivery ->> 'courierOffice'), '') end
  ));

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
        v_client, v_delivery,                               -- projected, never the raw payload
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
