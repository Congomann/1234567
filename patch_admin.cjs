const fs = require('fs');
let content = fs.readFileSync('pages/admin/ContractingAdmin.tsx', 'utf8');

const importTarget = `import { Backend } from '../../services/apiBackend';`;
const importReplacement = `import { Backend } from '../../services/apiBackend';\nimport { DB } from '../../services/database';`;
if (!content.includes(`import { DB }`)) {
  content = content.replace(importTarget, importReplacement);
}

const saveTarget = `if (!newCarrier.name.trim()) return;
      await Backend.addCarrier(newCarrier.name, 'Contracting', uploadedFile?.name);
      setNewCarrier({ name: '', code: '', description: '' });`;

const saveReplacement = `if (!newCarrier.name.trim()) return;
      
      if (uploadedFile) {
        const reader = new FileReader();
        reader.readAsDataURL(uploadedFile);
        reader.onload = async () => {
          await DB.save('pdf_cache', { id: newCarrier.name, data: reader.result });
        };
      }
      
      await Backend.addCarrier(newCarrier.name, 'Contracting', uploadedFile?.name);
      setNewCarrier({ name: '', code: '', description: '' });`;

content = content.replace(saveTarget, saveReplacement);
fs.writeFileSync('pages/admin/ContractingAdmin.tsx', content);
console.log('Patched ContractingAdmin.tsx');
