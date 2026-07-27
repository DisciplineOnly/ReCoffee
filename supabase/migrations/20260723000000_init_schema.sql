-- ============================================================================
-- ReCoffee — full database bootstrap.
--
-- Single-file schema for a fresh Supabase project. This supersedes the previous
-- migration chain (20251228000000 .. 20260722000000), which could no longer
-- bootstrap an empty project: it referenced a `services` table, a `products`
-- storage bucket and `products.image_url` that were created by hand in the
-- dashboard and never captured in a migration. Everything is folded in here.
--
-- Ordering: tables -> is_admin() -> indexes -> RLS -> place_order() -> storage.
-- Every statement is idempotent, so re-running against a partially migrated
-- database is safe.
--
-- UUID defaults use gen_random_uuid(), which is core Postgres (13+). The older
-- uuid_generate_v4() is deliberately avoided: uuid-ossp lives in the
-- `extensions` schema on Supabase, which is not on the search_path while
-- migrations run, so it fails with "function does not exist".
-- ============================================================================


-- ============================================================================
-- 1. CATALOG
-- ============================================================================

create table if not exists products (
  id             uuid primary key default gen_random_uuid(),
  slug           text unique not null,
  name_bg        text not null,
  name_en        text,
  description_bg text,
  description_en text,
  price          decimal(10,2) not null,
  -- Promotional price; the frontend treats it as the effective selling price
  -- and shows `price` struck through. Null means "not on sale".
  sale_price     decimal(10,2) check (sale_price is null or sale_price >= 0),
  is_new         boolean default false,
  in_stock       boolean default true,
  featured       boolean default false,
  -- Leaf of the taxonomy in src/lib/categories.js:
  --   coffee   -> 'capsules', 'grains'
  --   machines -> 'machines-personal', 'machines-professional'
  -- Legacy values ('single-origin', 'blend', 'limited', 'decaf') are still
  -- accepted and are normalised to 'grains' by the frontend.
  category       text not null,
  -- Coffee only; machines leave these null.
  roast_level    int2 check (roast_level between 1 and 5),
  origin         text,
  process        text,
  weight_grams   int default 250,
  -- Public URL in the `products` storage bucket. Null falls back to the local
  -- image mapping in src/data/products.json.
  image_url      text,
  created_at     timestamptz default now()
);

create table if not exists product_flavors (
  id             uuid primary key default gen_random_uuid(),
  product_id     uuid not null references products(id) on delete cascade,
  flavor_name_bg text not null,
  flavor_name_en text
);

-- Repair / consulting services offered alongside the catalog (admin-managed).
create table if not exists services (
  id               uuid primary key default gen_random_uuid(),
  name_bg          text not null,
  name_en          text,
  description_bg   text,
  description_en   text,
  price            decimal(10,2) not null default 0,
  duration_minutes int default 60,
  active           boolean default true,
  image_url        text,
  created_at       timestamptz default now()
);


-- ============================================================================
-- 2. ORDERS
-- ============================================================================

create table if not exists orders (
  id            uuid primary key default gen_random_uuid(),
  order_number  text unique not null,
  status        text default 'pending'
                check (status in ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  subtotal      decimal(10,2) not null,
  delivery_fee  decimal(10,2) not null,
  total         decimal(10,2) not null,
  client_info   jsonb not null,
  delivery_info jsonb not null,
  payment_info  jsonb,
  -- Null for guest checkout; set to auth.uid() for logged-in customers.
  user_id       uuid references auth.users(id),
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create table if not exists order_items (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id),
  -- The product name as it was at order time. product_id is a live FK, so
  -- without this snapshot renaming or deleting a product rewrites history.
  product_name text,
  quantity   int not null check (quantity > 0),
  unit_price decimal(10,2) not null,
  -- 'whole-bean' | 'espresso' | 'filter' | 'french-press', or 'none' for
  -- capsules and machines, which cannot be ground.
  grind_type text not null
);

-- For databases created before product_name existed.
alter table order_items add column if not exists product_name text;

-- Authoritative delivery thresholds. src/lib/siteConfig.js `delivery` mirrors
-- these for display; place_order() below computes the actual fee from this row.
create table if not exists store_settings (
  id                        smallint primary key default 1 check (id = 1),
  free_delivery_over_bgn    decimal(10,2) not null default 100
                            check (free_delivery_over_bgn >= 0),
  standard_delivery_fee_bgn decimal(10,2) not null default 5
                            check (standard_delivery_fee_bgn >= 0),
  updated_at                timestamptz not null default now()
);

insert into store_settings (id) values (1) on conflict (id) do nothing;


-- ============================================================================
-- 3. REVIEWS, INQUIRIES, NEWSLETTER
-- ============================================================================

create table if not exists reviews (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references products(id) on delete cascade,
  author_name text not null,
  rating      int2 not null check (rating between 1 and 5),
  comment     text,
  created_at  timestamptz default now()
);

-- Contact form, B2B/wholesale enquiries and subscription requests.
create table if not exists inquiries (
  id         uuid primary key default gen_random_uuid(),
  type       text not null check (type in ('contact', 'b2b', 'subscription')),
  name       text not null,
  company    text,
  email      text not null,
  phone      text,
  message    text,
  details    jsonb,
  status     text default 'new' check (status in ('new', 'in_progress', 'closed')),
  created_at timestamptz default now()
);

create table if not exists newsletter_subscribers (
  id         uuid primary key default gen_random_uuid(),
  email      text unique not null,
  created_at timestamptz default now()
);


-- ============================================================================
-- 4. ADMIN ROLE
--
-- Membership of admin_users — not merely being authenticated — grants write
-- access. Public customer signup exists, so the two must stay separate.
--
-- A fresh project has no auth users, so this table starts empty and NOBODY can
-- write to the catalog yet. To appoint the first admin: create the user in
-- Authentication -> Users, then run in the SQL editor:
--
--   insert into admin_users (user_id)
--   select id from auth.users where email = 'you@example.com';
-- ============================================================================

create table if not exists admin_users (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);

-- security definer so the policies below can read admin_users without the
-- caller needing select rights on it (which would recurse through RLS).
create or replace function is_admin()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (select 1 from admin_users where user_id = auth.uid())
$$;


-- ============================================================================
-- 5. INDEXES
-- ============================================================================

-- products.slug already has an index via its unique constraint.
create index if not exists products_category_idx    on products(category);
create index if not exists product_flavors_pid_idx  on product_flavors(product_id);
create index if not exists orders_user_id_idx       on orders(user_id);
create index if not exists orders_created_at_idx    on orders(created_at desc);
create index if not exists order_items_order_id_idx on order_items(order_id);
create index if not exists reviews_product_id_idx   on reviews(product_id);
create index if not exists inquiries_created_at_idx on inquiries(created_at desc);


-- ============================================================================
-- 6. ROW LEVEL SECURITY
-- ============================================================================

alter table products               enable row level security;
alter table product_flavors        enable row level security;
alter table services               enable row level security;
alter table orders                 enable row level security;
alter table order_items            enable row level security;
alter table reviews                enable row level security;
alter table inquiries              enable row level security;
alter table newsletter_subscribers enable row level security;
alter table admin_users            enable row level security;
alter table store_settings         enable row level security;

-- Policies are dropped first so this file can be re-applied cleanly.

-- ── products: public read, admin write ──────────────────────────────────────
drop policy if exists "Products are viewable by everyone" on products;
drop policy if exists "Admins can insert products"        on products;
drop policy if exists "Admins can update products"        on products;
drop policy if exists "Admins can delete products"        on products;

create policy "Products are viewable by everyone" on products for select using (true);
create policy "Admins can insert products" on products for insert with check (is_admin());
create policy "Admins can update products" on products for update using (is_admin());
create policy "Admins can delete products" on products for delete using (is_admin());

-- ── product_flavors: public read, admin write ───────────────────────────────
drop policy if exists "Flavors are viewable by everyone" on product_flavors;
drop policy if exists "Admins can insert flavors"        on product_flavors;
drop policy if exists "Admins can update flavors"        on product_flavors;
drop policy if exists "Admins can delete flavors"        on product_flavors;

create policy "Flavors are viewable by everyone" on product_flavors for select using (true);
create policy "Admins can insert flavors" on product_flavors for insert with check (is_admin());
create policy "Admins can update flavors" on product_flavors for update using (is_admin());
create policy "Admins can delete flavors" on product_flavors for delete using (is_admin());

-- ── services: public read, admin write ──────────────────────────────────────
drop policy if exists "Services are viewable by everyone" on services;
drop policy if exists "Admins can insert services"        on services;
drop policy if exists "Admins can update services"        on services;
drop policy if exists "Admins can delete services"        on services;

create policy "Services are viewable by everyone" on services for select using (true);
create policy "Admins can insert services" on services for insert with check (is_admin());
create policy "Admins can update services" on services for update using (is_admin());
create policy "Admins can delete services" on services for delete using (is_admin());

-- ── orders: no client writes in, owner or admin out ─────────────────────────
-- Orders are created *only* by place_order() (section 7), which is
-- `security definer` and so inserts as its owner. There is deliberately no
-- insert policy: a policy is consulted only after the table privilege check
-- passes, and the privilege is revoked below, so neither is load-bearing alone.
drop policy if exists "Anyone can create an order"            on orders;
drop policy if exists "Users can view own orders"             on orders;
drop policy if exists "Admins can view all orders (dashboard)" on orders;
drop policy if exists "Admins can update orders"              on orders;

create policy "Users can view own orders"
  on orders for select using (user_id = auth.uid());

create policy "Admins can view all orders (dashboard)"
  on orders for select using (is_admin());

create policy "Admins can update orders"
  on orders for update using (is_admin());

-- ── order_items: visibility follows the parent order ────────────────────────
-- Same as orders: written only by place_order(). The insert policy this
-- replaces was `with check (true)` with no link between the caller and
-- `order_id`, so anyone holding an order uuid could append lines to any order.
drop policy if exists "Anyone can create order items"            on order_items;
drop policy if exists "Users and admins can view order items"    on order_items;

create policy "Users and admins can view order items"
  on order_items for select using (
    exists (
      select 1 from orders o
      where o.id = order_id
        and (o.user_id = auth.uid() or is_admin())
    )
  );

-- Supabase's default privileges grant INSERT on new `public` tables to anon and
-- authenticated, so revoking is the half that actually closes the door.
revoke insert on orders      from anon, authenticated;
revoke insert on order_items from anon, authenticated;

-- ── reviews: public read + write, admin moderation ──────────────────────────
drop policy if exists "Reviews are viewable by everyone" on reviews;
drop policy if exists "Anyone can create a review"       on reviews;
drop policy if exists "Admins can delete reviews"        on reviews;

create policy "Reviews are viewable by everyone" on reviews for select using (true);
create policy "Anyone can create a review" on reviews for insert to anon, authenticated with check (true);
create policy "Admins can delete reviews" on reviews for delete using (is_admin());

-- ── inquiries: write-only for the public, admin reads ───────────────────────
drop policy if exists "Anyone can create an inquiry" on inquiries;
drop policy if exists "Admins can view inquiries"    on inquiries;
drop policy if exists "Admins can update inquiries"  on inquiries;

create policy "Anyone can create an inquiry" on inquiries for insert to anon, authenticated with check (true);
create policy "Admins can view inquiries" on inquiries for select using (is_admin());
create policy "Admins can update inquiries" on inquiries for update using (is_admin());

-- ── newsletter: write-only for the public, admin reads ──────────────────────
drop policy if exists "Anyone can subscribe"      on newsletter_subscribers;
drop policy if exists "Admins can view subscribers" on newsletter_subscribers;

create policy "Anyone can subscribe" on newsletter_subscribers for insert to anon, authenticated with check (true);
create policy "Admins can view subscribers" on newsletter_subscribers for select using (is_admin());

-- ── admin_users: a user may only see their own row ──────────────────────────
drop policy if exists "Users can view own admin row" on admin_users;
create policy "Users can view own admin row" on admin_users for select using (user_id = auth.uid());

-- ── store_settings: public read, admin update ───────────────────────────────
-- No insert or delete policy at all, so the single row cannot be removed or
-- duplicated by a client.
drop policy if exists "Store settings are viewable by everyone" on store_settings;
drop policy if exists "Admins can update store settings"        on store_settings;

create policy "Store settings are viewable by everyone"
  on store_settings for select using (true);
create policy "Admins can update store settings"
  on store_settings for update using (is_admin());


-- ============================================================================
-- 7. ORDER PLACEMENT
--
-- This is a pure SPA: the anon key ships in the bundle, so every table is
-- reachable over PostgREST directly and UI checks are not controls. Orders
-- therefore do not go in through the tables — place_order() is the single
-- entry point. It ignores anything price-shaped in its payload, prices every
-- line from `products`, computes the delivery fee from `store_settings`, pins
-- `status` to 'pending', and writes the order and all of its lines inside one
-- transaction.
--
-- Kept byte-identical to 20260727000000_place_order_rpc.sql, which introduced
-- it; change both together.
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


-- ============================================================================
-- 8. STORAGE — product / service images
--
-- storage.objects is owned by supabase_storage_admin. Creating policies on it
-- from a migration normally works, but if the role running this file lacks
-- ownership the whole migration would abort, so the section degrades to a
-- NOTICE instead. If you see that notice, create the four policies below from
-- Storage -> Policies in the dashboard.
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do update set public = true;

do $$
begin
  drop policy if exists "Public Read Access"  on storage.objects;
  drop policy if exists "Admin Insert Access" on storage.objects;
  drop policy if exists "Admin Update Access" on storage.objects;
  drop policy if exists "Admin Delete Access" on storage.objects;

  create policy "Public Read Access"
    on storage.objects for select using (bucket_id = 'products');
  create policy "Admin Insert Access"
    on storage.objects for insert with check (bucket_id = 'products' and is_admin());
  create policy "Admin Update Access"
    on storage.objects for update using (bucket_id = 'products' and is_admin());
  create policy "Admin Delete Access"
    on storage.objects for delete using (bucket_id = 'products' and is_admin());
exception
  when insufficient_privilege then
    raise notice 'Skipped storage.objects policies (insufficient privilege) — create them from the dashboard.';
end
$$;
