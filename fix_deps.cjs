const fs = require('fs');
let content = fs.readFileSync('pages/admin/CarrierFormBuilder.tsx', 'utf8');

content = content.replace('removeField(selectedFieldId);', 'setFields(prev => prev.filter(f => f.id !== selectedFieldId));');
content = content.replace('}, [selectedFieldId, removeField]);', '}, [selectedFieldId]);');

fs.writeFileSync('pages/admin/CarrierFormBuilder.tsx', content);
