const { Pool } = require('pg');
require('dotenv').config({ path: './backend/.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  try {
    await pool.query(`
      INSERT INTO carriers (name, category) VALUES
      ('National Life Group', 'Life Insurance'),
      ('Transamerica', 'Life Insurance'),
      ('Mutual of Omaha', 'Life Insurance'),
      ('Root Insurance', 'Auto & Commercial'),
      ('Progressive', 'Auto & Commercial'),
      ('UnitedHealthcare', 'Health'),
      ('Allianz', 'Annuities')
      ON CONFLICT DO NOTHING;
    `);
    console.log("Default carriers inserted.");
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}
run();
