const fs = require('fs');
const path = './App.tsx';
let content = fs.readFileSync(path, 'utf8');

const target = "import { DataProvider, useData } from './context/DataContext';";
const replacement = `import { DataProvider, useData } from './context/DataContext';
import ContractingHub from './pages/crm/ContractingHub';
import ContractingAdmin from './pages/admin/ContractingAdmin';
import ContractingReviewQueue from './pages/admin/ContractingReviewQueue';`;

if (!content.includes('import ContractingHub')) {
  content = content.replace(target, replacement);
  fs.writeFileSync(path, content);
  console.log("Patched App.tsx successfully.");
} else {
  console.log("Already imported.");
}
