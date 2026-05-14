import React, { useEffect, useState } from "react";
import {
  Briefcase,
  ShieldAlert,
  Shield,
  Laptop,
  CheckCircle,
  HelpCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { TestimonialsSection } from "../../components/TestimonialsSection";
import { SpeakToAdvisorForm } from "../../components/SpeakToAdvisorForm";
import { ProductType } from "../../types";

export const BusinessInsurance: React.FC = () => {
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
      id: "general",
      label:
        "I need basic protection for property damage or injuries at my business",
      suggestion: "general-liability",
      suggestionName: "General Liability Insurance",
    },
    {
      id: "employees",
      label: "I have employees and need to cover workplace injuries",
      suggestion: "workers-comp",
      suggestionName: "Worker's Compensation",
    },
    {
      id: "professional",
      label:
        "I provide professional advice or services and need protection from lawsuits",
      suggestion: "professional-liability",
      suggestionName: "Professional Liability (E&O)",
    },
    {
      id: "cyber",
      label: "I store customer data or rely heavily on computer systems",
      suggestion: "cyber-liability",
      suggestionName: "Cyber Liability Insurance",
    },
  ];

  const insuranceTypes = [
    {
      id: "general-liability",
      title: "General Liability",
      icon: Shield,
      colorClasses: {
        bg: "bg-blue-50",
        text: "text-blue-600",
        shadow: "hover:shadow-blue-900/5",
        iconText: "text-blue-500",
      },
      description:
        "Protects your business from financial loss should you be liable for property damage or personal and advertising injury caused by your services, business operations or your employees.",
      suitableFor:
        "Almost all businesses, especially those that interact with the public, rent commercial space, or work on client properties.",
      budget:
        "Most Affordable. Typically the foundation of any business insurance plan, offering broad coverage at a relatively low cost.",
      benefits: [
        "Covers bodily injury and property damage claims",
        "Includes personal and advertising injury coverage",
        "Helps cover legal defense costs and settlements",
        "Often required by landlords or clients before signing contracts",
      ],
    },
    {
      id: "workers-comp",
      title: "Worker's Compensation",
      icon: Briefcase,
      colorClasses: {
        bg: "bg-emerald-50",
        text: "text-emerald-600",
        shadow: "hover:shadow-emerald-900/5",
        iconText: "text-emerald-500",
      },
      description:
        "Provides wage replacement and medical benefits to employees injured in the course of employment in exchange for mandatory relinquishment of the employee's right to sue their employer for the tort of negligence.",
      suitableFor:
        "Any business with employees. It is legally required in most states for businesses with one or more employees.",
      budget:
        "Variable. Cost depends heavily on the industry, number of employees, and payroll. Riskier jobs have higher premiums.",
      benefits: [
        "Covers medical expenses for work-related injuries or illnesses",
        "Provides partial wage replacement during recovery",
        "Protects employers from lawsuits related to workplace injuries",
        "Helps cover rehabilitation costs",
      ],
    },
    {
      id: "professional-liability",
      title: "Professional Liability (E&O)",
      icon: ShieldAlert,
      colorClasses: {
        bg: "bg-amber-50",
        text: "text-amber-600",
        shadow: "hover:shadow-amber-900/5",
        iconText: "text-amber-500",
      },
      description:
        "Also known as Errors and Omissions (E&O) insurance, it protects professionals and their companies from bearing the full cost of defending against a negligence claim made by a client, and damages awarded in such a civil lawsuit.",
      suitableFor:
        "Consultants, advisors, brokers, agents, and any business that provides professional services or advice to clients.",
      budget:
        "Moderate. Premiums vary based on the profession and the level of risk associated with the advice or services provided.",
      benefits: [
        "Protects against claims of negligence, errors, or omissions",
        "Covers legal defense costs, even for groundless claims",
        "Helps pay for settlements or judgments awarded to clients",
        "Essential for businesses providing specialized advice or services",
      ],
    },
    {
      id: "cyber-liability",
      title: "Cyber Liability",
      icon: Laptop,
      colorClasses: {
        bg: "bg-purple-50",
        text: "text-purple-600",
        shadow: "hover:shadow-purple-900/5",
        iconText: "text-purple-500",
      },
      description:
        "Protects businesses from internet-based risks, and more generally from risks relating to information technology infrastructure and activities.",
      suitableFor:
        "Any business that stores sensitive customer data (like credit card numbers or personal health information) or relies heavily on computer systems.",
      budget:
        "Variable. Costs are rising due to increased cyber threats, but it is essential for businesses handling sensitive data.",
      benefits: [
        "Covers costs associated with data breaches and cyberattacks",
        "Helps pay for customer notification and credit monitoring services",
        "Covers legal fees and regulatory fines related to data breaches",
        "Provides resources for public relations and crisis management",
      ],
    },
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Premium Hero Section */}
      <div className="relative pt-48 pb-32 overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-600/10 to-transparent"></div>
        <div className="absolute h-[500px] w-[500px] bg-amber-500/5 blur-[120px] rounded-full -top-48 -right-24 animate-pulse"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <span className="inline-block px-4 py-1.5 bg-amber-500/10 border border-amber-400/20 rounded-full text-amber-400 text-[10px] font-black uppercase tracking-[0.3em] mb-8">
              Commercial Risk Mitigation
            </span>
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-8 leading-[1.1]">
              Assets Shielded. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-200">Growth Uninterrupted.</span>
            </h1>
            <p className="text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto font-medium mb-12">
              Sophisticated liability and asset protection for modern enterprises. 
              We engineer the safety net so you can focus on the summit.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <button 
                onClick={() => document.getElementById('strategy-engine')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-10 py-5 bg-white text-slate-900 rounded-full font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-slate-50 transition-all active:scale-95"
              >
                Launch Audit
              </button>
              <Link 
                to="/insurance/quote"
                className="px-10 py-5 bg-amber-600/20 text-white border border-white/20 rounded-full font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95 backdrop-blur-md inline-block"
              >
                Get Commercial Quote
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Recommender */}
      <div id="strategy-engine" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20">
        <div className="bg-white/80 backdrop-blur-2xl rounded-[3.5rem] p-10 md:p-16 shadow-2xl shadow-amber-900/5 border border-white">
          <div className="flex flex-col items-center text-center mb-12">
            <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner">
              <Shield className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Business Risk Engine
            </h2>
            <p className="text-slate-500 font-medium max-w-lg mt-2 italic">
              "Identify your operational vulnerabilities to view optimized protection layers."
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {customerNeeds.map((need) => (
              <button
                key={need.id}
                onClick={() => setSelectedNeed(need.id)}
                className={`text-left p-6 rounded-[2.5rem] border-2 transition-all duration-500 group relative overflow-hidden ${
                  selectedNeed === need.id
                    ? "border-amber-500 bg-amber-50/30 shadow-xl shadow-amber-500/5 scale-[1.02]"
                    : "border-slate-100 hover:border-amber-200 hover:bg-white hover:shadow-lg"
                }`}
              >
                <div className="flex items-center justify-between relative z-10">
                  <span className={`font-black text-sm pr-4 ${selectedNeed === need.id ? "text-amber-900" : "text-slate-600 group-hover:text-slate-900"}`}>
                    {need.label}
                  </span>
                  <div className={`w-6 h-6 rounded-xl border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                    selectedNeed === need.id ? "border-amber-500 bg-amber-500 text-white rotate-12" : "border-slate-200"
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
              <p className="text-[10px] font-black text-amber-400 uppercase tracking-[0.3em] mb-3">
                Institutional Recommendation
              </p>
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div>
                  <h3 className="text-2xl font-black text-white tracking-tight">
                    {customerNeeds.find((n) => n.id === selectedNeed)?.suggestionName}
                  </h3>
                  <p className="text-slate-500 text-sm font-medium mt-1">
                    Customized for enterprise-level liability and operational continuity.
                  </p>
                </div>
                <button
                  onClick={() => {
                    const suggestionId = customerNeeds.find((n) => n.id === selectedNeed)?.suggestion;
                    document.getElementById(suggestionId || "")?.scrollIntoView({ behavior: "smooth", block: "center" });
                  }}
                  className="px-8 py-4 bg-amber-600 text-white font-black text-[10px] uppercase tracking-widest rounded-full hover:bg-amber-500 transition-all shadow-xl active:scale-95 shrink-0"
                >
                  Explore Coverage
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Insurance Types Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="flex flex-col items-center mb-20 text-center">
            <h2 className="text-xs font-black text-amber-600 uppercase tracking-[0.4em] mb-4">Risk Categories</h2>
            <p className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">Foundation of Enterprise Safety.</p>
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

      <div id="advisor-form">
        <SpeakToAdvisorForm productType={ProductType.BUSINESS} />
      </div>
      
      <TestimonialsSection />

      {/* Enterprise CTA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 pt-20">
        <div className="bg-[#0B2240] rounded-[4rem] p-16 md:p-24 text-center relative overflow-hidden shadow-2xl group">
          <div className="absolute inset-0 bg-amber-600/5"></div>
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter max-w-3xl mx-auto">
              Safeguard your <br />
              <span className="text-amber-500">commercial legacy.</span>
            </h2>
            <p className="text-blue-100/70 text-xl mb-12 max-w-xl mx-auto font-medium">
              Join thousands of businesses who trust NHFG for comprehensive 
              risk management and executive-level advisory.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
               <Link
                to="/contact"
                className="inline-flex items-center justify-center px-12 py-6 text-xs font-black uppercase tracking-widest rounded-full text-[#0B2240] bg-white hover:bg-amber-50 transition-all shadow-xl hover:scale-105 active:scale-95"
              >
                Contact Business Desk
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
