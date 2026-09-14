import React, { useState, useEffect, useRef } from 'react';
import { FileText, SlidersHorizontal, Check, Scan, Loader2, MousePointer2, Trash2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { DB } from '../../services/database';
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function CarrierFormBuilder() {
  const [fields, setFields] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pdfData, setPdfData] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  
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

  const handlePdfClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Create a new field at this coordinate
    const newField = {
      id: 'field_' + Date.now(),
      name: 'New Field',
      type: 'text',
      x: (x / rect.width) * 100, // store as percentage
      y: (y / rect.height) * 100,
      width: 20, // default 20% width
      height: 3, // default 3% height
      pageNumber: pageNumber
    };
    
    setFields([...fields, newField]);
  };

  const handleSave = async () => {
    try {
      await fetch('/api/carriers/forms/' + encodeURIComponent(formId), {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('nhfg_access_token') 
        },
        body: JSON.stringify({ extracted_schema: fields })
      });
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

      <div className="flex gap-6 h-[80vh]">
        {/* PDF Viewer (Interactive) */}
        <div className="w-2/3 bg-gray-200 rounded-lg flex flex-col border border-gray-300 shadow-inner overflow-hidden relative">
          <div className="p-3 bg-gray-100 border-b border-gray-300 font-medium text-sm flex justify-between items-center shrink-0">
            <span className="flex items-center"><MousePointer2 className="w-5 h-5 mr-2 text-gray-600" /> Interactive Canvas (Page {pageNumber} of {numPages || 1})</span>
            <div className="flex space-x-2">
              <button disabled={pageNumber <= 1} onClick={() => setPageNumber(p => p - 1)} className="px-2 py-1 bg-white border rounded text-xs disabled:opacity-50">Prev</button>
              <button disabled={pageNumber >= (numPages || 1)} onClick={() => setPageNumber(p => p + 1)} className="px-2 py-1 bg-white border rounded text-xs disabled:opacity-50">Next</button>
            </div>
          </div>
          
          <div className="flex-1 overflow-auto bg-gray-600 flex justify-center p-4">
            {pdfData ? (
              <div 
                className="relative bg-white shadow-xl cursor-crosshair inline-block" 
                ref={containerRef}
              >
                <Document file={pdfData} onLoadSuccess={onDocumentLoadSuccess} renderMode="canvas">
                  <Page pageNumber={pageNumber} renderTextLayer={false} renderAnnotationLayer={false} width={800} />
                </Document>
                
                {/* Overlay Fields */}
                {fields.filter(f => f.pageNumber === pageNumber).map(field => (
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
                
                {/* Click Catcher */}
                <div className="absolute inset-0 z-10" onClick={handlePdfClick}></div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center space-y-4">
                <FileText className="w-20 h-20 text-gray-300" />
                <p className="text-lg font-medium text-gray-400">Document Reference Not Available</p>
                <p className="text-sm">Please upload the PDF in the Carrier Wizard first.</p>
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
                <p>Click anywhere on the PDF to create a fillable text box.</p>
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
