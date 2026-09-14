const fs = require('fs');
const file = 'pages/admin/ContractingReviewQueue.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "import { QueueListIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';",
  "import { List, AlertTriangle, CheckCircle } from 'lucide-react';"
);
content = content.replace(/QueueListIcon/g, 'List');
content = content.replace(/ExclamationTriangleIcon/g, 'AlertTriangle');
content = content.replace(/CheckCircleIcon/g, 'CheckCircle');

fs.writeFileSync(file, content);
console.log("Fixed ReviewQueue");
