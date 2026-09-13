import React, { useState, useEffect } from 'react';
import { BuildingLibraryIcon, DocumentCheckIcon, InboxArrowDownIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import Backend from '../../services/apiBackend';
import { useData } from '../../context/DataContext';

export default function ContractingHub() {
  const { user } = useData();
  const [carriers, setCarriers] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
          <BuildingLibraryIcon className="w-8 h-8 mr-3 text-primary-600" />
          Carrier Contracting
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Request new carrier appointments, manage contracts, and electronically sign applications.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <InboxArrowDownIcon className="w-5 h-5 mr-2 text-gray-500" />
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
                  <button className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition">
                    Start <ArrowRightIcon className="w-4 h-4 ml-2" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <DocumentCheckIcon className="w-5 h-5 mr-2 text-gray-500" />
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
                  <span className={\`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium \${
                    sub.status === 'Approved' ? 'bg-green-100 text-green-800' :
                    sub.status === 'Pending Carrier' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }\`}>
                    {sub.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
