const fs = require('fs');
let content = fs.readFileSync('backend/server.cjs', 'utf8');

content = content.replace(/expiresIn: '10m'/g, "expiresIn: '7d'");
content = content.replace(/expiresIn: '2h'/g, "expiresIn: '7d'");

fs.writeFileSync('backend/server.cjs', content);
console.log("Patched server.cjs JWT expiration to 7 days");
