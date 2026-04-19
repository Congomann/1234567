const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgres://postgres.boylqkqyclzayrupbrbd:2027Newholand@aws-1-us-east-2.pooler.supabase.com:6543/postgres' });
async function check() {
  const res = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
  console.log('Tables in production Supabase:', res.rows.map(r => r.table_name).join(', '));
  await pool.end();
}
check();
