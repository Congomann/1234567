const fs = require('fs');

const files = [
  'pages/crm/ContractingHub.tsx',
  'pages/admin/ContractingAdmin.tsx',
  'pages/admin/ContractingReviewQueue.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(
    "import Backend from '../../services/apiBackend';",
    "import { Backend } from '../../services/apiBackend';"
  );
  fs.writeFileSync(file, content);
});
console.log("Fixed imports");
