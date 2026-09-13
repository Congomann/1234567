const fs = require('fs');
const path = './context/DataContext.tsx';
let content = fs.readFileSync(path, 'utf8');

// replace the hardcoded metrics in the Provider value
content = content.replace(
  'metrics: { totalRevenue: 1250000, activeClients: 450, pendingLeads: 12, monthlyPerformance: [], totalCommission: 85000 },',
  'metrics: { totalRevenue: clients.length * 5000, activeClients: clients.length, pendingLeads: leads.length, monthlyPerformance: [], totalCommission: clients.length * 500 },'
);

fs.writeFileSync(path, content);
