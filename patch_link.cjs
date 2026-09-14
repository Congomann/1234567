const fs = require('fs');
let content = fs.readFileSync('pages/admin/ContractingAdmin.tsx', 'utf8');

const linkTarget = `<Link to="/crm/admin/contracting/builder" className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500">`;
const linkReplacement = `{/* Dynamic link with carrier param */}
                              <Link to={\`/crm/admin/contracting/builder?carrier=\${encodeURIComponent(carrier.name)}\`} className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500">`;
content = content.replace(linkTarget, linkReplacement);
fs.writeFileSync('pages/admin/ContractingAdmin.tsx', content);
console.log('Patched link in ContractingAdmin.tsx');
