import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as Icons from "lucide-react";
import {
  ArrowRight,
  ShieldCheck,
  Home as HomeIcon,
  Briefcase,
  Truck,
  Volume2,
  VolumeX,
  TrendingUp,
  Landmark,
} from "lucide-react";
import { useData } from "../../context/DataContext";
import { ProductType } from "../../types";
import { LifeInsuranceRecommenderModal } from "../../components/LifeInsuranceRecommenderModal";
import { MortgageRecommenderModal } from "../../components/MortgageRecommenderModal";
import { BusinessInsuranceRecommenderModal } from "../../components/BusinessInsuranceRecommenderModal";
import { AutoInsuranceRecommenderModal } from "../../components/AutoInsuranceRecommenderModal";
import { SecuritiesRecommenderModal } from "../../components/SecuritiesRecommenderModal";
import { RealEstateRecommenderModal } from "../../components/RealEstateRecommenderModal";

const getYoutubeId = (url: string) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

export const Home: React.FC = () => {
  const { companySettings } = useData();
  const [isMuted, setIsMuted] = useState(true);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isLifeModalOpen, setIsLifeModalOpen] = useState(false);
  const [isMortgageModalOpen, setIsMortgageModalOpen] = useState(false);
  const [isBusinessModalOpen, setIsBusinessModalOpen] = useState(false);
  const [isAutoModalOpen, setIsAutoModalOpen] = useState(false);
  const [isSecuritiesModalOpen, setIsSecuritiesModalOpen] = useState(false);
  const [isRealEstateModalOpen, setIsRealEstateModalOpen] = useState(false);
  const navigate = useNavigate();

  const youtubeId = getYoutubeId(companySettings.heroBackgroundUrl);
  const hiddenProducts = companySettings.hiddenProducts || [];
  const partners = companySettings.partners || {};

  // Playlist Logic
  const playlist =
    companySettings.heroVideoPlaylist &&
      companySettings.heroVideoPlaylist.length > 0
      ? companySettings.heroVideoPlaylist
      : [companySettings.heroBackgroundUrl];

  const currentVideoSrc = playlist[currentVideoIndex % playlist.length];

  const handleVideoEnded = () => {
    if (playlist.length > 1) {
      setCurrentVideoIndex((prev) => (prev + 1) % playlist.length);
    }
  };

  return (
    <div className="bg-white flex-1 font-sans">
      <div className="relative min-h-[90vh] flex items-center overflow-hidden">
        {companySettings.heroBackgroundType === "video" ? (
          <>
            <video
              key={currentVideoSrc}
              autoPlay
              muted={isMuted}
              className="absolute inset-0 w-full h-full object-cover"
              playsInline
              onEnded={handleVideoEnded}
              // Loop single video if only one exists
              loop={playlist.length <= 1}
            >
              <source src={currentVideoSrc} type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-black/50 pointer-events-none"></div>
          </>
        ) : companySettings.heroBackgroundType === "youtube" && youtubeId ? (
          <>
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <iframe
                className="absolute top-1/2 left-1/2 w-[300%] h-[300%] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=${isMuted ? "1" : "0"}&controls=0&loop=1&playlist=${youtubeId}&playsinline=1&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&disablekb=1`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Background Video"
              ></iframe>
            </div>
            <div className="absolute inset-0 bg-black/50 pointer-events-none"></div>
          </>
        ) : (
          <div className="absolute inset-0 bg-slate-900">
            {companySettings.heroBackgroundUrl && (
              <img
                src={companySettings.heroBackgroundUrl}
                className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-overlay"
                alt="Hero"
              />
            )}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-700 via-slate-900 to-black opacity-80"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-amber-500/20 via-transparent to-transparent"></div>
          </div>
        )}

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col justify-center h-full pt-32">
          <div className="max-w-5xl animate-slide-up">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8 leading-[1.1] text-white drop-shadow-2xl">
              {companySettings.heroTitle ||
                "Securing Your Future, Protecting Your Legacy."}
            </h1>
            <p className="text-xl md:text-3xl text-blue-100/95 mb-12 leading-relaxed max-w-3xl font-medium tracking-wide drop-shadow-lg">
              {companySettings.heroSubtitle ||
                "New Holland Financial Group provides comprehensive insurance and financial solutions."}
            </p>

            <div className="flex flex-col sm:flex-row gap-6">
              <Link
                to="/products"
                className="px-10 py-5 bg-white text-slate-900 font-bold rounded-full text-lg hover:scale-105 transition-all shadow-xl flex items-center justify-center"
              >
                Explore Solutions <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/advisors"
                className="px-10 py-5 bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold rounded-full text-lg hover:bg-white/20 hover:scale-105 transition-all flex items-center justify-center"
              >
                Find an Advisor
              </Link>
            </div>
          </div>
        </div>

        {(companySettings.heroBackgroundType === "video" ||
          companySettings.heroBackgroundType === "youtube") && (
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="absolute bottom-10 right-10 p-4 rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-lg border border-white/10 transition-all z-20 pointer-events-auto"
            >
              {isMuted ? (
                <VolumeX className="h-6 w-6" />
              ) : (
                <Volume2 className="h-6 w-6" />
              )}
            </button>
          )}
      </div>



      <div className="py-24 bg-slate-50 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Animated Marquee Partners Section Promoted to Top */}
          <div className="mb-32">
            <div className="text-center mb-16">
              <span className="px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-bold text-xs uppercase tracking-widest border border-blue-200">
                OUR PARTNERS
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mt-6 tracking-tight">
                Trusted by Industry Leaders
              </h2>
            </div>
            
            <div className="w-full relative flex items-center px-4 overflow-hidden mask-edges pb-10">
              <div
                className="flex w-max hover:[animation-play-state:paused] gap-16 px-8"
                style={{ animation: `partnerMarquee ${companySettings.partnerMarqueeSpeed || 30}s linear infinite` }}
              >
                {/* Render the list 3 times to ensure looping seamlessly fills screen */}
                {[...Object.entries(Object.keys(partners).length > 0 ? partners : {
                  "Acme Corp": "https://logo.clearbit.com/acme.com",
                  "Globex": "https://logo.clearbit.com/globex.com",
                  "Soylent": "https://logo.clearbit.com/soylent.com",
                  "Initech": "https://logo.clearbit.com/initech.com"
                }), ...Object.entries(Object.keys(partners).length > 0 ? partners : {
                  "Acme Corp": "https://logo.clearbit.com/acme.com",
                  "Globex": "https://logo.clearbit.com/globex.com",
                  "Soylent": "https://logo.clearbit.com/soylent.com",
                  "Initech": "https://logo.clearbit.com/initech.com"
                }), ...Object.entries(Object.keys(partners).length > 0 ? partners : {
                  "Acme Corp": "https://logo.clearbit.com/acme.com",
                  "Globex": "https://logo.clearbit.com/globex.com",
                  "Soylent": "https://logo.clearbit.com/soylent.com",
                  "Initech": "https://logo.clearbit.com/initech.com"
                }), ...Object.entries(Object.keys(partners).length > 0 ? partners : {
                  "Acme Corp": "https://logo.clearbit.com/acme.com",
                  "Globex": "https://logo.clearbit.com/globex.com",
                  "Soylent": "https://logo.clearbit.com/soylent.com",
                  "Initech": "https://logo.clearbit.com/initech.com"
                })].map(([name, url], idx) => (
                  <div key={`${name}-${idx}`} className="h-16 flex-shrink-0 flex items-center justify-center transition-all opacity-70 hover:opacity-100 grayscale hover:grayscale-0">
                    <img
                      src={
                        (url as string).startsWith("http") ||
                          (url as string).startsWith("data:")
                          ? url
                          : (url as string).startsWith("/") 
                            ? url 
                            : `https://logo.clearbit.com/${url}`
                      }
                      alt={name}
                      className="h-full object-contain max-w-[150px]"
                      title={name}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
            <style dangerouslySetInnerHTML={{
              __html: `
              .mask-edges {
                mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
                -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
              }
              @keyframes partnerMarquee {
                from { transform: translateX(0); }
                to { transform: translateX(calc(-25% - 1rem)); } 
              }
            `}} />
          </div>




        </div>
      </div>

      <LifeInsuranceRecommenderModal
        isOpen={isLifeModalOpen}
        onClose={() => setIsLifeModalOpen(false)}
      />
      <MortgageRecommenderModal
        isOpen={isMortgageModalOpen}
        onClose={() => setIsMortgageModalOpen(false)}
      />
      <BusinessInsuranceRecommenderModal
        isOpen={isBusinessModalOpen}
        onClose={() => setIsBusinessModalOpen(false)}
      />
      <AutoInsuranceRecommenderModal
        isOpen={isAutoModalOpen}
        onClose={() => setIsAutoModalOpen(false)}
      />
      <SecuritiesRecommenderModal
        isOpen={isSecuritiesModalOpen}
        onClose={() => setIsSecuritiesModalOpen(false)}
      />
      <RealEstateRecommenderModal
        isOpen={isRealEstateModalOpen}
        onClose={() => setIsRealEstateModalOpen(false)}
      />

    </div>
  );
};
