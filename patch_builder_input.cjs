const fs = require('fs');
let content = fs.readFileSync('pages/admin/CarrierFormBuilder.tsx', 'utf8');

const fieldBlockStart = `{fields.filter(f => f.pageNumber === (index + 1)).map(field => (
                      <div`;

const fieldBlockEnd = `                      </div>
                    ))}
                    
                    {/* Click Catcher for dropping new fields */}`;

// Let's replace the whole rendering of the field in the builder.
// We will embed an <input> that updates `field.name`.

const newFieldRender = `{fields.filter(f => f.pageNumber === (index + 1)).map(field => (
                      <div 
                        key={field.id}
                        className={\`absolute border-2 \${selectedFieldId === field.id ? 'border-blue-600 bg-blue-500/20 shadow-[0_0_0_2px_rgba(37,99,235,0.4)] z-50' : 'border-gray-400 bg-blue-100/40 hover:bg-blue-200/50 hover:border-blue-400 z-40'} transition-colors rounded-sm cursor-\${activeTool === 'select' ? (actionState?.id === field.id && actionState.type === 'drag' ? 'grabbing' : 'text') : 'default'}\`}
                        onMouseDown={(e) => handleFieldMouseDown(e, field)}
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          setFields(prev => prev.filter(f => f.id !== field.id));
                          if (selectedFieldId === field.id) setSelectedFieldId(null);
                        }}
                        style={{
                          left: \`\${field.x}%\`,
                          top: \`\${field.y}%\`,
                          width: \`\${field.width}%\`,
                          height: \`\${field.height}%\`,
                        }}
                      >
                        <input
                           type="text"
                           className="w-full h-full bg-transparent outline-none border-none text-[10px] font-bold text-blue-900 px-1"
                           placeholder="Type field name..."
                           value={field.name || ''}
                           onChange={(e) => {
                             setFields(prev => prev.map(f => f.id === field.id ? { ...f, name: e.target.value } : f));
                           }}
                           onMouseDown={(e) => {
                             // Let the div handle drag start if it's a drag action, otherwise stop propagation to allow typing
                             if (selectedFieldId === field.id && activeTool === 'select') {
                               e.stopPropagation(); 
                             }
                           }}
                        />
                        {selectedFieldId === field.id && activeTool === 'select' && (
                          <>
                             {/* Invisible Resize Handle */}
                             <div 
                               className="absolute bottom-0 right-0 w-6 h-6 bg-transparent cursor-se-resize z-[60]"
                               onMouseDown={(e) => handleResizeMouseDown(e, field)}
                             />
                          </>
                        )}
                      </div>
                    ))}
                    
                    {/* Click Catcher for dropping new fields */}`;

const startIndex = content.indexOf('{fields.filter(f => f.pageNumber === (index + 1)).map(field => (');
const endIndex = content.indexOf('{/* Click Catcher for dropping new fields */}');

if (startIndex !== -1 && endIndex !== -1) {
  content = content.slice(0, startIndex) + newFieldRender + content.slice(endIndex + 45);
  fs.writeFileSync('pages/admin/CarrierFormBuilder.tsx', content);
  console.log('Patched fields loop to include input');
} else {
  console.log('Failed to find indices');
}
