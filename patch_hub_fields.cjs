const fs = require('fs');

let hub = fs.readFileSync('pages/crm/ContractingHub.tsx', 'utf8');

// Replace the simple field rendering with the full pdffiller style support
const oldFieldRendering = `
                        {field.type === 'checkbox' ? (
                        <div 
                          className="w-full h-full absolute inset-0 z-40 flex items-center justify-center cursor-pointer border border-blue-400 bg-blue-100/40 hover:bg-blue-100/60 focus-within:ring-2 focus-within:ring-blue-600 rounded-sm"
                          onClick={() => setFormValues({...formValues, [field.id]: formValues[field.id] === 'true' ? 'false' : 'true'})}
                        >
                          {formValues[field.id] === 'true' && <Check className="w-4 h-4 text-blue-700" />}
                        </div>
                      ) : (
                        <input
                          type="text"
                          placeholder={field.name}
                          value={formValues[field.id] || ''}
                          onChange={(e) => setFormValues({...formValues, [field.id]: e.target.value})}
                          className="w-full h-full bg-blue-100/40 hover:bg-blue-100/60 border border-blue-400 focus:bg-yellow-50 focus:border-blue-600 focus:ring-2 focus:ring-blue-600 text-sm font-medium text-gray-900 px-1 absolute inset-0 z-40 outline-none transition-all shadow-sm rounded-sm"
                        />
                      )}
`;

const newFieldRendering = `
                      {(() => {
                        const isRequired = field.required;
                        const isEmpty = !formValues[field.id] || formValues[field.id].trim() === '';
                        const borderClass = isRequired && isEmpty ? 'border-red-500 bg-red-100/30 hover:bg-red-100/50' : 'border-blue-400 bg-blue-100/40 hover:bg-blue-100/60';
                        
                        if (field.role === 'admin') {
                           return (
                             <div className="w-full h-full absolute inset-0 z-40 flex items-center bg-gray-200/50 border border-gray-400/50 rounded-sm cursor-not-allowed px-1 overflow-hidden" title="Admin only field">
                               <span className="text-[10px] text-gray-500 truncate">{field.name || 'Admin Use'}</span>
                             </div>
                           );
                        }
                        
                        if (field.type === 'checkbox' || field.type === 'radio') {
                          return (
                            <div 
                              className={\`w-full h-full absolute inset-0 z-40 flex items-center justify-center cursor-pointer border \${borderClass} focus-within:ring-2 focus-within:ring-blue-600 rounded-sm transition-all\`}
                              onClick={() => setFormValues({...formValues, [field.id]: formValues[field.id] === 'true' ? 'false' : 'true'})}
                            >
                              {formValues[field.id] === 'true' && <Check className="w-4 h-4 text-blue-700" />}
                              {isRequired && isEmpty && <span className="absolute -top-1 -right-1 text-red-500 text-xs font-bold">*</span>}
                            </div>
                          );
                        }
                        if (field.type === 'signature' || field.type === 'initials') {
                          return (
                            <div 
                              className={\`w-full h-full absolute inset-0 z-40 flex items-center justify-center cursor-pointer border \${borderClass} focus-within:ring-2 focus-within:ring-blue-600 rounded-sm transition-all\`}
                              onClick={() => {
                                const sig = prompt(\`Enter \${field.type === 'signature' ? 'Signature' : 'Initials'}:\`, formValues[field.id] || '');
                                if (sig !== null) setFormValues({...formValues, [field.id]: sig});
                              }}
                            >
                              {formValues[field.id] ? (
                                <span className="font-['Brush_Script_MT',cursive] text-lg text-blue-900">{formValues[field.id]}</span>
                              ) : (
                                <span className="text-[10px] uppercase text-gray-500 font-semibold tracking-wider flex items-center gap-1">
                                  <Edit2 className="w-3 h-3" /> Sign Here
                                </span>
                              )}
                              {isRequired && isEmpty && <span className="absolute -top-1 -right-1 text-red-500 text-xs font-bold">*</span>}
                            </div>
                          );
                        }
                        if (field.type === 'date') {
                          return (
                            <input
                              type="date"
                              value={formValues[field.id] || ''}
                              onChange={(e) => setFormValues({...formValues, [field.id]: e.target.value})}
                              className={\`w-full h-full \${borderClass} focus:bg-yellow-50 focus:border-blue-600 focus:ring-2 focus:ring-blue-600 text-sm font-medium text-gray-900 px-1 absolute inset-0 z-40 outline-none transition-all shadow-sm rounded-sm\`}
                            />
                          );
                        }
                        return (
                          <div className="w-full h-full absolute inset-0 z-40">
                            <input
                              type="text"
                              placeholder={field.name}
                              value={formValues[field.id] || ''}
                              onChange={(e) => setFormValues({...formValues, [field.id]: e.target.value})}
                              className={\`w-full h-full \${borderClass} focus:bg-yellow-50 focus:border-blue-600 focus:ring-2 focus:ring-blue-600 text-sm font-medium text-gray-900 px-1 absolute inset-0 outline-none transition-all shadow-sm rounded-sm\`}
                            />
                            {isRequired && isEmpty && <span className="absolute -top-1 -right-1 text-red-500 text-xs font-bold pointer-events-none">*</span>}
                          </div>
                        );
                      })()}
`;

hub = hub.replace(
  /\{field\.type === 'checkbox' \? \([\s\S]*?\)\}\n                      <\/div>/,
  newFieldRendering + '                      </div>'
);

fs.writeFileSync('pages/crm/ContractingHub.tsx', hub);
console.log('Patched ContractingHub fields rendering');
