import React, { useState } from 'react';
import { 
  Truck, 
  Box, 
  Globe, 
  Settings, 
  Container, 
  MapPin, 
  Clock, 
  Navigation, 
  MoreVertical, 
  Plus, 
  Search,
  Filter,
  ArrowUpRight,
  TrendingUp,
  Activity,
  Users
} from 'lucide-react';

interface Load {
  id: string;
  origin: string;
  destination: string;
  status: 'In Transit' | 'Pending' | 'Delivered' | 'Available';
  type: 'FTL' | 'LTL' | 'Reefer' | 'Flatbed' | 'Hazmat';
  carrier?: string;
  value: number;
}

export const LogisticsHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'loads' | 'brokerage' | 'dispatch'>('loads');

  const mockLoads: Load[] = [
    { id: 'LD-8821', origin: 'Chicago, IL', destination: 'Miami, FL', status: 'In Transit', type: 'FTL', carrier: 'NH Transport', value: 4500 },
    { id: 'LD-9932', origin: 'Dallas, TX', destination: 'Los Angeles, CA', status: 'Pending', type: 'Reefer', carrier: 'CoolLink Logistics', value: 5200 },
    { id: 'LD-7712', origin: 'Atlanta, GA', destination: 'New York, NY', status: 'Available', type: 'LTL', value: 1200 },
    { id: 'LD-4455', origin: 'Seattle, WA', destination: 'Phoenix, AZ', status: 'Delivered', type: 'Hazmat', carrier: 'SafeRoute Labs', value: 8900 },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-4">
            <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-xl shadow-slate-200">
              <Truck size={24} />
            </div>
            Logistics Command Center
          </h1>
          <p className="text-slate-500 font-medium mt-2">Managing global freight, brokerage, and dispatch operations.</p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-3.5 bg-white border border-slate-200 rounded-2xl text-xs font-black text-slate-600 hover:bg-slate-50 transition-all uppercase tracking-widest shadow-sm">
            <Filter size={14} /> Filter
          </button>
          <button 
            onClick={() => navigate('/crm/logistics/post-load')}
            className="flex items-center gap-2 px-6 py-3.5 bg-slate-900 text-white rounded-2xl text-xs font-black hover:bg-slate-800 transition-all uppercase tracking-widest shadow-xl shadow-slate-200"
          >
            <Plus size={14} /> Post Load
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Active Loads', value: '24', icon: Container, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Carrier Network', value: '156', icon: Globe, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Revenue YTD', value: '$452.8k', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'System Health', value: '99.8%', icon: Activity, color: 'text-slate-600', bg: 'bg-slate-50' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 group">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon size={20} />
              </div>
              <ArrowUpRight size={16} className="text-slate-300" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-2xl font-black text-slate-900 tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs / Terminal */}
      <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="p-2 border-b border-slate-50 flex gap-2">
          {['loads', 'brokerage', 'dispatch'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-8 py-4 rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                activeTab === tab
                  ? 'bg-slate-900 text-white shadow-lg shadow-slate-200'
                  : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-8 lg:p-12">
          {activeTab === 'loads' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Active Load Pipeline</h3>
                <div className="relative">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search load ID, carrier..." 
                    className="pl-12 pr-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 ring-slate-900/5 transition-all w-72" 
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Load ID</th>
                      <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Route</th>
                      <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                      <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Carrier</th>
                      <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Value</th>
                      <th className="pb-6 text-[10px) font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {mockLoads.map((load) => (
                      <tr key={load.id} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="py-6 font-black text-slate-900 text-sm">#{load.id}</td>
                        <td className="py-6">
                          <div className="flex items-center gap-3">
                            <div className="text-sm">
                              <p className="font-bold text-slate-900">{load.origin}</p>
                              <p className="text-[10px] text-slate-400">To {load.destination}</p>
                            </div>
                            <Navigation size={12} className="text-slate-300" />
                          </div>
                        </td>
                        <td className="py-6">
                          <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-200">
                            {load.type}
                          </span>
                        </td>
                        <td className="py-6 text-sm font-bold text-slate-600">{load.carrier || 'Unassigned'}</td>
                        <td className="py-6 text-sm font-black text-slate-900">${load.value.toLocaleString()}</td>
                        <td className="py-6 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                              load.status === 'In Transit' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                              load.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                              load.status === 'Pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                              'bg-slate-50 text-slate-400 border border-slate-100'
                            }`}>
                              {load.status}
                            </span>
                            <button className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
                              <MoreVertical size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'brokerage' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-10">
              <div className="bg-slate-50 rounded-[2.5rem] p-10 border border-slate-100">
                <Globe size={32} className="text-slate-900 mb-6" />
                <h4 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Carrier Marketplace</h4>
                <p className="text-slate-500 font-medium mb-8">Access our network of 10k+ vetted carriers for immediate load coverage.</p>
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-3">
                    {[1,2,3,4].map(i => <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden"><img src={`https://i.pravatar.cc/100?img=${i+10}`} /></div>)}
                  </div>
                  <span className="text-xs font-bold text-slate-400">+150 active carriers</span>
                </div>
              </div>
              <div className="bg-blue-600 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-blue-500/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-20"><TrendingUp size={120} /></div>
                <h4 className="text-2xl font-black tracking-tight mb-2 relative z-10">Rate Intelligence</h4>
                <p className="text-blue-100/70 font-medium mb-8 relative z-10">Market analysis for Chicago to Dallas lane is currently trending +12%.</p>
                <button className="px-8 py-3.5 bg-white text-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest relative z-10 hover:bg-blue-50 transition-all">
                  Analyze Lanes
                </button>
              </div>
            </div>
          )}

          {activeTab === 'dispatch' && (
            <div className="p-10 text-center border-2 border-dashed border-slate-100 rounded-[3rem]">
              <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-300 mx-auto mb-6">
                <Clock size={32} />
              </div>
              <h4 className="text-xl font-black text-slate-900 mb-2">Dispatch Queue</h4>
              <p className="text-slate-500 font-medium mb-8 max-w-sm mx-auto">Real-time driver coordination and scheduling module is initializing.</p>
              <button className="px-8 py-4 bg-slate-100 text-slate-400 rounded-full text-[10px] font-black tracking-widest uppercase cursor-not-allowed">
                Assign Dispatcher
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
