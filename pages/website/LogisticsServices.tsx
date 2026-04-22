import React, { useEffect, useState } from "react";
import {
  Truck,
  Box,
  Globe,
  Settings,
  ArrowRight,
  CheckCircle,
  HelpCircle,
  ShieldCheck,
  Zap,
  Search,
  Landmark
} from "lucide-react";
import { Link } from "react-router-dom";
import { TestimonialsSection } from "../../components/TestimonialsSection";
import { SpeakToAdvisorForm } from "../../components/SpeakToAdvisorForm";
import { ProductType } from "../../types";

export const LogisticsServices: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [selectedNeed, setSelectedNeed] = useState<string | null>(null);

  const shippingNeeds = [
    {
      id: "bulk",
      label: "Large, high-volume shipments requiring a full trailer",
      suggestion: "ftl",
      suggestionName: "Full Truckload (FTL)",
    },
    {
      id: "small",
      label: "Cost-effective shipping for smaller, partial loads",
      suggestion: "ltl",
      suggestionName: "Less Than Truckload (LTL)",
    },
    {
      id: "specialized",
      label: "Temperature-sensitive or hazardous materials (Hazmat)",
      suggestion: "specialized",
      suggestionName: "Specialized Trucking",
    },
    {
      id: "brokerage",
      label: "Need to find reliable carriers at competitive rates",
      suggestion: "brokerage",
      suggestionName: "Freight Brokerage",
    },
    {
      id: "dispatch",
      label: "Professional load coordination and driver management",
      suggestion: "dispatch",
      suggestionName: "Dispatch Services",
    },
  ];

  const logisticsServices = [
    {
      id: "ftl-ltl",
      title: "Freight Shipping",
      icon: Truck,
      colorClasses: {
        bg: "bg-slate-50",
        text: "text-slate-600",
        shadow: "hover:shadow-slate-900/5",
        iconText: "text-slate-500",
      },
      description:
        "Industrial-grade FTL and LTL solutions engineered for speed and reliability. We handle the heavy lifting so you can focus on scaling.",
      suitableFor:
        "Manufacturers, retailers, and distributors requiring consistent, high-capacity transport solutions.",
      valueProp:
        "Maximum Efficiency - Our route optimization engines cut transit times by up to 15% across national lanes.",
      benefits: [
        "Dedicated FTL capacity for high-priority loads",
        "Cost-optimized LTL consolidation strategies",
        "Real-time GPS tracking and milestone alerts",
        "Hazmat and Heavy-Load specialized configurations",
      ],
    },
    {
      id: "brokerage",
      title: "Freight Brokerage",
      icon: Globe,
      colorClasses: {
        bg: "bg-blue-50",
        text: "text-blue-600",
        shadow: "hover:shadow-blue-900/5",
        iconText: "text-blue-500",
      },
      description:
        "Leverage our elite network of verified carriers. We match your freight with the perfect equipment at market-leading rates.",
      suitableFor:
        "Businesses looking for immediate capacity, specialized equipment, or those navigating complex lane shifts.",
      valueProp:
        "Network Power - Access over 10,000+ vetted carriers with proven safety and reliability rankings.",
      benefits: [
        "Aggressive rate negotiation for volume discounts",
        "Carrier vetting and compliance monitoring",
        "Single point of contact for multi-leg journeys",
        "Emergency and Last-Minute capacity sourcing",
      ],
    },
    {
      id: "dispatch",
      title: "Dispatch Services",
      icon: Settings,
      colorClasses: {
        bg: "bg-emerald-50",
        text: "text-emerald-600",
        shadow: "hover:shadow-emerald-900/5",
        iconText: "text-emerald-500",
      },
      description:
        "Precision driver management and load coordination. We eliminate the administrative burden of running a fleet.",
      suitableFor:
        "Owner-operators and fleet managers who want to maximize their time on the road while we handle the backend.",
      valueProp:
        "Operational Excellence - Our dispatchers ensure your wheels are turning with the highest-paying loads.",
      benefits: [
        "Professional load search and negotiation",
        "Invoicing, factoring, and paperwork management",
        "Regulatory compliance (DOT/IFTA) monitoring",
        "24/7 dedicated driver support line",
      ],
    },
  ];

  const specializedCapabilities = [
    { name: "Reefer (Temp-Controlled)", desc: "Maintain perfect cold-chain integrity for sensitive perishables." },
    { name: "Flatbed & Heavy Haul", desc: "Specialized equipment for oversized, industrial machinery and steel." },
    { name: "Hazmat Certified", desc: "Expert handling of hazardous materials with strict safety compliance." },
    { name: "Dry Van", desc: "Secure, weather-protected transport for standard palletized inventory." },
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Premium Hero Section */}
      <div className="relative pt-48 pb-32 overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent"></div>
        <div className="absolute h-[500px] w-[500px] bg-slate-500/10 blur-[120px] rounded-full -top-48 -left-24 animate-pulse"></div>
        <div className="absolute h-[400px] w-[400px] bg-blue-500/10 blur-[100px] rounded-full bottom-0 right-0"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <span className="inline-block px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-slate-300 text-[10px] font-black uppercase tracking-[0.3em] mb-8">
            Engineering Global Supply Chains
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-8 leading-[1.1]">
            Restoring Reliability to <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-slate-200">Modern Logistics.</span>
          </h1>
          <p className="text-xl text-slate-300/70 leading-relaxed max-w-2xl mx-auto font-medium mb-12">
            Beyond transport, we provide precision. Experience elite brokerage and trucking 
            solutions tailored for industrial-scale reliability and speed.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link 
              to="/logistics/search"
              className="px-10 py-5 bg-white text-slate-900 rounded-full font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-slate-50 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Search size={14} /> Search Loads
            </Link>
            <Link 
              to="/logistics/booking"
              className="px-10 py-5 bg-white/10 text-white border border-white/20 rounded-full font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all active:scale-95 backdrop-blur-md flex items-center justify-center gap-2"
            >
              <Landmark size={14} /> Book Freight
            </Link>
          </div>
        </div>
      </div>

      {/* Interactive Matcher */}
      <div id="match-tool" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20">
        <div className="bg-white/70 backdrop-blur-2xl rounded-[3.5rem] p-10 md:p-16 shadow-2xl shadow-slate-900/10 border border-white">
          <div className="flex flex-col items-center text-center mb-12">
            <div className="w-16 h-16 bg-slate-900 text-white rounded-[2rem] flex items-center justify-center mb-6 shadow-inner">
              <Truck className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Load Matching Engine
            </h2>
            <p className="text-slate-500 font-medium max-w-lg mt-2">
              Select your shipping requirement to view our optimized logistics recommendation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {shippingNeeds.map((need) => (
              <button
                key={need.id}
                onClick={() => setSelectedNeed(need.id)}
                className={`text-left p-6 rounded-[2.5rem] border-2 transition-all duration-500 group relative overflow-hidden ${
                  selectedNeed === need.id
                    ? "border-slate-900 bg-slate-50/50 shadow-xl scale-[1.02]"
                    : "border-slate-100 hover:border-slate-400 hover:bg-white"
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
            <div className="mt-12 p-8 bg-gradient-to-r from-slate-900 to-blue-900 rounded-[2.5rem] animate-in fade-in slide-in-from-top-4 duration-700 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3">
                Logistics Optimization Recommendation
              </p>
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div>
                  <h3 className="text-2xl font-black text-white tracking-tight">
                    {shippingNeeds.find((n) => n.id === selectedNeed)?.suggestionName}
                  </h3>
                  <p className="text-slate-300/70 text-sm font-medium mt-1">
                    Strategy optimized for your specific freight volume and urgency.
                  </p>
                </div>
                <button
                  onClick={() => {
                    document.getElementById('services-grid')?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="px-8 py-4 bg-white text-slate-900 font-black text-[10px] uppercase tracking-widest rounded-full hover:bg-slate-100 transition-all shadow-xl active:scale-95 shrink-0"
                >
                  View Details
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Services Section */}
      <div id="services-grid" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="flex flex-col items-center mb-20 text-center">
            <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.4em] mb-4">The Transport Vertical</h2>
            <p className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">Diversified Logistics Solutions.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {logisticsServices.map((service) => {
            const Icon = service.icon;
            return (
              <div
                key={service.id}
                className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 hover:shadow-2xl transition-all duration-500 group flex flex-col"
              >
                <div className={`w-16 h-16 rounded-[1.5rem] ${service.colorClasses.bg} ${service.colorClasses.text} flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 group-hover:-rotate-3 transition-transform`}>
                  <Icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">{service.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-8 flex-1 font-medium">
                  {service.description}
                </p>
                
                <div className="space-y-4 pt-8 border-t border-slate-50">
                  {service.benefits.map((benefit, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 bg-slate-900"></div>
                      <span className="text-xs font-bold text-slate-700 leading-tight">{benefit}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-8 border-t border-slate-50">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Target Account</p>
                  <p className="text-[11px] font-bold text-slate-900">{service.suitableFor}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Specialized Trucking Capability Grid */}
      <div className="bg-slate-900 py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-xs font-black text-blue-400 uppercase tracking-[0.4em] mb-4">Specialized Trucking</h2>
            <p className="text-4xl md:text-5xl font-black text-white tracking-tighter">Beyond Standard Hauling.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {specializedCapabilities.map((cap, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all group">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h4 className="text-white font-black text-lg mb-2">{cap.name}</h4>
                <p className="text-slate-400 text-sm font-medium">{cap.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div id="logistics-form">
        <SpeakToAdvisorForm productType={ProductType.LOGISTICS} />
      </div>
      
      <TestimonialsSection />

      {/* Footer CTA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 pt-20">
        <div className="bg-slate-200 rounded-[4rem] p-16 md:p-24 text-center relative overflow-hidden shadow-sm group">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-black text-slate-800 mb-8 tracking-tighter max-w-3xl mx-auto">
              Ready to engineer your <br />
              <span className="text-slate-900 underline decoration-blue-500 decoration-8 underline-offset-8">supply chain?</span>
            </h2>
            <p className="text-slate-600 text-xl mb-12 max-w-xl mx-auto font-medium">
              Join the growing network of manufacturers and distributors who trust 
              NHFG Logistics for precision transport and brokerage.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center px-12 py-6 text-xs font-black uppercase tracking-widest rounded-full text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-xl hover:scale-105 active:scale-95"
            >
              Get a Freight Quote <ArrowRight className="ml-3 w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
