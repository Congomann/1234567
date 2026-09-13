const fs = require('fs');
const path = './App.tsx';
let content = fs.readFileSync(path, 'utf8');

// Imports
content = content.replace(
  "import ContractingReviewQueue from './pages/admin/ContractingReviewQueue';",
  "import ContractingReviewQueue from './pages/admin/ContractingReviewQueue';\nimport CarrierFormBuilder from './pages/admin/CarrierFormBuilder';"
);

// Admin Routes
content = content.replace(
  '<Route path="admin/contracting/queue" element={<ContractingReviewQueue />} />',
  '<Route path="admin/contracting/queue" element={<ContractingReviewQueue />} />\n                <Route path="admin/contracting/builder" element={<CarrierFormBuilder />} />'
);

fs.writeFileSync(path, content);
