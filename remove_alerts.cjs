const fs = require('fs');
let content = fs.readFileSync('pages/admin/CarrierFormBuilder.tsx', 'utf8');

const oldDetectSuccess = 'setFields([...fields, ...mappedFields]);\n        alert(`Detection Complete!\\n\\n${mappedFields.length} Fields Auto-Confirmed.`);';
const newDetectSuccess = 'setFields([...fields, ...mappedFields]);';
content = content.replace(oldDetectSuccess, newDetectSuccess);

const oldDetectEmpty = 'alert("The detection engine found no viable input fields on this document.");';
const newDetectEmpty = 'console.log("No viable fields detected.");';
content = content.replace(oldDetectEmpty, newDetectEmpty);

const oldDetectError = 'alert("Error during document detection.");';
const newDetectError = 'console.error("Detection error.");';
content = content.replace(oldDetectError, newDetectError);

const oldSave = 'alert("Configuration Saved! Advisors can now fill this out perfectly via the CRM.");\n    navigate(\'/crm\');';
const newSave = 'navigate(\'/crm\');';
content = content.replace(oldSave, newSave);

fs.writeFileSync('pages/admin/CarrierFormBuilder.tsx', content);
console.log('Removed all blocking alert() calls');
