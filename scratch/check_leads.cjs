const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgres://postgres:Newholland@2026@localhost:5432/nhfg_crm'
});

async function run() {
  const res = await pool.query(`SELECT id, name, email, phone, utm_source FROM leads WHERE id = '6caf1bb9-ebb1-405c-bc62-da5bb2a12b95'`);
  console.log(res.rows);
  pool.end();
}
run();
