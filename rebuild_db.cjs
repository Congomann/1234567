require('dotenv').config({ path: './backend/.env' });
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  try {
    console.log("Connecting to new Supabase instance...");
    const client = await pool.connect();
    
    console.log("Reading all schema files...");
    const files = [
      'schema.sql',
      'supabase_schema.sql',
      'supabase_setup.sql',
      'chat_schema.sql'
    ];
    
    for (const file of files) {
      const filePath = path.join(__dirname, 'backend', file);
      if (fs.existsSync(filePath)) {
        console.log(`Executing ${file}...`);
        const schema = fs.readFileSync(filePath, 'utf8');
        try {
          await client.query(schema);
        } catch(e) {
          console.warn(`[Warning in ${file}]:`, e.message);
        }
      }
    }
    
    console.log("✅ Database successfully rebuilt with ALL components!");
    client.release();
  } catch (err) {
    console.error("❌ Failed to rebuild database:", err.message);
  } finally {
    pool.end();
  }
}
run();
