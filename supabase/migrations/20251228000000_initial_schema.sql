-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PRODUCTS TABLE
create table products (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name_bg text not null,
  name_en text,
  description_bg text,
  description_en text,
  price decimal(10,2) not null,
  in_stock boolean default true,
  featured boolean default false,
  category text not null,
  roast_level int2 check (roast_level between 1 and 5),
  origin text,
  process text,
  weight_grams int default 250,
  created_at timestamptz default now()
);

-- 2. PRODUCT FLAVORS (Simplified Junction)
create table product_flavors (
    id uuid primary key default uuid_generate_v4(),
    product_id uuid references products(id) on delete cascade not null,
    flavor_name_bg text not null,
    flavor_name_en text
);

-- 3. ORDERS TABLE
create table orders (
  id uuid primary key default uuid_generate_v4(),
  order_number text unique not null,
  status text check (status in ('pending', 'processing', 'shipped', 'delivered', 'cancelled')) default 'pending',
  subtotal decimal(10,2) not null,
  delivery_fee decimal(10,2) not null,
  total decimal(10,2) not null,
  client_info jsonb not null,
  delivery_info jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. ORDER ITEMS
create table order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references orders(id) on delete cascade not null,
  product_id uuid references products(id),
  quantity int not null check (quantity > 0),
  unit_price decimal(10,2) not null,
  grind_type text not null
);

-- ENABLE RLS
alter table products enable row level security;
alter table product_flavors enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- POLICIES

-- Products: Public Read, Admin Write
create policy "Products are viewable by everyone" 
on products for select 
using (true);

create policy "Products are insertable only by admin" 
on products for insert 
to service_role 
with check (true);

create policy "Products are updateable only by admin" 
on products for update 
to service_role 
using (true);

-- Product Flavors: Public Read, Admin Write
create policy "Flavors are viewable by everyone" 
on product_flavors for select 
using (true);

-- Orders: Public Insert (Guest Checkout), Admin Read/Write details
-- Only allow inserting if you are creating it (essentially open for anon)
create policy "Anyone can create an order" 
on orders for insert 
to anon, authenticated 
with check (true);

-- No public select policy for orders as it contains PII. 
-- However, we might want to allow users to read their own order via a secure token or similar, 
-- but for now, we rely on the implementation where the API returns the created object 
-- and the frontend stores it in memory/localstorage for the success page.
-- Admin can read all.
create policy "Admins can view all orders" 
on orders for select 
to service_role 
using (true);

-- Order Items: Synced with order access
create policy "Anyone can create order items" 
on order_items for insert 
to anon, authenticated 
with check (true);

create policy "Admins can view all order items" 
on order_items for select 
to service_role 
using (true);
