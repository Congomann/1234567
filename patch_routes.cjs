const fs = require('fs');

// 1. Update App.tsx
let appStr = fs.readFileSync('App.tsx', 'utf8');

const importAdminStatement = `import ContractingAdmin from './pages/admin/ContractingAdmin';`;
const newImportAdmin = `import ContractingAdmin from './pages/admin/ContractingAdmin';\nimport CarrierIntegrations from './pages/admin/CarrierIntegrations';`;

if (!appStr.includes('import CarrierIntegrations')) {
    appStr = appStr.replace(importAdminStatement, newImportAdmin);
}

const adminRoute = `<Route path="admin/carriers" element={<CarrierAssignment />} />`;
const newAdminRoute = `<Route path="admin/carriers" element={<CarrierAssignment />} />\n                <Route path="admin/carrier-apis" element={<CarrierIntegrations />} />`;

if (!appStr.includes('admin/carrier-apis')) {
    appStr = appStr.replace(adminRoute, newAdminRoute);
}

fs.writeFileSync('App.tsx', appStr);
console.log('App.tsx updated');

// 2. Update CRMData.tsx sidebar
let crmData = fs.readFileSync('components/CRMData.tsx', 'utf8');

const carrierSetupEntry = `admin.push({ path: '/crm/admin/carriers', label: 'Carrier Setup', icon: ShieldCheck, tourId: 'nav-carrier-setup' });`;
const newCarrierSetupEntry = `admin.push({ path: '/crm/admin/carriers', label: 'Carrier Setup', icon: ShieldCheck, tourId: 'nav-carrier-setup' });\n            admin.push({ path: '/crm/admin/carrier-apis', label: 'Carrier APIs', icon: ShieldCheck, tourId: 'nav-carrier-apis' });`; 

if (!crmData.includes('/crm/admin/carrier-apis')) {
    crmData = crmData.replace(carrierSetupEntry, newCarrierSetupEntry);
    fs.writeFileSync('components/CRMData.tsx', crmData);
    console.log('CRMData.tsx updated');
}

