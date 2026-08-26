-- Chambers table (astrologer creates their chambers)
CREATE TABLE IF NOT EXISTS chambers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  advance_amount INTEGER DEFAULT 200,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Available dates per chamber (astrologer sets which dates are open)
CREATE TABLE IF NOT EXISTS chamber_available_dates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chamber_id UUID REFERENCES chambers(id) ON DELETE CASCADE,
  available_date DATE NOT NULL,
  max_appointments INTEGER DEFAULT 10,
  is_blocked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(chamber_id, available_date)
);

-- Available time slots per chamber (astrologer sets working hours)
CREATE TABLE IF NOT EXISTS chamber_time_slots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chamber_id UUID REFERENCES chambers(id) ON DELETE CASCADE,
  slot_time TEXT NOT NULL,  -- e.g. "09:00", "09:30"
  is_active BOOLEAN DEFAULT true,
  UNIQUE(chamber_id, slot_time)
);

-- RLS: Astrologers can manage their own chambers
ALTER TABLE chambers ENABLE ROW LEVEL SECURITY;
ALTER TABLE chamber_available_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE chamber_time_slots ENABLE ROW LEVEL SECURITY;

-- Public can read active chambers and dates (for booking)
CREATE POLICY "Public read chambers" ON chambers FOR SELECT USING (is_active = true);
CREATE POLICY "Public read available dates" ON chamber_available_dates FOR SELECT USING (is_blocked = false);
CREATE POLICY "Public read time slots" ON chamber_time_slots FOR SELECT USING (is_active = true);

-- Authenticated users (astrologers) can manage their chambers
CREATE POLICY "Manage own chambers" ON chambers FOR ALL USING (tenant_id = auth.uid());
CREATE POLICY "Manage own dates" ON chamber_available_dates FOR ALL 
  USING (chamber_id IN (SELECT id FROM chambers WHERE tenant_id = auth.uid()));
CREATE POLICY "Manage own slots" ON chamber_time_slots FOR ALL 
  USING (chamber_id IN (SELECT id FROM chambers WHERE tenant_id = auth.uid()));
