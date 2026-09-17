const fs = require('fs');
let content = fs.readFileSync('pages/admin/CarrierFormBuilder.tsx', 'utf8');

// Find: <Scan className="w-4 h-4 mr-2" /> Auto-Detect Fields
// Replace: <Scan className="w-4 h-4 mr-2" /> Auto-Detect Fields</button><button onClick={() => setFields([])} className="px-4 py-2 bg-red-100 text-red-700 border border-red-200 rounded-md hover:bg-red-200 flex items-center font-medium shadow-sm transition ml-2"><Trash className="w-4 h-4 mr-2" /> Clear All</button>

content = content.replace(
  '<Scan className="w-4 h-4 mr-2" /> Auto-Detect Fields\n          </button>',
  '<Scan className="w-4 h-4 mr-2" /> Auto-Detect Fields\n          </button>\n          <button onClick={() => setFields([])} className="px-4 py-2 bg-red-100 text-red-700 border border-red-200 rounded-md hover:bg-red-200 flex items-center font-medium shadow-sm transition ml-2">\n            <Trash className="w-4 h-4 mr-2" /> Clear All\n          </button>'
);

// We need to import Trash from lucide-react if it's not imported
if (!content.includes('Trash,')) {
  content = content.replace('Scan,', 'Scan, Trash,');
}

fs.writeFileSync('pages/admin/CarrierFormBuilder.tsx', content);
console.log('Patched Clear All button');
