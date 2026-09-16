const fs = require('fs');

let builder = fs.readFileSync('pages/admin/CarrierFormBuilder.tsx', 'utf8');

// Ensure Settings2 icon is imported
if (!builder.includes('Settings2')) {
  builder = builder.replace(/Trash2\s*\}/, "Trash2, Settings2 }");
}

// Add expandedField state if missing
if (!builder.includes('expandedField')) {
  builder = builder.replace(
    /const \[isDrawMode, setIsDrawMode\] = useState\(false\);/,
    "const [isDrawMode, setIsDrawMode] = useState(false);\n  const [expandedField, setExpandedField] = useState<string | null>(null);"
  );
}

// Ensure type supports required and role
// Actually we can just dynamically update the fields state. 

const targetIndex = builder.indexOf('<div className="divide-y divide-gray-100">');
if (targetIndex !== -1) {
  // Find the end of this div container
  const prefix = builder.substring(0, targetIndex);
  
  const newSidebar = `
              <div className="divide-y divide-gray-100">
                {fields.map(field => (
                  <div key={field.id} className="py-3 flex flex-col hover:bg-gray-50 transition px-2 -mx-2 rounded">
                    <div className="flex items-start gap-3 w-full">
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
                      <button onClick={() => setExpandedField(expandedField === field.id ? null : field.id)} className={\`p-1 rounded \${expandedField === field.id ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-blue-500 hover:bg-blue-50'}\`}>
                        <Settings2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => removeField(field.id)} className="text-gray-300 hover:text-red-500 p-1 rounded hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {/* Expandable Properties Panel (pdffiller style) */}
                    {expandedField === field.id && (
                      <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-x-4 gap-y-3">
                        <div className="col-span-2 flex items-center justify-between">
                          <label className="text-xs font-semibold text-gray-700">Required Field</label>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={field.required || false} onChange={e => updateField(field.id, { required: e.target.checked })} className="sr-only peer" />
                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Field Type</label>
                          <select value={field.type || 'text'} onChange={e => updateField(field.id, { type: e.target.value })} className="w-full text-xs border-gray-300 rounded p-1">
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
                          <select value={field.role || 'advisor'} onChange={e => updateField(field.id, { role: e.target.value })} className="w-full text-xs border-gray-300 rounded p-1">
                            <option value="advisor">Advisor</option>
                            <option value="admin">Admin / BGA</option>
                            <option value="client">Client (Coming Soon)</option>
                          </select>
                        </div>

                        <div className="col-span-2 pt-2 border-t border-gray-50 mt-1">
                          <p className="text-[10px] font-semibold text-gray-400 mb-2 uppercase tracking-wider">Positioning</p>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] text-gray-500 mb-1 flex justify-between"><span>X Pos</span> <span>{Math.round(field.x)}%</span></label>
                              <input type="range" min="0" max="100" step="0.1" value={field.x} onChange={e => updateField(field.id, { x: parseFloat(e.target.value) })} className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                            </div>
                            <div>
                              <label className="block text-[10px] text-gray-500 mb-1 flex justify-between"><span>Y Pos</span> <span>{Math.round(field.y)}%</span></label>
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
                    )}
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

  // Because the previous replacement might have left `</div></div></div></div>);}`, we just slice at the target and replace.
  builder = prefix + newSidebar;
  fs.writeFileSync('pages/admin/CarrierFormBuilder.tsx', builder);
  console.log('Successfully patched UI with full pdffiller style property panels!');
} else {
  console.log("Could not find insertion point.");
}
