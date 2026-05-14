const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'backend', '.env') });

async function check() {
    let connectionString = process.env.DATABASE_URL;
    if (connectionString && connectionString.includes('pooler.supabase.com')) {
        const dbUrl = new URL(connectionString);
        const sbUrl = process.env.SUPABASE_URL;
        const projectRef = sbUrl ? sbUrl.match(/https:\/\/([^.]+)\./)?.[1] : null;
        if (projectRef) dbUrl.username = `postgres.${projectRef}`;
        connectionString = dbUrl.toString();
    }

    const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
    try {
        await client.connect();
        const res = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'advisor_applications'
        `);
        console.log('Columns in advisor_applications:');
        res.rows.forEach(r => console.log(` - ${r.column_name} (${r.data_type})`));
    } catch (e) {
        console.error('Check failed:', e.message);
    } finally {
        await client.end();
    }
}
check();
