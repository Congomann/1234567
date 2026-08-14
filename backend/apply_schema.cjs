const fs = require('fs');
const { Pool } = require('pg');
require('dotenv').config();

async function applySchema() {
  const pool = new Pool({
    connectionString: process.env.POSTGRES_URL.replace('?sslmode=require&supa=base-pooler.x', ''),
    ssl: { rejectUnauthorized: false }
  });

  try {
    const schemaSql = `
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
    direction VARCHAR(20) NOT NULL,
    from_number VARCHAR(50) NOT NULL,
    to_number VARCHAR(50) NOT NULL,
    lead_name VARCHAR(255),
    lead_id VARCHAR(255),
    advisor_extension VARCHAR(10),
    status VARCHAR(50) NOT NULL DEFAULT 'initiated',
    duration_seconds INT DEFAULT 0,
    recording_url TEXT,
    transcript TEXT,
    ai_rating VARCHAR(20),
    ai_qualification_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS telephony_sms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_sid VARCHAR(255) UNIQUE NOT NULL,
    direction VARCHAR(20) NOT NULL,
    from_number VARCHAR(50) NOT NULL,
    to_number VARCHAR(50) NOT NULL,
    lead_name VARCHAR(255),
    message_text TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'delivered',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workflow_automations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    trigger_event VARCHAR(100) NOT NULL,
    actions JSONB NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE leads ADD COLUMN IF NOT EXISTS custom_details JSONB;
    `;
    console.log('Applying specific schema update...');
    await pool.query(schemaSql);
    console.log('Schema applied successfully.');
  } catch (err) {
    console.error('Error applying schema:', err);
  } finally {
    await pool.end();
  }
}

applySchema();
