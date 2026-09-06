const fs = require('fs');
let file = fs.readFileSync('pages/website/LifeInsurance.tsx', 'utf8');

const linkCode = `              <Link 
                to="/life-insurance/quote"
                className="px-10 py-5 bg-white text-[#0B2240] rounded-full font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-blue-50 transition-all active:scale-95 inline-block"
              >
                Start Free Quote
              </Link>`;

file = file.replace(linkCode, '');
fs.writeFileSync('pages/website/LifeInsurance.tsx', file);
console.log('Removed Start Free Quote button');
