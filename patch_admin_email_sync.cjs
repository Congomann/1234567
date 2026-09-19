const fs = require('fs');
let content = fs.readFileSync('pages/admin/ContractingAdmin.tsx', 'utf8');

content = content.replace(
  "'Authorization': 'Bearer ' + localStorage.getItem('nhfg_access_token')",
  "'Authorization': 'Bearer ' + (localStorage.getItem('nhfg_access_token') || localStorage.getItem('token') || localStorage.getItem('nhfg_token'))"
);

fs.writeFileSync('pages/admin/ContractingAdmin.tsx', content);
console.log("Patched token fallback in ContractingAdmin.tsx");
