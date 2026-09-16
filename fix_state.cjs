const fs = require('fs');
let content = fs.readFileSync('pages/crm/ContractingHub.tsx', 'utf8');

const hookSearch = `const [formValues, setFormValues] = useState<Record<string, string>>({});`;
const hookReplace = `const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [sigModalOpen, setSigModalOpen] = useState(false);
  const [sigTargetField, setSigTargetField] = useState<any>(null);`;
content = content.replace(hookSearch, hookReplace);

fs.writeFileSync('pages/crm/ContractingHub.tsx', content);
