const fs = require('fs');
let content = fs.readFileSync('context/DataContext.tsx', 'utf8');

content = content.replace(
  'updateClient: (id: string, data: Partial<Client>) => void;',
  'updateClient: (id: string, data: Partial<Client>) => void;\n  addClient: (data: Partial<Client>) => Promise<string>;'
);

fs.writeFileSync('context/DataContext.tsx', content);
