const fs = require('fs');
let content = fs.readFileSync('pages/crm/ContractingHub.tsx', 'utf8');

const updatedHandleStart = `const handleStart = async (pkg: any) => {
    if (pkg.version === 'EXTERNAL_URL') {
      window.open(pkg.eligibility, '_blank');
      return;
    }
    // 1. Create a new "In Progress" submission`;

content = content.replace(
  'const handleStart = async (pkg: any) => {\n    // 1. Create a new "In Progress" submission',
  updatedHandleStart
);

fs.writeFileSync('pages/crm/ContractingHub.tsx', content);
console.log('Patched handleStart for external URLs.');
