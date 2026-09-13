const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgres://postgres.spwvazzkjjcybxaojzmh:Newholland%402026@aws-1-us-east-2.pooler.supabase.com:6543/postgres' });
const inviteToken = 'testtoken';
const query = `
      INSERT INTO users (name, email, role, category, status, invite_token, onboarding_completed, contract_level)
      VALUES ($1, $2, $3, $4, 'pending_activation', $5, false, $6)
      ON CONFLICT (email) DO UPDATE 
      SET invite_token = EXCLUDED.invite_token, status = 'pending_activation', contract_level = EXCLUDED.contract_level
      RETURNING *
    `;
pool.query(query, ["Test", "test123456@gmail.com", "Advisor", "Insurance & General", inviteToken, 67])
  .then(res => console.log("SUCCESS:", res.rows[0]))
  .catch(err => console.error("SQL ERROR:", err))
  .finally(() => pool.end());
