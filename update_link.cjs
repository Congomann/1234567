const fs = require('fs');
let content = fs.readFileSync('pages/admin/ContractingAdmin.tsx', 'utf8');

if (!content.includes("import { Link }")) {
  content = content.replace("import React, { useState", "import { Link } from 'react-router-dom';\nimport React, { useState");
}

content = content.replace(
  /<button className="font-medium text-blue-600 hover:text-blue-500 text-sm">\s*Map Form Fields\s*<\/button>/g,
  `<Link to="/crm/admin/contracting/builder" className="font-medium text-blue-600 hover:text-blue-500 text-sm">\n                      Map Form Fields\n                    </Link>`
);

fs.writeFileSync('pages/admin/ContractingAdmin.tsx', content);
console.log('Added Link to ContractingAdmin.tsx');
