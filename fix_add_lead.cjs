const fs = require('fs');
let file = fs.readFileSync('context/DataContext.tsx', 'utf8');

file = file.replace(
    /if \(res\.success\) \{\n\s*pushNotification\('Inquiry Submitted', `Thank you \$\{leadData\.name\}, we will contact you shortly\.`, 'success'\);\n\s*\}/g,
    `if (res.success) {
              setLeads(prev => [res.lead || newLead, ...prev]);
              pushNotification('Inquiry Submitted', \`Thank you \${leadData.name}, we will contact you shortly.\`, 'success');
          }`
);

fs.writeFileSync('context/DataContext.tsx', file);
console.log('Fixed addLead to update local state');
