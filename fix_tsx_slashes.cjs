const fs = require('fs');
const files = [
  './pages/admin/ContractingAdmin.tsx',
  './pages/crm/ContractingHub.tsx',
  './pages/admin/ContractingReviewQueue.tsx'
];

files.forEach(file => {
  try {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes('\\`')) {
      content = content.replace(/\\\`/g, '`').replace(/\\\$/g, '$');
      fs.writeFileSync(file, content);
      console.log(\`Fixed \${file}\`);
    }
  } catch (e) {}
});
