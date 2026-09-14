const fs = require('fs');

const files = [
  'pages/admin/ContractingAdmin.tsx',
  'pages/crm/ContractingHub.tsx',
  'pages/admin/ContractingReviewQueue.tsx',
  'pages/admin/CarrierFormBuilder.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/primary-500/g, 'blue-500');
    content = content.replace(/primary-600/g, 'blue-600');
    content = content.replace(/primary-700/g, 'blue-700');
    fs.writeFileSync(file, content);
  }
});
console.log("Fixed primary color bug");
