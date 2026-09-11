import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { Globe, Facebook, Linkedin, Music, Wifi, AlertCircle, RefreshCw } from 'lucide-react';
import { Tab3DBanner } from '../../components/shared/Tab3DBanner';

interface HealthData {
  platform: string;
  status: string;
  last_sync_at: string | null;
  total_webhooks: number;
  failed_webhooks: number;
  webhook_health_percent: string;
}

export const MarketingIntegrations: React.FC = () => {
    const { integrationConfig } = useData();
    const [healthData, setHealthData] = useState<HealthData[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchHealth = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/integrations/health');
            if (res.ok) {
                const data = await res.json();
                setHealthData(data);
            }
        } catch (e) {
            console.error('Failed to fetch integration health', e);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchHealth();
        
        // Handle OAuth callback status param from URL
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('integration')) {
            // Give the backend a second to update before fetching
            setTimeout(fetchHealth, 1000);
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

    const connectPlatform = (platform: string) => {
        window.location.href = `/api/integrations/${platform}/oauth`;
    };

    const StatusBadge = ({ status }: { status: string }) => {
        if (status === 'connected') return <span className="px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2"><Wifi size={12}/> Connected</span>;
        if (status === 'awaiting_approval') return <span className="px-3 py-1 bg-yellow-500/10 text-yellow-400 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2"><AlertCircle size={12}/> Awaiting API Approval</span>;
        return <span className="px-3 py-1 bg-gray-500/10 text-gray-400 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2"><AlertCircle size={12}/> Disconnected</span>;
    };

    const platforms = [
        { id: 'google', name: 'Google Ads', icon: Globe, color: 'text-red-400', desc: 'Search intent lead form webhooks.' },
        { id: 'linkedin', name: 'LinkedIn Ads', icon: Linkedin, color: 'text-sky-400', desc: 'B2B and Executive Recruitment.' },
        { id: 'tiktok', name: 'TikTok', icon: Music, color: 'text-white', desc: 'High-velocity form capture.' },
        { id: 'meta', name: 'Meta Ads', icon: Facebook, color: 'text-blue-500', desc: 'Facebook & Instagram lead ads.' }
    ];

    return (
        <div className="space-y-8 relative">
            <Tab3DBanner
                cards={[
                    { title: "Integration Health", value: "Live Monitoring", subtitle: "Real-time webhook metrics", emoji: "⚡", gradient: "cyan" }
                ]}
            />
            <div className="min-h-screen bg-[#050b14] text-gray-200 p-8 rounded-3xl pb-20 border border-gray-800 font-sans shadow-2xl">
                
                <div className="flex justify-between items-center mb-10 pb-6 border-b border-gray-800">
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-widest uppercase">Integration Health Dashboard</h1>
                        <p className="text-gray-400 mt-2 font-mono text-sm">Monitor live API connections and webhook delivery health.</p>
                    </div>
                    <button onClick={fetchHealth} disabled={loading} className="p-3 bg-gray-800 hover:bg-gray-700 rounded-xl transition-all">
                        <RefreshCw className={`w-5 h-5 text-blue-400 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {platforms.map(p => {
                        const health = healthData.find(h => h.platform === p.id) || {
                            status: 'disconnected', last_sync_at: null, total_webhooks: 0, failed_webhooks: 0, webhook_health_percent: '0.00'
                        };
                        const isConnected = health.status === 'connected';

                        return (
                            <div key={p.id} className="bg-[#0d1424] border border-gray-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden flex flex-col">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-3 rounded-xl bg-gray-800/50 ${p.color}`}>
                                            <p.icon size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-white">{p.name}</h3>
                                            <p className="text-xs text-gray-500 font-mono mt-1">{p.desc}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-6 flex justify-between items-center">
                                    <span className="text-xs font-mono uppercase text-gray-500 tracking-wider">Status</span>
                                    <StatusBadge status={health.status} />
                                </div>

                                <div className="space-y-4 mb-8 flex-1">
                                    <div className="flex justify-between items-center bg-black/30 p-3 rounded-lg border border-gray-800/50">
                                        <span className="text-xs text-gray-400 font-mono">Last Sync</span>
                                        <span className="text-sm text-gray-200 font-mono">{health.last_sync_at ? new Date(health.last_sync_at).toLocaleString() : 'Never'}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-black/30 p-3 rounded-lg border border-gray-800/50">
                                        <span className="text-xs text-gray-400 font-mono">Total Webhooks</span>
                                        <span className="text-sm text-gray-200 font-mono">{health.total_webhooks}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-black/30 p-3 rounded-lg border border-gray-800/50">
                                        <span className="text-xs text-gray-400 font-mono">Health %</span>
                                        <span className={`text-sm font-bold font-mono ${Number(health.webhook_health_percent) > 90 ? 'text-green-400' : 'text-yellow-400'}`}>
                                            {health.webhook_health_percent}%
                                        </span>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => connectPlatform(p.id)}
                                    className={`w-full py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-all ${isConnected ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg'}`}
                                >
                                    {isConnected ? 'Reconnect / Settings' : `Connect ${p.name}`}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
