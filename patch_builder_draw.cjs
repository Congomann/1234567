const fs = require('fs');
let builder = fs.readFileSync('pages/admin/CarrierFormBuilder.tsx', 'utf8');

// 1. Add Maximize / Minimize icons
builder = builder.replace(
  /import \{ FileText, SlidersHorizontal, Check, Scan, Loader2, MousePointer2, Trash2 \} from 'lucide-react';/,
  "import { FileText, SlidersHorizontal, Check, Scan, Loader2, MousePointer2, Trash2, Maximize, Minimize } from 'lucide-react';"
);

// 2. Add fullScreen state and drawing states
builder = builder.replace(
  /const \[pageNumber, setPageNumber\] = useState\(1\);/,
  `const [pageNumber, setPageNumber] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{x: number, y: number, pageIndex: number} | null>(null);
  const [currentDraw, setCurrentDraw] = useState<{x: number, y: number, w: number, h: number} | null>(null);`
);

// 3. Replace handlePdfClick with pointer events
const newPointerLogic = `
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>, pageIndex: number) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setIsDrawing(true);
    setDrawStart({ x, y, pageIndex });
    setCurrentDraw({ x, y, w: 0, h: 0 });
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>, pageIndex: number) => {
    if (!isDrawing || !drawStart || drawStart.pageIndex !== pageIndex) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const currentX = ((e.clientX - rect.left) / rect.width) * 100;
    const currentY = ((e.clientY - rect.top) / rect.height) * 100;
    
    const x = Math.min(drawStart.x, currentX);
    const y = Math.min(drawStart.y, currentY);
    const w = Math.abs(currentX - drawStart.x);
    const h = Math.abs(currentY - drawStart.y);
    
    setCurrentDraw({ x, y, w, h });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>, pageIndex: number) => {
    if (!isDrawing || !drawStart) return;
    
    e.currentTarget.releasePointerCapture(e.pointerId);
    setIsDrawing(false);
    
    // Only create if dragged a minimum distance (e.g., 1% width/height) to avoid accidental micro-clicks
    if (currentDraw && currentDraw.w > 1 && currentDraw.h > 1) {
      const newField = {
        id: 'field_' + Date.now(),
        name: 'New Field',
        type: 'text',
        mappedTo: 'none',
        x: currentDraw.x,
        y: currentDraw.y,
        width: currentDraw.w,
        height: currentDraw.h,
        pageNumber: pageIndex
      };
      setFields([...fields, newField]);
    }
    
    setDrawStart(null);
    setCurrentDraw(null);
  };
`;

builder = builder.replace(
  /const handlePdfClick = [\s\S]*?setFields\(\[\.\.\.fields, newField\]\);\n  \};/,
  newPointerLogic
);

// 4. Update the layout to support fullscreen
// Find `<div className="flex gap-6 h-[80vh]">` and make it conditional
builder = builder.replace(
  /<div className="flex gap-6 h-\[80vh\]">/,
  `<div className={isFullscreen ? "fixed inset-0 z-50 bg-gray-100 flex p-4 gap-4" : "flex gap-6 h-[80vh]"}>`
);

// Add maximize button to the PDF header
builder = builder.replace(
  /<span className="flex items-center"><MousePointer2 className="w-5 h-5 mr-2 text-gray-600" \/> Interactive Canvas/,
  `<span className="flex items-center">
    <button onClick={() => setIsFullscreen(!isFullscreen)} className="mr-3 p-1.5 bg-white rounded shadow-sm hover:bg-gray-50 border border-gray-200" title={isFullscreen ? "Minimize" : "Expand Fullscreen"}>
      {isFullscreen ? <Minimize className="w-4 h-4 text-gray-700" /> : <Maximize className="w-4 h-4 text-gray-700" />}
    </button>
    <MousePointer2 className="w-5 h-5 mr-2 text-gray-600" /> 
    Interactive Canvas`
);

// Update the Page loop to include pointer events and the temporary drawing box
const pageLoopRegex = /\{\/\* Click Catcher for this page \*\/\}\s*<div className="absolute inset-0 z-10" onClick=\{\(e\) => handlePdfClick\(e, index \+ 1\)\}><\/div>/;
const newPageLoop = `
                      {/* Temporary Draw Box */}
                      {isDrawing && currentDraw && drawStart?.pageIndex === (index + 1) && (
                        <div 
                          className="absolute border-2 border-dashed border-blue-600 bg-blue-400/20 pointer-events-none z-20"
                          style={{ left: \`\${currentDraw.x}%\`, top: \`\${currentDraw.y}%\`, width: \`\${currentDraw.w}%\`, height: \`\${currentDraw.h}%\` }}
                        />
                      )}

                      {/* Pointer Catcher for this page */}
                      <div 
                        className="absolute inset-0 z-10 touch-none" 
                        onPointerDown={(e) => handlePointerDown(e, index + 1)}
                        onPointerMove={(e) => handlePointerMove(e, index + 1)}
                        onPointerUp={(e) => handlePointerUp(e, index + 1)}
                        onPointerCancel={(e) => handlePointerUp(e, index + 1)}
                      ></div>`;

builder = builder.replace(pageLoopRegex, newPageLoop);

// Also change the empty state hint to match drawing
builder = builder.replace(
  /<p>Click anywhere on the PDF to create a fillable text box\.<\/p>/,
  '<p>Click and drag on the PDF to draw a precisely sized text box.</p>'
);

// Update the field editor in the sidebar to add "Auto-Fill Mapping"
const fieldEditorRegex = /<input type="text" value=\{field\.name\}.*?\/>\s*<\/div>/;
const newFieldEditor = `<input type="text" value={field.name} onChange={e => updateField(field.id, { name: e.target.value })} className="w-full text-sm border-gray-300 rounded p-1.5 focus:ring-blue-500 focus:border-blue-500 border" />
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
                  </div>`;

builder = builder.replace(fieldEditorRegex, newFieldEditor);

fs.writeFileSync('pages/admin/CarrierFormBuilder.tsx', builder);
console.log('Patched CarrierFormBuilder.tsx with Drawing & Expand');
