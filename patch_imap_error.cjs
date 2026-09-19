const fs = require('fs');
let content = fs.readFileSync('backend/server.cjs', 'utf8');

content = content.replace(
  "const all = await connection.getPartsData(item, ['TEXT']);",
  "// removed getPartsData"
);

fs.writeFileSync('backend/server.cjs', content);
