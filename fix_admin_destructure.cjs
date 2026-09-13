const fs = require('fs');
const path = './pages/admin/AdminUsers.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  "const { allUsers, addAdvisor, deleteAdvisor, updateUser, restoreUser, permanentlyDeleteUser, accessLogs, impersonateUser, user } = useData();",
  "const { allUsers, addAdvisor, inviteAdvisor, deleteAdvisor, updateUser, restoreUser, permanentlyDeleteUser, accessLogs, impersonateUser, user } = useData();"
);

fs.writeFileSync(path, content);
