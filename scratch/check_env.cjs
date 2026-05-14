const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', 'backend', '.env') });

console.log('PORT:', process.env.PORT);
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'DEFINED' : 'UNDEFINED');
if (process.env.DATABASE_URL) {
    try {
        const url = new URL(process.env.DATABASE_URL);
        console.log('DB Host:', url.host);
        console.log('DB User:', url.username);
    } catch (e) {
        console.log('DB URL Parse Error:', e.message);
    }
}
console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
