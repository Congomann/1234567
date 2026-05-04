
-- NHFG Solutions Update Migration - 2026-05-04
-- Aligns database with current website solutions: Home Repair, Logistics, Insurance.

-- 1. ENHANCE LEADS TABLE
-- Add specific columns for new verticals to allow for cleaner data access
ALTER TABLE leads ADD COLUMN IF NOT EXISTS logistics_details JSONB DEFAULT '{}'::jsonb;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS home_repair_details JSONB DEFAULT '{}'::jsonb;

-- 2. LOGISTICS VERTICAL: LOADS TABLE
-- Supports the Load Board and Logistics lead management
CREATE TABLE IF NOT EXISTS logistics_loads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    origin VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    pickup_date DATE,
    delivery_date DATE,
    equipment_type VARCHAR(100),
    weight_lbs INT,
    rate_usd NUMERIC(12, 2),
    commodity VARCHAR(255),
    status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'booked', 'in_transit', 'delivered')),
    advisor_id UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. STORAGE SETUP: BUCKETS
-- Create buckets for public assets and private client documents
-- Note: These commands work if the 'storage' schema is enabled (standard in Supabase)

INSERT INTO storage.buckets (id, name, public) 
VALUES ('website-assets', 'website-assets', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('client-documents', 'client-documents', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('advisor-assets', 'advisor-assets', true)
ON CONFLICT (id) DO NOTHING;

-- 4. SECURITY POLICIES (RLS) for Storage
-- Allow public read for website-assets
CREATE POLICY "Public Read Access" ON storage.objects FOR SELECT USING (bucket_id = 'website-assets');

-- Allow authenticated users to upload to advisor-assets
CREATE POLICY "Advisor Upload" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'advisor-assets' AND auth.role() = 'authenticated'
);

-- 5. ANALYTICS ENHANCEMENT
-- Track leads by vertical more efficiently
CREATE OR REPLACE VIEW lead_distribution AS
SELECT 
    interest as vertical,
    count(*) as count,
    qualification
FROM leads
GROUP BY interest, qualification;
