const { Pool } = require('pg');

const passwords = [
  '3peo3zS7EaurR9g9',
  '2027Newholand',
  '2027Newholland',
  'Newholland@2026',
  'Newholland@2027',
  'Newholland2026',
  'Newholland2027',
  'postgres'
];

async function findPassword() {
  const host = 'db.spwvazzkjjcybxaojzmh.supabase.co';
  for (const pass of passwords) {
    const url = `postgres://postgres:${encodeURIComponent(pass)}@${host}:5432/postgres`;
    console.log(`Testing password: ${pass.slice(0, 4)}...`);
    const pool = new Pool({
      connectionString: url,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 3000
    });

    try {
      const res = await pool.query('SELECT NOW()');
      console.log(`\n🎉 SUCCESS! MATCHING PASSWORD FOUND: ${pass}`);
      console.log('QueryResult:', res.rows[0]);
      await pool.end();
      return { url, pass };
    } catch (err) {
      console.error(`❌ Failed (${pass.slice(0, 4)}...):`, err.message);
    } finally {
      await pool.end().catch(() => {});
    }
  }
}

findPassword();
