import React, { useState } from 'react';
import { MarketingCampaign, MarketingAudience } from '../../types';
import { Target, Users, Send, TrendingUp, Plus, Search, Filter, ArrowUpRight, BarChart3, Mail, DollarSign } from 'lucide-react';

export const CampaignManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'audiences' | 'campaigns' | 'email'>('dashboard');

  const mockCampaigns: MarketingCampaign[] = [
    { id: 'CMP-001', name: 'Q3 Freight Expansion', status: 'Active', budget: 15000, spend: 4500, revenueGenerated: 32000, startDate: '2026-07-01', audienceId: 'AUD-001', leadsGenerated: 145, dealsClosed: 12, roi: 611 },
    { id: 'CMP-002', name: 'Fuel Niche Reactivation', status: 'Completed', budget: 5000, spend: 5000, revenueGenerated: 18500, startDate: '2026-05-01', endDate: '2026-06-01', audienceId: 'AUD-002', leadsGenerated: 89, dealsClosed: 6, roi: 270 }
  ];

  const mockAudiences: MarketingAudience[] = [
    { id: 'AUD-001', name: 'Dormant Leads (Last 90 Days)', size: 4500, criteria: { status: 'Cold', product: 'Logistics' }, createdAt: '2026-04-15' },
    { id: 'AUD-002', name: 'High-Value Fleet Owners', size: 850, criteria: { niche: 'Fuel', fleetSize: '>50' }, createdAt: '2026-04-20' }
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/70 backdrop-blur-xl p-8 rounded-[3rem] border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-4">
            <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-500/20">
              <Target size={24} />
            </div>
            Marketing Hub
          </h1>
          <p className="text-slate-500 font-medium mt-2">Manage campaigns, build audiences, and track marketing ROI.</p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100/50 p-2 rounded-3xl">
          {['dashboard', 'campaigns', 'audiences', 'email'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab
                  ? 'bg-white text-slate-900 shadow-[0_4px_20px_rgb(0,0,0,0.08)]'
                  : 'text-slate-400 hover:bg-white/50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Content */}
      <div className="bg-white/70 backdrop-blur-xl rounded-[3.5rem] border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden p-8 lg:p-12">
        
        {activeTab === 'dashboard' && (
          <div className="space-y-10">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Campaign ROI Dashboard</h3>
              <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black hover:bg-slate-800 transition-all uppercase tracking-widest shadow-[0_8px_20px_rgb(15,23,42,0.3)]">
                Export Report
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Total Spend YTD', value: '$9,500', icon: DollarSign, color: 'text-rose-600', bg: 'bg-rose-50' },
                { label: 'Revenue Generated', value: '$50,500', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { label: 'Avg Campaign ROI', value: '431%', icon: BarChart3, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Total Leads Generated', value: '234', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' }
              ].map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                  <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4`}>
                    <stat.icon size={20} />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                  <p className="text-2xl font-black text-slate-900 tracking-tight">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'campaigns' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Campaign Creator</h3>
              <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl text-[10px] font-black hover:bg-blue-700 transition-all uppercase tracking-widest shadow-[0_8px_20px_rgb(37,99,235,0.3)]">
                <Plus size={14} /> New Campaign
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Campaign Name</th>
                    <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Budget / Spend</th>
                    <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">ROI</th>
                    <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {mockCampaigns.map((camp) => (
                    <tr key={camp.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="py-6">
                        <p className="font-bold text-slate-900">{camp.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{camp.id}</p>
                      </td>
                      <td className="py-6">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                          camp.status === 'Active' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-slate-50 text-slate-500 border-slate-200'
                        }`}>
                          {camp.status}
                        </span>
                      </td>
                      <td className="py-6 font-bold text-slate-600">
                        ${camp.spend.toLocaleString()} / ${camp.budget.toLocaleString()}
                      </td>
                      <td className="py-6">
                        <span className="text-emerald-600 font-black">{camp.roi}%</span>
                      </td>
                      <td className="py-6 text-right">
                        <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-800">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'audiences' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Audience Builder</h3>
              <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black hover:bg-slate-800 transition-all uppercase tracking-widest shadow-[0_8px_20px_rgb(15,23,42,0.3)]">
                <Plus size={14} /> Create Segment
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockAudiences.map(aud => (
                <div key={aud.id} className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-black text-lg text-slate-900">{aud.name}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{aud.id}</p>
                    </div>
                    <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-xs font-black">{aud.size.toLocaleString()} Contacts</span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4">
                    <p className="text-xs font-mono text-slate-600">{JSON.stringify(aud.criteria)}</p>
                  </div>
                  <button className="w-full py-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50">
                    Sync to Ad Platforms
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'email' && (
          <div className="max-w-3xl mx-auto space-y-8 py-10">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send size={24} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Email Blast Simulator</h3>
              <p className="text-slate-500 font-medium mt-2">Compose and dispatch targeted marketing materials to your audiences.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Select Audience</label>
                <select className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 ring-blue-500/20">
                  {mockAudiences.map(a => <option key={a.id} value={a.id}>{a.name} ({a.size} contacts)</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Subject Line</label>
                <input type="text" placeholder="Exclusive Freight Rates Inside..." className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 ring-blue-500/20" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Message Body</label>
                <textarea rows={6} placeholder="Type your email copy here..." className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 ring-blue-500/20"></textarea>
              </div>
              <button className="w-full py-4 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 shadow-[0_8px_20px_rgb(37,99,235,0.3)] transition-all flex items-center justify-center gap-2">
                <Mail size={16} /> Dispatch Blast
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
