-- Adds real pricing/cost tracking to each order, so weekly sales reports
-- have actual revenue/profit data to pull from instead of a manual sheet.
-- Safe to re-run (idempotent).

alter table orders add column if not exists unit_price numeric;
alter table orders add column if not exists unit_cost numeric;
alter table orders add column if not exists total_price numeric;
alter table orders add column if not exists total_cost numeric;

comment on column orders.unit_price is 'Selling price per piece/magnet, set from the Pricing Calculator.';
comment on column orders.unit_cost is 'Material+labor cost per piece, set from the Pricing Calculator.';
comment on column orders.total_price is 'Total amount charged for this order (revenue) = unit_price x qty.';
comment on column orders.total_cost is 'Total material+labor cost for this order = unit_cost x qty.';
