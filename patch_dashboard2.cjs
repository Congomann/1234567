const fs = require('fs');
const filePath = 'pages/crm/Dashboard.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Ensure transactions is destructured
if (!content.includes('const { user, clients, leads, transactions } = useData();')) {
  content = content.replace(
    'const { user, clients, leads } = useData();',
    'const { user, clients, leads, transactions } = useData();'
  );
}

content = content.replace(
  '{ title: "Active Escrow Deals", value: "0", subtitle: "Total Value: $0", emoji: "🏢", gradient: "cyan", linkPath: "/crm/properties", linkText: "View entire list" }',
  '{ title: "Active Escrow Deals", value: `${transactions?.length || 0}`, subtitle: "Total Value Active", emoji: "🏢", gradient: "cyan", linkPath: "/crm/properties", linkText: "View entire list" }'
);

fs.writeFileSync(filePath, content);
console.log('Patched Dashboard2.tsx');
