const fs = require('fs');
const path = './context/DataContext.tsx';
let content = fs.readFileSync(path, 'utf8');

const CARRIERS_ARRAY = `[
  { name: 'National Life Group', category: 'Life Insurance' },
  { name: 'Transamerica', category: 'Life Insurance' },
  { name: 'Mutual of Omaha', category: 'Life Insurance' },
  { name: 'Corebridge Financial', category: 'Life Insurance' },
  { name: 'UnitedHealthcare', category: 'Health' },
  { name: 'BlueCross BlueShield', category: 'Health' },
  { name: 'Aetna', category: 'Health' },
  { name: 'Root Insurance', category: 'Auto & Commercial' },
  { name: 'Progressive', category: 'Auto & Commercial' },
  { name: 'Travelers', category: 'Auto & Commercial' },
  { name: 'Allianz', category: 'Annuities' },
  { name: 'Athene', category: 'Annuities' }
]`;

// Find where availableCarriers: [] is in the context provider
content = content.replace("availableCarriers: [], colleagues:", `availableCarriers: ${CARRIERS_ARRAY}, colleagues:`);

fs.writeFileSync(path, content);
