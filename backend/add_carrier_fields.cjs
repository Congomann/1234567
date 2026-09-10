const { Pool } = require('pg');
require('dotenv').config({ path: __dirname + '/.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function main() {
  const client = await pool.connect();
  try {
    await client.query(`
      ALTER TABLE clients 
      ADD COLUMN IF NOT EXISTS missed_payments INT DEFAULT 0,
      ADD COLUMN IF NOT EXISTS birthday DATE,
      ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Active',
      ADD COLUMN IF NOT EXISTS coverage_amount NUMERIC(15, 2),
      ADD COLUMN IF NOT EXISTS policy_duration_months INT;
    `);
    console.log("Successfully added carrier fields to clients table.");
  } catch (err) {
    console.error("Error:", err);
  } finally {
    client.release();
    pool.end();
  }
}
main();
