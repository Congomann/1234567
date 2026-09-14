const fs = require('fs');
const filePath = 'services/database.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Increment DB_VERSION to force upgrade
content = content.replace(/const DB_VERSION = 6;/, 'const DB_VERSION = 7;');

// Add 'pdf_cache' to stores array
content = content.replace(
  "const stores = ['leads', 'clients', 'users', 'settings', 'logs', 'workflows', 'events', 'resources', 'testimonials', 'bank_verifications', 'properties', 'chat_channels', 'chat_messages', 'case_notes'];",
  "const stores = ['leads', 'clients', 'users', 'settings', 'logs', 'workflows', 'events', 'resources', 'testimonials', 'bank_verifications', 'properties', 'chat_channels', 'chat_messages', 'case_notes', 'pdf_cache'];"
);

fs.writeFileSync(filePath, content);
console.log('Patched database.ts');
