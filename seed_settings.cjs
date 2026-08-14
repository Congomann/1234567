require('dotenv').config({ path: './backend/.env' });
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
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
