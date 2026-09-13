const fs = require('fs');
const path = './context/DataContext.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace the array
content = content.replace(/const INITIAL_USERS: User\[\] = \[[\s\S]*?\];/m, '');

// Replace the state
content = content.replace('const [allUsers, setAllUsers] = useState<User[]>(INITIAL_USERS);', 'const [allUsers, setAllUsers] = useState<User[]>([]);');

// Replace the addLead if condition
content = content.replace('if (user && !INITIAL_USERS.find(u => u.id === user.id))', 'if (user)');

// Replace the fetchUsers line
content = content.replace(
  'wrapped(() => Backend.getUsers(), (users) => setAllUsers(users.length > 0 ? [...INITIAL_USERS, ...users.filter(u => !INITIAL_USERS.find(iu => iu.id === u.id))] : INITIAL_USERS)),',
  'wrapped(() => Backend.getUsers(), (users) => setAllUsers(users || [])),'
);

fs.writeFileSync(path, content);
