const fs = require('fs');

let hub = fs.readFileSync('pages/crm/ContractingHub.tsx', 'utf8');

// The layout might be hardcoded to max-w-4xl. Let's make it more flexible.
hub = hub.replace(
  /className="p-6 max-w-7xl mx-auto space-y-8"/,
  'className="p-4 md:p-6 w-full max-w-7xl mx-auto space-y-8"'
);

// We need to ensure the pdf wrapper allows scrolling on mobile and doesn't break layout
// Look for `<div className="relative shadow-xl">` or similar that wraps the Document
hub = hub.replace(
  /<div className="relative shadow-xl">/,
  '<div className="relative shadow-xl overflow-x-auto max-w-full bg-gray-50 border border-gray-200 rounded-lg p-2 md:p-8 flex justify-center">'
);

// We also need to add a meta viewport tag in index.html if it's missing (usually it's there in vite)
fs.writeFileSync('pages/crm/ContractingHub.tsx', hub);
console.log('Successfully patched ContractingHub responsiveness');
