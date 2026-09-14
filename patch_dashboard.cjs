const fs = require('fs');
const filePath = 'pages/crm/Dashboard.tsx';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  '{ title: "Applications In Line", value: "0", subtitle: "Active Processing Queue", emoji: "📱", gradient: "yellow", linkPath: "/crm/leads", linkText: "View entire list" }',
  '{ title: "Applications In Line", value: `${leads.length}`, subtitle: "Active Processing Queue", emoji: "📱", gradient: "yellow", linkPath: "/crm/leads", linkText: "View entire list" }'
);

content = content.replace(
  '{ title: "New Clients Onboarded", value: "0", subtitle: "Q3 New Accounts", emoji: "🦸‍♀️", gradient: "pink", linkPath: "/crm/clients", linkText: "View entire list" }',
  '{ title: "New Clients Onboarded", value: `${clients.length}`, subtitle: "Total Active Accounts", emoji: "🦸‍♀️", gradient: "pink", linkPath: "/crm/clients", linkText: "View entire list" }'
);

fs.writeFileSync(filePath, content);
console.log('Patched Dashboard.tsx');
