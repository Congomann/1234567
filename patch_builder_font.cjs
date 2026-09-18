const fs = require('fs');
let content = fs.readFileSync('pages/admin/CarrierFormBuilder.tsx', 'utf8');

content = content.replace(
  'className="w-full h-full bg-transparent outline-none border-none text-[10px] font-bold text-blue-900 px-1"',
  'className="w-full h-full bg-transparent outline-none border-none text-[18px] font-sans font-bold text-blue-900 px-1 style={{ fontFamily: \'Arial, sans-serif\' }}"'
);
// wait, putting style inside className is invalid React. Let's fix that string replacement.

content = fs.readFileSync('pages/admin/CarrierFormBuilder.tsx', 'utf8');
content = content.replace(
  '<input\n                           type="text"\n                           className="w-full h-full bg-transparent outline-none border-none text-[10px] font-bold text-blue-900 px-1"',
  '<input\n                           type="text"\n                           style={{ fontFamily: "Arial, sans-serif", fontSize: "18px" }}\n                           className="w-full h-full bg-transparent outline-none border-none font-bold text-blue-900 px-1"'
);

fs.writeFileSync('pages/admin/CarrierFormBuilder.tsx', content);
