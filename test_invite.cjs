const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgres://postgres.spwvazzkjjcybxaojzmh:Newholland%402026@aws-1-us-east-2.pooler.supabase.com:6543/postgres' });
const crypto = require('crypto');

async function run() {
  try {
    const inviteToken = crypto.randomBytes(32).toString('hex');
    const query = `
      INSERT INTO users (name, email, role, category, status, invite_token, onboarding_completed, contract_level)
      VALUES ($1, $2, $3, $4, 'pending_activation', $5, false, $6)
      ON CONFLICT (email) DO UPDATE 
      SET invite_token = EXCLUDED.invite_token, status = 'pending_activation', contract_level = EXCLUDED.contract_level
      RETURNING *
    `;
    const { rows } = await pool.query(query, ['Remy Trek', 'remytrek@gmail.com', 'Advisor', 'Insurance & General', inviteToken, 80]);
    console.log('Inserted into DB:', rows[0].email);
    console.log('Invite Link: https://newhollandfinancial.com/onboarding/setup?token=' + inviteToken);
  } catch (e) {
    console.error('DB Error:', e);
  }
  process.exit(0);
}
run();
