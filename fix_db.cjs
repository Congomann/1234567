const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function fix() {
  try {
    // 1. Add updated_at to users
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()');
    console.log('Added updated_at to users');
  } catch (e) {
    console.error(e.message);
  }
  process.exit(0);
}
fix();
