const fs = require('fs');
const path = './App.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add import
const importStatement = "import { RootInsuranceDashboard } from './pages/crm/insurance/RootInsuranceDashboard';\n";
content = importStatement + content;

// Add Route inside ProtectedCRMRoute -> CRMLayout -> Routes
const routeStatement = "              <Route path=\"root-insurance\" element={<RootInsuranceDashboard />} />\n";
content = content.replace("              {/* VERTICAL HUBS */}", "              {/* VERTICAL HUBS */}\n" + routeStatement);

fs.writeFileSync(path, content);
