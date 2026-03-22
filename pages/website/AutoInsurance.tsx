import React, { useEffect, useState } from "react";
import {
  Truck,
  Car,
  ShieldAlert,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { TestimonialsSection } from "../../components/TestimonialsSection";
import { SpeakToAdvisorForm } from "../../components/SpeakToAdvisorForm";
import { ProductType } from "../../types";

export const AutoInsurance: React.FC = () => {
  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.substring(1);
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
  }, []);

  const [selectedNeed, setSelectedNeed] = useState<string | null>(null);

  const customerNeeds = [
    {
      id: "personal",
      label: "I need coverage for my personal vehicle",
      suggestion: "personal-auto",
      suggestionName: "Personal Auto Insurance",
    },
    {
      id: "business",
      label: "I need to insure vehicles used for my business",
      suggestion: "commercial-fleet",
      suggestionName: "Commercial Fleet Insurance",
    },
    {
      id: "liability",
      label: "I just need the minimum legal coverage to drive",
      suggestion: "liability-coverage",
      suggestionName: "Liability Coverage",
    },
    {
      id: "full-coverage",
      label: "I want my own car protected from accidents, theft, and weather",
      suggestion: "collision-comprehensive",
      suggestionName: "Collision & Comprehensive",
    },
  ];

  const insuranceTypes = [
    {
      id: "personal-auto",
      title: "Personal Auto",
      icon: Car,
      colorClasses: {
        bg: "bg-blue-50",
        text: "text-blue-600",
        shadow: "hover:shadow-blue-900/5",
        iconText: "text-blue-500",
      },
      description:
        "Provides property, liability, and medical coverage for personal vehicles. It protects you against financial loss if you have an accident.",
      suitableFor:
        "Individuals and families who own or lease vehicles for personal use, commuting, or running errands.",
      budget:
        "Variable. Depends on the driver's age, driving history, vehicle type, and chosen coverage limits.",
      benefits: [
        "Covers damage to your vehicle from accidents, theft, or natural disasters",
        "Pays for bodily injury and property damage you cause to others",
        "Helps cover medical expenses for you and your passengers",
        "Often required by law in most states",
      ],
    },
    {
      id: "commercial-fleet",
      title: "Commercial Fleet",
      icon: Truck,
      colorClasses: {
        bg: "bg-emerald-50",
        text: "text-emerald-600",
        shadow: "hover:shadow-emerald-900/5",
        iconText: "text-emerald-500",
      },
      description:
        "Designed to cover a group of vehicles owned or leased by a business. It provides liability and physical damage protection for vehicles used for business purposes.",
      suitableFor:
        "Businesses that rely on multiple vehicles for operations, such as delivery services, contractors, or sales teams.",
      budget:
        "Higher Cost. Commercial policies are generally more expensive due to higher liability limits and increased driving time.",
      benefits: [
        "Streamlined management of multiple vehicles under one policy",
        "Higher liability limits to protect business assets",
        "Coverage for specialized vehicles or equipment",
        "Protects against claims arising from employee accidents while driving for work",
      ],
    },
    {
      id: "liability-coverage",
      title: "Liability Coverage",
      icon: ShieldAlert,
      colorClasses: {
        bg: "bg-amber-50",
        text: "text-amber-600",
        shadow: "hover:shadow-amber-900/5",
        iconText: "text-amber-500",
      },
      description:
        "The foundation of any auto insurance policy. It covers the costs associated with injuries or property damage you cause to others in an at-fault accident.",
      suitableFor:
        "Every driver. It is the minimum legal requirement in almost all states to operate a vehicle on public roads.",
      budget:
        "Most Affordable. This is the cheapest option as it only covers damage to others, not your own vehicle.",
      benefits: [
        "Fulfills state legal requirements for driving",
        "Protects your personal assets from lawsuits following an accident",
        "Covers the other party's medical bills and vehicle repair costs",
        "Provides legal defense if you are sued over an accident",
      ],
    },
    {
      id: "collision-comprehensive",
      title: "Collision & Comprehensive",
      icon: ShieldCheck,
      colorClasses: {
        bg: "bg-purple-50",
        text: "text-purple-600",
        shadow: "hover:shadow-purple-900/5",
        iconText: "text-purple-500",
      },
      description:
        "Physical damage coverage for your own vehicle. Collision covers damage from hitting another vehicle or object. Comprehensive covers damage from non-collision events like theft, vandalism, or weather.",
      suitableFor:
        "Drivers with newer or more valuable vehicles, or those who have a loan or lease on their car (as lenders typically require it).",
      budget:
        "Moderate to High. Adds significant cost to a liability-only policy, but provides essential protection for your asset.",
      benefits: [
        "Pays to repair or replace your vehicle regardless of fault (Collision)",
        "Protects against unpredictable events like hail, fire, or animal strikes (Comprehensive)",
        "Provides peace of mind knowing your asset is protected",
        "Essential for vehicles that are financed or leased",
      ],
    },
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Premium Hero Section */}
      <div className="relative pt-48 pb-32 overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-transparent"></div>
        <div className="absolute h-[500px] w-[500px] bg-red-500/5 blur-[120px] rounded-full -top-48 -right-24 animate-pulse"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <span className="inline-block px-4 py-1.5 bg-red-500/10 border border-red-400/20 rounded-full text-red-400 text-[10px] font-black uppercase tracking-[0.3em] mb-8">
              Precision Coverage & Safety
            </span>
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-8 leading-[1.1]">
              Performance Protected. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">Every Mile Defined.</span>
            </h1>
            <p className="text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto font-medium mb-12">
              From personal luxury vehicles to complex commercial fleets, we engineer 
              auto insurance that moves with you.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <button 
                onClick={() => document.getElementById('match-tool')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-10 py-5 bg-white text-slate-900 rounded-full font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-slate-50 transition-all active:scale-95"
              >
                Analyze Needs
              </button>
              <button 
                onClick={() => document.getElementById('quote-form')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-10 py-5 bg-red-600/20 text-white border border-white/20 rounded-full font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95 backdrop-blur-md"
              >
                Get a Quote
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Recommender */}
      <div id="match-tool" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20">
        <div className="bg-white/80 backdrop-blur-2xl rounded-[3.5rem] p-10 md:p-16 shadow-2xl shadow-red-900/5 border border-white">
          <div className="flex flex-col items-center text-center mb-12">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner">
              <HelpCircle className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Vehicle Strategy Engine
            </h2>
            <p className="text-slate-500 font-medium max-w-lg mt-2 italic">
              "Select your vehicle utilization profile to view optimized protection layers."
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {customerNeeds.map((need) => (
              <button
                key={need.id}
                onClick={() => setSelectedNeed(need.id)}
                className={`text-left p-6 rounded-[2.5rem] border-2 transition-all duration-500 group relative overflow-hidden ${
                  selectedNeed === need.id
                    ? "border-red-500 bg-red-50/30 shadow-xl shadow-red-500/5 scale-[1.02]"
                    : "border-slate-100 hover:border-red-200 hover:bg-white hover:shadow-lg"
                }`}
              >
                <div className="flex items-center justify-between relative z-10">
                  <span className={`font-black text-sm pr-4 ${selectedNeed === need.id ? "text-red-900" : "text-slate-600 group-hover:text-slate-900"}`}>
                    {need.label}
                  </span>
                  <div className={`w-6 h-6 rounded-xl border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                    selectedNeed === need.id ? "border-red-500 bg-red-500 text-white rotate-12" : "border-slate-200"
                  }`}>
                    {selectedNeed === need.id && <CheckCircle size={14} strokeWidth={3} />}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {selectedNeed && (
            <div className="mt-12 p-8 bg-slate-900 rounded-[2.5rem] animate-in fade-in slide-in-from-top-4 duration-700 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
              <p className="text-[10px] font-black text-red-400 uppercase tracking-[0.3em] mb-3">
                Expert Configuration
              </p>
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div>
                  <h3 className="text-2xl font-black text-white tracking-tight">
                    {customerNeeds.find((n) => n.id === selectedNeed)?.suggestionName}
                  </h3>
                  <p className="text-slate-500 text-sm font-medium mt-1">
                    Calibrated for high-performance and commercial risk mitigation.
                  </p>
                </div>
                <button
                  onClick={() => {
                    const suggestionId = customerNeeds.find((n) => n.id === selectedNeed)?.suggestion;
                    document.getElementById(suggestionId || "")?.scrollIntoView({ behavior: "smooth", block: "center" });
                  }}
                  className="px-8 py-4 bg-red-600 text-white font-black text-[10px] uppercase tracking-widest rounded-full hover:bg-red-500 transition-all shadow-xl active:scale-95 shrink-0"
                >
                  View Blueprint
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Insurance Types Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="flex flex-col items-center mb-20 text-center">
            <h2 className="text-xs font-black text-red-600 uppercase tracking-[0.4em] mb-4">Service Tiers</h2>
            <p className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">Engineered for Reliability.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {insuranceTypes.map((type, index) => {
            const Icon = type.icon;
            return (
              <div
                id={type.id}
                key={type.id}
                className={`bg-white rounded-[3rem] p-8 shadow-sm border border-slate-100 hover:shadow-2xl transition-all duration-500 group flex flex-col`}
              >
                <div className={`w-14 h-14 rounded-[1.2rem] ${type.colorClasses.bg} ${type.colorClasses.text} flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 group-hover:-rotate-3 transition-transform`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-4 tracking-tight leading-tight">{type.title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed mb-8 flex-1 font-medium italic">
                  "{type.description}"
                </p>
                
                <div className="space-y-3 pt-6 border-t border-slate-50">
                   {type.benefits.map((benefit, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className={`mt-1 h-1 w-1 rounded-full shrink-0 ${type.colorClasses.text.split(' ')[0]} bg-current`}></div>
                      <span className="text-[10px] font-bold text-slate-700 leading-tight">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div id="quote-form">
        <SpeakToAdvisorForm productType={ProductType.AUTO} />
      </div>
      
      <TestimonialsSection />

      {/* Footer CTA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 pt-20">
        <div className="bg-[#0B2240] rounded-[4rem] p-16 md:p-24 text-center relative overflow-hidden shadow-2xl group">
          <div className="absolute inset-0 bg-red-600/5"></div>
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter max-w-3xl mx-auto">
              Ready to accelerate your <br />
              <span className="text-red-500">financial safety?</span>
            </h2>
            <p className="text-blue-100/70 text-xl mb-12 max-w-xl mx-auto font-medium">
              Join thousands of drivers who trust NHFG for unbeatable rates 
              and institutional-grade claims support.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
               <Link
                to="/contact"
                className="inline-flex items-center justify-center px-12 py-6 text-xs font-black uppercase tracking-widest rounded-full text-[#0B2240] bg-white hover:bg-red-50 transition-all shadow-xl hover:scale-105 active:scale-95"
              >
                Connect With Specialist
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
