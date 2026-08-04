import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { useData } from '../context/DataContext';

export const Footer: React.FC = () => {
  const { companySettings } = useData();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setSubscribed(true);
      setTimeout(() => {
        setNewsletterEmail('');
        setSubscribed(false);
      }, 4000);
    }
  };

  const socialLinks = Array.isArray(companySettings.socialLinks) && companySettings.socialLinks.length > 0
    ? companySettings.socialLinks.filter(link => link.url && link.url !== '#' && link.url.trim() !== '')
    : [
        { platform: 'Instagram', url: 'https://instagram.com/remmyshabani' },
        { platform: 'TikTok', url: 'https://tiktok.com/@remmyshabani' },
        { platform: 'Facebook', url: 'https://facebook.com/remmyshabani' },
        { platform: 'LinkedIn', url: 'https://linkedin.com' }
      ];

  const primaryPhone = companySettings.phone || '(717) 847-9638';
  const secondaryPhone = '(515) 318-7450';
  const primaryEmail = companySettings.email || 'remmyk@newhollandfinancial.com';
  const addressText = companySettings.hideStreetAddress 
    ? `${companySettings.city || 'Des Moines'}, ${companySettings.state || 'IA'}`
    : `${companySettings.address || 'Des Moines'}, ${companySettings.city || ''} ${companySettings.state || 'IA 50309'}`.replace(/\s+/g, ' ');

  return (
    <footer className="bg-[#050A14] text-white pt-16 pb-12 border-t border-white/10 font-sans select-none">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* TOP NEWSLETTER BRIEFING */}
        <div className="border-b border-white/10 pb-12 mb-16 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-[10px] font-black uppercase tracking-widest mb-3">
              <Sparkles size={12} /> Financial Insights Newsletter
            </div>
            <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-2">
              Subscribe to New Holland Financial Updates
            </h3>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">
              Get rate updates, real estate market insights, and financial advisory directly to your inbox.
            </p>
          </div>

          <div className="w-full lg:w-auto">
            {subscribed ? (
              <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-8 py-3.5 rounded-full font-bold text-xs">
                <CheckCircle2 size={16} /> Subscribed Successfully
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
                <div className="relative w-full">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="email"
                    required
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full pl-11 pr-6 py-3.5 bg-white/5 border border-white/10 rounded-full text-xs font-medium text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-7 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-full text-[11px] uppercase tracking-widest transition-all shadow-lg shadow-blue-600/30 shrink-0 flex items-center justify-center gap-2"
                >
                  Subscribe <ArrowRight size={13} />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* APPLE-STYLE CLEAN 4-COLUMN TEXT GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 mb-16">
          
          {/* COLUMN 1: BRAND & IDENTITY */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3 group w-max">
              <div className="relative w-9 h-9 flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                {companySettings?.logoUrl ? (
                  <img src={companySettings.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-md">
                    <rect x="5" y="15" width="90" height="60" rx="12" fill="#F59E0B" />
                    <rect x="10" y="35" width="80" height="55" rx="12" fill="#FCD34D" />
                    <rect x="42" y="52" width="16" height="22" rx="4" fill="#B45309" fillOpacity="0.25" />
                  </svg>
                )}
              </div>
              <div className="flex flex-col">
                <span className="font-black text-lg leading-none text-white tracking-tight uppercase">New Holland</span>
                <span className="text-[9px] font-extrabold text-blue-400 tracking-[0.2em] uppercase mt-0.5">Financial Group</span>
              </div>
            </Link>

            <p className="text-slate-400 text-xs leading-relaxed font-medium">
              Helping you grow, protect, and preserve what matters most with customized wealth, insurance, real estate, and freight logistics solutions.
            </p>

            <div className="pt-2">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2.5">Follow Us</p>
              <ul className="space-y-1.5 text-xs font-semibold">
                {socialLinks.map((item, idx) => (
                  <li key={idx}>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      {item.platform}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* COLUMN 2: SOLUTIONS & SERVICES (PURE ELEGANT TEXT LINKS) */}
          <div className="space-y-3">
            <h3 className="text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-3">
              Solutions &amp; Services
            </h3>
            <ul className="space-y-2 text-xs font-medium">
              {[
                { label: 'Real Estate', path: '/real-estate' },
                { label: 'Freight & Logistics', path: '/logistics' },
                { label: 'Life Insurance', path: '/life-insurance' },
                { label: 'Mortgages & Loans', path: '/mortgage' },
                { label: 'Securities & Wealth', path: '/securities' },
                { label: 'DSM Property Solutions', path: '/dsm-property-solutions' },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    className="text-slate-300 hover:text-white transition-colors block py-0.5"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 3: ECOSYSTEM & CORPORATE */}
          <div className="space-y-3">
            <h3 className="text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-3">
              Ecosystem &amp; Corporate
            </h3>
            <ul className="space-y-2 text-xs font-medium">
              {[
                { name: 'Solutions Overview', path: '/products' },
                { name: 'Advisors Directory', path: '/advisors' },
                { name: 'Schedule Advisory', path: '/schedule' },
                { name: 'Client Portal', path: '/login' },
                { name: 'About New Holland', path: '/about' },
                { name: 'Annual Report', path: '/transparency' },
                { name: 'Press Releases', path: '/press' },
                { name: 'Careers & Join Team', path: '/join' },
                { name: 'Developer APIs', path: '/developers' },
                { name: 'Financial Resources', path: '/resources' },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-slate-300 hover:text-white transition-colors block py-0.5"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 4: DIRECT CONTACT STACK (CLEAN TEXT STACK, NO BOXES) */}
          <div className="space-y-3">
            <h3 className="text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-3">
              Contact Us
            </h3>
            
            <div className="space-y-3 text-xs font-medium text-slate-300">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-0.5">Direct Line</span>
                <a href={`tel:${primaryPhone.replace(/[^0-9]/g, '')}`} className="text-white hover:text-blue-400 transition-colors font-bold block">
                  {primaryPhone}
                </a>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-0.5">Office Line</span>
                <a href={`tel:${secondaryPhone.replace(/[^0-9]/g, '')}`} className="text-white hover:text-blue-400 transition-colors font-bold block">
                  {secondaryPhone}
                </a>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-0.5">Direct Email</span>
                <a href={`mailto:${primaryEmail}`} className="text-white hover:text-blue-400 transition-colors font-bold block truncate">
                  {primaryEmail}
                </a>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-0.5">Headquarters</span>
                <span className="text-slate-300 font-bold block leading-relaxed">
                  {addressText}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* REGULATORY COMPLIANCE STATEMENT */}
        <div className="border-t border-white/10 pt-8 pb-6 text-slate-500 text-[11px] font-medium leading-relaxed">
          <p>
            <strong className="text-slate-400 uppercase tracking-widest">REGULATORY DISCLOSURE:</strong> New Holland Financial Group provides integrated financial, real estate, mortgage, insurance, and freight brokerage services across 48 active state jurisdictions. Securities, Wealth Management, and Mortgage solutions are offered in partnership with licensed institutional partners, registered broker-dealers, and NMLS originators while direct firm licensure applications remain in process.
          </p>
        </div>

        {/* BOTTOM BAR: COPYRIGHT & LEGAL LINKS */}
        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-500">
          <p>&copy; {new Date().getFullYear()} New Holland Financial Group. All rights reserved.</p>

          <div className="flex flex-wrap items-center gap-6">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Use</Link>
            <Link to="/transparency" className="hover:text-white transition-colors">State Disclosures</Link>
            <Link to="/developers" className="hover:text-white transition-colors">Developer Portal</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};
