
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
  "heroBackgroundType": "image",
  "heroBackgroundUrl": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=2070",
  "partners": {
    "Root Insurance": "root.com",
    "Aflac": "aflac.com",
    "Transamerica": "transamerica.com",
    "Combined Insurance": "combinedinsurance.com",
    "Geico": "geico.com",
    "Securico Life": "securico.com"
  },
  "partnerMarqueeSpeed": 30
}')
ON CONFLICT (id) DO NOTHING;
