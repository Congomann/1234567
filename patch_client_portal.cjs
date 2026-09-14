const fs = require('fs');
const path = 'pages/client/ClientPortal.tsx';
let content = fs.readFileSync(path, 'utf8');

// Import LogOut from lucide-react if not present
if (!content.includes('LogOut')) {
    content = content.replace('User } from \'lucide-react\'', 'User, LogOut } from \'lucide-react\'');
}

// Add logout to useData destructuring
content = content.replace('const { user, clients } = useData();', 'const { user, clients, logout } = useData();');

// Add logout handler
const handleLogout = `
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
`;
// Ensure useNavigate is imported and used
if (!content.includes('useNavigate')) {
    content = content.replace('Navigate } from \'react-router-dom\'', 'Navigate, useNavigate } from \'react-router-dom\'');
    content = content.replace('const { user, clients, logout } = useData();', 'const { user, clients, logout } = useData();\n  const navigate = useNavigate();\n' + handleLogout);
}

// Inject logout button next to the h1
content = content.replace(
    '<h1 className="text-3xl font-bold text-slate-900">My Client Portal</h1>',
    `<div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-slate-900">My Client Portal</h1>
            <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg font-semibold hover:bg-red-100 transition-colors">
              <LogOut size={16} /> Sign Out
            </button>
          </div>`
);

fs.writeFileSync(path, content);
console.log('Patched ClientPortal.tsx');
