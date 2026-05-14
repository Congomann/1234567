import React, { useState, useEffect, useMemo } from "react";
import { useData } from "../../context/DataContext";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { PropertyListing, ProductType, UserRole } from "../../types";
import {
  Home as HomeIcon,
  MapPin,
  BedDouble,
  Bath,
  Square,
  CheckCircle,
  ArrowRight,
  X,
  Calculator,
  TrendingUp,
  Search,
  Filter,
  Key,
  Landmark,
  FileText,
  DollarSign,
  Truck,
  Globe,
  Users,
  Compass,
  CheckCircle2,
  Calendar,
  Building2,
  School,
  Hammer,
  DoorOpen,
  Video,
  Star,
  Play,
  Briefcase,
  PlayCircle,
  PhoneIncoming,
  Mail,
  Smartphone,
  ChevronDown,
  Activity,
} from "lucide-react";

import { PropertyDetailModal } from "../../components/PropertyDetailModal";
import { TestimonialsSection } from "../../components/TestimonialsSection";
import { SpeakToAdvisorForm } from "../../components/SpeakToAdvisorForm";

export const RealEstate: React.FC = () => {
  const { properties, addLead, testimonials, allUsers, companySettings } =
    useData();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const viewMode = (searchParams.get("view") || "home") as
    | "home"
    | "properties"
    | "buyers"
    | "sellers"
    | "resources"
    | "about"
    | "contact";
  const typeFilter = searchParams.get("type");

  const [selectedProperty, setSelectedProperty] =
    useState<PropertyListing | null>(null);
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
    intent: "Buy",
    budget: "",
    timeline: "ASAP",
    propertyType: "Single Family",
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Mortgage Calculator State
  const [price, setPrice] = useState(450000);
  const [downPayment, setDownPayment] = useState(90000);
  const [rate, setRate] = useState(6.5);
  const [years, setYears] = useState(30);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [viewMode, typeFilter]);

  const filteredProperties = useMemo(() => {
    let list = properties.filter((p) => p.status === "Active");
    if (typeFilter) {
      list = list.filter(
        (p) => p.type.toLowerCase() === typeFilter.toLowerCase(),
      );
    }
    return list;
  }, [properties, typeFilter]);

  const monthlyPayment = useMemo(() => {
    const principal = price - downPayment;
    const r = rate / 100 / 12;
    const n = years * 12;
    if (r === 0 || n === 0) return principal / (n || 1);
    return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  }, [price, downPayment, rate, years]);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addLead({
      name: contactForm.name,
      email: contactForm.email,
      phone: contactForm.phone,
      interest: ProductType.REAL_ESTATE,
      message: selectedProperty
        ? `Inquiry for ${selectedProperty.address}: ${contactForm.message}`
        : `Real Estate Inquiry (${viewMode}): ${contactForm.message}. Intent: ${contactForm.intent}, Budget: ${contactForm.budget}, Timeline: ${contactForm.timeline}`,
      source: "Real Estate Portal",
      customDetails: {
        realEstateDetails: {
          intent: contactForm.intent,
          budget: contactForm.budget,
          timeline: contactForm.timeline,
          propertyType: contactForm.propertyType
        }
      }
    });
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setIsContactFormOpen(false);
      setContactForm({ 
        name: "", 
        phone: "", 
        email: "", 
        message: "",
        intent: "Buy",
        budget: "",
        timeline: "ASAP",
        propertyType: "Single Family"
      });
    }, 3000);
  };

  const reTestimonials = testimonials.filter((t) => t.status === "approved");

  return (
    <div className="bg-white min-h-screen font-sans">
      {/* Premium Hero Section */}
      <div className="relative bg-[#0B2240] pt-56 pb-32 overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] animate-pulse"></div>
        <div className="absolute -top-40 -right-40 w-[800px] h-[800px] bg-amber-500/10 rounded-full mix-blend-overlay filter blur-[120px] animate-pulse"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <span className="px-5 py-2 rounded-full bg-amber-500/10 text-amber-400 font-black text-[10px] uppercase tracking-[0.4em] border border-amber-500/20 mb-10 inline-block">
            {viewMode === "home" ? "The NHFG Portfolio" : 
             viewMode === "buyers" ? "The Acquisition Journey" :
             viewMode === "sellers" ? "Strategic Divestment" : 
             "Premier Real Estate"}
          </span>
          <h1 className="text-6xl md:text-8xl font-black text-white mb-8 tracking-tighter leading-none uppercase">
            {viewMode === "home" ? "Market Mastery." : 
             viewMode === "buyers" ? "Find Your Legacy." :
             viewMode === "sellers" ? "Maximize Value." : 
             "NHFG Estates."}
          </h1>
          <p className="text-xl text-blue-100/70 max-w-3xl mx-auto font-medium leading-relaxed uppercase tracking-[0.2em] text-[12px]">
            Institutional-grade expertise in high-net-worth residential and commercial markets.
          </p>
          
          <div className="mt-12 flex flex-wrap justify-center gap-4">
             {["properties", "buyers", "sellers", "resources", "about"].map((view) => (
                <Link
                  key={view}
                  to={`/real-estate?view=${view}`}
                  className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                    viewMode === view 
                    ? "bg-amber-500 text-slate-900 shadow-xl" 
                    : "bg-white/5 text-white border border-white/10 hover:bg-white/10"
                  }`}
                >
                  {view}
                </Link>
             ))}
             <Link
               to="/real-estate-intelligence"
               className="px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500 hover:text-slate-900 transition-all flex items-center gap-2"
             >
               <Activity size={12} />
               Market Intel
             </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        {/* HOME VIEW (OVERVIEW) */}
        {viewMode === "home" && (
          <div className="space-y-40 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-[4rem] opacity-20 blur-2xl group-hover:opacity-30 transition-opacity"></div>
                <div className="relative rounded-[3.5rem] overflow-hidden shadow-2xl h-[500px]">
                  <img
                    src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                    alt="Luxury Estate"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B2240] via-transparent to-transparent"></div>
                  <div className="absolute bottom-12 left-12 right-12">
                     <span className="text-amber-400 font-black text-[10px] uppercase tracking-widest mb-2 block">Featured Opportunity</span>
                     <h3 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">The Greenwich Collection</h3>
                  </div>
                </div>
              </div>

              <div className="space-y-10">
                <h2 className="text-5xl font-black text-[#0B2240] uppercase tracking-tighter leading-tight">
                  Unrivaled <br />Market Presence.
                </h2>
                <p className="text-slate-500 text-lg leading-relaxed font-medium">
                  {companySettings.realEstateAbout}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to="/real-estate?view=properties"
                    className="px-10 py-5 bg-[#0B2240] text-white rounded-full font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                  >
                    Explore Inventory <ArrowRight size={16} />
                  </Link>
                  <Link
                    to="/real-estate?view=about"
                    className="px-10 py-5 bg-white border border-slate-200 text-[#0B2240] rounded-full font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center"
                  >
                    Our Philosophy
                  </Link>
                </div>
              </div>
            </div>

            {/* FREE MOVING TRAILER CTA */}
            <div className="bg-[#0B2240] rounded-[5rem] p-16 lg:p-32 text-white relative overflow-hidden group shadow-3xl">
              <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-amber-500/10 to-transparent"></div>
              <div className="absolute -right-20 -bottom-20 opacity-5 group-hover:scale-110 transition-transform duration-[2000ms] rotate-12">
                <Truck size={600} />
              </div>
              <div className="max-w-4xl relative z-10">
                <span className="bg-amber-500/20 text-amber-300 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.4em] mb-10 inline-block border border-amber-500/20">
                  Exclusive White Glove Service
                </span>
                <h3 className="text-5xl lg:text-7xl font-black mb-10 leading-[0.9] tracking-tighter uppercase">
                  Logistics <br /> <span className="text-amber-500">Mastered.</span>
                </h3>
                <p className="text-blue-100/70 text-xl mb-12 font-medium leading-relaxed max-w-2xl">
                  Complimentary access to our professional moving fleet for all clients. 
                  Because your transition should be as seamless as your acquisition.
                </p>
                <Link
                  to="/real-estate?view=contact"
                  className="bg-white text-[#0B2240] px-14 py-6 rounded-full font-black text-sm uppercase tracking-widest shadow-2xl hover:bg-amber-50 transition-all flex items-center gap-3 w-fit group/btn hover:scale-105 active:scale-95"
                >
                  Reserve Your Move <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* BUYERS VIEW */}
        {viewMode === "buyers" && (
          <div className="space-y-32 animate-fade-in">
            <div className="text-center max-w-4xl mx-auto">
              <h2 className="text-6xl font-black text-[#0B2240] tracking-tighter uppercase leading-none mb-6">
                The Acquisition <br /><span className="text-amber-600">Blueprint.</span>
              </h2>
              <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-sm">
                Strategic Steps to Your Next Legacy Property
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: "Capital Readiness",
                  desc: "Strategic coordination with elite lending partners to establish your maximum acquisition power and deal structure.",
                  icon: Landmark,
                },
                {
                  title: "Market Intelligence",
                  desc: "Deep-dive analysis of MLS and off-market 'pocket' listings, filtered through our proprietary value-assessment matrix.",
                  icon: Search,
                },
                {
                  title: "Private Showings",
                  desc: "Curated walkthroughs with executive-level commentary on structural integrity, architectural value, and future appreciation.",
                  icon: DoorOpen,
                },
                {
                  title: "Strategic Negotiation",
                  desc: "Precision bidding and contract structuring designed to win in competitive markets while protecting your capital.",
                  icon: FileText,
                },
                {
                  title: "Asset Validation",
                  desc: "Meticulous oversight of inspections, appraisals, and title clears to ensure your investment is structurally and legally sound.",
                  icon: CheckCircle2,
                },
                {
                  title: "Portfolio Integration",
                  desc: "Finalizing the luxury acquisition and integrating the asset into your lifestyle or investment portfolio.",
                  icon: Key,
                },
              ].map((step, i) => (
                <div
                  key={i}
                  className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group flex flex-col h-full relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-10 text-slate-100 font-black text-8xl opacity-10 group-hover:text-amber-500/10 transition-colors pointer-events-none">
                    {i + 1}
                  </div>
                  <div className="h-20 w-20 bg-slate-50 text-[#0B2240] rounded-[2rem] flex items-center justify-center mb-10 shadow-inner group-hover:bg-[#0B2240] group-hover:text-white transition-all">
                    <step.icon size={32} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tighter uppercase">
                    {step.title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed font-medium flex-1 italic">
                    "{step.desc}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SELLERS VIEW */}
        {viewMode === "sellers" && (
          <div className="space-y-32 animate-fade-in">
            <div className="text-center max-w-4xl mx-auto">
              <h2 className="text-6xl font-black text-[#0B2240] tracking-tighter uppercase leading-none mb-6">
                Institutional <br /><span className="text-amber-600">Liquidity.</span>
              </h2>
              <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-sm">
                Engineering the Maximum Yield for Your Sale
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: "Asset Optimization",
                  desc: "Architectural staging and high-impact repairs directed by our design specialists to maximize emotional appeal and appraisal value.",
                  icon: Hammer,
                },
                {
                  title: "Yield Analysis",
                  desc: "Proprietary market modeling to identify the 'Optimal Exit Price'—balancing time-on-market with maximum ROI.",
                  icon: DollarSign,
                },
                {
                  title: "Legal Structuring",
                  desc: "Comprehensive disclosure management and contract preparation to insulate you from post-sale liability.",
                  icon: FileText,
                },
                {
                  title: "Global Visibility",
                  desc: "Dominant omni-channel marketing: Elite digital syndication, prestige print media, and private network distributions.",
                  icon: Globe,
                },
                {
                  title: "Contract Mastery",
                  desc: "Aggressive representation throughout the negotiation phase to maintain price integrity and favorable terms.",
                  icon: Briefcase,
                },
                {
                  title: "Exit & Closing",
                  desc: "Seamless logistical coordination, final figure verification, and successful capital transfer.",
                  icon: CheckCircle,
                },
              ].map((step, i) => (
                <div
                  key={i}
                  className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group flex flex-col h-full relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-10 text-slate-100 font-black text-8xl opacity-10 group-hover:text-amber-500/10 transition-colors pointer-events-none">
                    {i + 1}
                  </div>
                  <div className="h-20 w-20 bg-slate-50 text-[#0B2240] rounded-[2rem] flex items-center justify-center mb-10 shadow-inner group-hover:bg-[#0B2240] group-hover:text-white transition-all">
                    <step.icon size={32} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tighter uppercase">
                    {step.title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed font-medium flex-1 italic">
                    "{step.desc}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RESOURCES VIEW (Dynamic from CMS) */}
        {viewMode === "resources" && (
          <div className="space-y-20 animate-fade-in">
             <div className="text-center max-w-4xl mx-auto">
              <h2 className="text-6xl font-black text-[#0B2240] tracking-tighter uppercase leading-none mb-6">
                Strategic <br /><span className="text-amber-600">Intel.</span>
              </h2>
              <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-sm">
                Proprietary Tools for the Sophisticated Investor
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {companySettings.realEstateResources?.map((res) => (
                <a
                  key={res.id}
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white p-10 rounded-[4rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group flex flex-col h-full relative overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-8">
                    <div className="p-5 bg-slate-50 text-[#0B2240] rounded-[1.5rem] group-hover:bg-[#0B2240] group-hover:text-white transition-all shadow-inner">
                      <FileText size={28} />
                    </div>
                    <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-4 py-1.5 rounded-full border border-amber-100">
                      {res.type}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tighter">
                    {res.title}
                  </h3>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed mb-10 flex-1 italic">
                    "{res.description}"
                  </p>
                  <div className="flex items-center gap-3 text-[#0B2240] font-black text-[10px] uppercase tracking-[0.2em] group-hover:translate-x-2 transition-transform">
                    Initialize Access <ArrowRight size={16} />
                  </div>
                </a>
              ))}
              {(!companySettings.realEstateResources ||
                companySettings.realEstateResources.length === 0) && (
                <div className="col-span-full py-40 text-center bg-slate-50 rounded-[4rem] border-2 border-dashed border-slate-200">
                  <FileText className="h-16 w-16 mx-auto mb-6 text-slate-200" />
                  <h3 className="text-2xl font-black text-slate-300 uppercase tracking-widest">
                    Archives Building
                  </h3>
                  <p className="text-slate-400 mt-2 font-bold uppercase text-[10px] tracking-widest">
                    New resources are currently being indexed. Check back soon.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ABOUT VIEW */}
        {viewMode === "about" && (
          <div className="space-y-40 animate-fade-in pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div className="space-y-12">
                <h2 className="text-7xl font-black text-[#0B2240] tracking-tighter uppercase leading-[0.85]">
                  Our <br /><span className="text-amber-600">DNA.</span>
                </h2>
                <div className="space-y-6 text-slate-500 text-xl font-medium leading-relaxed italic border-l-4 border-amber-500 pl-10">
                  <p>
                    New Holland Financial Group was founded on the principle that real estate isn't just about square footage—it's about the life lived within it and the legacy it builds.
                  </p>
                  <p>
                    We operate at the intersection of traditional real estate and modern financial engineering, providing our clients with a distinct advantage in complex markets.
                  </p>
                </div>
              </div>
              <div className="relative rounded-[4rem] overflow-hidden shadow-3xl h-[600px] border-[16px] border-white">
                 <img
                    src="https://images.unsplash.com/photo-1577412647305-991150c7d163?auto=format&fit=crop&q=80&w=1200"
                    className="w-full h-full object-cover"
                    alt="Legacy Building"
                  />
                  <div className="absolute inset-0 bg-[#0B2240]/20"></div>
              </div>
            </div>

            <div className="bg-slate-900 rounded-[5rem] p-16 lg:p-32 text-center relative overflow-hidden">
               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>
              <h3 className="text-xs font-black text-amber-500 uppercase tracking-[0.5em] mb-12">Institutional Standards</h3>
              <p className="text-3xl lg:text-5xl font-black text-white max-w-5xl mx-auto leading-tight tracking-tighter uppercase">
                "We don't just find houses; we secure the <span className="text-amber-500">foundation</span> of your wealth."
              </p>
            </div>
          </div>
        )}

        {/* CONTACT VIEW */}
        {viewMode === "contact" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 animate-fade-in items-center">
            <div className="space-y-12">
              <h2 className="text-7xl font-black text-[#0B2240] tracking-tighter uppercase leading-[0.85] mb-8">
                Request <br /><span className="text-amber-600">Consultation.</span>
              </h2>
              <p className="text-xl text-slate-600 leading-relaxed font-medium max-w-lg">
                {companySettings.realEstateContactCta}
              </p>

              <div className="space-y-8">
                <div className="flex gap-6 items-center group">
                  <div className="p-5 bg-white shadow-xl rounded-[2rem] border border-slate-50 text-[#0B2240] group-hover:bg-[#0B2240] group-hover:text-white transition-all transform group-hover:scale-110">
                    <Smartphone size={28} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 mt-1">
                      Direct Private Line
                    </p>
                    <p className="text-2xl font-black text-[#0B2240]">
                      {companySettings.phone}
                    </p>
                  </div>
                </div>
                <div className="flex gap-6 items-center group">
                  <div className="p-5 bg-white shadow-xl rounded-[2rem] border border-slate-50 text-[#0B2240] group-hover:bg-[#0B2240] group-hover:text-white transition-all transform group-hover:scale-110">
                    <Mail size={28} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 mt-1">
                      Encryption Secured Email
                    </p>
                    <p className="text-2xl font-black text-[#0B2240]">
                      {companySettings.email}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[4rem] p-12 lg:p-16 shadow-3xl border border-slate-100 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -mr-16 -mt-16"></div>
              {formSubmitted ? (
                <div className="text-center py-24">
                  <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                    <CheckCircle2 size={48} />
                  </div>
                  <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">
                    Transmission Sent.
                  </h3>
                  <p className="text-slate-500 mt-4 font-medium italic">
                    "A senior executive advisor will contact you within 4 business hours."
                  </p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-3 block">
                        Full Name
                      </label>
                      <input
                        required
                        className="w-full bg-slate-50 border border-transparent rounded-[2rem] px-8 py-5 text-sm font-bold focus:bg-white focus:border-amber-500/30 outline-none transition-all shadow-inner"
                        placeholder="ALEXANDER VANCE"
                        value={contactForm.name}
                        onChange={(e) =>
                          setContactForm({ ...contactForm, name: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-3 block">
                        Direct Phone
                      </label>
                      <input
                        required
                        className="w-full bg-slate-50 border border-transparent rounded-[2rem] px-8 py-5 text-sm font-bold focus:bg-white focus:border-amber-500/30 outline-none transition-all shadow-inner"
                        placeholder="+1 (555) 000-0000"
                        value={contactForm.phone}
                        onChange={(e) =>
                          setContactForm({
                            ...contactForm,
                            phone: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-3 block">
                      Secure Email
                    </label>
                    <input
                      type="email"
                      required
                      className="w-full bg-slate-50 border border-transparent rounded-[2rem] px-8 py-5 text-sm font-bold focus:bg-white focus:border-amber-500/30 outline-none transition-all shadow-inner"
                      placeholder="OFFICE@VANCECAPITAL.COM"
                      value={contactForm.email}
                      onChange={(e) =>
                        setContactForm({
                          ...contactForm,
                          email: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-3 block">
                        Objective
                      </label>
                      <select
                        className="w-full bg-slate-50 border border-transparent rounded-[2rem] px-8 py-5 text-sm font-bold focus:bg-white focus:border-amber-500/30 outline-none transition-all shadow-inner appearance-none"
                        value={contactForm.intent}
                        onChange={(e) =>
                          setContactForm({ ...contactForm, intent: e.target.value })
                        }
                      >
                        <option value="Buy">Buy Property</option>
                        <option value="Sell">Sell Property</option>
                        <option value="Invest">Investment/Portfolio</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-3 block">
                        Timeline
                      </label>
                      <select
                        className="w-full bg-slate-50 border border-transparent rounded-[2rem] px-8 py-5 text-sm font-bold focus:bg-white focus:border-amber-500/30 outline-none transition-all shadow-inner appearance-none"
                        value={contactForm.timeline}
                        onChange={(e) =>
                          setContactForm({ ...contactForm, timeline: e.target.value })
                        }
                      >
                        <option value="ASAP">As Soon As Possible</option>
                        <option value="1-3 Months">1-3 Months</option>
                        <option value="3-6 Months">3-6 Months</option>
                        <option value="6+ Months">6+ Months</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-3 block">
                        Target Property Type
                      </label>
                      <select
                        className="w-full bg-slate-50 border border-transparent rounded-[2rem] px-8 py-5 text-sm font-bold focus:bg-white focus:border-amber-500/30 outline-none transition-all shadow-inner appearance-none"
                        value={contactForm.propertyType}
                        onChange={(e) =>
                          setContactForm({ ...contactForm, propertyType: e.target.value })
                        }
                      >
                        <option value="Single Family">Single Family</option>
                        <option value="Multi-Family">Multi-Family</option>
                        <option value="Commercial">Commercial</option>
                        <option value="Land">Raw Land</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-3 block">
                        Budget / Price Point
                      </label>
                      <input
                        className="w-full bg-slate-50 border border-transparent rounded-[2rem] px-8 py-5 text-sm font-bold focus:bg-white focus:border-amber-500/30 outline-none transition-all shadow-inner"
                        placeholder="$500k - $1M"
                        value={contactForm.budget}
                        onChange={(e) =>
                          setContactForm({ ...contactForm, budget: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-3 block">
                      Inquiry Narrative
                    </label>
                    <textarea
                      rows={4}
                      className="w-full bg-slate-50 border border-transparent rounded-[2.5rem] p-8 text-sm font-medium focus:bg-white focus:border-amber-500/30 outline-none transition-all shadow-inner resize-none"
                      placeholder="DESCRIBE YOUR OBJECTIVES..."
                      value={contactForm.message}
                      onChange={(e) =>
                        setContactForm({
                          ...contactForm,
                          message: e.target.value,
                        })
                      }
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-6 bg-[#0B2240] text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:bg-slate-800 transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
                  >
                    Establish Connection <ArrowRight size={16} />
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* PROPERTIES VIEW */}
        {viewMode === "properties" && (
          <div className="space-y-20 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-end gap-10 mb-12 border-b border-slate-100 pb-16">
              <div className="max-w-2xl">
                 <span className="text-amber-600 font-black text-[10px] uppercase tracking-[0.4em] mb-4 block">Active Markets</span>
                <h2 className="text-6xl font-black text-[#0B2240] tracking-tighter uppercase leading-none">
                  Listing <br />Inventory.
                </h2>
              </div>
              <div className="flex flex-wrap gap-3">
                {["All", "Residential", "Acreage", "Commercial", "Land"].map(
                  (filter) => (
                    <Link
                      key={filter}
                      to={`/real-estate?view=properties${filter === "All" ? "" : `&type=${filter}`}`}
                      className={`px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${typeFilter === filter || (!typeFilter && filter === "All") ? "bg-[#0B2240] text-white shadow-xl" : "bg-slate-50 text-slate-400 hover:bg-slate-100"}`}
                    >
                      {filter}
                    </Link>
                  ),
                )}
              </div>
            </div>

            {filteredProperties.length === 0 ? (
              <div className="text-center py-48 bg-slate-50 rounded-[5rem] border-2 border-dashed border-slate-200">
                <HomeIcon className="h-20 w-20 mx-auto mb-8 text-slate-200" />
                <h3 className="text-3xl font-black text-slate-300 uppercase tracking-widest leading-none">
                  No Active Exposure.
                </h3>
                <p className="text-slate-400 mt-4 font-bold uppercase text-[12px] tracking-widest">
                  Adjust filters or establish a connection for private vault access.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                {filteredProperties.map((prop) => (
                  <div
                    key={prop.id}
                    className="bg-white rounded-[4rem] border border-slate-50 shadow-sm hover:shadow-3xl transition-all duration-700 group cursor-pointer overflow-hidden transform hover:-translate-y-4 flex flex-col h-full"
                    onClick={() => setSelectedProperty(prop)}
                  >
                    <div className="h-[450px] relative overflow-hidden">
                      <img
                        src={prop.image}
                        alt={prop.address}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2000ms]"
                      />
                      <div className="absolute top-8 left-8 bg-[#0B2240]/60 backdrop-blur-2xl text-white px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/10">
                        {prop.type}
                      </div>
                      <div className="absolute bottom-8 right-8 bg-white text-[#0B2240] px-8 py-4 rounded-[2rem] text-3xl font-black shadow-2xl">
                        ${prop.price.toLocaleString()}
                      </div>
                    </div>
                    <div className="p-12 flex-1 flex flex-col">
                      <h4 className="text-3xl font-black text-slate-900 mb-4 leading-[0.9] uppercase tracking-tighter">
                        {prop.address}
                      </h4>
                      <p className="text-slate-400 text-xs font-black flex items-center gap-2 mb-10 uppercase tracking-widest">
                        <MapPin className="h-4 w-4 text-amber-500" /> {prop.city}
                        , {prop.state}
                      </p>

                      <div className="grid grid-cols-3 gap-4 mb-2">
                        <div className="text-center bg-slate-50 p-6 rounded-[2rem] border border-slate-100 group-hover:bg-amber-50 transition-all">
                          <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 mt-1">
                            Beds
                          </span>
                          <span className="font-black text-[#0B2240] text-xl">
                            {prop.bedrooms}
                          </span>
                        </div>
                        <div className="text-center bg-slate-50 p-6 rounded-[2rem] border border-slate-100 group-hover:bg-amber-50 transition-all">
                          <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 mt-1">
                            Baths
                          </span>
                          <span className="font-black text-[#0B2240] text-xl">
                            {prop.bathrooms}
                          </span>
                        </div>
                        <div className="text-center bg-slate-50 p-6 rounded-[2rem] border border-slate-100 group-hover:bg-amber-50 transition-all">
                          <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 mt-1">
                            Sq Ft
                          </span>
                          <span className="font-black text-[#0B2240] text-xl">
                            {prop.sqft?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ABOUT VIEW (Dynamic from CMS) */}
        {viewMode === "about" && (
          <div className="space-y-24 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
              <div className="space-y-8">
                <h2 className="text-5xl font-black text-[#0B2240] uppercase tracking-tighter leading-none">
                  Our Story
                </h2>
                <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed text-lg font-medium">
                  "{companySettings.realEstateAbout}"
                </div>
              </div>
              <div className="bg-slate-200 rounded-[4rem] h-[500px] overflow-hidden shadow-2xl relative group">
                <img
                  src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=1000"
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                  alt="Team"
                />
                <div className="absolute inset-0 bg-[#0B2240]/20"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <SpeakToAdvisorForm productType={ProductType.REAL_ESTATE} />
      <TestimonialsSection />

      {/* Property Detail Modal */}
      {selectedProperty && (
        <PropertyDetailModal
          property={selectedProperty}
          onClose={() => {
            setSelectedProperty(null);
            setIsContactFormOpen(false);
          }}
          onContact={() => {
            setIsContactFormOpen(true);
          }}
        />
      )}
    </div>
  );
};
