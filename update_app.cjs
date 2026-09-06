const fs = require('fs');
let file = fs.readFileSync('App.tsx', 'utf8');

// Add import
file = file.replace(/import \{ BankVerification \} from '\.\/pages\/crm\/BankVerification';/g, "import { BankVerification } from './pages/crm/BankVerification';\nimport { TrillionCalculatorHub } from './components/TrillionCalculatorHub';");

// Add route
file = file.replace(/<Route path="bank-verification" element=\{<BankVerification \/>\} \/>/g, '<Route path="bank-verification" element={<BankVerification />} />\n              <Route path="precision-intelligence" element={<TrillionCalculatorHub />} />');

fs.writeFileSync('App.tsx', file);
console.log('Updated App.tsx');
