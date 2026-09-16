const fs = require('fs');
let content = fs.readFileSync('pages/admin/CarrierFormBuilder.tsx', 'utf8');

const oldEffect = `  useEffect(() => {
    if (carrierId) {
      DB.getAll('pdf_cache').then(caches => {
        const cached = (caches as any[]).find(c => c.id === carrierId);
        if (cached && cached.data) {
          setPdfData(cached.data);
        }
      }).catch(console.error);
    }
  }, [carrierId]);`;

const newEffect = `  useEffect(() => {
    if (carrierId) {
      DB.getAll('pdf_cache').then(caches => {
        const cached = (caches as any[]).find(c => c.id === carrierId);
        if (cached && cached.data) {
          setPdfData(cached.data);
        }
      }).catch(console.error);
      
      DB.getAll('carrier_fields').then(configs => {
        const config = (configs as any[]).find(c => c.id === carrierId);
        if (config && config.extracted_schema) {
          setFields(config.extracted_schema);
        }
      }).catch(console.error);
    }
  }, [carrierId]);`;

content = content.replace(oldEffect, newEffect);
fs.writeFileSync('pages/admin/CarrierFormBuilder.tsx', content);
console.log('Patched load logic in CarrierFormBuilder');
