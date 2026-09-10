const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgres://postgres:Newholland@2026@localhost:5432/nhfg_crm'
});

async function run() {
  const res = await pool.query(`SELECT id, name, email, phone, utm_source FROM leads WHERE email = 'fresh@example.com'`);
  console.log(res.rows);
  const act = await pool.query(`SELECT activity_type FROM lead_activities WHERE lead_id = $1`, [res.rows[0].id]);
  console.log('Activities:', act.rows);
  pool.end();
}
run();
