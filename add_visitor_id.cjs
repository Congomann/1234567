const { Pool } = require('pg');
require('dotenv').config({ path: 'backend/.env' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('ALTER TABLE leads ADD COLUMN IF NOT EXISTS visitor_id VARCHAR(255)')
  .then(() => pool.end())
  .catch(console.error);
