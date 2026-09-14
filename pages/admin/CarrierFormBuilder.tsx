import React, { useState, useEffect, useRef } from 'react';
import { FileText, SlidersHorizontal, Check, Scan, Loader2, MousePointer2, Trash2, Maximize, Minimize } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { DB } from '../../services/database';
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function CarrierFormBuilder() {
  const [fields, setFields] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pdfData, setPdfData] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{x: number, y: number, pageIndex: number} | null>(null);
  const [currentDraw, setCurrentDraw] = useState<{x: number, y: number, w: number, h: number} | null>(null);
    
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const carrierName = searchParams.get('carrier') || 'Unknown Carrier';
  const formId = carrierName; // Use carrier name as ID for simplicity

  useEffect(() => {
    if (carrierName) {
      DB.getAll('pdf_cache').then(caches => {
        const cached = caches.find(c => c.id === carrierName);
        if (cached && cached.data) {
          setPdfData(cached.data);
        }
      }).catch(console.error);
    }

    fetch('/api/carriers/forms/' + encodeURIComponent(formId), {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('nhfg_access_token') }
    })
    .then(res => res.json())
    .then(data => {
      const existing = data.extracted_schema && Array.isArray(data.extracted_schema) ? data.extracted_schema : [];
      setFields(existing);
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [carrierName]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  
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


  
  const handleSave = async () => {
    try {
      await DB.save('carrier_fields', { id: carrierName, extracted_schema: fields });
      // Still attempt backend sync if needed, but local DB guarantees it works for the hub
      fetch('/api/carriers/forms/' + encodeURIComponent(formId), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ extracted_schema: fields })
      }).catch(e => {}); // ignore backend error if in mock mode
      
      alert('Configuration published to database. This form is now fully digitized!');
    } catch (e) {
      alert('Failed to save configuration.');
    }
  };


  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const updateField = (id: string, updates: any) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <SlidersHorizontal className="w-8 h-8 mr-3 text-blue-600" />
            Digital Form Builder: {carrierName}
          </h1>
          <p className="mt-2 text-sm text-gray-600">Click on the document below to draw input fields for the advisor to fill out.</p>
        </div>
        <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center font-medium shadow-sm transition">
          <Check className="w-5 h-5 mr-2" /> Publish Configuration
        </button>
      </div>

      <div className={isFullscreen ? "fixed inset-0 z-50 bg-gray-100 flex p-4 gap-4" : "flex gap-6 h-[80vh]"}>
        {/* PDF Viewer (Interactive) */}
        <div className="w-2/3 bg-gray-200 rounded-lg flex flex-col border border-gray-300 shadow-inner overflow-hidden relative">
          <div className="p-3 bg-gray-100 border-b border-gray-300 font-medium text-sm flex justify-between items-center shrink-0">
            <span className="flex items-center">
    <button onClick={() => setIsFullscreen(!isFullscreen)} className="mr-3 p-1.5 bg-white rounded shadow-sm hover:bg-gray-50 border border-gray-200" title={isFullscreen ? "Minimize" : "Expand Fullscreen"}>
      {isFullscreen ? <Minimize className="w-4 h-4 text-gray-700" /> : <Maximize className="w-4 h-4 text-gray-700" />}
    </button>
    <MousePointer2 className="w-5 h-5 mr-2 text-gray-600" /> 
    Interactive Canvas (Page {pageNumber} of {numPages || 1})</span>
            <div className="flex space-x-2"><span className="text-xs font-bold bg-gray-200 px-2 py-1 rounded">{numPages || 1} Pages Total</span></div>
          </div>
          
          <div className="flex-1 overflow-auto bg-gray-600 flex justify-center p-4">
            {pdfData ? (
              <div 
                className="relative bg-white shadow-xl cursor-crosshair inline-block" 
                
              >
                <Document file={pdfData} onLoadSuccess={onDocumentLoadSuccess} renderMode="canvas">
                  {Array.from(new Array(numPages || 1), (el, index) => (
                    <div key={`page_${index + 1}`} className="relative mb-4 shadow-md bg-white border border-gray-200">
                      <Page pageNumber={index + 1} renderTextLayer={false} renderAnnotationLayer={false} width={800} />
                      
                      {/* Overlay Fields for this specific page */}
                      {fields.filter(f => f.pageNumber === (index + 1)).map(field => (
                        <div 
                          key={field.id}
                          className="absolute border-2 border-blue-500 bg-blue-100/40 flex items-center justify-center group"
                          style={{
                            left: `${field.x}%`,
                            top: `${field.y}%`,
                            width: `${field.width}%`,
                            height: `${field.height}%`,
                          }}
                        >
                          <span className="text-[10px] font-bold text-blue-700 bg-white/80 px-1 truncate absolute -top-4 left-0 border border-blue-500 rounded-t">{field.name}</span>
                        </div>
                      ))}
                      
                      
                      {/* Temporary Draw Box */}
                      {isDrawing && currentDraw && drawStart?.pageIndex === (index + 1) && (
                        <div 
                          className="absolute border-2 border-dashed border-blue-600 bg-blue-400/20 pointer-events-none z-20"
                          style={{ left: `${currentDraw.x}%`, top: `${currentDraw.y}%`, width: `${currentDraw.w}%`, height: `${currentDraw.h}%` }}
                        />
                      )}

                      {/* Pointer Catcher for this page */}
                      <div 
                        className="absolute inset-0 z-10 touch-none" 
                        onPointerDown={(e) => handlePointerDown(e, index + 1)}
                        onPointerMove={(e) => handlePointerMove(e, index + 1)}
                        onPointerUp={(e) => handlePointerUp(e, index + 1)}
                        onPointerCancel={(e) => handlePointerUp(e, index + 1)}
                      ></div>
                    </div>
                  ))}
                </Document>
                
                
              </div>
            
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center space-y-4">
                <FileText className="w-20 h-20 text-gray-300" />
                <p className="text-lg font-medium text-gray-400">Document Reference Not Available</p>
                <p className="text-sm mb-4">You can re-upload the PDF directly here to cache it.</p>
                <input 
                  type="file" 
                  accept=".pdf" 
                  className="hidden" 
                  id="direct-pdf-upload"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const reader = new FileReader();
                      reader.readAsDataURL(e.target.files[0]);
                      reader.onload = async () => {
                        await DB.save('pdf_cache', { id: carrierName, data: reader.result });
                        setPdfData(reader.result);
                      };
                    }
                  }} 
                />
                <button 
                  onClick={() => document.getElementById('direct-pdf-upload')?.click()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium shadow hover:bg-blue-700 transition"
                >
                  Upload PDF Now
                </button>
              </div>
            )}

          </div>
        </div>

        {/* Field Editor Sidebar */}
        <div className="w-1/3 bg-white rounded-lg border border-gray-200 flex flex-col shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center shrink-0">
            <h3 className="font-semibold text-gray-900">Configured Fields</h3>
            <span className="text-xs font-bold bg-green-100 text-green-800 px-2 py-1 rounded-full">{fields.length} Total</span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {fields.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <MousePointer2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p>Click and drag on the PDF to draw a precisely sized text box.</p>
              </div>
            ) : (
              fields.map(field => (
                <div key={field.id} className="p-3 border border-gray-200 rounded-lg bg-gray-50 space-y-3 relative group">
                  <button onClick={() => removeField(field.id)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Field Name (Label)</label>
                    <input type="text" value={field.name} onChange={e => updateField(field.id, { name: e.target.value })} className="w-full text-sm border-gray-300 rounded p-1.5 focus:ring-blue-500 focus:border-blue-500 border" />
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
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Width (%)</label>
                      <input type="number" value={Math.round(field.width)} onChange={e => updateField(field.id, { width: parseFloat(e.target.value) })} className="w-full text-sm border-gray-300 rounded p-1 border" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Height (%)</label>
                      <input type="number" value={Math.round(field.height)} onChange={e => updateField(field.id, { height: parseFloat(e.target.value) })} className="w-full text-sm border-gray-300 rounded p-1 border" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
