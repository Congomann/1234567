const fs = require('fs');
const filePath = 'pages/admin/AnnualReportAdmin.tsx';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  `{ title: "Annual Financial Metric", value: "$142.8M AUM", subtitle: "0 Active Lawsuits", emoji: "📜", gradient: "pink", linkText: "Financial Metrics", linkPath: '#metrics-editor' }`,
  `{ title: "Annual Financial Metric", value: \`\${metrics.totalSales}M AUM\`, subtitle: "0 Active Lawsuits", emoji: "📜", gradient: "pink", linkText: "Financial Metrics", linkPath: '#metrics-editor' }`
);

fs.writeFileSync(filePath, content);
console.log('Patched AnnualReportAdmin Tab3DBanner');
