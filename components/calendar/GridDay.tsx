import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CalendarEvent } from '../../types';

interface GridDayProps {
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

    if (hours < 6 || hours > 20) return null;

    const top = ((hours - 6) * 96) + (minutes / 60) * 96;

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

export const GridDay: React.FC<GridDayProps> = ({ currentDate, visibleEvents, openModalNew, openModalEdit, updateEvent, todayStr }) => {
    const hours = Array.from({ length: 15 }).map((_, i) => i + 6); // 6 AM to 8 PM

    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
    const dayEvents = visibleEvents.filter(e => {
        if (e.date === dateStr) return true;
        if (e.endDate && dateStr >= e.date && dateStr <= e.endDate) return true;
        return false;
    });
    const isToday = dateStr === todayStr;

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
        <div className="flex flex-col h-full bg-white overflow-hidden">
            {/* Header */}
            <div className="flex border-b border-slate-100 bg-slate-50/50 flex-shrink-0 sticky top-0 z-20">
                <div className="p-4 border-r border-slate-100 w-24 flex-shrink-0" />
                <div className={`flex-1 flex flex-col items-center justify-center p-4 ${isToday ? 'bg-blue-50/20' : ''}`}>
                    <span className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-1">
                        {['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'][currentDate.getDay()]}
                    </span>
                    <span className={`text-2xl font-black w-10 h-10 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-800'}`}>
                        {currentDate.getDate()}
                    </span>
                </div>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto no-scrollbar relative flex">
                {/* Time labels axis */}
                <div className="flex flex-col border-r border-slate-100 bg-white sticky left-0 z-10 w-24 flex-shrink-0">
                    {hours.map(h => (
                        <div key={h} className="h-24 flex items-start justify-end pr-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100/50">
                            {h > 12 ? h - 12 : h} {h >= 12 ? 'PM' : 'AM'}
                        </div>
                    ))}
                </div>

                {/* Main Column */}
                <div
                    className={`flex-1 relative border-r border-slate-100 min-w-[300px] ${isToday ? 'bg-blue-50/10' : ''}`}
                    onDragOver={e => e.preventDefault()}
                    onDrop={handleDrop}
                >
                    {isToday && <CurrentTimeIndicator />}
                    {hours.map(h => (
                        <div
                            key={h}
                            className="h-24 border-b border-slate-100/50 hover:bg-slate-50 cursor-pointer transition-colors"
                            onClick={() => openModalNew(dateStr, 'meeting')}
                        />
                    ))}

                    {/* Events absolutely positioned */}
                    {dayEvents.map(event => {
                        const match = event.time.match(/(\d+):(\d+)\s*(AM|PM)/i);
                        let top = 0;
                        if (match) {
                            let [_, hStr, mStr, ampm] = match;
                            let h = parseInt(hStr);
                            if (ampm.toUpperCase() === 'PM' && h !== 12) h += 12;
                            if (ampm.toUpperCase() === 'AM' && h === 12) h = 0;

                            if (h < 6) top = 0;
                            else top = ((h - 6) * 96) + (parseInt(mStr) / 60) * 96; // 96px is h-24
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
                                className={`absolute left-4 right-4 rounded-xl p-3 border shadow-sm cursor-grab overflow-hidden flex flex-col ${bg}`}
                                style={{ top: top + 'px', height: '84px', zIndex: 30 }}
                            >
                                <div className={`absolute top-0 bottom-0 left-0 w-1.5 ${bar}`} />
                                <div className={`text-xs font-bold uppercase tracking-wider ${text} opacity-70 mb-1 ml-2 flex items-center justify-between`}>
                                    <span>{event.time}</span>
                                    <span className="capitalize text-[10px]">{event.type.replace('-', ' ')}</span>
                                </div>
                                <h4 className={`text-sm font-bold truncate ml-2 ${text}`}>{event.title}</h4>
                                {event.description && <p className={`text-xs truncate font-medium ml-2 mt-0.5 ${text} opacity-60`}>{event.description}</p>}
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
