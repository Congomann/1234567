import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { Lead, LeadStatus, UserRole, ProductType, ApplicationStatus } from '../../types';
import { Filter, Search, X, Eye, ChevronDown, Edit2, Save, Globe, CheckSquare, Square, Trash2, CheckCircle2, AlertTriangle, Clock, Info, UserCheck, Archive, History, FileText, MousePointer2, ExternalLink, Download, MessageSquare, MoreVertical, Plus, Send, Shield, Sparkles, Star, Tag, Activity, Briefcase, Building2, Calendar, Mail, MapPin, Phone, User as UserIcon, ChevronLeft, ChevronRight, Wrench, Hammer, TrendingUp, Home, Landmark } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { PDFBrandingService } from '../../services/pdfBrandingService';
import { Link } from 'react-router-dom';
import { AnalyticsService } from '../../services/analyticsService';
import { Backend } from '../../services/apiBackend';
import { Tab3DBanner } from '../../components/shared/Tab3DBanner';

interface DetailRowProps {
    label: string;
    value: any;
    isEditing: boolean;
    onChange: (val: any) => void;
    type?: string;
}

const DetailRow: React.FC<DetailRowProps> = ({ label, value, isEditing, onChange, type = "text" }) => {
    if (!isEditing) {
        return (
            <div className="mb-4">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</span>
                <span className="text-slate-900 font-medium text-base">{value || <span className="text-slate-300 italic">Not provided</span>}</span>
            </div>
        );
    }
    return (
        <div className="mb-4">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{label}</label>
            <input
                type={type}
                className="w-full bg-white text-slate-900 border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-[#0A62A7] focus:border-transparent outline-none"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
};

const PriorityBadge = ({ priority }: { priority?: string }) => {
    switch (priority) {
        case 'High':
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter bg-red-100 text-red-600 border border-red-200">
                    <AlertTriangle size={10} /> High
                </span>
            );
        case 'Medium':
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter bg-orange-100 text-orange-600 border border-orange-200">
                    <Clock size={10} /> Medium
                </span>
            );
        default:
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter bg-blue-100 text-blue-600 border border-blue-200">
                    <Info size={10} /> Low
                </span>
            );
    }
};

export const Leads: React.FC = () => {
    const { leads, updateLeadStatus, updateLead, user, allUsers, interactions, logInteraction, fetchInteractions, documents, saveDoc, companySettings } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('All');
    const [sourceFilter, setSourceFilter] = useState<string>('All');
    const [assignedFilter, setAssignedFilter] = useState<string>('All');
    const [showArchived, setShowArchived] = useState(false);
    const [viewingLead, setViewingLead] = useState<Lead | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<Partial<Lead>>({});
    const [interactionForm, setInteractionForm] = useState({ content: '', type: 'Note' as any });
    const [isSubmittingInteraction, setIsSubmittingInteraction] = useState(false);

    const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(new Set());
    const [showBulkSuccess, setShowBulkSuccess] = useState(false);
    const [sortConfig, setSortConfig] = useState<{ key: keyof Lead, direction: 'asc' | 'desc' } | null>(null);
    const [activeTab, setActiveTab] = useState<'profile' | 'history' | 'timeline' | 'underwriting' | 'vault'>('profile');
    const [browseHistory, setBrowseHistory] = useState<any[]>([]);
    const [loadingContext, setLoadingContext] = useState(false);

    const isAdvisor = user?.role === UserRole.ADVISOR;
    const isAdminOrManager = user?.role === UserRole.ADMIN || user?.role === UserRole.MANAGER || user?.role === UserRole.SUB_ADMIN;

    const advisorsList = useMemo(() => allUsers.filter(u => u.role === UserRole.ADVISOR), [allUsers]);

    const uniqueSources = useMemo(() => {
        const sources = new Set<string>();
        leads.forEach(l => { if (l.source) sources.add(l.source); });
        return Array.from(sources).sort();
    }, [leads]);

    const handleSort = (key: keyof Lead) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const filteredLeads = useMemo(() => {
        let list = [...leads];
        list = list.filter(l => showArchived ? l.isArchived : !l.isArchived);
        if (isAdvisor && user) list = list.filter(l => l.assignedTo === user.id || !l.assignedTo);
        if (statusFilter !== 'All') list = list.filter(l => l.status === statusFilter);
        if (sourceFilter !== 'All') list = list.filter(l => l.source === sourceFilter);
        if (assignedFilter !== 'All') {
            if (assignedFilter === 'Unassigned') list = list.filter(l => !l.assignedTo);
            else list = list.filter(l => l.assignedTo === assignedFilter);
        }
        if (searchTerm) {
            const q = searchTerm.toLowerCase();
            list = list.filter(l => l.name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q) || l.interest.toLowerCase().includes(q));
        }
        return list.sort((a, b) => {
            if (sortConfig) {
                const aValue = a[sortConfig.key] ?? '';
                const bValue = b[sortConfig.key] ?? '';

                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            }

            const priorityScore: any = { 'High': 3, 'Medium': 2, 'Low': 1 };
            const scoreA = priorityScore[a.priority || 'Low'];
            const scoreB = priorityScore[b.priority || 'Low'];
            if (scoreA !== scoreB) return scoreB - scoreA;
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
    }, [leads, user, isAdvisor, statusFilter, sourceFilter, assignedFilter, searchTerm, showArchived, sortConfig]);

    const toggleSelectAll = () => {
        if (selectedLeadIds.size === filteredLeads.length && filteredLeads.length > 0) setSelectedLeadIds(new Set());
        else setSelectedLeadIds(new Set(filteredLeads.map(l => l.id)));
    };

    const toggleSelectLead = (id: string) => {
        const next = new Set(selectedLeadIds);
        if (next.has(id)) next.delete(id); else next.add(id);
        setSelectedLeadIds(next);
    };

    const handleBulkStatusUpdate = (newStatus: LeadStatus) => {
        if (selectedLeadIds.size === 0) return;
        selectedLeadIds.forEach(id => updateLeadStatus(id, newStatus));
        setSelectedLeadIds(new Set());
        setShowBulkSuccess(true);
        setTimeout(() => setShowBulkSuccess(false), 3000);
    };

    const handleOpenView = async (lead: Lead) => {
        setViewingLead(lead);
        setEditForm({ ...lead });
        setIsEditing(false);
        setActiveTab('profile');
        setBrowseHistory([]);

        if (lead.visitor_id) {
            fetchHistory(lead.visitor_id);
        }
        fetchInteractions(lead.id);
    };

    const handleAddInteraction = async () => {
        if (!viewingLead || !interactionForm.content) return;
        setIsSubmittingInteraction(true);
        try {
            await logInteraction({
                leadId: viewingLead.id,
                type: interactionForm.type,
                content: interactionForm.content,
                authorId: user?.id,
                authorName: user?.name
            });
            setInteractionForm({ content: '', type: 'Note' });
        } finally {
            setIsSubmittingInteraction(false);
        }
    };

    const generateLeadSummary = (lead: Lead) => {
        const doc = new jsPDF();
        PDFBrandingService.addHeader(doc, `Lead Profile Summary: ${lead.name}`);

        doc.setFontSize(12);
        doc.setTextColor(11, 34, 64);
        doc.setFont("helvetica", "bold");
        doc.text("Personal Information", 14, 60);

        doc.setFontSize(10);
        doc.setTextColor(71, 85, 105);
        doc.setFont("helvetica", "normal");
        doc.text(`Email: ${lead.email || 'N/A'}`, 14, 70);
        doc.text(`Phone: ${lead.phone || 'N/A'}`, 14, 77);
        doc.text(`Source: ${lead.source || 'Direct'}`, 14, 84);
        doc.text(`Created: ${new Date(lead.date).toLocaleDateString()}`, 14, 91);

        doc.setFontSize(12);
        doc.setTextColor(11, 34, 64);
        doc.setFont("helvetica", "bold");
        doc.text("Internal Assessment", 14, 110);

        doc.setFontSize(10);
        doc.setTextColor(71, 85, 105);
        doc.setFont("helvetica", "normal");
        doc.text(`Status: ${lead.status}`, 14, 120);
        doc.text(`Product Interest: ${lead.interest}`, 14, 127);
        doc.text(`Notes: ${lead.notes || 'None'}`, 14, 134, { maxWidth: 180 });

        if (browseHistory.length > 0) {
            doc.setFontSize(12);
            doc.setTextColor(11, 34, 64);
            doc.setFont("helvetica", "bold");
            doc.text("Digital Footprint (Recent Activity)", 14, 160);

            doc.setFontSize(9);
            doc.setFont("helvetica", "normal");
            browseHistory.slice(0, 5).forEach((item, idx) => {
                doc.text(`• [${new Date(item.viewed_at).toLocaleDateString()}] Viewed: ${item.title || item.path}`, 14, 170 + (idx * 7));
            });
        }

        PDFBrandingService.addFooter(doc);
        doc.save(`NHFG_Lead_${lead.name.replace(/\s+/g, '_')}.pdf`);
    };

    const fetchHistory = async (visitorId: string) => {
        setLoadingContext(true);
        try {
            const token = localStorage.getItem('nhfg_access_token');
            const res = await fetch(`/api/analytics/visitors/${visitorId}/history`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setBrowseHistory(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingContext(false);
        }
    };

    const handleDocumentUpload = () => {
        if (!viewingLead) return;
        const title = prompt('Document Title:');
        if (!title) return;
        
        saveDoc({
            title,
            leadId: viewingLead.id,
            category: 'Underwriting',
            fileType: 'application/pdf',
            fileSize: 1024 * 512,
            ownerId: user?.id || 'system'
        } as any);
    };

    const handleSaveChanges = () => {
        if (viewingLead && editForm) {
            updateLead(viewingLead.id, editForm);
            setViewingLead(prev => prev ? ({ ...prev, ...editForm } as Lead) : null);
            setIsEditing(false);
        }
    };


    const getStatusColor = (status: string) => {
        const colors: any = {
            [LeadStatus.NEW]: 'bg-blue-100 text-blue-800',
            [LeadStatus.CONTACTED]: 'bg-yellow-100 text-yellow-800',
            [LeadStatus.UNAVAILABLE]: 'bg-orange-100 text-orange-800',
            [LeadStatus.PROPOSAL]: 'bg-purple-100 text-purple-800',
            [LeadStatus.APPROVED]: 'bg-green-100 text-green-800',
            [LeadStatus.CLOSED]: 'bg-gray-100 text-gray-800',
            [LeadStatus.LOST]: 'bg-red-100 text-red-700',
            [LeadStatus.ASSIGNED]: 'bg-indigo-100 text-indigo-800',
        };
        return colors[status] || 'bg-slate-100 text-slate-700 border border-slate-200';
    };

    const leadStatuses = companySettings.leadStatuses || Object.values(LeadStatus);

    return (
        <div className="space-y-8 relative">
            <Tab3DBanner
                cards={[
                    { title: "Total Lead Intake", value: `${leads.length || 3420} Prospects`, subtitle: "Real-Time Ingestion", emoji: "👥", gradient: "cyan", linkText: "All Leads", linkPath: "#all_leads" },
                    { title: "AI Qualified Tiers", value: "842 Warm Leads", subtitle: "SignalWire AI Score > 75", emoji: "🔥", gradient: "yellow" },
                    { title: "Conversion Speed", value: "4.2 Days Avg", subtitle: "Lead to Proposal Velocity", emoji: "⚡", gradient: "pink" }
                ]}
            />
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{showArchived ? 'Archived Leads' : 'Leads Database'}</h1>
                    <p className="text-slate-500 mt-1 font-medium">{showArchived ? 'Viewing inactive or lost leads older than 15 days.' : 'Capture insights, manage follow-ups, and log legal requests.'}</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => setShowArchived(!showArchived)} className={`flex items-center gap-2 px-6 py-4 rounded-full text-sm font-bold transition-all border ${showArchived ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 shadow-sm'}`}><Archive size={16} /> {showArchived ? 'Show Active' : 'Show Archived'}</button>
                    <Link to="/crm/intake" className="bg-[#0A62A7] text-white px-8 py-4 rounded-full text-sm font-bold shadow-xl hover:bg-blue-700 transition-all">+ New Lead</Link>
                </div>
            </div>

            {/* CRM Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">New Leads</p>
                    <div className="text-3xl font-black text-blue-600">{filteredLeads.filter(l => l.status === LeadStatus.NEW).length}</div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Scheduled Calls</p>
                    <div className="text-3xl font-black text-indigo-600">{filteredLeads.filter(l => l.status === LeadStatus.ASSIGNED || l.status === LeadStatus.PROPOSAL).length}</div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Completed Calls</p>
                    <div className="text-3xl font-black text-green-600">{filteredLeads.filter(l => l.status === LeadStatus.APPROVED || l.status === LeadStatus.CLOSED).length}</div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Follow Ups</p>
                    <div className="text-3xl font-black text-yellow-600">{filteredLeads.filter(l => l.status === LeadStatus.CONTACTED).length}</div>
                </div>
            </div>

            {showBulkSuccess && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce-subtle">
                    <CheckCircle2 className="h-6 w-6" />
                    <span className="font-bold">Bulk update successful! Leads processed.</span>
                </div>
            )}

            <div className="bg-white p-5 rounded-[2.5rem] shadow-sm border border-slate-200 flex flex-col xl:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input type="text" placeholder="Filter by name, email, or interest..." className="w-full pl-12 pr-6 py-4 bg-white text-slate-900 border border-slate-200 rounded-[2rem] text-sm font-medium focus:ring-2 focus:ring-[#0A62A7] outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <div className="flex flex-wrap gap-3 w-full xl:w-auto">
                    <div className="relative min-w-[150px] flex-1">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                        <select className="w-full bg-white text-slate-900 border border-slate-200 rounded-[2rem] pl-10 pr-10 py-4 text-sm font-bold focus:ring-2 focus:ring-[#0A62A7] cursor-pointer appearance-none shadow-sm" value={sourceFilter} onChange={e => setSourceFilter(e.target.value)}>
                            <option value="All">All Sources</option>
                            {uniqueSources.map(src => <option key={src} value={src}>{src}</option>)}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    </div>
                    {isAdminOrManager && (
                        <div className="relative min-w-[180px] flex-1">
                            <UserCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                            <select className="w-full bg-white text-slate-900 border border-slate-200 rounded-[2rem] pl-10 pr-10 py-4 text-sm font-bold focus:ring-2 focus:ring-[#0A62A7] cursor-pointer appearance-none shadow-sm" value={assignedFilter} onChange={e => setAssignedFilter(e.target.value)}>
                                <option value="All">All Advisors</option>
                                <option value="Unassigned">Unassigned</option>
                                {advisorsList.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                        </div>
                    )}
                    <div className="relative min-w-[150px] flex-1">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                        <select className="w-full bg-white text-slate-900 border border-slate-200 rounded-[2rem] pl-10 pr-10 py-4 text-sm font-bold focus:ring-2 focus:ring-[#0A62A7] cursor-pointer appearance-none shadow-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                            <option value="All">All Status</option>
                            {leadStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            {selectedLeadIds.size > 0 && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-40 bg-[#0B2240] text-white px-8 py-5 rounded-[2.5rem] shadow-2xl border border-white/10 flex items-center gap-8 animate-slide-up">
                    <div className="flex items-center gap-2">
                        <span className="bg-blue-600 h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-black">{selectedLeadIds.size}</span>
                        <span className="text-xs font-black uppercase tracking-widest text-blue-100">Leads Selected</span>
                    </div>
                    <div className="h-8 w-px bg-white/10"></div>
                    <div className="flex gap-2">
                        <button onClick={() => handleBulkStatusUpdate(LeadStatus.CONTACTED)} className="px-5 py-2 bg-yellow-500 text-[#0B2240] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-yellow-400 transition-all">Mark Contacted</button>
                        <button onClick={() => handleBulkStatusUpdate(LeadStatus.CLOSED)} className="px-5 py-2 bg-green-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-500 transition-all">Mark Closed</button>
                        <button onClick={() => handleBulkStatusUpdate(LeadStatus.LOST)} className="px-5 py-2 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 transition-all">Mark Lost</button>
                        <button onClick={() => setSelectedLeadIds(new Set())} className="p-2 text-slate-400 hover:text-white transition-all"><X size={18} /></button>
                    </div>
                </div>
            )}

            <div id="all_leads" className="bg-white shadow-sm border border-slate-200 rounded-[3rem] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-8 py-6 text-left">
                                    <button onClick={toggleSelectAll} className="p-1 rounded hover:bg-slate-200 transition-colors">{selectedLeadIds.size === filteredLeads.length && filteredLeads.length > 0 ? <CheckSquare className="h-5 w-5 text-blue-600" /> : <Square className="h-5 w-5 text-slate-300" />}</button>
                                </th>
                                <th className="px-8 py-6 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Lead Profile</th>
                                <th className="px-8 py-6 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Interest</th>
                                <th className="px-8 py-6 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Priority</th>
                                <th className="px-8 py-6 text-left text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('score')}>
                                    Score {sortConfig?.key === 'score' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                                </th>
                                <th className="px-8 py-6 text-left text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('source')}>
                                    Source {sortConfig?.key === 'source' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                                </th>
                                <th className="px-8 py-6 text-left text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('lastContactDate')}>
                                    Last Contact {sortConfig?.key === 'lastContactDate' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                                </th>
                                <th className="px-8 py-6 text-left text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('potentialValue')}>
                                    Potential Value {sortConfig?.key === 'potentialValue' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                                </th>
                                <th className="px-8 py-6 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-8 py-6 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {filteredLeads.map((lead) => (
                                <tr key={lead.id} className={`hover:bg-slate-50/50 transition-colors ${selectedLeadIds.has(lead.id) ? 'bg-blue-50/50' : ''}`}>
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <button onClick={() => toggleSelectLead(lead.id)} className="p-1 rounded hover:bg-white transition-colors">{selectedLeadIds.has(lead.id) ? <CheckSquare className="h-5 w-5 text-blue-600" /> : <Square className="h-5 w-5 text-slate-200" />}</button>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 bg-[#0B2240] rounded-full flex items-center justify-center text-white font-bold border border-slate-200">{lead.name.charAt(0)}</div>
                                            <div className="ml-4">
                                                <div className="text-sm font-bold text-slate-900">{lead.name}</div>
                                                <div className="text-xs text-slate-400 font-medium">{lead.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap"><span className="text-xs font-bold text-slate-700 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">{lead.interest}</span></td>
                                    <td className="px-8 py-6 whitespace-nowrap"><PriorityBadge priority={lead.priority} /></td>
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="relative h-10 w-10 flex items-center justify-center">
                                                <svg className="h-10 w-10 -rotate-90">
                                                    <circle className="text-slate-100" strokeWidth="3" stroke="currentColor" fill="transparent" r="16" cx="20" cy="20" />
                                                    <circle 
                                                        className={lead.score > 75 ? 'text-blue-500' : lead.score > 40 ? 'text-amber-500' : 'text-slate-400'} 
                                                        strokeWidth="3" 
                                                        strokeDasharray={100} 
                                                        strokeDashoffset={100 - lead.score} 
                                                        strokeLinecap="round" 
                                                        stroke="currentColor" 
                                                        fill="transparent" 
                                                        r="16" cx="20" cy="20" 
                                                    />
                                                </svg>
                                                <span className="absolute text-[10px] font-black text-slate-900">{lead.score}</span>
                                            </div>
                                            <span className={`text-[9px] font-black uppercase tracking-tighter ${lead.score > 75 ? 'text-blue-600' : 'text-slate-400'}`}>
                                                {lead.qualification}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black text-blue-600 uppercase tracking-tighter">{lead.source || 'Direct'}</span>
                                            <span className="text-[10px] text-slate-400 font-bold">{new Date(lead.date).toLocaleDateString()}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <span className="text-xs text-slate-500 font-medium">{lead.lastContactDate ? new Date(lead.lastContactDate).toLocaleDateString() : 'Never'}</span>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <span className="text-xs font-bold text-slate-900">{lead.potentialValue ? `$${lead.potentialValue.toLocaleString()}` : '-'}</span>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <div className="relative">
                                            <select 
                                                className={`text-xs font-bold border-none rounded-full px-4 py-2 cursor-pointer appearance-none pr-8 ${getStatusColor(lead.status)}`} 
                                                value={lead.status} 
                                                onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                                            >
                                                {leadStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 pointer-events-none opacity-50" />
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => handleOpenView(lead)} className="inline-flex items-center px-4 py-2 border border-slate-200 bg-white text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm">
                                                <Eye className="h-3.5 w-3.5 mr-1.5" /> Profile
                                            </button>
                                            <Link to="/crm/telephony" className="p-2.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all border border-blue-200" title="SignalWire Call & AI Qualify">
                                                <Phone className="h-3.5 w-3.5" />
                                            </Link>
                                            <Link to="/crm/bank-verification" className="p-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-xl transition-all border border-emerald-200" title="Plaid Instant ACH Verification">
                                                <Landmark className="h-3.5 w-3.5" />
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {viewingLead && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B2240]/70 backdrop-blur-md p-6 animate-fade-in">
                    <div className="bg-white rounded-[3.5rem] shadow-2xl w-full max-w-5xl p-10 relative max-h-[90vh] overflow-y-auto border border-white/20">
                        <div className="flex justify-between items-center mb-10">
                            <div className="flex items-center gap-5">
                                <div className="p-4 bg-blue-50 text-blue-600 rounded-3xl">
                                    <Eye size={32} />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-[#0B2240]">Lead Detail Hub</h2>
                                    <p className="text-slate-500 text-sm font-medium">{viewingLead.name} • {viewingLead.interest}</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => { setViewingLead(null); setIsEditing(false); }} className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-all"><X className="h-5 w-5" /></button>
                            </div>
                        </div>

                        <div className="flex gap-4 mb-8 border-b border-slate-100 pb-2">
                            <button onClick={() => setActiveTab('profile')} className={`pb-4 px-2 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === 'profile' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
                                Lead Profile
                                {activeTab === 'profile' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-full"></div>}
                            </button>
                            <button onClick={() => setActiveTab('history')} className={`pb-4 px-2 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === 'history' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
                                Browse Identity
                                {viewingLead?.visitor_id && <span className="ml-2 h-2 w-2 bg-green-500 rounded-full inline-block animate-pulse"></span>}
                                {activeTab === 'history' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-full"></div>}
                            </button>
                            <button onClick={() => setActiveTab('timeline')} className={`pb-4 px-2 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === 'timeline' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
                                Activity Log
                                {activeTab === 'timeline' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-full"></div>}
                            </button>
                            <button onClick={() => setActiveTab('underwriting')} className={`pb-4 px-2 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === 'underwriting' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
                                Underwriting
                                {activeTab === 'underwriting' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-full"></div>}
                            </button>
                            <button onClick={() => setActiveTab('vault')} className={`pb-4 px-2 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === 'vault' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
                                Document Vault
                                {activeTab === 'vault' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-full"></div>}
                            </button>
                        </div>

                        {activeTab === 'profile' && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
                                <div className="lg:col-span-1 space-y-6">
                                    <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Core Demographics</h3>
                                        <DetailRow label="Full Name" value={editForm.name} isEditing={isEditing} onChange={(v) => setEditForm({ ...editForm, name: v })} />
                                        <DetailRow label="Email" value={editForm.email} isEditing={isEditing} onChange={(v) => setEditForm({ ...editForm, email: v })} />
                                        <DetailRow label="Phone" value={editForm.phone} isEditing={isEditing} onChange={(v) => setEditForm({ ...editForm, phone: v })} />
                                        <DetailRow label="Potential Value ($)" value={editForm.potentialValue} type="number" isEditing={isEditing} onChange={(v) => setEditForm({ ...editForm, potentialValue: Number(v) })} />
                                        <DetailRow label="Last Contact Date" value={editForm.lastContactDate ? new Date(editForm.lastContactDate).toISOString().split('T')[0] : ''} type="date" isEditing={isEditing} onChange={(v) => setEditForm({ ...editForm, lastContactDate: v ? new Date(v).toISOString() : undefined })} />
                                        <div className="pt-4 border-t border-slate-200">
                                            <span className="block text-xs font-bold text-slate-400 uppercase mb-2">Priority Level</span>
                                            <select className={`w-full p-2 rounded-xl border border-slate-200 font-bold text-xs ${editForm.priority === 'High' ? 'bg-red-100 text-red-700' : editForm.priority === 'Medium' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`} value={editForm.priority || 'Low'} onChange={(e) => setEditForm({ ...editForm, priority: e.target.value as any })} disabled={!isEditing}>
                                                <option value="High">High Priority</option>
                                                <option value="Medium">Medium Priority</option>
                                                <option value="Low">Low Priority</option>
                                            </select>
                                        </div>
                                    </div>
                                    
                                    {viewingLead.customDetails?.homeRepairDetails && (
                                        <div className="bg-orange-50 p-8 rounded-[2.5rem] border border-orange-100 shadow-sm relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                                <Wrench size={48} className="text-orange-500" />
                                            </div>
                                            <h3 className="text-xs font-black text-orange-600 uppercase tracking-[0.2em] mb-6 flex items-center gap-2"><Hammer size={14} /> DSM Property Solutions Details</h3>
                                            
                                            <div className="space-y-4 relative z-10">
                                                <div>
                                                    <span className="block text-[10px] font-bold text-orange-400 uppercase tracking-wider mb-1">Service Address</span>
                                                    <span className="text-slate-900 font-bold text-sm">{viewingLead.customDetails.homeRepairDetails.address}</span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <span className="block text-[10px] font-bold text-orange-400 uppercase tracking-wider mb-1">Property Type</span>
                                                        <span className="text-slate-900 font-bold text-sm">{viewingLead.customDetails.homeRepairDetails.propertyType}</span>
                                                    </div>
                                                    <div>
                                                        <span className="block text-[10px] font-bold text-orange-400 uppercase tracking-wider mb-1">Evaluation Time</span>
                                                        <span className="text-slate-900 font-bold text-sm">{viewingLead.customDetails.homeRepairDetails.evaluationTime}</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="block text-[10px] font-bold text-orange-400 uppercase tracking-wider mb-1">Issue Description</span>
                                                    <span className="text-slate-900 font-medium text-sm whitespace-pre-wrap">{viewingLead.customDetails.homeRepairDetails.issueDescription}</span>
                                                </div>
                                                {viewingLead.customDetails.homeRepairDetails.isEmergency && (
                                                    <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-full text-xs font-black uppercase tracking-wider border border-red-200">
                                                        <AlertTriangle size={14} /> Emergency Request
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {viewingLead.customDetails?.realEstateDetails && (
                                        <div className="bg-amber-50 p-8 rounded-[2.5rem] border border-amber-100 shadow-sm relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                                <Home size={48} className="text-amber-500" />
                                            </div>
                                            <h3 className="text-xs font-black text-amber-600 uppercase tracking-[0.2em] mb-6 flex items-center gap-2"> Real Estate Intelligence</h3>
                                            
                                            <div className="space-y-4 relative z-10">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <span className="block text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-1">Objective</span>
                                                        <span className="text-slate-900 font-bold text-sm">{viewingLead.customDetails.realEstateDetails.intent}</span>
                                                    </div>
                                                    <div>
                                                        <span className="block text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-1">Timeline</span>
                                                        <span className="text-slate-900 font-bold text-sm">{viewingLead.customDetails.realEstateDetails.timeline}</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="block text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-1">Property Type</span>
                                                    <span className="text-slate-900 font-bold text-sm">{viewingLead.customDetails.realEstateDetails.propertyType}</span>
                                                </div>
                                                <div>
                                                    <span className="block text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-1">Budget Range</span>
                                                    <span className="text-slate-900 font-black text-lg">{viewingLead.customDetails.realEstateDetails.budget || 'Not specified'}</span>
                                                </div>
                                                
                                                {(viewingLead.customDetails.realEstateDetails.timeline === 'ASAP' && (viewingLead.customDetails.realEstateDetails.budget?.includes('M') || viewingLead.customDetails.realEstateDetails.budget?.includes('500k'))) && (
                                                    <div className="mt-4 flex items-center gap-2 px-4 py-2 bg-[#0B2240] text-amber-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-500/20 shadow-xl">
                                                        <Sparkles size={12} /> Autonomous Priority Detected
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {viewingLead.customDetails?.securitiesDetails && (
                                        <div className="bg-blue-50 p-8 rounded-[2.5rem] border border-blue-100 shadow-sm relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                                <TrendingUp size={48} className="text-blue-500" />
                                            </div>
                                            <h3 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] mb-6 flex items-center gap-2"> Securities & Wealth Profile</h3>
                                            
                                            <div className="space-y-4 relative z-10">
                                                <div>
                                                    <span className="block text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1">Desired Service</span>
                                                    <span className="text-slate-900 font-bold text-sm">{viewingLead.customDetails.securitiesDetails.serviceType}</span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <span className="block text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1">Risk Profile</span>
                                                        <span className={`text-xs font-black uppercase px-3 py-1 rounded-full ${
                                                            viewingLead.customDetails.securitiesDetails.riskTolerance === 'High' ? 'bg-red-100 text-red-600' :
                                                            viewingLead.customDetails.securitiesDetails.riskTolerance === 'Moderate' ? 'bg-blue-100 text-blue-600' :
                                                            'bg-green-100 text-green-600'
                                                        }`}>
                                                            {viewingLead.customDetails.securitiesDetails.riskTolerance}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="block text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1">Assets Range</span>
                                                        <span className="text-slate-900 font-black text-sm">{viewingLead.customDetails.securitiesDetails.investableAssets}</span>
                                                    </div>
                                                </div>
                                                
                                                {(viewingLead.customDetails.securitiesDetails.investableAssets?.includes('M') || viewingLead.customDetails.securitiesDetails.investableAssets?.includes('5M')) && (
                                                    <div className="mt-4 flex items-center gap-2 px-4 py-2 bg-[#0B2240] text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-500/20 shadow-xl">
                                                        <Shield size={12} /> High-Net-Worth Individual
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className="bg-[#0B2240] p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                            <Sparkles size={48} />
                                        </div>
                                        <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-4">Neural Lead Score: {viewingLead.score}</h3>
                                        <div className="w-full bg-white/10 rounded-full h-2 mb-6">
                                            <div className="bg-gradient-to-r from-blue-400 to-emerald-400 h-2 rounded-full transition-all duration-1000" style={{ width: `${viewingLead.score}%` }}></div>
                                        </div>
                                        <div className="space-y-4">
                                            <p className="text-xs text-blue-100 font-medium leading-relaxed italic">
                                                {viewingLead.score > 80 ? "Strategic Priority: High conversion probability detected based on source quality and data completeness." : 
                                                 viewingLead.score > 50 ? "Developmental Lead: Moderate intent profiles found. Scheduled follow-up recommended." : 
                                                 "Cold Node: Minimal initial engagement signals. Place in long-term nurture sequence."}
                                            </p>
                                            <div className="pt-4 border-t border-white/10">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Activity size={14} className="text-emerald-400" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Automated Chain Active</span>
                                                </div>
                                                <p className="text-[10px] text-white/40 leading-tight">
                                                    Task generation enabled. Follow-ups will be auto-triggered on "Contacted" status change.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="lg:col-span-2 space-y-6">
                                    <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">Administrative Summary</h3>
                                        </div>
                                        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl border border-slate-100 text-slate-700 text-sm leading-relaxed font-medium min-h-[150px] whitespace-pre-wrap">
                                            {viewingLead.notes ? viewingLead.notes : (
                                                <div className="text-center py-10">
                                                    <p className="text-slate-400 italic">No notes or interaction recorded yet. Unlock edit mode to add details.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Administrative History</h3>
                                        </div>
                                        <textarea className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-6 text-sm font-medium focus:ring-2 focus:ring-[#0A62A7] outline-none resize-none text-slate-900" rows={6} placeholder="Add interaction history or legal DNC requests..." value={editForm.notes || ''} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} readOnly={!isEditing} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'history' && (
                            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl min-h-[400px] animate-fade-in">
                                {!viewingLead?.visitor_id ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-center">
                                        <div className="p-6 bg-slate-50 text-slate-300 rounded-full mb-4">
                                            <History size={48} />
                                        </div>
                                        <h4 className="text-lg font-black text-slate-800">No Intelligence Node Found</h4>
                                        <p className="text-slate-500 max-w-xs mx-auto mt-2 font-medium">This lead was entered manually or before the tracking pixel was deployed.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-lg font-black text-[#0B2240] tracking-tight flex items-center gap-3">
                                                <MousePointer2 className="text-blue-500" /> Pre-Capture Browse Intent
                                            </h3>
                                            <span className="bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">
                                                Linked ID: {viewingLead.visitor_id.substring(0, 12)}...
                                            </span>
                                        </div>

                                        <div className="border border-slate-100 rounded-[2rem] overflow-hidden">
                                            <table className="w-full text-left">
                                                <thead className="bg-slate-50">
                                                    <tr>
                                                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Route / Page Title</th>
                                                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Timestamp</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-50">
                                                    {browseHistory.map((hit, i) => (
                                                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                                            <td className="px-8 py-4">
                                                                <p className="text-xs font-black text-slate-700">{hit.title || 'Untitled Page'}</p>
                                                                <p className="text-[10px] text-blue-500 font-mono mt-1">{hit.path}</p>
                                                            </td>
                                                            <td className="px-8 py-4 text-right">
                                                                <p className="text-xs font-bold text-slate-500">{new Date(hit.viewed_at).toLocaleString()}</p>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {browseHistory.length === 0 && (
                                                        <tr>
                                                            <td colSpan={2} className="px-8 py-10 text-center text-slate-400 italic">No page views recorded for this identity.</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'timeline' && (
                            <div className="space-y-8 animate-fade-in">
                                <div className="bg-slate-50 p-8 rounded-[3rem] border border-slate-100">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Log New Interaction</h3>
                                    <div className="flex gap-4 mb-4">
                                        {(['Call', 'Email', 'Meeting', 'Note', 'SMS'] as const).map(type => (
                                            <button 
                                                key={type} 
                                                onClick={() => setInteractionForm({ ...interactionForm, type })} 
                                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${interactionForm.type === type ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="relative">
                                        <textarea 
                                            className="w-full bg-white border border-slate-200 rounded-[2rem] p-6 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none min-h-[120px]" 
                                            placeholder={`Summarize the ${interactionForm.type.toLowerCase()}...`}
                                            value={interactionForm.content}
                                            onChange={e => setInteractionForm({ ...interactionForm, content: e.target.value })}
                                        />
                                        <button 
                                            onClick={handleAddInteraction}
                                            disabled={isSubmittingInteraction || !interactionForm.content}
                                            className="absolute bottom-4 right-4 bg-blue-600 text-white px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-blue-700 transition-all disabled:opacity-50"
                                        >
                                            {isSubmittingInteraction ? 'Logging...' : 'Log Activity'}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-4">Historical Timeline</h3>
                                    <div className="bg-white/50 backdrop-blur-sm border border-slate-100 rounded-[3rem] overflow-hidden">
                                        {interactions.length === 0 ? (
                                            <div className="p-20 text-center text-slate-400 italic">No interactions logged yet for this lead.</div>
                                        ) : (
                                            <div className="divide-y divide-slate-50">
                                                {interactions.map((event, i) => (
                                                    <div key={i} className="p-8 hover:bg-slate-50/50 transition-colors flex gap-6">
                                                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${
                                                            event.type === 'Call' ? 'bg-green-100 text-green-600' :
                                                            event.type === 'Email' ? 'bg-blue-100 text-blue-600' :
                                                            event.type === 'Meeting' ? 'bg-purple-100 text-purple-600' :
                                                            'bg-slate-100 text-slate-600'
                                                        }`}>
                                                            {event.type === 'Call' ? <Phone size={20} /> :
                                                             event.type === 'Email' ? <Mail size={20} /> :
                                                             event.type === 'Meeting' ? <Calendar size={20} /> :
                                                             <MessageSquare size={20} />}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <div>
                                                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">{event.type}</span>
                                                                    <h4 className="text-xs font-bold text-slate-900 mt-0.5">{event.authorName}</h4>
                                                                </div>
                                                                <span className="text-[10px] font-bold text-slate-400 uppercase">{new Date(event.createdAt).toLocaleString()}</span>
                                                            </div>
                                                            <p className="text-sm text-slate-600 leading-relaxed font-medium">{event.content}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'underwriting' && viewingLead && (
                            <div className="animate-fade-in">
                                {/* CaseChat removed */}
                            </div>
                        )}

                        {activeTab === 'vault' && (
                            <div className="bg-slate-50 p-8 rounded-[3rem] border border-slate-100 shadow-xl min-h-[400px] animate-fade-in">
                                <div className="flex justify-between items-center mb-8">
                                    <h3 className="text-lg font-black text-[#0B2240] tracking-tight flex items-center gap-3">
                                        <FileText className="text-blue-500" /> Digital Document Vault
                                    </h3>
                                    <button className="bg-white text-slate-700 border border-slate-200 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
                                        + Request Signed Doc
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {documents.filter(d => d.leadId === viewingLead.id).map((doc, i) => (
                                        <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm group hover:shadow-md transition-all">
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                                                    <FileText size={24} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-black text-slate-800 truncate">{doc.title}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{doc.category}</p>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                                                <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-green-100 text-green-700`}>
                                                    Ready
                                                </span>
                                                <button className="text-blue-500 hover:text-blue-600 p-2"><ExternalLink size={14} /></button>
                                            </div>
                                        </div>
                                    ))}

                                    <div 
                                        onClick={handleDocumentUpload}
                                        className="border-2 border-dashed border-slate-200 rounded-[2rem] p-6 flex flex-col items-center justify-center text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer group py-10"
                                    >
                                        <div className="p-4 bg-slate-100 rounded-full mb-3 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-all">
                                            <FileText size={20} />
                                        </div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Drop file to upload</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="mt-10 pt-8 border-t border-slate-100 flex justify-end gap-4">
                            {!isEditing ? (
                                <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full font-bold text-sm transition-all"><Edit2 className="h-4 w-4" /> Unlock Edit Mode</button>
                            ) : (
                                <button onClick={handleSaveChanges} className="flex items-center gap-2 px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-full font-bold text-sm shadow-lg transition-all"><Save className="h-4 w-4" /> Save Record</button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};