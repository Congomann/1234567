import React, { useState } from 'react';
import { Car, Shield, Activity, FileText } from 'lucide-react';
import { EmbeddedRootInsuranceModal } from '../../../components/crm/EmbeddedRootInsuranceModal';

export const RootInsuranceDashboard: React.FC = () => {
    const [modalLead, setModalLead] = useState<any>(null);

    const activeQuotes = [
        { id: 'RQ-1001', name: 'John Doe', status: 'Pending Prefill', premium: null, date: '2023-11-01' },
        { id: 'RQ-1002', name: 'Sarah Connor', status: 'Bindable', premium: 120.50, date: '2023-11-02' },
        { id: 'RQ-1003', name: 'Apex Trucking', status: 'Quoted', premium: 850.00, date: '2023-11-03' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-[#0B2240] tracking-tight uppercase">Root Insurance</h1>
                    <p className="text-slate-500 font-medium mt-1">Manage fully embedded auto and commercial quotes via Root API.</p>
                </div>
                <button 
                    onClick={() => setModalLead({ name: 'New Root Customer' })}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#FF5A5F] text-white rounded-full font-bold text-sm hover:bg-red-600 shadow-lg"
                >
                    <Car className="h-4 w-4" /> Start New Root Quote
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-red-50 text-[#FF5A5F] rounded-2xl">
                            <Activity className="h-6 w-6" />
                        </div>
                        <span className="text-2xl font-black text-slate-800">12</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Active Quotes</h3>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-green-50 text-green-600 rounded-2xl">
                            <Shield className="h-6 w-6" />
                        </div>
                        <span className="text-2xl font-black text-slate-800">4</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Policies Bound</h3>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                            <FileText className="h-6 w-6" />
                        </div>
                        <span className="text-2xl font-black text-slate-800">$1,450</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Monthly Premium</h3>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50">
                    <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Recent Root Quotes</h2>
                </div>
                <div className="divide-y divide-slate-100">
                    {activeQuotes.map(quote => (
                        <div key={quote.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center">
                                    <Car className="h-5 w-5 text-slate-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900">{quote.name}</h3>
                                    <p className="text-xs font-medium text-slate-500">{quote.id} • {quote.date}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                    quote.status === 'Bindable' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                    {quote.status}
                                </span>
                                <div className="text-right min-w-[80px]">
                                    <span className="block text-sm font-black text-slate-900">
                                        {quote.premium ? `$${quote.premium.toFixed(2)}` : '--'}
                                    </span>
                                </div>
                                <button 
                                    onClick={() => setModalLead(quote)}
                                    className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800"
                                >
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {modalLead && <EmbeddedRootInsuranceModal lead={modalLead} onClose={() => setModalLead(null)} />}
        </div>
    );
};
