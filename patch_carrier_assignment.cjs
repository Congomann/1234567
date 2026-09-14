const fs = require('fs');
const filePath = 'pages/admin/CarrierAssignment.tsx';
let content = fs.readFileSync(filePath, 'utf8');
content = content.replace(
  '{ title: "Insurance Carriers", value: "35 Partners", subtitle: "Mutual of Omaha, AIG, Lincoln", emoji: "🛡️", gradient: "cyan", linkText: "View Carriers", linkPath: "#insurance_carriers" },',
  '{ title: "Insurance Carriers", value: `${availableCarriers.length} Partners`, subtitle: "Active Carrier Network", emoji: "🛡️", gradient: "cyan", linkText: "View Carriers", linkPath: "#insurance_carriers" },'
);
fs.writeFileSync(filePath, content);
console.log('Patched CarrierAssignment.tsx');
