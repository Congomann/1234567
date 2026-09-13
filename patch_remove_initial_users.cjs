const fs = require('fs');
const path = './context/DataContext.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Remove the INITIAL_USERS array completely
const initUsersRegex = /const INITIAL_USERS: User\[\] = \[\s*\{[^]*?\}\s*\];/g;
content = content.replace(initUsersRegex, '');

// 2. Change useState<User[]>(INITIAL_USERS) to useState<User[]>([])
content = content.replace(/useState<User\[\]>\(INITIAL_USERS\)/g, 'useState<User[]>([])');

// 3. Change if (user && !INITIAL_USERS.find(u => u.id === user.id)) to if (user)
content = content.replace(/if\s*\(\s*user\s*&&\s*!INITIAL_USERS\.find\([^)]+\)\s*\)/g, 'if (user)');

// 4. Change wrapped(() => Backend.getUsers(), ...)
const wrappedRegex = /wrapped\(\(\) => Backend\.getUsers\(\), \(users\) => setAllUsers\([^)]+\)\)/g;
content = content.replace(wrappedRegex, 'wrapped(() => Backend.getUsers(), (users) => setAllUsers(users || []))');

// Wait, the regex for wrapped might not match exactly if there are nested parentheses.
// Let's do a string replace for that specific line.
