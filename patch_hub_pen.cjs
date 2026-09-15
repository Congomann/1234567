const fs = require('fs');
let hub = fs.readFileSync('pages/crm/ContractingHub.tsx', 'utf8');

// 1. Add DrawingCanvas component outside the main function
const drawingCanvasComponent = `
const DrawingCanvas = ({ pageIndex, initialData, onSave, isPenActive }: { pageIndex: number, initialData: string, onSave: (data: string) => void, isPenActive: boolean }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = React.useState(false);

  React.useEffect(() => {
    if (initialData && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = initialData;
    }
  }, [initialData]);

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isPenActive || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.beginPath();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    ctx.moveTo((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY);
    setIsDrawing(true);
    canvas.setPointerCapture(e.pointerId);
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isPenActive || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    ctx.lineTo((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY);
    ctx.strokeStyle = '#2563eb'; // blue-600
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const stopDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isDrawing && canvasRef.current) {
      setIsDrawing(false);
      canvasRef.current.releasePointerCapture(e.pointerId);
      onSave(canvasRef.current.toDataURL());
    }
  };

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    onSave(''); // clear save
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        width={800}
        height={1035} // Standard 8.5x11 aspect ratio at 800px width
        className={\`absolute inset-0 z-30 \${isPenActive ? 'cursor-crosshair touch-none' : 'pointer-events-none'}\`}
        style={{ width: '100%', height: '100%' }}
        onPointerDown={startDrawing}
        onPointerMove={draw}
        onPointerUp={stopDrawing}
        onPointerCancel={stopDrawing}
      />
      {isPenActive && (
        <button 
          onClick={clearCanvas} 
          className="absolute top-2 right-2 z-40 bg-white/90 text-red-600 px-2 py-1 text-xs font-bold rounded shadow border border-red-200 hover:bg-red-50"
        >
          Clear Ink (Page {pageIndex})
        </button>
      )}
    </>
  );
};
`;

hub = hub.replace(
  /export default function ContractingHub\(\) \{/,
  drawingCanvasComponent + '\nexport default function ContractingHub() {'
);

// 2. Add isPenActive state to ContractingHub
hub = hub.replace(
  /const \[isSubmitting, setIsSubmitting\] = useState\(false\);/,
  `const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPenActive, setIsPenActive] = useState(false);`
);

// 3. Add Pen Tool button to the toolbar
const toolbarButtons = `
            <button 
              onClick={() => setIsPenActive(!isPenActive)} 
              className={\`px-3 py-2 flex items-center rounded-md transition font-medium \${isPenActive ? 'bg-blue-100 text-blue-700 shadow-inner' : 'text-gray-600 hover:bg-gray-100'}\`}
              title="Draw Pen for Yes/No Checkmarks"
            >
              <PenTool className="w-5 h-5 mr-2" />
              {isPenActive ? 'Pen Active' : 'Draw Pen'}
            </button>
            <button onClick={() => setIsFullscreen(!isFullscreen)} className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition" title="Toggle Fullscreen">
`;
hub = hub.replace(
  /<button onClick=\{\(\) => setIsFullscreen\(\!isFullscreen\)\} className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition" title="Toggle Fullscreen">/,
  toolbarButtons
);

// 4. Inject DrawingCanvas into the Page loop
const canvasOverlay = `
                    <DrawingCanvas 
                      pageIndex={index + 1} 
                      initialData={formValues[\`draw_page_\${index + 1}\`]} 
                      onSave={(data) => setFormValues({...formValues, [\`draw_page_\${index + 1}\`]: data})} 
                      isPenActive={isPenActive} 
                    />
                    
                    {fields.filter(f => f.pageNumber === (index + 1)).map(field => (`;

hub = hub.replace(
  /\{fields\.filter\(f => f\.pageNumber === \(index \+ 1\)\)\.map\(field => \(/,
  canvasOverlay
);

fs.writeFileSync('pages/crm/ContractingHub.tsx', hub);
console.log('Patched ContractingHub with Draw Pen');
