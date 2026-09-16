const fs = require('fs');
let content = fs.readFileSync('pages/admin/CarrierFormBuilder.tsx', 'utf8');

content = content.replace(
  "{isDrawMode ? 'Disable Manual Placement' : 'Enable Manual Placement'}",
  "{isDrawMode ? 'Cancel Drawing' : 'Click on PDF to Draw Field'}"
);

fs.writeFileSync('pages/admin/CarrierFormBuilder.tsx', content);
console.log('Patched toolbar text');
