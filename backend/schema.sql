
-- Enable UUID extension for secure IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS (Advisors, Admins, Managers)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255), -- Nullable if using SSO
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('Administrator', 'Manager', 'Sub-Admin', 'Advisor', 'Client')),
    category VARCHAR(50) DEFAULT 'Insurance & General',
    title VARCHAR(100),
    phone VARCHAR(50),
    avatar TEXT,
    bio TEXT,
    microsite_enabled BOOLEAN DEFAULT FALSE,
    products_sold TEXT[], -- Array of strings e.g. ['Life Insurance', 'Real Estate']
    license_states TEXT[],
    onboarding_completed BOOLEAN DEFAULT FALSE,
    personal_email VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active',
    contract_level NUMERIC(5,2),
    authorized_products TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE activation_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- LEADS (Unified Table for all verticals)
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    interest VARCHAR(100), -- ProductType
    status VARCHAR(50) DEFAULT 'New',
    score INT DEFAULT 50,
    qualification VARCHAR(20) CHECK (qualification IN ('Hot', 'Warm', 'Cold')),
    source VARCHAR(100),
    assigned_to UUID REFERENCES users(id),
    message TEXT,
    notes TEXT,
    priority VARCHAR(20) DEFAULT 'Low',
    
    -- Flexible Data Storage for Vertical Specifics
    -- Stores DOB, SSN, Health info for Life Insurance
    life_details JSONB, 
    -- Stores Property Type, Budget, Location for Real Estate/Mortgage
    real_estate_details JSONB, 
    -- Stores Risk Tolerance, AUM, Experience for Securities
    securities_details JSONB,
    -- Stores VIN, Business Revenue, etc.
    custom_details JSONB,
    
    -- Marketing Attribution
    campaign_id VARCHAR(255),
    ad_group_id VARCHAR(255),
    ad_id VARCHAR(255),
    platform_data JSONB, -- Raw webhook payload for debugging
    
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- CLIENTS (Active Policies & Accounts)
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    advisor_id UUID REFERENCES users(id),
    user_id UUID REFERENCES users(id), -- Optional link if client has login
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    
    -- Policy / Account Info
    product VARCHAR(100),
    policy_number VARCHAR(100),
    carrier VARCHAR(100),
    premium NUMERIC(12, 2),
    renewal_date DATE,
    commission_amount NUMERIC(12, 2),
    
    address JSONB, -- { street, city, state, zip }
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- APPLICATIONS (Pending Insurance/Mortgage deals)
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID REFERENCES leads(id),
    advisor_id UUID REFERENCES users(id),
    client_name VARCHAR(255),
    carrier VARCHAR(100),
    policy_number VARCHAR(100),
    status VARCHAR(50), -- Pending, Underwriting, Approved, Issued, Declined
    premium NUMERIC(12, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- REAL ESTATE TRANSACTIONS
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    advisor_id UUID REFERENCES users(id),
    property_address VARCHAR(255),
    client_name VARCHAR(255),
    role VARCHAR(20) CHECK (role IN ('Buyer', 'Seller')),
    amount NUMERIC(15, 2),
    status VARCHAR(50), -- Open, Closed, Cancelled
    stage VARCHAR(50), -- Offer Accepted, Inspection, etc.
    closing_date DATE,
    earnest_money NUMERIC(12, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- PORTFOLIOS (Securities & Wealth Mgmt)
CREATE TABLE portfolios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    advisor_id UUID REFERENCES users(id),
    client_name VARCHAR(255),
    total_value NUMERIC(15, 2),
    ytd_return NUMERIC(5, 2),
    risk_profile VARCHAR(50),
    holdings JSONB, -- Array of { ticker, shares, value }
    last_rebalanced TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- INTEGRATION LOGS (Webhooks)
CREATE TABLE integration_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform VARCHAR(50),
    event_type VARCHAR(100),
    status VARCHAR(20),
    payload JSONB,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- EVENTS (Calendar)
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    time VARCHAR(50) NOT NULL,
    end_time VARCHAR(50),
    type VARCHAR(50) NOT NULL CHECK (type IN ('meeting', 'reminder', 'task', 'off-day')),
    status VARCHAR(50) DEFAULT 'scheduled',
    description TEXT,
    has_google_meet BOOLEAN DEFAULT FALSE,
    meeting_link VARCHAR(255),
    participants JSONB,
    creator_id UUID REFERENCES users(id),
    creator_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_assigned ON leads(assigned_to);
CREATE INDEX idx_clients_advisor ON clients(advisor_id);

-- COMPANY SETTINGS (Content Management)
CREATE TABLE company_settings (
    id VARCHAR(50) PRIMARY KEY,
    data JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- WORKFLOWS
CREATE TABLE workflows (
    id VARCHAR(50) PRIMARY KEY,
    data JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ── PLAID ITEMS ───────────────────────────────────────────────────────────────
-- One row per Plaid Link session (institution connection).
-- access_token is the long-lived token returned after public token exchange.
-- NEVER expose access_token to the frontend.
CREATE TABLE plaid_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id VARCHAR(255) UNIQUE NOT NULL,          -- Plaid's item_id
    access_token TEXT NOT NULL,                    -- Encrypted at rest in prod
    institution_id VARCHAR(100),
    institution_name VARCHAR(255),
    created_by UUID REFERENCES users(id),
    client_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ── BANK VERIFICATIONS ────────────────────────────────────────────────────────
-- Full audit trail for every client bank verification attempt.
CREATE TABLE bank_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plaid_item_id UUID REFERENCES plaid_items(id),  -- NULL for manual entries
    client_name VARCHAR(255) NOT NULL,
    client_email VARCHAR(255),
    client_phone VARCHAR(50),
    institution_name VARCHAR(255) NOT NULL,
    account_name VARCHAR(255),
    account_mask VARCHAR(10) NOT NULL,              -- Last 4 digits only
    account_type VARCHAR(20) CHECK (account_type IN ('checking', 'savings', 'credit', 'other')),
    routing_number VARCHAR(9),                      -- Verified routing number from Plaid Auth
    plaid_account_id VARCHAR(255),                  -- Plaid's account_id for future API calls
    -- Verification outcome
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'verified', 'failed', 'micro_deposit')),
    verification_method VARCHAR(10) NOT NULL DEFAULT 'manual'
        CHECK (verification_method IN ('plaid', 'manual')),
    -- Risk indicators computed at verification time
    name_match BOOLEAN DEFAULT FALSE,
    account_active BOOLEAN DEFAULT FALSE,
    draft_risk VARCHAR(10) DEFAULT 'medium'
        CHECK (draft_risk IN ('low', 'medium', 'high')),
    -- Audit fields
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bank_verifications_client ON bank_verifications(client_name);
CREATE INDEX idx_bank_verifications_status ON bank_verifications(status);
CREATE INDEX idx_plaid_items_item_id ON plaid_items(item_id);

-- ── PLAID RISK ENGINE ──────────────────────────────────────────────────────────

-- USERS BANK CONNECTION
CREATE TABLE bank_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  access_token TEXT NOT NULL,
  bank_name TEXT,
  account_mask TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- BALANCES
CREATE TABLE balances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  current_balance NUMERIC,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- TRANSACTIONS
CREATE TABLE transactions_plaid (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  amount NUMERIC,
  name TEXT,
  category TEXT,
  date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- RISK SCORE
CREATE TABLE risk_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  score TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bank_accounts_user_id ON bank_accounts(user_id);
CREATE INDEX idx_balances_user_id ON balances(user_id);
CREATE INDEX idx_transactions_plaid_user_id ON transactions_plaid(user_id);
CREATE INDEX idx_risk_scores_user_id ON risk_scores(user_id);


-- ── ANALYTICS ────────────────────────────────────────────────────────────────
-- Track unique visitors
CREATE TABLE analytics_visitors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visitor_id VARCHAR(100) UNIQUE NOT NULL, -- Permanent ID stored in cookie/localStorage
    ip_address VARCHAR(45),
    user_agent TEXT,
    device_type VARCHAR(50),
    screen_resolution VARCHAR(20),
    language VARCHAR(10),
    location_data JSONB, -- { city, country, region, lat, lon }
    metadata JSONB, -- Flexible store for screen size, timezone, etc.
    first_seen TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Track user sessions
CREATE TABLE analytics_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visitor_id VARCHAR(100) REFERENCES analytics_visitors(visitor_id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INT DEFAULT 0,
    session_metadata JSONB
);

-- Track individual page views
CREATE TABLE analytics_page_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visitor_id VARCHAR(100) REFERENCES analytics_visitors(visitor_id) ON DELETE CASCADE,
    session_id UUID REFERENCES analytics_sessions(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    path TEXT NOT NULL,
    title TEXT,
    referrer TEXT,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    event_metadata JSONB -- Tracking custom events or specific page data
);

CREATE INDEX idx_analytics_visitor_id ON analytics_visitors(visitor_id);
CREATE INDEX idx_analytics_page_views_visitor ON analytics_page_views(visitor_id);
-- ADVISOR APPLICATIONS (Join Our Team)
CREATE TABLE advisor_applications (
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- RESOURCES (Media Hub)
CREATE TABLE resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- PDF, Video, YouTube, Article, etc.
    url TEXT NOT NULL,
    thumbnail TEXT,
    description TEXT,
    content TEXT,
    likes INT DEFAULT 0,
    dislikes INT DEFAULT 0,
    shares INT DEFAULT 0,
    tags TEXT[],
    comments JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- TESTIMONIALS
CREATE TABLE testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_name VARCHAR(255) NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT NOT NULL,
    product VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
    date DATE DEFAULT CURRENT_DATE,
    edited_client_name VARCHAR(255),
    edited_rating INT,
    edited_review_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ADVISOR BILLING (Stripe/Payment info)
CREATE TABLE advisor_billing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    billing_status VARCHAR(50) DEFAULT 'active',
    plan_name VARCHAR(100),
    amount NUMERIC(12, 2),
    next_billing_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- TASKS (Management & Automations)
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    advisor_id UUID REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(20) DEFAULT 'Medium',
    completed BOOLEAN DEFAULT FALSE,
    due_date DATE,
    related_lead_id UUID REFERENCES leads(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tasks_advisor ON tasks(advisor_id);
CREATE INDEX idx_tasks_lead ON tasks(related_lead_id);
CREATE INDEX idx_testimonials_status ON testimonials(status);
CREATE INDEX idx_resources_type ON resources(type);

-- ── CAMPAIGN PAGE ENGINE ──────────────────────────────────────────────────
CREATE TABLE landing_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    content JSONB DEFAULT '{}'::jsonb,
    style_config JSONB DEFAULT '{}'::jsonb,
    is_published BOOLEAN DEFAULT FALSE,
    views INT DEFAULT 0,
    leads_count INT DEFAULT 0,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_landing_pages_slug ON landing_pages(slug);

-- ── LOGISTICS LOADS & DISPATCH TELEMETRY ─────────────────────────────────────
CREATE TABLE logistics_loads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    origin VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    pickup_date VARCHAR(50),
    delivery_date VARCHAR(50),
    equipment_type VARCHAR(100),
    rate_usd NUMERIC(10, 2),
    status VARCHAR(50) DEFAULT 'available',
    advisor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    carrier_driver_phone VARCHAR(50),
    carrier_driver_email VARCHAR(255),
    current_latitude NUMERIC(9, 6),
    current_longitude NUMERIC(9, 6),
    last_tracked_at TIMESTAMP WITH TIME ZONE,
    tracking_token VARCHAR(255) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_logistics_loads_token ON logistics_loads(tracking_token);
CREATE INDEX idx_logistics_loads_advisor ON logistics_loads(advisor_id);

-- ── SIGNALWIRE TELEPHONY & CALL LOGGING ENGINE ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS advisor_extensions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    advisor_name VARCHAR(255) NOT NULL,
    extension VARCHAR(10) UNIQUE NOT NULL,
    phone_number VARCHAR(50) NOT NULL,
    department VARCHAR(100),
    status VARCHAR(20) DEFAULT 'available',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS telephony_calls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    call_sid VARCHAR(255) UNIQUE NOT NULL,
    direction VARCHAR(20) NOT NULL, -- 'inbound' | 'outbound' | 'ai_qualification'
    from_number VARCHAR(50) NOT NULL,
    to_number VARCHAR(50) NOT NULL,
    lead_name VARCHAR(255),
    lead_id VARCHAR(255),
    advisor_extension VARCHAR(10),
    status VARCHAR(50) NOT NULL DEFAULT 'initiated', -- 'initiated' | 'connecting' | 'in-progress' | 'completed' | 'failed' | 'canceled'
    duration_seconds INT DEFAULT 0,
    recording_url TEXT,
    transcript TEXT,
    ai_rating VARCHAR(20), -- 'Warm' | 'Mild' | 'Cold'
    ai_qualification_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS telephony_sms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_sid VARCHAR(255) UNIQUE NOT NULL,
    direction VARCHAR(20) NOT NULL, -- 'inbound' | 'outbound'
    from_number VARCHAR(50) NOT NULL,
    to_number VARCHAR(50) NOT NULL,
    lead_name VARCHAR(255),
    message_text TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'delivered',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_telephony_calls_created_at ON telephony_calls(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_telephony_calls_sid ON telephony_calls(call_sid);
CREATE INDEX IF NOT EXISTS idx_telephony_calls_lead_id ON telephony_calls(lead_id);
