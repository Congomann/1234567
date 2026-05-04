import React, { useState } from 'react';
import { 
  MapPin, 
  Truck, 
  DollarSign, 
  Clock, 
  Shield, 
  ChevronRight, 
  ArrowLeft, 
  Save, 
  Info, 
  CheckCircle2,
  Navigation,
  Globe,
  Link
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TrailerType, FreightLoad } from '../../../types';
import { Backend } from '../../../services/apiBackend';

/**
 * NHFG LOGISTICS - LOAD POSTING TERMINAL
 * High-performance brokerage portal for agents and brokers.
 */

export const LoadPostingTerminal: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<Partial<FreightLoad>>({
    origin: '',
    destination: '',
    distance: 0,
    totalRate: 0,
    pickupDate: '',
    deliveryDate: '',
    trailerType: TrailerType.VAN,
    requirements: {
      cleanTrailer: true,
      onTimeGuarantee: true,
      trackingRequired: true
    },
    description: ''
  });

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const loadId = crypto.randomUUID();
      await Backend.saveLoad({
        ...formData,
        id: loadId,
        createdAt: new Date().toISOString(),
        status: 'available'
      });
      setSuccess(true);
    } catch (error) {
      console.error('Failed to post load:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleRequirement = (key: keyof FreightLoad['requirements']) => {
    setFormData(prev => ({
      ...prev,
      requirements: {
        ...prev.requirements!,
        [key]: !prev.requirements![key]
      }
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 animate-in fade-in duration-700">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate('/crm/logistics')}
              className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-900 transition-all hover:shadow-md"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Freight Hub</h1>
              <p className="text-slate-500 font-medium">Dedicated Load Posting Terminal</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 px-6 py-3 bg-blue-50 rounded-2xl border border-blue-100 text-blue-600 text-[10px] font-black uppercase tracking-widest">
            <Globe size={14} className="animate-pulse" /> Live Marketplace Active
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* FORM COLUMN */}
          <div className="lg:col-span-2">
            <form onSubmit={handlePost} className="bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-10 md:p-14 space-y-12">
              
              {/* SECTION: ROUTE */}
              <section className="space-y-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">
                    <Navigation size={18} />
                  </div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight text-balance">Route Logistics (Point A to D)</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Origin (Point A)</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                      <input 
                        type="text" 
                        placeholder="City, State"
                        required
                        className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 ring-slate-900/5 transition-all"
                        value={formData.origin}
                        onChange={e => setFormData({...formData, origin: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Destination (Point D)</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                      <input 
                        type="text" 
                        placeholder="City, State"
                        required
                        className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 ring-slate-900/5 transition-all"
                        value={formData.destination}
                        onChange={e => setFormData({...formData, destination: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Total Miles</label>
                    <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                      <Navigation size={16} className="text-slate-300" />
                      <input 
                        type="number" 
                        placeholder="0"
                        className="bg-transparent text-sm font-black text-slate-900 w-full outline-none"
                        value={formData.distance || ''}
                        onChange={e => setFormData({...formData, distance: Number(e.target.value)})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Estimated Rate (Total Cost)</label>
                    <div className="flex items-center gap-3 p-4 bg-slate-900 text-white rounded-2xl shadow-xl shadow-slate-200">
                      <DollarSign size={16} className="text-slate-400" />
                      <input 
                        type="number" 
                        placeholder="0.00"
                        className="bg-transparent text-[20px] font-black w-full outline-none"
                        value={formData.totalRate || ''}
                        onChange={e => setFormData({...formData, totalRate: Number(e.target.value)})}
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* SECTION: EQUIPMENT */}
              <section className="space-y-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                    <Truck size={18} />
                  </div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Trailer Configuration</h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.values(TrailerType).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({...formData, trailerType: type})}
                      className={`p-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                        formData.trailerType === type 
                          ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200' 
                          : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </section>

              {/* SECTION: COMPLIANCE */}
              <section className="space-y-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                    <Shield size={18} />
                  </div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Industrial Compliance Standards</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { key: 'cleanTrailer', label: 'Must be Clean Trailer', icon: CheckCircle2 },
                    { key: 'onTimeGuarantee', label: 'On-Time Pick-up/Delivery', icon: Clock },
                    { key: 'trackingRequired', label: 'Must Accept Tracking Link', icon: Link }
                  ].map((req) => (
                    <button
                      key={req.key}
                      type="button"
                      onClick={() => toggleRequirement(req.key as any)}
                      className={`p-6 rounded-[2rem] border text-left flex flex-col justify-between h-40 transition-all ${
                        (formData.requirements as any)[req.key]
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900 shadow-sm'
                          : 'bg-white border-slate-100 text-slate-400 grayscale opacity-50'
                      }`}
                    >
                      <req.icon size={24} className={ (formData.requirements as any)[req.key] ? 'text-emerald-600' : '' } />
                      <span className="text-[11px] font-black uppercase tracking-widest leading-tight">{req.label}</span>
                    </button>
                  ))}
                </div>
              </section>

              {/* DESCRIPTION & SUBMIT */}
              <section className="space-y-6 pt-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Special Load Instructions</label>
                  <textarea 
                    placeholder="Provide specific handling instructions, dock numbers, or access codes..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-[2rem] p-8 text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 ring-slate-900/5 transition-all min-h-[160px]"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-6 bg-slate-900 text-white rounded-[2rem] text-sm font-black uppercase tracking-widest shadow-2xl shadow-slate-300 hover:bg-black transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="animate-pulse">Broadcasting to Marketplace...</span>
                  ) : (
                    <>
                      <Save size={16} /> Finalize & Post Load Record
                    </>
                  )}
                </button>
              </section>

            </form>
          </div>

          {/* SIDEBAR COLUMN */}
          <div className="space-y-8">
            <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl shadow-slate-300 relative overflow-hidden">
               <div className="absolute -right-10 -bottom-10 opacity-10 rotate-12">
                  <Truck size={240} />
               </div>
               <div className="relative z-10">
                 <h3 className="text-xl font-black tracking-tight mb-2">Market Intelligence</h3>
                 <p className="text-slate-400 text-xs font-medium leading-relaxed mb-8">Freight demand in the Midwest is currently trending 14% higher than average.</p>
                 
                 <div className="space-y-6">
                   <div className="p-5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                     <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Average CPM</p>
                     <p className="text-2xl font-black">$2.84 <span className="text-[10px] text-emerald-400 ml-1">+2.4%</span></p>
                   </div>
                   <div className="p-5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                     <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1">Capacity Index</p>
                     <p className="text-2xl font-black">Medium</p>
                   </div>
                 </div>
               </div>
            </div>

            <div className="bg-white rounded-[3rem] border border-slate-100 p-10 shadow-sm">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Brokerage Alerts</h3>
              <div className="space-y-8">
                {[
                  { title: "ID-9921 Assigned", time: "2m ago", desc: "NH Transport accepted your load for Phoenix." },
                  { title: "Capacity Alert", time: "14m ago", desc: "Reefer availability in Chicago is extremely low today." },
                  { title: "Tracking Active", time: "1h ago", desc: "Load LD-8810 is successfully pinging via MacroPoint." }
                ].map((alert, i) => (
                  <div key={i} className="flex gap-4 group cursor-pointer">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1 flex-shrink-0 group-hover:scale-150 transition-transform" />
                    <div>
                      <div className="flex items-center justify-between gap-4 mb-1">
                        <p className="text-xs font-black text-slate-900 tracking-tight">{alert.title}</p>
                        <span className="text-[10px] font-bold text-slate-300">{alert.time}</span>
                      </div>
                      <p className="text-xs text-slate-500 leading-snug">{alert.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-8 bg-blue-50 border border-blue-100 rounded-[2.5rem] flex items-center gap-6">
               <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-blue-600 border border-white">
                  <Info size={24} />
               </div>
               <div>
                  <h4 className="text-sm font-black text-blue-900 mb-1">Broker Note</h4>
                  <p className="text-xs text-blue-700/70 font-medium">Always verify carrier authority and insurance before finalizing assignments in the Command Center.</p>
               </div>
            </div>
          </div>

        </div>

      </div>

      {/* SUCCESS OVERLAY */}
      {success && (
        <div className="fixed inset-0 z-[200] bg-slate-900/40 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-500">
           <div className="bg-white rounded-[3.5rem] p-16 text-center max-w-sm shadow-2xl shadow-black/20 animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-500/10">
                 <CheckCircle2 size={40} />
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">Load Broadcasted</h2>
              <p className="text-slate-500 font-medium mb-12">Your freight record has been finalized and is now visible to our carrier network.</p>
              <button 
                onClick={() => navigate('/crm/logistics')}
                className="w-full py-5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl"
              >
                Return to Terminal
              </button>
           </div>
        </div>
      )}
    </div>
  );
};
