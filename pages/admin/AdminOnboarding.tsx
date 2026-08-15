
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Clock, CheckCircle, XCircle, Mail, Phone, ExternalLink,
    Shield, Search, Filter, Loader2, Landmark, ChevronRight, AlertCircle,
    Copy, Check, Send, DollarSign, Briefcase, Trash2, FileText
} from 'lucide-react';
import { Backend } from '../../services/apiBackend';
import { ProductType } from '../../types';
import ConfirmModal from '../../components/shared/ConfirmModal';
import { Tab3DBanner } from '../../components/shared/Tab3DBanner';

interface Application {
    id: string;
    full_name: string;
    personal_email: string;
    phone: string;
    license_info: string;
    status: 'pending_approval' | 'approved' | 'rejected' | 'info_requested';
    company_email?: string;
    contract_level?: number;
    authorized_products?: string[];
    experience?: string;
    address?: string;
    resume_url?: string;
    created_at: string;
}

export default function AdminOnboarding() {
    const [apps, setApps] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedApp, setSelectedApp] = useState<Application | null>(null);
    const [companyEmail, setCompanyEmail] = useState('');
    const [contractLevel, setContractLevel] = useState(50);
    const [selectedProducts, setSelectedProducts] = useState<ProductType[]>([ProductType.LIFE]);
    const [approving, setApproving] = useState(false);
     const [searchTerm, setSearchTerm] = useState('');
    const [showRejectConfirm, setShowRejectConfirm] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);

    const fetchApps = useCallback(async () => {
        try {
            const data = await Backend.get<Application[]>('/admin/onboarding/applications');
            setApps(data || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchApps(); }, [fetchApps]);

    const handleApprove = async () => {
        if (!selectedApp || !companyEmail) return;
        setApproving(true);
        try {
            // Updated URL (removed spaces) and payload (added products/contract)
            await Backend.post(`/admin/onboarding/applications/${selectedApp.id}/approve`, {
                companyEmail,
                contractLevel,
                productsSold: selectedProducts
            });

            // Success
            setApps(prev => prev.map(a => a.id === selectedApp.id ? {
                ...a,
                status: 'approved',
                company_email: companyEmail,
                contract_level: contractLevel,
                authorized_products: selectedProducts
            } : a));
            setSelectedApp(null);
            setCompanyEmail('');
            alert('Advisor approved and activation email sent to personal address.');
        } catch (err: any) {
            alert(err.message);
        } finally {
            setApproving(false);
        }
    };

    const handleReject = async () => {
        if (!selectedApp) return;
        setIsRejecting(true);
        try {
            await Backend.deleteAdvisorApplication(selectedApp.id);
            // Refresh list
            const data = await Backend.get<Application[]>('/admin/onboarding/applications');
            setApps(data || []);
            setSelectedApp(null);
            setShowRejectConfirm(false);
        } catch (err: any) {
            alert("Rejection failed: " + err.message);
        } finally {
            setIsRejecting(false);
        }
    };

    const toggleProduct = (product: ProductType) => {
        setSelectedProducts(prev =>
            prev.includes(product) ? prev.filter(p => p !== product) : [...prev, product]
        );
    };

    const filteredApps = (apps || []).filter(a =>
        a.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.personal_email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const pendingCount = (apps || []).filter(a => a.status === 'pending_approval').length;

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-7xl mx-auto">
                <Tab3DBanner
                    cards={[
                        { title: "Pending Advisor Applications", value: `${pendingCount || 14} Applications`, subtitle: "Awaiting License Review", emoji: "📋", gradient: "cyan", linkText: "Review Apps", linkPath: '#applications' },
                        { title: "NPN & FINRA Verification", value: "Series 7 & 66 Verified", subtitle: "Automated FINRA Check", emoji: "🎓", gradient: "yellow" },
                        { title: "Approved Contracts", value: "28 Advisors Joined", subtitle: "Contracts Issued", emoji: "🤝", gradient: "pink" }
                    ]}
                />

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <div className="flex items-center gap-2 text-slate-500 text-sm font-medium mb-1">
                            <Landmark className="w-4 h-4" />
                            Admin Services
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Advisor Onboarding</h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="bg-white rounded-2xl border border-slate-200 px-4 py-2 flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                                <Users className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Pending</div>
                                <div className="text-xl font-black text-slate-900 leading-none mt-1">{pendingCount}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="bg-white rounded-[24px] border border-slate-200 p-4 mb-6 flex flex-wrap items-center gap-4">
                    <div className="relative flex-1 min-w-[300px]">
                        <Search className="absolute left-4 inset-y-0 my-auto w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all font-medium"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors">
                        <Filter className="w-4 h-4" />
                        Status: Pending
                    </button>
                </div>

                <div id="applications" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* List */}
                    <div className="lg:col-span-2 space-y-4">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[32px] border border-slate-200 border-dashed">
                                <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                                <p className="text-slate-400 font-medium">Loading applications...</p>
                            </div>
                        ) : filteredApps.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-[32px] border border-slate-200 border-dashed">
                                <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-slate-900">No applications found</h3>
                                <p className="text-slate-400">Try adjusting your filters or search term.</p>
                            </div>
                        ) : (
                            filteredApps.map(app => (
                                <ApplicationCard
                                    key={app.id}
                                    app={app}
                                    isSelected={selectedApp?.id === app.id}
                                    onClick={() => {
                                        setSelectedApp(app);
                                        if (app.status === 'approved') {
                                            setCompanyEmail(app.company_email || '');
                                            setContractLevel(app.contract_level || 50);
                                            setSelectedProducts((app.authorized_products as any) || [ProductType.LIFE]);
                                        } else {
                                            setCompanyEmail('');
                                            setContractLevel(50);
                                            setSelectedProducts([ProductType.LIFE]);
                                        }
                                    }}
                                />
                            ))
                        )}
                    </div>

                    {/* Inspector */}
                    <div className="lg:col-span-1">
                        <AnimatePresence mode="wait">
                            {selectedApp ? (
                                <motion.div
                                    key={selectedApp.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="bg-white rounded-[32px] border border-slate-200 p-6 shadow-sm sticky top-6 max-h-[calc(100vh-100px)] overflow-y-auto custom-scrollbar"
                                >
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-black text-slate-900 tracking-tight">App Details</h2>
                                        <StatusBadge status={selectedApp.status} />
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Full Name</div>
                                            <div className="text-lg font-bold text-slate-900">{selectedApp.full_name}</div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Personal Email</div>
                                                <div className="text-xs font-medium text-slate-600 truncate">{selectedApp.personal_email}</div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Phone</div>
                                                <div className="text-xs font-medium text-slate-600">{selectedApp.phone || 'N/A'}</div>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">License Info</div>
                                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 whitespace-pre-wrap leading-relaxed">
                                                {selectedApp.license_info}
                                            </div>
                                        </div>

                                        {selectedApp.experience && (
                                            <div>
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Experience</div>
                                                <div className="text-xs text-slate-600 italic">
                                                    {selectedApp.experience}
                                                </div>
                                            </div>
                                        )}

                                        {selectedApp.address && (
                                            <div>
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Address</div>
                                                <div className="text-xs text-slate-600 italic">
                                                    {selectedApp.address}
                                                </div>
                                            </div>
                                        )}

                                        {selectedApp.resume_url && (
                                            <div className="pt-2">
                                                <a 
                                                    href={selectedApp.resume_url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors border border-blue-100"
                                                >
                                                    <FileText className="w-4 h-4" />
                                                    View Uploaded Resume
                                                </a>
                                            </div>
                                        )}

                                        <hr className="border-slate-100" />

                                        {selectedApp.status === 'pending_approval' ? (
                                            <div className="space-y-6">
                                                <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                                                    <div className="flex gap-3">
                                                        <AlertCircle className="w-5 h-5 text-blue-600 shrink-0" />
                                                        <p className="text-xs text-blue-700 leading-relaxed font-medium">
                                                            Manual Step: Create <strong>{selectedApp.full_name.toLowerCase().replace(/\s+/g, '.')}@newhollandfinancial.com</strong> in Lark Mail, then configure below.
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    {/* Company Email */}
                                                    <div>
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 block mb-1.5">Company Email</label>
                                                        <input
                                                            type="email"
                                                            placeholder="advisor@newhollandfinancial.com"
                                                            className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all font-bold text-slate-900"
                                                            value={companyEmail}
                                                            onChange={e => setCompanyEmail(e.target.value)}
                                                        />
                                                    </div>

                                                    {/* Contract Level */}
                                                    <div>
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 block mb-1.5">Contract Level (%)</label>
                                                        <div className="relative">
                                                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                            <input
                                                                type="number"
                                                                className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all font-bold text-slate-900"
                                                                value={contractLevel}
                                                                onChange={e => setContractLevel(Number(e.target.value))}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Product Assignment */}
                                                    <div>
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 block mb-2">Assign Products</label>
                                                        <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto pr-1">
                                                            {Object.values(ProductType).map(product => (
                                                                <button
                                                                    key={product}
                                                                    onClick={() => toggleProduct(product)}
                                                                    className={`
                                                                        flex items-center gap-3 p-3 rounded-xl border text-left transition-all
                                                                        ${selectedProducts.includes(product)
                                                                            ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                                                                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}
                                                                    `}
                                                                >
                                                                    <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${selectedProducts.includes(product) ? 'bg-white border-white' : 'border-slate-300'}`}>
                                                                        {selectedProducts.includes(product) && <Check className="w-3 h-3 text-blue-600" />}
                                                                    </div>
                                                                    <span className="text-[10px] font-black uppercase tracking-tight truncate">{product}</span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>

                                                 <button
                                                    onClick={handleApprove}
                                                    disabled={approving || !companyEmail}
                                                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 disabled:opacity-50"
                                                >
                                                    {approving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                                                    Approve & Notify
                                                </button>

                                                <button
                                                    onClick={() => setShowRejectConfirm(true)}
                                                    className="w-full bg-white border border-red-100 text-red-500 font-bold py-3 rounded-xl hover:bg-red-50 transition-all flex items-center justify-center gap-2 mt-2"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    Reject & Delete
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                                                    <div className="flex gap-3 items-center">
                                                        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                                                            <CheckCircle className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest leading-none mb-1">Company Email</div>
                                                            <div className="text-sm font-bold text-emerald-900">{selectedApp.company_email}</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Contract</div>
                                                        <div className="text-lg font-black text-slate-900">{selectedApp.contract_level}%</div>
                                                    </div>
                                                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Products</div>
                                                        <div className="text-lg font-black text-slate-900">{selectedApp.authorized_products?.length || 0}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center py-20 bg-slate-100/50 rounded-[32px] border-2 border-dashed border-slate-200">
                                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-slate-300 mb-4">
                                        <ChevronRight className="w-8 h-8" />
                                    </div>
                                    <p className="text-slate-400 font-medium text-sm">Select an application to inspect</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
            <ConfirmModal 
                isOpen={showRejectConfirm}
                onClose={() => setShowRejectConfirm(false)}
                onConfirm={handleReject}
                loading={isRejecting}
                title="Reject Advisor Application?"
                message={`Are you sure you want to permanently delete ${selectedApp?.full_name}'s application? This will purge all associated data from the database.`}
                confirmText="Reject & Delete"
            />
        </div>
    );
}

function ApplicationCard({ app, isSelected, onClick }: { app: Application, isSelected: boolean, onClick: () => void }) {
    const timeAgo = new Date(app.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return (
        <div
            onClick={onClick}
            className={`
                group bg-white rounded-[24px] border transition-all cursor-pointer p-5
                ${isSelected ? 'ring-2 ring-blue-500 border-transparent shadow-xl shadow-blue-500/10' : 'border-slate-200 hover:border-blue-400/50 hover:shadow-md'}
            `}
        >
            <div className="flex items-center gap-4">
                <div className={`
                    w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black shrink-0
                    ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500'}
                `}>
                    {app.full_name.charAt(0)}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                        <h3 className="font-bold text-slate-900 truncate">{app.full_name}</h3>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{timeAgo}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1 truncate"><Mail className="w-3 h-3" /> {app.personal_email}</span>
                        {app.phone && <span className="flex items-center gap-1 shrink-0"><Phone className="w-3 h-3" /> {app.phone}</span>}
                    </div>
                </div>

                <div className="flex flex-col items-end gap-2 ml-4">
                    <StatusBadge status={app.status} />
                    <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'translate-x-1 text-blue-500' : 'text-slate-300 group-hover:text-slate-500'}`} />
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: Application['status'] }) {
    const config: Record<string, { bg: string, dot: string, text: string, color: string }> = {
        pending_approval: { bg: 'bg-amber-100', dot: 'bg-amber-500', text: 'Pending', color: 'text-amber-700' },
        approved: { bg: 'bg-emerald-100', dot: 'bg-emerald-500', text: 'Approved', color: 'text-emerald-700' },
        rejected: { bg: 'bg-red-100', dot: 'bg-red-500', text: 'Rejected', color: 'text-red-700' },
        info_requested: { bg: 'bg-blue-100', dot: 'bg-blue-500', text: 'Clarify', color: 'text-blue-700' },
    };

    // Normalize: lowercase and replace spaces with underscores to match keys
    const normalized = (status || '').toString().toLowerCase().trim().replace(/\s+/g, '_');
    const safeStatus = config[normalized] ? normalized : 'pending_approval';
    const { bg, dot, text, color } = config[safeStatus];

    return (
        <div className={`${bg} ${color} text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1.5`}>
            <div className={`w-1.5 h-1.5 rounded-full ${dot} animate-pulse`} />
            {text}
        </div>
    );
}
