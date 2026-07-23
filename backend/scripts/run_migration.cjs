const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function runMigration() {
    const pool = new Pool({
        connectionString: 'postgres://postgres:2027Newholand@db.boylqkqyclzayrupbrbd.supabase.co:5432/postgres',
        ssl: { rejectUnauthorized: false }
    });

    const schemaPath = path.join(__dirname, '../migrations/marketing_schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    try {
        console.log('Running migration...');
        await pool.query(sql);
        console.log('Migration completed successfully.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await pool.end();
    }
}

runMigration();
