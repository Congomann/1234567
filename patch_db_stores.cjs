const fs = require('fs');
let db = fs.readFileSync('services/database.ts', 'utf8');

db = db.replace(/const DB_VERSION = \d+;/, 'const DB_VERSION = 8;');

db = db.replace(
  "const stores = ['leads', 'clients', 'users', 'settings', 'logs', 'workflows', 'events', 'resources', 'testimonials', 'bank_verifications', 'properties', 'chat_channels', 'chat_messages', 'case_notes', 'pdf_cache'];",
  "const stores = ['leads', 'clients', 'users', 'settings', 'logs', 'workflows', 'events', 'resources', 'testimonials', 'bank_verifications', 'properties', 'chat_channels', 'chat_messages', 'case_notes', 'pdf_cache', 'carrier_fields', 'carrier_packages', 'contracting_submissions'];"
);

fs.writeFileSync('services/database.ts', db);
console.log('Patched database stores');
