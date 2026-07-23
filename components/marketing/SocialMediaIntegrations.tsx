import React, { useState, useEffect } from 'react';
import { Facebook, Twitter, Linkedin, CheckCircle2, AlertCircle, RefreshCw, Plus } from 'lucide-react';
import { IntegrationConfig } from '../../types';

export const SocialMediaIntegrations: React.FC = () => {
  const [isSyncing, setIsSyncing] = useState<string | null>(null);
  const [mentions, setMentions] = useState<any[]>([]);

  useEffect(() => {
    const fetchMentions = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/marketing/social/mentions');
        if (response.ok) {
          const data = await response.json();
          setMentions(data);
        }
      } catch (error) {
        console.error('Error fetching mentions:', error);
      }
    };
    fetchMentions();
  }, []);

  const [integrations, setIntegrations] = useState<any[]>([
    {
      id: 'meta',
      name: 'Meta Ads & Instagram',
      icon: Facebook,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      status: 'connected',
      lastSync: '2 mins ago',
      metrics: { leads: 124, spend: '$1,200', activeAds: 4 }
    },
    {
      id: 'linkedin',
      name: 'LinkedIn Lead Gen',
      icon: Linkedin,
      color: 'text-sky-600',
      bgColor: 'bg-sky-50',
      status: 'disconnected',
      lastSync: 'Never',
    },
    {
      id: 'x',
      name: 'X (Twitter) Ads',
      icon: Twitter,
      color: 'text-slate-900',
      bgColor: 'bg-slate-100',
      status: 'error',
      lastSync: '3 days ago',
      errorMessage: 'OAuth Token Expired'
    }
  ]);

  const handleSync = (id: string) => {
    setIsSyncing(id);
    setTimeout(() => {
      setIsSyncing(null);
      // Update sync time
      setIntegrations(prev => prev.map(i => i.id === id ? { ...i, lastSync: 'Just now', status: 'connected', errorMessage: undefined } : i));
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h3 className="text-3xl font-black text-slate-900 tracking-tight">Connect Ad Platforms</h3>
        <p className="text-slate-500 font-medium mt-3">Link your social media accounts to automatically sync leads, track campaign spending, and deploy automated marketing flows directly from the CRM.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {integrations.map((integration) => (
          <div key={integration.id} className="bg-white/80 backdrop-blur-xl border border-white/60 p-8 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] transition-all flex flex-col h-full">
            <div className="flex items-start justify-between mb-6">
              <div className={`w-14 h-14 rounded-2xl ${integration.bgColor} ${integration.color} flex items-center justify-center shadow-sm`}>
                <integration.icon size={28} />
              </div>
              <div className="flex flex-col items-end">
                {integration.status === 'connected' && (
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
                    <CheckCircle2 size={14} /> Connected
                  </span>
                )}
                {integration.status === 'disconnected' && (
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
                    Not Connected
                  </span>
                )}
                {integration.status === 'error' && (
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 bg-rose-50 px-3 py-1.5 rounded-full">
                    <AlertCircle size={14} /> Action Required
                  </span>
                )}
                <span className="text-[10px] font-medium text-slate-400 mt-2">Sync: {integration.lastSync}</span>
              </div>
            </div>

            <h4 className="text-xl font-bold text-slate-900 mb-2">{integration.name}</h4>
            
            {integration.metrics ? (
              <div className="grid grid-cols-3 gap-2 mt-4 mb-6">
                <div className="bg-slate-50 p-3 rounded-xl text-center">
                  <p className="text-xs font-semibold text-slate-400">Leads</p>
                  <p className="text-sm font-bold text-slate-900">{integration.metrics.leads}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl text-center">
                  <p className="text-xs font-semibold text-slate-400">Spend</p>
                  <p className="text-sm font-bold text-slate-900">{integration.metrics.spend}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl text-center">
                  <p className="text-xs font-semibold text-slate-400">Ads</p>
                  <p className="text-sm font-bold text-slate-900">{integration.metrics.activeAds}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm font-medium text-slate-500 mt-2 flex-grow">
                {integration.errorMessage || 'Connect your account to sync leads directly into your pipeline.'}
              </p>
            )}

            <div className="mt-auto pt-6 border-t border-slate-100">
              {integration.status === 'connected' ? (
                <button 
                  onClick={() => handleSync(integration.id)}
                  disabled={isSyncing === integration.id}
                  className="w-full py-3 rounded-xl bg-slate-50 text-slate-700 text-sm font-semibold hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw size={16} className={isSyncing === integration.id ? 'animate-spin' : ''} />
                  {isSyncing === integration.id ? 'Syncing...' : 'Force Sync'}
                </button>
              ) : (
                <button className="w-full py-3 rounded-xl bg-slate-900 text-white text-sm font-semibold shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
                  <Plus size={16} /> Connect Account
                </button>
              )}
            </div>
          </div>
        ))}
    </div>
      
      {/* Brand Mentions Section */}
      <div className="mt-12 bg-white/70 backdrop-blur-2xl rounded-[3rem] border border-white/60 p-8 shadow-[0_8px_40px_rgb(0,0,0,0.03)]">
        <h4 className="text-xl font-bold text-slate-900 mb-6">Recent Brand Mentions</h4>
        {mentions.length > 0 ? (
          <div className="space-y-4">
            {mentions.map((mention) => (
              <div key={mention.id} className="bg-white p-5 rounded-2xl border border-slate-100 flex justify-between items-center shadow-sm">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-slate-900 text-sm">{mention.user}</span>
                    <span className="text-xs text-slate-400">via {mention.platform}</span>
                  </div>
                  <p className="text-sm text-slate-700">"{mention.content}"</p>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                    mention.sentiment === 'positive' ? 'bg-emerald-100 text-emerald-700' :
                    mention.sentiment === 'negative' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {mention.sentiment}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-2">{new Date(mention.date).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No recent mentions found.</p>
        )}
      </div>
    </div>
  );
};
