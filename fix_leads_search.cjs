const fs = require('fs');
let file = fs.readFileSync('pages/crm/Leads.tsx', 'utf8');

file = file.replace(
    /l\.name\.toLowerCase\(\)\.includes\(q\) \|\| l\.email\.toLowerCase\(\)\.includes\(q\) \|\| l\.interest\.toLowerCase\(\)\.includes\(q\)/g,
    "(l.name || '').toLowerCase().includes(q) || (l.email || '').toLowerCase().includes(q) || (l.interest || '').toLowerCase().includes(q)"
);

fs.writeFileSync('pages/crm/Leads.tsx', file);
console.log('Fixed Leads.tsx search filter crash');
