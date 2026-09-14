const fs = require('fs');

// 1. Update .env files if they exist
const envFiles = ['backend/.env', '.env', '.env.local'];
for (const file of envFiles) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/SMTP_PASS=.*/g, 'SMTP_PASS=SalesNew@2026');
    fs.writeFileSync(file, content);
    console.log('Updated ' + file);
  }
}

// 2. Update server.cjs fallback
const serverPath = 'backend/server.cjs';
if (fs.existsSync(serverPath)) {
  let serverContent = fs.readFileSync(serverPath, 'utf8');
  // Replacing old fallback if any
  serverContent = serverContent.replace(/'NewHollandSales26'/g, "'SalesNew@2026'");
  fs.writeFileSync(serverPath, serverContent);
  console.log('Updated server.cjs fallback');
}

// 3. Update imapMonitor.cjs fallback
const imapPath = 'backend/services/imapMonitor.cjs';
if (fs.existsSync(imapPath)) {
  let imapContent = fs.readFileSync(imapPath, 'utf8');
  imapContent = imapContent.replace(/'NewHollandSales26'/g, "'SalesNew@2026'");
  fs.writeFileSync(imapPath, imapContent);
  console.log('Updated imapMonitor.cjs fallback');
}
