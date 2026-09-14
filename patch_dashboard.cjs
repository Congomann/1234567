const fs = require('fs');
let content = fs.readFileSync('pages/crm/Dashboard.tsx', 'utf8');

// Replace specific lines with zeroed values
content = content.replace(/value: "\$142\.8M"/g, 'value: "$0"');
content = content.replace(/value: "18"/g, 'value: "0"');
content = content.replace(/Total Value: \$18\.4M/g, 'Total Value: $0');
content = content.replace(/value: "42"/g, 'value: "0"');
content = content.replace(/Total Loads: 128/g, 'Total Loads: 0');
content = content.replace(/value: "750"/g, 'value: "0"');
content = content.replace(/value: "150"/g, 'value: "0"');
content = content.replace(/<p className="text-4xl font-black text-slate-900 tracking-tight mb-2">\$142\.8M<\/p>/g, '<p className="text-4xl font-black text-slate-900 tracking-tight mb-2">$0</p>');

fs.writeFileSync('pages/crm/Dashboard.tsx', content);
console.log('Patched Dashboard.tsx');
