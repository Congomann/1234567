-- ── SIGNALWIRE TELEPHONY & AI QUALIFICATION SCHEMA ─────────────────────────

-- 1. Advisor Extension Directory (Corporate IVR Routing)
CREATE TABLE IF NOT EXISTS advisor_extensions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    advisor_name VARCHAR(255) NOT NULL,
    extension VARCHAR(10) UNIQUE NOT NULL,
    phone_number VARCHAR(50) NOT NULL,
    department VARCHAR(100) DEFAULT 'Financial Advisory',
    status VARCHAR(20) DEFAULT 'available',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Telephony Call Logs & AI Ratings
CREATE TABLE IF NOT EXISTS telephony_calls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    call_sid VARCHAR(255) UNIQUE NOT NULL,
    direction VARCHAR(20) NOT NULL, -- 'inbound' | 'outbound' | 'ai_qualification'
    from_number VARCHAR(50) NOT NULL,
    to_number VARCHAR(50) NOT NULL,
    lead_name VARCHAR(255),
    lead_id VARCHAR(255),
    advisor_extension VARCHAR(10),
    status VARCHAR(50) NOT NULL DEFAULT 'initiated', -- 'initiated'|'ringing'|'in-progress'|'completed'|'failed'
    duration_seconds INT DEFAULT 0,
    recording_url TEXT,
    transcript TEXT,
    ai_rating VARCHAR(20), -- 'Warm' | 'Mild' | 'Cold'
    ai_qualification_summary TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SMS Messaging Threads
CREATE TABLE IF NOT EXISTS telephony_sms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_sid VARCHAR(255) UNIQUE NOT NULL,
    direction VARCHAR(20) NOT NULL, -- 'inbound' | 'outbound'
    from_number VARCHAR(50) NOT NULL,
    to_number VARCHAR(50) NOT NULL,
    lead_name VARCHAR(255),
    message_text TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'sent', -- 'sent'|'delivered'|'received'|'failed'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Seed Initial Advisor Extensions
INSERT INTO advisor_extensions (advisor_name, extension, phone_number, department)
VALUES 
  ('Marcus Vance', '101', '+18885550101', 'Senior Wealth Advisory'),
  ('Sarah Jenkins', '102', '+18885550102', 'Mortgage & Lending'),
  ('David Ross', '103', '+18885550103', 'Commercial Insurance'),
  ('Elena Rostova', '104', '+18885550104', 'Private Wealth')
ON CONFLICT (extension) DO NOTHING;
