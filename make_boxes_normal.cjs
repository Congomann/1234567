const fs = require('fs');
let content = fs.readFileSync('pages/admin/CarrierFormBuilder.tsx', 'utf8');

// Find the selected box UI
const oldUI = `{selectedFieldId === field.id && activeTool === 'select' && (
                          <>
                             <div className="absolute top-0 right-0 p-0.5 bg-blue-600 text-white rounded-bl opacity-80 pointer-events-none">
                               <GripHorizontal className="w-3 h-3" />
                             </div>
                             {/* Resize Handle */}
                             <div 
                               className="absolute -bottom-1.5 -right-1.5 w-4 h-4 bg-blue-600 border-2 border-white rounded-full cursor-se-resize shadow-md z-[60]"
                               onMouseDown={(e) => handleResizeMouseDown(e, field)}
                             />
                          </>
                        )}`;

const newUI = `{selectedFieldId === field.id && activeTool === 'select' && (
                          <>
                             {/* Invisible Resize Handle */}
                             <div 
                               className="absolute bottom-0 right-0 w-6 h-6 bg-transparent cursor-se-resize z-[60]"
                               onMouseDown={(e) => handleResizeMouseDown(e, field)}
                             />
                          </>
                        )}`;

content = content.replace(oldUI, newUI);

// Clean up the GripHorizontal import since we don't need it
content = content.replace('GripHorizontal,', '');

fs.writeFileSync('pages/admin/CarrierFormBuilder.tsx', content);
console.log('Removed visual grip and made resize handle invisible');
