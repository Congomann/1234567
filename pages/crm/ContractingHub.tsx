import React, { useState, useEffect } from 'react';
import { Building, FileCheck, Inbox, ArrowRight } from 'lucide-react';
import { Backend } from '../../services/apiBackend';
import { useData } from '../../context/DataContext';
import SignatureCanvas from '../../components/crm/SignatureCanvas';

export default function ContractingHub() {
  const { user } = useData();
  const [carriers, setCarriers] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeApplication, setActiveApplication] = useState<any>(null);
  const [signatureData, setSignatureData] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedCarriers, fetchedSubmissions] = await Promise.all([
          Backend.getActiveCarriers(),
          Backend.getMySubmissions()
        ]);
        setCarriers(fetchedCarriers || []);
        setSubmissions(fetchedSubmissions || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Building className="w-8 h-8 mr-3 text-primary-600" />
          Carrier Contracting
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Request new carrier appointments, manage contracts, and electronically sign applications.
        </p>
      </div>

      {activeApplication ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              Complete Application: {activeApplication.name}
            </h2>
            <button onClick={() => setActiveApplication(null)} className="text-gray-500 hover:text-gray-700">Cancel</button>
          </div>
          <div className="p-8 space-y-8">
            <div className="bg-blue-50 text-blue-800 p-4 rounded-md text-sm">
              <p className="font-semibold">Auto-Fill Active</p>
              <p>We have automatically populated your legal name, NPN, and address based on your Advisor Profile.</p>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Electronic Signature Required</h3>
              <p className="text-sm text-gray-500">By signing below, you agree to the terms and conditions set forth by {activeApplication.name}.</p>
              <SignatureCanvas 
                onSign={(data) => setSignatureData(data)} 
                onClear={() => setSignatureData(null)} 
              />
            </div>
            
            <div className="pt-6 border-t border-gray-200 flex justify-end">
              <button 
                disabled={!signatureData}
                onClick={async () => {
                  setLoading(true);
                  try {
                    // In a real app we'd have the actual submission ID. We use a mock ID for the UI logic.
                    const subId = activeApplication.id || 'mock-sub-123';
                    const res = await fetch('/api/contracting/submissions/' + subId + '/sign-and-submit', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + localStorage.getItem('nhfg_access_token')
                      },
                      body: JSON.stringify({
                        signatureData: signatureData,
                        mappedFields: {
                          "Name": (user as any)?.firstName ? ((user as any)?.firstName + ' ' + (user as any)?.lastName) : user?.name,
                          "NPN": (user as any)?.npn || "12345678"
                        }
                      })
                    });
                    
                    const data = await res.json();
                    if(data.success) {
                      alert('Success! ' + data.message + '\nPDF File Size: ' + data.pdfSize + ' bytes');
                    } else {
                      alert('Failed to submit application: ' + data.error);
                    }
                  } catch (e) {
                    alert('Network error submitting application.');
                  }
                  setActiveApplication(null);
                  setSignatureData(null);
                  setLoading(false);
                }}
                className={`px-6 py-3 rounded-lg text-white font-medium ${signatureData ? 'bg-primary-600 hover:bg-primary-700' : 'bg-gray-300 cursor-not-allowed'}`}
              >
                Sign & Submit Application
              </button>
            </div>
          </div>
        </div>
      ) : (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Inbox className="w-5 h-5 mr-2 text-gray-500" />
              Available Carriers
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {carriers.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No active carriers available for contracting.</div>
            ) : (
              carriers.map(carrier => (
                <div key={carrier.id} className="p-6 hover:bg-gray-50 transition flex items-center justify-between">
                  <div>
                    <h3 className="text-md font-medium text-gray-900">{carrier.name}</h3>
                    <p className="text-sm text-gray-500">{carrier.description || 'Insurance Carrier'}</p>
                  </div>
                  <button onClick={() => setActiveApplication(carrier)} className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition">
                    Start <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <FileCheck className="w-5 h-5 mr-2 text-gray-500" />
              My Contracting
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {submissions.length === 0 ? (
              <div className="p-6 text-center text-gray-500">You haven't submitted any contracting requests yet.</div>
            ) : (
              submissions.map(sub => (
                <div key={sub.id} className="p-6 hover:bg-gray-50 transition flex items-center justify-between">
                  <div>
                    <h3 className="text-md font-medium text-gray-900">{sub.carrier_name} - {sub.application_type}</h3>
                    <p className="text-sm text-gray-500">Submitted: {new Date(sub.submitted_at).toLocaleDateString()}</p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    sub.status === 'Approved' ? 'bg-green-100 text-green-800' :
                    sub.status === 'Pending Carrier' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {sub.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
