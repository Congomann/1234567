import React, { useState, useEffect } from 'react';
import {
    X,
    Flame,
    Zap,
    Snowflake,
    Target,
    Activity,
    Clock,
    Globe,
    Monitor,
    UserCheck,
    Tag,
    Share2,
    Check,
    RefreshCw,
    ExternalLink,
    Shield,
    TrendingUp,
    Tv,
    Search as SearchIcon,
    Layers,
    Compass
} from 'lucide-react';
import {
    AnalyticsService,
    VisitorProfileResult,
    SessionQueryResult,
    UnifiedSessionRecord,
    TargetedAdRecommendation
} from '../../services/analyticsService';

interface UserSessionProfileModalProps {
    identifier: string;
    onClose: () => void;
}

export const UserSessionProfileModal: React.FC<UserSessionProfileModalProps> = ({ identifier, onClose }) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [profile, setProfile] = useState<VisitorProfileResult | null>(null);
    const [sessions, setSessions] = useState<UnifiedSessionRecord[]>([]);
    const [activeTab, setActiveTab] = useState<'profile' | 'timeline' | 'ads'>('profile');
    const [copied, setCopied] = useState<boolean>(false);

    const loadData = async () => {
        setLoading(true);
        try {
            const [profileRes, sessionsRes] = await Promise.all([
                AnalyticsService.getProfile(identifier),
                AnalyticsService.querySessions({
                    ip: /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(identifier) ? identifier : undefined,
                    visitorId: identifier.startsWith('vis_') ? identifier : undefined,
                    user: identifier.includes('@') ? identifier : undefined,
                    leadId: identifier.startsWith('lead_') ? identifier : undefined
                })
            ]);

            setProfile(profileRes);
            if (sessionsRes.sessions && sessionsRes.sessions.length > 0) {
                setSessions(sessionsRes.sessions);
            }
        } catch (err) {
            console.error('[UserSessionProfileModal] Failed to load data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [identifier]);

    // Format duration in human-readable minutes & seconds
    const formatDuration = (seconds: number) => {
        if (!seconds || seconds <= 0) return '< 1m';
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        if (m === 0) return `${s}s`;
        return `${m}m ${s}s`;
    };

    // Copy dossier JSON summary to clipboard
    const copyDossier = () => {
        const payload = {
            target: identifier,
            profile: profile?.behavioralProfile,
            linkedLead: profile?.linkedLead,
            sessionHistoryCount: sessions.length
        };
        navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const bProfile = profile?.behavioralProfile;
    const intentScore = bProfile?.intentScore ?? 50;
    const qualification = bProfile?.qualification ?? (intentScore >= 75 ? 'Hot' : intentScore >= 40 ? 'Warm' : 'Cold');

    const getQualificationBadge = () => {
        if (qualification === 'Hot') {
            return (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-rose-500/10 to-red-500/15 text-rose-600 border border-rose-200/80 rounded-full text-[11px] font-black uppercase tracking-wider shadow-sm">
                    <Flame size={14} className="text-rose-600 animate-pulse" />
                    <span>Hot Intent (Score: {intentScore})</span>
                </div>
            );
        }
        if (qualification === 'Warm') {
            return (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-[11px] font-black uppercase tracking-wider">
                    <Zap size={14} className="text-amber-600" />
                    <span>Warm Intent (Score: {intentScore})</span>
                </div>
            );
        }
        return (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-[11px] font-black uppercase tracking-wider">
                <Snowflake size={14} className="text-blue-500" />
                <span>Cold Intent (Score: {intentScore})</span>
            </div>
        );
    };

    const getChannelIcon = (channel: string) => {
        const lower = channel.toLowerCase();
        if (lower.includes('meta')) return <Share2 size={16} className="text-blue-500" />;
        if (lower.includes('google')) return <SearchIcon size={16} className="text-emerald-500" />;
        if (lower.includes('tv')) return <Tv size={16} className="text-purple-500" />;
        return <Globe size={16} className="text-cyan-500" />;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B2240]/75 backdrop-blur-xl p-4 md:p-8 animate-fade-in overflow-y-auto">
            <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-5xl border border-white/40 overflow-hidden my-auto flex flex-col max-h-[92vh]">
                {/* Header Bar */}
                <div className="p-8 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 via-white to-blue-50/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-[#0B2240] text-white rounded-2xl shadow-xl shadow-blue-900/15">
                            <Activity size={24} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h2 className="text-2xl font-black text-[#0B2240] tracking-tight">Behavioral Intelligence Dossier</h2>
                                {getQualificationBadge()}
                            </div>
                            <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500 flex-wrap">
                                <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md">
                                    {identifier}
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1 font-bold text-slate-400">
                                    <Clock size={12} /> First Seen: {bProfile?.firstSeen ? new Date(bProfile.firstSeen).toLocaleDateString() : 'Recent'}
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1 font-bold text-slate-400">
                                    <Activity size={12} /> {bProfile?.totalSessions || sessions.length} Sessions ({bProfile?.totalPageViews || 0} Pages)
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                        <button
                            onClick={loadData}
                            disabled={loading}
                            className="p-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-2xl transition-all shadow-sm active:scale-95"
                            title="Refresh Data"
                        >
                            <RefreshCw size={16} className={loading ? 'animate-spin text-blue-600' : ''} />
                        </button>
                        <button
                            onClick={copyDossier}
                            className="flex items-center gap-2 px-4 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all shadow-sm"
                        >
                            {copied ? <Check size={14} className="text-emerald-500" /> : <Share2 size={14} />}
                            <span>{copied ? 'Copied JSON' : 'Export Dossier'}</span>
                        </button>
                        <button
                            onClick={onClose}
                            className="p-3 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-2xl transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Sub-Navigation Tabs */}
                <div className="flex border-b border-slate-100 px-8 bg-slate-50/50 gap-6">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`py-4 text-xs font-black uppercase tracking-widest transition-all relative ${
                            activeTab === 'profile' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <Target size={14} /> Behavioral Profile
                        </div>
                        {activeTab === 'profile' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-full" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('timeline')}
                        className={`py-4 text-xs font-black uppercase tracking-widest transition-all relative ${
                            activeTab === 'timeline' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <Clock size={14} /> 15-Min Session History ({sessions.length})
                        </div>
                        {activeTab === 'timeline' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-full" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('ads')}
                        className={`py-4 text-xs font-black uppercase tracking-widest transition-all relative ${
                            activeTab === 'ads' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <Tv size={14} /> Targeted Ad Recommendations ({bProfile?.targetedAdRecommendations?.length || 4})
                        </div>
                        {activeTab === 'ads' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-full" />}
                    </button>
                </div>

                {/* Body Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/30">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-3">
                            <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Synthesizing telemetry data...</p>
                        </div>
                    ) : (
                        <>
                            {/* Linked Lead Banner */}
                            {profile?.linkedLead ? (
                                <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-white p-6 rounded-[2rem] border border-emerald-200/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3.5 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-600/20">
                                            <UserCheck size={22} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-base font-black text-slate-900">{profile.linkedLead.name}</h4>
                                                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[9px] font-black uppercase tracking-wider">
                                                    Matched CRM Lead
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-0.5 font-medium">
                                                {profile.linkedLead.email} • {profile.linkedLead.phone} • ID: <span className="font-mono text-slate-700">{profile.linkedLead.id}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 self-end md:self-auto">
                                        <span className="px-3 py-1 bg-white border border-emerald-200 text-emerald-700 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm">
                                            Status: {profile.linkedLead.status || 'Active Qualified'}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-slate-100/70 p-5 rounded-[2rem] border border-slate-200/80 flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3 text-slate-500 text-xs">
                                        <Shield size={18} className="text-slate-400" />
                                        <span>
                                            <strong>Anonymous Telemetry:</strong> No CRM lead has submitted personal contact details matching this IP/visitor node yet.
                                        </span>
                                    </div>
                                    <span className="px-3 py-1 bg-white border border-slate-200 text-slate-500 rounded-xl text-[9px] font-black uppercase tracking-wider">
                                        Unlinked Node
                                    </span>
                                </div>
                            )}

                            {/* TAB 1: PROFILE OVERVIEW */}
                            {activeTab === 'profile' && (
                                <div className="space-y-8">
                                    {/* Intent Gauge & Category Affinity Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                                        {/* Intent Gauge Card */}
                                        <div className="md:col-span-5 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-6 opacity-5">
                                                <Target size={120} />
                                            </div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                                                Purchase Intent Score
                                            </p>
                                            
                                            {/* Circular Gauge */}
                                            <div className="relative w-44 h-44 flex items-center justify-center my-2">
                                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                                    <circle
                                                        cx="50"
                                                        cy="50"
                                                        r="42"
                                                        stroke="currentColor"
                                                        strokeWidth="8"
                                                        className="text-slate-100"
                                                        fill="transparent"
                                                    />
                                                    <circle
                                                        cx="50"
                                                        cy="50"
                                                        r="42"
                                                        stroke="currentColor"
                                                        strokeWidth="8"
                                                        strokeDasharray={264}
                                                        strokeDashoffset={264 - (264 * intentScore) / 100}
                                                        strokeLinecap="round"
                                                        className={`transition-all duration-1000 ${
                                                            intentScore >= 75 ? 'text-rose-500' : intentScore >= 40 ? 'text-amber-500' : 'text-blue-500'
                                                        }`}
                                                        fill="transparent"
                                                    />
                                                </svg>
                                                <div className="absolute flex flex-col items-center justify-center">
                                                    <span className="text-4xl font-black text-slate-900 font-mono tracking-tight">
                                                        {intentScore}
                                                    </span>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                        Out of 100
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="mt-4">
                                                <div className="inline-block">{getQualificationBadge()}</div>
                                                <p className="text-xs text-slate-500 mt-2 max-w-xs font-medium">
                                                    {intentScore >= 75
                                                        ? 'High-velocity decision phase: engaging with rates, calculators, or multiple quote funnels.'
                                                        : intentScore >= 40
                                                        ? 'Active evaluation phase: exploring multiple solutions with moderate repeat session frequency.'
                                                        : 'Early exploratory phase: introductory landing page visits without deep product configuration.'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Category Affinities */}
                                        <div className="md:col-span-7 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-center mb-6">
                                                    <div>
                                                        <h3 className="font-black text-sm text-slate-800 uppercase tracking-tight">
                                                            Financial Category Affinities
                                                        </h3>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                                                            Telemetry behavioral weight distribution
                                                        </p>
                                                    </div>
                                                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-xl text-[9px] font-black uppercase tracking-wider">
                                                        Primary: {bProfile?.primaryCategory || 'Life Insurance'}
                                                    </span>
                                                </div>

                                                <div className="space-y-4">
                                                    {bProfile?.categoryAffinity && Object.entries(bProfile.categoryAffinity).map(([category, score]) => {
                                                        const pct = Math.min(100, Math.max(0, score));
                                                        const label = category
                                                            .split('-')
                                                            .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                                                            .join(' ');
                                                        return (
                                                            <div key={category} className="space-y-1.5">
                                                                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                                                                    <span className="flex items-center gap-1.5">
                                                                        <span className={`w-2 h-2 rounded-full ${
                                                                            category === bProfile.primaryCategory ? 'bg-blue-600' : 'bg-slate-300'
                                                                        }`} />
                                                                        {label}
                                                                    </span>
                                                                    <span className="font-mono text-slate-500">{pct}%</span>
                                                                </div>
                                                                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                                                    <div
                                                                        className={`h-full rounded-full transition-all duration-700 ${
                                                                            category === bProfile.primaryCategory
                                                                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600'
                                                                                : 'bg-slate-300'
                                                                        }`}
                                                                        style={{ width: `${pct}%` }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Marketing Tags Bar */}
                                            <div className="pt-6 border-t border-slate-100 mt-6">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                                    <Tag size={12} /> Auto-Generated Marketing Tags
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {bProfile?.marketingTags && bProfile.marketingTags.map((tag, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[10px] font-mono font-bold transition-colors"
                                                        >
                                                            #{tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Recent Navigation Path Pills */}
                                    {bProfile?.recentPaths && bProfile.recentPaths.length > 0 && (
                                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                                            <h4 className="font-black text-xs text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                                                <Compass size={14} className="text-blue-600" />
                                                Recent Navigation Journey Flow
                                            </h4>
                                            <div className="flex flex-wrap gap-3 items-center">
                                                {bProfile.recentPaths.map((path, i) => (
                                                    <React.Fragment key={i}>
                                                        <span className="px-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-700 shadow-sm">
                                                            {path}
                                                        </span>
                                                        {i < bProfile.recentPaths.length - 1 && (
                                                            <span className="text-slate-300 font-bold">→</span>
                                                        )}
                                                    </React.Fragment>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* TAB 2: 15-MINUTE SESSION TIMELINE */}
                            {activeTab === 'timeline' && (
                                <div className="space-y-6">
                                    <div className="bg-blue-50/60 p-5 rounded-[2rem] border border-blue-200/60 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Clock size={18} className="text-blue-600" />
                                            <p className="text-xs text-blue-900 font-medium">
                                                Visits separated by less than 15 minutes of inactivity are grouped into a unified session. Gaps exceeding 15 minutes trigger a new partition.
                                            </p>
                                        </div>
                                        <span className="px-3 py-1 bg-white border border-blue-200 text-blue-700 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm">
                                            900s Sliding Engine
                                        </span>
                                    </div>

                                    {sessions.length === 0 ? (
                                        <div className="bg-white p-12 rounded-[2.5rem] border border-slate-200 text-center text-slate-400">
                                            <Clock size={40} className="mx-auto mb-3 opacity-30" />
                                            <p className="font-bold">No recorded sessions found for this identifier.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            {sessions.map((session, sIdx) => {
                                                const startedDate = new Date(session.started_at);
                                                const endedDate = session.ended_at ? new Date(session.ended_at) : new Date(session.last_activity_at);
                                                return (
                                                    <div
                                                        key={session.id || sIdx}
                                                        className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden"
                                                    >
                                                        {/* Session Card Header */}
                                                        <div className="p-6 bg-slate-50/70 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-sm">
                                                                    #{sessions.length - sIdx}
                                                                </div>
                                                                <div>
                                                                    <div className="flex items-center gap-2">
                                                                        <h4 className="font-mono text-xs font-black text-slate-800">
                                                                            {session.id}
                                                                        </h4>
                                                                        {session.is_active && (
                                                                            <span className="flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[9px] font-black uppercase tracking-wider">
                                                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                                                                                Active
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <p className="text-[11px] text-slate-400 font-bold mt-0.5">
                                                                        Started: {startedDate.toLocaleTimeString()} • Ended: {endedDate.toLocaleTimeString()} ({startedDate.toLocaleDateString()})
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-4 text-xs">
                                                                <div className="text-right">
                                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Duration</span>
                                                                    <span className="font-mono font-bold text-slate-700">
                                                                        {formatDuration(session.duration_seconds)}
                                                                    </span>
                                                                </div>
                                                                <div className="h-6 w-px bg-slate-200" />
                                                                <div className="text-right">
                                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Pages</span>
                                                                    <span className="font-mono font-bold text-blue-600">
                                                                        {session.page_count || session.pages_visited?.length || 0} visits
                                                                    </span>
                                                                </div>
                                                                {session.utm_campaign && (
                                                                    <>
                                                                        <div className="h-6 w-px bg-slate-200" />
                                                                        <div className="text-right">
                                                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Attribution</span>
                                                                            <span className="font-mono text-[11px] font-bold text-purple-600">
                                                                                {session.utm_campaign}
                                                                            </span>
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Chronological Page Sequence */}
                                                        <div className="p-6 space-y-4">
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                                                                <Layers size={12} /> Chronological Page View Flow
                                                            </p>
                                                            <div className="relative pl-6 border-l-2 border-blue-100 space-y-4 ml-3">
                                                                {session.pages_visited?.map((page, pIdx) => (
                                                                    <div key={pIdx} className="relative group">
                                                                        <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-white border-2 border-blue-600 flex items-center justify-center text-[8px] font-black text-blue-600">
                                                                            {pIdx + 1}
                                                                        </div>
                                                                        <div className="bg-slate-50 hover:bg-blue-50/50 p-4 rounded-2xl border border-slate-100 transition-colors">
                                                                            <div className="flex justify-between items-start">
                                                                                <div>
                                                                                    <h5 className="text-xs font-black text-slate-800">
                                                                                        {page.title || page.path}
                                                                                    </h5>
                                                                                    <p className="text-[11px] font-mono font-bold text-blue-600 mt-0.5">
                                                                                        {page.path}
                                                                                    </p>
                                                                                </div>
                                                                                <span className="text-[10px] font-mono text-slate-400 font-bold">
                                                                                    {new Date(page.viewed_at).toLocaleTimeString()}
                                                                                </span>
                                                                            </div>
                                                                            {page.referrer && (
                                                                                <p className="text-[10px] text-slate-400 mt-2 truncate font-medium">
                                                                                    Referrer: {page.referrer}
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* TAB 3: TARGETED AD RECOMMENDATIONS */}
                            {activeTab === 'ads' && (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="font-black text-base text-slate-800 tracking-tight">
                                                Omnichannel Ad Retargeting Recommendations
                                            </h3>
                                            <p className="text-xs text-slate-500 font-medium">
                                                Generated based on category affinity ({bProfile?.primaryCategory}) and intent score ({intentScore}/100)
                                            </p>
                                        </div>
                                        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-[10px] font-black uppercase tracking-wider">
                                            Active Ad Channels
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {bProfile?.targetedAdRecommendations?.map((ad: TargetedAdRecommendation, i: number) => (
                                            <div
                                                key={i}
                                                className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
                                            >
                                                <div>
                                                    <div className="flex justify-between items-center mb-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
                                                                {getChannelIcon(ad.channel)}
                                                            </div>
                                                            <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                                                                {ad.channel}
                                                            </span>
                                                        </div>
                                                        <span className="px-2.5 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[9px] font-black uppercase tracking-wider">
                                                            {ad.targetProduct}
                                                        </span>
                                                    </div>

                                                    <h4 className="text-sm font-black text-slate-900 leading-snug mb-2">
                                                        "{ad.suggestedHeadline}"
                                                    </h4>
                                                    <p className="text-xs text-slate-600 leading-relaxed font-medium mb-4">
                                                        {ad.creativeHook}
                                                    </p>
                                                </div>

                                                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                                                    <div className="min-w-0">
                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                                                            Target Landing Page
                                                        </span>
                                                        <span className="font-mono text-xs font-bold text-blue-600 truncate block">
                                                            {ad.recommendedLandingPage}
                                                        </span>
                                                    </div>
                                                    <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
                                                        {ad.campaignTheme}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer Bar */}
                <div className="p-6 border-t border-slate-100 bg-white flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2 text-slate-400 text-[11px] font-bold">
                        <Shield size={14} className="text-blue-500" />
                        <span>Behavioral Telemetry Protected & Compliant</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-[#0B2240] hover:bg-blue-800 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md active:scale-95"
                    >
                        Close Inspector
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserSessionProfileModal;
