const fs = require('fs');
let content = fs.readFileSync('api/index.js', 'utf8');

if (!content.includes('maxDuration')) {
  content = "export const maxDuration = 60;\n" + content;
  fs.writeFileSync('api/index.js', content);
  console.log("Added maxDuration to api/index.js");
}
