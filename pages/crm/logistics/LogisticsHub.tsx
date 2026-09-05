import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  Box, 
  Globe, 
  Container, 
  MapPin, 
  Clock, 
  Navigation, 
  MoreVertical, 
  Plus, 
  PlusCircle,
  ArrowUpRight,
  TrendingUp,
  Activity,
  Users,
  Send,
  ExternalLink,
  X,
  CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LogisticsNiche } from '../../../types';
import { Backend } from '../../../services/apiBackend';
import { Tab3DBanner } from '../../../components/shared/Tab3DBanner';

interface KanbanDeal {
  id: string;
  realId: string;
  title: string;
  value: number;
  client: string;
  nicheSpecificField: string;
  status: string;
  trackingToken?: string;
  driverPhone?: string;
  driverEmail?: string;
}

const TRUCKING_STAGES = ['Dispatched', 'En Route', 'Delivered'];
const FUEL_STAGES = ['Contract Sent', 'Delivered', 'Paid'];
const FREIGHT_STAGES = ['available', 'booked', 'in_transit', 'delivered'];

export const LogisticsHub: React.FC = () => {
  const navigate = useNavigate();
  const [activeNiche, setActiveNiche] = useState<LogisticsNiche>(LogisticsNiche.FREIGHT_BROKERAGE);
  const [loading, setLoading] = useState(true);
  const [loads, setLoads] = useState<any[]>([]);

  // Dispatch Tracking Modal State
  const [selectedDeal, setSelectedDeal] = useState<KanbanDeal | null>(null);
  const [driverPhone, setDriverPhone] = useState('');
  const [driverEmail, setDriverEmail] = useState('');
  const [dispatching, setDispatching] = useState(false);
  const [dispatchSuccess, setDispatchSuccess] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState('');

  const fetchLoads = async () => {
    try {
      setLoading(true);
      const data = await Backend.getLoads();
      setLoads(data);
    } catch (err) {
      console.error('Failed to fetch loads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoads();
  }, []);

  // Map Real Loads to Kanban Structure
  const getFreightDeals = () => {
    const stages: Record<string, KanbanDeal[]> = {
        'available': [],
        'booked': [],
        'in_transit': [],
        'delivered': []
    };

    loads.forEach(load => {
        const stage = load.status || 'available';
        if (stages[stage]) {
            stages[stage].push({
                id: 'LD-' + load.id.substring(0, 5).toUpperCase(),
                realId: load.id,
                title: load.origin + ' to ' + load.destination,
                value: load.totalRate || load.rate_usd || 0,
                client: 'NH Brokerage',
                nicheSpecificField: load.trailerType || load.equipment_type || 'Dry Van',
                status: stage,
                trackingToken: load.tracking_token,
                driverPhone: load.carrier_driver_phone,
                driverEmail: load.carrier_driver_email
            });
        }
    });
    return stages;
  };

  // Mock Deals for other niches
  const mockDeals: Record<LogisticsNiche, Record<string, KanbanDeal[]>> = {
    [LogisticsNiche.TRUCKING]: {
      'Dispatched': [{ id: 'TRK-101', realId: 'mock-101', title: 'Chicago to Miami (FTL)', value: 4500, client: 'NH Transport', nicheSpecificField: 'Reefer', status: 'Dispatched' }],
      'En Route': [{ id: 'TRK-102', realId: 'mock-102', title: 'Dallas to LA', value: 5200, client: 'CoolLink', nicheSpecificField: 'Flatbed', status: 'En Route' }],
      'Delivered': [{ id: 'TRK-103', realId: 'mock-103', title: 'Atlanta to NY', value: 1200, client: 'SafeRoute', nicheSpecificField: 'Dry Van', status: 'Delivered' }]
    },
    [LogisticsNiche.FUEL]: {
      'Contract Sent': [{ id: 'FUL-201', realId: 'mock-201', title: 'Weekly Diesel Supply', value: 12000, client: 'FleetCorp', nicheSpecificField: '4,000 Gallons', status: 'Contract Sent' }],
      'Delivered': [{ id: 'FUL-202', realId: 'mock-202', title: 'Aviation Fuel Spot', value: 8500, client: 'SkyWest', nicheSpecificField: '2,500 Gallons', status: 'Delivered' }],
      'Paid': []
    },
    [LogisticsNiche.FREIGHT_BROKERAGE]: getFreightDeals()
  };

  const getStats = () => {
    switch(activeNiche) {
      case LogisticsNiche.TRUCKING:
        return [
          { label: 'Active Fleet', value: '42', icon: Truck, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Miles Driven YTD', value: '1.2M', icon: MapPin, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Revenue YTD', value: '$2.1M', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'On-Time Rate', value: '98.5%', icon: Activity, color: 'text-slate-600', bg: 'bg-slate-50' }
        ];
      case LogisticsNiche.FUEL:
        return [
          { label: 'Active Contracts', value: '18', icon: Container, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Gallons Moved', value: '450k', icon: Globe, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Revenue YTD', value: '$1.4M', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Margin Average', value: '8.2%', icon: Activity, color: 'text-slate-600', bg: 'bg-slate-50' }
        ];
      case LogisticsNiche.FREIGHT_BROKERAGE:
        return [
          { label: 'Active Loads', value: loads.length.toString(), icon: Box, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Carrier Network', value: '156', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Revenue YTD', value: '$452.8k', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'System Health', value: '99.8%', icon: Activity, color: 'text-slate-600', bg: 'bg-slate-50' }
        ];
    }
  };

  const getStages = () => {
    switch(activeNiche) {
      case LogisticsNiche.TRUCKING: return TRUCKING_STAGES;
      case LogisticsNiche.FUEL: return FUEL_STAGES;
      case LogisticsNiche.FREIGHT_BROKERAGE: return FREIGHT_STAGES;
    }
  };

  // Submit tracking dispatch request to backend
  const handleSendTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeal) return;
    
    setDispatching(true);
    try {
      const res = await fetch('/api/logistics/loads/' + selectedDeal.realId + '/send-tracking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('nhfg_access_token')
        },
        body: JSON.stringify({
          driverPhone,
          driverEmail
        })
      });
      
      const data = await res.json();
      if (res.ok && data.success) {
        setGeneratedUrl(data.trackingUrl);
        setDispatchSuccess(true);
        fetchLoads(); // Refresh Kanban board
      } else {
        alert(data.error || 'Failed to dispatch tracking link.');
      }
    } catch (err: any) {
      console.error(err);
      alert('Error sending tracking link.');
    } finally {
      setDispatching(false);
    }
  };

  const openDispatchModal = (deal: KanbanDeal) => {
    setSelectedDeal(deal);
    setDriverPhone(deal.driverPhone || '');
    setDriverEmail(deal.driverEmail || '');
    setDispatchSuccess(false);
    setGeneratedUrl('');
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <Tab3DBanner
        cards={[
          { title: "Active Freight Loads", value: loads.length + " Freight Loads", subtitle: "Dispatched & Live", emoji: "🚚", gradient: "cyan", linkText: "Load Board", linkPath: "#load_board" },
          { title: "Fleet GPS Dispatch", value: "42 Active Trucks", subtitle: "Real-Time Tracking", emoji: "📍", gradient: "yellow" },
          { title: "Carrier Rate Confirmations", value: "$420,000 Gross", subtitle: "100% Rate Locked", emoji: "📦", gradient: "pink" }
        ]}
      />

      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/70 backdrop-blur-xl p-8 rounded-[3rem] border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-4">
            <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-xl shadow-slate-200">
              <Truck size={24} />
            </div>
            Logistics Command Center
          </h1>
          <p className="text-slate-500 font-medium mt-2">Managing global freight, brokerage, and dispatch operations.</p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100/50 p-2 rounded-3xl">
          {Object.values(LogisticsNiche).map((niche) => (
            <button
              key={niche}
              onClick={() => setActiveNiche(niche)}
              className={"px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all " + (activeNiche === niche ? "bg-white text-slate-900 shadow-[0_4px_20px_rgb(0,0,0,0.08)]" : "text-slate-400 hover:bg-white/50")}
            >
              {niche}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {getStats().map((stat, i) => (
          <div key={i} className="bg-white/70 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 group">
            <div className="flex items-center justify-between mb-4">
              <div className={"p-3 rounded-2xl " + stat.bg + " " + stat.color + " group-hover:scale-110 transition-transform"}>
                <stat.icon size={20} />
              </div>
              <ArrowUpRight size={16} className="text-slate-300" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-2xl font-black text-slate-900 tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Kanban Board */}
      <div id="load_board" className="bg-white/70 backdrop-blur-xl rounded-[3.5rem] border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden p-8 lg:p-12">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase tracking-[0.2em]">{activeNiche} Pipeline</h3>
          <button 
            onClick={() => navigate('/crm/logistics/post-load')}
            className="flex items-center gap-2 px-6 py-3.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black hover:bg-slate-800 transition-all uppercase tracking-widest shadow-[0_8px_20px_rgb(15,23,42,0.3)]"
          >
            <Plus size={14} /> Post Load
          </button>
        </div>

        <div className="flex overflow-x-auto gap-6 pb-6 snap-x">
          {getStages().map((stage) => (
            <div key={stage} className="flex-1 min-w-[320px] snap-center">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{stage}</h4>
                <span className="bg-slate-100 text-slate-500 text-xs font-bold px-3 py-1 rounded-full">
                  {mockDeals[activeNiche][stage]?.length || 0}
                </span>
              </div>
              <div className="space-y-4">
                {mockDeals[activeNiche][stage]?.map((deal) => (
                  <div key={deal.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between min-h-[220px]">
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{deal.id}</span>
                        <div className="p-2 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer" onClick={() => alert('Options menu coming soon')}>
                          <MoreVertical size={14} className="text-slate-300" />
                        </div>
                      </div>
                      <h5 className="font-black text-slate-900 mb-1 tracking-tight group-hover:text-blue-600 transition-colors">{deal.title}</h5>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{deal.client}</p>
                    </div>

                    {/* DISPATCH ACTIONS & STATUS INDICATORS */}
                    {activeNiche === LogisticsNiche.FREIGHT_BROKERAGE && (
                      <div className="mt-4 pt-4 border-t border-slate-50 space-y-3">
                        {deal.status === 'available' && (
                          <button
                            onClick={() => openDispatchModal(deal)}
                            className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all"
                          >
                            <Send size={11} /> Dispatch &amp; Track Driver
                          </button>
                        )}
                        {(deal.status === 'booked' || deal.status === 'in_transit') && (
                          <div className="flex gap-2">
                            <a
                              href={"/track/" + deal.trackingToken}
                              target="_blank"
                              rel="noreferrer"
                              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shadow-md shadow-emerald-500/10 font-bold"
                            >
                              <Navigation size={11} className="animate-pulse" /> Track Live 🛰️
                            </a>
                            <button
                              onClick={() => openDispatchModal(deal)}
                              className="px-3 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-xl transition-all"
                              title="Update Driver Contact Info"
                            >
                              <PlusCircle size={14} />
                            </button>
                          </div>
                        )}
                        {deal.status === 'delivered' && (
                          <div className="w-full py-2 bg-slate-50 border border-slate-100 rounded-xl text-slate-500 text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2">
                            <CheckCircle2 size={12} className="text-emerald-500" /> Freight Delivered
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-50">
                      <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full uppercase tracking-widest">{deal.nicheSpecificField}</span>
                      <span className="font-black text-slate-900 tracking-tighter">{"$" + deal.value.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
                {(!mockDeals[activeNiche][stage] || mockDeals[activeNiche][stage].length === 0) && (
                  <div className="h-32 border-2 border-dashed border-slate-100 rounded-3xl flex items-center justify-center bg-slate-50/50">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">No Active Records</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DISPATCH & TRACKING LINK TRIGGER MODAL */}
      {selectedDeal && (
        <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 w-full max-w-lg p-8 md:p-10 shadow-2xl relative overflow-hidden animate-in zoom-in-95">
            
            <button 
              onClick={() => setSelectedDeal(null)}
              className="absolute top-6 right-6 p-2 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-800 rounded-xl transition-all"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <Truck size={20} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Dispatch Telematics</h3>
                <p className="text-xs text-slate-500 font-medium">Load: <strong className="text-slate-900 font-semibold">{selectedDeal.id}</strong></p>
              </div>
            </div>

            {dispatchSuccess ? (
              <div className="space-y-6 text-center py-4">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                  <CheckCircle2 size={28} />
                </div>
                <div className="space-y-1">
                  <h4 className="font-black text-slate-900 text-base">Dispatch Link Sent!</h4>
                  <p className="text-xs text-slate-500 font-semibold max-w-sm mx-auto leading-relaxed">
                    The background live tracking instructions have been emailed to the driver at <strong className="text-slate-800 font-bold">{driverEmail}</strong>.
                  </p>
                </div>
                
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-left space-y-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Generated Driver URL</span>
                  <a 
                    href={generatedUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-xs text-blue-600 hover:underline font-bold font-mono break-all inline-flex items-center gap-1.5"
                  >
                    {generatedUrl} <ExternalLink size={12} />
                  </a>
                </div>

                <button
                  onClick={() => setSelectedDeal(null)}
                  className="w-full py-4 bg-slate-900 hover:bg-black text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-xl transition-all"
                >
                  Return to Dashboard
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendTracking} className="space-y-6">
                <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                  Generate and send a background live telematics link. The carrier driver will open this URL on their mobile browser to report real-time GPS coordinates.
                </p>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Driver Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. driver@carriertrucking.com"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                      value={driverEmail}
                      onChange={e => setDriverEmail(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Driver Phone Number (Optional)</label>
                    <input
                      type="tel"
                      placeholder="e.g. (555) 019-9000"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                      value={driverPhone}
                      onChange={e => setDriverPhone(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={dispatching}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-600/10 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {dispatching ? (
                    <span className="animate-pulse">Generating Link &amp; Sending Dispatch...</span>
                  ) : (
                    <>
                      <Send size={14} /> Send Tracking Link
                    </>
                  )}
                </button>
              </form>
            )}

          </div>
        </div>
      )}
    </div>
  );
};
