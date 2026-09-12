const fs = require('fs');
const file = '/Users/newholland/1234567/backend/routes/integrations.cjs';
let content = fs.readFileSync(file, 'utf8');

const oldScope = "scope=https://www.googleapis.com/auth/adwords";
const newScope = "scope=" + encodeURIComponent("https://www.googleapis.com/auth/adwords https://www.googleapis.com/auth/analytics.readonly https://www.googleapis.com/auth/youtube.readonly");

content = content.replace(oldScope, newScope);
fs.writeFileSync(file, content);
