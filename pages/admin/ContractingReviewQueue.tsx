import React, { useState } from 'react';
import { List, AlertTriangle, CheckCircle } from 'lucide-react';

import { useEffect } from 'react';

export default function ContractingReviewQueue() {
  const [queueItems, setQueueItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/contracting/queue', {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('nhfg_access_token') }
    })
    .then(res => res.json())
    .then(data => {
      setQueueItems(Array.isArray(data) ? data : []);
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading queue...</div>;
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <List className="w-8 h-8 mr-3 text-blue-600" />
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
              <CheckCircle className="w-12 h-12 text-green-500 mb-3" />
              <p className="text-gray-500 text-lg">Inbox Zero! All automated submissions have been successfully routed.</p>
            </li>
          ) : (
            queueItems.map(item => (
              <li key={item.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2" />
                    <p className="text-sm font-medium text-gray-900 truncate">{item.subject}</p>
                  </div>
                  <div className="text-sm flex items-center space-x-4">
                    <span className="text-gray-500">From: {item.from_email}</span>
                    <span className={`font-bold ${item.ai_confidence >= 90 ? 'text-green-600' : 'text-orange-500'}`}>Confidence: {item.ai_confidence}%</span>
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
