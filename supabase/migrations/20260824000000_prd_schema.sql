-- 5. Plans and Subscriptions
CREATE TABLE plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    features JSONB NOT NULL DEFAULT '{}'
);
-- Plans are readable by all authenticated users
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Plans are globally readable" ON plans FOR SELECT USING (true);

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES plans(id),
    status VARCHAR(50) NOT NULL, -- active, suspended
    valid_until TIMESTAMP WITH TIME ZONE
);
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant Isolation for Subscriptions" ON subscriptions FOR ALL USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

-- 6. Consultations (CRM extension)
CREATE TABLE consultations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
    astrologer_id UUID REFERENCES profiles(id),
    private_notes TEXT, -- NEVER visible to customers
    client_visible_notes TEXT,
    recommendations TEXT,
    status VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
-- Astrologers and Staff can see consultations.
CREATE POLICY "Tenant Isolation for Consultations" ON consultations FOR ALL USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

-- 7. Sync Queue (For Offline-First Support)
CREATE TABLE sync_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    operation VARCHAR(20) NOT NULL, -- CREATE, UPDATE, DELETE
    device_id VARCHAR(255),
    payload JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE sync_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant Isolation for Sync Queue" ON sync_queue FOR ALL USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

-- Add missing fields to customers if any
ALTER TABLE customers ADD COLUMN IF NOT EXISTS latitude NUMERIC(10, 6);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS longitude NUMERIC(10, 6);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS timezone VARCHAR(50);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Add missing fields to appointments
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'ONLINE';
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Trigger to auto-update 'updated_at'
CREATE OR REPLACE FUNCTION update_modified_column() 
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$ language 'plpgsql';

CREATE TRIGGER update_customers_modtime BEFORE UPDATE ON customers FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_appointments_modtime BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_consultations_modtime BEFORE UPDATE ON consultations FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
