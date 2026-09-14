const fs = require('fs');
const file = 'pages/crm/ContractingHub.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "import { BuildingLibraryIcon, DocumentCheckIcon, InboxArrowDownIcon, ArrowRight } from '@heroicons/react/24/outline';",
  "import { Building, FileCheck, Inbox, ArrowRight } from 'lucide-react';"
);
content = content.replace(/BuildingLibraryIcon/g, 'Building');
content = content.replace(/DocumentCheckIcon/g, 'FileCheck');
content = content.replace(/InboxArrowDownIcon/g, 'Inbox');

fs.writeFileSync(file, content);
console.log("Fixed ContractingHub");
