
import React, { useEffect, useState } from 'react';
import { AnalyticsService } from '../../services/analyticsService';
import {
    Users,
    MousePointer2,
    Clock,
    Activity,
    Trash2,
    Code,
    Globe,
    Monitor,
    Smartphone,
    Tablet,
    ChevronRight,
    Search,
    ShieldAlert,
    Copy,
    CheckCircle2
} from 'lucide-react';

interface Visitor {
    visitor_id: string;
    ip_address: string;
    user_agent: string;
    device_type: string;
    screen_resolution: string;
    language: string;
    first_seen: string;
    last_seen: string;
    metadata: any;
}

interface AnalyticsStats {
    totalVisitors: number;
    activeSessions: number;
    topPages: { path: string, views: string }[];
    recentVisitors: Visitor[];
}

export const AdminAnalytics: React.FC = () => {
    const [stats, setStats] = useState<AnalyticsStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [copied, setCopied] = useState(false);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('nhfg_jwt_token');
            const res = await fetch('/api/admin/analytics/stats', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Verification failed or endpoint unreachable.');
            const data = await res.json();
            setStats(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 60000);
        return () => clearInterval(interval);
    }, []);

    const handleDelete = async (visitorId: string) => {
        if (!window.confirm('GDPR/CCPA COMPLIANCE: This will permanently purge all telemetry for this visitor. Proceed?')) return;

        const res = await AnalyticsService.deleteUserData(visitorId);
        if (res.success) {
            fetchStats();
        } else {
            alert('System Error: Could not delete visitor node.');
        }
    };

    const copySnippet = () => {
        const snippet = `<!-- NHFG Tracking Pixel -->
<script>
  (function(n,h,f,g){
    var s=n.createElement('script');
    s.src='${window.location.origin}/analytics.js';
    s.async=true;
    n.head.appendChild(s);
  })(document);
</script>`;
        navigator.clipboard.writeText(snippet);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const filteredVisitors = stats?.recentVisitors.filter(v =>
        v.visitor_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.ip_address?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
            <div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Initializing Analytics Engine...</p>
        </div>
    );

    return (
        <div className="space-y-8 pb-20 max-w-7xl mx-auto">
            {/* Top Bar */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">System Intelligence Terminal</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Real-time Data Stream Active</span>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={fetchStats}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
                    >
                        Sync Data
                    </button>
                    <button
                        onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
                        className="px-4 py-2 bg-[#0A62A7] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                    >
                        View Pixel Setup
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform"><Users size={80} /></div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Visitors</p>
                    <h3 className="text-3xl font-black text-slate-900">{stats?.totalVisitors.toLocaleString()}</h3>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform"><Activity size={80} /></div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Sessions</p>
                    <h3 className="text-3xl font-black text-blue-600">{stats?.activeSessions}</h3>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform"><MousePointer2 size={80} /></div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Avg. CTR</p>
                    <h3 className="text-3xl font-black text-slate-900">4.2<span className="text-lg">%</span></h3>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform"><Clock size={80} /></div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Mean Duration</p>
                    <h3 className="text-3xl font-black text-slate-900">2:45</h3>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Top Pages Table */}
                <div className="lg:col-span-1 bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
                    <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                        <h3 className="font-black text-sm text-slate-800 uppercase tracking-tight">High Engagement Nodes</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Most visited pages</p>
                    </div>
                    <div className="divide-y divide-slate-50">
                        {stats?.topPages.map((page, idx) => (
                            <div key={idx} className="p-6 flex justify-between items-center hover:bg-slate-50 transition-colors">
                                <div className="min-w-0">
                                    <p className="text-xs font-black text-slate-700 truncate">{page.path}</p>
                                    <p className="text-[9px] text-slate-400 uppercase font-black">Route</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-blue-600">{page.views}</p>
                                    <p className="text-[9px] text-slate-400 uppercase font-black">hits</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Visitor Feed */}
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
                    <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                        <div>
                            <h3 className="font-black text-sm text-slate-800 uppercase tracking-tight">Visitor Logs</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 flex items-center gap-1.5">
                                <ShieldAlert size={12} className="text-blue-500" /> Subject to GDPR Deletion Requests
                            </p>
                        </div>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                            <input
                                className="w-full bg-slate-50 border border-slate-200 rounded-full pl-9 pr-4 py-2 text-[11px] font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                placeholder="Search Visitor ID or IP..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Device / ID</th>
                                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">IP Address</th>
                                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</th>
                                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Seen</th>
                                    <th className="px-8 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredVisitors?.map(visitor => (
                                    <tr key={visitor.visitor_id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                                    {visitor.device_type === 'desktop' ? <Monitor size={16} /> :
                                                        visitor.device_type === 'mobile' ? <Smartphone size={16} /> : <Tablet size={16} />}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[11px] font-black text-slate-700 truncate w-32">{visitor.visitor_id}</p>
                                                    <p className="text-[9px] text-slate-400 font-bold">{visitor.screen_resolution}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-4">
                                            <p className="text-xs font-black text-slate-600 font-mono">{visitor.ip_address || 'Hidden'}</p>
                                        </td>
                                        <td className="px-8 py-4">
                                            <div className="flex items-center gap-2">
                                                <Globe size={12} className="text-slate-300" />
                                                <p className="text-[11px] font-bold text-slate-500">Global Citizen</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-4">
                                            <p className="text-xs font-bold text-slate-500">{new Date(visitor.last_seen).toLocaleTimeString()}</p>
                                        </td>
                                        <td className="px-8 py-4 text-center">
                                            <button
                                                onClick={() => handleDelete(visitor.visitor_id)}
                                                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                title="Delete all visitor data"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Tracking Snippet Section */}
            <div className="bg-[#0B2240] rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl shadow-blue-900/40">
                <div className="absolute top-0 right-0 p-12 opacity-5"><Activity size={200} strokeWidth={1} /></div>
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div>
                        <h2 className="text-3xl font-black tracking-tight mb-4">Cross-Domain Tracking</h2>
                        <p className="text-blue-200/60 font-medium leading-relaxed mb-8 max-w-md">
                            Continue tracking users on third-party websites by deploying the NHFG Intelligence Pixel.
                            This allows you to unify user identity across your entire marketing ecosystem.
                        </p>
                        <ul className="space-y-4">
                            {[
                                "Real-time browse behavior analysis",
                                "UTM dynamic metadata capture",
                                "Implicit identity resolution",
                                "GDPR compliance built-in"
                            ].map(item => (
                                <li key={item} className="flex items-center gap-3 text-sm font-black text-blue-100 uppercase tracking-wider">
                                    <div className="h-2 w-2 rounded-full bg-blue-400 shadow-[0_0_10px_#60a5fa]"></div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="bg-black/40 backdrop-blur-md rounded-[2rem] border border-white/5 p-8">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-2">
                                <Code size={18} className="text-blue-400" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Head Installation Pixel</span>
                            </div>
                            <button
                                onClick={copySnippet}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${copied ? 'bg-green-500 text-white' : 'bg-white/10 hover:bg-white/20 text-blue-100'}`}
                            >
                                {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                                <span className="text-[10px] font-black uppercase tracking-widest">{copied ? 'Copied' : 'Copy Snippet'}</span>
                            </button>
                        </div>
                        <pre className="text-[11px] font-mono leading-relaxed text-blue-100/80 overflow-x-auto p-4 bg-black/20 rounded-xl border border-white/5 no-scrollbar">
                            {`<!-- NHFG Tracking Pixel -->
<script>
  (function(n,h,f,g){
    var s=n.createElement('script');
    s.src='${window.location.origin}/analytics.js';
    s.async=true;
    n.head.appendChild(s);
  })(document);
</script>`}
                        </pre>
                        <p className="mt-6 text-[10px] text-blue-400/50 font-medium flex items-center gap-2">
                            <ShieldAlert size={12} /> Place this code immediately before the closing <code>&lt;/head&gt;</code> tag.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAnalytics;
