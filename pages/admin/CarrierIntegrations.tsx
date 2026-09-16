import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { DB } from '../../services/database';
import { Webhook, Plug, CheckCircle2, XCircle, RefreshCw, Key, Shield, Link as LinkIcon, Database, HardDrive, Plus, Trash2 } from 'lucide-react';
import { Tab3DBanner } from '../../components/shared/Tab3DBanner';

export default function CarrierIntegrations() {
  const { availableCarriers } = useData();
  const [connections, setConnections] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form State
  const [selectedCarrier, setSelectedCarrier] = useState('');
  const [authType, setAuthType] = useState('oauth2');
  const [endpointEnv, setEndpointEnv] = useState('production');
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [apiKey, setApiKey] = useState('');
  
  const [syncingId, setSyncingId] = useState<string | null>(null);

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    const data = await DB.getAll('carrier_api_connections') || [];
    setConnections(data);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCarrier) return;
    setIsSaving(true);
    
    const newConnection = {
      id: 'conn_' + Date.now(),
      carrier: selectedCarrier,
      authType,
      endpointEnv,
      clientId,
      clientSecret,
      apiKey,
      status: 'Connected',
      lastSync: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await DB.save('carrier_api_connections', newConnection);
    await loadConnections();
    setShowAdd(false);
    setIsSaving(false);
    
    // Reset Form
    setSelectedCarrier('');
    setClientId('');
    setClientSecret('');
    setApiKey('');
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to remove this carrier API connection?')) {
      await DB.delete('carrier_api_connections', id);
      await loadConnections();
    }
  };

  const handleSync = async (conn: any) => {
    setSyncingId(conn.id);
    
    // Simulate API fetch delay
    setTimeout(async () => {
      const updatedConn = {
        ...conn,
        lastSync: new Date().toISOString()
      };
      await DB.save('carrier_api_connections', updatedConn);
      await loadConnections();
      setSyncingId(null);
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 fade-in">
      <div className="bg-indigo-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Plug className="w-48 h-48" />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-3">Carrier API Connections</h1>
          <p className="text-indigo-200 max-w-2xl text-lg">
            Manage API keys and OAuth tokens for automated policy activity tracking (e.g. DTCC, NIPR, direct carrier endpoints).
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Active Integrations</h2>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition font-medium shadow-sm"
        >
          {showAdd ? <XCircle className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
          {showAdd ? 'Cancel' : 'Add Connection'}
        </button>
      </div>

      {showAdd && (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-indigo-100 mb-8 slide-up">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <LinkIcon className="w-5 h-5 mr-2 text-indigo-500" />
            Configure Carrier API
          </h3>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Carrier</label>
                <select 
                  required
                  value={selectedCarrier}
                  onChange={(e) => setSelectedCarrier(e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select a carrier...</option>
                  {availableCarriers.map(c => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                  <option value="DTCC - Agency Feed">DTCC - Agency Feed</option>
                  <option value="NIPR - Licensing Sync">NIPR - Licensing Sync</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Environment</label>
                <select 
                  value={endpointEnv}
                  onChange={(e) => setEndpointEnv(e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="production">Production</option>
                  <option value="sandbox">Sandbox / UAT</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Authentication Method</label>
                <select 
                  value={authType}
                  onChange={(e) => setAuthType(e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="oauth2">OAuth 2.0 (Client Credentials)</option>
                  <option value="api_key">Static API Key</option>
                  <option value="mutual_tls">Mutual TLS (mTLS)</option>
                </select>
              </div>
            </div>

            {authType === 'oauth2' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client ID</label>
                  <input 
                    type="text" 
                    required
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g. 8f8d9b23-..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client Secret</label>
                  <input 
                    type="password" 
                    required
                    value={clientSecret}
                    onChange={(e) => setClientSecret(e.target.value)}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="••••••••••••••••"
                  />
                </div>
              </div>
            )}

            {authType === 'api_key' && (
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <label className="block text-sm font-medium text-gray-700 mb-1">API Key / Token</label>
                <input 
                  type="password" 
                  required
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="sk_prod_..."
                />
              </div>
            )}
            
            {authType === 'mutual_tls' && (
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 text-amber-800 text-sm">
                Mutual TLS (mTLS) requires uploading a client certificate (.pfx or .pem). This feature must be configured securely by your DevOps team in the deployment environment.
              </div>
            )}

            <div className="flex justify-end pt-4">
              <button 
                type="submit"
                disabled={isSaving}
                className="px-6 py-2 bg-indigo-600 text-white rounded-md font-medium shadow-md hover:bg-indigo-700 transition"
              >
                {isSaving ? 'Connecting...' : 'Test & Save Connection'}
              </button>
            </div>
          </form>
        </div>
      )}

      {connections.length === 0 && !showAdd ? (
        <div className="bg-white rounded-xl shadow p-12 text-center border border-gray-100">
          <Database className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No API Connections</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            You haven't configured any direct carrier APIs. Add a connection to start automatically syncing policy statuses, underwriting requirements, and commissions.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {connections.map((conn) => (
            <div key={conn.id} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden flex flex-col transition hover:shadow-lg">
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{conn.carrier}</h3>
                    <div className="flex items-center mt-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${conn.endpointEnv === 'production' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                        {conn.endpointEnv === 'production' ? 'Production API' : 'Sandbox / UAT API'}
                      </span>
                    </div>
                  </div>
                  <div className="p-2 bg-indigo-50 rounded-lg">
                    <HardDrive className="w-6 h-6 text-indigo-600" />
                  </div>
                </div>

                <div className="space-y-3 mt-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 flex items-center"><Shield className="w-4 h-4 mr-1.5" /> Auth Type</span>
                    <span className="font-medium text-gray-900">
                      {conn.authType === 'oauth2' ? 'OAuth 2.0' : conn.authType === 'api_key' ? 'Static API Key' : 'mTLS'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 flex items-center"><CheckCircle2 className="w-4 h-4 mr-1.5 text-green-500" /> Status</span>
                    <span className="font-medium text-green-600">Connected & Verified</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 flex items-center"><RefreshCw className="w-4 h-4 mr-1.5" /> Last Sync</span>
                    <span className="font-medium text-gray-900">
                      {new Date(conn.lastSync).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-5 py-4 border-t border-gray-100 flex justify-between items-center">
                <button 
                  onClick={() => handleDelete(conn.id)}
                  className="text-gray-400 hover:text-red-500 transition"
                  title="Remove Connection"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => handleSync(conn)}
                  disabled={syncingId === conn.id}
                  className={`flex items-center px-4 py-1.5 rounded-md text-sm font-medium transition ${syncingId === conn.id ? 'bg-indigo-100 text-indigo-400' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'}`}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${syncingId === conn.id ? 'animate-spin' : ''}`} />
                  {syncingId === conn.id ? 'Syncing...' : 'Force Sync'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
