const fs = require('fs');
let content = fs.readFileSync('pages/admin/CarrierFormBuilder.tsx', 'utf8');

const oldDragState = `  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);`;

const newDragState = `  const [dragState, setDragState] = useState<{ id: string; pageElement: HTMLElement | null; offsetX: number; offsetY: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);`;

const oldMouseDown = `  const handleFieldMouseDown = (e: React.MouseEvent, field: any) => {
    if (activeTool !== 'select') return;
    e.stopPropagation();
    setSelectedFieldId(field.id);
    setIsDragging(true);

    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const parentRect = (e.target as HTMLElement).parentElement!.getBoundingClientRect();
    
    // Calculate offset inside the field in percentages
    const offsetX = ((e.clientX - rect.left) / parentRect.width) * 100;
    const offsetY = ((e.clientY - rect.top) / parentRect.height) * 100;
    
    setDragOffset({ x: offsetX, y: offsetY });
  };`;

const newMouseDown = `  const handleFieldMouseDown = (e: React.MouseEvent, field: any) => {
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

const oldMouseMove = `  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedFieldId) return;
    
    const parentRect = containerRef.current?.getBoundingClientRect();
    if (!parentRect) return;

    const x = ((e.clientX - parentRect.left) / parentRect.width) * 100 - dragOffset.x;
    const y = ((e.clientY - parentRect.top) / parentRect.height) * 100 - dragOffset.y;

    updateField(selectedFieldId, { 
      x: Math.max(0, Math.min(x, 100 - (fields.find(f => f.id === selectedFieldId)?.width || 0))),
      y: Math.max(0, Math.min(y, 100 - (fields.find(f => f.id === selectedFieldId)?.height || 0)))
    });
  };

  const handleMouseUp = () => {
    if (isDragging) setIsDragging(false);
  };`;

const newMouseMove = `  const handleMouseMove = (e: React.MouseEvent) => {
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

content = content.replace(oldDragState, newDragState);
content = content.replace(oldMouseDown, newMouseDown);
content = content.replace(oldMouseMove, newMouseMove);

// Also fix the indicator condition
content = content.replace(
  `isDragging && selectedFieldId === field.id ? 'grabbing' : 'grab'`,
  `dragState?.id === field.id ? 'grabbing' : 'grab'`
);

fs.writeFileSync('pages/admin/CarrierFormBuilder.tsx', content);
console.log('Fixed drag and drop logic');
