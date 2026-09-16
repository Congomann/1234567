const fs = require('fs');
let content = fs.readFileSync('pages/admin/CarrierFormBuilder.tsx', 'utf8');

const oldUpload = `                    reader.onload = (e) => setPdfData(e.target?.result as string);
                    reader.readAsDataURL(file);`;

const newUpload = `                    reader.onload = (e) => {
                      const data = e.target?.result as string;
                      setPdfData(data);
                      if (carrierId) {
                        DB.put('pdf_cache', { id: carrierId, data, timestamp: Date.now() }).catch(console.error);
                      }
                    };
                    reader.readAsDataURL(file);`;

content = content.replace(oldUpload, newUpload);
fs.writeFileSync('pages/admin/CarrierFormBuilder.tsx', content);
console.log('Fixed DB put for manual upload');
