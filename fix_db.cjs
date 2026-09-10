require('dotenv').config({ path: 'backend/.env' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function fix() {
  try {
    await pool.query('ALTER TABLE verification_links ADD COLUMN custom_message TEXT;');
    console.log('Successfully added custom_message to verification_links');
  } catch (err) {
    if (err.message.includes('already exists')) {
      console.log('Column already exists');
    } else {
      console.error('Error:', err.message);
    }
  } finally {
    await pool.end();
  }
}
fix();
