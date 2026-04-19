const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgres://postgres.boylqkqyclzayrupbrbd:2027Newholand@aws-1-us-east-2.pooler.supabase.com:6543/postgres'
});

async function run() {
  const defaultSettings = {
    themePrimaryColor: '#0A62A7',
    footerDescription: 'Welcome to New Holland Financial Group',
    phone: '800-555-0199'
  };
  
  await pool.query(
    `INSERT INTO company_settings (id, data, updated_at)
     VALUES ($1, $2, CURRENT_TIMESTAMP)
     ON CONFLICT (id) DO NOTHING`,
    ['main', JSON.stringify(defaultSettings)]
  );
  console.log("Seeded basic company settings!");
  process.exit(0);
}

run();
