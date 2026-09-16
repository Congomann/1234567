const fs = require('fs');

let builder = fs.readFileSync('pages/admin/CarrierFormBuilder.tsx', 'utf8');

// Need to add state for expanded field
if (!builder.includes('expandedField')) {
  builder = builder.replace(
    /const \[isDrawMode, setIsDrawMode\] = useState\(false\);/,
    "const [isDrawMode, setIsDrawMode] = useState(false);\n  const [expandedField, setExpandedField] = useState<string | null>(null);"
  );
}

// Add Settings/Sliders icon import
if (!builder.includes('Settings2')) {
  builder = builder.replace(
    /Trash2\s*\}/,
    "Trash2, Settings2 }"
  );
}

const newSidebar = `
            {fields.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <MousePointer2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="mt-2 text-sm text-gray-600">Click Auto-Detect to scan the document for fields automatically.</p>
              </div>
            ) : (
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
                    
                    {/* Expandable Positioning Panel */}
                    {expandedField === field.id && (
                      <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1 flex justify-between"><span>X Position</span> <span>{Math.round(field.x)}%</span></label>
                          <input type="range" min="0" max="100" step="0.5" value={field.x} onChange={e => updateField(field.id, { x: parseFloat(e.target.value) })} className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1 flex justify-between"><span>Y Position</span> <span>{Math.round(field.y)}%</span></label>
                          <input type="range" min="0" max="100" step="0.5" value={field.y} onChange={e => updateField(field.id, { y: parseFloat(e.target.value) })} className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1 flex justify-between"><span>Width</span> <span>{Math.round(field.width)}%</span></label>
                          <input type="range" min="1" max="100" step="0.5" value={field.width} onChange={e => updateField(field.id, { width: parseFloat(e.target.value) })} className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1 flex justify-between"><span>Height</span> <span>{Math.round(field.height)}%</span></label>
                          <input type="range" min="1" max="100" step="0.5" value={field.height} onChange={e => updateField(field.id, { height: parseFloat(e.target.value) })} className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                        </div>
                      </div>
                    )}
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
console.log('Patched UI with collapsible sliders');
