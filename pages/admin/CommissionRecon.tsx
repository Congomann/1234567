
import React, { useState, useEffect } from 'react';
import {
    Upload,
    FileSpreadsheet,
    CheckCircle2,
    AlertCircle,
    ArrowRightLeft,
    DollarSign,
    ChevronRight,
    Search,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    RefreshCw,
    Download
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PDFBrandingService } from '../../services/pdfBrandingService';
import { Tab3DBanner } from '../../components/shared/Tab3DBanner';

interface Reconciliation {
    id: string;
    carrier: string;
    statement_date: string;
    client_name: string;
    advisor_name: string;
    expected_amount: number;
    actual_amount: number;
    difference: number;
    status: 'Matched' | 'Discrepancy' | 'Unlinked';
    notes: string;
}

export const CommissionRecon: React.FC = () => {
    const [reconciliations, setReconciliations] = useState<Reconciliation[]>([]);
    const [loading, setLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('nhfg_access_token');
            const res = await fetch('/api/admin/commissions/reconciliations', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setReconciliations(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleUploadSim = () => {
        setIsUploading(true);
        // Simulate file processing
        setTimeout(() => {
            setIsUploading(false);
            setUploadSuccess(true);
            fetchData();
            setTimeout(() => setUploadSuccess(false), 5000);
        }, 3000);
    };

    const filtered = reconciliations.filter(r =>
        r.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.carrier?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalActual = reconciliations.reduce((sum, r) => sum + Number(r.actual_amount || 0), 0);
    const totalExpected = reconciliations.reduce((sum, r) => sum + Number(r.expected_amount || 0), 0);

    const generatePDF = () => {
        const doc = new jsPDF({ orientation: 'landscape' });
        PDFBrandingService.addHeader(doc, "Commission Reconciliation Audit Report");

        const tableColumn = ["Carrier", "Client Name", "Expected", "Actual Paid", "Delta", "Status"];
        const tableRows: any[] = [];

        filtered.forEach(item => {
            tableRows.push([
                item.carrier,
                item.client_name,
                `$${Number(item.expected_amount).toLocaleString()}`,
                `$${Number(item.actual_amount).toLocaleString()}`,
                `$${item.difference.toLocaleString()}`,
                item.status
            ]);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            ...PDFBrandingService.tableStyles,
            startY: 55,
        });

        PDFBrandingService.addFooter(doc);
        doc.save(`NHFG_Recon_Audit_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    return (
        <div className="space-y-8 relative">
            <Tab3DBanner
                cards={[
                    { title: "Monthly Carrier Statements", value: "$840,000 Recon", subtitle: "Carrier Payout Audits", emoji: "💵", gradient: "cyan" },
                    { title: "Statement Discrepancy", value: "0 Unmatched", subtitle: "100% Policy Match", emoji: "🔍", gradient: "yellow", linkText: "Audit Queue", linkPath: "#audit_queue" },
                    { title: "Direct Advisor Payouts", value: "85% - 110% Paid", subtitle: "Direct ACH Wire", emoji: "🏦", gradient: "pink" }
                ]}
            />
            <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Financial Reconciliation</h1>
                    <p className="text-slate-500 font-medium mt-1">Cross-reference carrier statements with internal pipeline data.</p>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <button
                        onClick={generatePDF}
                        disabled={filtered.length === 0}
                        className="flex-1 md:flex-none flex items-center justify-center gap-3 bg-white border border-slate-200 text-slate-600 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-slate-50 transition-all disabled:opacity-50"
                    >
                        <Download size={16} />
                        Export Audit
                    </button>
                    <button
                        onClick={handleUploadSim}
                        disabled={isUploading}
                        className="flex-1 md:flex-none flex items-center justify-center gap-3 bg-[#0A62A7] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all disabled:opacity-50"
                    >
                        {isUploading ? <RefreshCw size={16} className="animate-spin" /> : <Upload size={16} />}
                        {isUploading ? 'Processing CSV...' : 'Import Carrier Statement'}
                    </button>
                </div>
            </div>

            {/* Metrics Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform"><DollarSign size={80} /></div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Reconciled Actuals</p>
                    <h3 className="text-3xl font-black text-slate-900">${totalActual.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
                    <div className="flex items-center gap-1.5 mt-2 text-green-500">
                        <ArrowUpRight size={14} />
                        <span className="text-[10px] font-black uppercase">94% Accuracy vs Forecast</span>
                    </div>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform"><AlertCircle size={80} /></div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Audit Discrepancies</p>
                    <h3 className="text-3xl font-black text-red-500">{reconciliations.filter(r => r.status === 'Discrepancy').length}</h3>
                    <div className="flex items-center gap-1.5 mt-2 text-slate-400">
                        <span className="text-[10px] font-black uppercase">Requires manual review</span>
                    </div>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform"><ArrowRightLeft size={80} /></div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Net Difference</p>
                    <h3 className={`text-3xl font-black ${totalActual - totalExpected >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${(totalActual - totalExpected).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </h3>
                </div>
            </div>

            {uploadSuccess && (
                <div className="bg-green-50 border border-green-200 p-6 rounded-3xl flex items-center gap-4 text-green-800 animate-slide-up">
                    <div className="h-10 w-10 bg-green-500 text-white rounded-full flex items-center justify-center">
                        <CheckCircle2 size={24} />
                    </div>
                    <div>
                        <p className="font-black text-sm uppercase tracking-tight">Statement Processed</p>
                        <p className="text-xs font-medium opacity-80">14 new reconciliation records established. 2 discrepancies detected.</p>
                    </div>
                </div>
            )}

            <div id="audit_queue" className="bg-white rounded-[3rem] border border-slate-200 shadow-xl overflow-hidden">
                <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-6">
                        <h3 className="font-black text-sm text-slate-800 uppercase tracking-tight">Audit Trail</h3>
                        <div className="flex gap-2">
                            <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[9px] font-black uppercase tracking-widest">Live Flow</span>
                            <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg text-[9px] font-black uppercase tracking-widest">Q1 2026</span>
                        </div>
                    </div>
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                        <input
                            className="w-full bg-slate-50 border border-slate-200 rounded-full pl-11 pr-6 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            placeholder="Search Client or Carrier..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Carrier / Client</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Expected</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actual Paid</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Delta</th>
                                <th className="px-8 py-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filtered.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-2xl bg-[#0B2240] flex items-center justify-center text-white text-xs font-black ring-4 ring-slate-50">
                                                {item.carrier?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-800">{item.client_name}</p>
                                                <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">{item.carrier}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <p className="text-sm font-bold text-slate-500">${Number(item.expected_amount).toLocaleString()}</p>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <p className="text-sm font-black text-slate-900">${Number(item.actual_amount).toLocaleString()}</p>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className={`inline-flex items-center gap-1 font-bold text-sm ${item.difference >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                            {item.difference > 0 ? <ArrowUpRight size={14} /> : item.difference < 0 ? <ArrowDownRight size={14} /> : null}
                                            ${Math.abs(item.difference).toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${item.status === 'Matched' ? 'bg-green-100 text-green-700' :
                                            item.status === 'Discrepancy' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                                            }`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button className="p-3 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                                            <ChevronRight size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center opacity-30">
                                            <FileSpreadsheet size={48} className="mb-4" />
                                            <p className="text-xs font-black uppercase tracking-widest">No reconciliation history found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        </div>
    );
};
