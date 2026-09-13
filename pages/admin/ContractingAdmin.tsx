import React, { useState } from 'react';
import { BuildingLibraryIcon, PlusIcon, CogIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export default function ContractingAdmin() {
  const [carriers, setCarriers] = useState<any[]>([]);
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <BuildingLibraryIcon className="w-8 h-8 mr-3 text-primary-600" />
            Carrier Management
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Configure carrier forms, application types, and routing logic.
          </p>
        </div>
        <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">
          <PlusIcon className="w-5 h-5 mr-2" />
          Add Carrier
        </button>
      </div>
      
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
                      <p className="text-sm text-gray-500">Forms: {carrier.formsCount || 0} | Routing: {carrier.routingStatus || 'Pending'}</p>
                    </div>
                  </div>
                  <div className="ml-5 flex-shrink-0 flex space-x-2">
                    <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
                      Manage
                    </button>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
