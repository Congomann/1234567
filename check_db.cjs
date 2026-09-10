const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });
let url = process.env.DATABASE_URL;
if(url.includes('sslmode=require')) {
  url = url.replace('?sslmode=require&pgbouncer=true', '');
  url = url.replace('?sslmode=require', '');
}
const pool = new Pool({
    connectionString: url,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'integration_accounts'");
        console.log("Columns:", res.rows);
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}
run();
