const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgres://postgres.spwvazzkjjcybxaojzmh:Newholland%402026@aws-1-us-east-2.pooler.supabase.com:6543/postgres' });
pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users';", (err, res) => {
  if (err) console.error(err);
  else console.table(res.rows);
  pool.end();
});
