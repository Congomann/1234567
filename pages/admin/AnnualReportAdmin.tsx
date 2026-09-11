import React, { useState } from 'react';
import { 
  ShieldCheck, 
  TrendingUp, 
  Scale, 
  AlertCircle, 
  Gavel, 
  Plus, 
  Save, 
  Trash2, 
  History,
  FileText,
  DollarSign,
  Loader2,
  CheckCircle2,
  Briefcase,
  Layers
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Backend } from '../../services/apiBackend';
import { Tab3DBanner } from '../../components/shared/Tab3DBanner';

/**
 * ANNUAL REPORT & TRANSPARENCY ADMIN
 * Manage corporate disclosures, financial metrics, and legal standing.
 */

export const AnnualReportAdmin: React.FC = () => {
  const { companySettings, updateCompanySettings } = useData();
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Initialize from context if exists, otherwise defaults
  const [isPublished, setIsPublished] = useState(companySettings.annualReportData?.isPublished ?? false);
  const [metrics, setMetrics] = useState(companySettings.annualReportData?.metrics || {
    totalSales: 18.2,
    salesGrowth: 46.5,
    complianceRating: 99.8,
    activeLawsuits: 0,
    totalFines: 0,
    activeStates: 48
  });

  const [audits, setAudits] = useState(companySettings.annualReportData?.audits || [
    { id: 1, state: 'New York', date: '2025-03-15', status: 'Cleared', findings: 0 },
    { id: 2, state: 'Florida', date: '2025-02-10', status: 'Cleared', findings: 0 },
  ]);

  const [partnerRevenue, setPartnerRevenue] = useState(companySettings.annualReportData?.partnerRevenue || [
    { id: 1, name: 'Aflac', vertical: 'Life Insurance', revenue: 600000, visible: true },
    { id: 2, name: 'Transamerica', vertical: 'Life Insurance', revenue: 1000000, visible: true },
    { id: 3, name: 'Chubb', vertical: 'Property & Casualty', revenue: 450000, visible: true },
    { id: 4, name: 'Geico', vertical: 'Property & Casualty', revenue: 230000, visible: true },
  ]);

  const [quarterlyReports, setQuarterlyReports] = useState(companySettings.annualReportData?.quarterlyReports || [
    { id: 1, title: 'Q1 2025 Transparency Report', date: '2025-04-01', status: 'Published' },
    { id: 2, title: 'Q2 2025 Transparency Report', date: '2025-07-01', status: 'Draft' },
  ]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
        const updatedSettings = {
            ...companySettings,
            annualReportData: { isPublished, metrics, audits, partnerRevenue, quarterlyReports }
        };
        await Backend.post('/settings', updatedSettings);
        updateCompanySettings(updatedSettings);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
        console.error('Failed to save annual report data:', e);
    } finally {
        setIsSaving(false);
    }
  };

  const handleAddAudit = () => {
    const newState = prompt('Enter State Entity:');
    if (!newState) return;
    setAudits([...audits, { 
        id: Date.now(), 
        state: newState, 
        date: new Date().toISOString().split('T')[0], 
        status: 'CLEARED', 
        findings: 0 
    }]);
  };

  const handleDeleteAudit = (id: number) => {
    setAudits(audits.filter((a: any) => a.id !== id));
  };

  const handleAddQuarterly = () => {
    const newTitle = prompt('Enter Report Title:');
    if (!newTitle) return;
    setQuarterlyReports([...quarterlyReports, { 
        id: Date.now(), 
        title: newTitle, 
        date: new Date().toISOString().split('T')[0], 
        status: 'Draft' 
    }]);
  };

  const handleDeleteQuarterly = (id: number) => {
    setQuarterlyReports(quarterlyReports.filter((r: any) => r.id !== id));
  };

  const handleAddPartner = () => {
    const newName = prompt('Enter Partner Name:');
    if (!newName) return;
    setPartnerRevenue([...partnerRevenue, { 
        id: Date.now(), 
        name: newName, 
        vertical: 'New Vertical', 
        revenue: 0,
        visible: true
    }]);
  };

  const handleDeletePartner = (id: number) => {
    setPartnerRevenue(partnerRevenue.filter((p: any) => p.id !== id));
  };

  return (
    <div className="space-y-8 relative">
      <Tab3DBanner
        cards={[
          { title: "Public Disclosure Audit", value: "SEC Compliant", subtitle: "2026 Audit Report", emoji: "📊", gradient: "cyan", linkText: "Audit Filings", linkPath: '#quarterly-reports' },
          { title: "Regulatory Filings", value: "100% Up to Date", subtitle: "48 Active States", emoji: "⚖️", gradient: "yellow", linkText: "State Disclosures", linkPath: '#transparency-ledger' },
          { title: "Annual Financial Metric", value: "$142.8M AUM", subtitle: "0 Active Lawsuits", emoji: "📜", gradient: "pink", linkText: "Financial Metrics", linkPath: '#metrics-editor' }
        ]}
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2 uppercase">Transparency Management</h1>
          <p className="text-slate-500 font-medium">Configure corporate quarterly metrics, financial data, and disclosures.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Public Visibility</span>
            <button 
              onClick={() => setIsPublished(!isPublished)}
              className={`w-12 h-6 rounded-full relative transition-colors ${isPublished ? 'bg-emerald-500' : 'bg-slate-300'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${isPublished ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
            <span className={`text-xs font-bold ${isPublished ? 'text-emerald-600' : 'text-slate-400'}`}>
              {isPublished ? 'LIVE' : 'HIDDEN'}
            </span>
          </div>

          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : (saveSuccess ? <CheckCircle2 size={16} /> : <Save size={16} />)} 
            {isSaving ? 'Saving...' : (saveSuccess ? 'Saved' : 'Save Updates')}
          </button>
        </div>
      </div>

      {/* Quarterly Reports Section (Every 3 months) */}
      <div id="quarterly-reports" className="bg-white/70 backdrop-blur-xl p-10 rounded-[3rem] border border-white/40 shadow-sm">
        <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase flex items-center gap-3">
                <Layers className="text-blue-600" size={20} /> Quarterly Disclosures
            </h2>
            <button 
                onClick={handleAddQuarterly}
                className="p-3 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
            >
                <Plus size={18} />
            </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quarterlyReports.map((report: any) => (
                <div key={report.id} className="p-6 bg-white border border-slate-100 rounded-[2rem] flex items-center justify-between group hover:border-blue-200 transition-all">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                            <FileText size={20} />
                        </div>
                        <div>
                            <h4 className="font-black text-slate-900 text-sm">{report.title}</h4>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{report.date}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${report.status === 'Published' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                            {report.status}
                        </span>
                        <button onClick={() => handleDeleteQuarterly(report.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                            <Trash2 size={14} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* Quick Metrics Editor */}
      <div id="metrics-editor" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
              <DollarSign size={20} />
            </div>
            <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest">Financial Performance</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Total Sales (Millions)</label>
              <input 
                type="number" 
                value={metrics.totalSales} 
                onChange={(e) => setMetrics({...metrics, totalSales: parseFloat(e.target.value)})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Sales Growth (%)</label>
              <input 
                type="number" 
                value={metrics.salesGrowth} 
                onChange={(e) => setMetrics({...metrics, salesGrowth: parseFloat(e.target.value)})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm"
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
              <Scale size={20} />
            </div>
            <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest">Legal & Fines</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Active Lawsuits</label>
              <input 
                type="number" 
                value={metrics.activeLawsuits} 
                onChange={(e) => setMetrics({...metrics, activeLawsuits: parseInt(e.target.value)})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Total Fines ($)</label>
              <input 
                type="number" 
                value={metrics.totalFines} 
                onChange={(e) => setMetrics({...metrics, totalFines: parseFloat(e.target.value)})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm"
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
              <ShieldCheck size={20} />
            </div>
            <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest">Compliance Status</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Audit Score (%)</label>
              <input 
                type="number" 
                value={metrics.complianceRating} 
                onChange={(e) => setMetrics({...metrics, complianceRating: parseFloat(e.target.value)})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Active States</label>
              <input 
                type="number" 
                value={metrics.activeStates} 
                onChange={(e) => setMetrics({...metrics, activeStates: parseInt(e.target.value)})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Audit Log Editor */}
      <div id="transparency-ledger" className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-10 border-b border-slate-50 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Transparency Ledger</h2>
            <p className="text-slate-500 font-medium text-sm">Log individual state audits and regulatory reviews.</p>
          </div>
          <button 
            onClick={handleAddAudit}
            className="p-3 bg-slate-900 text-white rounded-xl hover:bg-black transition-all"
          >
            <Plus size={20} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">State Entity</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Audit Date</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Result Status</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Findings</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {audits.map((audit) => (
                <tr key={audit.id} className="group hover:bg-slate-50/30 transition-colors">
                  <td className="px-10 py-6">
                    <span className="font-black text-slate-900">{audit.state}</span>
                  </td>
                  <td className="px-10 py-6 font-bold text-slate-500">{audit.date}</td>
                  <td className="px-10 py-6">
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                      {audit.status}
                    </span>
                  </td>
                  <td className="px-10 py-6 font-black text-slate-900">{audit.findings}</td>
                  <td className="px-10 py-6 text-right">
                    <button 
                      onClick={() => handleDeleteAudit(audit.id)}
                      className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Partner Contributions Section */}
      <div className="bg-[#0B2240] rounded-[3.5rem] p-12 text-white shadow-3xl shadow-blue-900/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-full bg-blue-500 rounded-full mix-blend-overlay filter blur-[100px] opacity-10"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-2xl font-black tracking-tight uppercase flex items-center gap-4">
              <Briefcase className="text-blue-400" size={24} /> Strategic Partner Volume
            </h2>
            <button 
                onClick={handleAddPartner}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/10"
            >
              <Plus size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {partnerRevenue.map((p: any) => (
              <div key={p.id} className="p-6 sm:p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:bg-white/10 transition-all overflow-hidden relative">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <button 
                    onClick={() => handleDeletePartner(p.id)} 
                    className="text-white/20 hover:text-red-400 transition-colors shrink-0"
                    title="Delete Partner"
                  >
                    <Trash2 size={16} />
                  </button>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-black text-white text-base sm:text-lg leading-tight mb-1 truncate">{p.name}</h4>
                    <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest truncate">{p.vertical}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                  <button 
                    onClick={() => setPartnerRevenue(partnerRevenue.map((item: any) => item.id === p.id ? {...item, visible: !item.visible} : item))}
                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all shrink-0 ${p.visible ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'bg-white/10 text-white/40 hover:bg-white/20'}`}
                  >
                    {p.visible ? 'Visible' : 'Hidden'}
                  </button>
                  <div className="flex items-center gap-1.5 bg-blue-500/20 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-blue-500/30 shrink-0">
                    <span className="text-blue-400 font-extrabold text-sm">$</span>
                    <input 
                      type="number" 
                      value={isNaN(p.revenue) ? '' : p.revenue / 1000}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        const newVal = isNaN(val) ? 0 : val * 1000;
                        setPartnerRevenue(partnerRevenue.map((item: any) => item.id === p.id ? {...item, revenue: newVal} : item));
                      }}
                      className="bg-transparent border-none focus:ring-0 text-base sm:text-lg font-black text-white w-16 sm:w-20 p-0 text-center"
                    />
                    <span className="text-blue-400 font-extrabold text-xs">K</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};
