const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgres://postgres.spwvazzkjjcybxaojzmh:Newholland%402026@aws-1-us-east-2.pooler.supabase.com:6543/postgres' });
pool.query("SELECT conname, contype, pg_get_constraintdef(c.oid) FROM pg_constraint c JOIN pg_namespace n ON n.oid = c.connamespace WHERE conrelid = 'public.users'::regclass;", (err, res) => {
  if (err) console.error(err);
  else console.table(res.rows);
  pool.end();
});
