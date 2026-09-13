const fs = require('fs');
const path = './pages/admin/ContractingAdmin.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add React Router link
content = content.replace(
  "import { BuildingLibraryIcon, PlusIcon, DocumentArrowUpIcon, CheckCircleIcon } from '@heroicons/react/24/outline';",
  "import { BuildingLibraryIcon, PlusIcon, DocumentArrowUpIcon, CheckCircleIcon } from '@heroicons/react/24/outline';\nimport { useNavigate } from 'react-router-dom';"
);

content = content.replace(
  "const [newCarrier, setNewCarrier] = useState({ name: '', code: '', description: '' });",
  "const [newCarrier, setNewCarrier] = useState({ name: '', code: '', description: '' });\n  const navigate = useNavigate();"
);

const manageBtnTarget = `<button className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
                      Manage
                    </button>`;
const manageBtnReplacement = `<button onClick={() => navigate('/crm/admin/contracting/builder')} className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
                      Form Builder
                    </button>`;
content = content.replace(manageBtnTarget, manageBtnReplacement);

fs.writeFileSync(path, content);
