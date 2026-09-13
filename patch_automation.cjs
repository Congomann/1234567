const fs = require('fs');
const path = './context/DataContext.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  'executions: 2087,\n    bandwidthSaved: 521 * 60',
  'executions: 0,\n    bandwidthSaved: 0'
);

fs.writeFileSync(path, content);
