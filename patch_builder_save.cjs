const fs = require('fs');
let content = fs.readFileSync('pages/admin/CarrierFormBuilder.tsx', 'utf8');

const oldSave = `  const handleSave = () => {
    navigate('/crm');
  };`;

const newSave = `  const handleSave = async () => {
    if (carrierId) {
      await DB.save('carrier_fields', {
        id: carrierId,
        extracted_schema: fields,
        updated_at: new Date().toISOString()
      });
      // Optionally update the package status in the backend/DB if needed, 
      // but ContractingAdmin handles the Available/Hidden status.
    }
    navigate('/crm/admin/contracting'); // Navigate back to the Contracting Admin list
  };`;

content = content.replace(oldSave, newSave);

fs.writeFileSync('pages/admin/CarrierFormBuilder.tsx', content);
console.log('Patched handleSave in CarrierFormBuilder');
