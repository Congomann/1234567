const { Pool } = require('pg');
let url = process.env.DATABASE_URL;
if(url.includes('sslmode=require')) {
  url = url.replace('?sslmode=require&pgbouncer=true', '');
  url = url.replace('?sslmode=require', '');
}
const pool = new Pool({ connectionString: url, ssl: { rejectUnauthorized: false } });
async function run() {
  const res = await pool.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
  `);
  console.log(res.rows);
  pool.end();
}
run();
