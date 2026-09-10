const fs = require('fs');
let file = fs.readFileSync('pages/crm/TelephonyHub.tsx', 'utf8');

file = file.replace(
    /const apiFetch = \(url: string, options: RequestInit = \{\}\) => \{/g,
    `const API_BASE = import.meta.env.VITE_API_URL || '';
const apiFetch = (path: string, options: RequestInit = {}) => {
  const url = path.startsWith('http') ? path : \`\${API_BASE}\${path}\`;`
);

fs.writeFileSync('pages/crm/TelephonyHub.tsx', file);
console.log('Fixed apiFetch to use API_BASE');
