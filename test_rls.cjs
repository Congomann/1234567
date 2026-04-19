const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function check() {
  const res = await pool.query("SELECT relrowsecurity FROM pg_class WHERE relname = 'company_settings'");
  console.log("RLS enabled? :", res.rows[0]);
  process.exit(0);
}
check();
