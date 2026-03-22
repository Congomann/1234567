import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { AccessLog, UserRole } from '../../types';
import { 
    Shield, Search, Filter, Download, 
    ShieldAlert, ShieldCheck, Clock, User, 
    Globe, Monitor, ChevronDown, RefreshCw,
    Activity, Lock, Key, AlertTriangle
} from 'lucide-react';

export const AccessLogs: React.FC = () => {
    const { accessLogs, user, allUsers } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('All');
    const [roleFilter, setRoleFilter] = useState('All');

    // Filter logs based on user search and dropdowns
    const filteredLogs = useMemo(() => {
        return accessLogs.filter(log => {
            const logUser = allUsers.find(u => u.id === log.userId);
            const userEmail = logUser?.email || '';
            
            const matchesSearch = 
                log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.ipAddress?.includes(searchTerm);
            
            const matchesType = typeFilter === 'All' || log.action === typeFilter;
            
            const matchesRole = roleFilter === 'All' || logUser?.role === roleFilter;

            return matchesSearch && matchesType && matchesRole;
        }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [accessLogs, searchTerm, typeFilter, roleFilter, allUsers]);

    const getActionColor = (action: string) => {
        switch (action) {
            case 'LOGIN_SUCCESS': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
            case 'LOGIN_FAILURE': return 'text-red-600 bg-red-50 border-red-100';
            case 'PASSWORD_RESET': return 'text-amber-600 bg-amber-50 border-amber-100';
            case 'SENSITIVE_DATA_ACCESS': return 'text-purple-600 bg-purple-50 border-purple-100';
            default: return 'text-blue-600 bg-blue-50 border-blue-100';
        }
    };

    const getActionIcon = (action: string) => {
        switch (action) {
            case 'LOGIN_SUCCESS': return <ShieldCheck size={14} />;
            case 'LOGIN_FAILURE': return <ShieldAlert size={14} />;
            case 'PASSWORD_RESET': return <Key size={14} />;
            case 'SENSITIVE_DATA_ACCESS': return <Lock size={14} />;
            default: return <Activity size={14} />;
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-600 text-white rounded-lg shadow-lg">
                            <Shield size={20} />
                        </div>
                        <h2 className="text-sm font-black text-blue-600 uppercase tracking-[0.3em]">Security Protocol</h2>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter">System Access Logs</h1>
                    <p className="text-slate-500 mt-2 font-medium">Real-time audit trail of all administrative and advisor interactions.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm">
                        <Download size={16} /> Export Audit
                    </button>
                    <button className="flex items-center gap-2 px-6 py-3 bg-[#0B2240] text-white rounded-2xl text-sm font-bold hover:bg-blue-900 transition-all shadow-xl">
                        <RefreshCw size={16} /> Refresh logs
                    </button>
                </div>
            </div>

            {/* Security Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden relative group">
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform text-emerald-600">
                        <ShieldCheck size={120} />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Auth Events</p>
                    <div className="text-3xl font-black text-slate-900">{accessLogs.length}</div>
                    <div className="mt-4 flex items-center gap-2">
                        <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md uppercase">Normal Traffic</span>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden relative group">
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform text-red-600">
                        <ShieldAlert size={120} />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Failed Attempts</p>
                    <div className="text-3xl font-black text-slate-900">
                        {accessLogs.filter(l => l.action === 'LOGIN_FAILURE').length}
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                        <span className="text-[10px] font-black text-red-600 bg-red-50 px-2 py-1 rounded-md uppercase tracking-tighter flex items-center gap-1">
                            <AlertTriangle size={10} /> Needs Monitoring
                        </span>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden relative group">
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform text-blue-600">
                        <Globe size={120} />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Unique IP Vectors</p>
                    <div className="text-3xl font-black text-slate-900">
                        {new Set(accessLogs.map(l => l.ipAddress)).size}
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                        <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-md uppercase">Global Integrity</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-[2.5rem] shadow-sm border border-slate-200 flex flex-col lg:row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Filter by user, email, or IP address..." 
                        className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-[2rem] text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-3">
                    <div className="relative min-w-[180px]">
                        <select 
                            className="w-full bg-slate-50 border-none rounded-[2rem] pl-6 pr-10 py-4 text-xs font-black uppercase tracking-widest cursor-pointer appearance-none"
                            value={typeFilter}
                            onChange={e => setTypeFilter(e.target.value)}
                        >
                            <option value="All">All Event Types</option>
                            <option value="LOGIN_SUCCESS">Login Success</option>
                            <option value="LOGIN_FAILURE">Auth Failure</option>
                            <option value="PASSWORD_RESET">Pass Reset</option>
                            <option value="SENSITIVE_DATA_ACCESS">Data Access</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    </div>
                    <div className="relative min-w-[180px]">
                        <select 
                            className="w-full bg-slate-50 border-none rounded-[2rem] pl-6 pr-10 py-4 text-xs font-black uppercase tracking-widest cursor-pointer appearance-none"
                            value={roleFilter}
                            onChange={e => setRoleFilter(e.target.value)}
                        >
                            <option value="All">All Roles</option>
                            {Object.values(UserRole).map(role => (
                                <option key={role} value={role}>{role}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Logs Table */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">User Identity</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action Event</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Network Data</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-50/50 transition-all group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center font-black group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                {log.userName.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">{log.userName}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                                    {allUsers.find(u => u.id === log.userId)?.email || 'System Account'}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-tighter ${getActionColor(log.action)}`}>
                                            {getActionIcon(log.action)}
                                            {log.action.replace(/_/g, ' ')}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                <Globe size={12} className="text-slate-300" /> {log.ipAddress || 'Internal/VPN'}
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
                                                <Monitor size={12} className="text-slate-300" /> {log.userAgent?.split(' ')[0] || 'Browser Terminal'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2 text-slate-400">
                                            <Clock size={12} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">
                                                {new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredLogs.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center">
                                        <div className="max-w-xs mx-auto">
                                            <div className="p-4 bg-slate-50 text-slate-300 rounded-full w-fit mx-auto mb-4">
                                                <ShieldAlert size={48} />
                                            </div>
                                            <p className="text-slate-400 italic font-medium">No audit entries found matching these parameters.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
