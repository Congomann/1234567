const fs = require('fs');
let content = fs.readFileSync('components/crm/EmbeddedRootInsuranceModal.tsx', 'utf8');

content = content.replace("import { toast } from 'react-hot-toast';", "");
content = content.replace("toast.error(\"Failed to generate Root Insurance bridge link.\");", "alert(\"Failed to generate Root Insurance bridge link.\");");

fs.writeFileSync('components/crm/EmbeddedRootInsuranceModal.tsx', content);
