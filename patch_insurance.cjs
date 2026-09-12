const fs = require('fs');
let content = fs.readFileSync('pages/crm/insurance/InsurancePages.tsx', 'utf8');

// 1. Add import for the new modal
content = content.replace("import { Briefcase, Car, FileText, HeartPulse, Home, Shield, DollarSign, PenTool, CheckCircle, Clock } from 'lucide-react';", "import { Briefcase, Car, FileText, HeartPulse, Home, Shield, DollarSign, PenTool, CheckCircle, Clock } from 'lucide-react';\nimport { EmbeddedRootInsuranceModal } from '../../../components/crm/EmbeddedRootInsuranceModal';");

// 2. Add state to AutoQuotes
const autoQuotesRegex = /(export const AutoQuotes: React\.FC = \(\) => {[\s\S]*?)(return \()/;
content = content.replace(autoQuotesRegex, `$1const [rootModalLead, setRootModalLead] = React.useState<any>(null);\n\n    $2`);

// 3. Update AutoQuotes buttons
content = content.replace(/<button onClick=\{\(\) => alert\('Feature in development'\)\} className="flex-1 py-2 bg-\[#0B2240\] text-white rounded-xl text-xs font-bold hover:bg-slate-800">Quote<\/button>/g, `<button onClick={() => setRootModalLead(lead)} className="flex-1 py-2 bg-[#0B2240] text-white rounded-xl text-xs font-bold hover:bg-slate-800">Root Quote</button>`);

// 4. Add the modal rendering in AutoQuotes
const autoQuotesReturnRegex = /(<div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-\[2rem\] border border-dashed border-slate-200">[\s\S]*?No auto insurance leads available.[\s\S]*?<\/div>\n\s*)}[\s\S]*?<\/div>\n\s*<\/div>\n\s*\);/;
content = content.replace(autoQuotesReturnRegex, `$1}\n            </div>\n            {rootModalLead && <EmbeddedRootInsuranceModal lead={rootModalLead} onClose={() => setRootModalLead(null)} />}\n        </div>\n    );`);


// 5. Add state to CommercialQuotes
const commQuotesRegex = /(export const CommercialQuotes: React\.FC = \(\) => {[\s\S]*?)(return \()/;
content = content.replace(commQuotesRegex, `$1const [rootModalLead, setRootModalLead] = React.useState<any>(null);\n\n    $2`);

// 6. Update CommercialQuotes buttons
content = content.replace(/<button onClick=\{\(\) => alert\('Feature in development'\)\} className="px-5 py-2 bg-purple-600 text-white rounded-full text-xs font-bold hover:bg-purple-700 transition-colors">\s*View Quote\s*<\/button>/g, `<button onClick={() => setRootModalLead(lead)} className="px-5 py-2 bg-purple-600 text-white rounded-full text-xs font-bold hover:bg-purple-700 transition-colors">\n                                View Root Quote\n                            </button>`);

// 7. Add the modal rendering in CommercialQuotes
const commQuotesReturnRegex = /(<div className="grid grid-cols-1 gap-4">[\s\S]*?<\/div>\n\s*)(<\/div>\n\s*\);)/;
content = content.replace(commQuotesReturnRegex, `$1{rootModalLead && <EmbeddedRootInsuranceModal lead={rootModalLead} onClose={() => setRootModalLead(null)} />}\n        $2`);

fs.writeFileSync('pages/crm/insurance/InsurancePages.tsx', content);
