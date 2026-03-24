const { Pool } = require('pg');

const projectRef = 'kgpwgqbhethkowmcrsso';
const passwords = ['2027Newholand', 'Congomani@2027', 'Congomani%402027'];
const regions = [
  'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
  'ca-central-1', 'sa-east-1', 
  'eu-west-1', 'eu-west-2', 'eu-west-3', 'eu-central-1', 'eu-north-1',
  'ap-southeast-1', 'ap-southeast-2', 'ap-northeast-1', 'ap-northeast-2', 'ap-south-1',
  'me-central-1', 'af-south-1'
];

async function testAll() {
  for (const region of regions) {
    for (const password of passwords) {
      const host = `aws-0-${region}.pooler.supabase.com`;
      // Pooler uses port 6543
      const connectionString = `postgres://postgres.${projectRef}:${encodeURIComponent(password)}@${host}:6543/postgres`;
      
      const pool = new Pool({
        connectionString,
        connectionTimeoutMillis: 5000,
        ssl: { rejectUnauthorized: false }
      });

      console.log(`Testing: ${region} with password ${password}...`);
      try {
        const client = await pool.connect();
        console.log(`✅ SUCCESS! Connection established for ${region} with password ${password}`);
        const res = await client.query('SELECT current_database();');
        console.log('DB:', res.rows[0]);
        await client.release();
        await pool.end();
        process.exit(0);
      } catch (err) {
        if (err.message.includes('password authentication failed') || err.message.includes('Tenant or user not found')) {
           // normal failure, ignore
        } else {
           console.log(`❌ FAILED (${region}): ${err.message}`);
        }
        await pool.end();
      }
    }
  }
  console.log('Final Error: No regions/passwords matched.');
  process.exit(1);
}

testAll();
