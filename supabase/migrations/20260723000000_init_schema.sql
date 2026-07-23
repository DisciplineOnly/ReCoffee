-- ============================================================================
-- ReCoffee — full database bootstrap.
--
-- Single-file schema for a fresh Supabase project. This supersedes the previous
-- migration chain (20251228000000 .. 20260722000000), which could no longer
-- bootstrap an empty project: it referenced a `services` table, a `products`
-- storage bucket and `products.image_url` that were created by hand in the
-- dashboard and never captured in a migration. Everything is folded in here.
--
-- Ordering: tables -> is_admin() -> indexes -> RLS -> storage.
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
  quantity   int not null check (quantity > 0),
  unit_price decimal(10,2) not null,
  -- 'whole-bean' | 'espresso' | 'filter' | 'french-press', or 'none' for
  -- capsules and machines, which cannot be ground.
  grind_type text not null
);


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

-- ── orders: guest checkout in, owner or admin out ───────────────────────────
drop policy if exists "Anyone can create an order"            on orders;
drop policy if exists "Users can view own orders"             on orders;
drop policy if exists "Admins can view all orders (dashboard)" on orders;
drop policy if exists "Admins can update orders"              on orders;

-- Guests insert with user_id null; logged-in customers only as themselves.
create policy "Anyone can create an order"
  on orders for insert to anon, authenticated
  with check (user_id is null or user_id = auth.uid());

create policy "Users can view own orders"
  on orders for select using (user_id = auth.uid());

create policy "Admins can view all orders (dashboard)"
  on orders for select using (is_admin());

create policy "Admins can update orders"
  on orders for update using (is_admin());

-- ── order_items: visibility follows the parent order ────────────────────────
drop policy if exists "Anyone can create order items"            on order_items;
drop policy if exists "Users and admins can view order items"    on order_items;

create policy "Anyone can create order items"
  on order_items for insert to anon, authenticated with check (true);

create policy "Users and admins can view order items"
  on order_items for select using (
    exists (
      select 1 from orders o
      where o.id = order_id
        and (o.user_id = auth.uid() or is_admin())
    )
  );

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


-- ============================================================================
-- 7. STORAGE — product / service images
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
