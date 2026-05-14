
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: './backend/.env' });

async function runSync() {
    let connectionString = process.env.DATABASE_URL;
    
    // Auto-heal Supabase Pooler Tenancy issues
    if (connectionString && connectionString.includes('pooler.supabase.com')) {
        try {
            const dbUrl = new URL(connectionString);
            const sbUrl = process.env.SUPABASE_URL;
            const projectRef = sbUrl ? sbUrl.match(/https:\/\/([^.]+)\./)?.[1] : null;
            
            if (projectRef && dbUrl.username) {
                const parts = dbUrl.username.split('.');
                const currentRef = parts.length > 1 ? parts[1] : null;
                
                if (currentRef !== projectRef) {
                    dbUrl.username = `postgres.${projectRef}`;
                    connectionString = dbUrl.toString();
                    console.log(`[Sync] Forced correct project ref: ${projectRef} (Was: ${currentRef || 'none'})`);
                }
            }
        } catch (e) {
            console.error('[Sync] Failed to auto-heal connection string:', e.message);
        }
    }

    const client = new Client({
        connectionString: connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('[Sync] Connecting to Supabase...');
        await client.connect();
        
        console.log('[Sync] Reading SQL script...');
        const sql = fs.readFileSync('./backend/migrations/supabase_master_sync.sql', 'utf8');
        
        console.log('[Sync] Executing Master Synchronization...');
        // We split by ; to run one by one or just run the whole thing if the driver supports it
        // Most PG drivers handle multiple statements in one query
        await client.query(sql);
        
        console.log('[Sync] ✅ Database synchronized successfully!');
        
        // Add Security RLS and Policies specifically
        console.log('[Sync] Applying Security Policies...');
        const securitySql = `
            ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
            ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
            ALTER TABLE public.logistics_loads ENABLE ROW LEVEL SECURITY;
            ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

            DROP POLICY IF EXISTS "Advisors see assigned leads" ON public.leads;
            CREATE POLICY "Advisors see assigned leads" ON public.leads FOR ALL USING (auth.uid() = assigned_to);

            DROP POLICY IF EXISTS "Anyone can see available loads" ON public.logistics_loads;
            CREATE POLICY "Anyone can see available loads" ON public.logistics_loads FOR SELECT USING (status = 'available');

            DROP POLICY IF EXISTS "Advisors manage their own loads" ON public.logistics_loads;
            CREATE POLICY "Advisors manage their own loads" ON public.logistics_loads FOR ALL USING (auth.uid() = advisor_id);
        `;
        await client.query(securitySql);
        console.log('[Sync] ✅ Security hardening complete!');

    } catch (err) {
        console.error('[Sync] ❌ Error:', err.message);
        if (err.message.includes('authentication failed')) {
            console.error('[Sync] TIP: Check your DATABASE_URL password and project ref in .env');
        }
    } finally {
        await client.end();
    }
}

runSync();
