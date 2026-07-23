import React, { useState } from 'react';
import { 
  TrendingUp, Shield, DollarSign, PieChart, Activity, FileCheck, 
  Users, ArrowUpRight, CheckCircle2, RefreshCw, Lock, Sparkles, 
  BarChart3, Landmark, Phone, MessageSquare, Download, Layers
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
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 md:p-10 selection:bg-blue-500/20">
      <SEO />

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 bg-slate-800/80 backdrop-blur-2xl p-8 rounded-3xl border border-slate-700/60 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-gradient-to-tr from-amber-500 to-orange-500 rounded-2xl text-white shadow-lg shadow-amber-500/20">
            <TrendingUp className="h-8 w-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Securities & Wealth Management</h1>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" /> SEC & FINRA Compliant
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              Portfolio Modeling • Fixed Index Annuities & IULs • Advisory Billing • Wealth Preservation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/crm/bank-verification')}
            className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-2xl flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
          >
            <Landmark className="w-4 h-4" /> Plaid ACH Verify
          </button>
          <button 
            onClick={() => navigate('/crm/telephony')}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-2xl flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all"
          >
            <Phone className="w-4 h-4" /> SignalWire Call
          </button>
        </div>
      </div>

      {/* METRIC BANNER CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="p-6 bg-slate-800/80 border border-slate-700/80 rounded-3xl shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Portfolio AUM</span>
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl"><DollarSign className="w-5 h-5" /></div>
          </div>
          <p className="text-3xl font-black text-white tracking-tight mb-1">$142,850,000</p>
          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">+14.2% Annualized Yield</span>
        </div>

        <div className="p-6 bg-slate-800/80 border border-slate-700/80 rounded-3xl shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Average Client AUM</span>
            <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl"><Users className="w-5 h-5" /></div>
          </div>
          <p className="text-3xl font-black text-white tracking-tight mb-1">$1,240,000</p>
          <span className="text-xs font-bold text-slate-400">115 High Net Worth Families</span>
        </div>

        <div className="p-6 bg-slate-800/80 border border-slate-700/80 rounded-3xl shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Annuities & IUL Allocation</span>
            <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl"><Shield className="w-5 h-5" /></div>
          </div>
          <p className="text-3xl font-black text-white tracking-tight mb-1">$38,500,000</p>
          <span className="text-xs font-bold text-purple-400">27% Capital Protected</span>
        </div>

        <div className="p-6 bg-slate-800/80 border border-slate-700/80 rounded-3xl shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Advisory Billing Tier</span>
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl"><BarChart3 className="w-5 h-5" /></div>
          </div>
          <p className="text-3xl font-black text-white tracking-tight mb-1">1.00% AUM</p>
          <span className="text-xs font-bold text-emerald-400">$1,428,500 Annualized Fees</span>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 custom-scrollbar">
        {[
          { id: 'overview', label: 'Executive AUM Overview', icon: Layers },
          { id: 'allocation', label: 'Asset Allocation Engine', icon: PieChart },
          { id: 'billing', label: 'Advisory Fee Billing', icon: DollarSign },
          { id: 'clients', label: 'High Net Worth Clients', icon: Users },
          { id: 'compliance', label: 'Compliance Vault', icon: FileCheck }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive 
                  ? 'bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/20 font-black' 
                  : 'bg-slate-800/60 hover:bg-slate-800 text-slate-400 border border-slate-700/40'
              }`}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── CLIENT ROSTER & PORTFOLIOS ── */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-black text-white">Active High Net Worth Portfolios</h2>
            <p className="text-xs text-slate-400">Directly synchronized with Plaid ACH verification & SignalWire Telephony</p>
          </div>
        </div>

        <div className="space-y-4">
          {clients.map(client => (
            <div key={client.id} className="p-6 bg-slate-900/80 border border-slate-700 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-amber-500/40 transition-all">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-white">{client.name}</h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-bold border border-amber-500/20">
                    {client.riskProfile}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium">Strategy: <span className="text-slate-200">{client.strategy}</span></p>
              </div>

              <div className="flex items-center gap-8">
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400 block">Total AUM</span>
                  <span className="text-xl font-black text-white">{formatCurrency(client.aum)}</span>
                </div>

                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400 block">Annuity/IUL</span>
                  <span className="text-sm font-bold text-purple-400">{formatCurrency(client.annuityAllocation)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate('/crm/telephony')}
                    className="p-3 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white rounded-xl transition-all border border-blue-500/30"
                    title="Call with SignalWire"
                  >
                    <Phone className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => navigate('/crm/bank-verification')}
                    className="p-3 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded-xl transition-all border border-emerald-500/30"
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
