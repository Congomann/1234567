import React, { useState, useEffect, useRef } from 'react';
import { PenTool, Edit2, CheckCircle, FileText, Search, Info, MousePointer2, Maximize, Minimize, Check, XSquare } from 'lucide-react';
import { DB } from '../../services/database';
import { useData } from '../../context/DataContext';
import { Document, Page, pdfjs } from 'react-pdf';
import { Backend } from '../../services/apiBackend';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;


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
        className={`absolute inset-0 z-30 ${isPenActive ? 'cursor-crosshair touch-none' : 'pointer-events-none'}`}
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

export default function ContractingHub() {
  const { user } = useData();
  const [packages, setPackages] = useState<any[]>([]);
  const [myContracts, setMyContracts] = useState<any[]>([]);
  
  const [activeApplication, setActiveApplication] = useState<any | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPenActive, setIsPenActive] = useState(false);
  
  const [pdfData, setPdfData] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pdfWidth, setPdfWidth] = useState(typeof window !== 'undefined' ? Math.min(window.innerWidth - 48, 800) : 800);

  useEffect(() => {
    const handleResize = () => setPdfWidth(Math.min(window.innerWidth - 48, 800));
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const [fields, setFields] = useState<any[]>([]);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [sigModalOpen, setSigModalOpen] = useState(false);
  const [sigTargetField, setSigTargetField] = useState<any>(null);
  const [saveStatus, setSaveStatus] = useState<string>('Saved');

  useEffect(() => {
    if (!activeApplication) {
      loadData();
    }
  }, [activeApplication]);

  const loadData = async () => {
    const pkgs = await Backend.getCarrierPackages();
    const subs = await Backend.getAutosavedSubmissions();
    setPackages(pkgs || []);
    setMyContracts(subs || []);
  };

  // Autosave hook
  useEffect(() => {
    if (!activeApplication || !activeApplication.submissionId || Object.keys(formValues).length === 0) return;
    
    setSaveStatus('Saving...');
    const timer = setTimeout(async () => {
      try {
        await Backend.autosaveSubmission({
          id: activeApplication.submissionId,
          package_id: activeApplication.id,
          carrier_name: activeApplication.carrier_name,
          package_name: activeApplication.package_name,
          user_id: user?.id,
          status: 'In Progress',
          progress: Math.round((Object.keys(formValues).filter(k => formValues[k]).length / (fields.length || 1)) * 100),
          data: formValues,
          updated_at: new Date().toISOString()
        });
        setSaveStatus('Saved');
      } catch (e) {
        setSaveStatus('Error saving');
      }
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [formValues]);

  const handleStart = async (pkg: any) => {
    // 1. Create a new "In Progress" submission
    const newSub = await Backend.autosaveSubmission({
      id: `sub_${Date.now()}`,
      package_id: pkg.id,
      carrier_name: pkg.carrier_name,
      package_name: pkg.package_name,
      user_id: user?.id,
      status: 'In Progress',
      progress: 0,
      data: {},
      updated_at: new Date().toISOString()
    });
    
    await openApplication(pkg, newSub, false);
  };

  const handleContinue = async (sub: any) => {
    // Find the package for this submission
    const pkg = packages.find(p => p.id === sub.package_id) || {
      id: sub.package_id,
      carrier_name: sub.carrier_name,
      package_name: sub.package_name,
      version: 'Unknown'
    };
    await openApplication(pkg, sub, true);
  };

  const openApplication = async (pkg: any, sub: any, isResuming: boolean) => {
    setActiveApplication({ ...pkg, submissionId: sub.id });
    
    // Load PDF
    const pdfId = `${pkg.carrier_name}-${pkg.version}`;
    const caches = (await DB.getAll('pdf_cache') || []) as any[];
    const cached = caches.find((c: any) => c.id === pdfId) || caches.find((c: any) => c.id === pkg.carrier_name);
    if (cached && cached.data) {
      setPdfData(cached.data);
    } else {
      setPdfData(null);
    }
    
    // Load Fields mapped by admin
    const adminFields = (await DB.getAll('carrier_fields') || []) as any[];
    const schema = adminFields.find((f: any) => f.id === pdfId) || adminFields.find((f: any) => f.id === pkg.carrier_name);
    
    if (schema && schema.extracted_schema) {
      setFields(schema.extracted_schema);
      
      if (isResuming && sub.data) {
        setFormValues(sub.data);
      } else {
        // Auto-fill mapped values if starting fresh
        const initialValues: Record<string, string> = {};
        schema.extracted_schema.forEach((f: any) => {
          if (f.mappedTo && f.mappedTo !== 'none' && user) {
            if (f.mappedTo === 'firstName') initialValues[f.id] = user.name?.split(' ')[0] || '';
            if (f.mappedTo === 'lastName') initialValues[f.id] = user.name?.split(' ').slice(1).join(' ') || '';
            if (f.mappedTo === 'fullName') initialValues[f.id] = user.name || '';
            if (f.mappedTo === 'email') initialValues[f.id] = user.email || '';
            if (f.mappedTo === 'phone') initialValues[f.id] = user.phone || '';
            if (f.mappedTo === 'npn') initialValues[f.id] = (user as any).npn || '';
          }
        });
        setFormValues(initialValues);
      }
    } else {
      setFields([]);
      setFormValues({});
    }
  };

  const submitContract = async () => {
    setIsSubmitting(true);
    try {
      // 1. Save final status
      await Backend.autosaveSubmission({
        id: activeApplication.submissionId,
        package_id: activeApplication.id,
        carrier_name: activeApplication.carrier_name,
        package_name: activeApplication.package_name,
        user_id: user?.id,
        status: 'Submitted',
        progress: 100,
        data: formValues,
        updated_at: new Date().toISOString()
      });
      
      // 2. Generate PDF and email to carrier
      await Backend.signAndSubmitContract({
        carrier_name: activeApplication.carrier_name,
        formValues: formValues,
        fields: fields,
        pdfData: pdfData
      });
      
      alert('Contract Generated & Submitted! The completed PDF has been automatically emailed to sales@newhollandfinancial.com and the Carrier Contracting Department.');
      setActiveApplication(null);
    } catch (e) {
      alert('Failed to generate and submit contract.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (activeApplication) {
    return (
      <div className={isFullscreen ? "fixed inset-0 z-50 bg-gray-100 flex flex-col" : "h-full flex flex-col bg-gray-100"}>
        <div className="bg-white border-b px-6 py-4 flex justify-between items-center shrink-0 shadow-sm z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{activeApplication.carrier_name}</h2>
            <p className="text-sm text-gray-500">{activeApplication.package_name} • {saveStatus}</p>
          </div>
          <div className="flex items-center space-x-3">
            
            <button 
              onClick={() => setIsPenActive(!isPenActive)} 
              className={`px-3 py-2 flex items-center rounded-md transition font-medium ${isPenActive ? 'bg-blue-100 text-blue-700 shadow-inner' : 'text-gray-600 hover:bg-gray-100'}`}
              title="Draw Pen for Yes/No Checkmarks"
            >
              <PenTool className="w-5 h-5 mr-2" />
              {isPenActive ? 'Pen Active' : 'Draw Pen'}
            </button>
            <button onClick={() => setIsFullscreen(!isFullscreen)} className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition" title="Toggle Fullscreen">

              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
            <button onClick={() => { setActiveApplication(null); setIsFullscreen(false); }} className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition">
              Cancel & Back
            </button>
            <button onClick={submitContract} disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition shadow flex items-center">
              {isSubmitting ? 'Submitting...' : 'Submit to Carrier'}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6 flex justify-center">
          {pdfData ? (
            <div className="bg-white shadow-xl relative w-[800px]">
              <Document
                file={pdfData}
                onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                loading={<div className="p-8 text-center text-gray-500">Loading document...</div>}
              >
                {Array.from(new Array(numPages || 1), (el, index) => (
                  <div key={`page_${index + 1}`} className="relative mb-6 shadow-md bg-white border border-gray-200">
                    <Page pageNumber={index + 1} renderTextLayer={false} renderAnnotationLayer={false} width={pdfWidth} />
                    
                    
                    <DrawingCanvas 
                      pageIndex={index + 1} 
                      initialData={formValues[`draw_page_${index + 1}`]} 
                      onSave={(data) => setFormValues({...formValues, [`draw_page_${index + 1}`]: data})} 
                      isPenActive={isPenActive} 
                    />
                    
                    {fields.filter(f => f.pageNumber === (index + 1)).map(field => (
                      <div 
                        key={field.id}
                        className="absolute group"
                        style={{
                          left: `${field.x}%`,
                          top: `${field.y}%`,
                          width: `${field.width}%`,
                          height: `${field.height}%`,
                        }}
                      >
                        
                      {(() => {
                        const isRequired = field.required;
                        const isEmpty = !formValues[field.id] || formValues[field.id].trim() === '';
                        const borderClass = isRequired && isEmpty ? 'border-red-500 bg-red-100/30 hover:bg-red-100/50' : 'border-blue-400 bg-blue-100/40 hover:bg-blue-100/60';
                        
                        if (field.role === 'admin') {
                           return (
                             <div className="w-full h-full absolute inset-0 z-40 flex items-center bg-gray-200/50 border border-gray-400/50 rounded-sm cursor-not-allowed px-1 overflow-hidden" title="Admin only field">
                               <span className="text-[10px] text-gray-500 truncate">{field.name || 'Admin Use'}</span>
                             </div>
                           );
                        }
                        
                        if (field.type === 'checkbox' || field.type === 'radio') {
                          return (
                            <div 
                              className={`w-full h-full absolute inset-0 z-40 flex items-center justify-center cursor-pointer border ${borderClass} focus-within:ring-2 focus-within:ring-blue-600 rounded-sm transition-all`}
                              onClick={() => setFormValues({...formValues, [field.id]: formValues[field.id] === 'true' ? 'false' : 'true'})}
                            >
                              {formValues[field.id] === 'true' && <Check className="w-4 h-4 text-blue-700" />}
                              {isRequired && isEmpty && <span className="absolute -top-1 -right-1 text-red-500 text-xs font-bold">*</span>}
                            </div>
                          );
                        }
                        if (field.type === 'signature' || field.type === 'initials') {
                          return (
                            <div 
                              className={`w-full h-full absolute inset-0 z-40 flex items-center justify-center cursor-pointer border ${borderClass} focus-within:ring-2 focus-within:ring-blue-600 rounded-sm transition-all`}
                              onClick={() => {
                                setSigTargetField(field);
                                setSigModalOpen(true);
                              }}
                            >
                              {formValues[field.id] ? (
                                String(formValues[field.id]).startsWith('data:image/png') ? (
                                  <img src={formValues[field.id]} alt="Signature" className="max-h-full max-w-full object-contain mix-blend-multiply opacity-80 pointer-events-none" />
                                ) : (
                                  <span className="font-['Brush_Script_MT',cursive] text-lg text-blue-900">{formValues[field.id]}</span>
                                )
                              ) : (
                                <span className="text-[10px] uppercase text-gray-500 font-semibold tracking-wider flex items-center gap-1">
                                  <Edit2 className="w-3 h-3" /> Sign Here
                                </span>
                              )}
                              {isRequired && isEmpty && <span className="absolute -top-1 -right-1 text-red-500 text-xs font-bold">*</span>}
                            </div>
                          );
                        }
                        if (field.type === 'date') {
                          return (
                            <input
                              type="date"
                              value={formValues[field.id] || ''}
                              onChange={(e) => setFormValues({...formValues, [field.id]: e.target.value})}
                              className={`w-full h-full ${borderClass} focus:bg-yellow-50 focus:border-blue-600 focus:ring-2 focus:ring-blue-600 text-sm font-medium text-gray-900 px-1 absolute inset-0 z-40 outline-none transition-all shadow-sm rounded-sm`}
                            />
                          );
                        }
                        return (
                          <div className="w-full h-full absolute inset-0 z-40">
                            <input
                              type="text"
                              placeholder={field.name}
                              value={formValues[field.id] || ''}
                              onChange={(e) => setFormValues({...formValues, [field.id]: e.target.value})}
                              className={`w-full h-full ${borderClass} focus:bg-yellow-50 focus:border-blue-600 focus:ring-2 focus:ring-blue-600 text-sm font-medium text-gray-900 px-1 absolute inset-0 outline-none transition-all shadow-sm rounded-sm`}
                            />
                            {isRequired && isEmpty && <span className="absolute -top-1 -right-1 text-red-500 text-xs font-bold pointer-events-none">*</span>}
                          </div>
                        );
                      })()}
                      </div>
                    ))}
                  </div>
                ))}
              </Document>
            </div>
          ) : (
            <div className="mt-20 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Document Unavailable</h3>
              <p className="text-gray-500">The underlying PDF was not found.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Determine available vs started
  const startedIds = new Set(myContracts.map(c => c.package_id));
  const availablePackages = packages.filter(p => !startedIds.has(p.id) && p.availability === 'Available');

  return (
    <div className="p-4 md:p-6 w-full max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">CONTRACTING</h1>
        <p className="text-gray-500 mt-1">Complete carrier contracting at your convenience.</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900">AVAILABLE</h2>
          <p className="text-sm text-gray-500">Contracts you haven't completed.</p>
        </div>
        <ul className="divide-y divide-gray-200">
          {availablePackages.length === 0 ? (
            <li className="p-6 text-gray-500 text-center">No new contracts available.</li>
          ) : (
            availablePackages.map(pkg => (
              <li key={pkg.id} className="p-6 flex items-center justify-between hover:bg-gray-50">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{pkg.carrier_name}</h3>
                  <p className="text-sm text-gray-500">{pkg.package_name}</p>
                </div>
                <button 
                  onClick={() => handleStart(pkg)}
                  className="px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 shadow-sm"
                >
                  Start
                </button>
              </li>
            ))
          )}
        </ul>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900">MY CONTRACTING</h2>
          <p className="text-sm text-gray-500">Everything you've started or completed.</p>
        </div>
        <ul className="divide-y divide-gray-200">
          {myContracts.length === 0 ? (
            <li className="p-6 text-gray-500 text-center">You have not started any contracts yet.</li>
          ) : (
            myContracts.map(sub => (
              <li key={sub.id} className="p-6 flex items-center justify-between hover:bg-gray-50">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{sub.carrier_name}</h3>
                  <p className="text-sm text-gray-500">{sub.package_name}</p>
                  <p className="text-xs mt-1 font-medium flex items-center">
                    {sub.status === 'In Progress' ? (
                      <><span className="w-2 h-2 rounded-full bg-yellow-400 mr-2"></span>In Progress ({sub.progress}%)</>
                    ) : sub.status === 'Submitted' ? (
                      <><span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>Submitted</>
                    ) : (
                      <><span className="w-2 h-2 rounded-full bg-gray-400 mr-2"></span>{sub.status}</>
                    )}
                  </p>
                </div>
                {sub.status === 'In Progress' ? (
                  <button 
                    onClick={() => handleContinue(sub)}
                    className="px-4 py-2 bg-white text-blue-600 border border-blue-600 rounded font-medium hover:bg-blue-50 shadow-sm"
                  >
                    Continue
                  </button>
                ) : (
                  <button className="px-4 py-2 bg-gray-100 text-gray-600 border border-gray-200 rounded font-medium hover:bg-gray-200 shadow-sm">
                    View
                  </button>
                )}
              </li>
            ))
          )}
        </ul>
      </div>

      <SignatureModal 
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
}
