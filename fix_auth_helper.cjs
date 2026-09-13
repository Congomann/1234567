const fs = require('fs');
let content = fs.readFileSync('backend/services/root-api/authHelper.js', 'utf8');
content = content.replace("authApi.createToken({ createTokenRequest: requestBody })", "authApi.createToken({ authTokenParameters: requestBody })");
content = content.replace("const jwtToken = tokenObj.token;", "const jwtToken = tokenObj.token; // Update the API client default authentication\n      this.apiClient.authentications['root_jwt'] = {\n        type: 'apiKey',\n        in: 'header',\n        name: 'Authorization',\n        apiKey: `Bearer ${jwtToken}`\n      };");
fs.writeFileSync('backend/services/root-api/authHelper.js', content);
