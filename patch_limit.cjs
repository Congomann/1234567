const fs = require('fs');
let content = fs.readFileSync('backend/server.cjs', 'utf8');

// Replace the loop to only slice the first 3
content = content.replace(
  "for (const item of messages) {",
  "for (const item of messages.slice(0, 3)) {"
);

fs.writeFileSync('backend/server.cjs', content);
