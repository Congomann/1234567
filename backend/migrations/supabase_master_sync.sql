
-- NHFG MASTER SYNCHRONIZATION SCRIPT - 2026-05-04
-- Ensures Supabase Database & Storage are 100% in sync with all current verticals.

-- 0. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CORE IDENTITY & ONBOARDING
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    category VARCHAR(50) DEFAULT 'Insurance & General',
    onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    permissions JSONB DEFAULT '[]'::jsonb
);

CREATE TABLE IF NOT EXISTS advisor_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    personal_email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    license_info TEXT,
    experience TEXT,
    address TEXT,
    status VARCHAR(50) DEFAULT 'pending_approval',
    resume_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CRM & LEADS (Multi-Vertical Support)
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    interest VARCHAR(100), 
    status VARCHAR(50) DEFAULT 'New',
    score INT DEFAULT 50,
    source VARCHAR(100),
    assigned_to UUID REFERENCES users(id),
    message TEXT,
    life_details JSONB, 
    real_estate_details JSONB, 
    securities_details JSONB,
    logistics_details JSONB DEFAULT '{}'::jsonb,
    home_repair_details JSONB DEFAULT '{}'::jsonb,
    custom_details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. VERTICAL-SPECIFIC ENGINES
-- Securities (Portfolios)
CREATE TABLE IF NOT EXISTS portfolios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    advisor_id UUID REFERENCES users(id),
    client_name VARCHAR(255),
    total_value NUMERIC(15,2),
    ytd_return NUMERIC(5,2),
    risk_profile VARCHAR(50),
    holdings JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Real Estate (Properties)
CREATE TABLE IF NOT EXISTS properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    price NUMERIC(15,2),
    type VARCHAR(100),
    status VARCHAR(50),
    advisor_id UUID REFERENCES users(id),
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Logistics (Load Board)
CREATE TABLE IF NOT EXISTS logistics_loads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    origin VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    pickup_date DATE,
    equipment_type VARCHAR(100),
    rate_usd NUMERIC(12, 2),
    status VARCHAR(50) DEFAULT 'available',
    advisor_id UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SYSTEM INFRASTRUCTURE
CREATE TABLE IF NOT EXISTS company_settings (
    id VARCHAR(50) PRIMARY KEY,
    data JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. STORAGE BUCKETS (Pub/Private)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('website-assets', 'website-assets', true),
       ('client-documents', 'client-documents', false),
       ('advisor-assets', 'advisor-assets', true),
       ('lead-documents', 'lead-documents', false)
ON CONFLICT (id) DO NOTHING;

-- 6. ANALYTICS & MONITORING
CREATE TABLE IF NOT EXISTS analytics_page_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    url TEXT,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE VIEW lead_performance AS
SELECT interest, count(*), avg(score) 
FROM leads GROUP BY interest;
