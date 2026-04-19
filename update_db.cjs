const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, 'backend/.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  try {
    const client = await pool.connect();
    console.log('Connected to DB');
    
    const ddl = `
      CREATE TABLE IF NOT EXISTS bank_accounts (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id),
        access_token TEXT NOT NULL,
        bank_name TEXT,
        account_mask TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS balances (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id),
        current_balance NUMERIC,
        last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS transactions_plaid (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id),
        amount NUMERIC,
        name TEXT,
        category TEXT,
        date DATE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS risk_scores (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id),
        score TEXT,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      
      -- Optional Index creation (ignore if exists)
      CREATE INDEX IF NOT EXISTS idx_bank_accounts_user_id ON bank_accounts(user_id);
      CREATE INDEX IF NOT EXISTS idx_balances_user_id ON balances(user_id);
      CREATE INDEX IF NOT EXISTS idx_transactions_plaid_user_id ON transactions_plaid(user_id);
      CREATE INDEX IF NOT EXISTS idx_risk_scores_user_id ON risk_scores(user_id);
    `;

    await client.query(ddl);
    console.log('Tables created successfully.');
    client.release();
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await pool.end();
  }
}

run();
