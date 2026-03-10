import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarEvent } from '../../types';
import { Bell, Clock, Calendar, AlertCircle } from 'lucide-react';

interface SidebarProps {
    visibleEvents: CalendarEvent[];
    onAlertClick?: (event: CalendarEvent) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ visibleEvents, onAlertClick }) => {

    // Filter alerts: 
    // We only want to alert on events happening "soon" or upcoming.
    // For this context, let's just show events that are scheduled for today or in the future
    // sorted by date and time in a list.
    const alerts = useMemo(() => {
        const now = new Date();
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

        let upcoming = visibleEvents.filter(e => {
            if (e.status === 'canceled') return false;
            // Also factor in endDate for off-days and multi-day events
            if (e.endDate && todayStr >= e.date && todayStr <= e.endDate) return true;
            return e.date >= todayStr;
        });

        // Sort by date then time
        upcoming.sort((a, b) => {
            if (a.date !== b.date) return a.date.localeCompare(b.date);
            return a.time.localeCompare(b.time);
        });

        return upcoming.slice(0, 8); // top 8 upcoming
    }, [visibleEvents]);

    return (
        <div className="w-80 bg-white/70 backdrop-blur-2xl border-r border-white/80 p-6 flex flex-col pt-8 overflow-hidden relative shadow-[1px_0_15px_rgba(0,0,0,0.02)]">

            {/* Apple iOS Glow Effect */}
            <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-blue-100/50 to-transparent pointer-events-none opacity-60" />

            <div className="mb-8 relative z-10">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 bg-blue-600 rounded-[1rem] shadow-lg shadow-blue-500/20">
                        <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <h1 className="text-[28px] font-black text-slate-900 tracking-tight leading-none">Schedule</h1>
                </div>
                <p className="text-[13px] font-semibold text-slate-400 mt-2 tracking-wide uppercase opacity-80">Up Next</p>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar relative z-10 -mx-2 px-2 pb-6">
                <AnimatePresence>
                    {alerts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-center px-4">
                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                                <AlertCircle className="w-5 h-5 text-slate-300" />
                            </div>
                            <p className="text-sm font-semibold text-slate-500">No upcoming events or internal alerts.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {alerts.map((event, i) => {
                                let bg = 'bg-white', text = 'text-slate-800', dot = 'bg-slate-400', iconBg = 'bg-slate-50 text-slate-400', border = 'border-slate-100';
                                if (event.type === 'meeting') { border = 'border-blue-100'; iconBg = 'bg-blue-50 text-blue-500'; text = 'text-blue-900'; dot = 'bg-blue-500'; }
                                if (event.type === 'task') { border = 'border-orange-100'; iconBg = 'bg-orange-50 text-orange-500'; text = 'text-orange-900'; dot = 'bg-orange-500'; }
                                if (event.type === 'reminder') { border = 'border-yellow-100'; iconBg = 'bg-yellow-50 text-yellow-500'; text = 'text-yellow-900'; dot = 'bg-yellow-500'; }
                                if (event.type === 'off-day') { border = 'border-slate-200'; iconBg = 'bg-slate-100 text-slate-500'; text = 'text-slate-700'; dot = 'bg-slate-500'; }

                                const nowStr = new Date().toISOString().split('T')[0];
                                const isToday = event.date === nowStr || (event.endDate && event.date <= nowStr && event.endDate >= nowStr);

                                return (
                                    <motion.div
                                        key={event.id}
                                        initial={{ opacity: 0, y: 15, scale: 0.98 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        transition={{ delay: i * 0.05, type: 'spring', stiffness: 300, damping: 25 }}
                                        onClick={() => onAlertClick && onAlertClick(event)}
                                        className={`p-4 rounded-[1.25rem] border ${border} bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all flex flex-col gap-2 relative overflow-hidden group cursor-pointer`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-1.5 mb-1.5">
                                                    <span className={`w-1.5 h-1.5 rounded-full ${dot} shadow-sm`} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                        {isToday ? 'Today' : new Date(event.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {event.time}
                                                    </span>
                                                </div>
                                                <h3 className={`font-bold text-sm leading-tight ${text} truncate max-w-[180px]`}>{event.title}</h3>
                                            </div>
                                            <div className={`p-1.5 rounded-xl ${iconBg} shadow-sm group-hover:scale-110 transition-transform`}>
                                                <Bell className="w-3.5 h-3.5" />
                                            </div>
                                        </div>

                                        <div className="pt-2 border-t border-slate-100/50 flex justify-between items-center text-[10px] font-bold text-slate-400">
                                            <div className="flex items-center gap-1">
                                                <span className="uppercase tracking-widest">{event.visibility === 'private' ? 'Private' : 'Public'}</span>
                                            </div>
                                            <span className="capitalize">{event.type.replace('-', ' ')}</span>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </AnimatePresence>
            </div>

            <div className="mt-auto pt-6 pb-2 border-t border-slate-200/50 backdrop-blur-md sticky bottom-0 z-20 space-y-3">
                <div className="flex items-center gap-2 text-[11px] font-black tracking-widest uppercase text-slate-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-sm" />
                    <span>Public / Team Notified</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-black tracking-widest uppercase text-slate-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400 shadow-sm" />
                    <span>Private (Silent)</span>
                </div>
            </div>
        </div>
    );
};
