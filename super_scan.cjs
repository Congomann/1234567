const { Pool } = require('pg');

const regions = [
  'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2', 'ca-central-1',
  'eu-west-1', 'eu-west-2', 'eu-west-3', 'eu-central-1',
  'ap-southeast-1', 'ap-southeast-2', 'ap-northeast-1', 'ap-northeast-2',
  'ap-south-1', 'sa-east-1'
];
const projectRef = 'boylqkqyclzayrupbrbd';
const password = '2027Newholand';

async function superScan() {
  for (const region of regions) {
    const host = `aws-0-${region}.pooler.supabase.com`;
    const variations = [
      { user: `postgres.${projectRef}`, port: 5432 },
      { user: `postgres.${projectRef}`, port: 6543 },
      { user: 'postgres', port: 5432 },
      { user: 'postgres', port: 6543 }
    ];

    for (const v of variations) {
      console.log(`Testing ${region}: ${v.user}@${host}:${v.port}...`);
      const pool = new Pool({
        user: v.user,
        host: host,
        database: 'postgres',
        password: password,
        port: v.port,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 2000
      });

      try {
        const client = await pool.connect();
        console.log(`\n✅ FOUND IT!`);
        console.log(`Region: ${region}`);
        console.log(`User: ${v.user}`);
        console.log(`Port: ${v.port}`);
        await client.release();
        await pool.end();
        process.exit(0);
      } catch (err) {
        // console.log(`❌ ${err.message}`);
        await pool.end();
      }
    }
  }
  console.log('\n❌ No combination worked.');
  process.exit(1);
}

superScan();
