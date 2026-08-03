import React, { useEffect } from 'react';
import { 
  Shield, 
  Truck, 
  Home, 
  Briefcase, 
  FileText, 
  Landmark, 
  BarChart3, 
  TrendingUp, 
  Key, 
  Map as MapIcon, 
  Wrench, 
  Globe, 
  Navigation,
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { TrillionCalculatorHub } from '../../components/TrillionCalculatorHub';

/**
 * NHFG EXPLORE SOLUTIONS HUB
 * A dedicated landing page for all service verticals.
 */

interface SolutionCategory {
  title: string;
  subtitle: string;
  items: { label: string; path: string; icon: any; description: string }[];
}

export const ExploreSolutions: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const categories: SolutionCategory[] = [
    {
      title: 'Insurance',
      subtitle: 'Protect what matters most.',
      items: [
        { label: 'Life Insurance', path: '/life-insurance', icon: Shield, description: 'Term, whole, and universal life coverage.' },
        { label: 'Auto & Commercial', path: '/auto-insurance', icon: Truck, description: 'Personal auto and fleet management.' },
        { label: 'Property Insurance', path: '/property-insurance', icon: Home, description: 'Homeowners, renters, and landlord policies.' },
        { label: 'Business Insurance', path: '/business-insurance', icon: Briefcase, description: 'General liability, workers comp, and E&O.' },
        { label: 'Group Benefits', path: '/group-benefits', icon: FileText, description: 'Employee health and retirement plans.' }
      ]
    },
    {
      title: 'Financial & Property',
      subtitle: 'Build, manage, and maintain assets.',
      items: [
        { label: 'Mortgage', path: '/mortgage', icon: Landmark, description: 'Purchase, refinance, and equity lines.' },
        { label: 'Securities', path: '/securities', icon: BarChart3, description: 'Stocks, bonds, and mutual funds.' },
        { label: 'Real Estate', path: '/real-estate', icon: Key, description: 'Residential and commercial listings.' },
        { label: 'DSM Property Solutions', path: '/dsm-property-solutions', icon: Wrench, description: 'Maintenance and renovation services.' }
      ]
    },
    {
      title: 'Freight & Logistics',
      subtitle: 'Move your business forward.',
      items: [
        { label: 'Freight Shipping', path: '/logistics?view=overview', icon: Truck, description: 'National freight transportation.' },
        { label: 'Freight Brokerage', path: '/logistics?view=overview', icon: Globe, description: 'Load matching and carrier network.' },
        { label: 'Dispatch Services', path: '/logistics?view=overview', icon: Navigation, description: 'Route optimization and driver support.' },
        { label: 'Live Load Board', path: '/logistics?view=listing', icon: Truck, description: 'Real-time available load tracking.' }
      ]
    }
  ];

  return (
    <div className="bg-white min-h-screen pt-32 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="mb-20">
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 tracking-tight">
            Explore <span className="text-blue-600">Solutions.</span>
          </h1>
          <p className="text-xl text-slate-500 max-w-3xl font-medium leading-relaxed">
            Select a vertical to discover our comprehensive range of insurance, financial, and logistics services tailored to your needs.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {categories.map((cat, idx) => (
            <div key={idx} className="space-y-10">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2 uppercase">{cat.title}</h3>
                <p className="text-[12px] font-bold text-slate-400 uppercase tracking-[0.2em]">{cat.subtitle}</p>
                <div className="h-1 w-12 bg-blue-600 mt-4"></div>
              </div>

              <div className="space-y-4">
                {cat.items.map((item, i) => (
                  <Link 
                    key={i} 
                    to={item.path}
                    className="group flex items-start gap-5 p-6 rounded-3xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50"
                  >
                    <div className="mt-1 p-3 bg-white rounded-2xl shadow-md text-slate-400 group-hover:text-blue-600 group-hover:shadow-blue-100 transition-all">
                      <item.icon size={24} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{item.label}</span>
                        <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                      </div>
                      <p className="text-sm text-slate-500 leading-relaxed font-medium">{item.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Trillion Calculator Hub */}
        <div className="mt-20">
          <TrillionCalculatorHub />
        </div>

        {/* Featured Section (Bottom Panel) */}
        <div className="mt-32 relative overflow-hidden bg-[#0B2240] rounded-[3rem] p-12 md:p-20 text-white shadow-2xl shadow-blue-900/20">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500 rounded-full mix-blend-overlay filter blur-[120px] opacity-20 animate-pulse"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-2xl text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/30 backdrop-blur-md rounded-full text-blue-300 text-[10px] font-black uppercase tracking-widest mb-8 border border-blue-500/30">
                <Shield size={12} /> Elite Protection Network
              </div>
              <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-8 leading-tight">
                Not sure where to start?
              </h2>
              <p className="text-xl text-blue-100/80 mb-10 leading-relaxed font-medium">
                Connect with an expert advisor who can build a custom financial roadmap designed specifically for your goals.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/advisors"
                  className="bg-white text-[#0B2240] hover:bg-slate-100 px-8 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-900/10"
                >
                  Find Advisor <ArrowRight size={16} />
                </Link>
                <Link 
                  to="/contact"
                  className="bg-blue-600/20 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 px-8 py-4 rounded-2xl font-bold text-sm flex items-center justify-center transition-all"
                >
                  Contact Support
                </Link>
              </div>
            </div>

            <div className="hidden lg:block w-96 h-96 relative">
              <div className="absolute inset-0 bg-blue-400 rounded-[3rem] rotate-6 opacity-10"></div>
              <div className="absolute inset-0 bg-blue-500 rounded-[3rem] -rotate-3 opacity-20 animate-pulse"></div>
              <div className="absolute inset-0 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] flex flex-col items-center justify-center p-12 text-center">
                <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-blue-600/50">
                  <TrendingUp size={40} />
                </div>
                <h3 className="text-2xl font-black mb-4">Total Value</h3>
                <p className="text-5xl font-black text-blue-400">$2.4M+</p>
                <p className="text-sm text-blue-200/60 mt-4 font-bold uppercase tracking-widest">Client Assets Managed</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
