const { Client } = require('pg');

const config = {
  user: 'postgres.boylqkqyclzayrupbrbd',
  host: 'aws-0-us-east-2.pooler.supabase.com',
  database: 'postgres',
  password: 'Congomani@2027', // LITERALLY no encoding here
  port: 6543,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
};

async function test() {
  const client = new Client(config);
  console.log(`Testing direct config: ${config.user}@${config.host}:${config.port}...`);
  try {
    await client.connect();
    console.log('✅ SUCCESS! Connected to Supabase via Session Pooler.');
    const res = await client.query('SELECT current_database(), now()');
    console.log('Result:', res.rows[0]);
    await client.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Connection Failed:', err.message);
    if (err.detail) console.error('Detail:', err.detail);
    process.exit(1);
  }
}

test();
