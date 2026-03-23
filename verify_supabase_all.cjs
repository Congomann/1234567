const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load env from backend dir
dotenv.config({ path: path.join(__dirname, 'backend', '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyAll() {
  console.log('🚀 Starting Global Supabase Verification...\n');

  const tables = [
    'users',
    'leads',
    'clients',
    'company_settings',
    'workflows',
    'advisor_applications',
    'commission_reconciliations',
    'landing_pages'
  ];

  for (const table of tables) {
    process.stdout.write(`Checking [${table}]... `);
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`❌ FAILED: ${error.message}`);
      } else {
        console.log(`✅ OK (${count} records)`);
      }
    } catch (err) {
      console.log(`❌ ERROR: ${err.message}`);
    }
  }

  console.log('\n🌟 Verification Complete!');
}

verifyAll();
