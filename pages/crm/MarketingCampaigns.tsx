import React, { useState, useEffect } from 'react';
import { MarketingCampaign, MarketingAudience } from '../../types';
import { Target, Users, Send, TrendingUp, Plus, Search, Filter, ArrowUpRight, BarChart3, Mail, DollarSign, Share2, CreditCard } from 'lucide-react';
import { SocialMediaIntegrations } from '../../components/marketing/SocialMediaIntegrations';
import { PaymentApprovalModal } from '../../components/marketing/PaymentApprovalModal';

export const CampaignManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'campaigns' | 'audiences' | 'email' | 'social' | 'payments'>('dashboard');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedCampaignForPayment, setSelectedCampaignForPayment] = useState<MarketingCampaign | null>(null);

  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [audiences, setAudiences] = useState<MarketingAudience[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMarketingData = async () => {
      try {
        const [campRes, audRes] = await Promise.all([
          fetch('http://localhost:3001/api/marketing/campaigns'),
          fetch('http://localhost:3001/api/marketing/audiences')
        ]);
        
        if (campRes.ok) {
          const data = await campRes.json();
          setCampaigns(data);
        }
        if (audRes.ok) {
          const data = await audRes.json();
          setAudiences(data);
        }
      } catch (error) {
        console.error('Error fetching marketing data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMarketingData();
  }, []);

  const handleFundCampaign = (campaign: MarketingCampaign) => {
    setSelectedCampaignForPayment(campaign);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentApproved = (transaction: any) => {
    // Update campaign status to active on funding
    setCampaigns(prev => prev.map(c => c.id === transaction.campaignId ? { ...c, status: 'Active' } : c));
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 font-sans">
      {/* Header & Tabs */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-white/70 backdrop-blur-2xl p-8 rounded-[3rem] border border-white/60 shadow-[0_8px_40px_rgb(0,0,0,0.03)]">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-4">
            <div className="p-3 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-2xl shadow-lg shadow-blue-500/30">
              <Target size={28} />
            </div>
            Marketing Hub Pro
          </h1>
          <p className="text-slate-500 font-medium mt-2 text-lg">Omnichannel campaigns, automated audiences, and seamless budget approvals.</p>
        </div>

        <div className="flex items-center gap-1 bg-slate-200/50 p-1.5 rounded-full overflow-x-auto hide-scrollbar">
          {[
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'campaigns', label: 'Campaigns' },
            { id: 'audiences', label: 'Audiences' },
            { id: 'email', label: 'Email' },
            { id: 'social', label: 'Social' },
            { id: 'payments', label: 'Payments' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-white text-slate-900 shadow-[0_4px_20px_rgb(0,0,0,0.08)] scale-100'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-white/40 scale-95'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Content */}
      <div className="bg-white/70 backdrop-blur-2xl rounded-[3.5rem] border border-white/60 shadow-[0_8px_40px_rgb(0,0,0,0.03)] overflow-hidden p-8 lg:p-12 relative min-h-[500px]">
        
        {activeTab === 'dashboard' && (
          <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Campaign ROI Dashboard</h3>
              <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-full text-xs font-bold hover:bg-slate-800 transition-all uppercase tracking-widest shadow-lg shadow-slate-900/20">
                Export Report
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Total Spend YTD', value: '$9,500', icon: DollarSign, color: 'text-rose-600', bg: 'bg-rose-50' },
                { label: 'Revenue Generated', value: '$50,500', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { label: 'Avg Campaign ROI', value: '431%', icon: BarChart3, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Total Leads Generated', value: '234', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' }
              ].map((stat, i) => (
                <div key={i} className="bg-white/80 p-8 rounded-[2.5rem] border border-white/60 shadow-sm hover:shadow-lg transition-shadow">
                  <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-6 shadow-inner`}>
                    <stat.icon size={24} />
                  </div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                  <p className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'campaigns' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Campaign Creator</h3>
              <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-full text-xs font-bold hover:bg-blue-700 transition-all uppercase tracking-widest shadow-lg shadow-blue-600/30">
                <Plus size={16} /> New Campaign
              </button>
            </div>
            <div className="overflow-x-auto rounded-[2rem] border border-slate-100 bg-white shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Campaign Name</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Budget / Spend</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">ROI</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {campaigns.map((camp) => (
                    <tr key={camp.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-5">
                        <p className="font-bold text-slate-900 text-sm">{camp.name}</p>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest mt-1">{camp.id}</p>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          camp.status === 'Active' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                          camp.status === 'Draft' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                           'bg-slate-50 text-slate-500 border-slate-200'
                        }`}>
                          {camp.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 font-bold text-slate-600 text-sm">
                        ${camp.spend.toLocaleString()} <span className="text-slate-400 font-medium">/ ${camp.budget.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-emerald-600 font-black text-sm">{camp.roi > 0 ? `${camp.roi}%` : '--'}</span>
                      </td>
                      <td className="px-6 py-5 text-right space-x-3">
                        {camp.status === 'Draft' && (
                           <button onClick={() => handleFundCampaign(camp)} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors bg-indigo-50 px-4 py-2 rounded-full">Fund</button>
                        )}
                        <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-800 transition-colors">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'social' && (
          <SocialMediaIntegrations />
        )}

        {activeTab === 'payments' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Payments & Billing</h3>
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                <CreditCard size={18} /> Default: <span className="text-slate-900">Apple Card (4242)</span>
              </div>
            </div>
            
            <div className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm">
              <h4 className="text-lg font-bold text-slate-900 mb-6">Recent Transactions</h4>
              <div className="space-y-4">
                {[
                  { id: 'TXN-94821', campaign: 'Q3 Freight Expansion', amount: 4500, date: 'Jul 15, 2026', status: 'Succeeded' },
                  { id: 'TXN-94800', campaign: 'Fuel Niche Reactivation', amount: 5000, date: 'May 02, 2026', status: 'Succeeded' }
                ].map(txn => (
                  <div key={txn.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{txn.campaign}</p>
                      <p className="text-xs font-medium text-slate-400 mt-0.5">{txn.id} • {txn.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-slate-900">${txn.amount.toLocaleString()}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mt-1">{txn.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'audiences' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Audience Builder</h3>
              <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-full text-xs font-bold hover:bg-slate-800 transition-all uppercase tracking-widest shadow-lg shadow-slate-900/20">
                <Plus size={16} /> Create Segment
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {audiences.map(aud => (
                <div key={aud.id} className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h4 className="font-bold text-lg text-slate-900">{aud.name}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{aud.id}</p>
                    </div>
                    <span className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-xs font-bold">{aud.size.toLocaleString()} Contacts</span>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 mb-6 font-mono text-xs text-slate-600">
                    {JSON.stringify(aud.criteria, null, 2)}
                  </div>
                  <button className="w-full py-4 bg-white border-2 border-slate-100 text-slate-600 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-slate-50 hover:border-slate-200 transition-all flex justify-center items-center gap-2">
                    <Share2 size={16} /> Sync to Ad Platforms
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'email' && (
          <div className="max-w-3xl mx-auto space-y-8 py-10 animate-in zoom-in-95 duration-500">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                <Send size={32} />
              </div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">Email Blast Simulator</h3>
              <p className="text-slate-500 font-medium mt-2 text-lg">Compose and dispatch targeted marketing materials to your audiences.</p>
            </div>

            <div className="space-y-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Select Audience</label>
                <select className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 ring-indigo-500/20 transition-all appearance-none">
                  {audiences.map((aud) => (<option key={aud.id} value={aud.id}>{aud.name} ({aud.size} contacts)</option>))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Subject Line</label>
                <input type="text" placeholder="Exclusive Freight Rates Inside..." className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 ring-indigo-500/20 transition-all" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Message Body</label>
                <textarea rows={8} placeholder="Type your email copy here..." className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 ring-indigo-500/20 transition-all resize-none"></textarea>
              </div>
              <button className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl text-sm font-bold uppercase tracking-widest hover:opacity-90 shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2">
                <Mail size={18} /> Dispatch Blast
              </button>
            </div>
          </div>
        )}
      </div>

      <PaymentApprovalModal 
        isOpen={isPaymentModalOpen} 
        onClose={() => setIsPaymentModalOpen(false)} 
        campaignId={selectedCampaignForPayment?.id || ''} 
        amount={selectedCampaignForPayment?.budget || 0}
        onApprove={handlePaymentApproved}
      />
    </div>
  );
};

