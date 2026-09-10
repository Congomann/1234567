const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgres://postgres:Newholland@2026@localhost:5432/nhfg_crm'
});

async function applySchema() {
  const schemaSql = `
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- 1. Create/update Postgres tables
CREATE TABLE IF NOT EXISTS webhook_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider VARCHAR(100) NOT NULL,
    event_type VARCHAR(100),
    payload JSONB NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS integration_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider VARCHAR(100) NOT NULL,
    account_id VARCHAR(255),
    access_token TEXT,
    refresh_token TEXT,
    settings JSONB,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lead_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    activity_type VARCHAR(100) NOT NULL,
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Update leads table for attribution fields
ALTER TABLE leads ADD COLUMN IF NOT EXISTS utm_source VARCHAR(255);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS utm_medium VARCHAR(255);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS utm_campaign VARCHAR(255);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS utm_term VARCHAR(255);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS utm_content VARCHAR(255);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS gclid VARCHAR(255);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS fbclid VARCHAR(255);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS campaign VARCHAR(255);
  `;
  try {
    console.log('Applying marketing schema update to local DB...');
    await pool.query(schemaSql);
    console.log('Schema applied successfully.');
  } catch (err) {
    console.error('Error applying schema:', err);
  } finally {
    await pool.end();
  }
}

applySchema();
