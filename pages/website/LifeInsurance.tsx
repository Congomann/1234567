import React, { useEffect, useState } from "react";
import {
  Shield,
  Heart,
  Coins,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  HelpCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { TestimonialsSection } from "../../components/TestimonialsSection";
import { SpeakToAdvisorForm } from "../../components/SpeakToAdvisorForm";
import { ProductType } from "../../types";

export const LifeInsurance: React.FC = () => {
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
      id: "temporary",
      label: "Cover temporary debts (e.g., mortgage, kids' education)",
      suggestion: "term-life",
      suggestionName: "Term Life Insurance",
    },
    {
      id: "lifelong-fixed",
      label: "Lifelong protection with predictable, fixed premiums",
      suggestion: "whole-life",
      suggestionName: "Whole Life Insurance",
    },
    {
      id: "flexible",
      label: "Flexible lifelong coverage that adapts to my changing income",
      suggestion: "universal-life",
      suggestionName: "Universal Life Insurance",
    },
    {
      id: "final-expense",
      label:
        "Cover only death expenses (funeral, medical bills) so my family isn't burdened",
      suggestion: "final-expense",
      suggestionName: "Final Expense Insurance",
    },
    {
      id: "growth",
      label:
        "Lifelong protection with the potential for market-linked cash value growth",
      suggestion: "indexed-universal-life",
      suggestionName: "Indexed Universal Life (IUL)",
    },
  ];

  const insuranceTypes = [
    {
      id: "term-life",
      title: "Term Life",
      icon: Shield,
      colorClasses: {
        bg: "bg-blue-50",
        text: "text-blue-600",
        shadow: "hover:shadow-blue-900/5",
        iconText: "text-blue-500",
      },
      description:
        "Affordable, straightforward protection for a specific period (e.g., 10, 20, or 30 years). Ideal for covering temporary needs like a mortgage or children's education.",
      suitableFor:
        "Young families, individuals with temporary large debts (like a mortgage), or those needing maximum coverage for the lowest cost during their working years.",
      budget:
        "Most Affordable (Cheap) - Provides the highest death benefit for the lowest premium. Great for tight budgets.",
      benefits: [
        "Lower initial premiums compared to permanent life insurance",
        "Guaranteed death benefit if you pass away during the term",
        "Premiums typically remain level for the duration of the term",
        "Can often be converted to a permanent policy later",
      ],
    },
    {
      id: "whole-life",
      title: "Whole Life",
      icon: Heart,
      colorClasses: {
        bg: "bg-emerald-50",
        text: "text-emerald-600",
        shadow: "hover:shadow-emerald-900/5",
        iconText: "text-emerald-500",
      },
      description:
        "Permanent coverage that lasts your entire life, as long as premiums are paid. It builds cash value over time that you can borrow against.",
      suitableFor:
        "Individuals seeking lifelong guarantees, predictable fixed premiums, and a guaranteed cash value component, or those wanting to leave a guaranteed legacy.",
      budget:
        "Higher Cost - Premiums are significantly higher than term life, but they never increase, and the policy builds guaranteed cash value.",
      benefits: [
        "Lifelong protection with a guaranteed death benefit",
        "Fixed premiums that never increase",
        "Guaranteed cash value accumulation over time",
        "Potential to earn dividends (with participating policies)",
      ],
    },
    {
      id: "universal-life",
      title: "Universal Life",
      icon: Coins,
      colorClasses: {
        bg: "bg-amber-50",
        text: "text-amber-600",
        shadow: "hover:shadow-amber-900/5",
        iconText: "text-amber-500",
      },
      description:
        "Flexible permanent life insurance that allows you to adjust your premium payments and death benefit as your needs change over time.",
      suitableFor:
        "People who want lifelong coverage but need flexibility in their premium payments and death benefit as their financial situation changes over time.",
      budget:
        "Moderate to High Cost - Generally more affordable than whole life, but more expensive than term. Offers flexibility to adjust premiums if your budget changes.",
      benefits: [
        "Flexible premiums and adjustable death benefit",
        "Cash value grows based on current interest rates",
        "Ability to use cash value to pay premiums",
        "Permanent coverage with more flexibility than whole life",
      ],
    },
    {
      id: "final-expense",
      title: "Final Expense",
      icon: CheckCircle,
      colorClasses: {
        bg: "bg-purple-50",
        text: "text-purple-600",
        shadow: "hover:shadow-purple-900/5",
        iconText: "text-purple-500",
      },
      description:
        "A smaller permanent life insurance policy designed specifically to cover end-of-life expenses, such as funeral costs and medical bills.",
      suitableFor:
        "Seniors or those whose primary concern is ensuring their funeral, burial, and immediate end-of-life medical expenses are covered without burdening their family.",
      budget:
        "Very Affordable - Because the coverage amount is small (typically $5,000 - $25,000), the monthly premiums are very low and fit easily into fixed incomes.",
      benefits: [
        "Easy to qualify for, often with no medical exam required",
        "Affordable premiums for older adults",
        "Provides peace of mind for your loved ones",
        "Guaranteed death benefit to cover specific final costs",
      ],
    },
    {
      id: "indexed-universal-life",
      title: "Indexed Universal Life (IUL)",
      icon: TrendingUp,
      colorClasses: {
        bg: "bg-cyan-50",
        text: "text-cyan-600",
        shadow: "hover:shadow-cyan-900/5",
        iconText: "text-cyan-500",
      },
      description:
        "A type of universal life insurance that allows you to allocate cash value amounts to either a fixed account or an equity index account.",
      suitableFor:
        "Individuals looking for permanent life insurance with the potential for higher cash value growth linked to market indexes, while protecting against market downturns.",
      budget:
        "Higher Cost - Designed for those with disposable income who want to use life insurance as a supplemental tax-advantaged wealth-building tool.",
      benefits: [
        "Upside potential linked to a market index (like the S&P 500)",
        "Downside protection (0% floor) protects against market losses",
        "Tax-advantaged cash value growth",
        "Flexible premiums and death benefit",
      ],
    },
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Premium Hero Section */}
      <div className="relative pt-48 pb-32 overflow-hidden bg-[#0B2240]">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent"></div>
        <div className="absolute h-[500px] w-[500px] bg-blue-500/10 blur-[120px] rounded-full -top-48 -left-24 animate-pulse"></div>
        <div className="absolute h-[400px] w-[400px] bg-purple-500/10 blur-[100px] rounded-full bottom-0 right-0"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <span className="inline-block px-4 py-1.5 bg-blue-500/10 border border-blue-400/20 rounded-full text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mb-8">
              Legacy Protection & Wealth
            </span>
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-8 leading-[1.1]">
              Securing Your Family's <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Future Generations.</span>
            </h1>
            <p className="text-xl text-blue-100/70 leading-relaxed max-w-2xl mx-auto font-medium mb-12">
              Beyond a policy, we provide a foundation. Experience premium life insurance 
              tailored to high-net-worth protection and strategic family planning.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">

              <button 
                onClick={() => document.getElementById('quote-form')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-10 py-5 bg-blue-600/20 text-white border border-white/20 rounded-full font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95 backdrop-blur-md"
              >
                Speak to Advisor
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Recommender */}
      <div id="match-tool" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20">
        <div className="bg-white/70 backdrop-blur-2xl rounded-[3.5rem] p-10 md:p-16 shadow-2xl shadow-blue-900/10 border border-white">
          <div className="flex flex-col items-center text-center mb-12">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner">
              <HelpCircle className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Strategic Matching Engine
            </h2>
            <p className="text-slate-500 font-medium max-w-lg mt-2">
              Identify your primary financial objective to view our institutional-grade recommendations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {customerNeeds.map((need) => (
              <button
                key={need.id}
                onClick={() => setSelectedNeed(need.id)}
                className={`text-left p-6 rounded-[2.5rem] border-2 transition-all duration-500 group relative overflow-hidden ${
                  selectedNeed === need.id
                    ? "border-blue-500 bg-blue-50/30 shadow-xl shadow-blue-500/5 scale-[1.02]"
                    : "border-slate-100 hover:border-blue-200 hover:bg-white hover:shadow-lg"
                }`}
              >
                <div className="flex items-center justify-between relative z-10">
                  <span className={`font-black text-sm pr-4 ${selectedNeed === need.id ? "text-blue-900" : "text-slate-600 group-hover:text-slate-900"}`}>
                    {need.label}
                  </span>
                  <div className={`w-6 h-6 rounded-xl border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                    selectedNeed === need.id ? "border-blue-500 bg-blue-500 text-white rotate-12" : "border-slate-200"
                  }`}>
                    {selectedNeed === need.id && <CheckCircle size={14} strokeWidth={3} />}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {selectedNeed && (
            <div className="mt-12 p-8 bg-gradient-to-r from-[#0B2240] to-blue-900 rounded-[2.5rem] animate-in fade-in slide-in-from-top-4 duration-700 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-3">
                Architect's Recommendation
              </p>
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div>
                  <h3 className="text-2xl font-black text-white tracking-tight">
                    {customerNeeds.find((n) => n.id === selectedNeed)?.suggestionName}
                  </h3>
                  <p className="text-blue-200/70 text-sm font-medium mt-1">
                    Optimized for your specific capital protection profile.
                  </p>
                </div>
                <button
                  onClick={() => {
                    const suggestionId = customerNeeds.find((n) => n.id === selectedNeed)?.suggestion;
                    document.getElementById(suggestionId || "")?.scrollIntoView({ behavior: "smooth", block: "center" });
                  }}
                  className="px-8 py-4 bg-emerald-500 text-white font-black text-[10px] uppercase tracking-widest rounded-full hover:bg-emerald-400 transition-all shadow-xl active:scale-95 shrink-0"
                >
                  Deep Dive Analysis
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Insurance Types Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="flex flex-col items-center mb-20 text-center">
            <h2 className="text-xs font-black text-blue-600 uppercase tracking-[0.4em] mb-4">Core Instruments</h2>
            <p className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">Diversified Portfolio of Protection.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {insuranceTypes.map((type, index) => {
            const Icon = type.icon;
            return (
              <div
                id={type.id}
                key={type.id}
                className={`bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 hover:shadow-2xl transition-all duration-500 group flex flex-col ${index === insuranceTypes.length - 1 && insuranceTypes.length % 3 !== 0 ? "lg:col-span-1" : ""}`}
              >
                <div className={`w-16 h-16 rounded-[1.5rem] ${type.colorClasses.bg} ${type.colorClasses.text} flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-transform`}>
                  <Icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">{type.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-8 flex-1 font-medium italic">
                  "{type.description}"
                </p>
                
                <div className="space-y-4 pt-8 border-t border-slate-50">
                   {type.benefits.map((benefit, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className={`mt-1 h-1.5 w-1.5 rounded-full shrink-0 ${type.colorClasses.text.split(' ')[0]} bg-current`}></div>
                      <span className="text-xs font-bold text-slate-700 leading-tight">{benefit}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-8 border-t border-slate-50">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Target Persona</p>
                  <p className="text-[11px] font-bold text-slate-900">{type.suitableFor}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div id="quote-form">
        <SpeakToAdvisorForm productType={ProductType.LIFE} />
      </div>
      
      <TestimonialsSection />

      {/* Footer CTA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 pt-20">
        <div className="bg-[#B7BDC5] rounded-[4rem] p-16 md:p-24 text-center relative overflow-hidden shadow-sm group">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-black text-[#5C6675] mb-8 tracking-tighter max-w-3xl mx-auto">
              Ready to architect your <br />
              <span className="text-white">permanent legacy?</span>
            </h2>
            <p className="text-slate-600 text-xl mb-12 max-w-xl mx-auto font-medium">
              Join the elite circle of clients who trust NHFG for multi-generational wealth 
              shielding and sophisticated insurance planning.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center px-12 py-6 text-xs font-black uppercase tracking-widest rounded-full text-white bg-[#5C6675] hover:bg-slate-700 transition-all shadow-xl hover:scale-105 active:scale-95"
            >
              Initialize Consultation <ArrowRight className="ml-3 w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
