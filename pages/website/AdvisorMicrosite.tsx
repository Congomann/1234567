import React, { useState, useEffect } from "react";
import { useParams, Navigate, Link, useNavigate } from "react-router-dom";
import { useData } from "../../context/DataContext";
import { SEO } from "../../components/SEO";
import { ProductType } from "../../types";
import {
  Mail,
  CheckCircle2,
  ArrowLeft,
  Star,
  Send,
  Share2,
  X,
  Check,
  User,
  Copy,
  Link as LinkIcon,
  BadgeCheck,
  ArrowRight,
  Calendar,
  FileText,
  BadgeCheck as VerifiedBadge,
} from "lucide-react";

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className || "h-5 w-5"}
  >
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const LinkedInIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className || "h-5 w-5"}
  >
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className || "h-5 w-5"}
  >
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className || "h-5 w-5"}
  >
    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
  </svg>
);

const XIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    className={`fill-current ${className || "h-5 w-5"}`}
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zl-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
  </svg>
);

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    className={`fill-current ${className || "h-5 w-5"}`}
  >
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93v6.16c0 2.52-1.12 4.84-2.9 6.24-1.72 1.35-4.03 2.08-6.3 1.83-2.15-.2-4.13-1.28-5.52-3.03-1.23-1.6-1.87-3.62-1.74-5.63.13-2.02.97-3.95 2.38-5.46.22-.23.46-.44.71-.64.08-.05.15-.09.22-.13V6.99c-.19.12-.37.26-.55.4a9.12 9.12 0 0 0-3.32 5.51c-.68 2.37-.2 4.96 1.35 6.94 1.53 1.95 4.02 3.12 6.57 3.07 2.63-.05 5.09-1.34 6.58-3.46 1.32-1.92 1.9-4.32 1.56-6.66V4.73c.01.01.02.01.03.01h.01v-4.72Z"></path>
  </svg>
);

const YouTubeIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className || "h-5 w-5"}
  >
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

export const AdvisorMicrosite: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const {
    allUsers,
    testimonials,
    addLead,
    addTestimonial,
    companySettings,
  } = useData();
  const [formSubmitted, setFormSubmitted] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copyText, setCopyText] = useState("Copy Link");

  const advisor = allUsers.find(
    (u) =>
      u.name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "") === slug,
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  const handleShare = async () => {
    if (!advisor) return;
    const shareData = {
      title: `${advisor.name} - ${advisor.title || "Advisor"}`,
      text: `Check out the profile for ${advisor.name}, a ${advisor.title || "Advisor"} at New Holland Financial Group!`,
      url: window.location.href,
    };
    if (
      navigator.share &&
      navigator.canShare &&
      navigator.canShare(shareData)
    ) {
      try {
        await navigator.share(shareData);
      } catch (error: any) {
        if (error.name !== "AbortError") setIsShareModalOpen(true);
      }
    } else {
      setIsShareModalOpen(true);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopyText("Copied!");
    setTimeout(() => setCopyText("Copy Link"), 2000);
  };

  const handleDownloadVCard = () => {
    if (!advisor) return;
    
    const vcard = `BEGIN:VCARD
VERSION:3.0
N:${advisor.name.split(' ').slice(1).join(' ') || ''};${advisor.name.split(' ')[0] || ''};;;
FN:${advisor.name}
ORG:New Holland Financial Group
TITLE:${advisor.title || 'Advisor'}
TEL;TYPE=WORK,VOICE:${advisor.phone || companySettings.phone || ''}
EMAIL;TYPE=PREF,INTERNET:${advisor.email || companySettings.email || ''}
URL:${window.location.href}
END:VCARD`;

    const blob = new Blob([vcard], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${advisor.name.replace(/\s+/g, '_')}.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  if (!advisor || !advisor.micrositeEnabled) {
    return <Navigate to="/advisors" replace />;
  }

  const advisorTestimonials = testimonials.filter(
    (t) => t.advisorId === advisor.id && t.status === "approved",
  );

  const [quoteForm, setQuoteForm] = useState({
    name: "",
    phone: "",
    email: "",
    interest: advisor.productsSold?.[0] || ProductType.LIFE,
    message: "",
  });
  const [testimonialForm, setTestimonialForm] = useState({
    name: "",
    rating: 0,
    text: "",
  });

  const handleQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addLead(
      {
        name: quoteForm.name,
        email: quoteForm.email,
        phone: quoteForm.phone,
        interest: quoteForm.interest,
        message: `Quote Request from microsite. Message: ${quoteForm.message}`,
        source: `advisor:${advisor.id}`,
      },
      advisor.id,
    );
    setFormSubmitted("quote");
    setQuoteForm({
      name: "",
      phone: "",
      email: "",
      interest: advisor.productsSold?.[0] || ProductType.LIFE,
      message: "",
    });
    setTimeout(() => setFormSubmitted(null), 5000);
  };

  const handleTestimonialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTestimonial({
      advisorId: advisor.id,
      clientName: testimonialForm.name,
      rating: testimonialForm.rating,
      reviewText: testimonialForm.text,
    });
    setFormSubmitted("testimonial");
    setTestimonialForm({ name: "", rating: 0, text: "" });
    setTimeout(() => setFormSubmitted(null), 5000);
  };

  const getSocialIcon = (platform: string) => {
    const size = "h-5 w-5";
    switch (platform) {
      case "LinkedIn":
        return <LinkedInIcon className={size} />;
      case "Facebook":
        return <FacebookIcon className={size} />;
      case "Twitter":
        return <TwitterIcon className={size} />;
      case "Instagram":
        return <InstagramIcon className={size} />;
      case "X":
        return <XIcon className={size} />;
      case "TikTok":
        return <TikTokIcon className={size} />;
      case "YouTube":
        return <YouTubeIcon className={size} />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-[#0c0d12] min-h-screen font-sans text-white pb-20 selection:bg-[#0c0d12] selection:text-slate-100">
      <SEO 
        title={`${advisor.name} | NHFG Licensed Advisor`} 
        description={advisor.bio || `Connect with ${advisor.name}, a licensed financial professional at New Holland Financial Group.`}
      />
      <div className="fixed top-8 left-4 md:left-8 z-40">
        <Link
          to="/advisors"
          className="bg-white/10 backdrop-blur-xl p-3 rounded-full shadow-sm border border-white/10 text-white hover:bg-white/20 hover:scale-105 transition-all flex items-center justify-center"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
      </div>

      <header className="pt-24 pb-16 px-4 text-center max-w-4xl mx-auto">
        <div className="mb-6 relative inline-block">
          <img
            src={
              advisor.avatar ||
              `https://ui-avatars.com/api/?name=${advisor.name}&background=0c0d12&color=fff`
            }
            alt={advisor.name}
            className="w-40 h-40 rounded-full object-cover shadow-sm mx-auto border-[6px] border-white/10"
          />
          <div className="absolute bottom-1 right-1 bg-[#0f172a] p-1 rounded-full shadow-sm border border-white/10">
            <VerifiedBadge className="h-8 w-8 text-[#F5A524] fill-[#F5A524]/20" />
          </div>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-semibold tracking-tight text-white mb-3">
          {advisor.name}
        </h1>
        <p className="text-xl text-slate-200 font-medium mb-10 tracking-tight">
          {advisor.title || `${advisor.category} Specialist`}
        </p>
        
        <div className="flex flex-wrap justify-center gap-3 md:gap-4">
          <Link
            to={`/book/${advisor.id}`}
            className="px-8 py-3.5 bg-[#F5A524] text-[#0c0d12] rounded-full font-medium hover:bg-[#E0941F] transition-colors flex items-center gap-2 shadow-sm"
          >
            <Calendar className="h-5 w-5" /> Book Meeting
          </Link>
          
          <button
            onClick={() => scrollToSection("quote-form")}
            className="px-8 py-3.5 bg-white/10 text-white rounded-full font-medium hover:bg-white/20 transition-colors flex items-center gap-2 shadow-sm border border-white/10"
          >
            <FileText className="h-5 w-5 text-slate-300" /> Free Quote
          </button>

          <button
            onClick={handleShare}
            className="px-8 py-3.5 bg-white/10 text-white rounded-full font-medium hover:bg-white/20 transition-colors flex items-center gap-2 shadow-sm border border-white/10"
          >
            <Share2 className="h-5 w-5 text-slate-300" /> Share
          </button>
          
          <button
            onClick={handleDownloadVCard}
            className="p-3.5 bg-white/10 text-white rounded-full font-medium hover:bg-white/20 transition-colors flex items-center gap-2 shadow-sm border border-white/10"
            title="Save Contact"
          >
            <User className="h-5 w-5 text-slate-300" />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 space-y-6">
        <section className="bg-white/5 backdrop-blur-xl rounded-[32px] p-8 md:p-12 shadow-sm border border-white/10">
          <h2 className="text-2xl font-semibold tracking-tight text-white mb-6 flex items-center gap-2">
            About Me
          </h2>
          <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed whitespace-pre-wrap text-lg">
            {advisor.bio ||
              "I am dedicated to helping my clients achieve their financial goals through comprehensive planning and tailored insurance solutions."}
          </div>

          {advisor.socialLinks && advisor.socialLinks.length > 0 && (
            <div className="mt-12 pt-8 border-t border-white/10">
              <h3 className="text-sm font-semibold tracking-tight text-white mb-4">
                Connect
              </h3>
              <div className="flex gap-3">
                {advisor.socialLinks.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white rounded-2xl transition-colors border border-white/10"
                  >
                    {getSocialIcon(link.platform)}
                  </a>
                ))}
              </div>
            </div>
          )}
        </section>

        {advisor.productsSold && advisor.productsSold.length > 0 && (
          <section className="bg-white/5 backdrop-blur-xl rounded-[32px] p-8 md:p-12 shadow-sm border border-white/10">
            <h2 className="text-2xl font-semibold tracking-tight text-white mb-8 flex items-center gap-2">
              Areas of Expertise
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {advisor.productsSold.map((product) => (
                <div
                  key={product}
                  className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10"
                >
                  <div className="bg-[#F5A524]/20 p-2 rounded-full shadow-sm text-[#F5A524]">
                    <Check className="h-4 w-4" />
                  </div>
                  <span className="font-medium text-white">
                    {product}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="bg-white/5 backdrop-blur-xl rounded-[32px] p-8 md:p-12 shadow-sm border border-white/10">
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-2xl font-semibold tracking-tight text-white flex items-center gap-2">
              Client Reviews
            </h2>
            <span className="text-sm font-medium text-slate-300">
              {advisorTestimonials.length} Reviews
            </span>
          </div>

          <div className="space-y-4 mb-12">
            {advisorTestimonials.length > 0 ? (
              advisorTestimonials.map((t) => (
                <div
                  key={t.id}
                  className="p-6 md:p-8 bg-white/5 rounded-[24px] border border-white/10"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="font-semibold tracking-tight text-white text-lg">
                      {t.clientName}
                    </div>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < t.rating ? "text-[#F5A524] fill-[#F5A524]" : "text-white/20"}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    "{t.reviewText}"
                  </p>
                  <p className="text-sm text-slate-400 font-medium mt-4">
                    {new Date(t.date).toLocaleDateString([], {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-slate-400 font-medium bg-white/5 rounded-[24px] border border-white/10">
                No reviews yet. Be the first to share your experience!
              </div>
            )}
          </div>

          <div className="bg-white/5 p-6 md:p-8 rounded-[24px] border border-white/10">
            <h3 className="text-lg font-semibold tracking-tight text-white mb-6">
              Submit Feedback
            </h3>
            {formSubmitted === "testimonial" ? (
              <div className="flex items-center gap-3 text-green-300 font-medium bg-green-900/30 p-6 rounded-2xl border border-green-500/30">
                <CheckCircle2 className="h-6 w-6" /> Your review has been
                submitted for verification.
              </div>
            ) : (
              <form
                onSubmit={handleTestimonialSubmit}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    className="w-full p-4 bg-white/5 rounded-2xl border border-white/10 text-white placeholder-slate-400 focus:bg-white/10 focus:ring-2 focus:ring-[#F5A524] outline-none shadow-sm transition-all"
                    placeholder="Full Name"
                    required
                    value={testimonialForm.name}
                    onChange={(e) =>
                      setTestimonialForm({
                        ...testimonialForm,
                        name: e.target.value,
                      })
                    }
                  />
                  <div className="flex items-center gap-2 bg-white/5 p-4 rounded-2xl border border-white/10 shadow-sm">
                    <span className="text-sm font-medium text-slate-300 mr-2">
                      Rating:
                    </span>
                    {[1, 2, 3, 4, 5].map((r) => (
                      <button
                        key={r}
                        type="button"
                        className="focus:outline-none"
                        onClick={() =>
                          setTestimonialForm({
                            ...testimonialForm,
                            rating: r,
                          })
                        }
                      >
                        <Star
                          className={`h-6 w-6 transition-colors ${testimonialForm.rating >= r ? "text-[#F5A524] fill-[#F5A524]" : "text-white/20 hover:text-white/40"}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  className="w-full p-4 bg-white/5 rounded-2xl border border-white/10 text-white placeholder-slate-400 focus:bg-white/10 focus:ring-2 focus:ring-[#F5A524] outline-none resize-none shadow-sm transition-all"
                  rows={4}
                  placeholder="How was your experience?"
                  required
                  value={testimonialForm.text}
                  onChange={(e) =>
                    setTestimonialForm({
                      ...testimonialForm,
                      text: e.target.value,
                    })
                  }
                ></textarea>
                <button
                  type="submit"
                  className="w-full py-4 bg-[#F5A524] text-[#0c0d12] rounded-2xl font-medium hover:bg-[#E0941F] transition-colors shadow-sm"
                >
                  Submit Experience
                </button>
              </form>
            )}
          </div>
        </section>

        <section
          id="quote-form"
          className="bg-white/5 backdrop-blur-xl rounded-[32px] p-8 md:p-12 shadow-sm border border-white/10 overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <Send className="h-40 w-40 text-white" />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-white mb-2 relative z-10">
            Get a Free Quote
          </h2>
          <p className="text-base text-slate-300 mb-8 relative z-10 font-medium">
            Connect directly with {advisor.name.split(" ")[0]} for a custom
            strategy.
          </p>

          {formSubmitted === "quote" ? (
            <div className="bg-green-900/30 p-10 rounded-[24px] text-center border border-green-500/30">
              <div className="w-16 h-16 bg-green-500/20 text-green-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold tracking-tight text-white">
                Success!
              </h3>
              <p className="text-base text-green-100 mt-2">
                Your request has been received. {advisor.name.split(" ")[0]}{" "}
                will contact you shortly.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleQuoteSubmit}
              className="space-y-4 relative z-10"
            >
              <div>
                <label className="text-sm font-semibold tracking-tight text-slate-300 ml-1 mb-2 block">
                  Full Name
                </label>
                <input
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-400 focus:bg-white/10 focus:ring-2 focus:ring-[#F5A524] outline-none transition-all"
                  placeholder="Ethan Wright"
                  required
                  value={quoteForm.name}
                  onChange={(e) =>
                    setQuoteForm({ ...quoteForm, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-semibold tracking-tight text-slate-300 ml-1 mb-2 block">
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-400 focus:bg-white/10 focus:ring-2 focus:ring-[#F5A524] outline-none transition-all"
                  placeholder="ethan@example.com"
                  required
                  value={quoteForm.email}
                  onChange={(e) =>
                    setQuoteForm({ ...quoteForm, email: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-semibold tracking-tight text-slate-300 ml-1 mb-2 block">
                  Product Focus
                </label>
                <select
                  className="w-full p-4 bg-[#0c0d12] border border-white/10 rounded-2xl text-white focus:ring-2 focus:ring-[#F5A524] outline-none cursor-pointer transition-all appearance-none"
                  value={quoteForm.interest}
                  onChange={(e) =>
                    setQuoteForm({
                      ...quoteForm,
                      interest: e.target.value as ProductType,
                    })
                  }
                >
                  {advisor.productsSold?.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold tracking-tight text-slate-300 ml-1 mb-2 block">
                  Additional Details
                </label>
                <textarea
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-400 focus:bg-white/10 focus:ring-2 focus:ring-[#F5A524] outline-none resize-none transition-all"
                  rows={4}
                  placeholder="How can I assist you today?"
                  value={quoteForm.message}
                  onChange={(e) =>
                    setQuoteForm({ ...quoteForm, message: e.target.value })
                  }
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full py-4 bg-[#F5A524] text-[#0c0d12] rounded-2xl font-medium text-lg hover:bg-[#E0941F] transition-colors flex items-center justify-center gap-2 group"
              >
                Submit Inquiry{" "}
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          )}
        </section>
      </main>

      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-[#0f172a] rounded-[32px] p-8 md:p-10 w-full max-w-sm shadow-2xl relative border border-white/10">
            <button
              onClick={() => setIsShareModalOpen(false)}
              className="absolute top-6 right-6 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="h-5 w-5 text-white" />
            </button>
            <h3 className="text-2xl font-semibold tracking-tight text-white mb-8 text-center">
              Share Profile
            </h3>

            <div className="grid grid-cols-4 gap-4 mb-8">
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`}
                target="_blank"
                className="flex flex-col items-center gap-2 group"
              >
                <div className="w-14 h-14 bg-[#1877F2] rounded-[18px] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                  <FacebookIcon className="h-6 w-6" />
                </div>
                <span className="text-xs font-medium text-slate-300">
                  Facebook
                </span>
              </a>
              <a
                href={`https://twitter.com/intent/tweet?url=${window.location.href}&text=Check out ${advisor.name}`}
                target="_blank"
                className="flex flex-col items-center gap-2 group"
              >
                <div className="w-14 h-14 bg-black rounded-[18px] flex items-center justify-center text-white shadow-sm border border-white/10 group-hover:scale-105 transition-transform">
                  <XIcon className="h-6 w-6" />
                </div>
                <span className="text-xs font-medium text-slate-300">
                  X
                </span>
              </a>
              <a
                href={`https://www.linkedin.com/shareArticle?mini=true&url=${window.location.href}`}
                target="_blank"
                className="flex flex-col items-center gap-2 group"
              >
                <div className="w-14 h-14 bg-[#0A66C2] rounded-[18px] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                  <LinkedInIcon className="h-6 w-6" />
                </div>
                <span className="text-xs font-medium text-slate-300">
                  LinkedIn
                </span>
              </a>
              <a
                href={`mailto:?subject=Check out ${advisor.name}&body=${window.location.href}`}
                className="flex flex-col items-center gap-2 group"
              >
                <div className="w-14 h-14 bg-white/20 rounded-[18px] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                  <Mail className="h-6 w-6" />
                </div>
                <span className="text-xs font-medium text-slate-300">
                  Email
                </span>
              </a>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/10">
              <LinkIcon className="h-5 w-5 text-slate-400 ml-2" />
              <input
                className="flex-1 bg-transparent text-sm font-medium text-white outline-none truncate"
                readOnly
                value={window.location.href}
              />
              <button
                onClick={handleCopyLink}
                className="px-4 py-2.5 bg-[#F5A524] text-[#0c0d12] text-sm font-medium rounded-xl hover:bg-[#E0941F] transition-colors flex items-center gap-2 shrink-0"
              >
                {copyText === 'Copied!' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copyText}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
