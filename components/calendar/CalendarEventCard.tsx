import React from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, AlertCircle, CheckCircle2, Coffee, Lock, Link as LinkIcon } from 'lucide-react';
import { CalendarEvent } from '../../types';

interface CalendarEventCardProps {
  event: CalendarEvent;
  user: any; // Using any for now to avoid importing User type if not strictly needed, or I can import it
  animConfig: any;
  isEventStartingSoon: (date: string, time: string) => boolean;
  handleEventDragStart: (e: React.DragEvent, event: CalendarEvent) => void;
  handleEventClick: (event: CalendarEvent) => void;
}

export const CalendarEventCard: React.FC<CalendarEventCardProps> = ({
  event,
  user,
  animConfig,
  isEventStartingSoon,
  handleEventDragStart,
  handleEventClick
}) => {
  const startingSoon = isEventStartingSoon(event.date, event.time);

  const getEventStyles = (type: string) => {
    switch(type) {
      case 'meeting': return 'bg-purple-50 border-l-4 border-purple-500 text-slate-900 hover:bg-purple-100';
      case 'reminder': return 'bg-blue-50 border-l-4 border-blue-500 text-slate-900 hover:bg-blue-100';
      case 'task': return 'bg-pink-50 border-l-4 border-pink-500 text-slate-900 hover:bg-pink-100';
      case 'off-day': return 'bg-slate-50 border-l-4 border-slate-500 text-slate-900 hover:bg-slate-100';
      default: return 'bg-slate-50 border-l-4 border-slate-500 text-slate-900 hover:bg-slate-100';
    }
  };

  const getEventIcon = (type: string) => {
    switch(type) {
        case 'meeting': return <div className="w-1 h-4 bg-purple-500 rounded-full mr-2" />;
        case 'reminder': return <div className="w-1 h-4 bg-blue-500 rounded-full mr-2" />;
        case 'task': return <div className="w-1 h-4 bg-pink-500 rounded-full mr-2" />;
        case 'off-day': return <div className="w-1 h-4 bg-slate-500 rounded-full mr-2" />;
        default: return <div className="w-1 h-4 bg-slate-500 rounded-full mr-2" />;
    }
  };

  const isCanceled = event.status === 'canceled';

  return (
    <motion.div 
        layoutId={event.id}
        draggable={event.creatorId === user?.id && !isCanceled}
        onDragStart={(e) => handleEventDragStart(e as any, event)}
        onClick={(e) => { e.stopPropagation(); handleEventClick(event); }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: isCanceled ? 0.6 : 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        whileHover={!isCanceled ? { scale: 1.02 } : {}}
        transition={{ duration: 0.2 }}
        className={`group/event flex flex-col justify-between p-3 rounded-xl cursor-pointer shadow-sm transition-all h-full ${getEventStyles(event.type)} ${startingSoon && !isCanceled ? 'animate-pulse ring-2 ring-purple-200' : ''} ${isCanceled ? 'grayscale line-through opacity-60 border-dashed' : ''}`}
    >
        <div className="flex flex-col gap-1 overflow-hidden">
            <div className="flex items-center gap-2">
                {/* Icon is handled by border-l-4 now, but we can add specific icons if needed */}
                <span className="font-bold text-xs truncate leading-tight">{event.type === 'off-day' ? `${event.creatorName?.split(' ')[0]}: OFF` : event.title}</span>
            </div>
            <span className="text-[10px] font-medium text-slate-500">
                {event.time} {event.endTime ? `- ${event.endTime}` : ''}
            </span>
        </div>
        
        <div className="flex items-end justify-between mt-2">
            {event.participants && event.participants.length > 0 ? (
            <div className="flex -space-x-2">
                {event.participants.slice(0, 3).map((p, i) => (
                    <div key={i} className="h-5 w-5 rounded-full bg-white border border-slate-100 flex items-center justify-center text-[8px] text-slate-600 font-bold uppercase shadow-sm" title={p.name}>
                        {p.name.charAt(0)}
                    </div>
                ))}
                {event.participants.length > 3 && (
                    <div className="h-5 w-5 rounded-full bg-slate-100 border border-white flex items-center justify-center text-[8px] text-slate-500 font-bold shadow-sm">
                        +{event.participants.length - 3}
                    </div>
                )}
            </div>
            ) : <div />}

            {event.type === 'meeting' && (
                <button 
                onClick={(e) => { 
                    e.stopPropagation(); 
                    window.open(event.meetingLink || 'https://meet.google.com', '_blank'); 
                }}
                className="px-2 py-1 bg-white hover:bg-slate-50 text-blue-600 rounded-lg transition-colors flex items-center gap-1 text-[9px] font-bold shadow-sm border border-blue-100"
                >
                <LinkIcon className="h-3 w-3" />
                Meet
                </button>
            )}
        </div>
    </motion.div>
  );
};
