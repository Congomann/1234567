const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  connectionString: 'postgres://postgres.boylqkqyclzayrupbrbd:2027Newholand@aws-1-us-east-2.pooler.supabase.com:6543/postgres'
});

async function run() {
  const schema = fs.readFileSync('backend/schema.sql', 'utf8');
  try {
    await pool.query(schema);
    console.log("Schema executed successfully!");
  } catch (err) {
    console.error("Partial execution (tables might already exist):");
    // We just want to make sure 'workflows' exists. Let's create it explicitly if it failed.
    await pool.query(`
      CREATE TABLE IF NOT EXISTS workflows (
          id VARCHAR(50) PRIMARY KEY,
          data JSONB NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Also landing pages
    await pool.query(`
      CREATE TABLE IF NOT EXISTS landing_pages (
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
    `);
    console.log("Ensured 'workflows' and 'landing_pages' exist.");
  }
  process.exit(0);
}

run();
