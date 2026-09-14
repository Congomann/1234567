const fs = require('fs');
let code = fs.readFileSync('backend/server.cjs', 'utf8');
code = code.replace(/\\\`/g, '`').replace(/\\\$/g, '$');
fs.writeFileSync('backend/server.cjs', code);
