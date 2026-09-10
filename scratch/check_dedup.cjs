const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgres://postgres:Newholland@2026@localhost:5432/nhfg_crm'
});

async function run() {
  const res = await pool.query(`SELECT id, email, phone FROM leads WHERE email = 'test@example.com'`);
  console.log(res.rows);
  pool.end();
}
run();
