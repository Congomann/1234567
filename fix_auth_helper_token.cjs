const fs = require('fs');
let content = fs.readFileSync('backend/services/root-api/authHelper.js', 'utf8');
content = content.replace("const jwtToken = tokenObj.token;", "const jwtToken = tokenObj.bearerToken;");
fs.writeFileSync('backend/services/root-api/authHelper.js', content);
