const fs = require('fs');
const filePath = 'pages/crm/Leads.tsx';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  `{ title: "Total Lead Intake", value: \`\${leads.length || 3420} Prospects\`, subtitle: "Real-Time Ingestion", emoji: "👥", gradient: "cyan", linkText: "All Leads", linkPath: "#all_leads" },
                    { title: "AI Qualified Tiers", value: "842 Warm Leads", subtitle: "SignalWire AI Score > 75", emoji: "🔥", gradient: "yellow" },
                    { title: "Conversion Speed", value: "4.2 Days Avg", subtitle: "Lead to Proposal Velocity", emoji: "⚡", gradient: "pink" }`,
  `{ title: "Total Lead Intake", value: \`\${leads.length} Prospects\`, subtitle: "Real-Time Ingestion", emoji: "👥", gradient: "cyan", linkText: "All Leads", linkPath: "#all_leads" },
                    { title: "AI Qualified Tiers", value: \`\${leads.filter(l => l.score && l.score > 75).length} Warm Leads\`, subtitle: "SignalWire AI Score > 75", emoji: "🔥", gradient: "yellow" },
                    { title: "Conversion Speed", value: "0 Days Avg", subtitle: "Lead to Proposal Velocity", emoji: "⚡", gradient: "pink" }`
);

fs.writeFileSync(filePath, content);
console.log('Patched Leads.tsx');
