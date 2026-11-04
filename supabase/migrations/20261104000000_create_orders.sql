-- Server-side order records for Multi Achadinhos PIX checkout.
-- Run this migration in the Supabase SQL editor before enabling checkout.

create table if not exists public.orders (
  order_id uuid primary key,
  status text not null check (status in ('pending', 'processing', 'paid', 'failed', 'cancelled', 'expired')),
  amount_cents bigint not null check (amount_cents > 0),
  currency text not null default 'BRL',
  items jsonb not null,
  customer jsonb not null,
  provider_payment_id text unique,
  pix_code text,
  expires_at timestamptz,
  provider_status text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_status_created_at_idx
  on public.orders (status, created_at desc);

create index if not exists orders_provider_payment_id_idx
  on public.orders (provider_payment_id);

alter table public.orders enable row level security;

-- No anon/authenticated policies are created. Only the server-side service-role
-- key can read or write these records; never expose that key to the browser.
