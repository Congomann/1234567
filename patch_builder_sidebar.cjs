const fs = require('fs');

let builder = fs.readFileSync('pages/admin/CarrierFormBuilder.tsx', 'utf8');

const oldSidebar = `
            {fields.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <MousePointer2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="mt-2 text-sm text-gray-600">Click Auto-Detect to scan the document for fields automatically.</p>
              </div>
            ) : (
              fields.map(field => (
                <div key={field.id} className="p-3 border border-gray-200 rounded-lg bg-gray-50 space-y-3 relative group">
                  <button onClick={() => removeField(field.id)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Field Name (Label)</label>
                    <input type="text" value={field.name} onChange={e => updateField(field.id, { name: e.target.value })} className="w-full text-sm border-gray-300 rounded p-1.5 focus:ring-blue-500 focus:border-blue-500 border" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Auto-Fill from CRM</label>
                    <select 
                      value={field.mappedTo || 'none'} 
                      onChange={e => updateField(field.id, { mappedTo: e.target.value })}
                      className="w-full text-sm border-gray-300 rounded p-1.5 bg-white border"
                    >
                      <option value="none">None (Advisor fills manually)</option>
                      <option value="firstName">Advisor First Name</option>
                      <option value="lastName">Advisor Last Name</option>
                      <option value="fullName">Advisor Full Name</option>
                      <option value="email">Advisor Email</option>
                      <option value="phone">Advisor Phone</option>
                      <option value="npn">Advisor NPN</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Width (%)</label>
                      <input type="number" value={Math.round(field.width)} onChange={e => updateField(field.id, { width: parseFloat(e.target.value) })} className="w-full text-sm border-gray-300 rounded p-1 border" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Height (%)</label>
                      <input type="number" value={Math.round(field.height)} onChange={e => updateField(field.id, { height: parseFloat(e.target.value) })} className="w-full text-sm border-gray-300 rounded p-1 border" />
                    </div>
                  </div>
                </div>
              ))
            )}
`;

// It might be slightly different due to previous replacements, let's use a regex that matches the whole block.
// Let's replace the whole fields.length === 0 block.

const newSidebar = `
            {fields.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <MousePointer2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
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
`;

builder = builder.replace(
  /\{fields\.length === 0 \? \([\s\S]*?\)\n            \}\n          <\/div>\n        <\/div>\n      <\/div>/,
  newSidebar + '\n          </div>\n        </div>\n      </div>'
);

fs.writeFileSync('pages/admin/CarrierFormBuilder.tsx', builder);
console.log('Patched CarrierFormBuilder sidebar');
