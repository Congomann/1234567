require('dotenv').config({ path: './backend/.env' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  try {
    console.log("Connecting to Supabase...");
    const client = await pool.connect();
    
    console.log("Adding missing Marketing & Logistics schema...");

    const sql = `
      -- 1. Marketing Audiences
      CREATE TABLE IF NOT EXISTS marketing_audiences (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        size INTEGER DEFAULT 0,
        criteria JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- 2. Marketing Campaigns
      CREATE TABLE IF NOT EXISTS marketing_campaigns (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'Draft',
        budget NUMERIC(10,2) DEFAULT 0,
        spend NUMERIC(10,2) DEFAULT 0,
        revenue_generated NUMERIC(10,2) DEFAULT 0,
        start_date TIMESTAMP WITH TIME ZONE,
        end_date TIMESTAMP WITH TIME ZONE,
        audience_id UUID REFERENCES marketing_audiences(id),
        leads_generated INTEGER DEFAULT 0,
        deals_closed INTEGER DEFAULT 0,
        roi NUMERIC(10,2) DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- 3. Logistics Details for Leads
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='logistics_details') THEN
          ALTER TABLE leads ADD COLUMN logistics_details JSONB;
        END IF;
      END $$;
    `;

    await client.query(sql);
    
    console.log("✅ Missing architecture successfully added!");
    client.release();
  } catch (err) {
    console.error("❌ Failed to add schema:", err.message);
  } finally {
    pool.end();
  }
}
run();
