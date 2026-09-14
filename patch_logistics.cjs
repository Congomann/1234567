const fs = require('fs');
let content = fs.readFileSync('pages/crm/logistics/LogisticsHub.tsx', 'utf8');
content = content.replace(
  '{ title: "Fleet GPS Dispatch", value: "42 Active Trucks", subtitle: "Real-Time Tracking", emoji: "📍", gradient: "yellow" },',
  '{ title: "Fleet GPS Dispatch", value: (loads.length * 2) + " Active Trucks", subtitle: "Real-Time Tracking", emoji: "📍", gradient: "yellow" },'
).replace(
  '{ title: "Carrier Rate Confirmations", value: "$420,000 Gross", subtitle: "100% Rate Locked", emoji: "📦", gradient: "pink" }',
  '{ title: "Carrier Rate Confirmations", value: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(loads.reduce((acc, l) => acc + (l.amount || 0), 0)) + " Gross", subtitle: "100% Rate Locked", emoji: "📦", gradient: "pink" }'
);
fs.writeFileSync('pages/crm/logistics/LogisticsHub.tsx', content);
console.log('Patched LogisticsHub.tsx');
