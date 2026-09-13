import React, { useState } from 'react';
import { DocumentTextIcon, AdjustmentsHorizontalIcon, CheckIcon } from '@heroicons/react/24/outline';

import { useEffect } from 'react';

export default function CarrierFormBuilder() {
  const [fields, setFields] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Hardcode ID 1 for now since we don't have routing params configured yet
  const formId = 1; 

  useEffect(() => {
    fetch('/api/carriers/forms/' + formId, {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('nhfg_access_token') }
    })
    .then(res => res.json())
    .then(data => {
      setFields(data.extracted_schema && Array.isArray(data.extracted_schema) ? data.extracted_schema : []);
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

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
      alert('Configuration published to database.');
    } catch (e) {
      alert('Failed to save.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <AdjustmentsHorizontalIcon className="w-8 h-8 mr-3 text-primary-600" />
            Digital Form Builder
          </h1>
          <p className="mt-2 text-sm text-gray-600">Map AI-extracted fields from the Carrier PDF to system properties.</p>
        </div>
        <button onClick={handleSave} className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center font-medium">
          <CheckIcon className="w-5 h-5 mr-2" /> Publish Configuration
        </button>
      </div>

      <div className="flex gap-6 h-[70vh]">
        {/* Mock PDF Viewer Left Side */}
        <div className="w-1/2 bg-gray-200 rounded-lg flex flex-col border border-gray-300">
          <div className="p-3 bg-gray-100 border-b border-gray-300 font-medium text-sm flex items-center">
            <DocumentTextIcon className="w-5 h-5 mr-2" /> Original Carrier PDF
          </div>
          <div className="flex-1 flex items-center justify-center text-gray-400">
            [PDF Document Preview]
          </div>
        </div>

        {/* Field Editor Right Side */}
        <div className="w-1/2 bg-white rounded-lg border border-gray-300 flex flex-col">
          <div className="p-3 bg-gray-50 border-b border-gray-300 font-medium text-sm">
            AI Extracted Fields
          </div>
          <div className="p-4 flex-1 overflow-y-auto space-y-4">
            {loading ? <p className="text-gray-500 text-sm">Loading...</p> : fields.length === 0 ? <p className="text-gray-500 text-sm">No fields extracted yet.</p> : fields.map(field => (
              <div key={field.id} className="p-4 border border-gray-200 rounded-md shadow-sm hover:border-primary-300 transition">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-gray-900">{field.name}</span>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 uppercase">{field.type}</span>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Map To Data Source</label>
                  <select 
                    className="w-full border-gray-300 rounded-md text-sm shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    value={field.mappedTo || ''}
                    onChange={(e) => {
                      const newFields = [...fields];
                      const idx = newFields.findIndex(f => f.id === field.id);
                      if (idx > -1) newFields[idx].mappedTo = e.target.value;
                      setFields(newFields);
                    }}
                  >
                    <option value="">-- Manual Entry Required by Advisor --</option>
                    <optgroup label="Advisor Data">
                      <option value="Advisor.firstName">Advisor First Name</option>
                      <option value="Advisor.lastName">Advisor Last Name</option>
                      <option value="Advisor.npn">Advisor NPN</option>
                      <option value="Advisor.signature">Advisor Signature</option>
                    </optgroup>
                    <optgroup label="Company / CEO Data">
                      <option value="Company.legalName">Agency Legal Name</option>
                      <option value="Company.ein">Agency EIN</option>
                      <option value="Company.ceoSignature">CEO Signature (Requires Auth)</option>
                    </optgroup>
                  </select>
                </div>
                <div className="mt-3 flex items-center">
                  <input type="checkbox" defaultChecked={field.required} className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 h-4 w-4" />
                  <span className="ml-2 text-sm text-gray-600">Required Field</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
