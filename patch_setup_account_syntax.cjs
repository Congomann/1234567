const fs = require('fs');
const path = './pages/onboarding/SetupAccount.tsx';
let content = fs.readFileSync(path, 'utf8');

// The file literally contains \`, so we replace it with `
content = content.replace(/\\\`/g, '`');

fs.writeFileSync(path, content);
