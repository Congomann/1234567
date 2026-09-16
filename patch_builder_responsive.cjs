const fs = require('fs');

let builder = fs.readFileSync('pages/admin/CarrierFormBuilder.tsx', 'utf8');

// 1. Add selectedField state
if (!builder.includes('selectedFieldId')) {
  builder = builder.replace(
    /const \[expandedField, setExpandedField\] = useState<string \| null>\(null\);/,
    "const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);"
  );
}

// 2. Make layout responsive
builder = builder.replace(
  /<div className="grid grid-cols-12 gap-6 h-\[calc\(100vh-12rem\)\]">/,
  '<div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 h-[calc(100vh-12rem)]">'
);
builder = builder.replace(
  /<div className="col-span-8 bg-gray-100\/50 rounded-xl overflow-y-auto border border-gray-200 relative"([^>]*)>/,
  '<div className="col-span-12 lg:col-span-8 bg-gray-100/50 rounded-xl overflow-y-auto border border-gray-200 relative"$1>'
);
builder = builder.replace(
  /<div className="col-span-4 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full overflow-hidden">/,
  '<div className="col-span-12 lg:col-span-4 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full overflow-hidden">'
);

// 3. Make canvas fields clickable to select
builder = builder.replace(
  /className={\`absolute border-2 \$\{field.needsReview \? 'border-orange-400 bg-orange-400\/20 hover:bg-orange-400\/40 hover:border-orange-500 border-dashed' : 'border-blue-400 bg-blue-400\/20 hover:bg-blue-400\/40 hover:border-blue-500'\} transition-colors rounded-sm cursor-pointer\`}/g,
  "className={`absolute border-2 ${selectedFieldId === field.id ? 'border-purple-600 bg-purple-500/30 shadow-[0_0_0_2px_rgba(147,51,234,0.3)] z-50' : field.needsReview ? 'border-orange-400 bg-orange-400/20 hover:bg-orange-400/40 hover:border-orange-500 border-dashed z-40' : 'border-blue-400 bg-blue-400/20 hover:bg-blue-400/40 hover:border-blue-500 z-40'} transition-all rounded-sm cursor-pointer`}\n                          onClick={(e) => { e.stopPropagation(); setSelectedFieldId(field.id); }}"
);

// 4. Delete the giant list in the sidebar and replace with single selected field properties
const sidebarStart = builder.indexOf('<div className="divide-y divide-gray-100">');
if (sidebarStart !== -1) {
  const nextDiv = builder.indexOf('</div>\n            )}\n          </div>', sidebarStart);
  
  const newSidebar = `
              <div className="p-4">
                {selectedFieldId ? (() => {
                  const field = fields.find(f => f.id === selectedFieldId);
                  if (!field) return null;
                  return (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                        <h3 className="font-semibold text-gray-900">Field Properties</h3>
                        <button onClick={() => setSelectedFieldId(null)} className="text-xs text-gray-400 hover:text-gray-600">Close</button>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Field Label</label>
                          <input 
                            type="text" 
                            value={field.name} 
                            onChange={e => updateField(field.id, { name: e.target.value })} 
                            className="w-full text-sm font-medium text-gray-900 border-gray-300 rounded focus:ring-blue-500"
                            placeholder="Enter field name..."
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">CRM Auto-Fill Mapping</label>
                          <select 
                            value={field.mappedTo || 'none'} 
                            onChange={e => updateField(field.id, { mappedTo: e.target.value })}
                            className="w-full text-sm text-gray-700 border-gray-300 rounded focus:ring-blue-500"
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

                        <div className="pt-2 border-t border-gray-100 grid grid-cols-2 gap-x-4 gap-y-3">
                          <div className="col-span-2 flex items-center justify-between bg-gray-50 p-2 rounded">
                            <label className="text-sm font-semibold text-gray-700">Required Field</label>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" checked={field.required || false} onChange={e => updateField(field.id, { required: e.target.checked })} className="sr-only peer" />
                              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Field Type</label>
                            <select value={field.type || 'text'} onChange={e => updateField(field.id, { type: e.target.value })} className="w-full text-sm border-gray-300 rounded p-1.5">
                              <option value="text">Text Box</option>
                              <option value="number">Number</option>
                              <option value="date">Date Picker</option>
                              <option value="signature">Signature</option>
                              <option value="initials">Initials</option>
                              <option value="checkbox">Checkbox</option>
                              <option value="radio">Radio</option>
                              <option value="dropdown">Dropdown</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Assign Role</label>
                            <select value={field.role || 'advisor'} onChange={e => updateField(field.id, { role: e.target.value })} className="w-full text-sm border-gray-300 rounded p-1.5">
                              <option value="advisor">Advisor</option>
                              <option value="admin">Admin / BGA</option>
                              <option value="client">Client (Coming Soon)</option>
                            </select>
                          </div>

                          <div className="col-span-2 pt-3 border-t border-gray-50 mt-1">
                            <p className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">Position & Size</p>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-[10px] text-gray-500 mb-1 flex justify-between"><span>X Position</span> <span>{Math.round(field.x)}%</span></label>
                                <input type="range" min="0" max="100" step="0.1" value={field.x} onChange={e => updateField(field.id, { x: parseFloat(e.target.value) })} className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                              </div>
                              <div>
                                <label className="block text-[10px] text-gray-500 mb-1 flex justify-between"><span>Y Position</span> <span>{Math.round(field.y)}%</span></label>
                                <input type="range" min="0" max="100" step="0.1" value={field.y} onChange={e => updateField(field.id, { y: parseFloat(e.target.value) })} className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                              </div>
                              <div>
                                <label className="block text-[10px] text-gray-500 mb-1 flex justify-between"><span>Width</span> <span>{Math.round(field.width)}%</span></label>
                                <input type="range" min="1" max="100" step="0.1" value={field.width} onChange={e => updateField(field.id, { width: parseFloat(e.target.value) })} className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                              </div>
                              <div>
                                <label className="block text-[10px] text-gray-500 mb-1 flex justify-between"><span>Height</span> <span>{Math.round(field.height)}%</span></label>
                                <input type="range" min="1" max="100" step="0.1" value={field.height} onChange={e => updateField(field.id, { height: parseFloat(e.target.value) })} className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="pt-4 mt-4 border-t border-gray-100 flex justify-end">
                           <button onClick={() => { removeField(field.id); setSelectedFieldId(null); }} className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded transition">
                             <Trash2 className="w-4 h-4" /> Delete Field
                           </button>
                        </div>
                      </div>
                    </div>
                  );
                })() : (
                  <div className="flex flex-col items-center justify-center h-48 text-center text-gray-400">
                    <MousePointer2 className="w-10 h-10 mb-3 text-gray-300" />
                    <p className="text-sm">Select any field on the PDF to configure its properties.</p>
                  </div>
                )}
              </div>
`;

  builder = builder.substring(0, sidebarStart) + newSidebar + builder.substring(nextDiv + 6);
  fs.writeFileSync('pages/admin/CarrierFormBuilder.tsx', builder);
  console.log('Successfully patched CarrierFormBuilder responsive and deleted giant list');
}
