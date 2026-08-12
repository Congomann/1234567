
-- NHFG Enterprise CRM - Master Schema for Supabase / PostgreSQL
-- This file contains all tables, indexes, and extensions needed for full deployment.

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CORE: USERS & AUTH
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    personal_email VARCHAR(255),
    password_hash VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('Administrator', 'Manager', 'Sub-Admin', 'Advisor', 'Client')),
    category VARCHAR(50) DEFAULT 'Insurance & General',
    title VARCHAR(100),
    phone VARCHAR(50),
    avatar_url TEXT,
    bio TEXT,
    microsite_enabled BOOLEAN DEFAULT FALSE,
    contract_level NUMERIC(5,2) DEFAULT 50,
    products_sold JSONB DEFAULT '[]'::jsonb,
    license_states TEXT[],
    onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 3. ADVISOR ONBOARDING (Pre-User Phase)
CREATE TABLE IF NOT EXISTS advisor_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    personal_email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    license_info TEXT,
    experience TEXT,
    address TEXT,
    status VARCHAR(50) DEFAULT 'pending_approval',
    company_email VARCHAR(255),
    contract_level NUMERIC(5,2),
    authorized_products JSONB,
    resume_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS activation_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(128) UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CRM: LEADS (Unified Table)
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. CRM: CLIENTS & POLICIES
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    advisor_id UUID REFERENCES users(id),
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID REFERENCES leads(id),
    advisor_id UUID REFERENCES users(id),
    client_name VARCHAR(255),
    carrier VARCHAR(100),
    policy_number VARCHAR(100),
    status VARCHAR(50), 
    premium NUMERIC(12, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. FINANCE & COMMISSIONS
CREATE TABLE IF NOT EXISTS commission_statements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    carrier VARCHAR(100) NOT NULL,
    statement_date DATE NOT NULL,
    total_amount NUMERIC(15, 2),
    status VARCHAR(50) DEFAULT 'unreconciled',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS commission_reconciliations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    statement_id UUID REFERENCES commission_statements(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    advisor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    expected_amount NUMERIC(12, 2),
    actual_amount NUMERIC(12, 2),
    difference NUMERIC(12, 2),
    status VARCHAR(50) CHECK (status IN ('Matched', 'Discrepancy', 'Unlinked')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. BANKING & VERIFICATION (Plaid)
CREATE TABLE IF NOT EXISTS plaid_items (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id          VARCHAR(255) UNIQUE NOT NULL,
    access_token     TEXT NOT NULL,
    institution_id   VARCHAR(100),
    institution_name VARCHAR(255),
    auth_method      VARCHAR(50),
    created_by       VARCHAR(255),
    client_name      VARCHAR(255),
    created_at       TIMESTAMPTZ DEFAULT NOW(),
    updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bank_verifications (
    id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plaid_item_id             UUID REFERENCES plaid_items(id),
    client_name               VARCHAR(255) NOT NULL,
    client_email              VARCHAR(255),
    client_phone              VARCHAR(50),
    institution_name          VARCHAR(255) NOT NULL DEFAULT 'Pending',
    account_name              VARCHAR(255),
    account_mask              VARCHAR(10)  NOT NULL DEFAULT '????',
    account_type              VARCHAR(30),
    routing_number            VARCHAR(20),
    plaid_account_id          VARCHAR(255),
    status                    VARCHAR(25) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'failed', 'micro_deposit')),
    verification_method       VARCHAR(10) NOT NULL DEFAULT 'plaid' CHECK (verification_method IN ('plaid', 'manual')),
    balance_available         NUMERIC(15,2),
    balance_current           NUMERIC(15,2),
    balance_currency          VARCHAR(10) DEFAULT 'USD',
    transactions_7d           JSONB,
    verified_at               TIMESTAMPTZ,
    verified_by               VARCHAR(255),
    created_at                TIMESTAMPTZ DEFAULT NOW(),
    updated_at                TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS verification_links (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token           VARCHAR(128) UNIQUE NOT NULL,
    verification_id UUID REFERENCES bank_verifications(id) ON DELETE CASCADE,
    client_name     VARCHAR(255),
    client_email    VARCHAR(255),
    client_phone    VARCHAR(50),
    sent_via        VARCHAR(10),
    sent_at         TIMESTAMPTZ DEFAULT NOW(),
    expires_at      TIMESTAMPTZ NOT NULL,
    is_used         BOOLEAN DEFAULT FALSE
);

-- 8. TEAM COMMUNITIES & CHAT
CREATE TABLE IF NOT EXISTS chat_channels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255),
    type VARCHAR(50) NOT NULL CHECK (type IN ('direct', 'group', 'advisor_channel', 'case_chat')),
    case_id UUID, 
    product_type VARCHAR(100),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chat_channel_members (
    channel_id UUID REFERENCES chat_channels(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_read_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (channel_id, user_id)
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel_id UUID REFERENCES chat_channels(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS case_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL, 
    author_id UUID REFERENCES users(id),
    note_type VARCHAR(50) CHECK (note_type IN ('medical', 'general', 'underwriting', 'decline_reason')),
    structured_data JSONB, 
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. WEBSITE & CMS
CREATE TABLE IF NOT EXISTS landing_pages (
    slug VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content JSONB,
    style_config JSONB,
    is_published BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS nurture_sequences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    trigger_status VARCHAR(50),
    product_type VARCHAR(100),
    steps JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. SYSTEM CONFIG & ANALYTICS
CREATE TABLE IF NOT EXISTS company_settings (
    id VARCHAR(50) PRIMARY KEY,
    data JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    url TEXT NOT NULL,
    thumbnail TEXT,
    content TEXT,
    description TEXT,
    likes INT DEFAULT 0,
    dislikes INT DEFAULT 0,
    shares INT DEFAULT 0,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    advisor_id UUID REFERENCES users(id) ON DELETE CASCADE,
    client_name VARCHAR(255) NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'pending_edit')),
    date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    edited_client_name VARCHAR(255),
    edited_rating INT,
    edited_review_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    time VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('meeting', 'reminder', 'task', 'off-day')),
    status VARCHAR(50) DEFAULT 'scheduled',
    creator_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS analytics_page_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visitor_id VARCHAR(100),
    url TEXT,
    path TEXT,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. INDEXES
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_leads_assigned ON leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_chat_messages_channel ON chat_messages(channel_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bank_verif_status ON bank_verifications(status);

-- 12. INITIAL SEED DATA (Administrator Account)
-- Password: NewhollandAdmin@2026 (SHA-256)
INSERT INTO users (id, email, name, role, password_hash)
VALUES ('ba2e9046-e854-4d6f-9ec5-5ae1046003b2', 'info@newhollandfinancial.com', 'NHFG Admin', 'Administrator', 'b9e106daeb5faccfb28ffa5d7f7bb36ee622370c9197c386fcaedaa78507bb6f')
ON CONFLICT (email) DO NOTHING;

-- Seed: Company Settings
INSERT INTO company_settings (id, data)
VALUES ('main', '{
  "phone": "(800) 555-0199",
  "email": "contact@newholland.com",
  "address": "123 Finance Way",
  "city": "New York",
  "state": "NY",
  "zip": "10001",
  "heroTitle": "Securing Your Future, Protecting Your Legacy.",
  "heroSubtitle": "New Holland Financial Group provides comprehensive insurance and financial solutions.",
  "heroBackgroundType": "video",
  "heroBackgroundUrl": "",
  "partners": {},
  "partnerMarqueeSpeed": 30
}')
ON CONFLICT (id) DO NOTHING;

-- 10. AUTOMATION & WORKFLOWS
CREATE TABLE IF NOT EXISTS workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    trigger VARCHAR(100) NOT NULL,
    actions JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(50) DEFAULT 'active',
    impact VARCHAR(20) DEFAULT 'MEDIUM',
    category VARCHAR(50) DEFAULT 'OPERATIONS',
    executions_ytd INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS integration_config (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'main',
    google_ads JSONB DEFAULT '{"enabled": false}'::jsonb,
    meta_ads JSONB DEFAULT '{"enabled": false}'::jsonb,
    tiktok_ads JSONB DEFAULT '{"enabled": false}'::jsonb,
    linkedin_ads JSONB DEFAULT '{"enabled": false}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- 1. ACCESS LOGS (Security & Audit)
CREATE TABLE IF NOT EXISTS access_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. DOCUMENTS (Secure Document Management)
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_type VARCHAR(100),
    file_size BIGINT,
    category VARCHAR(50) DEFAULT 'General',
    version INT DEFAULT 1,
    is_encrypted BOOLEAN DEFAULT FALSE,
    access_permissions JSONB DEFAULT '{"roles": ["Administrator", "Manager"]}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 3. INTERACTION HISTORY (CRM Engagement)
CREATE TABLE IF NOT EXISTS interaction_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    type VARCHAR(50) CHECK (type IN ('Call', 'Email', 'Meeting', 'Note', 'SMS', 'Status Change')),
    content TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. NOTIFICATIONS (Unified System)
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'alert')),
    resource_type VARCHAR(50),
    resource_id UUID,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. USER PREFERENCES (Notification / UI settings)
CREATE TABLE IF NOT EXISTS user_preferences (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    email_notifications BOOLEAN DEFAULT TRUE,
    sms_alerts BOOLEAN DEFAULT FALSE,
    push_notifications BOOLEAN DEFAULT TRUE,
    theme VARCHAR(20) DEFAULT 'light',
    timezone VARCHAR(50) DEFAULT 'UTC',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. SCHEDULER (Consultation Scheduler)
ALTER TABLE events ADD COLUMN IF NOT EXISTS end_time VARCHAR(50);
ALTER TABLE events ADD COLUMN IF NOT EXISTS meeting_link TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id);
ALTER TABLE events ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS recurrence JSONB;
ALTER TABLE events ADD COLUMN IF NOT EXISTS visibility VARCHAR(20) DEFAULT 'public';
ALTER TABLE events ADD COLUMN IF NOT EXISTS creator_name VARCHAR(255);
ALTER TABLE events ADD COLUMN IF NOT EXISTS has_google_meet BOOLEAN DEFAULT FALSE;
ALTER TABLE events ADD COLUMN IF NOT EXISTS participants JSONB DEFAULT '[]'::jsonb;
ALTER TABLE events ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- 7. SECURITY ENHANCEMENTS (RBAC Granular)
-- For now, we use a metadata column in users for fine-grained permissions if needed
ALTER TABLE users ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '[]'::jsonb;

-- 8. MARKETING HUB PRO TABLES
CREATE TABLE IF NOT EXISTS marketing_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'Draft' CHECK (status IN ('Draft', 'Active', 'Paused', 'Completed', 'Cancelled')),
    type VARCHAR(50) DEFAULT 'Email' CHECK (type IN ('Email', 'Social', 'Google Ads', 'Meta Ads', 'SMS', 'Multi-Channel')),
    budget NUMERIC(12,2) DEFAULT 0,
    spend NUMERIC(12,2) DEFAULT 0,
    roi NUMERIC(8,2) DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    audience_id UUID,
    subject_line TEXT,
    message_body TEXT,
    target_url TEXT,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS marketing_audiences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    size INTEGER DEFAULT 0,
    criteria JSONB DEFAULT '{}'::jsonb,
    source VARCHAR(100) DEFAULT 'CRM',
    synced_to_meta BOOLEAN DEFAULT FALSE,
    synced_to_google BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES marketing_campaigns(id),
    amount NUMERIC(12,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
    stripe_charge_id VARCHAR(255),
    payment_method_last4 VARCHAR(4),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS email_sends (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES marketing_campaigns(id),
    audience_id UUID REFERENCES marketing_audiences(id),
    subject_line TEXT NOT NULL,
    message_body TEXT NOT NULL,
    sent_count INTEGER DEFAULT 0,
    open_count INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'queued' CHECK (status IN ('queued', 'sending', 'sent', 'failed')),
    sent_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed demo marketing data
INSERT INTO marketing_audiences (name, description, size, criteria, source) VALUES
    ('High-Value Freight Leads', 'Owner-operators with 5+ trucks and active FMCSA number', 847, '{"industry": "Freight", "truck_count": {"gte": 5}, "has_fmcsa": true}', 'CRM'),
    ('Insurance Cross-Sell', 'Existing clients without life insurance policy', 1240, '{"has_life_insurance": false, "is_existing_client": true}', 'CRM'),
    ('Mortgage Prospects', 'Leads who visited /mortgage in last 30 days', 312, '{"page_visited": "/mortgage", "days_ago": {"lte": 30}}', 'Analytics')
ON CONFLICT DO NOTHING;

INSERT INTO marketing_campaigns (name, status, type, budget, spend, roi, impressions, clicks, conversions, subject_line, message_body) VALUES
    ('Q3 Freight Expansion', 'Active', 'Multi-Channel', 5000, 4500, 431, 12400, 890, 67, 'Exclusive Freight Rates — Save Up to 18% This Quarter', 'Dear Carrier Partner, we have negotiated exclusive lane rates...'),
    ('Life Insurance Awareness', 'Active', 'Email', 2500, 1800, 285, 8200, 540, 42, 'Is Your Family Protected? New Holland Life Insurance', 'Protect what matters most with our term life solutions...'),
    ('Mortgage Q4 Push', 'Draft', 'Google Ads', 8000, 0, 0, 0, 0, 0, 'Rates Are Dropping — Lock In Your Mortgage Today', 'Current rates are at a 2-year low. Now is the time...')
ON CONFLICT DO NOTHING;

