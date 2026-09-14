const fs = require('fs');

// 1. Update server.cjs
let serverContent = fs.readFileSync('backend/server.cjs', 'utf8');
serverContent = serverContent.replace(
  /if \(process.env.ENABLE_AD_SIMULATOR !== 'false'\)/g, 
  "if (process.env.ENABLE_AD_SIMULATOR === 'true')"
);
fs.writeFileSync('backend/server.cjs', serverContent);

// 2. Add to .env
if (fs.existsSync('.env')) {
  fs.appendFileSync('.env', '\nENABLE_AD_SIMULATOR=false\n');
}
if (fs.existsSync('backend/.env')) {
  fs.appendFileSync('backend/.env', '\nENABLE_AD_SIMULATOR=false\n');
}

console.log('Disabled Ad Simulator by default');
