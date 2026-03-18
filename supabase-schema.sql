-- profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz default now(),
  plan text default 'free'
);

-- products
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  url text not null,
  normalized_url text not null unique,
  domain text not null,
  retailer text not null,
  name text,
  image_url text,
  currency text,
  last_price numeric,
  last_checked_at timestamptz
);

create index if not exists products_normalized_url_idx on public.products (normalized_url);

-- trackers
create table if not exists public.trackers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  product_id uuid not null references public.products (id) on delete cascade,
  user_id uuid references public.profiles (id) on delete set null,
  email text not null,
  target_price numeric not null,
  active boolean not null default true,
  notify_on_first_drop boolean not null default true,
  consecutive_failures integer not null default 0,
  paused_reason text,
  preferred_currency text
);

create index if not exists trackers_email_idx on public.trackers (email);
create index if not exists trackers_user_id_idx on public.trackers (user_id);
create index if not exists trackers_product_id_idx on public.trackers (product_id);

create unique index if not exists trackers_unique_per_email_product_target
  on public.trackers (product_id, email, target_price);

-- price history
create table if not exists public.price_points (
  id bigserial primary key,
  created_at timestamptz default now(),
  product_id uuid not null references public.products (id) on delete cascade,
  price numeric not null
);

create index if not exists price_points_product_time_idx
  on public.price_points (product_id, created_at desc);

