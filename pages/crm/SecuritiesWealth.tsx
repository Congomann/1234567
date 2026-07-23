import React, { useState } from 'react';
import { 
  TrendingUp, Shield, DollarSign, PieChart, Users, ArrowUpRight, 
  CheckCircle2, Landmark, Phone, Layers, FileCheck, Award, Sparkles, Activity
} from 'lucide-react';
import { SEO } from '../../components/SEO';
import { useNavigate } from 'react-router-dom';

interface PortfolioClient {
  id: string;
  name: string;
  aum: number;
  strategy: string;
  riskProfile: 'Aggressive Growth' | 'Moderate Growth' | 'Capital Preservation';
  annuityAllocation: number;
  status: 'Active' | 'Rebalancing';
  phone: string;
}

export const SecuritiesWealth: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'allocation' | 'billing' | 'clients' | 'compliance'>('overview');

  const [clients] = useState<PortfolioClient[]>([
    { id: 'c-1', name: 'Jonathan Miller', aum: 1250000, strategy: 'Growth & Income IUL', riskProfile: 'Moderate Growth', annuityAllocation: 250000, status: 'Active', phone: '+13125550188' },
    { id: 'c-2', name: 'Eleanor Vance', aum: 3400000, strategy: 'High Net Worth Dividend Equities', riskProfile: 'Aggressive Growth', annuityAllocation: 500000, status: 'Active', phone: '+14155550199' },
    { id: 'c-3', name: 'Robert Sterling', aum: 890000, strategy: 'Capital Preservation Fixed Index Annuity', riskProfile: 'Capital Preservation', annuityAllocation: 890000, status: 'Rebalancing', phone: '+12125550144' },
    { id: 'c-4', name: 'Sophia Chen', aum: 2100000, strategy: 'Balanced Wealth & Tax-Free IUL', riskProfile: 'Moderate Growth', annuityAllocation: 400000, status: 'Active', phone: '+13105550177' }
  ]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-slate-900 pb-20 selection:bg-blue-500/20">
      <SEO />

      {/* APPLE MAC-STYLE HEADER */}
      <div className="apple-glass p-8 md:p-10 rounded-[2.5rem] mb-8 border border-white/80 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-gradient-to-tr from-amber-500 to-orange-500 rounded-2xl text-white shadow-xl shadow-amber-500/20">
              <TrendingUp className="h-8 w-8" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Securities & Wealth Management</h1>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-extrabold border border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5" /> SEC & FINRA Compliant
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Portfolio Modeling • Fixed Index Annuities & IULs • Advisory Billing • Wealth Preservation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/crm/bank-verification')}
              className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-2xl flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all apple-card"
            >
              <Landmark className="w-4 h-4" /> Plaid ACH Verify
            </button>
            <button 
              onClick={() => navigate('/crm/telephony')}
              className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold rounded-2xl flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all apple-card"
            >
              <Phone className="w-4 h-4" /> SignalWire Call
            </button>
          </div>
        </div>
      </div>

      {/* METRIC BANNER CARDS (RESPONSIVE NO-OVERFLOW GRID) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        <div className="apple-glass p-6 rounded-[2rem] border border-white/80 shadow-xl apple-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Portfolio AUM</span>
              <div className="p-2.5 bg-amber-500/10 text-amber-600 rounded-xl"><DollarSign className="w-5 h-5" /></div>
            </div>
            <p className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight mb-1 truncate">$142.85M</p>
          </div>
          <span className="text-xs font-extrabold text-emerald-600 flex items-center gap-1">+14.2% Annualized Yield</span>
        </div>

        <div className="apple-glass p-6 rounded-[2rem] border border-white/80 shadow-xl apple-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Average Client AUM</span>
              <div className="p-2.5 bg-blue-500/10 text-blue-600 rounded-xl"><Users className="w-5 h-5" /></div>
            </div>
            <p className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight mb-1 truncate">$1.24M</p>
          </div>
          <span className="text-xs font-semibold text-slate-500">115 High Net Worth Families</span>
        </div>

        <div className="apple-glass p-6 rounded-[2rem] border border-white/80 shadow-xl apple-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Annuities & IUL</span>
              <div className="p-2.5 bg-purple-500/10 text-purple-600 rounded-xl"><Shield className="w-5 h-5" /></div>
            </div>
            <p className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight mb-1 truncate">$38.5M</p>
          </div>
          <span className="text-xs font-extrabold text-purple-600">27% Capital Protected</span>
        </div>

        <div className="apple-glass p-6 rounded-[2rem] border border-white/80 shadow-xl apple-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Advisory Billing Tier</span>
              <div className="p-2.5 bg-emerald-500/10 text-emerald-600 rounded-xl"><Activity className="w-5 h-5" /></div>
            </div>
            <p className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight mb-1 truncate">1.00% AUM</p>
          </div>
          <span className="text-xs font-extrabold text-emerald-600">$1.42M Annualized Fees</span>
        </div>

      </div>

      {/* APPLE SEGMENTED CONTROL TABS */}
      <div className="bg-slate-200/60 backdrop-blur-xl p-1.5 rounded-2xl inline-flex items-center gap-1 mb-8 border border-slate-300/40">
        {[
          { id: 'overview', label: 'Executive Overview', icon: Layers },
          { id: 'allocation', label: 'Asset Allocation', icon: PieChart },
          { id: 'billing', label: 'Advisory Billing', icon: DollarSign },
          { id: 'clients', label: 'HNW Clients', icon: Users },
          { id: 'compliance', label: 'Compliance Vault', icon: FileCheck }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                isActive 
                  ? 'bg-white text-slate-900 shadow-md border border-slate-200/80' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* CLIENT ROSTER & PORTFOLIOS (APPLE GLASS CONTAINER) */}
      <div className="apple-glass rounded-[2.5rem] p-8 border border-white/80 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Active High Net Worth Portfolios</h2>
            <p className="text-xs text-slate-500 font-medium">Synchronized with Plaid ACH Bank Verification & SignalWire Telephony</p>
          </div>
        </div>

        <div className="space-y-4">
          {clients.map(client => (
            <div key={client.id} className="apple-glass p-6 rounded-3xl border border-white/80 flex flex-col md:flex-row md:items-center justify-between gap-6 apple-card">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-extrabold text-slate-900">{client.name}</h3>
                  <span className="px-3 py-0.5 rounded-full bg-amber-500/10 text-amber-600 text-[10px] font-extrabold border border-amber-500/20">
                    {client.riskProfile}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">Strategy: <span className="text-slate-800 font-bold">{client.strategy}</span></p>
              </div>

              <div className="flex items-center gap-8">
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400 block">Total AUM</span>
                  <span className="text-xl font-black text-slate-900">{formatCurrency(client.aum)}</span>
                </div>

                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400 block">Annuity/IUL</span>
                  <span className="text-sm font-bold text-purple-600">{formatCurrency(client.annuityAllocation)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate('/crm/telephony')}
                    className="p-3 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-2xl transition-all border border-blue-200"
                    title="Call with SignalWire"
                  >
                    <Phone className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => navigate('/crm/bank-verification')}
                    className="p-3 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-2xl transition-all border border-emerald-200"
                    title="Plaid ACH Bank Verify"
                  >
                    <Landmark className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default SecuritiesWealth;
