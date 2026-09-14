const fs = require('fs');
const path = './backend/server.cjs';
let content = fs.readFileSync(path, 'utf8');

const target = `    console.log(\`NHFG CRM API Server running on port \${PORT}\`);`;
const replacement = `    console.log(\`NHFG CRM API Server running on port \${PORT}\`);
    
    // Start Carrier Contracting IMAP Mailbox Monitor
    try {
      const { startMailMonitor } = require('./services/imapMonitor.cjs');
      startMailMonitor();
    } catch (e) {
      console.error('Failed to boot IMAP monitor:', e);
    }`;

if(content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(path, content);
  console.log("Patched successfully");
} else {
  console.log("Target not found!");
}
