-- Marketing Schema Migration

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS marketing_audiences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    size INTEGER DEFAULT 0,
    criteria JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS marketing_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Draft',
    budget DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    spend DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    revenue_generated DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    start_date DATE,
    end_date DATE,
    audience_id UUID REFERENCES marketing_audiences(id),
    leads_generated INTEGER DEFAULT 0,
    deals_closed INTEGER DEFAULT 0,
    roi DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES marketing_campaigns(id),
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL,
    stripe_charge_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS social_integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform VARCHAR(50) NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    connected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workflow_automations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    trigger_event VARCHAR(100) NOT NULL,
    actions JSONB NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    executions_ytd INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert some mock data for initial load
INSERT INTO marketing_audiences (id, name, size, criteria) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Dormant Leads (Last 90 Days)', 4500, '{"status": "Cold", "product": "Logistics"}'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'High-Value Fleet Owners', 850, '{"niche": "Fuel", "fleetSize": ">50"}')


INSERT INTO marketing_campaigns (id, name, status, budget, spend, revenue_generated, start_date, audience_id, leads_generated, deals_closed, roi) VALUES
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Q3 Freight Expansion', 'Active', 15000.00, 4500.00, 32000.00, '2026-07-01', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 145, 12, 611.11),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Fuel Niche Reactivation', 'Completed', 5000.00, 5000.00, 18500.00, '2026-05-01', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 89, 6, 270.00),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Meta Lookalike Logistics', 'Draft', 8000.00, 0.00, 0.00, '2026-08-01', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 0, 0, 0.00)


CREATE TABLE IF NOT EXISTS email_sends (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES marketing_campaigns(id),
    audience_id UUID REFERENCES marketing_audiences(id),
    subject_line VARCHAR(255) NOT NULL,
    message_body TEXT NOT NULL,
    sent_count INTEGER DEFAULT 0,
    open_count INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    status VARCHAR(50) NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS social_mentions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform VARCHAR(50) NOT NULL,
    author_username VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    sentiment VARCHAR(50) NOT NULL,
    posted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO social_mentions (platform, author_username, content, sentiment, posted_at) VALUES
('Twitter/X', '@logistics_pro', 'New Holland Financial is a game changer for our fleet. Best freight rates we''ve seen.', 'positive', NOW()),
('LinkedIn', 'Sarah Jenkins, CFO', 'Does anyone have experience with NHFG for commercial trucking insurance?', 'neutral', NOW() - INTERVAL '1 day'),
('Facebook', 'Mike Torres', 'NHFG helped me get my mortgage approved in 48 hours. Highly recommend!', 'positive', NOW() - INTERVAL '2 days'),
('Google Reviews', 'Anonymous', 'Wish they had more local office locations.', 'neutral', NOW() - INTERVAL '3 days')


CREATE TABLE IF NOT EXISTS email_sends (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES marketing_campaigns(id),
    audience_id UUID REFERENCES marketing_audiences(id),
    subject_line VARCHAR(255) NOT NULL,
    message_body TEXT NOT NULL,
    sent_count INTEGER DEFAULT 0,
    open_count INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    status VARCHAR(50) NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS social_mentions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform VARCHAR(50) NOT NULL,
    author_username VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    sentiment VARCHAR(50) NOT NULL,
    posted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO social_mentions (platform, author_username, content, sentiment, posted_at) VALUES
('Twitter/X', '@logistics_pro', 'New Holland Financial is a game changer for our fleet. Best freight rates we''ve seen.', 'positive', NOW()),
('LinkedIn', 'Sarah Jenkins, CFO', 'Does anyone have experience with NHFG for commercial trucking insurance?', 'neutral', NOW() - INTERVAL '1 day'),
('Facebook', 'Mike Torres', 'NHFG helped me get my mortgage approved in 48 hours. Highly recommend!', 'positive', NOW() - INTERVAL '2 days'),
('Google Reviews', 'Anonymous', 'Wish they had more local office locations.', 'neutral', NOW() - INTERVAL '3 days');

CREATE TABLE IF NOT EXISTS email_sends (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES marketing_campaigns(id),
    audience_id UUID REFERENCES marketing_audiences(id),
    subject_line VARCHAR(255) NOT NULL,
    message_body TEXT NOT NULL,
    sent_count INTEGER DEFAULT 0,
    open_count INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    status VARCHAR(50) NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS social_mentions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform VARCHAR(50) NOT NULL,
    author_username VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    sentiment VARCHAR(50) NOT NULL,
    posted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO social_mentions (platform, author_username, content, sentiment, posted_at) VALUES
('Twitter/X', '@logistics_pro', 'New Holland Financial is a game changer for our fleet. Best freight rates we''ve seen.', 'positive', NOW()),
('LinkedIn', 'Sarah Jenkins, CFO', 'Does anyone have experience with NHFG for commercial trucking insurance?', 'neutral', NOW() - INTERVAL '1 day'),
('Facebook', 'Mike Torres', 'NHFG helped me get my mortgage approved in 48 hours. Highly recommend!', 'positive', NOW() - INTERVAL '2 days'),
('Google Reviews', 'Anonymous', 'Wish they had more local office locations.', 'neutral', NOW() - INTERVAL '3 days');
