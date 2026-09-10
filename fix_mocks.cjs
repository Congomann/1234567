const fs = require('fs');

// 1. DataContext
let dc = fs.readFileSync('context/DataContext.tsx', 'utf8');
dc = dc.replace(/const MOCK_TASKS[\s\S]*?\];/g, '');
dc = dc.replace(/useState<Task\[\]>\(MOCK_TASKS\)/g, 'useState<Task[]>([])');
fs.writeFileSync('context/DataContext.tsx', dc);

// 2. LogisticsHub
let lh = fs.readFileSync('pages/crm/logistics/LogisticsHub.tsx', 'utf8');
lh = lh.replace(/const mockDeals[\s\S]*?};\n/g, '');
// Change references of mockDeals to deals
lh = lh.replace(/mockDeals/g, 'deals');
// Also need to initialize deals somehow, maybe it is already fetched? Let's check.
fs.writeFileSync('pages/crm/logistics/LogisticsHub.tsx', lh);
console.log('Fixed Mocks phase 1');
