-- Subway Studio · schema, seed, like RPC, realtime
-- Run this in the Supabase SQL editor of the project you use for the app.
create table if not exists public.subway_ingredients (
  id text primary key,
  "group" text not null check ("group" in ('bread','protein','veggie','sauce')),
  name_zh text not null,
  name_en text not null,
  kcal integer not null default 0,
  protein numeric(6,1) not null default 0,
  carbs numeric(6,1) not null default 0,
  fat numeric(6,1) not null default 0,
  sodium integer not null default 0,
  price numeric(8,2) not null default 0,
  max_qty integer not null default 1,
  sort integer not null default 0,
  is_active boolean not null default true
);

create table if not exists public.subway_creations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 30),
  author text not null default '匿名主厨' check (char_length(author) <= 24),
  bread text not null references public.subway_ingredients(id),
  size smallint not null default 6 check (size in (6,12)),
  toasted boolean not null default false,
  items jsonb not null default '[]'::jsonb,
  kcal integer not null default 0,
  protein numeric(6,1) not null default 0,
  carbs numeric(6,1) not null default 0,
  fat numeric(6,1) not null default 0,
  price numeric(8,2) not null default 0,
  likes integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists subway_creations_created_idx on public.subway_creations (created_at desc);
create index if not exists subway_creations_likes_idx on public.subway_creations (likes desc);

alter table public.subway_ingredients enable row level security;
alter table public.subway_creations enable row level security;

drop policy if exists "subway ingredients are public" on public.subway_ingredients;
create policy "subway ingredients are public" on public.subway_ingredients
  for select to anon, authenticated using (true);

drop policy if exists "subway creations are public" on public.subway_creations;
create policy "subway creations are public" on public.subway_creations
  for select to anon, authenticated using (true);

drop policy if exists "anyone can share a creation" on public.subway_creations;
create policy "anyone can share a creation" on public.subway_creations
  for insert to anon, authenticated
  with check (
    jsonb_typeof(items) = 'array'
    and jsonb_array_length(items) <= 32
    and kcal between 0 and 6000
    and likes = 0
  );

create or replace function public.subway_like(creation_id uuid)
returns integer
language sql
security definer
set search_path = public
as $$
  update public.subway_creations
  set likes = likes + 1
  where id = creation_id
  returning likes;
$$;
revoke all on function public.subway_like(uuid) from public;
grant execute on function public.subway_like(uuid) to anon, authenticated;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'subway_creations'
  ) then
    alter publication supabase_realtime add table public.subway_creations;
  end if;
end $$;

insert into public.subway_ingredients (id, "group", name_zh, name_en, kcal, protein, carbs, fat, sodium, price, max_qty, sort) values
  ('italian',  'bread',   '意式白面包',   'ITALIAN WHITE',    200,  7, 38, 2,   360, 18, 1, 0),
  ('wheat',    'bread',   '全麦面包',     'WHOLE WHEAT',      210,  8, 40, 2.5, 330, 18, 1, 1),
  ('herbs',    'bread',   '香草芝士面包', 'HERBS & CHEESE',   240,  9, 40, 5,   470, 20, 1, 2),
  ('grain',    'bread',   '多谷物面包',   'MULTIGRAIN',       210,  8, 39, 2.5, 350, 20, 1, 3),
  ('turkey',   'protein', '烟熏火鸡胸',   'SMOKED TURKEY',     50,  9,  1, 1,   480,  6, 2, 10),
  ('chicken',  'protein', '香烤鸡胸',     'GRILLED CHICKEN',  110, 19,  2, 3,   330,  8, 2, 11),
  ('beef',     'protein', '经典烤牛肉',   'ROAST BEEF',        70, 12,  1, 2,   420, 10, 2, 12),
  ('cheese',   'protein', '切达芝士',     'CHEDDAR CHEESE',    60,  4,  0, 5,   100,  3, 2, 13),
  ('lettuce',  'veggie',  '脆嫩生菜',     'CRISP LETTUCE',      5,  0,  1, 0,     5,  0, 3, 20),
  ('tomato',   'veggie',  '鲜切番茄',     'RIPE TOMATO',       10,  0,  2, 0,     5,  0, 3, 21),
  ('cucumber', 'veggie',  '清脆黄瓜',     'CUCUMBER',           3,  0,  1, 0,     0,  0, 3, 22),
  ('onion',    'veggie',  '紫洋葱',       'RED ONION',          5,  0,  1, 0,     0,  0, 3, 23),
  ('olive',    'veggie',  '黑橄榄',       'BLACK OLIVES',      15,  0,  1, 1.5, 120,  0, 3, 24),
  ('pepper',   'veggie',  '甜青椒',       'GREEN PEPPER',       3,  0,  1, 0,     0,  0, 3, 25),
  ('mayo',     'sauce',   '经典蛋黄酱',   'CREAMY MAYO',      110,  0,  0, 12,   90,  0, 3, 30),
  ('mustard',  'sauce',   '蜂蜜芥末酱',   'HONEY MUSTARD',     30,  0,  7, 0,   120,  0, 3, 31),
  ('bbq',      'sauce',   '烟熏烧烤酱',   'SMOKY BBQ',         35,  0,  8, 0,   200,  0, 3, 32),
  ('chili',    'sauce',   '甜辣酱',       'SWEET CHILI',       40,  0, 10, 0,   150,  0, 3, 33)
on conflict (id) do nothing;
