const fs = require('fs');
const path = './App.tsx';
let content = fs.readFileSync(path, 'utf8');

// Imports
content = content.replace(
  "import CarrierAssignment from './pages/admin/CarrierAssignment';",
  "import CarrierAssignment from './pages/admin/CarrierAssignment';\nimport ContractingAdmin from './pages/admin/ContractingAdmin';\nimport ContractingReviewQueue from './pages/admin/ContractingReviewQueue';\nimport ContractingHub from './pages/crm/ContractingHub';"
);

// Advisor Route
content = content.replace(
  '<Route path="logistics" element={<CRMLogisticsHub />} />',
  '<Route path="logistics" element={<CRMLogisticsHub />} />\n              <Route path="contracting" element={<ContractingHub />} />'
);

// Admin Routes
content = content.replace(
  '<Route path="admin/routing" element={<AdvisorRoutingPage />} />',
  '<Route path="admin/routing" element={<AdvisorRoutingPage />} />\n                <Route path="admin/contracting" element={<ContractingAdmin />} />\n                <Route path="admin/contracting/queue" element={<ContractingReviewQueue />} />'
);

fs.writeFileSync(path, content);
