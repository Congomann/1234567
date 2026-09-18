const fs = require('fs');
let content = fs.readFileSync('pages/crm/ContractingHub.tsx', 'utf8');

content = content.replace(
  'className={`w-full h-full ${borderClass} focus:bg-yellow-50 focus:border-blue-600 focus:ring-2 focus:ring-blue-600 text-sm font-medium text-gray-900 px-1 absolute inset-0 z-40 outline-none transition-all shadow-sm rounded-sm`}',
  'style={{ fontFamily: "Arial, sans-serif", fontSize: "18px" }}\n                              className={`w-full h-full ${borderClass} focus:bg-yellow-50 focus:border-blue-600 focus:ring-2 focus:ring-blue-600 font-medium text-gray-900 px-1 absolute inset-0 z-40 outline-none transition-all shadow-sm rounded-sm`}'
);

content = content.replace(
  'className={`w-full h-full ${borderClass} focus:bg-yellow-50 focus:border-blue-600 focus:ring-2 focus:ring-blue-600 text-sm font-medium text-gray-900 px-1 absolute inset-0 outline-none transition-all shadow-sm rounded-sm`}',
  'style={{ fontFamily: "Arial, sans-serif", fontSize: "18px" }}\n                              className={`w-full h-full ${borderClass} focus:bg-yellow-50 focus:border-blue-600 focus:ring-2 focus:ring-blue-600 font-medium text-gray-900 px-1 absolute inset-0 outline-none transition-all shadow-sm rounded-sm`}'
);

fs.writeFileSync('pages/crm/ContractingHub.tsx', content);
