-- Memoir Gems — Material Inventory
-- ─────────────────────────────────────────────────────────────────────────────
-- Tracks real on-hand quantities for everything production consumes:
--   - Photo paper, per active format (2x2, 2.5x2.5, 3x3, 2.5x3.5, 3x2)
--   - Shared components: magnet shells, mylar laminate, magnet backing ("magnetos")
--
-- Replaces the old in-memory-only DEFAULT_STOCK in app/admin/inventory/page.tsx,
-- which reset to hardcoded numbers on every page load and had no shell/mylar/
-- magnet tracking at all.
-- ─────────────────────────────────────────────────────────────────────────────

create extension if not exists pgcrypto;

create table if not exists material_inventory (
  id uuid primary key default gen_random_uuid(),
  material_key text unique not null,
  material_label text not null,
  category text not null default 'paper',   -- 'paper' | 'component'
  unit text not null default 'sheet',       -- 'sheet' | 'ream' | 'unit' | 'roll'
  quantity_on_hand numeric not null default 0,
  reorder_threshold numeric default 50,
  notes text,
  updated_at timestamptz default now()
);

-- Seed rows — safe to re-run, only inserts missing keys, never overwrites
-- a quantity you've already entered.
insert into material_inventory (material_key, material_label, category, unit, quantity_on_hand, reorder_threshold)
values
  ('paper_2x2',      '2x2 Photo Paper (sheets)',      'paper',     'sheet', 0, 50),
  ('paper_2.5x2.5',  '2.5x2.5 Photo Paper (sheets)',  'paper',     'sheet', 0, 50),
  ('paper_3x3',      '3x3 Photo Paper (sheets)',      'paper',     'sheet', 0, 50),
  ('paper_2.5x3.5',  '2.5x3.5 Photo Paper (sheets)',  'paper',     'sheet', 0, 50),
  ('paper_3x2',      '3x2 Photo Paper (sheets)',      'paper',     'sheet', 0, 50),
  ('shell',          'Magnet Shells',                  'component', 'unit',  0, 200),
  ('mylar',          'Mylar Laminate',                 'component', 'sheet', 0, 200),
  ('magnet_backing', 'Magnet Backing (Magnetos)',      'component', 'unit',  0, 200)
on conflict (material_key) do nothing;

create index if not exists material_inventory_category_idx on material_inventory(category);

-- RLS: same pattern as production_batches/production_batch_items — internal
-- backend table, not customer-facing, so the publishable key needs full CRUD.
alter table material_inventory enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='material_inventory' and policyname='anon_all') then
    execute 'create policy anon_all on material_inventory for all to anon using (true) with check (true)';
  end if;
end $$;

-- Reorder thresholds (safe to re-run):
--   Paper is tracked in REAMS (500 sheets/ream) — flag low stock at 10 reams left.
--   Shared components (shell/mylar/magnet backing) — flag low stock at 300 units left.
update material_inventory set unit = 'ream', reorder_threshold = 10  where category = 'paper';
update material_inventory set reorder_threshold = 300 where category = 'component';

-- All formats print on the same physical paper (8.5x11 Photo Paper) — only the
-- die-cut template differs. There's one shared paper pool, not one per format.
-- Replace the 5 per-format paper rows with a single combined row.
insert into material_inventory (material_key, material_label, category, unit, quantity_on_hand, reorder_threshold)
values ('paper_8.5x11', '8.5x11 Photo Paper (all formats)', 'paper', 'ream', 0, 10)
on conflict (material_key) do nothing;

delete from material_inventory
  where material_key in ('paper_2x2', 'paper_2.5x2.5', 'paper_3x3', 'paper_2.5x3.5', 'paper_3x2');

-- Printer ink cartridges. Tracked as small whole-number counts (how many
-- cartridges you have on the shelf), not volume/percentage. Red once you're
-- down to your last spare (fewer than 2 left).
insert into material_inventory (material_key, material_label, category, unit, quantity_on_hand, reorder_threshold)
values
  ('ink_black',  'Ink — Black',  'ink', 'cartridge', 0, 2),
  ('ink_blue',   'Ink — Blue',   'ink', 'cartridge', 0, 2),
  ('ink_red',    'Ink — Red',    'ink', 'cartridge', 0, 2),
  ('ink_yellow', 'Ink — Yellow', 'ink', 'cartridge', 0, 2)
on conflict (material_key) do nothing;
