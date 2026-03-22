-- ════════════════════════════════════════════════════════════════════════════════
-- NEW HOLLAND FINANCIAL GROUP - SUPABASE CORE SCHEMA
-- ════════════════════════════════════════════════════════════════════════════════
-- Copy and paste this script into your Supabase SQL Editor to set up the entire DB.

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CORE TABLES

-- USERS
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('Administrator', 'Manager', 'Sub-Admin', 'Advisor', 'Client')),
    category VARCHAR(50) DEFAULT 'Insurance & General',
    title VARCHAR(100),
    phone VARCHAR(50),
    avatar TEXT,
    bio TEXT,
    microsite_enabled BOOLEAN DEFAULT FALSE,
    products_sold TEXT[],
    license_states TEXT[],
    onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- LEADS
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    interest VARCHAR(100),
    status VARCHAR(50) DEFAULT 'New',
    score INT DEFAULT 50,
    qualification VARCHAR(20) CHECK (qualification IN ('Hot', 'Warm', 'Cold')),
    source VARCHAR(100),
    assigned_to UUID REFERENCES users(id),
    message TEXT,
    notes TEXT,
    priority VARCHAR(20) DEFAULT 'Low',
    life_details JSONB,
    real_estate_details JSONB,
    securities_details JSONB,
    custom_details JSONB,
    campaign_id VARCHAR(255),
    ad_group_id VARCHAR(255),
    ad_id VARCHAR(255),
    platform_data JSONB,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CLIENTS
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    advisor_id UUID REFERENCES users(id),
    user_id UUID REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    product VARCHAR(100),
    policy_number VARCHAR(100),
    carrier VARCHAR(100),
    premium NUMERIC(12, 2),
    renewal_date DATE,
    commission_amount NUMERIC(12, 2),
    address JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- BANK VERIFICATIONS
CREATE TABLE IF NOT EXISTS bank_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plaid_item_id UUID, -- References plaid_items(id) - defined later
    client_name VARCHAR(255) NOT NULL,
    client_email VARCHAR(255),
    client_phone VARCHAR(50),
    institution_name VARCHAR(255) NOT NULL,
    account_name VARCHAR(255),
    account_mask VARCHAR(10) NOT NULL,
    account_type VARCHAR(20),
    routing_number VARCHAR(9),
    wire_routing VARCHAR(9),
    plaid_account_id VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    verification_method VARCHAR(10) NOT NULL DEFAULT 'manual',
    auth_method TEXT,
    plaid_verification_status TEXT,
    name_match BOOLEAN DEFAULT FALSE,
    name_match_score INT,
    account_active BOOLEAN DEFAULT FALSE,
    has_numbers_match BOOLEAN,
    is_numbers_match_verified BOOLEAN,
    has_prior_returns BOOLEAN,
    account_num_format TEXT,
    draft_risk VARCHAR(10) DEFAULT 'medium',
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PLAID ITEMS
CREATE TABLE IF NOT EXISTS plaid_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id VARCHAR(255) UNIQUE NOT NULL,
    access_token TEXT NOT NULL,
    institution_id VARCHAR(100),
    institution_name VARCHAR(255),
    auth_method TEXT,
    created_by UUID REFERENCES users(id),
    client_name VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ADVISOR BILLING (Stripe)
CREATE TABLE IF NOT EXISTS advisor_billing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    stripe_customer_id TEXT,
    payment_method_id TEXT,
    billing_status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PLAID USAGE LOGS
CREATE TABLE IF NOT EXISTS plaid_usage_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    advisor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    status TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- COMPANY SETTINGS
CREATE TABLE IF NOT EXISTS company_settings (
    id VARCHAR(50) PRIMARY KEY,
    data JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- REFRESH TOKENS (For Persistent Login)
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ENFORCE ROW LEVEL SECURITY (RLS)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE plaid_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE advisor_billing ENABLE ROW LEVEL SECURITY;
ALTER TABLE plaid_usage_logs ENABLE ROW LEVEL SECURITY;

-- 4. POLICIES (Supabase Context Aware)
-- Note: 'app.user_id' and 'app.user_role' are set by our Express backend session middleware.

CREATE POLICY leads_isolation_policy ON leads
USING (current_setting('app.user_role', true) = 'Administrator' OR assigned_to::text = current_setting('app.user_id', true));

CREATE POLICY bv_isolation_policy ON bank_verifications
USING (current_setting('app.user_role', true) = 'Administrator' OR verified_by::text = current_setting('app.user_id', true));

CREATE POLICY plaid_items_policy ON plaid_items
USING (current_setting('app.user_role', true) = 'Administrator' OR created_by::text = current_setting('app.user_id', true));

CREATE POLICY advisor_billing_policy ON advisor_billing
USING (current_setting('app.user_role', true) = 'Administrator' OR user_id::text = current_setting('app.user_id', true));

-- 5. HELPERS & TRIGGERS
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON company_settings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
