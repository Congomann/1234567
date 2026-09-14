const fs = require('fs');
const filePath = 'pages/crm/Dashboard.tsx';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  'const { user, tasks, addTask, toggleTask, deleteTask } = useData();',
  'const { user, tasks, addTask, toggleTask, deleteTask, leads, clients, transactions } = useData();'
);

fs.writeFileSync(filePath, content);
console.log('Patched Dashboard3.tsx');
