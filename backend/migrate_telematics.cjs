const fs = require('fs');
const { Pool } = require('pg');
require('dotenv').config();

async function applySchema() {
  const pool = new Pool({
    connectionString: process.env.POSTGRES_URL.replace('?sslmode=require&supa=base-pooler.x', ''),
    ssl: { rejectUnauthorized: false }
  });

  try {
    const schemaSql = `
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    CREATE TABLE IF NOT EXISTS telematics_logs (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        load_id TEXT NOT NULL,
        lat DOUBLE PRECISION NOT NULL,
        lng DOUBLE PRECISION NOT NULL,
        speed DOUBLE PRECISION,
        heading DOUBLE PRECISION,
        recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS road_events (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        event_type TEXT NOT NULL,
        lat DOUBLE PRECISION NOT NULL,
        lng DOUBLE PRECISION NOT NULL,
        reported_by TEXT,
        reported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        active BOOLEAN DEFAULT TRUE,
        upvotes INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS load_waypoints (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        load_id TEXT NOT NULL,
        lat DOUBLE PRECISION NOT NULL,
        lng DOUBLE PRECISION NOT NULL,
        type TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        completed_at TIMESTAMP WITH TIME ZONE
    );
    `;
    console.log('Applying telematics schema...');
    await pool.query(schemaSql);
    console.log('Telematics schema applied successfully.');
  } catch (err) {
    console.error('Error applying schema:', err);
  } finally {
    await pool.end();
  }
}
applySchema();
