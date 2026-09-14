const fs = require('fs');
let hub = fs.readFileSync('pages/crm/ContractingHub.tsx', 'utf8');

// We need to import `useData` to get the `user` object
hub = hub.replace(
  /import \{ DB \} from '\.\.\/\.\.\/services\/database';/,
  "import { DB } from '../../services/database';\nimport { useData } from '../../context/DataContext';"
);

// Destructure `user` from `useData`
hub = hub.replace(
  /export default function ContractingHub\(\) \{/,
  "export default function ContractingHub() {\n  const { user } = useData();"
);

// When fields are loaded, we auto-populate `formValues` based on `mappedTo`
const setFieldsLogic = `
      if (data.extracted_schema) {
        setFields(data.extracted_schema);
        
        // Auto-fill mapped values
        const initialValues: Record<string, string> = {};
        data.extracted_schema.forEach((f: any) => {
          if (f.mappedTo && f.mappedTo !== 'none' && user) {
            if (f.mappedTo === 'firstName') initialValues[f.id] = user.name?.split(' ')[0] || '';
            if (f.mappedTo === 'lastName') initialValues[f.id] = user.name?.split(' ').slice(1).join(' ') || '';
            if (f.mappedTo === 'fullName') initialValues[f.id] = user.name || '';
            if (f.mappedTo === 'email') initialValues[f.id] = user.email || '';
            if (f.mappedTo === 'phone') initialValues[f.id] = user.phone || '';
            if (f.mappedTo === 'npn') initialValues[f.id] = user.npn || '';
          }
        });
        setFormValues(initialValues);
      } else {
        setFields([]);
      }
`;

hub = hub.replace(
  /if \(data\.extracted_schema\) \{\n\s*setFields\(data\.extracted_schema\);\n\s*\} else \{\n\s*setFields\(\[\]\);\n\s*\}/,
  setFieldsLogic
);

// Ensure the `<Document>` width takes advantage of the screen.
// We'll add an "Expand" button to ContractingHub as well, so the advisor can view it large.
hub = hub.replace(
  /import \{ PenTool, CheckCircle, FileText, Share2, Printer, Search, Info, MousePointer2 \} from 'lucide-react';/,
  "import { PenTool, CheckCircle, FileText, Share2, Printer, Search, Info, MousePointer2, Maximize, Minimize } from 'lucide-react';"
);

hub = hub.replace(
  /const \[isSubmitting, setIsSubmitting\] = useState\(false\);/,
  "const [isSubmitting, setIsSubmitting] = useState(false);\n  const [isFullscreen, setIsFullscreen] = useState(false);"
);

// Replace the flex layout with a fullscreen toggle
hub = hub.replace(
  /<div className="h-full flex flex-col bg-gray-100">/,
  `<div className={isFullscreen ? "fixed inset-0 z-50 bg-gray-100 flex flex-col" : "h-full flex flex-col bg-gray-100"}>`
);

// Add the Maximize button to the header of the active application
hub = hub.replace(
  /<button onClick=\{\(\) => setActiveApplication\(null\)\} className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition">\n\s*Cancel & Back\n\s*<\/button>/,
  `<button onClick={() => setIsFullscreen(!isFullscreen)} className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition" title="Toggle Fullscreen">
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
            <button onClick={() => { setActiveApplication(null); setIsFullscreen(false); }} className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition">
              Cancel & Back
            </button>`
);

fs.writeFileSync('pages/crm/ContractingHub.tsx', hub);
console.log('Patched ContractingHub.tsx for Auto-Fill and Expand');
