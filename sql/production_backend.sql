create extension if not exists pgcrypto;

alter table orders
  add column if not exists payment_status text default 'test_unpaid',
  add column if not exists public_status text default 'order_received',
  add column if not exists production_notes text;

alter table order_photos
  add column if not exists approved_for_print boolean default false,
  add column if not exists batch_id uuid;

create table if not exists production_batches (
  id uuid primary key default gen_random_uuid(),
  batch_number text unique,
  batch_status text,
  total_orders integer,
  total_photos integer,
  total_sheets integer,
  photo_paper_needed integer,
  held_photos integer,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists production_batch_items (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid references production_batches(id),
  order_id uuid,
  order_number text,
  order_code text,
  customer_name text,
  photo_id uuid,
  photo_url text,
  photo_name text,
  sheet_number integer,
  slot_number integer,
  priority text,
  symbol text,
  group_color text,
  item_status text,
  created_at timestamptz default now()
);

create index if not exists production_batch_items_batch_id_idx
  on production_batch_items(batch_id);

create index if not exists production_batch_items_sheet_slot_idx
  on production_batch_items(batch_id, sheet_number, slot_number);

create index if not exists order_photos_batch_id_idx
  on order_photos(batch_id);

-- RLS policies: allow all operations for the anon (publishable) role
-- These tables are internal production backend — not customer-facing.
-- Without these policies, the publishable key cannot read or write
-- production_batches or production_batch_items, causing silent failures.
do $$ begin
  if not exists (select 1 from pg_policies where tablename='production_batches' and policyname='anon_all') then
    execute 'create policy anon_all on production_batches for all to anon using (true) with check (true)';
  end if;
  if not exists (select 1 from pg_policies where tablename='production_batch_items' and policyname='anon_all') then
    execute 'create policy anon_all on production_batch_items for all to anon using (true) with check (true)';
  end if;
end $$;

