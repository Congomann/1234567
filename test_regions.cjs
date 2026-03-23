const { Pool } = require('pg');

const regions = [
  'ap-southeast-1', 'ap-southeast-2', 'ap-northeast-1', 'ap-northeast-2',
  'eu-west-1', 'eu-west-2', 'eu-west-3', 'eu-central-1',
  'sa-east-1', 'me-central-1', 'af-south-1'
];
const password = 'Congomani%402027';
const projectRef = 'boylqkqyclzayrupbrbd';

async function testRegions() {
  for (const region of regions) {
    const host = `aws-0-${region}.pooler.supabase.com`;
    const connectionString = `postgres://postgres.${projectRef}:${password}@${host}:6543/postgres`;
    
    const pool = new Pool({
      connectionString,
      connectionTimeoutMillis: 5000,
      ssl: { rejectUnauthorized: false }
    });

    console.log(`Testing region: ${region} (${host})...`);
    try {
      const client = await pool.connect();
      console.log(`✅ SUCCESS: Found correct region: ${region}`);
      await client.release();
      await pool.end();
      process.exit(0);
    } catch (err) {
      console.log(`❌ FAILED: ${region} - ${err.message}`);
      await pool.end();
    }
  }
  console.log('Final Error: No regions matched.');
  process.exit(1);
}

testRegions();
