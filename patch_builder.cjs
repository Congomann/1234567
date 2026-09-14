const fs = require('fs');
const filePath = 'pages/admin/CarrierFormBuilder.tsx';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  `      const mockExtracted = [
        { id: 'f1', name: 'Agent/Agency Name', type: 'text', mappedTo: 'Advisor.firstName', required: true },
        { id: 'f2', name: 'National Producer Number (NPN)', type: 'text', mappedTo: 'Advisor.npn', required: true },
        { id: 'f3', name: 'Agency Tax ID (EIN)', type: 'text', mappedTo: 'Company.ein', required: false },
        { id: 'f4', name: 'Direct Deposit Routing Number', type: 'text', mappedTo: '', required: true },
        { id: 'f5', name: 'Agent Signature', type: 'signature', mappedTo: 'Advisor.signature', required: true },
        { id: 'f6', name: 'Principal/Officer Signature', type: 'signature', mappedTo: 'Company.ceoSignature', required: false },
        { id: 'f7', name: 'Date', type: 'date', mappedTo: '', required: true },
      ];`,
  `      const mockExtracted: any[] = []; // No dummy data, requires real OCR backend integration`
);

fs.writeFileSync(filePath, content);
console.log('Patched CarrierFormBuilder.tsx');
