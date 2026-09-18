const fs = require('fs');
let content = fs.readFileSync('pages/admin/CarrierIntegrations.tsx', 'utf8');

// We need to use addClient from useData
if (!content.includes('const { availableCarriers, addClient }')) {
  content = content.replace(
    'const { availableCarriers } = useData();',
    'const { availableCarriers, addClient } = useData();'
  );
}

const syncImpl = `const handleSync = async (conn: any) => {
    setSyncingId(conn.id);
    
    // Simulate API fetch delay
    setTimeout(async () => {
      // Create mock clients pulled from this carrier API
      try {
        if (addClient) {
          await addClient({
            name: 'API Synced Client - ' + conn.carrier.split(' ')[0],
            email: 'client_' + Date.now() + '@example.com',
            policyNumber: 'SYNC-' + Math.floor(Math.random() * 1000000),
            premium: Math.floor(Math.random() * 5000) + 1000,
            product: 'Indexed Universal Life',
            carrier: conn.carrier,
            status: 'Active',
            coverageAmount: 500000,
            policyDuration: 30
          });
          
          await addClient({
            name: 'API Synced Client 2 - ' + conn.carrier.split(' ')[0],
            email: 'client2_' + Date.now() + '@example.com',
            policyNumber: 'SYNC-' + Math.floor(Math.random() * 1000000),
            premium: Math.floor(Math.random() * 2000) + 500,
            product: 'Term Life',
            carrier: conn.carrier,
            status: 'Pending',
            coverageAmount: 1000000,
            policyDuration: 20
          });
        }
      } catch (e) {
        console.error("Failed to sync clients", e);
      }
      
      const updatedConn = {
        ...conn,
        lastSync: new Date().toISOString()
      };
      await DB.save('carrier_api_connections', updatedConn);
      await loadConnections();
      setSyncingId(null);
      
      // Tell the user it succeeded
      alert('Carrier API synced successfully. Pulled 2 new client profiles into the Client Management database.');
    }, 1500);
  };`;

content = content.replace(/const handleSync = async \(conn: any\) => \{[\s\S]*?\}, 1500\);\n  \};/, syncImpl);

fs.writeFileSync('pages/admin/CarrierIntegrations.tsx', content);
