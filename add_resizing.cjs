const fs = require('fs');
let content = fs.readFileSync('pages/admin/CarrierFormBuilder.tsx', 'utf8');

// 1. Replace dragState declaration with actionState
content = content.replace(
  `const [dragState, setDragState] = useState<{ id: string; pageElement: HTMLElement | null; offsetX: number; offsetY: number } | null>(null);`,
  `const [actionState, setActionState] = useState<{ id: string; type: 'drag' | 'resize'; pageElement: HTMLElement; offsetX?: number; offsetY?: number; startMouseX?: number; startMouseY?: number; startWidth?: number; startHeight?: number } | null>(null);`
);

// 2. Add handleResizeMouseDown and rewrite handleFieldMouseDown
const oldMouseDown = `  const handleFieldMouseDown = (e: React.MouseEvent, field: any) => {
    if (activeTool !== 'select') return;
    e.stopPropagation();
    setSelectedFieldId(field.id);

    const target = (e.target as HTMLElement).closest('.absolute'); // The field div
    const pageElement = target?.parentElement; // The relative page wrapper
    if (!target || !pageElement) return;

    const rect = target.getBoundingClientRect();
    const parentRect = pageElement.getBoundingClientRect();
    
    const offsetX = ((e.clientX - rect.left) / parentRect.width) * 100;
    const offsetY = ((e.clientY - rect.top) / parentRect.height) * 100;
    
    setDragState({ id: field.id, pageElement: pageElement as HTMLElement, offsetX, offsetY });
  };`;

const newMouseDown = `  const handleFieldMouseDown = (e: React.MouseEvent, field: any) => {
    if (activeTool !== 'select') return;
    e.stopPropagation();
    setSelectedFieldId(field.id);

    const target = (e.currentTarget as HTMLElement);
    const pageElement = target?.parentElement;
    if (!target || !pageElement) return;

    const rect = target.getBoundingClientRect();
    const parentRect = pageElement.getBoundingClientRect();
    
    const offsetX = ((e.clientX - rect.left) / parentRect.width) * 100;
    const offsetY = ((e.clientY - rect.top) / parentRect.height) * 100;
    
    setActionState({ id: field.id, type: 'drag', pageElement: pageElement as HTMLElement, offsetX, offsetY });
  };

  const handleResizeMouseDown = (e: React.MouseEvent, field: any) => {
    if (activeTool !== 'select') return;
    e.stopPropagation();
    setSelectedFieldId(field.id);
    
    const target = (e.currentTarget as HTMLElement).closest('.border-2'); // Get the main field div
    const pageElement = target?.parentElement;
    if (!target || !pageElement) return;

    setActionState({ 
      id: field.id, 
      type: 'resize', 
      pageElement: pageElement as HTMLElement, 
      startMouseX: e.clientX, 
      startMouseY: e.clientY, 
      startWidth: field.width, 
      startHeight: field.height 
    });
  };`;
content = content.replace(oldMouseDown, newMouseDown);

// 3. Rewrite handleMouseMove and handleMouseUp
const oldMouseMove = `  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragState) return;
    
    const parentRect = dragState.pageElement?.getBoundingClientRect();
    if (!parentRect) return;

    const x = ((e.clientX - parentRect.left) / parentRect.width) * 100 - dragState.offsetX;
    const y = ((e.clientY - parentRect.top) / parentRect.height) * 100 - dragState.offsetY;

    updateField(dragState.id, { 
      x: Math.max(0, Math.min(x, 100 - (fields.find(f => f.id === dragState.id)?.width || 0))),
      y: Math.max(0, Math.min(y, 100 - (fields.find(f => f.id === dragState.id)?.height || 0)))
    });
  };

  const handleMouseUp = () => {
    if (dragState) setDragState(null);
  };`;

const newMouseMove = `  const handleMouseMove = (e: React.MouseEvent) => {
    if (!actionState) return;
    
    const parentRect = actionState.pageElement?.getBoundingClientRect();
    if (!parentRect) return;

    if (actionState.type === 'drag' && actionState.offsetX !== undefined && actionState.offsetY !== undefined) {
      const x = ((e.clientX - parentRect.left) / parentRect.width) * 100 - actionState.offsetX;
      const y = ((e.clientY - parentRect.top) / parentRect.height) * 100 - actionState.offsetY;

      updateField(actionState.id, { 
        x: Math.max(0, Math.min(x, 100 - (fields.find(f => f.id === actionState.id)?.width || 0))),
        y: Math.max(0, Math.min(y, 100 - (fields.find(f => f.id === actionState.id)?.height || 0)))
      });
    } else if (actionState.type === 'resize' && actionState.startMouseX !== undefined && actionState.startMouseY !== undefined && actionState.startWidth !== undefined && actionState.startHeight !== undefined) {
      const deltaXPct = ((e.clientX - actionState.startMouseX) / parentRect.width) * 100;
      const deltaYPct = ((e.clientY - actionState.startMouseY) / parentRect.height) * 100;
      
      const field = fields.find(f => f.id === actionState.id);
      if (field) {
         updateField(actionState.id, {
           width: Math.max(0.5, Math.min(actionState.startWidth + deltaXPct, 100 - field.x)),
           height: Math.max(0.5, Math.min(actionState.startHeight + deltaYPct, 100 - field.y))
         });
      }
    }
  };

  const handleMouseUp = () => {
    if (actionState) setActionState(null);
  };`;
content = content.replace(oldMouseMove, newMouseMove);

// 4. Update the Field Rendering
const oldFieldRender = `                      <div 
                        key={field.id}
                        className={\`absolute border-2 \${selectedFieldId === field.id ? 'border-blue-600 bg-blue-500/20 shadow-[0_0_0_2px_rgba(37,99,235,0.4)] z-50' : 'border-gray-400 bg-blue-100/40 hover:bg-blue-200/50 hover:border-blue-400 z-40'} transition-colors rounded-sm cursor-\${activeTool === 'select' ? (dragState?.id === field.id ? 'grabbing' : 'grab') : 'default'}\`}
                        onMouseDown={(e) => handleFieldMouseDown(e, field)}
                        style={{
                          left: \`\${field.x}%\`,
                          top: \`\${field.y}%\`,
                          width: \`\${field.width}%\`,
                          height: \`\${field.height}%\`,
                        }}
                      >
                        {/* Drag Handle Indicator */}
                        {selectedFieldId === field.id && activeTool === 'select' && (
                           <div className="absolute top-0 right-0 p-0.5 bg-blue-600 text-white rounded-bl opacity-80">
                             <GripHorizontal className="w-3 h-3" />
                           </div>
                        )}
                      </div>`;

const newFieldRender = `                      <div 
                        key={field.id}
                        className={\`absolute border-2 \${selectedFieldId === field.id ? 'border-blue-600 bg-blue-500/20 shadow-[0_0_0_2px_rgba(37,99,235,0.4)] z-50' : 'border-gray-400 bg-blue-100/40 hover:bg-blue-200/50 hover:border-blue-400 z-40'} transition-colors rounded-sm cursor-\${activeTool === 'select' ? (actionState?.id === field.id && actionState.type === 'drag' ? 'grabbing' : 'grab') : 'default'}\`}
                        onMouseDown={(e) => handleFieldMouseDown(e, field)}
                        style={{
                          left: \`\${field.x}%\`,
                          top: \`\${field.y}%\`,
                          width: \`\${field.width}%\`,
                          height: \`\${field.height}%\`,
                        }}
                      >
                        {selectedFieldId === field.id && activeTool === 'select' && (
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
                        )}
                      </div>`;
content = content.replace(oldFieldRender, newFieldRender);

// 5. Remove the FIELD SIZING block from properties panel
const oldSizingBlock = `<div className="pt-2 border-t border-gray-100 mt-2">
                      <p className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">Field Sizing</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] text-gray-500 mb-1 flex justify-between"><span>Width</span> <span>{Math.round(field.width)}%</span></label>
                          <input type="range" min="1" max="100" step="0.1" value={field.width} onChange={e => updateField(field.id, { width: parseFloat(e.target.value) })} className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-500 mb-1 flex justify-between"><span>Height</span> <span>{Math.round(field.height)}%</span></label>
                          <input type="range" min="1" max="100" step="0.1" value={field.height} onChange={e => updateField(field.id, { height: parseFloat(e.target.value) })} className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                        </div>
                      </div>
                    </div>`;
content = content.replace(oldSizingBlock, '');

// Also fix handlePdfClick condition
content = content.replace(`if (activeTool === 'select' || dragState) return;`, `if (activeTool === 'select' || actionState) return;`);


fs.writeFileSync('pages/admin/CarrierFormBuilder.tsx', content);
console.log('Added resize handles and removed sliders');
