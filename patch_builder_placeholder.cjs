const fs = require('fs');
let content = fs.readFileSync('pages/admin/CarrierFormBuilder.tsx', 'utf8');

content = content.replace(
  'placeholder="Type field name..."',
  'placeholder={selectedFieldId === field.id ? "Type name..." : ""}'
);

fs.writeFileSync('pages/admin/CarrierFormBuilder.tsx', content);
console.log('Patched placeholder visibility');
