
-- NHFG Secure Team Chat & Case Management System

-- 1. CHANNELS (Direct, Group, Case-Based)
CREATE TABLE IF NOT EXISTS chat_channels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255), -- Null for DMs (derives from participants)
    type VARCHAR(50) NOT NULL CHECK (type IN ('direct', 'group', 'advisor_channel', 'case_chat')),
    case_id UUID, -- References leads(id) or clients(id) depending on context
    product_type VARCHAR(100), -- For auto-joined product channels (e.g. 'IUL Advisors')
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. CHANNEL MEMBERSHIP
CREATE TABLE IF NOT EXISTS chat_channel_members (
    channel_id UUID REFERENCES chat_channels(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_read_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (channel_id, user_id)
);

-- 3. CHAT MESSAGES
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel_id UUID REFERENCES chat_channels(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    is_predefined BOOLEAN DEFAULT FALSE, -- Restricted Advisor -> Sub-Admin messages
    metadata JSONB DEFAULT '{}', -- Store carrier suggestions, follow-up answers, or sensitive data markers
    is_pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. CASE MANAGEMENT: UNDERWRITING & MEDICAL NOTES
-- Tied to Leads (Potential Clients) or Clients (Active Policies)
CREATE TABLE IF NOT EXISTS case_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL, -- Logical ID (Lead or Client)
    author_id UUID REFERENCES users(id),
    note_type VARCHAR(50) CHECK (note_type IN ('medical', 'general', 'underwriting', 'decline_reason')),
    structured_data JSONB, -- { medications: [], conditions: [], carrier_suggestions: [] }
    content TEXT, -- Human-readable summary
    is_sensitive BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. READ RECEIPTS (Per member/message)
CREATE TABLE IF NOT EXISTS chat_read_receipts (
    message_id UUID REFERENCES chat_messages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    read_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (message_id, user_id)
);

-- 6. INDEXES for Performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_channel ON chat_messages(channel_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_case_notes_client ON case_notes(client_id);
CREATE INDEX IF NOT EXISTS idx_chat_channels_case ON chat_channels(case_id);

-- 7. DEFAULT PRESET DATA: Auto-create product channels for IUL, Final Expense, Medicare
-- This would be handled in the backend seed, but we can declare intent.
