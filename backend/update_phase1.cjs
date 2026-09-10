const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const sql = `
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS lead_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL,
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS webhook_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider VARCHAR(100),
    event_type VARCHAR(100),
    payload JSONB,
    processed BOOLEAN DEFAULT FALSE,
    error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS integration_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider VARCHAR(100) NOT NULL,
    account_id VARCHAR(255),
    credentials JSONB,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE leads ADD COLUMN IF NOT EXISTS utm_source VARCHAR(255);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS utm_medium VARCHAR(255);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS utm_campaign VARCHAR(255);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS utm_term VARCHAR(255);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS utm_content VARCHAR(255);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS gclid VARCHAR(255);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS fbclid VARCHAR(255);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS campaign VARCHAR(255);
`;

async function run() {
  try {
    await pool.query(sql);
    console.log('Phase 1 schema updated successfully.');
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}
run();
