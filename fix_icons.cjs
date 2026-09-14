const fs = require('fs');

function fixAdmin() {
  const file = 'pages/admin/ContractingAdmin.tsx';
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(
    "import { BuildingLibraryIcon, PlusIcon, DocumentArrowUpIcon, CheckCircleIcon } from '@heroicons/react/24/outline';",
    "import { Building, Plus, FileUp, CheckCircle } from 'lucide-react';"
  );
  content = content.replace(/BuildingLibraryIcon/g, 'Building');
  content = content.replace(/PlusIcon/g, 'Plus');
  content = content.replace(/DocumentArrowUpIcon/g, 'FileUp');
  content = content.replace(/CheckCircleIcon/g, 'CheckCircle');
  fs.writeFileSync(file, content);
}

function fixBuilder() {
  const file = 'pages/admin/CarrierFormBuilder.tsx';
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(
    "import { DocumentTextIcon, AdjustmentsHorizontalIcon, CheckIcon } from '@heroicons/react/24/outline';",
    "import { FileText, SlidersHorizontal, Check } from 'lucide-react';"
  );
  content = content.replace(/DocumentTextIcon/g, 'FileText');
  content = content.replace(/AdjustmentsHorizontalIcon/g, 'SlidersHorizontal');
  content = content.replace(/CheckIcon/g, 'Check');
  fs.writeFileSync(file, content);
}

function fixHub() {
  const file = 'pages/crm/ContractingHub.tsx';
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(
    "import { ArrowRightIcon } from '@heroicons/react/24/outline';",
    "import { ArrowRight } from 'lucide-react';"
  );
  content = content.replace(/ArrowRightIcon/g, 'ArrowRight');
  fs.writeFileSync(file, content);
}

fixAdmin();
fixBuilder();
fixHub();
console.log("Icons fixed!");
