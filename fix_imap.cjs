const fs = require('fs');
let code = fs.readFileSync('backend/services/imapMonitor.cjs', 'utf8');
code = code.replace(/\\\`/g, '`').replace(/\\\$/g, '$');
fs.writeFileSync('backend/services/imapMonitor.cjs', code);
