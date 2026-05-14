import React, { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { 
  Truck, Box, Globe, Settings, ArrowRight, CheckCircle, HelpCircle, 
  ShieldCheck, Zap, Search, Landmark, MapPin, Calendar, Clock, 
  User, Phone, Mail, Package, History, Star, TrendingUp, CheckCircle2, 
  Filter, Navigation, DollarSign, ExternalLink 
} from "lucide-react";
import { TestimonialsSection } from "../../components/TestimonialsSection";
import { SpeakToAdvisorForm } from "../../components/SpeakToAdvisorForm";
import { ProductType, TrailerType, FreightLoad } from "../../types";

export const LogisticsHub: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const viewMode = (searchParams.get("view") || "overview") as "overview" | "booking" | "search" | "listing";
  const [selectedNeed, setSelectedNeed] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [viewMode]);

  // Data from LogisticsServices
  const shippingNeeds = [
    { id: "bulk", label: "Large, high-volume shipments requiring a full trailer", suggestion: "ftl", suggestionName: "Full Truckload (FTL)" },
    { id: "small", label: "Cost-effective shipping for smaller, partial loads", suggestion: "ltl", suggestionName: "Less Than Truckload (LTL)" },
    { id: "specialized", label: "Temperature-sensitive or hazardous materials (Hazmat)", suggestion: "specialized", suggestionName: "Specialized Trucking" },
    { id: "brokerage", label: "Need to find reliable carriers at competitive rates", suggestion: "brokerage", suggestionName: "Freight Brokerage" },
    { id: "dispatch", label: "Professional load coordination and driver management", suggestion: "dispatch", suggestionName: "Dispatch Services" },
  ];

  const logisticsServices = [
    {
      id: "ftl-ltl",
      title: "Freight Shipping",
      icon: Truck,
      colorClasses: { bg: "bg-slate-50", text: "text-slate-600", shadow: "hover:shadow-slate-900/5", iconText: "text-slate-500" },
      description: "Industrial-grade FTL and LTL solutions engineered for speed and reliability. We handle the heavy lifting so you can focus on scaling.",
      suitableFor: "Manufacturers, retailers, and distributors requiring consistent, high-capacity transport solutions.",
      benefits: ["Dedicated FTL capacity for high-priority loads", "Cost-optimized LTL consolidation strategies", "Real-time GPS tracking and milestone alerts", "Hazmat and Heavy-Load specialized configurations"],
    },
    {
      id: "brokerage",
      title: "Freight Brokerage",
      icon: Globe,
      colorClasses: { bg: "bg-blue-50", text: "text-blue-600", shadow: "hover:shadow-blue-900/5", iconText: "text-blue-500" },
      description: "Leverage our elite network of verified carriers. We match your freight with the perfect equipment at market-leading rates.",
      suitableFor: "Businesses looking for immediate capacity, specialized equipment, or those navigating complex lane shifts.",
      benefits: ["Rigorous carrier compliance and safety screening", "Dynamic market-rate negotiation", "Dedicated account management", "24/7 incident response and resolution"],
    },
    {
      id: "dispatch",
      title: "Dispatch Services",
      icon: Settings,
      colorClasses: { bg: "bg-amber-50", text: "text-amber-600", shadow: "hover:shadow-amber-900/5", iconText: "text-amber-500" },
      description: "We keep owner-operators and fleets moving. Our professional dispatchers find the best-paying freight and handle all the paperwork.",
      suitableFor: "Owner-operators and mid-sized fleets seeking to maximize revenue without the administrative burden.",
      benefits: ["Strategic lane planning to minimize deadhead", "Complete rate negotiation and setup packets", "Billing and factoring assistance", "Driver communication and check calls"],
    },
  ];

  const specializedCapabilities = [
    { name: "Hazmat Certified", desc: "Fully compliant handling of hazardous materials." },
    { name: "Temperature Controlled", desc: "Precision refrigerated transit for sensitive goods." },
    { name: "Oversized/Heavy Haul", desc: "Specialized routing and permitting for massive freight." },
    { name: "Expedited Service", desc: "Time-critical delivery via team drivers." },
  ];

  // Data from LoadSearching
  const popularLanes = [
    { from: 'Chicago, IL', to: 'Dallas, TX', loads: 12 },
    { from: 'Miami, FL', to: 'Atlanta, GA', loads: 8 },
    { from: 'Houston, TX', to: 'Phoenix, AZ', loads: 15 },
    { from: 'Seattle, WA', to: 'Denver, CO', loads: 6 },
  ];

  // Data from LoadListing
  const mockLoads: Partial<FreightLoad>[] = [
    { id: 'LD-4491', origin: 'Chicago, IL', destination: 'Dallas, TX', distance: 960, totalRate: 2850, trailerType: TrailerType.VAN, status: 'Available', createdAt: '2026-04-21T09:00:00Z' },
    { id: 'LD-4492', origin: 'Miami, FL', destination: 'Atlanta, GA', distance: 660, totalRate: 1950, trailerType: TrailerType.REEFER, status: 'Available', createdAt: '2026-04-21T09:15:00Z' },
    { id: 'LD-4493', origin: 'Houston, TX', destination: 'Phoenix, AZ', distance: 1170, totalRate: 3400, trailerType: TrailerType.FLATBED, status: 'Available', createdAt: '2026-04-21T09:30:00Z' },
    { id: 'LD-4494', origin: 'Seattle, WA', destination: 'Denver, CO', distance: 1300, totalRate: 4100, trailerType: TrailerType.HAZMAT, status: 'Available', createdAt: '2026-04-21T09:45:00Z' },
    { id: 'LD-4495', origin: 'Columbus, OH', destination: 'Charlotte, NC', distance: 430, totalRate: 1250, trailerType: TrailerType.VAN, status: 'Available', createdAt: '2026-04-21T10:00:00Z' },
    { id: 'LD-4496', origin: 'New York, NY', destination: 'Boston, MA', distance: 215, totalRate: 950, trailerType: TrailerType.VAN, status: 'Available', createdAt: '2026-04-21T10:15:00Z' },
    { id: 'LD-4497', origin: 'Los Angeles, CA', destination: 'San Francisco, CA', distance: 380, totalRate: 1400, trailerType: TrailerType.VAN, status: 'Available', createdAt: '2026-04-21T10:30:00Z' },
  ];

  const handleSearchClick = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/logistics?view=listing');
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      {/* Premium Hero Section (Unified across all views) */}
      <div className="relative bg-slate-900 pt-56 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent"></div>
        <div className="absolute -top-40 -right-40 w-[800px] h-[800px] bg-blue-500/5 rounded-full mix-blend-overlay filter blur-[120px] animate-pulse"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <span className="px-5 py-2 rounded-full bg-blue-500/10 text-blue-400 font-black text-[10px] uppercase tracking-[0.4em] border border-blue-500/20 mb-10 inline-block">
            {viewMode === "overview" ? "Freight & Logistics Division" : 
             viewMode === "listing" ? "Real-time Supply Chain Feed" :
             viewMode === "search" ? "Advanced Query Engine" : 
             "Freight Coordination"}
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter leading-none">
            {viewMode === "overview" ? "Velocity. Scale. Precision." : 
             viewMode === "listing" ? "Active Load Feed." :
             viewMode === "search" ? "Find Your Next Load." : 
             "Precision Load Booking."}
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto font-medium leading-relaxed">
            {viewMode === "overview" ? "Institutional-grade freight transport, brokerage, and dedicated dispatch services." : 
             viewMode === "listing" ? "Access the most lucrative freight lanes. Verified brokers, instant bookings." :
             viewMode === "search" ? "Query our entire network of active freight. Fast, secure, and reliable matching." : 
             "Lock in your next lane with NHFG's elite brokerage. Fast, secure, and reliable freight matching."}
          </p>
          
          <div className="mt-16 flex flex-wrap justify-center gap-4">
             {[
               { id: "overview", label: "Overview" },
               { id: "search", label: "Search Lanes" },
               { id: "listing", label: "Live Load Board" },
               { id: "booking", label: "Book Freight" }
             ].map((view) => (
                <Link
                  key={view.id}
                  to={`/logistics?view=${view.id}`}
                  className={`px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                    viewMode === view.id 
                    ? "bg-blue-600 text-white shadow-xl shadow-blue-500/20" 
                    : "bg-white/5 text-white border border-white/10 hover:bg-white/10"
                  }`}
                >
                  {view.label}
                </Link>
             ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        {/* OVERVIEW VIEW */}
        {viewMode === "overview" && (
          <div className="space-y-32 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div className="space-y-10">
                <h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-tight">
                  Logistics <br /> <span className="text-blue-600">Mastered.</span>
                </h2>
                <p className="text-slate-500 text-lg leading-relaxed font-medium">
                  We don't just move freight; we engineer your supply chain for maximum efficiency. 
                  Whether you need dedicated capacity, specialized hauling, or a partner to manage 
                  your carrier network, NHFG Logistics delivers uncompromising reliability.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to="/logistics?view=listing"
                    className="px-10 py-5 bg-slate-900 text-white rounded-full font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-2"
                  >
                    View Active Loads <ArrowRight size={16} />
                  </Link>
                  <a
                    href="#logistics-form"
                    className="px-10 py-5 bg-white border border-slate-200 text-slate-900 rounded-full font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center"
                  >
                    Get a Quote
                  </a>
                </div>
              </div>

              <div className="bg-white rounded-[4rem] p-12 border border-slate-100 shadow-2xl shadow-slate-900/5 relative overflow-hidden">
                <h3 className="text-2xl font-black text-slate-900 mb-8 tracking-tight">Identify Your Requirements</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {shippingNeeds.map((need) => (
                    <button
                      key={need.id}
                      onClick={() => setSelectedNeed(need.id)}
                      className={`text-left p-6 rounded-[2.5rem] border-2 transition-all duration-500 group relative overflow-hidden ${
                        selectedNeed === need.id ? "border-slate-900 bg-slate-50/50 shadow-xl scale-[1.02]" : "border-slate-100 hover:border-slate-400 hover:bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between relative z-10">
                        <span className={`font-black text-sm pr-4 ${selectedNeed === need.id ? "text-slate-900" : "text-slate-600 group-hover:text-slate-900"}`}>
                          {need.label}
                        </span>
                        <div className={`w-6 h-6 rounded-xl border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                          selectedNeed === need.id ? "border-slate-900 bg-slate-900 text-white rotate-12" : "border-slate-200"
                        }`}>
                          {selectedNeed === need.id && <CheckCircle size={14} strokeWidth={3} />}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {selectedNeed && (
                  <div className="mt-8 p-8 bg-slate-900 rounded-[2.5rem] animate-in fade-in slide-in-from-top-4 duration-700 shadow-2xl relative overflow-hidden">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3">Recommendation</p>
                    <div className="flex items-center justify-between gap-8">
                      <h3 className="text-2xl font-black text-white tracking-tight">
                        {shippingNeeds.find((n) => n.id === selectedNeed)?.suggestionName}
                      </h3>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col items-center mb-10 text-center">
                <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.4em] mb-4">The Transport Vertical</h2>
                <p className="text-4xl font-black text-slate-900 tracking-tighter">Diversified Solutions.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {logisticsServices.map((service) => {
                const Icon = service.icon;
                return (
                  <div key={service.id} className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 hover:shadow-2xl transition-all duration-500 group flex flex-col">
                    <div className={`w-16 h-16 rounded-[1.5rem] ${service.colorClasses.bg} ${service.colorClasses.text} flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 group-hover:-rotate-3 transition-transform`}>
                      <Icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">{service.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed mb-8 flex-1 font-medium">{service.description}</p>
                    <div className="space-y-4 pt-8 border-t border-slate-50">
                      {service.benefits.map((benefit, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 bg-slate-900"></div>
                          <span className="text-xs font-bold text-slate-700 leading-tight">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div id="logistics-form">
              <SpeakToAdvisorForm productType={ProductType.LOGISTICS} />
            </div>
            <TestimonialsSection />
          </div>
        )}

        {/* SEARCH VIEW */}
        {viewMode === "search" && (
          <div className="space-y-12 animate-fade-in -mt-32">
            <div className="bg-white/5 backdrop-blur-3xl p-4 rounded-[3rem] border border-slate-200 bg-white shadow-2xl space-y-4 max-w-5xl mx-auto relative z-20">
              <form onSubmit={handleSearchClick} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="text" placeholder="Origin City or Zip" className="w-full bg-slate-50 border border-slate-100 rounded-[2rem] pl-16 pr-6 py-5 text-slate-900 font-bold placeholder:text-slate-400 focus:outline-none focus:ring-4 ring-blue-500/10 transition-all text-sm" />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="text" placeholder="Destination City or Zip" className="w-full bg-slate-50 border border-slate-100 rounded-[2rem] pl-16 pr-6 py-5 text-slate-900 font-bold placeholder:text-slate-400 focus:outline-none focus:ring-4 ring-blue-500/10 transition-all text-sm" />
                </div>
              </form>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Truck className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <select className="w-full bg-slate-50 border border-slate-100 rounded-[2rem] pl-16 pr-6 py-5 text-slate-900 font-bold focus:outline-none focus:ring-4 ring-blue-500/10 transition-all text-sm appearance-none">
                    <option>All Equipment</option>
                    <option>Dry Van</option>
                    <option>Reefer</option>
                    <option>Flatbed</option>
                  </select>
                </div>
                <div className="md:col-span-2 flex gap-4">
                  <button onClick={handleSearchClick} className="flex-1 bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-[2rem] py-5 hover:bg-blue-500 transition-all shadow-xl shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-3">
                    <Search size={16} /> Search Loads
                  </button>
                  <button className="p-5 bg-slate-50 border border-slate-100 text-slate-400 rounded-[2rem] hover:bg-slate-100 transition-all">
                    <Filter size={18} />
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-16">
              <div className="lg:col-span-2 space-y-12">
                <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between mb-10">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                      <History size={20} className="text-slate-400" /> Recent Searches
                    </h3>
                    <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Clear All</button>
                  </div>
                  <div className="space-y-4">
                    {['Chicago, IL → Dallas, TX (Dry Van)', 'Atlanta, GA → Any (Reefer)', 'Houston, TX → 500mi (Flatbed)'].map((s, i) => (
                      <button key={i} className="w-full flex items-center justify-between p-6 rounded-2xl border border-slate-50 hover:border-blue-200 hover:bg-blue-50/30 transition-all group">
                        <span className="text-sm font-bold text-slate-700">{s}</span>
                        <ArrowRight size={14} className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3 mb-10">
                    <Star size={20} className="text-yellow-400 fill-yellow-400" /> Favorite Lanes
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {popularLanes.map((lane, i) => (
                      <div key={i} className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{lane.from} to {lane.to}</p>
                          <p className="text-xs font-bold text-slate-900">{lane.loads} loads available</p>
                        </div>
                        <button onClick={handleSearchClick} className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors">
                          <Search size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100">
                  <h3 className="text-lg font-black text-slate-900 tracking-tight mb-8 flex items-center gap-3">
                    <TrendingUp size={18} className="text-emerald-500" /> Market Density
                  </h3>
                  <div className="space-y-6">
                    {[
                      { region: 'Midwest', status: 'High', color: 'bg-emerald-500' },
                      { region: 'Southeast', status: 'Moderate', color: 'bg-yellow-500' },
                      { region: 'West Coast', status: 'Low', color: 'bg-slate-300' },
                      { region: 'Northeast', status: 'High', color: 'bg-emerald-500' },
                    ].map((r, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-700">{r.region}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{r.status}</span>
                          <div className={`h-1.5 w-12 rounded-full ${r.color} opacity-20 relative overflow-hidden`}>
                            <div className={`absolute inset-0 ${r.color} ${r.status === 'High' ? 'w-full' : r.status === 'Moderate' ? 'w-1/2' : 'w-1/4'}`} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LISTING VIEW */}
        {viewMode === "listing" && (
          <div className="space-y-6 animate-fade-in -mt-16">
            <div className="flex justify-end mb-8">
               <button className="px-8 py-4 bg-white text-slate-900 font-black text-[10px] uppercase tracking-widest rounded-full border border-slate-200 shadow-sm hover:bg-slate-50 transition-all flex items-center gap-3">
                 Refresh Feed <Globe size={14} className="animate-spin-slow text-blue-500" />
               </button>
            </div>
            {mockLoads.map((load) => (
              <div key={load.id} className="bg-white rounded-[3rem] border border-slate-100 p-8 md:p-12 shadow-sm hover:shadow-2xl transition-all duration-500 group flex flex-col lg:flex-row items-center gap-12">
                <div className="flex-1 flex items-center gap-10">
                  <div className="w-20 h-20 bg-slate-900 text-white rounded-[2rem] flex items-center justify-center shrink-0 shadow-2xl group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500">
                    <Truck size={32} />
                  </div>
                  <div>
                     <div className="flex flex-wrap items-center gap-6 mb-4">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Origin</span>
                          <h3 className="text-2xl font-black text-slate-900 tracking-tight">{load.origin}</h3>
                        </div>
                        <ArrowRight size={24} className="text-slate-200 mt-4 group-hover:translate-x-3 transition-transform duration-500" />
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Destination</span>
                          <h3 className="text-2xl font-black text-slate-900 tracking-tight">{load.destination}</h3>
                        </div>
                     </div>
                     <div className="flex items-center gap-8">
                        <div className="flex items-center gap-2 text-slate-500 font-bold text-xs">
                          <Navigation size={14} className="text-slate-300" /> {load.distance} Miles
                        </div>
                        <div className="flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">
                          {load.trailerType}
                        </div>
                     </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-12 lg:pl-12 lg:border-l border-slate-50">
                   <div className="text-center lg:text-left">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                      <div className="flex items-center gap-2 text-emerald-600 font-black text-xs">
                        <CheckCircle2 size={16} /> {load.status}
                      </div>
                   </div>
                   <div className="text-center lg:text-left">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Carrier Rate</p>
                      <p className="text-3xl font-black text-slate-900 tracking-tighter">${load.totalRate?.toLocaleString()}</p>
                   </div>
                   <div className="flex gap-3">
                     <Link to="/logistics?view=booking" className="px-10 py-5 bg-slate-900 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all active:scale-95">
                       Book Load
                     </Link>
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* BOOKING VIEW */}
        {viewMode === "booking" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 animate-fade-in -mt-16">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-[3rem] p-10 md:p-16 shadow-2xl shadow-slate-900/5 border border-slate-100">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-10">Carrier Information</h2>
                <form className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><User size={12} /> Contact Name</label>
                      <input type="text" placeholder="John Doe" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold text-slate-900 focus:outline-none focus:ring-4 ring-blue-500/10 transition-all" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Truck size={12} /> Company / MC#</label>
                      <input type="text" placeholder="Logistic Co / MC123456" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold text-slate-900 focus:outline-none focus:ring-4 ring-blue-500/10 transition-all" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Mail size={12} /> Email Address</label>
                      <input type="email" placeholder="john@logistics.com" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold text-slate-900 focus:outline-none focus:ring-4 ring-blue-500/10 transition-all" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Phone size={12} /> Phone Number</label>
                      <input type="tel" placeholder="(555) 000-0000" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold text-slate-900 focus:outline-none focus:ring-4 ring-blue-500/10 transition-all" />
                    </div>
                  </div>
                  <div className="pt-8 border-t border-slate-100">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight mb-8">Lane & Equipment</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><MapPin size={12} /> Preferred Lane</label>
                        <input type="text" placeholder="Origin to Destination" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold text-slate-900 focus:outline-none focus:ring-4 ring-blue-500/10 transition-all" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Package size={12} /> Equipment Type</label>
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
                  Our logistics brokers and agents are available 24/7 to help you secure the best loads.
                </p>
                <a href="tel:800-555-0199" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-white text-blue-600 px-6 py-3 rounded-full hover:bg-slate-50 transition-colors relative z-10">
                  Call the Broker Team
                </a>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
