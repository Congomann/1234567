const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://boylqkqyclzayrupbrbd.supabase.co';
// Use SERVICE_ROLE_KEY if available (production), otherwise fallback to ANON_KEY
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJveWxxa3F5Y2x6YXlydXBicmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4NzUwMDMsImV4cCI6MjA4OTQ1MTAwM30.d4DQgFvziDsPktaUjGeUuNI7U1ehxLiz4_l8bNc9B3M';

if (!supabaseUrl || !supabaseKey) {
  console.warn("⚠️ [Supabase] Missing Supabase Keys! Check your Vercel Environment Variables.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
