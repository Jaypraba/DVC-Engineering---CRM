-- Travel Deals Finder — run this in the Supabase SQL editor (after db/schema.sql).

-- Saved deal alerts, scanned daily by /api/cron/travel-deals
CREATE TABLE IF NOT EXISTS travel_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID,
  label TEXT NOT NULL,
  origin TEXT NOT NULL,                    -- IATA code, e.g. LON
  destination TEXT,                        -- IATA code, NULL = anywhere
  earliest_departure DATE,
  latest_departure DATE,
  trip_length_days INT,
  max_price NUMERIC,                       -- GBP total price cap
  min_discount_pct INT DEFAULT 20,         -- notify when >= this % below typical
  cabin TEXT DEFAULT 'ECONOMY',
  adults INT DEFAULT 1,
  notify_email TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  last_run TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Every deal we have already notified about (dedupe + history)
CREATE TABLE IF NOT EXISTS travel_deal_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id UUID REFERENCES travel_alerts(id) ON DELETE CASCADE,
  dedupe_key TEXT NOT NULL,
  deal_type TEXT NOT NULL DEFAULT 'flight',  -- flight | hotel | clearance
  origin TEXT,
  destination TEXT,
  departure_date DATE,
  return_date DATE,
  price NUMERIC,
  currency TEXT DEFAULT 'GBP',
  typical_price NUMERIC,
  discount_pct INT,
  carrier TEXT,
  tier TEXT,                                 -- clearance | great | good | typical | unknown
  details JSONB DEFAULT '{}',
  found_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (alert_id, dedupe_key)
);

CREATE INDEX IF NOT EXISTS idx_travel_deal_log_alert ON travel_deal_log(alert_id, found_at DESC);
CREATE INDEX IF NOT EXISTS idx_travel_alerts_active ON travel_alerts(active);

ALTER TABLE travel_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_deal_log ENABLE ROW LEVEL SECURITY;
-- Service-role key bypasses RLS; no anon policies are defined on purpose.
