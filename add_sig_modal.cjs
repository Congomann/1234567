const fs = require('fs');
let content = fs.readFileSync('pages/crm/ContractingHub.tsx', 'utf8');

const signatureModalCode = `
const SignatureModal = ({ isOpen, onClose, onSave, title }: { isOpen: boolean, onClose: () => void, onSave: (dataUrl: string) => void, title: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#000033';
      }
    }
  }, [isOpen]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) ctx.beginPath();
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XSquare className="w-5 h-5" /></button>
        </div>
        <div className="p-6 flex flex-col items-center">
          <p className="text-sm text-gray-500 mb-4 w-full text-left">Please draw your signature below using your mouse or trackpad.</p>
          <div className="border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 overflow-hidden touch-none w-full flex justify-center">
            <canvas
              ref={canvasRef}
              width={400}
              height={150}
              onMouseDown={startDrawing}
              onMouseUp={stopDrawing}
              onMouseOut={stopDrawing}
              onMouseMove={draw}
              onTouchStart={startDrawing}
              onTouchEnd={stopDrawing}
              onTouchMove={draw}
              className="cursor-crosshair max-w-full"
            />
          </div>
          <div className="flex justify-end w-full mt-2">
            <button 
              onClick={() => {
                if (canvasRef.current) {
                  const ctx = canvasRef.current.getContext('2d');
                  if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                }
              }} 
              className="text-xs text-gray-500 hover:text-blue-600 font-medium transition-colors"
            >
              Clear Canvas
            </button>
          </div>
        </div>
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
          <button 
            onClick={() => {
              if (canvasRef.current) {
                onSave(canvasRef.current.toDataURL('image/png'));
                onClose();
              }
            }} 
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-sm transition-colors"
          >
            Apply Signature
          </button>
        </div>
      </div>
    </div>
  );
};
`;

content = content.replace('export default function ContractingHub() {', signatureModalCode + '\nexport default function ContractingHub() {');

// We also need to add state for the signature modal inside ContractingHub
const stateHook = `  const [formValues, setFormValues] = useState<Record<string, any>>({});`;
const newStateHook = `  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [sigModalOpen, setSigModalOpen] = useState(false);
  const [sigTargetField, setSigTargetField] = useState<any>(null);`;
content = content.replace(stateHook, newStateHook);

// Replace the prompt with modal open
const oldPrompt = `const sig = prompt(\`Enter \${field.type === 'signature' ? 'Signature' : 'Initials'}:\`, formValues[field.id] || '');
                                if (sig !== null) setFormValues({...formValues, [field.id]: sig});`;
const newPrompt = `setSigTargetField(field);
                                setSigModalOpen(true);`;
content = content.replace(oldPrompt, newPrompt);

// Make sure it renders the image if it's base64, otherwise text
const oldRender = `{formValues[field.id] ? (
                                <span className="font-['Brush_Script_MT',cursive] text-lg text-blue-900">{formValues[field.id]}</span>
                              ) : (`;
const newRender = `{formValues[field.id] ? (
                                formValues[field.id].startsWith('data:image/png') ? (
                                  <img src={formValues[field.id]} alt="Signature" className="max-h-full max-w-full object-contain mix-blend-multiply opacity-80" />
                                ) : (
                                  <span className="font-['Brush_Script_MT',cursive] text-lg text-blue-900">{formValues[field.id]}</span>
                                )
                              ) : (`;
content = content.replace(oldRender, newRender);

// Add the modal component to the render tree at the bottom
const oldReturn = `    </div>
  );
}`;
const newReturn = `      <SignatureModal 
        isOpen={sigModalOpen} 
        title={sigTargetField?.type === 'signature' ? 'Draw Signature' : 'Draw Initials'}
        onClose={() => {
          setSigModalOpen(false);
          setSigTargetField(null);
        }}
        onSave={(dataUrl) => {
          if (sigTargetField) {
            setFormValues({...formValues, [sigTargetField.id]: dataUrl});
          }
        }}
      />
    </div>
  );
}`;
content = content.replace(oldReturn, newReturn);

fs.writeFileSync('pages/crm/ContractingHub.tsx', content);
console.log('Added Signature Modal to ContractingHub');
