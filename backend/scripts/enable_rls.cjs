const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.SUPABASE_DB_URL;

const pool = new Pool({
  connectionString: connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const run = async () => {
  try {
    console.log('Enabling Row Level Security (RLS) and creating policies...');

    const tables = ['leads', 'bank_verifications', 'plaid_items', 'advisor_billing', 'plaid_usage_logs'];

    for (const table of tables) {
      console.log(`- Configuring RLS on ${table}`);
      await pool.query(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`);
      // Force RLS even for the table owner (optional, but requested for 'enforcing')
      await pool.query(`ALTER TABLE ${table} FORCE ROW LEVEL SECURITY;`);
      
      await pool.query(`DROP POLICY IF EXISTS ${table}_isolation_policy ON ${table};`);

      let advisorCol = 'advisor_id';
      if (table === 'bank_verifications') advisorCol = 'sent_by';
      if (table === 'plaid_items') advisorCol = 'created_by';
      if (table === 'leads') advisorCol = 'assigned_to';
      if (table === 'advisor_billing') advisorCol = 'user_id';

      await pool.query(`
        CREATE POLICY ${table}_isolation_policy ON ${table}
        USING (
          current_setting('app.user_role', true) = 'Administrator' OR 
          ${advisorCol}::text = current_setting('app.user_id', true)
        );
      `);
    }

    console.log('✅ RLS Policies created successfully and FORCED.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error enabling RLS:', err);
    process.exit(1);
  }
};

run();
