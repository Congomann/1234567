const fs = require('fs');
let content = fs.readFileSync('backend/server.cjs', 'utf8');
content = content.replace(
  "const bcrypt = require('bcryptjs');\n    const passwordHash = await bcrypt.hash(password, 10);",
  "const passwordHash = require('crypto').createHash('sha256').update(password).digest('hex');"
);
fs.writeFileSync('backend/server.cjs', content);
