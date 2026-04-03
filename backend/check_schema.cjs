const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgres://postgres.boylqkqyclzayrupbrbd:2027Newholand@aws-1-us-east-2.pooler.supabase.com:6543/postgres' });
(async () => {
  const result = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'bank_verifications'");
  console.log(result.rows.map(r => r.column_name));
  await pool.end();
})();
