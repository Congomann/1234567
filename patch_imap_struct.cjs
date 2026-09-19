const fs = require('fs');
let content = fs.readFileSync('backend/server.cjs', 'utf8');

content = content.replace(
  "const fetchOptions = { bodies: ['HEADER', 'TEXT'], struct: true, markSeen: true };",
  "const fetchOptions = { bodies: ['HEADER', 'TEXT'], markSeen: true };"
);

fs.writeFileSync('backend/server.cjs', content);
