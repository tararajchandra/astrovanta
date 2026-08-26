-- Fix Appointments RLS to allow public/customer inserts
DROP POLICY IF EXISTS "Tenant Isolation for Appointments" ON appointments;

-- Allow anyone to insert an appointment (since customers book it)
CREATE POLICY "Public insert appointments" ON appointments FOR INSERT WITH CHECK (true);

-- Allow astrologers to see appointments for their chambers 
-- (where tenant_id = their auth.uid() since chambers uses auth.uid() as tenant_id)
CREATE POLICY "Astrologer read appointments" ON appointments FOR SELECT USING (tenant_id = auth.uid() OR customer_id = auth.uid());

-- Fix Consultations RLS
DROP POLICY IF EXISTS "Tenant Isolation for Consultations" ON consultations;
CREATE POLICY "Astrologer manage consultations" ON consultations FOR ALL USING (tenant_id = auth.uid());
