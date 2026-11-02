-- Subway Studio · demo orders (cart checkout)
create table if not exists public.subway_orders (
  id uuid primary key default gen_random_uuid(),
  order_no text not null unique,
  customer text not null check (char_length(customer) between 1 and 40),
  phone text check (phone is null or char_length(phone) <= 24),
  pickup text not null default 'asap' check (pickup in ('asap','later')),
  items jsonb not null,
  item_count integer not null check (item_count between 1 and 50),
  subtotal numeric(10,2) not null check (subtotal >= 0),
  kcal integer not null default 0,
  status text not null default 'paid' check (status in ('paid','preparing','ready','collected')),
  payment text not null default 'demo',
  created_at timestamptz not null default now()
);
create index if not exists subway_orders_created_idx on public.subway_orders (created_at desc);
alter table public.subway_orders enable row level security;
drop policy if exists "anyone can place a demo order" on public.subway_orders;
create policy "anyone can place a demo order" on public.subway_orders
  for insert to anon, authenticated
  with check (jsonb_typeof(items) = 'array' and status = 'paid' and payment = 'demo');
drop policy if exists "orders are readable by order number" on public.subway_orders;
create policy "orders are readable by order number" on public.subway_orders
  for select to anon, authenticated using (true);
