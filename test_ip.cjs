const { Client } = require('pg');

const config = {
  user: 'postgres.boylqkqyclzayrupbrbd',
  host: '3.13.175.194', // Direct IP of aws-0-us-east-2.pooler.supabase.com
  database: 'postgres',
  password: 'Congomani@2027',
  port: 5432,
  ssl: { rejectUnauthorized: false }
};

async function test() {
  const client = new Client(config);
  try {
    await client.connect();
    console.log('✅ IP CONNECT SUCCESS!');
    await client.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ IP CONNECT FAILED:', err.message);
    process.exit(1);
  }
}

test();
