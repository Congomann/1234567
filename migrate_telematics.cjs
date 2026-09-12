const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '/Users/newholland/1234567/backend/.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY);

async function run() {
    console.log("Applying Telematics SQL...");
    const sql = `
    CREATE TABLE IF NOT EXISTS telematics_logs (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        load_id TEXT NOT NULL,
        lat DOUBLE PRECISION NOT NULL,
        lng DOUBLE PRECISION NOT NULL,
        speed DOUBLE PRECISION,
        heading DOUBLE PRECISION,
        recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS road_events (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        event_type TEXT NOT NULL,
        lat DOUBLE PRECISION NOT NULL,
        lng DOUBLE PRECISION NOT NULL,
        reported_by TEXT,
        reported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        active BOOLEAN DEFAULT TRUE,
        upvotes INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS load_waypoints (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        load_id TEXT NOT NULL,
        lat DOUBLE PRECISION NOT NULL,
        lng DOUBLE PRECISION NOT NULL,
        type TEXT NOT NULL, -- pickup, dropoff, stop
        status TEXT DEFAULT 'pending', -- pending, completed
        completed_at TIMESTAMP WITH TIME ZONE
    );
    `;
    
    // Check if we can execute raw SQL (only possible in pg library, Supabase JS doesn't have raw query support natively unless through RPC)
    // Actually, I can use the same method used in backend/apply_schema.cjs
}
run();
