-- Feature expansion: merchandising, reviews, inquiries, newsletter,
-- customer accounts (order history) and a proper admin role.
--
-- Context: until now every authenticated user was implicitly an admin.
-- Public customer registration is being introduced, so admin rights move
-- to an explicit admin_users table and all write policies are tightened.

-- =========================================================
-- 1. PRODUCTS: merchandising columns
-- =========================================================
alter table products add column if not exists sale_price decimal(10,2) check (sale_price is null or sale_price >= 0);
alter table products add column if not exists is_new boolean default false;

-- =========================================================
-- 2. ADMIN ROLE
-- =========================================================
create table if not exists admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);

alter table admin_users enable row level security;

create or replace function is_admin()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (select 1 from admin_users where user_id = auth.uid())
$$;

create policy "Users can view own admin row"
on admin_users for select
using (user_id = auth.uid());

-- Bootstrap: every existing auth user becomes an admin (before this
-- migration only staff had accounts). New signups are customers.
insert into admin_users (user_id)
select id from auth.users
on conflict do nothing;

-- =========================================================
-- 3. TIGHTEN WRITE POLICIES (authenticated -> admin)
-- =========================================================
-- Products
drop policy if exists "Enable insert for authenticated users only" on products;
drop policy if exists "Enable update for authenticated users only" on products;
drop policy if exists "Enable delete for authenticated users only" on products;
create policy "Admins can insert products" on products for insert with check (is_admin());
create policy "Admins can update products" on products for update using (is_admin());
create policy "Admins can delete products" on products for delete using (is_admin());

-- Product flavors
drop policy if exists "Enable insert for authenticated users only" on product_flavors;
drop policy if exists "Enable update for authenticated users only" on product_flavors;
drop policy if exists "Enable delete for authenticated users only" on product_flavors;
create policy "Admins can insert flavors" on product_flavors for insert with check (is_admin());
create policy "Admins can update flavors" on product_flavors for update using (is_admin());
create policy "Admins can delete flavors" on product_flavors for delete using (is_admin());

-- Services
drop policy if exists "Enable insert for authenticated users only" on services;
drop policy if exists "Enable update for authenticated users only" on services;
drop policy if exists "Enable delete for authenticated users only" on services;
create policy "Admins can insert services" on services for insert with check (is_admin());
create policy "Admins can update services" on services for update using (is_admin());
create policy "Admins can delete services" on services for delete using (is_admin());

-- Storage (product images)
drop policy if exists "Authenticated Insert Access" on storage.objects;
drop policy if exists "Authenticated Update Access" on storage.objects;
drop policy if exists "Authenticated Delete Access" on storage.objects;
create policy "Admin Insert Access" on storage.objects for insert with check (bucket_id = 'products' and is_admin());
create policy "Admin Update Access" on storage.objects for update using (bucket_id = 'products' and is_admin());
create policy "Admin Delete Access" on storage.objects for delete using (bucket_id = 'products' and is_admin());

-- =========================================================
-- 4. ORDERS: customer accounts + payment info + admin access
-- =========================================================
alter table orders add column if not exists user_id uuid references auth.users(id);
alter table orders add column if not exists payment_info jsonb;
create index if not exists orders_user_id_idx on orders(user_id);

-- Guests insert with user_id null; logged-in customers only as themselves.
drop policy if exists "Anyone can create an order" on orders;
create policy "Anyone can create an order"
on orders for insert
to anon, authenticated
with check (user_id is null or user_id = auth.uid());

create policy "Users can view own orders"
on orders for select
using (user_id = auth.uid());

create policy "Admins can view all orders (dashboard)"
on orders for select
using (is_admin());

create policy "Admins can update orders"
on orders for update
using (is_admin());

create policy "Users and admins can view order items"
on order_items for select
using (
  exists (
    select 1 from orders o
    where o.id = order_id
      and (o.user_id = auth.uid() or is_admin())
  )
);

-- =========================================================
-- 5. REVIEWS
-- =========================================================
create table if not exists reviews (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references products(id) on delete cascade not null,
  author_name text not null,
  rating int2 not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now()
);
create index if not exists reviews_product_id_idx on reviews(product_id);

alter table reviews enable row level security;

create policy "Reviews are viewable by everyone" on reviews for select using (true);
create policy "Anyone can create a review" on reviews for insert to anon, authenticated with check (true);
create policy "Admins can delete reviews" on reviews for delete using (is_admin());

-- =========================================================
-- 6. INQUIRIES (contact form, B2B/wholesale, subscription requests)
-- =========================================================
create table if not exists inquiries (
  id uuid primary key default uuid_generate_v4(),
  type text not null check (type in ('contact', 'b2b', 'subscription')),
  name text not null,
  company text,
  email text not null,
  phone text,
  message text,
  details jsonb,
  status text default 'new' check (status in ('new', 'in_progress', 'closed')),
  created_at timestamptz default now()
);

alter table inquiries enable row level security;

create policy "Anyone can create an inquiry" on inquiries for insert to anon, authenticated with check (true);
create policy "Admins can view inquiries" on inquiries for select using (is_admin());
create policy "Admins can update inquiries" on inquiries for update using (is_admin());

-- =========================================================
-- 7. NEWSLETTER
-- =========================================================
create table if not exists newsletter_subscribers (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  created_at timestamptz default now()
);

alter table newsletter_subscribers enable row level security;

create policy "Anyone can subscribe" on newsletter_subscribers for insert to anon, authenticated with check (true);
create policy "Admins can view subscribers" on newsletter_subscribers for select using (is_admin());
