import React, { useState } from 'react';
import { Building, Plus, FileUp, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Backend } from '../../services/apiBackend';

import { useEffect } from 'react';

export default function ContractingAdmin() {
  const [carriers, setCarriers] = useState<any[]>([]);

  useEffect(() => {
    Backend.getActiveCarriers().then(res => setCarriers(res || [])).catch(console.error);
  }, []);
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [newCarrier, setNewCarrier] = useState({ name: '', code: '', description: '' });
  const navigate = useNavigate();

  const handleNext = () => setWizardStep(prev => prev + 1);
  const handleBack = () => setWizardStep(prev => prev - 1);

  const handleSaveCarrier = async () => {
    try {
      // Create carrier using the existing API structure
      await Backend.addCarrier(newCarrier.name, 'Contracting');
      setShowWizard(false);
      setWizardStep(1);
      const updated = await Backend.getActiveCarriers();
      setCarriers(updated || []);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Building className="w-8 h-8 mr-3 text-primary-600" />
            Carrier Management
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Configure carrier forms, application types, and routing logic.
          </p>
        </div>
        <button 
          onClick={() => setShowWizard(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Carrier
        </button>
      </div>
      
      {/* Carrier List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {carriers.length === 0 ? (
            <li className="px-6 py-12 text-center text-gray-500">
              No carriers configured yet. Click "Add Carrier" to start the configuration wizard.
            </li>
          ) : (
            carriers.map(carrier => (
              <li key={carrier.id}>
                <div className="px-4 py-4 flex items-center sm:px-6 hover:bg-gray-50">
                  <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-primary-600 truncate">{carrier.name}</h3>
                      <p className="text-sm text-gray-500">Code: {carrier.code}</p>
                    </div>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>

      {/* Carrier Setup Wizard Modal */}
      {showWizard && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowWizard(false)} />
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            <div className="inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
              
              {/* Wizard Steps Header */}
              <div className="mb-8 border-b border-gray-200 pb-4">
                <nav className="flex justify-between" aria-label="Progress">
                  <ol className="flex items-center space-x-8 w-full justify-center">
                    <li className={`text-sm font-medium ${wizardStep >= 1 ? 'text-primary-600' : 'text-gray-400'}`}>1. Details</li>
                    <li className={`text-sm font-medium ${wizardStep >= 2 ? 'text-primary-600' : 'text-gray-400'}`}>2. Forms</li>
                    <li className={`text-sm font-medium ${wizardStep >= 3 ? 'text-primary-600' : 'text-gray-400'}`}>3. Digitize</li>
                  </ol>
                </nav>
              </div>

              {/* Step 1: Carrier Info */}
              {wizardStep === 1 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Carrier Details</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Carrier Name</label>
                    <input 
                      type="text" 
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm p-2 border"
                      placeholder="e.g. Banner Life"
                      value={newCarrier.name}
                      onChange={e => setNewCarrier({...newCarrier, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Carrier Code</label>
                    <input 
                      type="text" 
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm p-2 border"
                      placeholder="e.g. BANNER"
                      value={newCarrier.code}
                      onChange={e => setNewCarrier({...newCarrier, code: e.target.value})}
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Upload Forms */}
              {wizardStep === 2 && (
                <div className="space-y-4 text-center py-8">
                  <FileUp className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900">Upload Carrier Paperwork</h3>
                  <p className="text-sm text-gray-500">Upload the blank PDF contracting and appointment forms for this carrier.</p>
                  <div className="mt-4">
                    <button className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                      Select PDF Files
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: AI Digitization Mock */}
              {wizardStep === 3 && (
                <div className="space-y-4 text-center py-8">
                  <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                  <h3 className="text-lg font-medium text-gray-900">Ready for AI Digitization</h3>
                  <p className="text-sm text-gray-500">The system will now scan the uploaded documents and identify all text fields, signature boxes, and checkboxes.</p>
                </div>
              )}

              <div className="mt-8 flex justify-between">
                <button 
                  onClick={() => wizardStep === 1 ? setShowWizard(false) : handleBack()}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  {wizardStep === 1 ? 'Cancel' : 'Back'}
                </button>
                <button 
                  onClick={() => wizardStep === 3 ? handleSaveCarrier() : handleNext()}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
                >
                  {wizardStep === 3 ? 'Save & Digitize' : 'Next Step'}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
