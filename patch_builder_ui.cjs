const fs = require('fs');
const path = './pages/admin/CarrierFormBuilder.tsx';
let content = fs.readFileSync(path, 'utf8');

const target = `export default function CarrierFormBuilder() {
  const [fields, setFields] = useState([
    { id: 1, name: 'First Name', type: 'text', mappedTo: 'Advisor.firstName', required: true },
    { id: 2, name: 'Last Name', type: 'text', mappedTo: 'Advisor.lastName', required: true },
    { id: 3, name: 'NPN Number', type: 'text', mappedTo: 'Advisor.npn', required: true },
    { id: 4, name: 'Agency Name', type: 'text', mappedTo: 'Company.legalName', required: false },
    { id: 5, name: 'Signature', type: 'signature', mappedTo: 'Advisor.signature', required: true }
  ]);`;

const replacement = `import { useEffect } from 'react';

export default function CarrierFormBuilder() {
  const [fields, setFields] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Hardcode ID 1 for now since we don't have routing params configured yet
  const formId = 1; 

  useEffect(() => {
    fetch('/api/carriers/forms/' + formId, {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('nhfg_access_token') }
    })
    .then(res => res.json())
    .then(data => {
      setFields(data.extracted_schema && Array.isArray(data.extracted_schema) ? data.extracted_schema : []);
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    try {
      await fetch('/api/carriers/forms/' + formId, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('nhfg_access_token') 
        },
        body: JSON.stringify({ extracted_schema: fields })
      });
      alert('Configuration published to database.');
    } catch (e) {
      alert('Failed to save.');
    }
  };`;

content = content.replace(target, replacement);

const buttonTarget = `<button className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center font-medium">`;
const buttonReplacement = `<button onClick={handleSave} className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center font-medium">`;
content = content.replace(buttonTarget, buttonReplacement);

const emptyTarget = `{fields.map(field => (`;
const emptyReplacement = `{loading ? <p className="text-gray-500 text-sm">Loading...</p> : fields.length === 0 ? <p className="text-gray-500 text-sm">No fields extracted yet.</p> : fields.map(field => (`;
content = content.replace(emptyTarget, emptyReplacement);

// Fix select value change handler so edits apply to local state
const selectTarget = `defaultValue={field.mappedTo}`;
const selectReplacement = `value={field.mappedTo || ''}
                    onChange={(e) => {
                      const newFields = [...fields];
                      const idx = newFields.findIndex(f => f.id === field.id);
                      if (idx > -1) newFields[idx].mappedTo = e.target.value;
                      setFields(newFields);
                    }}`;
content = content.replace(selectTarget, selectReplacement);

fs.writeFileSync(path, content);
