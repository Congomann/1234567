import React, { useState, useEffect, useRef } from 'react';
import { PenTool, CheckCircle, FileText, Share2, Printer, Search, Info, MousePointer2 } from 'lucide-react';
import { DB } from '../../services/database';
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function ContractingHub() {
  const [activeApplication, setActiveApplication] = useState<any | null>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // PDF state
  const [pdfData, setPdfData] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [fields, setFields] = useState<any[]>([]);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/contracting/applications', {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('nhfg_access_token') }
    })
    .then(res => res.json())
    .then(data => setApplications(Array.isArray(data) ? data : []))
    .catch(console.error);

    fetch('/api/contracting/submissions', {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('nhfg_access_token') }
    })
    .then(res => res.json())
    .then(data => setSubmissions(Array.isArray(data) ? data : []))
    .catch(console.error);
  }, []);

  const openApplication = async (app: any) => {
    setActiveApplication(app);
    setPageNumber(1);
    setFormValues({});
    
    // Load the PDF data
    try {
      const caches = await DB.getAll('pdf_cache');
      const cached = caches.find(c => c.id === app.carrier_name);
      if (cached && cached.data) {
        setPdfData(cached.data);
      } else {
        setPdfData(null);
      }
      
      // Load the field mapping
      const res = await fetch('/api/carriers/forms/' + encodeURIComponent(app.carrier_name), {
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('nhfg_access_token') }
      });
      const data = await res.json();
      if (data.extracted_schema) {
        setFields(data.extracted_schema);
      } else {
        setFields([]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const handleFieldChange = (id: string, value: string) => {
    setFormValues(prev => ({ ...prev, [id]: value }));
  };

  const submitContract = async () => {
    if (!activeApplication || !pdfData) return;
    setIsSubmitting(true);
    
    try {
      // We will send the field values to the backend to generate a signed PDF and email the carrier
      const response = await fetch('/api/contracting/sign-and-submit', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('nhfg_access_token')
        },
        body: JSON.stringify({
          carrier_name: activeApplication.carrier_name,
          formValues,
          fields,
          pdfData
        })
      });

      if (!response.ok) throw new Error('Failed to submit contract');
      
      alert('Contract Submitted Successfully! Copies sent to contracting department and New Holland sales team.');
      setActiveApplication(null);
      // Refresh submissions
      const subRes = await fetch('/api/contracting/submissions', {
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('nhfg_access_token') }
      });
      const subData = await subRes.json();
      setSubmissions(Array.isArray(subData) ? subData : []);
    } catch (e) {
      console.error(e);
      alert('Error submitting contract.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (activeApplication) {
    return (
      <div className="h-full flex flex-col bg-gray-100">
        <div className="bg-white border-b border-gray-200 p-4 flex justify-between items-center shadow-sm shrink-0">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{activeApplication.carrier_name} - {activeApplication.application_type || 'Contract'}</h1>
            <p className="text-sm text-gray-500">Fill in the fields directly on the digital document.</p>
          </div>
          <div className="flex items-center space-x-3">
            <button onClick={() => setActiveApplication(null)} className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition">
              Cancel & Back
            </button>
            <button 
              onClick={submitContract} 
              disabled={isSubmitting}
              className="px-6 py-2 bg-[#0A62A7] text-white rounded-md font-bold shadow-md hover:bg-blue-700 transition flex items-center disabled:opacity-70"
            >
              {isSubmitting ? 'Processing...' : (
                <>
                  <PenTool className="w-4 h-4 mr-2" />
                  Submit to Carrier
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Document Viewer */}
          <div className="flex-1 bg-gray-500 overflow-auto flex flex-col items-center p-8 relative">
            <div className="mb-4 flex space-x-4 shrink-0 bg-white p-2 rounded-full shadow-lg">
               <button disabled={pageNumber <= 1} onClick={() => setPageNumber(p => p - 1)} className="px-4 py-1 text-sm font-bold bg-gray-100 rounded-l-full hover:bg-gray-200 disabled:opacity-50">Prev Page</button>
               <span className="font-bold text-sm px-4 py-1">Page {pageNumber} of {numPages || 1}</span>
               <button disabled={pageNumber >= (numPages || 1)} onClick={() => setPageNumber(p => p + 1)} className="px-4 py-1 text-sm font-bold bg-gray-100 rounded-r-full hover:bg-gray-200 disabled:opacity-50">Next Page</button>
            </div>
            
            {pdfData ? (
              <div className="relative bg-white shadow-2xl inline-block" style={{ minWidth: '800px' }}>
                <Document file={pdfData} onLoadSuccess={onDocumentLoadSuccess} renderMode="canvas">
                  <Page pageNumber={pageNumber} renderTextLayer={false} renderAnnotationLayer={false} width={800} />
                </Document>
                
                {/* Render overlay inputs */}
                {fields.filter(f => f.pageNumber === pageNumber).map(field => (
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
                    <input
                      type="text"
                      placeholder={field.name}
                      value={formValues[field.id] || ''}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      className="w-full h-full bg-blue-50/70 border-b-2 border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm font-medium text-gray-900 px-1 absolute inset-0 z-20 outline-none transition-colors"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 bg-white rounded shadow text-center text-gray-500 w-full max-w-2xl mt-12">
                <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                No PDF preview available. The administrator must upload the digital version of this paperwork first.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Dashboard View (list applications/submissions)
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* ... keeping the dashboard view exactly the same but for brevity I will render a clean version ... */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <FileText className="w-6 h-6 mr-3 text-[#0A62A7]" />
              Available Carrier Contracts
            </h2>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {applications.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No active contracting opportunities assigned to you.</div>
          ) : (
            applications.map(app => (
              <div key={app.id} className="p-6 hover:bg-gray-50 transition-colors flex justify-between items-center group">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{app.carrier_name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{app.application_type || 'New Contract'} • Initiated: {new Date(app.created_at).toLocaleDateString()}</p>
                </div>
                <button onClick={() => openApplication(app)} className="px-5 py-2 bg-white border-2 border-blue-600 text-blue-600 rounded-md font-bold hover:bg-blue-600 hover:text-white transition opacity-0 group-hover:opacity-100">
                  Fill Contract
                </button>
              </div>
            ))
          )}
        </div>
      </div>
      
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-8">
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <h2 className="text-xl font-bold text-gray-900">Your Submitted Contracts</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {submissions.length === 0 ? (
            <div className="p-12 text-center text-gray-500">You haven't submitted any contracting requests yet.</div>
          ) : (
            submissions.map(sub => (
              <div key={sub.id} className="p-6 hover:bg-gray-50 transition-colors flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-900">{sub.carrier_name} - {sub.application_type || 'New Contract'}</h3>
                  <p className="text-sm text-gray-500">Submitted: {new Date(sub.submitted_at).toLocaleDateString()}</p>
                </div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-green-100 text-green-800 border border-green-200">
                  Submitted to Carrier
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
