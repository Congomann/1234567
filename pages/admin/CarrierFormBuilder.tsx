import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { ChevronLeft, Maximize, Minimize, Check, Scan, Trash2, MousePointer2, Type, PenTool, Hash, CheckSquare, Calendar,  Undo, Redo, FileText, List, XSquare } from 'lucide-react';
import { DetectionEngine } from '../../services/DetectionEngine';
import { DB } from '../../services/database';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function CarrierFormBuilder() {
  const [searchParams] = useSearchParams();
  const carrierId = searchParams.get('carrier');
  const navigate = useNavigate();

  const [pdfData, setPdfData] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [fields, setFields] = useState<any[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pdfWidth, setPdfWidth] = useState(800);
  
  // Toolbar State
  const [activeTool, setActiveTool] = useState<string>('select'); // 'select', 'text', 'sign', 'check', 'date'
  
  // Drag and Drop State
  const [actionState, setActionState] = useState<{ id: string; type: 'drag' | 'resize'; pageElement: HTMLElement; offsetX?: number; offsetY?: number; startMouseX?: number; startMouseY?: number; startWidth?: number; startHeight?: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const carrierName = carrierId === 'PL-2026.01' ? "Protective Life Brokerage Application" : "Carrier Application Form";

  useEffect(() => {
    const handleResize = () => {
      const container = document.getElementById('pdf-container-wrapper');
      if (container) {
        setPdfWidth(container.clientWidth - 40);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isFullscreen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Backspace' || e.key === 'Delete') {
        if (selectedFieldId && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
          setFields(prev => prev.filter(f => f.id !== selectedFieldId));
          setSelectedFieldId(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedFieldId]);

  useEffect(() => {
    if (carrierId) {
      DB.getAll('pdf_cache').then(caches => {
        const cached = (caches as any[]).find(c => c.id === carrierId);
        if (cached && cached.data) {
          setPdfData(cached.data);
        }
      }).catch(console.error);
    }
  }, [carrierId]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const handlePdfClick = (e: React.MouseEvent<HTMLDivElement>, pageIndex: number) => {
    if (activeTool === 'select' || actionState) return;
    
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    let type = 'text';
    let name = 'New Field';
    let w = 15;
    let h = 2.5;

    if (activeTool === 'text') { type = 'text'; name = 'Text Field'; w = 15; h = 2.5; }
    if (activeTool === 'number') { type = 'number'; name = 'Number Field'; w = 10; h = 2.5; }
    if (activeTool === 'date') { type = 'date'; name = 'Date'; w = 12; h = 2.5; }
    if (activeTool === 'sign') { type = 'signature'; name = 'Signature'; w = 20; h = 5; }
    if (activeTool === 'initials') { type = 'initials'; name = 'Initials'; w = 8; h = 4; }
    if (activeTool === 'check') { type = 'checkbox'; name = 'Checkbox'; w = 2; h = 2; }
    if (activeTool === 'dropdown') { type = 'dropdown'; name = 'Dropdown'; w = 15; h = 2.5; }
    
    const newField = {
      id: 'field_' + Date.now(),
      name: name,
      type: type,
      mappedTo: 'none',
      x: x,
      y: y,
      width: w,
      height: h,
      pageNumber: pageIndex
    };
    
    setFields([...fields, newField]);
    setSelectedFieldId(newField.id);
    setActiveTool('select'); // revert back to select after dropping
  };

  const updateField = (id: string, updates: any) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const handleAutoDetect = async () => {
    if (!pdfData) return;
    try {
      const detectedFields = await DetectionEngine.detectFields(pdfData);
      if (detectedFields.length > 0) {
        const mappedFields = detectedFields.map(df => ({
          id: df.id,
          name: df.label || 'Unknown Field',
          type: df.type === 'radio' ? 'checkbox' : df.type,
          mappedTo: 'none',
          x: df.x,
          y: df.y,
          width: df.width,
          height: df.height,
          pageNumber: df.pageNumber,
          needsReview: df.needsReview,
          confidence: df.confidence
        }));
        setFields([...fields, ...mappedFields]);
      } else {
        console.log("No viable fields detected.");
      }
    } catch (e) {
      console.error(e);
      console.error("Detection error.");
    }
  };

  const handleSave = () => {
    navigate('/crm');
  };

  // Drag and Drop Logic
  const handleFieldMouseDown = (e: React.MouseEvent, field: any) => {
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
  };

  const handleMouseMove = (e: React.MouseEvent) => {
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
      const deltaXPct = (((e.clientX - actionState.startMouseX) / parentRect.width) * 100) * 0.4; // Slower, steady crop
      const deltaYPct = (((e.clientY - actionState.startMouseY) / parentRect.height) * 100) * 0.4;
      
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
  };

  // Top Toolbar Item Component
  const ToolBtn = ({ id, icon: Icon, label }: { id: string, icon: any, label: string }) => (
    <button 
      onClick={() => { setActiveTool(id); setSelectedFieldId(null); }}
      className={`flex flex-col items-center justify-center px-3 py-2 rounded transition ${activeTool === id ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
    >
      <Icon className="w-5 h-5 mb-1" />
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );

  return (
    <div className={`flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-gray-100' : 'min-h-screen bg-gray-50'}`} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center shrink-0">
        <div className="flex items-center">
          <button onClick={() => navigate('/crm')} className="mr-4 text-gray-500 hover:text-gray-900 transition"><ChevronLeft className="w-5 h-5" /></button>
          <h1 className="text-xl font-bold text-gray-900">Digital Form Builder: {carrierName}</h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleAutoDetect} className="px-4 py-2 bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-md hover:bg-indigo-200 flex items-center font-medium shadow-sm transition">
            <Scan className="w-4 h-4 mr-2" /> Auto-Detect Fields
          </button>
          <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center font-medium shadow-sm transition">
            <Check className="w-4 h-4 mr-2" /> Publish
          </button>
        </div>
      </div>

      {/* Modern Top Toolbar (DocuSign/pdfFiller style) */}
      <div className="bg-white border-b border-gray-200 px-4 py-1 flex items-center gap-1 shadow-sm shrink-0 overflow-x-auto">
        <div className="flex items-center border-r border-gray-200 pr-3 mr-1">
          <button className="flex flex-col items-center justify-center px-3 py-2 text-gray-400 cursor-not-allowed"><Undo className="w-5 h-5 mb-1" /><span className="text-[10px] font-medium">Undo</span></button>
          <button className="flex flex-col items-center justify-center px-3 py-2 text-gray-400 cursor-not-allowed"><Redo className="w-5 h-5 mb-1" /><span className="text-[10px] font-medium">Redo</span></button>
        </div>
        
        <ToolBtn id="select" icon={MousePointer2} label="Select" />
        <ToolBtn id="text" icon={Type} label="Text Box" />
        <ToolBtn id="number" icon={Hash} label="Number" />
        <ToolBtn id="date" icon={Calendar} label="Date" />
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        <ToolBtn id="sign" icon={PenTool} label="Signature" />
        <ToolBtn id="initials" icon={PenTool} label="Initials" />
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        <ToolBtn id="check" icon={CheckSquare} label="Checkbox" />
        <ToolBtn id="dropdown" icon={List} label="Dropdown" />
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* PDF Viewer */}
        <div id="pdf-container-wrapper" className="flex-1 overflow-auto bg-gray-500 flex justify-center p-8 relative">
          {pdfData ? (
            <div className="relative bg-white shadow-2xl inline-block" ref={containerRef}>
              <Document file={pdfData} onLoadSuccess={onDocumentLoadSuccess} renderMode="canvas">
                {Array.from(new Array(numPages || 1), (el, index) => (
                  <div key={`page_${index + 1}`} className="relative mb-6 shadow-md bg-white border border-gray-200">
                    <Page pageNumber={index + 1} renderTextLayer={false} renderAnnotationLayer={false} width={pdfWidth} />
                    
                    {/* Overlay Fields for this specific page */}
                    {fields.filter(f => f.pageNumber === (index + 1)).map(field => (
                      <div 
                        key={field.id}
                        className={`absolute border-2 ${selectedFieldId === field.id ? 'border-blue-600 bg-blue-500/20 shadow-[0_0_0_2px_rgba(37,99,235,0.4)] z-50' : 'border-gray-400 bg-blue-100/40 hover:bg-blue-200/50 hover:border-blue-400 z-40'} transition-colors rounded-sm cursor-${activeTool === 'select' ? (actionState?.id === field.id && actionState.type === 'drag' ? 'grabbing' : 'grab') : 'default'}`}
                        onMouseDown={(e) => handleFieldMouseDown(e, field)}
                        style={{
                          left: `${field.x}%`,
                          top: `${field.y}%`,
                          width: `${field.width}%`,
                          height: `${field.height}%`,
                        }}
                      >
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
                    
                    {/* Click Catcher for dropping new fields */}
                    <div 
                      className={`absolute inset-0 z-10 touch-none ${activeTool !== 'select' ? 'cursor-crosshair' : ''}`}
                      onClick={(e) => handlePdfClick(e, index + 1)} 
                    ></div>
                  </div>
                ))}
              </Document>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center mt-20">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg mb-6">
                <FileText className="w-10 h-10 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Upload Carrier Contract</h2>
              <p className="text-gray-500 max-w-md mb-8">Upload a PDF contract from Protective Life, Mutual of Omaha, or any other carrier to build the auto-fill mapping.</p>
              
              <input 
                type="file" 
                id="direct-pdf-upload" 
                accept="application/pdf" 
                className="hidden" 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      const data = e.target?.result as string;
                      setPdfData(data);
                      if (carrierId) {
                        DB.save('pdf_cache', { id: carrierId, data, timestamp: Date.now() }).catch(console.error);
                      }
                    };
                    reader.readAsDataURL(file);
                  }
                }} 
              />
              <button 
                onClick={() => document.getElementById('direct-pdf-upload')?.click()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium shadow-md hover:bg-blue-700 transition transform hover:-translate-y-1"
              >
                Select PDF File
              </button>
            </div>
          )}
        </div>

              </div>
    </div>
  );
}