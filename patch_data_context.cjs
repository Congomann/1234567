const fs = require('fs');
let content = fs.readFileSync('context/DataContext.tsx', 'utf8');

if (!content.includes('addClient: (')) {
  // 1. Add to DataContextType
  content = content.replace(
    'updateClient: (id: string, data: Partial<Client>) => Promise<void>;',
    'updateClient: (id: string, data: Partial<Client>) => Promise<void>;\n  addClient: (data: Partial<Client>) => Promise<string>;'
  );

  // 2. Add implementation
  const addClientImpl = `
  const addClient = useCallback(async (data: Partial<Client>) => {
    const newClient = {
      id: 'client_' + Date.now(),
      name: data.name || 'Unknown Client',
      policyNumber: data.policyNumber || 'POL-' + Date.now(),
      premium: data.premium || 0,
      product: data.product || 'Annuity',
      renewalDate: data.renewalDate || new Date().toISOString().split('T')[0],
      carrier: data.carrier || 'Unknown Carrier',
      ...data
    } as Client;
    await Backend.saveClient(newClient);
    setClients(prev => [...prev, newClient]);
    return newClient.id;
  }, []);

  const updateClient = `;
  content = content.replace('const updateClient = ', addClientImpl);

  // 3. Add to provider
  content = content.replace(
    'addLead, updateLeadStatus, updateLead, assignLeads, updateClient, updateUser',
    'addLead, updateLeadStatus, updateLead, assignLeads, updateClient, addClient, updateUser'
  );

  fs.writeFileSync('context/DataContext.tsx', content);
  console.log('Patched DataContext to add addClient');
} else {
  console.log('addClient already exists');
}
