import React, { useState, useEffect } from 'react';
import { X, ExternalLink, ShieldCheck, RefreshCw } from 'lucide-react';


interface Props {
  lead: any;
  onClose: () => void;
}

export const EmbeddedRootInsuranceModal: React.FC<Props> = ({ lead, onClose }) => {
  const [bridgeLink, setBridgeLink] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real environment, this would call our backend which calls Root API:
    // 1. POST /v3/quoting/quote (Create Quote)
    // 2. POST /v3/quoting/quote/{id}/bridge_link (Create Bridge Link)
    const initRootQuote = async () => {
      setIsLoading(true);
      try {
        // Mocking the API delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // For demonstration, since we don't have a real Root API key yet,
        // we will use a generic placeholder URL for the iframe, or a dummy string.
        // In production, this would be the actual root.com hosted experience URL.
        setBridgeLink('https://example.com/root-hosted-experience-placeholder');
      } catch (err) {
        alert("Failed to generate Root Insurance bridge link.");
      } finally {
        setIsLoading(false);
      }
    };
    initRootQuote();
  }, [lead]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B2240]/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden relative border border-white/20">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#FF5715]/10 text-[#FF5715] rounded-xl">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                Root Insurance Bind
                <span className="text-[10px] uppercase tracking-widest font-black bg-[#FF5715] text-white px-2 py-0.5 rounded-full">Embedded</span>
              </h2>
              <p className="text-sm text-slate-500">Generating Hosted Experience for {lead.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-white hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition-colors shadow-sm border border-slate-200">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-slate-50 relative p-4">
          {isLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10">
              <RefreshCw className="h-12 w-12 text-[#FF5715] animate-spin mb-6" />
              <h3 className="text-xl font-black text-slate-800 mb-2">Connecting to Root...</h3>
              <p className="text-sm text-slate-500">Provisioning secure bridge link for quote generation.</p>
            </div>
          ) : bridgeLink ? (
            <div className="w-full h-full bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200">
              {/* Note: Root dictates allow="payment" for the iframe */}
              <iframe
                src={bridgeLink}
                width="100%"
                height="100%"
                allow="payment"
                className="border-none bg-white"
                title="Root Embedded Insurance"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-slate-500">Failed to load embedded experience.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
