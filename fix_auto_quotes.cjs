const fs = require('fs');
let content = fs.readFileSync('pages/crm/insurance/InsurancePages.tsx', 'utf8');

const autoQuotesRegex = /(<div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-\[2rem\] border border-dashed border-slate-200">\s*No auto insurance leads available\.\s*<\/div>\s*\)}\s*<\/div>\s*)(<\/div>\s*\);\s*};)/m;

content = content.replace(autoQuotesRegex, `$1{rootModalLead && <EmbeddedRootInsuranceModal lead={rootModalLead} onClose={() => setRootModalLead(null)} />}\n        $2`);

fs.writeFileSync('pages/crm/insurance/InsurancePages.tsx', content);
