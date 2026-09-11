import React, { useEffect } from "react";
import {
  Users,
  Heart,
  Shield,
  Briefcase,
  CheckCircle,
  ArrowRight,
  Plus,
  Minus,
  Apple,
  Activity,
  Award
} from "lucide-react";
import { Link } from "react-router-dom";
import { TestimonialsSection } from "../../components/TestimonialsSection";
import { SpeakToAdvisorForm } from "../../components/SpeakToAdvisorForm";
import { ProductType } from "../../types";

export const GroupBenefits: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const benefits = [
    {
      title: "Health & Wellness",
      description: "Comprehensive medical, dental, and vision plans tailored to your organization's size and needs.",
      icon: Activity,
      color: "blue"
    },
    {
      title: "Group Life & AD&D",
      description: "Financial security for employees and their families with flexible coverage options.",
      icon: Shield,
      color: "emerald"
    },
    {
      title: "Disability Insurance",
      description: "Short-term and long-term income protection to safeguard employees against the unexpected.",
      icon: Heart,
      color: "rose"
    },
    {
      title: "Retirement Savings",
      description: "Competitive 401(k) and retirement planning tools to help your team build a secure future.",
      icon: Award,
      color: "amber"
    }
  ];

  const employerBenefits = [
    "Attract and retain top talent in a competitive market",
    "Tailored plan designs to match your company's budget",
    "Streamlined administration and dedicated support",
    "Tax-advantaged solutions for business owners"
  ];

  const employeeBenefits = [
    "Access to high-quality healthcare networks",
    "Peace of mind with collective security",
    "Easy-to-use digital enrollment and tools",
    "Comprehensive coverage at competitive group rates"
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Premium Hero Section */}
      <div className="relative pt-48 pb-32 overflow-hidden bg-[#0B2240]">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 to-transparent"></div>
        <div className="absolute h-[500px] w-[500px] bg-emerald-500/10 blur-[120px] rounded-full -top-48 -right-24 animate-pulse"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <span className="inline-block px-4 py-1.5 bg-emerald-500/10 border border-emerald-400/20 rounded-full text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em] mb-8">
              Enterprise Wealth & Wellness
            </span>
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-8 leading-[1.1]">
              Elevating the <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">Corporate Standard.</span>
            </h1>
            <p className="text-xl text-blue-100/70 leading-relaxed max-w-2xl mx-auto font-medium mb-12">
              Bespoke benefit ecosystems engineered to attract elite talent 
              and protect your organization's most valuable assets.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <button 
                onClick={() => document.getElementById('benefits-grid')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-10 py-5 bg-white text-[#0B2240] rounded-full font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-white/90 transition-all active:scale-95"
              >
                View Solutions
              </button>
              <button 
                onClick={() => document.getElementById('proposal-form')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-10 py-5 bg-emerald-600/20 text-white border border-white/20 rounded-full font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95 backdrop-blur-md"
              >
                Request Proposal
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Content */}
      <div id="benefits-grid" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="flex flex-col items-center mb-20 text-center">
            <h2 className="text-xs font-black text-emerald-600 uppercase tracking-[0.4em] mb-4">The Pillars</h2>
            <p className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">Strategic Benefit Engineering.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
          {benefits.map((benefit, i) => (
            <div key={i} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group flex flex-col">
              <div className={`w-16 h-16 rounded-[1.5rem] bg-${benefit.color}-50 text-${benefit.color}-600 flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-transform`}>
                <benefit.icon className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight leading-tight">{benefit.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-8 flex-1 font-medium italic">
                "{benefit.description}"
              </p>
            </div>
          ))}
        </div>

        {/* Two Pillar Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-32">
          <div className="bg-[#0B2240] p-16 rounded-[4rem] text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full -mr-24 -mt-24 group-hover:scale-110 transition-transform duration-1000"></div>
            <h2 className="text-4xl font-black mb-10 tracking-tighter">For Employers</h2>
            <ul className="space-y-8">
              {employerBenefits.map((item, i) => (
                <li key={i} className="flex items-start gap-5">
                  <div className="mt-1 p-2 bg-emerald-500/20 rounded-xl">
                    <CheckCircle className="w-6 h-6 text-emerald-400" />
                  </div>
                  <span className="text-blue-100/80 font-bold leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white p-16 rounded-[4rem] border border-slate-200 shadow-sm relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-48 h-48 bg-slate-100 rounded-full -mr-24 -mt-24 group-hover:scale-110 transition-transform duration-1000"></div>
            <h2 className="text-4xl font-black text-[#0B2240] mb-10 tracking-tighter">For Employees</h2>
            <ul className="space-y-8">
              {employeeBenefits.map((item, i) => (
                <li key={i} className="flex items-start gap-5">
                  <div className="mt-1 p-2 bg-slate-100 rounded-xl">
                    <CheckCircle className="w-6 h-6 text-[#0B2240]" />
                  </div>
                  <span className="text-slate-600 font-bold leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div id="proposal-form">
        <SpeakToAdvisorForm productType={ProductType.BUSINESS} />
      </div>
      
      <TestimonialsSection />

      {/* Corporate CTA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 pt-20">
        <div className="bg-emerald-600 rounded-[5rem] p-16 md:p-32 text-center relative overflow-hidden shadow-2xl group">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <div className="relative z-10">
            <h2 className="text-5xl md:text-8xl font-black text-white mb-10 tracking-tighter max-w-5xl mx-auto leading-none">
              Transform your <br />
              <span className="text-emerald-900/40">human capital.</span>
            </h2>
            <p className="text-emerald-50 text-xl md:text-2xl mb-16 max-w-2xl mx-auto font-medium opacity-90">
              NHFG handles the complexity. You reap the rewards of a protected, 
              motivated, and high-performing workforce.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
               <Link
                to="/contact"
                className="px-12 py-7 bg-white text-emerald-600 rounded-full font-black text-sm uppercase tracking-widest shadow-xl hover:scale-105 transition-all active:scale-95"
              >
                Request Executive Proposal
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
