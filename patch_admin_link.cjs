const fs = require('fs');
const filePath = 'pages/admin/ContractingAdmin.tsx';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  '<Link to="/crm/admin/contracting/builder" className="font-medium text-blue-600 hover:text-blue-500 text-sm">',
  '<Link to={`/crm/admin/contracting/builder?carrier=${encodeURIComponent(carrier.name)}`} className="font-medium text-blue-600 hover:text-blue-500 text-sm">'
);

fs.writeFileSync(filePath, content);
console.log('Patched ContractingAdmin.tsx link');
