const { Pool } = require('pg');
require('dotenv').config({ path: './backend/.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS carriers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL UNIQUE,
        category VARCHAR(100) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Carriers table created.");
    
    // Insert defaults if empty
    const { rowCount } = await pool.query('SELECT COUNT(*) FROM carriers');
    if (rowCount === 0 || parseInt(rowCount) === 0) {
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
    }
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}
run();
