const fs = require('fs');
let content = fs.readFileSync('pages/admin/CarrierIntegrations.tsx', 'utf8');

content = content.replace(
  'await DB.save(\'carrier_api_connections\', newConnection);\n    await loadConnections();\n    setShowAdd(false);\n    setIsSaving(false);',
  `await DB.save('carrier_api_connections', newConnection);\n    await loadConnections();\n    setShowAdd(false);\n    setIsSaving(false);\n    \n    // Automatically trigger initial sync to pull client data into the CRM\n    handleSync(newConnection);`
);

fs.writeFileSync('pages/admin/CarrierIntegrations.tsx', content);
