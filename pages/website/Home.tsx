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

  // Hero Video Playlist Logic
  const activePlaylist = (companySettings.heroVideoPlaylist || []).filter(Boolean);
  const playlist = activePlaylist.length > 0
    ? activePlaylist
    : (companySettings.heroBackgroundUrl ? [companySettings.heroBackgroundUrl] : []);

  const isDirectMp4 = Boolean(
    companySettings.heroBackgroundUrl?.match(/\.(mp4|webm|mov)(\?.*)?$/i) || 
    companySettings.heroBackgroundUrl?.startsWith('data:video') ||
    companySettings.heroBackgroundUrl?.includes('/api/storage/')
  );
  const isVideoType = companySettings.heroBackgroundType === "video" || playlist.length > 0 || isDirectMp4;

  const currentVideoSrc = playlist[currentVideoIndex % (playlist.length || 1)] || companySettings.heroBackgroundUrl;

  const handleVideoEnded = () => {
    if (playlist.length > 1) {
      setCurrentVideoIndex((prev) => (prev + 1) % playlist.length);
    }
  };

  return (
    <div className="bg-white flex-1 font-sans">
      <div className="relative min-h-[90vh] flex items-center overflow-hidden">
        {isVideoType && currentVideoSrc ? (
          <>
            <video
              key={currentVideoSrc}
              src={currentVideoSrc}
              autoPlay
              muted={isMuted}
              playsInline
              onEnded={handleVideoEnded}
              loop={playlist.length <= 1}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/45 pointer-events-none"></div>

            {/* Interactive Video Carousel Indicator (when multiple videos exist) */}
            {playlist.length > 1 && (
              <div className="absolute bottom-8 right-8 z-30 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 flex items-center gap-3 shadow-2xl">
                <span className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-1.5">
                  <PlayCircle size={12} className="text-blue-400 animate-pulse" /> Video { (currentVideoIndex % playlist.length) + 1 } / { playlist.length }
                </span>
                <div className="flex items-center gap-1.5 border-l border-white/20 pl-3">
                  {playlist.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentVideoIndex(idx)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        (currentVideoIndex % playlist.length) === idx
                          ? 'w-6 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]'
                          : 'w-2 bg-white/40 hover:bg-white/70'
                      }`}
                      title={`Switch to Video ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            )}
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
          <div className="absolute inset-0 bg-slate-950">
            {companySettings.heroBackgroundUrl && (
              <img
                src={companySettings.heroBackgroundUrl}
                className="absolute inset-0 w-full h-full object-cover"
                alt="Hero Background"
              />
            )}
            <div className="absolute inset-0 bg-black/40 pointer-events-none"></div>
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
            
          {Object.keys(partners).length > 0 && (
            <div className="w-full relative flex items-center px-4 overflow-hidden mask-edges pb-10">
              <div
                className="flex w-max hover:[animation-play-state:paused] gap-16 px-8"
                style={{ animation: `partnerMarquee ${companySettings.partnerMarqueeSpeed || 30}s linear infinite` }}
              >
                {[...Object.entries(partners), ...Object.entries(partners), ...Object.entries(partners)].map(([name, url], idx) => (
                  <div key={`${name}-${idx}`} className="h-16 flex-shrink-0 flex items-center justify-center transition-all opacity-70 hover:opacity-100 grayscale hover:grayscale-0">
                    <img
                      src={
                        (url as string).startsWith('http') || (url as string).startsWith('data:')
                          ? (url as string)
                          : `https://logo.clearbit.com/${url}`
                      }
                      alt={name}
                      className="h-9 object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <span className="text-white text-xs font-bold ml-2">{name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
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
