const fs = require('fs');
let content = fs.readFileSync('pages/admin/CarrierFormBuilder.tsx', 'utf8');

// Inside handleAutoDetect, we have:
// name: df.label || 'Unknown Field',
// We will change it to:
// name: '',

content = content.replace("name: df.label || 'Unknown Field',", "name: '', // Do not auto-fill name to avoid repeating the text on the PDF");
fs.writeFileSync('pages/admin/CarrierFormBuilder.tsx', content);
console.log('Patched handleAutoDetect to not set name');
