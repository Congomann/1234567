const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgres://postgres.ntkcknugzzvmslksvwnx:Newholland@2026@aws-0-us-east-1.pooler.supabase.com:6543/postgres' }); 
// wait, I don't know the exact username for the Supabase instance, it was obfuscated as `postgres:****@aws-1-us-east-2.pooler.supabase.com:6543/postgres`
