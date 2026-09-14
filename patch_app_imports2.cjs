const fs = require('fs');
const path = './App.tsx';
let content = fs.readFileSync(path, 'utf8');

const target = "import ContractingReviewQueue from './pages/admin/ContractingReviewQueue';";
const replacement = `import ContractingReviewQueue from './pages/admin/ContractingReviewQueue';
import CarrierFormBuilder from './pages/admin/CarrierFormBuilder';`;

content = content.replace(target, replacement);
fs.writeFileSync(path, content);
