const { Client } = require('pg');
const { Resolver } = require('dns').promises;

const projectRef = 'boylqkqyclzayrupbrbd';
const password = '2027Newholand';
const resolver = new Resolver();
resolver.setServers(['8.8.8.8']); // Use Google DNS

async function testDnsAndConnect() {
  const hosnames = [
    `db.${projectRef}.supabase.co`,
    `aws-0-us-east-2.pooler.supabase.com`,
    `aws-0-us-east-1.pooler.supabase.com`
  ];

  for (const host of hosnames) {
    console.log(`Resolving ${host}...`);
    try {
      const addresses = await resolver.resolve4(host);
      console.log(`Resolved ${host} to [${addresses.join(', ')}]`);
      
      const config = {
        user: host.startsWith('db.') ? 'postgres' : `postgres.${projectRef}`,
        host: addresses[0],
        database: 'postgres',
        password: password,
        port: host.includes('pooler') ? 6543 : 5432,
        ssl: { rejectUnauthorized: false }
      };

      console.log(`Connecting to ${config.user}@${config.host}:${config.port}...`);
      const client = new Client(config);
      await client.connect();
      console.log('✅ SUCCESS! Connection established.');
      await client.end();
      process.exit(0);
    } catch (err) {
      console.log(`❌ FAILED: ${err.message}`);
    }
  }
}

testDnsAndConnect();
