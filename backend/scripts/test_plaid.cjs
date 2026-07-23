const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');

const client_id = process.env.PLAID_CLIENT_ID;
const secret = process.env.PLAID_SECRET;
const env = process.env.PLAID_ENV || 'production';

console.log('Testing Plaid API Configuration...');
console.log(`Env: ${env}`);
console.log(`Client ID: ${client_id}`);
console.log(`Secret: ${secret?.slice(0, 4)}...`);

const envMap = {
  sandbox: PlaidEnvironments.sandbox,
  development: PlaidEnvironments.development,
  production: PlaidEnvironments.production,
};

const configuration = new Configuration({
  basePath: envMap[env] || PlaidEnvironments.production,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': client_id,
      'PLAID-SECRET': secret,
    },
  },
});

const client = new PlaidApi(configuration);

async function testPlaid() {
  try {
    const res = await client.linkTokenCreate({
      user: { client_user_id: 'test-user-123' },
      client_name: 'New Holland Financial Group',
      products: ['auth', 'identity'],
      country_codes: ['US'],
      language: 'en',
    });
    console.log('🎉 SUCCESS! Plaid Link Token Created:', res.data.link_token);
  } catch (err) {
    console.error('❌ Plaid Test Failed:', err.response?.data || err.message);
  }
}

testPlaid();
