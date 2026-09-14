import React, { useState, useEffect } from 'react';
import { FileText, SlidersHorizontal, Check, Scan, Loader2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { DB } from '../../services/database';

export default function CarrierFormBuilder() {
  const [fields, setFields] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [pdfData, setPdfData] = useState<string | null>(null);
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const carrierName = searchParams.get('carrier') || 'Unknown Carrier';
  
  // Hardcode ID 1 for now since we don't have routing params configured yet
  const formId = 1; 

  useEffect(() => {
    // 1. Fetch PDF from local cache if available
    if (carrierName) {
      DB.getAll('pdf_cache').then(caches => {
        const cached = caches.find(c => c.id === carrierName);
        if (cached && cached.data) {
          setPdfData(cached.data);
        }
      }).catch(console.error);
    }

    // 2. Fetch existing fields
    fetch('/api/carriers/forms/' + formId, {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('nhfg_access_token') }
    })
    .then(res => res.json())
    .then(data => {
      const existing = data.extracted_schema && Array.isArray(data.extracted_schema) ? data.extracted_schema : [];
      if (existing.length > 0) {
        setFields(existing);
        setLoading(false);
      } else {
        // Trigger AI Scanning Simulation
        simulateAIScan();
      }
    })
    .catch(err => {
      console.error(err);
      simulateAIScan();
    });
  }, [carrierName]);

  const simulateAIScan = () => {
    setLoading(false);
    setIsScanning(true);
    
    // Simulate 3 seconds of AI parsing
    setTimeout(() => {
      const mockExtracted = [
        { id: 'f1', name: 'Agent/Agency Name', type: 'text', mappedTo: 'Advisor.firstName', required: true },
        { id: 'f2', name: 'National Producer Number (NPN)', type: 'text', mappedTo: 'Advisor.npn', required: true },
        { id: 'f3', name: 'Agency Tax ID (EIN)', type: 'text', mappedTo: 'Company.ein', required: false },
        { id: 'f4', name: 'Direct Deposit Routing Number', type: 'text', mappedTo: '', required: true },
        { id: 'f5', name: 'Agent Signature', type: 'signature', mappedTo: 'Advisor.signature', required: true },
        { id: 'f6', name: 'Principal/Officer Signature', type: 'signature', mappedTo: 'Company.ceoSignature', required: false },
        { id: 'f7', name: 'Date', type: 'date', mappedTo: '', required: true },
      ];
      setFields(mockExtracted);
      setIsScanning(false);
    }, 3500);
  };

  const handleSave = async () => {
    try {
      await fetch('/api/carriers/forms/' + formId, {
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <SlidersHorizontal className="w-8 h-8 mr-3 text-blue-600" />
            Digital Form Builder: {carrierName}
          </h1>
          <p className="mt-2 text-sm text-gray-600">Map AI-extracted fields from the Carrier PDF to system properties.</p>
        </div>
        <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center font-medium shadow-sm transition">
          <Check className="w-5 h-5 mr-2" /> Publish Configuration
        </button>
      </div>

      <div className="flex gap-6 h-[75vh]">
        {/* PDF Viewer Left Side */}
        <div className="w-1/2 bg-gray-200 rounded-lg flex flex-col border border-gray-300 shadow-inner overflow-hidden">
          <div className="p-3 bg-gray-100 border-b border-gray-300 font-medium text-sm flex justify-between items-center">
            <span className="flex items-center"><FileText className="w-5 h-5 mr-2 text-gray-600" /> Original Document Preview</span>
            {isScanning && <span className="flex items-center text-blue-600 text-xs font-bold animate-pulse"><Scan className="w-4 h-4 mr-1" /> AI Vision Active</span>}
          </div>
          <div className="flex-1 flex flex-col relative bg-gray-50">
            {isScanning && (
              <div className="absolute inset-0 bg-blue-900/10 z-10 flex flex-col items-center justify-center backdrop-blur-[1px]">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                <p className="text-blue-800 font-semibold shadow-sm">Running Antigravity OCR Engine...</p>
                <div className="w-64 h-2 bg-gray-200 rounded-full mt-4 overflow-hidden">
                   <div className="h-full bg-blue-600 animate-[pulse_1.5s_ease-in-out_infinite]" style={{ width: '60%' }}></div>
                </div>
              </div>
            )}
            {pdfData ? (
              <iframe src={pdfData} className="w-full h-full" title="Carrier Document" />
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400 p-8 text-center">
                <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p>PDF Document Preview Not Available.<br/>Please re-upload in the Carrier Wizard to cache it locally.</p>
              </div>
            )}
          </div>
        </div>

        {/* Field Editor Right Side */}
        <div className="w-1/2 bg-white rounded-lg border border-gray-300 flex flex-col shadow-sm">
          <div className="p-3 bg-gray-50 border-b border-gray-300 font-medium text-sm flex justify-between items-center">
            <span>AI Extracted Fields</span>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">{fields.length} Detected</span>
          </div>
          <div className="p-4 flex-1 overflow-y-auto space-y-4 bg-gray-50">
            {isScanning ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500 text-sm animate-pulse">Extracting fillable fields and signatures...</p>
              </div>
            ) : fields.length === 0 ? (
              <p className="text-gray-500 text-sm text-center mt-10">No fields extracted.</p>
            ) : fields.map(field => (
              <div key={field.id} className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-blue-300 transition group relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 opacity-0 group-hover:opacity-100 transition"></div>
                <div className="flex justify-between items-center mb-3">
                  <span className="font-semibold text-gray-900">{field.name}</span>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded-md text-gray-600 uppercase border border-gray-200">{field.type}</span>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Map To CRM Field</label>
                  <select 
                    className="w-full border-gray-300 rounded-md text-sm shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition"
                    value={field.mappedTo || ''}
                    onChange={(e) => {
                      const newFields = [...fields];
                      const idx = newFields.findIndex(f => f.id === field.id);
                      if (idx > -1) newFields[idx].mappedTo = e.target.value;
                      setFields(newFields);
                    }}
                  >
                    <option value="">-- Require Manual Entry by Advisor --</option>
                    <optgroup label="Advisor Data">
                      <option value="Advisor.firstName">Advisor First Name</option>
                      <option value="Advisor.lastName">Advisor Last Name</option>
                      <option value="Advisor.npn">Advisor NPN</option>
                      <option value="Advisor.phone">Advisor Phone</option>
                      <option value="Advisor.email">Advisor Email</option>
                      <option value="Advisor.signature">Advisor Signature</option>
                    </optgroup>
                    <optgroup label="Agency / Company Data">
                      <option value="Company.legalName">Agency Legal Name</option>
                      <option value="Company.ein">Agency EIN</option>
                      <option value="Company.address">Agency Address</option>
                      <option value="Company.ceoSignature">CEO Signature (Requires Auth)</option>
                    </optgroup>
                  </select>
                </div>
                <div className="mt-3 flex items-center bg-gray-50 p-2 rounded border border-gray-100">
                  <input type="checkbox" defaultChecked={field.required} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4" />
                  <span className="ml-2 text-xs font-medium text-gray-600">Mark as Required Field</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
