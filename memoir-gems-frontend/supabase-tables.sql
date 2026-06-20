-- ─────────────────────────────────────────────────────────────────────────────
-- Memoir Gems — New tables required by the frontend API routes
-- Run this in Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Contact form messages  (/api/contact)
CREATE TABLE IF NOT EXISTS contact_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  subject     TEXT,
  message     TEXT NOT NULL,
  type        TEXT DEFAULT 'contact',  -- 'contact' | 'b2b' | 'order'
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Newsletter subscribers  (/api/newsletter)
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email        TEXT UNIQUE NOT NULL,
  subscribed   BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Order requests  (/api/order)
CREATE TABLE IF NOT EXISTS order_requests (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number   TEXT UNIQUE NOT NULL,  -- format: MG-XXXXXXXX
  customer_name  TEXT NOT NULL,
  email          TEXT NOT NULL,
  phone          TEXT,
  product_id     TEXT NOT NULL,
  product_name   TEXT NOT NULL,
  quantity       INTEGER NOT NULL DEFAULT 1,
  total_price    NUMERIC(10,2) NOT NULL,
  payment_method TEXT NOT NULL,  -- 'paypal' | 'card' | 'venmo' | 'zelle'
  special_notes  TEXT,
  status         TEXT DEFAULT 'pending',  -- 'pending' | 'confirmed' | 'production' | 'shipped' | 'delivered'
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Row Level Security — enable but allow service role full access
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_requests ENABLE ROW LEVEL SECURITY;

-- Allow anon inserts (frontend uses anon key for these writes)
CREATE POLICY "allow_anon_insert_contact" ON contact_messages
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "allow_anon_insert_newsletter" ON newsletter_subscribers
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "allow_anon_upsert_newsletter" ON newsletter_subscribers
  FOR UPDATE TO anon USING (true);

CREATE POLICY "allow_anon_insert_orders" ON order_requests
  FOR INSERT TO anon WITH CHECK (true);

-- Service role can read/update everything (for admin backend)
CREATE POLICY "service_role_all_contact" ON contact_messages
  FOR ALL TO service_role USING (true);

CREATE POLICY "service_role_all_newsletter" ON newsletter_subscribers
  FOR ALL TO service_role USING (true);

CREATE POLICY "service_role_all_orders" ON order_requests
  FOR ALL TO service_role USING (true);
