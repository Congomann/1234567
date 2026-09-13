import React, { useState } from 'react';
import { QueueListIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function ContractingReviewQueue() {
  const [queueItems, setQueueItems] = useState<any[]>([]);
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <QueueListIcon className="w-8 h-8 mr-3 text-primary-600" />
          Review Queue
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Review AI classifications with low confidence, duplicate matches, or documents requiring Principal/CEO signature.
        </p>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {queueItems.length === 0 ? (
            <li className="px-6 py-12 text-center flex flex-col items-center">
              <CheckCircleIcon className="w-12 h-12 text-green-500 mb-3" />
              <p className="text-gray-500 text-lg">Inbox Zero! All automated submissions have been successfully routed.</p>
            </li>
          ) : (
            queueItems.map(item => (
              <li key={item.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 mr-2" />
                    <p className="text-sm font-medium text-gray-900 truncate">{item.subject}</p>
                  </div>
                  <div className="text-sm text-gray-500">Confidence: {item.confidence}%</div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
