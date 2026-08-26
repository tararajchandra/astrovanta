-- Consultations Table
CREATE TABLE consultations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
    astrologer_id UUID NOT NULL REFERENCES profiles(id),
    
    date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    consultation_type VARCHAR(50), 
    topic VARCHAR(255),
    
    private_notes TEXT, 
    client_visible_notes TEXT,
    recommendations TEXT,
    
    follow_up_date DATE,
    status VARCHAR(50) DEFAULT 'DRAFT'
);

ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;

-- Strict RLS: Only Astrologers/Staff of this tenant can access private_notes (and the whole record for now)
-- When we build a customer portal, we will grant customers access ONLY if we select specific columns.
CREATE POLICY "Tenant Isolation for Consultations" 
ON consultations 
FOR ALL 
USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));
