const { Pool } = require('pg');
require('dotenv').config({ path: '.env' });
let connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.SUPABASE_DB_URL;
if (connectionString && connectionString.includes('pooler.supabase.com')) {
    const sbUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const projectRef = sbUrl ? sbUrl.match(/https:\/\/([^.]+)\./)?.[1] : null;
    if (projectRef) {
        const dbUrl = new URL(connectionString);
        if (dbUrl.username && !dbUrl.username.includes('.')) {
            dbUrl.username = `postgres.${projectRef}`;
            connectionString = dbUrl.toString();
        }
    }
}
const pool = new Pool({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS integration_accounts (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                platform VARCHAR(50) NOT NULL,
                access_token TEXT NOT NULL,
                refresh_token TEXT,
                expires_at TIMESTAMP WITH TIME ZONE,
                external_account_id VARCHAR(255),
                status VARCHAR(50) DEFAULT 'active',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("Table created.");
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}
run();
