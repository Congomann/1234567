const { Pool } = require('pg');

const region = 'us-east-2';
const password = 'Congomani%402027';
const projectRef = 'boylqkqyclzayrupbrbd';

async function testOhio() {
  const variations = [
    { host: `aws-0-${region}.pooler.supabase.com`, port: 5432, user: `postgres.${projectRef}` },
    { host: `aws-0-${region}.pooler.supabase.com`, port: 6543, user: `postgres.${projectRef}` }, // Added port 6543
    { host: `db.${projectRef}.supabase.co`, port: 5432, user: `postgres` },
    { host: `db.${projectRef}.supabase.co`, port: 6543, user: `postgres` },
  ];

  for (const v of variations) {
    const connectionString = `postgres://${v.user}:${password}@${v.host}:${v.port}/postgres`;
    const pool = new Pool({
      connectionString,
      connectionTimeoutMillis: 5000,
      ssl: { rejectUnauthorized: false }
    });

    console.log(`Testing: ${v.user}@${v.host}:${v.port}...`);
    try {
      const client = await pool.connect();
      console.log(`✅ SUCCESS! Connection established.`);
      await client.release();
      await pool.end();
      process.exit(0);
    } catch (err) {
      console.log(`❌ FAILED: ${err.message}`);
      await pool.end();
    }
  }
  process.exit(1);
}

testOhio();
