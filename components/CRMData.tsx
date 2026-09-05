import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutGrid,
    Inbox,
    Shield,
    FileText,
    LineChart,
    Database,
    Calendar,
    MessageCircle,
    CircleUser,
    LogOut,
    Bell,
    Users,
    Settings,
    ShieldCheck,
    Award,
    PenTool,
    Webhook,
    ClipboardCheck,
    Building2,
    Key,
    TrendingUp,
    FileCheck,
    BadgeDollarSign,
    Calculator,
    Percent,
    Puzzle,
    Zap,
    HelpCircle,
    ChevronLeft,
    ChevronRight,
    X,
    Scale,
    Sparkles,
    Smartphone,
    Landmark,
    Home,
    Monitor,
    Activity,
    Layout,
    Truck,
    Car,
    Newspaper,
    Map as MapIcon,
    Briefcase,
    Phone,
    Search
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { UserRole, AdvisorCategory, ProductType } from '../types';
import { CommandPalette } from './CommandPalette';
import { WorkspaceTemplateModal } from './WorkspaceTemplateModal';
import { CRMCommandPalette } from './CRMCommandPalette';

/**
 * EXHAUSTIVE TOUR DEFINITION
 * Covers all 16 requested modules.
 */
const TOUR_EXPLANATIONS: Record<string, string> = {
    'nav-dashboard': 'Overview of system-wide KPIs and health.',
    'nav-campaigns': 'Manage and deploy multi-channel marketing campaigns.',
    'nav-leads': 'Central repository for all incoming prospect data.',
    'nav-clients': 'Manage active clients and view their full interaction history.',
    'nav-calendar': 'Coordinate meetings, view schedules, and block time.',
    'nav-intake': 'Securely capture structured lead data into the CRM.',
    
    // Verticals
    'nav-applications': 'Track life and health insurance policy applications.',
    'nav-commissions': 'View pending and paid carrier commissions.',
    'nav-auto': 'Generate and manage auto insurance quotes.',
    'nav-commercial': 'Handle complex commercial and business insurance.',
    'nav-fleet': 'Manage commercial vehicle and logistics fleets.',
    'nav-properties': 'View active property listings, buyers, and sellers.',
    'nav-market-intel': 'Real Estate yield modeling and property analytics.',
    'nav-escrow': 'Track real estate transactions through to closing.',
    'nav-loans': 'Process and underwrite mortgage applications.',
    'nav-rates': 'View daily interest rates and lock-in options.',
    'nav-refi': 'Calculate refinance scenarios for active clients.',
    'nav-portfolio': 'Manage client investment portfolios and assets.',
    'nav-portfolio-viz': 'Quantitative modeling tool for securities advisory.',
    'nav-securities': 'Overview of wealth management and securities pipeline.',
    'nav-compliance': 'Secure vault for FINRA/SEC compliance documentation.',
    'nav-fees': 'Automated advisory billing and AUM fee deduction.',
    'nav-logistics': 'Commercial load posting terminal and fleet operations.',

    // Shared
    'nav-telephony': 'Corporate softphone, AI Lead Qualification, and IVR.',
    'nav-legal': 'Corporate policies, solicitor agreements, and document generation.',
    'nav-bank-verification': '1-click Plaid ACH and balance verification.',
    'nav-profile': 'Manage your bio and public microsite presence.',

    // Admin
    'nav-user-terminal': 'The master switch for user permissions and advisor management.',
    'nav-logistics-admin': 'Oversee all logistics dispatchers and active loads.',
    'nav-onboarding': 'Review and approve new advisor applications.',
    'nav-re-approval': 'Review and approve Real Estate property listings across the firm.',
    'nav-re-cms': 'Manage localized content for the Real Estate portal.',
    'nav-site-config': 'CMS controls for the public-facing corporate website.',
    'nav-transparency': 'Manage annual reports, lawsuits, and regulatory disclosures.',
    'nav-press-admin': 'Create and publish official press releases.',
    'nav-product-cms': 'Manage products available in the public catalog.',
    'nav-carrier-setup': 'Provision specific insurance carriers to advisor tiers.',
    'nav-client-reviews': 'Moderate and approve testimonials before they go live.',
    'nav-email-signature': 'Generate branded HTML signatures for the whole group.',
    'nav-api-integrations': 'Trace raw webhook data from Google and Meta Ads.',
    'nav-analytics': 'Real-time tracking of website visitors, sessions, and behavior.',
    'nav-commissions-recon': 'Match carrier statements with client data to identify discrepancies.',
    'nav-landing-pages': 'Create and deploy custom product-specific marketing pages.'
};

interface CRMLayoutProps {
    children: React.ReactNode;
}

export const CRMLayout: React.FC<CRMLayoutProps> = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout, login } = useData();
    const sidebarRef = useRef<HTMLDivElement>(null);

    // --- TOUR & CONCEPT MODAL STATES ---
    const [isTourActive, setIsTourActive] = useState(false);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);

    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    const [enabledModules, setEnabledModules] = useState<Record<string, boolean>>({
        sales: true,
        securities: true,
        recruiting: true,
        marketing: true,
        telephony: true,
        real_estate: true,
        mortgage: true,
        logistics: true,
        legal: true,
    });

    const handleToggleModule = (id: string) => {
        setEnabledModules(prev => ({ ...prev, [id]: !prev[id] }));
    };

    // ADMIN PERMISSIONS logic
    const isSuperAdmin = user?.role === UserRole.ADMIN;
    const isManagerOrAdmin = user?.role === UserRole.ADMIN || user?.role === UserRole.MANAGER;

    // (currentTourSteps is now defined below navStructure so it's perfectly accurate to the UI)

    const handleLogout = () => { logout(); };

    const startTour = () => {
        setIsTourActive(true);
        setCurrentStepIndex(0);
        navigate(currentTourSteps[0].path);
    };

    const handleNext = () => {
        const nextIndex = currentStepIndex + 1;
        if (nextIndex < currentTourSteps.length) {
            setCurrentStepIndex(nextIndex);
            navigate(currentTourSteps[nextIndex].path);
        } else {
            setIsTourActive(false);
        }
    };

    const handlePrev = () => {
        const prevIndex = currentStepIndex - 1;
        if (prevIndex >= 0) {
            setCurrentStepIndex(prevIndex);
            navigate(currentTourSteps[prevIndex].path);
        }
    };

    // --- NAVIGATION LOGIC ---
    const navStructure = useMemo(() => {
        if (!user) return { main: [], vertical: [], shared: [], admin: [] };

        const main = [
            { path: '/crm/dashboard', label: 'Dashboard', icon: LayoutGrid, tourId: 'nav-dashboard' },
            { path: '/crm/campaigns', label: 'Campaigns', icon: Zap, tourId: 'nav-campaigns' },
            ...(enabledModules.sales ? [
                { path: '/crm/leads', label: 'Leads DB', icon: Users, tourId: 'nav-leads' },
                { path: '/crm/clients', label: 'Client Management', icon: CircleUser, tourId: 'nav-clients' },
                { path: '/crm/calendar', label: 'Calendar', icon: Calendar, tourId: 'nav-calendar' },
                { path: '/crm/intake', label: 'Lead Intake', icon: ClipboardCheck, tourId: 'nav-intake' },
            ] : []),
        ];

        const vertical = [];
        const products = user.productsSold || [];

        if (user.category === AdvisorCategory.INSURANCE || products.includes(ProductType.LIFE)) {
            vertical.push({ path: '/crm/applications', label: 'Policies & Apps', icon: FileText, tourId: 'nav-applications' });
            vertical.push({ path: '/crm/commissions', label: 'Commissions', icon: LineChart, tourId: 'nav-commissions' });
        }

        if (user.category === AdvisorCategory.INSURANCE || products.includes(ProductType.AUTO) || products.includes(ProductType.COMMERCIAL)) {
            vertical.push({ path: '/crm/auto-quotes', label: 'Auto Quotes', icon: Car, tourId: 'nav-auto' });
            vertical.push({ path: '/crm/commercial-quotes', label: 'Commercial Hub', icon: Truck, tourId: 'nav-commercial' });
            vertical.push({ path: '/crm/fleet', label: 'Fleet Manager', icon: Briefcase, tourId: 'nav-fleet' });
        }

        if (user.category === AdvisorCategory.REAL_ESTATE || products.includes(ProductType.REAL_ESTATE)) {
            vertical.push({ path: '/crm/properties', label: 'Property Pipeline', icon: Building2, tourId: 'nav-properties' });
            vertical.push({ path: '/crm/real-estate-intelligence', label: 'Market Intelligence', icon: MapIcon, tourId: 'nav-market-intel' });
            vertical.push({ path: '/crm/escrow', label: 'Transactions & Escrow', icon: Key, tourId: 'nav-escrow' });
        }

        if (user.category === AdvisorCategory.MORTGAGE || products.includes(ProductType.MORTGAGE)) {
            vertical.push({ path: '/crm/loans', label: 'Loan Applications', icon: FileText, tourId: 'nav-loans' });
            vertical.push({ path: '/crm/rates', label: 'Rate Tools', icon: Percent, tourId: 'nav-rates' });
            vertical.push({ path: '/crm/refi-calc', label: 'Refinance Calc', icon: Calculator, tourId: 'nav-refi' });
        }

        if (user.category === AdvisorCategory.SECURITIES || products.includes(ProductType.SECURITIES)) {
            vertical.push({ path: '/crm/portfolio', label: 'Portfolio Mgmt', icon: TrendingUp, tourId: 'nav-portfolio' });
            vertical.push({ path: '/crm/securities-portfolio', label: 'Portfolio Visualizer', icon: Activity, tourId: 'nav-portfolio-viz' });
            vertical.push({ path: '/crm/securities', label: 'Securities & Wealth', icon: TrendingUp, tourId: 'nav-securities' });
            vertical.push({ path: '/crm/compliance', label: 'Compliance Vault', icon: FileCheck, tourId: 'nav-compliance' });
            vertical.push({ path: '/crm/fees', label: 'Advisory Billing', icon: BadgeDollarSign, tourId: 'nav-fees' });
        }

        if (user.category === AdvisorCategory.LOGISTICS || products.includes(ProductType.LOGISTICS)) {
            vertical.push({ path: '/crm/logistics', label: 'Logistics Hub', icon: Truck, tourId: 'nav-logistics' });
        }

                const shared = [
            { path: '/crm/telephony', label: 'Telephony & AI Suite', icon: Phone, tourId: 'nav-telephony' },
            { path: '/crm/precision-intelligence', label: 'Precision Intel', icon: Calculator, tourId: 'nav-precision-intel' },
            { path: '/crm/legal', label: 'Legal & Compliance', icon: Scale, tourId: 'nav-legal' },
            { path: '/crm/bank-verification', label: 'Bank Verification', icon: Landmark, tourId: 'nav-bank-verification' },
            { path: '/crm/profile', label: 'Profile', icon: CircleUser, tourId: 'nav-profile' },
        ];

        const admin = [];
        if (isManagerOrAdmin) {
            admin.push({ path: '/crm/admin', label: 'User Terminal', icon: Users, tourId: 'nav-user-terminal' });
            admin.push({ path: '/crm/logistics', label: 'Logistics Command', icon: Truck, tourId: 'nav-logistics-admin' });
            admin.push({ path: '/crm/onboarding', label: 'Advisor Applications', icon: ClipboardCheck, tourId: 'nav-onboarding' });
            admin.push({ path: '/crm/admin/real-estate', label: 'Listing Approval', icon: Home, tourId: 'nav-re-approval' });
            admin.push({ path: '/crm/admin/real-estate-cms', label: 'Real Estate CMS', icon: Monitor, tourId: 'nav-re-cms' });
        }

        if (isSuperAdmin) {
            admin.push({ path: '/crm/admin/website', label: 'Site Config', icon: Settings, tourId: 'nav-site-config' });
            admin.push({ path: '/crm/admin/transparency', label: 'Transparency', icon: Scale, tourId: 'nav-transparency' });
            admin.push({ path: '/crm/admin/press', label: 'Press Releases', icon: Newspaper, tourId: 'nav-press-admin' });
            admin.push({ path: '/crm/admin/products', label: 'Product CMS', icon: Database, tourId: 'nav-product-cms' });
            admin.push({ path: '/crm/admin/carriers', label: 'Carrier Setup', icon: ShieldCheck, tourId: 'nav-carrier-setup' });
            admin.push({ path: '/crm/admin/testimonials', label: 'Client Reviews', icon: Award, tourId: 'nav-client-reviews' });
            admin.push({ path: '/crm/admin/signature', label: 'Email Signature', icon: PenTool, tourId: 'nav-email-signature' });
            admin.push({ path: '/crm/admin/marketing', label: 'API Integrations', icon: Webhook, tourId: 'nav-api-integrations' });
            admin.push({ path: '/crm/admin/analytics', label: 'User Analytics', icon: Activity, tourId: 'nav-analytics' });
            admin.push({ path: '/crm/admin/commissions', label: 'Commission Recon', icon: LineChart, tourId: 'nav-commissions-recon' });
            admin.push({ path: '/crm/admin/landing-pages', label: 'Landing Pages', icon: Layout, tourId: 'nav-landing-pages' });
        }

        return { main, vertical, shared, admin };
    }, [user, enabledModules, isSuperAdmin, isManagerOrAdmin]);

    // Build the tour exactly based on what the user can see right now
    const currentTourSteps = useMemo(() => {
        const allItems = [...navStructure.main, ...navStructure.vertical, ...navStructure.shared, ...navStructure.admin];
        return allItems.map(item => ({
            id: item.tourId,
            title: item.label,
            text: TOUR_EXPLANATIONS[item.tourId] || 'Access this module to manage related tasks and configurations.',
            targetId: item.tourId,
            path: item.path
        }));
    }, [navStructure]);

    const currentStep = currentTourSteps[currentStepIndex];


    // --- AUTO-SCROLL LOGIC ---
    useEffect(() => {
        if (isTourActive && currentStep?.targetId) {
            const timer = setTimeout(() => {
                const element = document.getElementById(currentStep.targetId);
                if (element && sidebarRef.current) {
                    const elementRect = element.getBoundingClientRect();
                    const sidebarRect = sidebarRef.current.getBoundingClientRect();

                    if (elementRect.top < sidebarRect.top || elementRect.bottom > sidebarRect.bottom) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }
            }, 200);
            return () => clearTimeout(timer);
        }
    }, [currentStepIndex, isTourActive, currentStep?.targetId]);


    const renderNavLink = (item: any) => {
        const isActive = location.pathname === item.path;
        const isHighlighted = isTourActive && currentStep?.targetId === item.tourId;

        return (
            <Link
                key={item.path}
                to={item.path}
                id={item.tourId}
                className={`flex items-center gap-3 px-3.5 py-2 text-[13px] font-semibold transition-all duration-300 group relative rounded-xl mb-1 ${isActive
                    ? 'bg-gradient-to-r from-[#0066cc] to-[#0052a3] text-white shadow-lg shadow-blue-500/25 border border-blue-400/30'
                    : 'text-slate-700 hover:bg-white/80 hover:shadow-sm hover:border hover:border-slate-200/60'
                    } ${isHighlighted ? 'z-[70] ring-4 ring-[#0066cc]/30 bg-[#0066cc] text-white shadow-xl scale-105' : ''}`}
            >
                <div className={`p-1.5 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 ${
                    isActive ? 'bg-white/20 text-white' : 'bg-blue-50 text-[#0066cc]'
                }`}>
                    <item.icon className="h-4 w-4" strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={`tracking-tight ${isActive ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
                {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
            </Link>
        );
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center p-0 sm:p-4 font-sans text-slate-900 overflow-hidden bg-[#E2E8F0]">

            <AnimatePresence>
            {isTourActive && currentStep && (
                <>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-[60]" onClick={() => setIsTourActive(false)} />
                    <motion.div initial={{ opacity: 0, y: 40, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} className="fixed bottom-10 right-10 w-[420px] bg-white rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.4)] z-[100] border border-slate-200 overflow-hidden">
                        <div className="bg-[#0B2240] p-8 text-white relative">
                            <div className="absolute top-0 right-0 p-8 opacity-10"><Sparkles size={100} /></div>
                            <div className="flex justify-between items-start relative z-10">
                                <h4 className="font-black text-2xl tracking-tighter leading-none mb-2">{currentStep.title}</h4>
                                <button onClick={() => setIsTourActive(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors"><X size={20} /></button>
                            </div>
                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] relative z-10">System Walkthrough</p>
                        </div>

                        <div className="p-10">
                            <p className="text-slate-600 font-medium leading-relaxed mb-10 text-lg">{currentStep.text}</p>
                            <div className="flex items-center justify-between pt-8 border-t border-slate-100">
                                <span className="text-xl font-black text-[#0B2240]">{currentStepIndex + 1} <span className="text-slate-300">/ {currentTourSteps.length}</span></span>
                                <div className="flex gap-3">
                                    {currentStepIndex > 0 && (
                                        <button onClick={handlePrev} className="p-4 rounded-2xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all"><ChevronLeft size={20} /></button>
                                    )}
                                    <button onClick={handleNext} className="bg-[#3B82F6] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 shadow-xl shadow-blue-500/20 transition-all">
                                        {currentStepIndex === currentTourSteps.length - 1 ? 'Finish' : 'Next Step'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
            </AnimatePresence>

            <div className="w-full h-full max-w-[1920px] bg-white sm:rounded-[12px] shadow-[0_20px_60px_rgba(0,0,0,0.15)] flex relative overflow-hidden ring-1 ring-slate-200/60 m-0 sm:m-4">
                <aside ref={sidebarRef} className={`hidden lg:flex flex-col w-[260px] bg-[#f5f5f7]/80 backdrop-blur-2xl text-slate-900 h-full overflow-y-auto py-5 flex-shrink-0 no-scrollbar border-r border-slate-200/50 relative ${isTourActive ? 'z-[65]' : 'z-10'}`}>
                    <div className="px-5 mb-6 flex flex-col gap-5">
                        {/* macOS Window Controls */}
                        <div className="flex items-center gap-2 mb-2 pl-1">
                            <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]"></div>
                            <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]"></div>
                            <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]"></div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="relative w-8 h-8 flex-shrink-0">
                                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
                                    <rect x="5" y="15" width="90" height="60" rx="12" fill="#F59E0B" />
                                    <rect x="10" y="35" width="80" height="55" rx="12" fill="#FCD34D" />
                                    <rect x="42" y="52" width="16" height="22" rx="4" fill="#B45309" fillOpacity="0.25" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="font-bold text-[13px] leading-none tracking-tight text-slate-800">New Holland</h1>
                                <p className="text-[10px] text-slate-500 mt-1 font-medium">Financial Group</p>
                            </div>
                        </div>

                        {/* CONCEPT: QUICK ACTIONS (⌘K) BAR */}
                        <button
                            onClick={() => setIsCommandPaletteOpen(true)}
                            className="flex items-center justify-between px-3 py-2 bg-white/90 hover:bg-white border border-slate-200/80 rounded-xl shadow-sm text-xs font-semibold text-slate-600 transition-all group"
                        >
                            <span className="flex items-center gap-2">
                                <Search className="w-3.5 h-3.5 text-blue-600" />
                                <span>Quick actions</span>
                            </span>
                            <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] font-mono text-slate-400 border border-slate-200">⌘K</span>
                        </button>

                        {/* CONCEPT: TEMPLATES / USE CASES SELECTOR */}
                        <button
                            onClick={() => setIsTemplateModalOpen(true)}
                            className="flex items-center justify-between px-3 py-2 bg-blue-50/80 hover:bg-blue-100/80 border border-blue-200/60 rounded-xl text-xs font-extrabold text-blue-700 transition-all"
                        >
                            <span className="flex items-center gap-2">
                                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                                <span>Templates / Use Cases</span>
                            </span>
                            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                        </button>
                    </div>

                    <nav className="flex-1 px-3 space-y-8">
                        <div>
                            <h3 className="text-[11px] font-semibold text-slate-400 px-3 mb-2">Core</h3>
                            <div className="space-y-0.5">{navStructure.main.map(renderNavLink)}</div>
                        </div>

                        {navStructure.vertical.length > 0 && (
                            <div>
                                <h3 className="text-[11px] font-semibold text-slate-400 px-3 mb-2">Verticals</h3>
                                <div className="space-y-0.5">{navStructure.vertical.map(renderNavLink)}</div>
                            </div>
                        )}

                        <div>
                            <h3 className="text-[11px] font-semibold text-slate-400 px-3 mb-2">Shared</h3>
                            <div className="space-y-0.5">{navStructure.shared.map(renderNavLink)}</div>
                        </div>

                        {navStructure.admin.length > 0 && (
                            <div>
                                <h3 className="text-[11px] font-semibold text-slate-400 px-3 mb-2">Administration</h3>
                                <div className="space-y-0.5">{navStructure.admin.map(renderNavLink)}</div>
                            </div>
                        )}
                    </nav>

                    {/* CONCEPT: BOTTOM LICENSING & ONBOARDING BAR */}
                    <div className="px-3 mt-6 pt-4 border-t border-slate-200/50 space-y-2">
                        <button onClick={startTour} className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl w-full transition-all">
                            <span className="flex items-center gap-2">
                                <HelpCircle className="w-4 h-4 text-blue-600" /> Help & Onboarding
                            </span>
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-black">3/6</span>
                        </button>

                        <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 text-[13px] font-medium text-slate-600 hover:bg-slate-200/60 rounded-xl w-full transition-all">
                            <LogOut className="h-4 w-4 opacity-70" strokeWidth={1.5} /> Sign Out
                        </button>
                    </div>

                    {/* RENDER MODAL CONCEPTS */}
                    <CommandPalette 
                        isOpen={isCommandPaletteOpen} 
                        onClose={() => setIsCommandPaletteOpen(false)} 
                        onOpenTemplates={() => setIsTemplateModalOpen(true)}
                    />
                    <WorkspaceTemplateModal 
                        isOpen={isTemplateModalOpen}
                        onClose={() => setIsTemplateModalOpen(false)}
                        enabledModules={enabledModules}
                        onToggleModule={handleToggleModule}
                    />
                    <CRMCommandPalette />
                </aside>

                <div className="flex-1 h-full flex flex-col overflow-hidden bg-[#f5f5f7]">
                    <header className="h-[56px] bg-white/80 backdrop-blur-xl border-b border-slate-200/60 px-8 flex items-center justify-between z-20 sticky top-0 shadow-sm">
                        <div className="flex items-center gap-4">
                            <h2 className="text-sm font-bold text-slate-800 tracking-tight">New Holland Financial Terminal</h2>
                            
                            {/* DEV ROLE SWITCHER */}
                            {import.meta.env.DEV && (
                                <select 
                                    className="ml-4 px-3 py-1.5 text-xs font-bold bg-amber-100 text-amber-800 border-none rounded-lg cursor-pointer focus:ring-2 focus:ring-amber-500 shadow-sm"
                                    value={user?.email || ''}
                                    onChange={(e) => {
                                        login(e.target.value, 'password');
                                        window.location.reload();
                                    }}
                                    title="Developer Profile Switcher"
                                >
                                    <option value="" disabled>Switch Test Profile</option>
                                    <option value="info@newhollandfinancial.com">Admin (Master)</option>
                                    <option value="manager@nhfg.com">Manager</option>
                                    <option value="insurance@nhfg.com">Life Insurance Agent</option>
                                    <option value="realestate@nhfg.com">Real Estate Agent</option>
                                    <option value="mortgage@nhfg.com">Mortgage Agent</option>
                                    <option value="securities@nhfg.com">Securities Agent</option>
                                    <option value="logistics@nhfg.com">Dispatcher / Logistics</option>
                                </select>
                            )}
                        </div>
                        <div className="flex items-center gap-6">
                            <button onClick={startTour} className="flex items-center gap-2 px-3 py-1.5 bg-slate-100/50 hover:bg-slate-100 rounded-md text-[12px] font-medium text-slate-600 transition-all shadow-sm border border-slate-200/50">
                                <HelpCircle size={14} className="text-slate-400" />
                                Tour
                            </button>

                            <div className="flex items-center gap-4 pl-6 border-l border-slate-200/60 h-6">
                                <div className="text-right hidden sm:block">
                                    <p className="text-[12px] font-semibold text-slate-700 leading-none">NHFG ADMIN</p>
                                    <p className="text-[10px] font-medium text-slate-400 mt-1">Administrator</p>
                                </div>
                                <div className="h-8 w-8 rounded-full overflow-hidden bg-slate-100 border border-slate-200">
                                    {user?.avatar ? <img src={user.avatar} className="h-full w-full object-cover" /> : <div className="h-full w-full flex items-center justify-center font-semibold text-slate-400 text-xs">{user?.name[0]}</div>}
                                </div>
                            </div>
                        </div>
                    </header>
                    <AnimatePresence mode="wait">
                        <motion.main
                            key={location.pathname}
                            initial={{ opacity: 0, y: 14, scale: 0.99 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -14, scale: 0.99 }}
                            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            className="flex-1 overflow-y-auto p-8 lg:p-10 no-scrollbar relative bg-[#f5f5f7]"
                        >
                            {children}
                        </motion.main>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};