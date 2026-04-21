import React, { useState, useRef, useEffect } from 'react';
import { Menu, X, User, ChevronDown, ArrowRight, Shield, TrendingUp, Truck, Landmark, Key, FileText, Briefcase, BarChart3, Globe, Navigation } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { UserRole, ProductType } from '../types';

/**
 * NEW HOLLAND FINANCIAL GROUP - PREMIUM MEGA MENU
 * Inspired by Apple.com navigation patterns.
 * Minimalist, high-whitespace, glassmorphic floating architecture.
 */

interface MegaMenuColumn {
  title: string;
  subtitle: string;
  items: { label: string; path: string; icon?: any }[];
}

export const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, companySettings } = useData();
  const menuTimeoutRef = useRef<any>(null);

  // Track scroll for subtle navbar transition
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMouseEnter = () => {
    if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current);
    setIsServicesOpen(true);
  };

  const handleMouseLeave = () => {
    menuTimeoutRef.current = setTimeout(() => {
      setIsServicesOpen(false);
    }, 200);
  };

  const handleAuthAction = () => {
    if (user) {
      navigate(user.role === UserRole.CLIENT ? '/client-portal' : '/crm/dashboard');
    } else {
      navigate('/login');
    }
  };

  // MEGA MENU DATA
  const megaMenuColumns: MegaMenuColumn[] = [
    {
      title: 'Insurance',
      subtitle: 'Protect what matters most.',
      items: [
        { label: 'Life Insurance', path: '/life-insurance', icon: Shield },
        { label: 'Auto Insurance', path: '/auto-insurance', icon: Truck },
        { label: 'Business Insurance', path: '/business-insurance', icon: Briefcase },
        { label: 'Group Benefits', path: '/group-benefits', icon: FileText }
      ]
    },
    {
      title: 'Financial & Real Estate',
      subtitle: 'Build and manage your wealth.',
      items: [
        { label: 'Mortgage', path: '/mortgage', icon: Landmark },
        { label: 'Securities', path: '/securities', icon: BarChart3 },
        { label: 'Real Estate', path: '/real-estate', icon: Key }
      ]
    },
    {
      title: 'Freight & Logistics',
      subtitle: 'Move your business forward.',
      items: [
        { label: 'Freight Shipping', path: '/logistics', icon: Truck },
        { label: 'Freight Brokerage', path: '/logistics', icon: Globe },
        { label: 'Dispatch Services', path: '/logistics', icon: Navigation }
      ]
    }
  ];

  const standardLinks = [
    { label: 'Home', path: '/' },
    { label: 'Services', path: '/products', mega: true },
    { label: 'Advisors', path: '/advisors' },
    { label: 'Resources', path: '/resources' },
    { label: 'About', path: '/about' }
  ];

  if (location.pathname.startsWith('/crm')) return null;

  return (
    <>
      <style>{`
        .mega-menu-panel {
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          transform-origin: top center;
        }
        .nav-link-active::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 50%;
          transform: translateX(-50%);
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background-color: #000;
          animation: navDot 0.3s ease-out forwards;
        }
        @keyframes navDot {
          from { opacity: 0; transform: translate(-50%, 4px) scale(0); }
          to { opacity: 1; transform: translate(-50%, 0) scale(1); }
        }
      `}</style>

      <nav 
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 flex justify-center py-6 px-4 md:px-12 pointer-events-none`}
      >
        <div className={`max-w-6xl w-full pointer-events-auto transition-all duration-500 ${isScrolled ? 'translate-y-[-10px]' : ''}`}>
          <div className={`relative bg-white border border-slate-200 rounded-full px-8 py-3.5 flex items-center justify-between transition-all duration-500 shadow-[0_8px_32px_rgba(0,0,0,0.04)] ${isScrolled ? 'shadow-[0_20px_60px_rgba(0,0,0,0.12)] ring-1 ring-black/[0.03]' : ''}`}>
            
            {/* LOGO */}
            <Link to="/" className="flex items-center gap-3 group transition-transform active:scale-95">
              <div className="relative w-8 h-8 flex-shrink-0">
                {companySettings?.logoUrl ? (
                  <img src={companySettings.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
                    <rect x="5" y="15" width="90" height="60" rx="12" fill="#1e293b" />
                    <rect x="10" y="35" width="80" height="55" rx="12" fill="#334155" />
                    <rect x="42" y="52" width="16" height="22" rx="4" fill="white" fillOpacity="0.2" />
                  </svg>
                )}
              </div>
              <div className="flex flex-col">
                <span className="font-black text-[15px] text-slate-900 tracking-tighter leading-tight uppercase">New Holland</span>
              </div>
            </Link>

            {/* CENTER NAV */}
            <div className="hidden lg:flex items-center gap-1">
              {standardLinks.map((link) => (
                <div 
                  key={link.label}
                  className="relative h-full flex items-center"
                  onMouseEnter={link.mega ? handleMouseEnter : undefined}
                  onMouseLeave={link.mega ? handleMouseLeave : undefined}
                >
                  <Link 
                    to={link.path}
                    className={`relative px-5 py-2 text-[12px] font-bold transition-all uppercase tracking-tight ${
                      location.pathname === link.path ? 'text-black nav-link-active' : 'text-slate-500 hover:text-black'
                    }`}
                  >
                    {link.label}
                    {link.mega && <ChevronDown size={10} className={`inline-block ml-1 transition-transform duration-300 ${isServicesOpen ? 'rotate-180' : ''}`} />}
                  </Link>
                </div>
              ))}
            </div>

            {/* RIGHT AUTH */}
            <div className="flex items-center gap-4">
              <button 
                onClick={handleAuthAction}
                className="hidden lg:flex bg-slate-900 text-white hover:bg-black px-6 py-2.5 rounded-full text-[11px] font-black items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-black/10 uppercase tracking-widest"
              >
                <User size={13} className="opacity-70" /> 
                {user ? (user.role === UserRole.CLIENT ? 'Portal' : 'Console') : 'Sign In'}
              </button>

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 rounded-full text-slate-600 hover:text-black hover:bg-slate-100 transition-colors"
              >
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>

            {/* MEGA MENU PANEL */}
            {isServicesOpen && (
              <div 
                className="mega-menu-panel absolute top-full left-0 right-0 mt-3 p-2 z-[110] animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-auto"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <div className="bg-white/95 backdrop-blur-3xl border border-white/20 rounded-[2.5rem] shadow-[0_40px_80px_rgba(0,0,0,0.12)] overflow-hidden flex flex-col md:flex-row min-h-[460px]">
                  
                  {/* MAIN CONTENT (3 COLUMNS) */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-12 p-14 bg-white/50">
                    {megaMenuColumns.map((col, idx) => (
                      <div key={idx} className="space-y-8">
                        <div>
                          <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none mb-2">{col.title}</h3>
                          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-widest">{col.subtitle}</p>
                        </div>
                        <ul className="space-y-1">
                          {col.items.map((item, i) => (
                            <li key={i}>
                              <Link 
                                to={item.path}
                                onClick={() => setIsServicesOpen(false)}
                                className="group flex items-center gap-3 py-2 text-slate-600 hover:text-black transition-colors"
                              >
                                {item.icon && <item.icon size={16} className="text-slate-300 group-hover:text-blue-500 transition-colors" />}
                                <span className="text-[13px] font-bold tracking-tight">{item.label}</span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  {/* FEATURE PANEL */}
                  <div className="w-full md:w-80 bg-slate-50 border-l border-slate-100 p-14 flex flex-col justify-between">
                    <div>
                      <div className="w-12 h-12 bg-white rounded-2xl shadow-xl shadow-slate-200 flex items-center justify-center text-slate-900 mb-8 border border-white ring-8 ring-slate-100">
                        <Truck size={20} />
                      </div>
                      <h4 className="text-2xl font-black text-slate-900 tracking-tighter leading-tight mb-4">Trucking & Freight Services</h4>
                      <p className="text-sm text-slate-500 font-medium leading-relaxed">
                        Now supporting carriers and shippers nationwide with elite brokerage and dispatch.
                      </p>
                    </div>
                    <Link 
                      to="/logistics"
                      onClick={() => setIsServicesOpen(false)}
                      className="inline-flex items-center gap-2 text-[11px] font-black text-blue-600 uppercase tracking-widest hover:gap-4 transition-all group pt-8"
                    >
                      Get Started 
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>

                </div>
              </div>
            )}

          </div>
        </div>
      </nav>

      {/* MOBILE DRAWER */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[150] bg-white/95 backdrop-blur-2xl animate-in fade-in duration-300 p-8 overflow-y-auto pt-32">
          <button 
            onClick={() => setIsMenuOpen(false)}
            className="absolute top-8 right-8 p-3 bg-slate-100 rounded-full text-slate-600"
          >
            <X size={24} />
          </button>
          
          <div className="space-y-12">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Navigation</p>
              <div className="space-y-6">
                {standardLinks.map(link => (
                  <Link 
                    key={link.label}
                    to={link.path}
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-4xl font-black text-slate-900 tracking-tighter hover:text-blue-600 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="space-y-10">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Our Services</p>
              <div className="grid grid-cols-1 gap-8">
                {megaMenuColumns.map((col, idx) => (
                  <div key={idx} className="space-y-4">
                    <h4 className="text-xl font-black text-slate-900 tracking-tight">{col.title}</h4>
                    <div className="flex flex-wrap gap-2">
                      {col.items.map((item, i) => (
                        <Link 
                          key={i} 
                          to={item.path}
                          onClick={() => setIsMenuOpen(false)}
                          className="px-4 py-2 bg-slate-100 rounded-xl text-xs font-bold text-slate-600"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={handleAuthAction}
              className="w-full bg-slate-900 text-white py-6 rounded-[2rem] text-sm font-black uppercase tracking-widest shadow-2xl"
            >
              Initialize Console
            </button>
          </div>
        </div>
      )}
    </>
  );
};
