import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useData } from '../context/DataContext';

/**
 * SystemStatus - Global Maintenance Banner
 * Provides a marquee-style announcement for system status and maintenance.
 */
export const SystemStatus: React.FC = () => {
  const { companySettings } = useData();
  
  // Logic: Show if settings explicitly enable it, or fallback to a local constant
  const [dismissed, setDismissed] = React.useState(false);
  const isMaintenance = companySettings?.maintenanceMode || false;
  const message = companySettings?.maintenanceMessage || "SYSTEM MAINTENANCE IN PROGRESS: Upgrading core infrastructure.";

  const forceShow = false; 

  if (dismissed || (!isMaintenance && !forceShow)) return null;

  return (
    <div className="relative w-full bg-[#F59E0B] text-[#451A03] overflow-hidden py-1.5 border-b border-amber-600/30 shadow-md z-[10000]">
      {/* Background Micro-pattern */}
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>
      
      <div className="flex items-center whitespace-nowrap animate-marquee">
        <span className="flex items-center mx-12 font-bold text-[10px] sm:text-xs uppercase tracking-widest">
          <AlertTriangle className="h-3.5 w-3.5 mr-3 flex-shrink-0" />
          {message}
        </span>
        <span className="flex items-center mx-12 font-bold text-[10px] sm:text-xs uppercase tracking-widest">
          <AlertTriangle className="h-3.5 w-3.5 mr-3 flex-shrink-0" />
          {message}
        </span>
        <span className="flex items-center mx-12 font-bold text-[10px] sm:text-xs uppercase tracking-widest">
          <AlertTriangle className="h-3.5 w-3.5 mr-3 flex-shrink-0" />
          {message}
        </span>
      </div>
      
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-marquee {
          display: flex;
          width: fit-content;
          animation: marquee 45s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};
