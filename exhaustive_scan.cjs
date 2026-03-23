const { Pool } = require('pg');

const regions = [
  'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2', 'ca-central-1',
  'eu-west-1', 'eu-west-2', 'eu-west-3', 'eu-central-1',
  'ap-southeast-1', 'ap-southeast-2', 'ap-northeast-1', 'ap-northeast-2',
  'ap-south-1', 'sa-east-1'
];
const password = '2027Newholand';
const projectRef = 'boylqkqyclzayrupbrbd';

async function scan() {
  for (const region of regions) {
    const host = `aws-0-${region}.pooler.supabase.com`;
    const connectionString = `postgres://postgres.${projectRef}:${password}@${host}:6543/postgres`;
    
    const pool = new Pool({
      connectionString,
      connectionTimeoutMillis: 3000,
      ssl: { rejectUnauthorized: false }
    });

    console.log(`Testing: ${region}...`);
    try {
      const client = await pool.connect();
      console.log(`✅ MATCH FOUND! Region: ${region}`);
      await client.release();
      await pool.end();
      process.exit(0);
    } catch (err) {
      console.log(`❌ ${region}: ${err.message}`);
      await pool.end();
    }
  }
  console.log('No matches found.');
  process.exit(1);
}

scan();
