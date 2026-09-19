const fs = require('fs');
let content = fs.readFileSync('pages/admin/ContractingAdmin.tsx', 'utf8');

// Fix imports
content = content.replace(
  "import { Building, Plus, FileUp, CheckCircle, Trash2, Edit } from 'lucide-react';",
  "import { Building, Plus, FileUp, CheckCircle, Trash2, Edit, Mail, RefreshCw } from 'lucide-react';"
);

// Add missing state
content = content.replace(
  'const [packages, setPackages] = useState<any[]>([]);',
  'const [packages, setPackages] = useState<any[]>([]);\n  const [isSyncing, setIsSyncing] = useState(false);\n  const [syncStatus, setSyncStatus] = useState(\'\');'
);

fs.writeFileSync('pages/admin/ContractingAdmin.tsx', content);
console.log('Fixed states and imports.');
