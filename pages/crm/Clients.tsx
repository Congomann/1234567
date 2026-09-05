import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { Client, ProductType, UserRole } from '../../types';
import { Search, Filter, Download, Edit2, X, Mail, Phone, Shield, MessageSquare, Activity, ShieldCheck, Building2 } from 'lucide-react';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { PDFBrandingService } from '../../services/pdfBrandingService';
import { NormalizedPolicySection } from '../../components/crm/NormalizedPolicySection';
import { NormalizedPolicyData } from '../../services/carrier';

export const Clients: React.FC = () => {
    const { clients, updateClient, user } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [productFilter, setProductFilter] = useState<string>('All');
    const [currentTime, setCurrentTime] = useState(new Date());

    // Edit State
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [editForm, setEditForm] = useState<Partial<Client>>({});
    const [modalTab, setModalTab] = useState<'info' | 'carrier_policy' | 'chat'>('info');

    // Auto-update clock for "real-time" feel
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const filteredClients = useMemo(() => {
        let result = clients;

        if (user?.role === UserRole.ADVISOR && user.productsSold) {
            result = result.filter(c => user.productsSold!.includes(c.product));
        }

        if (productFilter !== 'All') {
            result = result.filter(c => c.product === productFilter);
        }

        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            result = result.filter(c =>
                c.name.toLowerCase().includes(lower) ||
                c.policyNumber.toLowerCase().includes(lower) ||
                (c.email && c.email.toLowerCase().includes(lower))
            );
        }

        return result;
    }, [clients, user, productFilter, searchTerm]);

    const handleEdit = (client: Client, defaultTab: 'info' | 'carrier_policy' | 'chat' = 'info') => {
        setEditingClient(client);
        setEditForm({ ...client });
        setModalTab(defaultTab);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingClient && editForm) {
            updateClient(editingClient.id, editForm);
            setEditingClient(null);
        }
    };

    const handleCarrierPolicyUpdated = (normalized: NormalizedPolicyData) => {
        if (!editingClient) return;

        const updatedPartial: Partial<Client> = {
            carrier: normalized.carrierName,
            premium: normalized.premiumAmount,
            renewalDate: normalized.duration.expirationDate || editingClient.renewalDate
        };

        setEditForm(prev => ({
            ...prev,
            ...updatedPartial
        }));

        updateClient(editingClient.id, updatedPartial);
    };

    const getStatusText = (renewalDate: string) => {
        const today = new Date();
        const renewal = new Date(renewalDate);
        const diffTime = renewal.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return 'Expired';
        if (diffDays < 30) return 'Renewing Soon';
        return 'Active';
    };

    const generatePDF = () => {
        const doc = new jsPDF({ orientation: 'landscape' });

        PDFBrandingService.addHeader(doc, "Client Portfolio Report", user?.name);

        const tableColumn = ["Client Name", "Email", "Phone", "Product", "Policy #", "Carrier", "Premium", "Status", "Renewal"];
        const tableRows: any[] = [];

        filteredClients.forEach(client => {
            const clientData = [
                client.name,
                client.email || 'N/A',
                client.phone || 'N/A',
                client.product,
                client.policyNumber,
                client.carrier || 'N/A',
                `$${client.premium.toLocaleString()}`,
                getStatusText(client.renewalDate),
                new Date(client.renewalDate).toLocaleDateString(),
            ];
            tableRows.push(clientData);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            ...PDFBrandingService.tableStyles,
            startY: 55,
        });

        PDFBrandingService.addFooter(doc);
        doc.save(`NHFG_Portfolio_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black text-[#0B2240] tracking-tight">Client Management</h1>
                    <p className="text-slate-500 font-bold mt-1 uppercase tracking-wider text-xs">Monitor policies and renewal cycles.</p>
                </div>
                <button
                    onClick={generatePDF}
                    className="bg-white border border-blue-200 text-blue-600 px-8 py-3.5 rounded-2xl font-black text-[11px] hover:bg-blue-50 shadow-xl shadow-blue-900/5 transition-all flex items-center gap-2 transform active:scale-95 uppercase tracking-[0.15em]"
                >
                    <Download className="h-4 w-4" /> Export Portfolio
                </button>
            </div>

            <div className="bg-white rounded-[3.5rem] shadow-2xl border border-slate-100 overflow-hidden min-h-[600px] flex flex-col">
                {/* Search Filters */}
                <div className="p-10 pb-4 border-b border-slate-50 flex flex-col md:flex-row gap-6">
                    <div className="relative flex-1">
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-4 pointer-events-none text-slate-300">
                            <Search className="h-5 w-5" />
                            <span className="w-px h-6 bg-slate-100"></span>
                        </div>
                        <input
                            type="text"
                            placeholder="Search by name, policy or email..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-20 pr-8 py-6 bg-slate-50 border-none rounded-[2rem] text-sm font-bold focus:ring-0 outline-none text-slate-900 shadow-inner transition-all placeholder:text-slate-300"
                        />
                    </div>
                    <div className="relative min-w-[240px]">
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-4 pointer-events-none text-slate-300">
                            <Filter className="h-5 w-5" />
                            <span className="w-px h-6 bg-slate-100"></span>
                        </div>
                        <select
                            className="w-full pl-20 pr-10 py-6 bg-slate-50 border-none rounded-[2rem] text-xs font-black uppercase tracking-widest focus:ring-0 appearance-none cursor-pointer shadow-inner text-slate-700"
                            value={productFilter}
                            onChange={e => setProductFilter(e.target.value)}
                        >
                            <option value="All">All Categories</option>
                            {Object.values(ProductType).map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                </div>

                <div className="flex-1 overflow-x-auto px-4 pb-10">
                                    <div className="space-y-4">
                    {/* Header Row of Boxes with Specific Request Colors */}
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
                        <div className="bg-[#A8DADC] p-4 rounded-t-3xl md:rounded-3xl border border-[#90C4C6] text-center shadow-sm">
                            <span className="text-[10px] font-black text-[#1D3557] uppercase tracking-[0.2em]">Client</span>
                        </div>
                        <div className="bg-blue-500 p-4 md:rounded-3xl border border-blue-600 text-center shadow-sm">
                            <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Carrier</span>
                        </div>
                        <div className="bg-indigo-500 p-4 md:rounded-3xl border border-indigo-600 text-center shadow-sm">
                            <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Policy / Quote #</span>
                        </div>
                        <div className="bg-yellow-400 p-4 md:rounded-3xl border border-yellow-500 text-center shadow-sm">
                            <span className="text-[10px] font-black text-yellow-900 uppercase tracking-[0.2em]">Est. Premium</span>
                        </div>
                        <div className="bg-slate-700 p-4 md:rounded-3xl border border-slate-800 text-center shadow-sm">
                            <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Status</span>
                        </div>
                        <div className="bg-slate-100 p-4 rounded-b-3xl md:rounded-3xl border border-slate-200 text-center shadow-sm">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</span>
                        </div>
                    </div>

                    {/* Data Rows */}
                    {filteredClients.map(client => {
                        const status = getStatusText(client.renewalDate);
                        const isActiveStatus = status === 'Active';
                        const isInactiveStatus = status === 'Expired';
                        
                        return (
                            <div key={client.id} className="grid grid-cols-1 md:grid-cols-6 gap-2 group cursor-pointer" onClick={() => handleEdit(client, 'info')}>
                                {/* Client Column */}
                                <div className="bg-[#A8DADC]/10 p-6 rounded-3xl border border-[#A8DADC]/30 flex flex-col justify-center text-center md:text-left transition-all group-hover:bg-[#A8DADC]/20">
                                    <div className="font-black text-slate-900 text-sm">{client.name}</div>
                                    <span className="text-[9px] text-[#457B9D] font-black uppercase tracking-tighter mt-1">{client.product}</span>
                                </div>
                                
                                {/* Carrier Column */}
                                <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 flex items-center justify-center transition-all group-hover:bg-blue-100/50" onClick={(e) => { e.stopPropagation(); handleEdit(client, 'carrier_policy'); }}>
                                    <div className="flex flex-col items-center gap-1">
                                        <span className="text-xs font-black text-blue-700 uppercase tracking-tight text-center">{client.carrier || 'Pending'}</span>
                                        <span className="px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[8px] font-mono font-bold">API SYNC</span>
                                    </div>
                                </div>
                                
                                {/* Policy Column */}
                                <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 flex items-center justify-center transition-all group-hover:bg-indigo-100/50">
                                    <span className="text-xs font-mono font-black text-indigo-700 tracking-wider">{client.policyNumber}</span>
                                </div>
                                
                                {/* Premium Column */}
                                <div className="bg-yellow-50 p-6 rounded-3xl border border-yellow-100 flex items-center justify-center transition-all group-hover:bg-yellow-100">
                                    <span className="text-sm font-black text-yellow-700">$\u007Bclient.premium.toLocaleString()\u007D</span>
                                </div>
                                
                                {/* Status Column */}
                                <div className={`p-6 rounded-3xl border flex items-center justify-center transition-all ${isActiveStatus ? 'bg-green-50 border-green-100 group-hover:bg-green-100' : isInactiveStatus ? 'bg-red-50 border-red-100 group-hover:bg-red-100' : 'bg-orange-50 border-orange-100 group-hover:bg-orange-100'}`}>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isActiveStatus ? 'bg-green-600 text-white shadow-sm' : isInactiveStatus ? 'bg-red-600 text-white shadow-sm' : 'bg-orange-500 text-white shadow-sm'}`}>
                                        {status}
                                    </span>
                                </div>
                                
                                {/* Actions Column */}
                                <div className="bg-slate-50/30 p-4 rounded-3xl border border-slate-100 flex items-center justify-center gap-2 transition-all group-hover:bg-white" onClick={(e) => e.stopPropagation()}>
                                    {client.email && (
                                        <a href={`mailto:\u0024\u007Bclient.email\u007D`} className="p-2.5 bg-white border border-slate-100 text-slate-400 rounded-xl hover:text-blue-500 hover:border-blue-100 transition-all shadow-sm">
                                            <Mail className="h-4 w-4" />
                                        </a>
                                    )}
                                    {client.phone && (
                                        <a href={`tel:\u0024\u007Bclient.phone\u007D`} className="p-2.5 bg-white border border-slate-100 text-slate-400 rounded-xl hover:text-blue-500 hover:border-blue-100 transition-all shadow-sm">
                                            <Phone className="h-4 w-4" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {filteredClients.length === 0 && (
                        <div className="py-32 text-center">
                            <div className="flex flex-col items-center justify-center opacity-10">
                                <Shield className="h-32 w-32 mb-6" strokeWidth={1} />
                                <h2 className="text-4xl font-black uppercase tracking-[0.4em]">Database Empty</h2>
                            </div>
                        </div>
                    )}
                </div>
                </div>

                {/* SYNC INDICATOR */}
                <div className="p-6 border-t border-slate-50 flex items-center justify-center gap-4 opacity-50">
                    <div className="flex items-center gap-2">
                        <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Terminal Synced</span>
                    </div>
                    <span className="text-slate-200">|</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{currentTime.toLocaleTimeString()}</span>
                </div>
            </div>

            {/* Edit / Details Modal */}
            {editingClient && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B2240]/70 backdrop-blur-xl p-4 md:p-6 animate-fade-in overflow-y-auto">
                    <div className={`bg-white rounded-[3.5rem] shadow-2xl w-full p-8 md:p-12 relative max-h-[92vh] overflow-y-auto border border-white/20 my-auto transition-all ${
                        modalTab === 'carrier_policy' ? 'max-w-4xl' : 'max-w-2xl'
                    }`}>
                        <div className="flex justify-between items-center mb-8">
                            <div className="flex items-center gap-5">
                                <div className="p-5 bg-blue-600 text-white rounded-[1.5rem] shadow-xl shadow-blue-600/20">
                                    <Edit2 className="h-8 w-8" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-[#0B2240] tracking-tight">
                                        {modalTab === 'carrier_policy'
                                            ? 'Carrier API Policy Integration'
                                            : modalTab === 'chat'
                                            ? 'Underwriting Case Chat'
                                            : 'Edit Client Account'}
                                    </h2>
                                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">
                                        Advisor Administrative Console • Client: {editingClient.name}
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setEditingClient(null)} className="p-4 hover:bg-slate-100 rounded-full transition-colors">
                                <X className="h-8 w-8 text-slate-300" />
                            </button>
                        </div>

                        {/* Modal Navigation Tabs */}
                        <div className="flex gap-4 mb-8 border-b border-slate-100 pb-1 flex-wrap">
                            <button
                                onClick={() => setModalTab('info')}
                                className={`pb-4 px-6 text-xs font-black uppercase tracking-widest transition-all relative ${modalTab === 'info' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <div className="flex items-center gap-2">
                                    <Shield size={14} /> Profile & Policy
                                </div>
                                {modalTab === 'info' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-full"></div>}
                            </button>
                            <button
                                onClick={() => setModalTab('carrier_policy')}
                                className={`pb-4 px-6 text-xs font-black uppercase tracking-widest transition-all relative ${modalTab === 'carrier_policy' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <div className="flex items-center gap-2">
                                    <ShieldCheck size={14} /> Carrier Policy
                                </div>
                                {modalTab === 'carrier_policy' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-full"></div>}
                            </button>
                            <button
                                onClick={() => setModalTab('chat')}
                                className={`pb-4 px-6 text-xs font-black uppercase tracking-widest transition-all relative ${modalTab === 'chat' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <div className="flex items-center gap-2">
                                    <MessageSquare size={14} /> Case Chat
                                </div>
                                {modalTab === 'chat' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-full"></div>}
                            </button>
                        </div>

                        {/* TAB 1: PROFILE & BASIC POLICY */}
                        {modalTab === 'info' && (
                            <form onSubmit={handleSave} className="space-y-8">
                                {/* Identity Block */}
                                <div className="bg-slate-50 p-10 rounded-[2.5rem] border-2 border-slate-100 space-y-8">
                                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
                                        <span className="h-1.5 w-1.5 bg-blue-600 rounded-full"></span>
                                        Account Identity
                                    </h3>
                                    <div>
                                        <label className="block text-xs font-black text-slate-500 uppercase mb-3 ml-2">Legal Full Name</label>
                                        <input
                                            className="w-full bg-white text-slate-900 border-2 border-slate-100 rounded-2xl px-6 py-5 text-base font-bold focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none shadow-sm transition-all"
                                            value={editForm.name || ''}
                                            onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div>
                                            <label className="block text-xs font-black text-slate-500 uppercase mb-3 ml-2">Email Address</label>
                                            <input
                                                type="email"
                                                className="w-full bg-white text-slate-900 border-2 border-slate-100 rounded-2xl px-6 py-5 text-base font-bold focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none shadow-sm transition-all"
                                                value={editForm.email || ''}
                                                onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-slate-500 uppercase mb-3 ml-2">Primary Phone</label>
                                            <input
                                                type="tel"
                                                className="w-full bg-white text-slate-900 border-2 border-slate-100 rounded-2xl px-6 py-5 text-base font-bold focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none shadow-sm transition-all"
                                                value={editForm.phone || ''}
                                                onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Policy Block */}
                                <div className="bg-white p-10 rounded-[2.5rem] border-4 border-blue-50 space-y-8 shadow-sm">
                                    <h3 className="text-[11px] font-black text-blue-400 uppercase tracking-[0.3em] flex items-center gap-3">
                                        <span className="h-1.5 w-1.5 bg-blue-600 rounded-full"></span>
                                        Policy Administration
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-black text-slate-500 uppercase mb-3 ml-2">Master Policy Number</label>
                                            <input
                                                className="w-full bg-blue-50/30 text-[#0B2240] border-2 border-blue-100 rounded-2xl px-6 py-6 text-2xl font-black font-mono focus:ring-4 focus:ring-blue-200 outline-none transition-all"
                                                value={editForm.policyNumber || ''}
                                                onChange={e => setEditForm({ ...editForm, policyNumber: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-slate-500 uppercase mb-3 ml-2">Coverage Product</label>
                                            <select
                                                className="w-full bg-slate-50 text-slate-900 border-2 border-slate-100 rounded-2xl px-6 py-5 text-sm font-black focus:ring-4 focus:ring-blue-100 outline-none appearance-none cursor-pointer"
                                                value={editForm.product}
                                                onChange={e => setEditForm({ ...editForm, product: e.target.value as ProductType })}
                                            >
                                                {Object.values(ProductType).map(p => <option key={p} value={p}>{p}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-slate-500 uppercase mb-3 ml-2">Issuing Carrier</label>
                                            <input
                                                className="w-full bg-slate-50 text-slate-900 border-2 border-slate-100 rounded-2xl px-6 py-5 text-sm font-black focus:ring-4 focus:ring-blue-100 outline-none"
                                                value={editForm.carrier || ''}
                                                onChange={e => setEditForm({ ...editForm, carrier: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-slate-500 uppercase mb-3 ml-2">Annual Premium ($)</label>
                                            <input
                                                type="number"
                                                className="w-full bg-slate-50 text-slate-900 border-2 border-slate-100 rounded-2xl px-6 py-5 text-sm font-black focus:ring-4 focus:ring-blue-100 outline-none"
                                                value={editForm.premium || ''}
                                                onChange={e => setEditForm({ ...editForm, premium: Number(e.target.value) })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-slate-500 uppercase mb-3 ml-2">Renewal Date</label>
                                            <input
                                                type="date"
                                                className="w-full bg-slate-50 text-slate-900 border-2 border-slate-100 rounded-2xl px-6 py-5 text-sm font-black focus:ring-4 focus:ring-blue-100 outline-none"
                                                value={editForm.renewalDate || ''}
                                                onChange={e => setEditForm({ ...editForm, renewalDate: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-10 flex gap-6">
                                    <button type="button" onClick={() => setEditingClient(null)} className="flex-1 py-6 rounded-full font-black text-slate-400 bg-slate-100 hover:bg-slate-200 transition-all uppercase tracking-widest text-xs">Discard</button>
                                    <button type="submit" className="flex-1 py-6 rounded-full font-black bg-[#0B2240] text-white hover:bg-blue-800 transition-all shadow-2xl shadow-blue-900/30 transform active:scale-95 uppercase tracking-widest text-xs">Commit Updates</button>
                                </div>
                            </form>
                        )}

                        {/* TAB 2: R2 NORMALIZED POLICY SECTION */}
                        {modalTab === 'carrier_policy' && (
                            <NormalizedPolicySection
                                client={editingClient}
                                onPolicyUpdated={handleCarrierPolicyUpdated}
                            />
                        )}

                        {/* TAB 3: CASE CHAT */}
                        {modalTab === 'chat' && (
                            <div className="animate-fade-in overflow-hidden rounded-[2.5rem] border border-slate-100 bg-slate-50 min-h-[500px] flex items-center justify-center text-slate-400">
                                <div className="text-center p-8">
                                    <MessageSquare size={48} className="mx-auto mb-4 opacity-30 text-blue-600" />
                                    <h4 className="text-base font-black text-slate-700">Case Underwriting Discussion</h4>
                                    <p className="text-xs text-slate-400 mt-1 max-w-sm">
                                        Case chat communication channel for advisor underwriters.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Clients;
