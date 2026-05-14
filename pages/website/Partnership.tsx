import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Briefcase, 
  Globe, 
  ShieldCheck, 
  TrendingUp, 
  Zap, 
  ArrowRight,
  Handshake,
  Building2,
  Users
} from "lucide-react";
import { SEO } from "../../components/SEO";

export const Partnership: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const BenefitCard = ({ title, desc, icon: Icon }: any) => (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-4">{title}</h3>
      <p className="text-slate-500 leading-relaxed">{desc}</p>
    </div>
  );

  return (
    <div className="bg-slate-50 font-sans min-h-screen">
      <SEO title="Partnerships & Carriers | New Holland Financial Group" description="Partner with NHFG to expand your distribution network and leverage our industry-leading technology." />
      
      {/* 1. Hero Section */}
      <div className="relative bg-[#0B2240] py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500 rounded-full mix-blend-overlay filter blur-[120px] opacity-30"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-500 rounded-full mix-blend-overlay filter blur-[100px] opacity-20"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-blue-200 text-sm font-bold tracking-wide uppercase mb-8 backdrop-blur-md">
            <Handshake size={16} /> B2B Collaboration
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter leading-tight">
            Partner with <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
              New Holland Financial
            </span>
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto font-medium leading-relaxed mb-12">
            Expand your market reach, integrate with our modern distribution platform, and join a network of top-tier carriers and technology partners transforming the insurance industry.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/contact"
              className="px-8 py-4 rounded-full bg-white text-[#0B2240] font-black tracking-wide hover:bg-slate-100 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 w-full sm:w-auto"
            >
              Become a Partner
            </Link>
            <a
              href="#benefits"
              className="px-8 py-4 rounded-full bg-white/10 text-white font-bold tracking-wide border border-white/20 hover:bg-white/20 transition-all w-full sm:w-auto backdrop-blur-sm"
            >
              Explore Benefits
            </a>
          </div>
        </div>
      </div>

      {/* 2. Logo Cloud / Trust Bar */}
      <div className="border-b border-slate-200 bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-black text-slate-400 uppercase tracking-widest mb-8">
            Trusted by Industry Leaders
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            <ShieldCheck size={48} className="text-slate-800" />
            <Building2 size={48} className="text-slate-800" />
            <Globe size={48} className="text-slate-800" />
            <TrendingUp size={48} className="text-slate-800" />
          </div>
        </div>
      </div>

      {/* 3. Why Partner With Us (Benefits) */}
      <div id="benefits" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black text-slate-900 mb-6 tracking-tight">
              Why Collaborate With Us?
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto font-medium">
              We offer a seamless, technology-first approach to distribution, giving carriers and business partners unprecedented access to a motivated, high-performing advisor network.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <BenefitCard
              title="Vast Distribution Network"
              desc="Gain immediate access to our growing network of independent advisors across multiple states, ready to represent your products to engaged clients."
              icon={Users}
            />
            <BenefitCard
              title="Modern Technology Integration"
              desc="Our proprietary CRM and quoting engines are built for API integrations, allowing real-time pricing, rapid underwriting, and seamless policy issuance."
              icon={Zap}
            />
            <BenefitCard
              title="High-Quality Lead Generation"
              desc="We invest heavily in internal marketing and SEO, generating high-intent consumer traffic that converts into premium policyholders for your business."
              icon={TrendingUp}
            />
            <BenefitCard
              title="Strict Compliance Standards"
              desc="We maintain rigorous compliance, licensing verification, and quality assurance protocols, protecting your brand reputation at all times."
              icon={ShieldCheck}
            />
            <BenefitCard
              title="Dedicated Support Infrastructure"
              desc="Our back-office teams handle the heavy lifting, ensuring smooth operations, swift case management, and minimal friction for carrier partners."
              icon={Building2}
            />
            <BenefitCard
              title="Agile Market Expansion"
              desc="Quickly test new products or expand into new geographic territories by leveraging our agile distribution model and rapid deployment capabilities."
              icon={Globe}
            />
          </div>
        </div>
      </div>

      {/* 4. Partnership Types */}
      <div className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-black text-slate-900 mb-8 tracking-tight">
                Who We Work With
              </h2>
              <div className="space-y-8">
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 mb-2">Insurance Carriers</h4>
                    <p className="text-slate-600">Life, Health, Property & Casualty, and Commercial carriers looking for a reliable, tech-enabled General Agency to drive premium volume.</p>
                  </div>
                </div>
                
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                    <Zap size={24} />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 mb-2">InsurTech & Software Partners</h4>
                    <p className="text-slate-600">Innovative technology companies providing quoting engines, underwriting data, or CRM tools looking for strategic integration partners.</p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                    <Briefcase size={24} />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 mb-2">B2B Service Providers</h4>
                    <p className="text-slate-600">Financial institutions, lead generation firms, and compliance services looking to align with a rapidly growing financial advisory group.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative rounded-3xl overflow-hidden shadow-2xl h-[500px]">
              <img
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80"
                alt="Business Partnership Meeting"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B2240] via-transparent to-transparent opacity-80"></div>
              <div className="absolute bottom-8 left-8 right-8">
                <p className="text-white text-2xl font-bold italic">
                  "Strategic alignment is the foundation of exponential growth."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. CTA Section */}
      <div className="py-24 bg-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">
            Ready to Build the Future Together?
          </h2>
          <p className="text-xl text-blue-100 mb-10 font-medium">
            Contact our strategic partnerships team today to discuss how we can integrate your offerings and drive mutual success.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center px-10 py-5 bg-white text-blue-600 rounded-full font-black text-lg hover:bg-slate-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 uppercase tracking-widest"
          >
            Contact Partnerships Team <ArrowRight className="ml-3 h-6 w-6" />
          </Link>
        </div>
      </div>
    </div>
  );
};
