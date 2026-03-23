
import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { Backend } from '../../services/apiBackend';
import { Globe, Facebook, Linkedin, Copy, Check, Save, Zap, AlertCircle, History, Info, Play, Trash2, ShieldCheck, Database, Smartphone, Music, Key, Terminal, Wifi, Activity } from 'lucide-react';

export const MarketingIntegrations: React.FC = () => {
    const { integrationConfig, updateIntegrationConfig } = useData();
    const [activeTab, setActiveTab] = useState<'google' | 'meta' | 'tiktok' | 'linkedin' | 'logs'>('logs');
    const [logs, setLogs] = useState<any[]>([]);
    const [copied, setCopied] = useState<string | null>(null);

    // Load logs from permanent backend on mount
    useEffect(() => {
        const fetchLogs = async () => {
            const data = await Backend.getLogs();
            setLogs(data);
        };
        fetchLogs();
        // Set up a polling interval for the terminal feel if they want it actually "real-time" looking
        const interval = setInterval(fetchLogs, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    const handleToggle = (platform: 'googleAds' | 'metaAds' | 'tiktokAds' | 'linkedinAds') => {
        const configKey = platform as keyof typeof integrationConfig;
        updateIntegrationConfig({
            [configKey]: { ...integrationConfig[configKey], enabled: !integrationConfig[configKey].enabled }
        });
    };

    const handleGoogleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        updateIntegrationConfig({
            googleAds: { ...integrationConfig.googleAds, developerToken: e.target.value }
        });
    };

    const handleMetaTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        updateIntegrationConfig({
            metaAds: { ...integrationConfig.metaAds, accessToken: e.target.value }
        });
    };

    const simulateLiveWebhook = async () => {
        const platforms = ['meta', 'tiktok', 'google', 'linkedin'];
        const randomPlatform = platforms[Math.floor(Math.random() * platforms.length)];
        const mockName = `Test Lead ${Math.floor(Math.random() * 1000)}`;

        let payload = {};
        if (randomPlatform === 'meta') {
            payload = { entry: [{ changes: [{ value: { full_name: mockName, email: `${mockName.replace(' ', '')}@meta-test.com`, phone_number: '1234567890', job_title: 'Simulated Meta', campaign_id: 'CMP-LIVE-SIM' } }] }] };
        } else if (randomPlatform === 'tiktok') {
            payload = { data: { details: { name: mockName, email: `${mockName.replace(' ', '')}@tiktok-test.com`, phone: '1234567890' }, campaign_id: 'CMP-LIVE-SIM' } };
        } else if (randomPlatform === 'google') {
            payload = { user_column_data: [{ column_id: 'FULL_NAME', string_value: mockName }, { column_id: 'EMAIL', string_value: `${mockName.replace(' ', '')}@google-test.com` }, { column_id: 'PHONE_NUMBER', string_value: '1234567890' }, { column_id: 'PRODUCT_INTEREST', string_value: 'Simulated Google' }], campaign_id: 'CMP-LIVE-SIM' };
        } else {
            payload = { formResponseInfo: { firstName: 'Test', lastName: 'Lead', emailAddress: `${mockName.replace(' ', '')}@linkedin-test.com`, phoneNumber: '1234567890', jobTitle: 'Simulated LinkedIn' }, campaignId: 'CMP-LIVE-SIM' };
        }

        try {
            await fetch(`/api/webhooks/${randomPlatform}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            // The polling interval will pick up the new log, and the socket will push the lead
        } catch (e) {
            console.error('Failed to simulate webhook', e);
        }
    };

    const CodeBlock = ({ title, children }: { title: string, children: React.ReactNode }) => (
        <div className="bg-[#0b1021] border border-gray-800 rounded-xl overflow-hidden mt-6 shadow-2xl">
            <div className="flex justify-between items-center bg-[#131b2f] px-4 py-2 border-b border-gray-800">
                <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">{title}</span>
                <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-gray-700"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-gray-700"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-gray-700"></div>
                </div>
            </div>
            <div className="p-4 overflow-x-auto text-xs font-mono text-gray-300 leading-relaxed font-semibold">
                {children}
            </div>
        </div>
    );

    const ConnectionStatus = ({ active }: { active: boolean }) => (
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md border ${active ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-gray-800 border-gray-700 text-gray-400'} text-xs font-mono font-bold uppercase tracking-wider`}>
            {active ? <><Wifi className="w-3 h-3 animate-pulse" /> Live Integration</> : <><AlertCircle className="w-3 h-3" /> Offline</>}
        </div>
    );

    const NavButton = ({ id, label, icon: Icon, activeColor }: { id: typeof activeTab, label: string, icon: any, activeColor: string }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 font-mono text-xs uppercase tracking-widest font-bold transition-all ${activeTab === id ? `border-[${activeColor}] text-[${activeColor}] bg-[#1a233a]` : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-[#131b2f]'}`}
            style={activeTab === id ? { color: activeColor, borderColor: activeColor } : {}}
        >
            <Icon size={14} />
            {label}
        </button>
    );

    return (
        <div className="min-h-screen bg-[#050b14] text-gray-200 p-8 rounded-3xl pb-20 border border-gray-800 font-sans shadow-2xl">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10 pb-6 border-b border-gray-800">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                        <Terminal className="text-blue-400 w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-widest uppercase">Production API Terminal</h1>
                        <div className="flex items-center gap-3 mt-2 font-mono text-xs text-blue-400/80 uppercase tracking-widest">
                            <Activity className="w-4 h-4 animate-pulse text-green-500" />
                            <span>System Status: Optimal</span>
                            <span className="text-gray-600">|</span>
                            <span>Port: 3001</span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={simulateLiveWebhook}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 transition-all text-white rounded-xl font-bold uppercase tracking-widest text-xs shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                >
                    <Play className="w-4 h-4" />
                    Simulate Live Traffic
                </button>
            </div>

            {/* Navigation */}
            <div className="flex overflow-x-auto no-scrollbar border-b border-gray-800 mb-8 bg-[#0a101d] rounded-t-xl">
                <NavButton id="logs" label="System Trace" icon={Database} activeColor="#60a5fa" />
                <NavButton id="google" label="Google Ads" icon={Globe} activeColor="#f87171" />
                <NavButton id="meta" label="Meta" icon={Facebook} activeColor="#60a5fa" />
                <NavButton id="tiktok" label="TikTok" icon={Music} activeColor="#e5e5e5" />
                <NavButton id="linkedin" label="LinkedIn" icon={Linkedin} activeColor="#38bdf8" />
            </div>

            <div className="grid grid-cols-1 gap-8">
                {/* Main Content Area */}
                <div className="w-full">

                    {/* LOGS TAB */}
                    {activeTab === 'logs' && (
                        <div className="bg-[#0d1424] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
                            <div className="px-6 py-4 bg-[#111827] border-b border-gray-800 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                    <span className="font-mono text-xs font-bold tracking-widest text-gray-400 uppercase">Real-Time Ingestion Stream</span>
                                </div>
                                <span className="font-mono text-[10px] text-gray-500">{logs.length} events processed</span>
                            </div>
                            <div className="p-6 font-mono text-xs h-[600px] overflow-y-auto custom-scrollbar flex flex-col gap-3">
                                {logs.map(log => (
                                    <div key={log.id} className="border-l-2 pl-4 py-2 border-l-gray-700 hover:border-l-blue-500 bg-[#0a0f1c] hover:bg-[#111827] transition-all rounded-r-lg group">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-3">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${log.status === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'} uppercase`}>
                                                    {log.status}
                                                </span>
                                                <span className="text-blue-300 font-bold uppercase tracking-wider">{log.platform.replace('_', ' ')}</span>
                                                <span className="text-gray-500 text-[10px]">{log.event}</span>
                                            </div>
                                            <span className="text-gray-600 text-[10px]">{new Date(log.timestamp).toISOString()}</span>
                                        </div>
                                        <div className="text-gray-400 whitespace-pre-wrap CustomScrollbar max-h-[150px] overflow-y-auto text-[11px] bg-black/40 p-3 rounded border border-gray-800 group-hover:border-gray-700 font-mono">
                                            {JSON.stringify(log.payload, null, 2)}
                                        </div>
                                    </div>
                                ))}
                                {logs.length === 0 && (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-600 space-y-4">
                                        <History size={48} className="opacity-20" />
                                        <p className="uppercase tracking-widest font-bold">Waiting for Webhook Data...</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* GOOGLE ADS TAB */}
                    {activeTab === 'google' && (
                        <div className="bg-[#0d1424] border border-gray-800 rounded-2xl p-8 shadow-2xl animate-fade-in relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-[100px] -z-10"></div>

                            <div className="flex justify-between items-start mb-10">
                                <div>
                                    <h2 className="text-2xl font-black text-white flex items-center gap-3">
                                        <Globe className="text-red-400" />
                                        Google Ads API
                                    </h2>
                                    <p className="text-gray-400 mt-2 font-mono text-xs">Search intent lead form webhooks.</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <ConnectionStatus active={integrationConfig.googleAds.enabled} />
                                    <button onClick={() => handleToggle('googleAds')} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${integrationConfig.googleAds.enabled ? 'bg-red-500' : 'bg-gray-700'}`}>
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${integrationConfig.googleAds.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block font-mono text-xs tracking-widest uppercase text-gray-500 mb-2">Google Ads Webhook Endpoint</label>
                                    <div className="flex gap-3">
                                        <input readOnly value={integrationConfig.googleAds.webhookUrl} className="flex-1 bg-black/50 border border-gray-700 rounded-lg px-4 py-3 text-sm font-mono text-gray-300 outline-none focus:border-red-500" />
                                        <button onClick={() => handleCopy(integrationConfig.googleAds.webhookUrl, 'google-url')} className="px-5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-gray-300 transition-colors">
                                            {copied === 'google-url' ? <Check className="text-green-400" /> : <Copy size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block font-mono text-xs tracking-widest uppercase text-gray-500 mb-2">Developer / Google Key</label>
                                    <input
                                        type="password"
                                        placeholder="Enter Google Ads Developer Token / Key"
                                        value={integrationConfig.googleAds.developerToken || ''}
                                        onChange={handleGoogleTokenChange}
                                        className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-3 text-sm font-mono text-gray-300 outline-none focus:border-red-500"
                                    />
                                    <p className="text-[10px] text-gray-500 mt-2 font-mono">Required to decrypt Google Lead-Level signatures.</p>
                                </div>

                                <CodeBlock title="Google Ads Payload Signature (Example)">
                                    {`{
  "lead_id": "Te5t-1Ead-1D-12345",
  "campaign_id": 123456789,
  "user_column_data": [
    { "column_id": "FULL_NAME", "string_value": "John Doe" },
    { "column_id": "EMAIL", "string_value": "john@example.com" }
  ],
  "google_key": "YOUR_GOOGLE_KEY"
}`}
                                </CodeBlock>
                            </div>
                        </div>
                    )}

                    {/* META ADS TAB */}
                    {activeTab === 'meta' && (
                        <div className="bg-[#0d1424] border border-gray-800 rounded-2xl p-8 shadow-2xl animate-fade-in relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[100px] -z-10"></div>

                            <div className="flex justify-between items-start mb-10">
                                <div>
                                    <h2 className="text-2xl font-black text-white flex items-center gap-3">
                                        <Facebook className="text-blue-500" />
                                        Meta Graph API
                                    </h2>
                                    <p className="text-gray-400 mt-2 font-mono text-xs">Leadgen Webhooks & Access Token Verification.</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <ConnectionStatus active={integrationConfig.metaAds.enabled} />
                                    <button onClick={() => handleToggle('metaAds')} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${integrationConfig.metaAds.enabled ? 'bg-blue-500' : 'bg-gray-700'}`}>
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${integrationConfig.metaAds.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block font-mono text-xs tracking-widest uppercase text-gray-500 mb-2">Callback URL</label>
                                        <div className="flex gap-3">
                                            <input readOnly value="https://api.nhfg.com/webhooks/meta" className="flex-1 bg-black/50 border border-gray-700 rounded-lg px-4 py-3 text-sm font-mono text-gray-300 outline-none" />
                                            <button onClick={() => handleCopy('https://api.nhfg.com/webhooks/meta', 'meta-url')} className="px-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-gray-300 transition-colors">
                                                {copied === 'meta-url' ? <Check className="text-green-400" /> : <Copy size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block font-mono text-xs tracking-widest uppercase text-gray-500 mb-2">Verify Token</label>
                                        <div className="flex gap-3">
                                            <input readOnly value={integrationConfig.metaAds.verifyToken || 'nhfg_verification_token_secure'} className="flex-1 bg-black/50 border border-gray-700 rounded-lg px-4 py-3 text-sm font-mono text-blue-400 outline-none" />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block font-mono text-xs tracking-widest uppercase text-gray-500 mb-2 flex items-center gap-2">
                                        System User Access Token <ShieldCheck size={12} className="text-blue-400" />
                                    </label>
                                    <input
                                        type="password"
                                        placeholder="EAAGm0PX4ZC... (Never-expiring System User Token)"
                                        value={(integrationConfig.metaAds as any).accessToken || ''}
                                        onChange={handleMetaTokenChange}
                                        className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-3 text-sm font-mono text-gray-300 outline-none focus:border-blue-500"
                                    />
                                    <p className="text-[10px] text-gray-500 mt-2 font-mono">CRITICAL: Required to exchange Graph API 'leadgen_id' for actual lead data.</p>
                                </div>

                                <CodeBlock title="Graph API Fetch Protocol">
                                    {`// 1. Meta posts leadgen_id to our webhook
const leadgen_id = payload.entry[0].changes[0].value.leadgen_id;

// 2. We request PII securely from Graph API
const url = \`https://graph.facebook.com/v19.0/\${leadgen_id}?access_token=\${SYSTEM_USER_TOKEN}\`;
const leadData = await fetch(url).then(r => r.json());

// 3. Database Ingestion
executeSyncTransaction(leadData.field_data);`}
                                </CodeBlock>
                            </div>
                        </div>
                    )}

                    {/* TIKTOK ADS TAB */}
                    {activeTab === 'tiktok' && (
                        <div className="bg-[#0d1424] border border-gray-800 rounded-2xl p-8 shadow-2xl animate-fade-in relative overflow-hidden">
                            <div className="flex justify-between items-start mb-10">
                                <div>
                                    <h2 className="text-2xl font-black text-white flex items-center gap-3">
                                        <Music className="text-white" />
                                        TikTok For Business
                                    </h2>
                                    <p className="text-gray-400 mt-2 font-mono text-xs">High-velocity form capture.</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <ConnectionStatus active={integrationConfig.tiktokAds.enabled} />
                                    <button onClick={() => handleToggle('tiktokAds')} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${integrationConfig.tiktokAds.enabled ? 'bg-white' : 'bg-gray-700'}`}>
                                        <span className={`inline-block h-4 w-4 transform rounded-full transition-transform ${integrationConfig.tiktokAds.enabled ? 'translate-x-6 bg-black' : 'translate-x-1 bg-gray-400'}`} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block font-mono text-xs tracking-widest uppercase text-gray-500 mb-2">API Subscription Endpoint</label>
                                    <div className="flex gap-3">
                                        <input readOnly value="https://api.nhfg.com/webhooks/tiktok" className="flex-1 bg-black/50 border border-gray-700 rounded-lg px-4 py-3 text-sm font-mono text-gray-300 outline-none focus:border-white" />
                                        <button onClick={() => handleCopy('https://api.nhfg.com/webhooks/tiktok', 'tiktok-url')} className="px-5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-gray-300 transition-colors">
                                            {copied === 'tiktok-url' ? <Check className="text-green-400" /> : <Copy size={18} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* LINKEDIN ADS TAB */}
                    {activeTab === 'linkedin' && (
                        <div className="bg-[#0d1424] border border-gray-800 rounded-2xl p-8 shadow-2xl animate-fade-in relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 rounded-full blur-[100px] -z-10"></div>

                            <div className="flex justify-between items-start mb-10">
                                <div>
                                    <h2 className="text-2xl font-black text-white flex items-center gap-3">
                                        <Linkedin className="text-sky-400" />
                                        LinkedIn Ads
                                    </h2>
                                    <p className="text-gray-400 mt-2 font-mono text-xs">B2B and Executive Recruitment Lead Generation.</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <ConnectionStatus active={(integrationConfig as any).linkedinAds?.enabled || false} />
                                    <button onClick={() => handleToggle('linkedinAds' as any)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${(integrationConfig as any).linkedinAds?.enabled ? 'bg-sky-500' : 'bg-gray-700'}`}>
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${(integrationConfig as any).linkedinAds?.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block font-mono text-xs tracking-widest uppercase text-gray-500 mb-2">Endpoint URL</label>
                                    <div className="flex gap-3">
                                        <input readOnly value="https://api.nhfg.com/webhooks/linkedin" className="flex-1 bg-black/50 border border-gray-700 rounded-lg px-4 py-3 text-sm font-mono text-gray-300 outline-none focus:border-sky-500" />
                                        <button onClick={() => handleCopy('https://api.nhfg.com/webhooks/linkedin', 'li-url')} className="px-5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-gray-300 transition-colors">
                                            {copied === 'li-url' ? <Check className="text-green-400" /> : <Copy size={18} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};
