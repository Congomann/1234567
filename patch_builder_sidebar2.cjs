const fs = require('fs');
let builder = fs.readFileSync('pages/admin/CarrierFormBuilder.tsx', 'utf8');

const targetIndex = builder.indexOf('<div className="flex-1 overflow-y-auto p-4 space-y-4">');

if (targetIndex !== -1) {
  // Find the end of this div container
  const prefix = builder.substring(0, targetIndex + '<div className="flex-1 overflow-y-auto p-4 space-y-4">'.length);
  
  const newSidebar = `
            {fields.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="mt-2 text-sm text-gray-600">Click Auto-Detect to scan the document for fields automatically.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {fields.map(field => (
                  <div key={field.id} className="py-3 flex items-start gap-3 hover:bg-gray-50 transition px-2 -mx-2 rounded">
                    <div className="flex-1 space-y-1">
                      <input 
                        type="text" 
                        value={field.name} 
                        onChange={e => updateField(field.id, { name: e.target.value })} 
                        className="w-full text-sm font-medium text-gray-900 border-0 bg-transparent p-0 focus:ring-0 placeholder-gray-400"
                        placeholder="Field Label"
                      />
                      <select 
                        value={field.mappedTo || 'none'} 
                        onChange={e => updateField(field.id, { mappedTo: e.target.value })}
                        className="w-full text-xs text-blue-600 border-0 bg-transparent p-0 focus:ring-0 cursor-pointer"
                      >
                        <option value="none">No Auto-Fill (Manual)</option>
                        <option value="firstName">Auto-Fill: First Name</option>
                        <option value="lastName">Auto-Fill: Last Name</option>
                        <option value="fullName">Auto-Fill: Full Name</option>
                        <option value="email">Auto-Fill: Email</option>
                        <option value="phone">Auto-Fill: Phone</option>
                        <option value="npn">Auto-Fill: NPN</option>
                      </select>
                    </div>
                    <button onClick={() => removeField(field.id)} className="text-gray-300 hover:text-red-500 p-1 rounded hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
`;

  builder = prefix + newSidebar;
  fs.writeFileSync('pages/admin/CarrierFormBuilder.tsx', builder);
  console.log('Successfully patched UI!');
}
