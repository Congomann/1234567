import React, { useEffect } from 'react';
import { Truck, MapPin, Calendar, Clock, ShieldCheck, ArrowRight, User, Phone, Mail, Package } from 'lucide-react';
import { Link } from 'react-router-dom';

export const LoadBooking: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Header */}
      <div className="bg-slate-900 pt-48 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent"></div>
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <span className="inline-block px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mb-8">
            Freight Coordination
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-8">
            Precision Load Booking.
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium">
            Lock in your next lane with NHFG's elite brokerage. Fast, secure, and reliable freight matching.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Booking Form */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-[3rem] p-10 md:p-16 shadow-2xl shadow-slate-900/5 border border-slate-100">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-10">Carrier Information</h2>
              
              <form className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <User size={12} /> Contact Name
                    </label>
                    <input 
                      type="text" 
                      placeholder="John Doe"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold text-slate-900 focus:outline-none focus:ring-4 ring-blue-500/10 transition-all"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Truck size={12} /> Company / MC#
                    </label>
                    <input 
                      type="text" 
                      placeholder="Logistic Co / MC123456"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold text-slate-900 focus:outline-none focus:ring-4 ring-blue-500/10 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Mail size={12} /> Email Address
                    </label>
                    <input 
                      type="email" 
                      placeholder="john@logistics.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold text-slate-900 focus:outline-none focus:ring-4 ring-blue-500/10 transition-all"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Phone size={12} /> Phone Number
                    </label>
                    <input 
                      type="tel" 
                      placeholder="(555) 000-0000"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold text-slate-900 focus:outline-none focus:ring-4 ring-blue-500/10 transition-all"
                    />
                  </div>
                </div>

                <div className="pt-8 border-t border-slate-100">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight mb-8">Lane & Equipment</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <MapPin size={12} /> Preferred Lane
                      </label>
                      <input 
                        type="text" 
                        placeholder="Origin to Destination"
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold text-slate-900 focus:outline-none focus:ring-4 ring-blue-500/10 transition-all"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Package size={12} /> Equipment Type
                      </label>
                      <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold text-slate-900 focus:outline-none focus:ring-4 ring-blue-500/10 transition-all appearance-none">
                        <option>Dry Van</option>
                        <option>Reefer</option>
                        <option>Flatbed</option>
                        <option>Step Deck</option>
                        <option>Hotshot</option>
                      </select>
                    </div>
                  </div>
                </div>

                <button className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-slate-900/20 hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-3">
                  Submit Booking Request <ArrowRight size={16} />
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-8">
            <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl">
              <h3 className="text-xl font-black mb-8 tracking-tight">Booking Requirements</h3>
              <ul className="space-y-6">
                {[
                  { icon: ShieldCheck, title: 'Valid MC/DOT#', desc: 'Must be active for at least 90 days.' },
                  { icon: Calendar, title: 'Insurance Policy', desc: '$1M Liability / $100k Cargo minimum.' },
                  { icon: Clock, title: 'Punctuality', desc: '98% on-time performance required.' },
                ].map((item, i) => (
                  <li key={i} className="flex gap-4">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                      <item.icon size={18} className="text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest mb-1">{item.title}</p>
                      <p className="text-[11px] text-slate-400 font-medium leading-relaxed">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-blue-600 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700"></div>
              <h3 className="text-xl font-black mb-4 tracking-tight relative z-10">Need Assistance?</h3>
              <p className="text-blue-100 text-sm font-medium mb-8 relative z-10 leading-relaxed">
                Our logistics coordinators are available 24/7 to help you secure the best loads.
              </p>
              <a href="tel:800-555-0199" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-white text-blue-600 px-6 py-3 rounded-full hover:bg-slate-50 transition-colors">
                Call Support
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
