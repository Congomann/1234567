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
    <div className="bg-slate-50 min-h-screen pt-32 pb-20">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 text-center">
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight mb-8">
          Enterprise <span className="text-blue-600">Group Benefits</span>
        </h1>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
          Empower your team with comprehensive health, wealth, and wellness solutions. 
          We design bespoke benefit packages that protect your employees and drive business growth.
        </p>
      </div>

      {/* Benefits Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, i) => (
            <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
              <div className={`w-14 h-14 rounded-2xl bg-${benefit.color}-50 text-${benefit.color}-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <benefit.icon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{benefit.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Two Pillar Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="bg-[#0B2240] p-12 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
            <h2 className="text-3xl font-black mb-8">For Employers</h2>
            <ul className="space-y-6">
              {employerBenefits.map((item, i) => (
                <li key={i} className="flex items-start gap-4">
                  <div className="mt-1 p-1 bg-blue-500/20 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-blue-400" />
                  </div>
                  <span className="text-blue-100 font-medium leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white p-12 rounded-[3.5rem] border border-slate-200 shadow-sm">
            <h2 className="text-3xl font-black text-slate-900 mb-8">For Employees</h2>
            <ul className="space-y-6">
              {employeeBenefits.map((item, i) => (
                <li key={i} className="flex items-start gap-4">
                  <div className="mt-1 p-1 bg-emerald-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                  </div>
                  <span className="text-slate-600 font-medium leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <SpeakToAdvisorForm productType={ProductType.BUSINESS} />
      <TestimonialsSection />

      {/* CTA */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="bg-white rounded-[3.5rem] p-12 border border-blue-100 shadow-2xl text-center relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-6 bg-blue-600 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
            Corporate Solutions
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-[#0B2240] mb-6">
            Ready to optimize your team's benefits?
          </h2>
          <p className="text-slate-500 text-lg mb-10 max-w-2xl mx-auto font-medium">
            Join hundreds of forward-thinking companies that trust New Holland Financial Group to handle their group insurance needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="px-10 py-5 bg-[#0B2240] text-white font-black rounded-full hover:bg-blue-900 transition-all shadow-xl uppercase text-xs tracking-widest"
            >
              Request a Proposal
            </Link>
            <Link
              to="/services"
              className="px-10 py-5 bg-white text-slate-900 border border-slate-200 font-black rounded-full hover:bg-slate-50 transition-all uppercase text-xs tracking-widest"
            >
              Explore Services
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
