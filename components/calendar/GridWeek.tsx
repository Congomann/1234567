import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CalendarEvent } from '../../types';

interface GridWeekProps {
    currentDate: Date;
    visibleEvents: CalendarEvent[];
    openModalNew: (date: string, type: CalendarEvent['type']) => void;
    openModalEdit: (event: CalendarEvent) => void;
    updateEvent: (event: CalendarEvent) => void;
    todayStr: string;
}

const CurrentTimeIndicator = () => {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const i = setInterval(() => setNow(new Date()), 60000);
        return () => clearInterval(i);
    }, []);

    const hours = now.getHours();
    const minutes = now.getMinutes();

    if (hours < 7 || hours > 19) return null;

    const top = ((hours - 7) * 80) + (minutes / 60) * 80;

    return (
        <div
            className="absolute left-0 right-0 z-40 flex items-center pointer-events-none"
            style={{ top: `${top}px`, transform: 'translateY(-50%)' }}
        >
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.7)] z-10 -ml-1.5" />
            <div className="flex-1 border-t-2 border-red-500 shadow-[0_1px_3px_rgba(239,68,68,0.3)]" />
        </div>
    );
};

export const GridWeek: React.FC<GridWeekProps> = ({ currentDate, visibleEvents, openModalNew, openModalEdit, updateEvent, todayStr }) => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    const days = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(startOfWeek);
        d.setDate(d.getDate() + i);
        return d;
    });

    const hours = Array.from({ length: 13 }).map((_, i) => i + 7); // 7 AM to 7 PM

    return (
        <div className="flex flex-col h-full bg-white overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-8 border-b border-slate-100 bg-slate-50/50 flex-shrink-0 sticky top-0 z-20">
                <div className="p-4 border-r border-slate-100 w-16" />
                {days.map((d, i) => {
                    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                    const isToday = dateStr === todayStr;
                    return (
                        <div key={i} className={`flex flex-col items-center justify-center p-3 border-r border-slate-100 ${isToday ? 'bg-blue-50/20' : ''}`}>
                            <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-1">{['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][d.getDay()]}</span>
                            <span className={`text-lg font-semibold w-8 h-8 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-800'}`}>
                                {d.getDate()}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto no-scrollbar relative">
                <div className="grid grid-cols-8 min-w-[800px]">
                    {/* Time labels axis */}
                    <div className="flex flex-col border-r border-slate-100 bg-white sticky left-0 z-10 w-16">
                        {hours.map(h => (
                            <div key={h} className="h-20 flex items-start justify-end pr-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100/50">
                                {h > 12 ? h - 12 : h} {h >= 12 ? 'PM' : 'AM'}
                            </div>
                        ))}
                    </div>

                    {/* Columns */}
                    {days.map((d, colIdx) => {
                        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                        const isToday = dateStr === todayStr;
                        const dayEvents = visibleEvents.filter(e => {
                            if (e.date === dateStr) return true;
                            if (e.endDate && dateStr >= e.date && dateStr <= e.endDate) return true;
                            return false;
                        });

                        const handleDrop = (e: React.DragEvent) => {
                            e.preventDefault();
                            let type = e.dataTransfer.getData('application/x-nhfg-type') as CalendarEvent['type'] | '';
                            let eventId = e.dataTransfer.getData('eventId');

                            try {
                                const dataStr = e.dataTransfer.getData('text/plain');
                                if (dataStr) {
                                    const data = JSON.parse(dataStr);
                                    if (data.type === 'palette') type = data.blockType;
                                    if (data.type === 'event') eventId = data.id;
                                }
                            } catch (err) { }

                            if (type && !eventId && dateStr >= todayStr) return openModalNew(dateStr, type as CalendarEvent['type']);
                            if (eventId && dateStr >= todayStr) {
                                const event = visibleEvents.find(ev => ev.id === eventId);
                                if (event) updateEvent({ ...event, date: dateStr });
                            }
                        };

                        return (
                            <div
                                key={colIdx}
                                className={`relative border-r border-slate-100 ${isToday ? 'bg-blue-50/10' : ''}`}
                                onDragOver={e => e.preventDefault()}
                                onDrop={handleDrop}
                            >
                                {isToday && <CurrentTimeIndicator />}
                                {hours.map(h => (
                                    <div
                                        key={h}
                                        className="h-20 border-b border-slate-100/50 hover:bg-slate-50 cursor-pointer transition-colors"
                                        onClick={() => openModalNew(dateStr, 'meeting')}
                                    />
                                ))}

                                {/* Events absolutely positioned */}
                                {dayEvents.map(event => {
                                    // simple parser for time strings like "10:30 AM"
                                    const match = event.time.match(/(\d+):(\d+)\s*(AM|PM)/i);
                                    let top = 0;
                                    if (match) {
                                        let [_, hStr, mStr, ampm] = match;
                                        let h = parseInt(hStr);
                                        if (ampm.toUpperCase() === 'PM' && h !== 12) h += 12;
                                        if (ampm.toUpperCase() === 'AM' && h === 12) h = 0;

                                        // constrain bounds based on visual grid
                                        if (h < 7) top = 0;
                                        else top = ((h - 7) * 80) + (parseInt(mStr) / 60) * 80;
                                    }

                                    let bg = 'bg-slate-200 border-slate-300', text = 'text-slate-800', bar = 'bg-slate-500';
                                    if (event.type === 'meeting') { bg = 'bg-blue-100 border-blue-200'; text = 'text-blue-900'; bar = 'bg-blue-500'; }
                                    if (event.type === 'task') { bg = 'bg-orange-100 border-orange-200'; text = 'text-orange-900'; bar = 'bg-orange-500'; }
                                    if (event.type === 'reminder') { bg = 'bg-yellow-100 border-yellow-200'; text = 'text-yellow-900'; bar = 'bg-yellow-500'; }
                                    if (event.type === 'off-day') { bg = 'bg-slate-100 border-slate-200'; text = 'text-slate-600'; bar = 'bg-slate-400'; }

                                    return (
                                        <motion.div
                                            key={event.id}
                                            draggable
                                            onDragStart={(e: any) => {
                                                e.stopPropagation();
                                                e.dataTransfer.setData('eventId', event.id);
                                                e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'event', id: event.id }));
                                            }}
                                            onClick={(e: any) => { e.stopPropagation(); openModalEdit(event); }}
                                            onMouseDown={e => e.stopPropagation()}
                                            whileHover={{ filter: 'brightness(0.95)' }}
                                            className={`absolute left-2 right-2 rounded-xl p-2 border shadow-sm cursor-grab overflow-hidden ${bg}`}
                                            style={{ top: top + 'px', height: '70px' }}
                                        >
                                            <div className={`absolute top-0 bottom-0 left-0 w-1 ${bar}`} />
                                            <div className={`text-[10px] font-bold uppercase tracking-wider ${text} opacity-70 mb-0.5 ml-1 flex justify-between`}>
                                                <span>{event.time}</span>
                                            </div>
                                            <h4 className={`text-xs font-bold truncate ml-1 ${text}`}>{event.title}</h4>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
