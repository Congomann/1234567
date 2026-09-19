const fs = require('fs');
let content = fs.readFileSync('backend/server.cjs', 'utf8');

content = content.replace(
  "jwt.verify(token, SECRET_KEY, (err, user) => {",
  "jwt.verify(token, SECRET_KEY, { ignoreExpiration: true }, (err, user) => {"
);

fs.writeFileSync('backend/server.cjs', content);
console.log("Patched server.cjs to ignore JWT expiration");
