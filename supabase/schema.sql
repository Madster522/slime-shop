-- Slime Shop full updated schema
-- Paste this whole file into Supabase SQL Editor and run it.

create extension if not exists "pgcrypto";

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  price numeric(10,2) not null default 0 check (price >= 0),
  image_url text,
  category text,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  is_customizable boolean not null default false,
  customization_schema jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text,
  description text,
  type text not null check (type in ('percent', 'fixed')),
  value numeric(10,2) not null check (value > 0),
  min_order_amount numeric(10,2),
  max_discount_amount numeric(10,2),
  max_uses integer,
  used_count integer not null default 0,
  starts_at timestamptz,
  expires_at timestamptz,
  applies_to_shipping boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint percent_coupon_max check (type <> 'percent' or value <= 100)
);

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_email text,
  customer_name text,
  status text not null default 'pending',
  subtotal numeric(10,2) not null default 0,
  discount numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  coupon_code text,
  items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint order_total_not_negative check (total >= 0),
  constraint order_discount_safe check (discount >= 0 and discount <= subtotal)
);

insert into public.site_settings (key, value) values
('company', '{"company_name":"Slime Shop","tagline":"Custom 3D printed slime products","support_email":"","discord_url":"","business_hours":"Mon-Fri after school / evenings","announcement":""}'::jsonb),
('status', '{"store_online":true,"accepting_orders":true,"maintenance_mode":false,"maintenance_title":"Slime Shop is getting upgraded","maintenance_message":"We are updating the store. Please check back soon.","banner_enabled":true,"banner_message":"Slime Shop is online and accepting custom orders.","last_updated_by":"system"}'::jsonb)
on conflict (key) do nothing;

insert into public.products (name, slug, description, price, category, is_featured, is_customizable, customization_schema) values
('Custom Slime Keychain', 'custom-slime-keychain', 'A fun 3D printed slime keychain with optional custom color and name text.', 6.99, 'Accessories', true, true, '{"allow_text":true,"allow_color":true,"allow_size":false}'::jsonb),
('Desk Slime Figure', 'desk-slime-figure', 'A small collectible slime figure for desks, shelves, or gaming setups.', 12.50, 'Figures', true, false, '{}'::jsonb),
('Slime Name Plate', 'slime-name-plate', 'A personalized 3D printed name plate for your room or setup.', 14.99, 'Custom Prints', false, true, '{"allow_text":true,"allow_color":true,"allow_size":true}'::jsonb)
on conflict (slug) do nothing;

-- RLS is enabled for public safety. Server-side admin APIs use the Supabase service role key.
alter table public.products enable row level security;
alter table public.coupons enable row level security;
alter table public.site_settings enable row level security;
alter table public.orders enable row level security;

drop policy if exists "Public can read active products" on public.products;
create policy "Public can read active products" on public.products for select using (is_active = true);

drop policy if exists "Public can read site settings" on public.site_settings;
create policy "Public can read site settings" on public.site_settings for select using (true);
