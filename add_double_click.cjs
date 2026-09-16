const fs = require('fs');
let content = fs.readFileSync('pages/admin/CarrierFormBuilder.tsx', 'utf8');

const oldRender = 'onMouseDown={(e) => handleFieldMouseDown(e, field)}';
const newRender = 'onMouseDown={(e) => handleFieldMouseDown(e, field)}\n                        onDoubleClick={(e) => {\n                          e.stopPropagation();\n                          setFields(prev => prev.filter(f => f.id !== field.id));\n                          if (selectedFieldId === field.id) setSelectedFieldId(null);\n                        }}';

content = content.replace(oldRender, newRender);

fs.writeFileSync('pages/admin/CarrierFormBuilder.tsx', content);
console.log('Added onDoubleClick handler to field boxes');
