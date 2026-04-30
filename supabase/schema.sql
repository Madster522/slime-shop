-- =====================================================
-- SLIME SHOP — COMPLETE SCHEMA
-- Run in Supabase SQL Editor (replaces everything)
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP TABLE IF EXISTS bug_reports         CASCADE;
DROP TABLE IF EXISTS ai_alerts           CASCADE;
DROP TABLE IF EXISTS print_jobs          CASCADE;
DROP TABLE IF EXISTS printers            CASCADE;
DROP TABLE IF EXISTS order_status_history CASCADE;
DROP TABLE IF EXISTS order_items         CASCADE;
DROP TABLE IF EXISTS orders              CASCADE;
DROP TABLE IF EXISTS products            CASCADE;
DROP TABLE IF EXISTS profiles            CASCADE;

-- ── Profiles ─────────────────────────────────────────
CREATE TABLE profiles (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email      TEXT UNIQUE NOT NULL,
  name       TEXT,
  avatar_url TEXT,
  is_admin   BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Products ─────────────────────────────────────────
CREATE TABLE products (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                    TEXT NOT NULL,
  slug                    TEXT UNIQUE NOT NULL,
  description             TEXT DEFAULT '',
  price                   NUMERIC(10,2) NOT NULL,
  shipping_price          NUMERIC(10,2) DEFAULT 4.00,
  images                  TEXT[] DEFAULT '{}',
  category                TEXT DEFAULT 'General',
  stock_status            TEXT DEFAULT 'made_to_order' CHECK (stock_status IN ('in_stock','out_of_stock','made_to_order')),
  is_active               BOOLEAN DEFAULT TRUE,
  is_featured             BOOLEAN DEFAULT FALSE,
  has_customization       BOOLEAN DEFAULT FALSE,
  customization_options   JSONB DEFAULT '[]',
  estimated_print_minutes INTEGER DEFAULT 60,
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- ── Orders ───────────────────────────────────────────
CREATE TABLE orders (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number     TEXT UNIQUE NOT NULL,
  customer_email   TEXT NOT NULL,
  customer_name    TEXT NOT NULL,
  status           TEXT DEFAULT 'Pending',
  shipping_address JSONB NOT NULL,
  billing_address  JSONB,
  subtotal         NUMERIC(10,2) NOT NULL DEFAULT 0,
  shipping_total   NUMERIC(10,2) NOT NULL DEFAULT 0,
  total            NUMERIC(10,2) NOT NULL DEFAULT 0,
  tracking_number  TEXT,
  carrier          TEXT,
  estimated_delivery DATE,
  delay_reason     TEXT,
  internal_notes   TEXT,
  payment_status   TEXT DEFAULT 'pending',
  card_last4       TEXT,
  card_brand       TEXT,
  square_payment_id TEXT,
  square_receipt_url TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ── Order Items ──────────────────────────────────────
CREATE TABLE order_items (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id      UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id    UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name  TEXT NOT NULL,
  quantity      INTEGER NOT NULL DEFAULT 1,
  unit_price    NUMERIC(10,2) NOT NULL,
  shipping_price NUMERIC(10,2) DEFAULT 0,
  customization JSONB DEFAULT '{}'
);

-- ── Order Status History ─────────────────────────────
CREATE TABLE order_status_history (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id      UUID REFERENCES orders(id) ON DELETE CASCADE,
  status        TEXT NOT NULL,
  note          TEXT,
  internal_note TEXT,
  changed_by    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Printers ─────────────────────────────────────────
CREATE TABLE printers (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  type            TEXT DEFAULT 'FDM',
  connection_type TEXT NOT NULL DEFAULT 'usb',
  ip_address      TEXT,
  port            INTEGER DEFAULT 80,
  api_key         TEXT,
  access_code     TEXT,
  serial_number   TEXT,
  status          TEXT DEFAULT 'unknown',
  is_active       BOOLEAN DEFAULT TRUE,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Print Jobs ───────────────────────────────────────
CREATE TABLE print_jobs (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id         UUID REFERENCES orders(id) ON DELETE SET NULL,
  printer_id       UUID REFERENCES printers(id) ON DELETE SET NULL,
  product_name     TEXT NOT NULL,
  customization    JSONB DEFAULT '{}',
  status           TEXT DEFAULT 'waiting',
  queue_position   INTEGER,
  started_at       TIMESTAMPTZ,
  completed_at     TIMESTAMPTZ,
  estimated_minutes INTEGER DEFAULT 60,
  failure_reason   TEXT,
  retry_count      INTEGER DEFAULT 0,
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ── AI / System Alerts ───────────────────────────────
CREATE TABLE ai_alerts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  printer_id      UUID REFERENCES printers(id) ON DELETE CASCADE,
  type            TEXT NOT NULL,
  severity        TEXT DEFAULT 'medium',
  message         TEXT NOT NULL,
  suggestion      TEXT,
  acknowledged    BOOLEAN DEFAULT FALSE,
  acknowledged_by TEXT,
  acknowledged_at TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Bug Reports ──────────────────────────────────────
CREATE TABLE bug_reports (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title               TEXT NOT NULL,
  description         TEXT NOT NULL,
  severity            TEXT DEFAULT 'medium' CHECK (severity IN ('low','medium','high','critical')),
  category            TEXT DEFAULT 'general',
  status              TEXT DEFAULT 'open' CHECK (status IN ('open','in_progress','fixed','wont_fix')),
  reported_by         TEXT NOT NULL,
  page_url            TEXT,
  steps_to_reproduce  TEXT,
  expected_behavior   TEXT,
  actual_behavior     TEXT,
  fixed_by            TEXT,
  fixed_at            TIMESTAMPTZ,
  fix_notes           TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ── Indexes ──────────────────────────────────────────
CREATE INDEX idx_products_active    ON products(is_active);
CREATE INDEX idx_products_slug      ON products(slug);
CREATE INDEX idx_products_category  ON products(category);
CREATE INDEX idx_products_featured  ON products(is_featured);
CREATE INDEX idx_orders_email       ON orders(customer_email);
CREATE INDEX idx_orders_status      ON orders(status);
CREATE INDEX idx_orders_created     ON orders(created_at DESC);
CREATE INDEX idx_order_items_order  ON order_items(order_id);
CREATE INDEX idx_print_jobs_status  ON print_jobs(status);

-- ── Row Level Security ───────────────────────────────
ALTER TABLE profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE products          ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders            ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items       ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE printers          ENABLE ROW LEVEL SECURITY;
ALTER TABLE print_jobs        ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_alerts         ENABLE ROW LEVEL SECURITY;
ALTER TABLE bug_reports       ENABLE ROW LEVEL SECURITY;

-- Public: active products only
CREATE POLICY "Public read active products"
  ON products FOR SELECT USING (is_active = TRUE);

-- Users see their own orders
CREATE POLICY "Users see own orders"
  ON orders FOR SELECT
  USING (customer_email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Users see own order items"
  ON order_items FOR SELECT
  USING (order_id IN (
    SELECT id FROM orders
    WHERE customer_email = current_setting('request.jwt.claims', true)::json->>'email'
  ));

CREATE POLICY "Users see own order history"
  ON order_status_history FOR SELECT
  USING (order_id IN (
    SELECT id FROM orders
    WHERE customer_email = current_setting('request.jwt.claims', true)::json->>'email'
  ));

-- Service role bypasses RLS (backend API uses service role)

-- =============================================
-- NEW TABLES: Coupons, Reviews, Contact, Newsletter
-- Add these to your existing schema
-- =============================================

CREATE TABLE IF NOT EXISTS coupons (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code                TEXT UNIQUE NOT NULL,
  type                TEXT NOT NULL CHECK (type IN ('percent','fixed')),
  value               NUMERIC(10,2) NOT NULL,
  min_order_amount    NUMERIC(10,2),
  max_discount_amount NUMERIC(10,2),
  max_uses            INTEGER,
  used_count          INTEGER DEFAULT 0,
  is_active           BOOLEAN DEFAULT TRUE,
  description         TEXT,
  expires_at          TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reviews (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id     UUID REFERENCES products(id) ON DELETE CASCADE,
  rating         INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title          TEXT,
  body           TEXT,
  reviewer_name  TEXT NOT NULL,
  reviewer_email TEXT NOT NULL,
  is_approved    BOOLEAN DEFAULT FALSE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT NOT NULL,
  email        TEXT NOT NULL,
  subject      TEXT DEFAULT 'General Inquiry',
  message      TEXT NOT NULL,
  order_number TEXT,
  is_read      BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email          TEXT UNIQUE NOT NULL,
  subscribed_at  TIMESTAMPTZ DEFAULT NOW(),
  is_active      BOOLEAN DEFAULT TRUE
);

-- Add square_payment_id & coupon fields to orders if not already present
ALTER TABLE orders ADD COLUMN IF NOT EXISTS square_payment_id  TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS square_receipt_url TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_id          UUID REFERENCES coupons(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount           NUMERIC(10,2) DEFAULT 0;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_reviews_product    ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_approved   ON reviews(is_approved);
CREATE INDEX IF NOT EXISTS idx_coupons_code       ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active     ON coupons(is_active);
