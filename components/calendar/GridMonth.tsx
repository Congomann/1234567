import React from 'react';
import { motion } from 'framer-motion';
import { CalendarEvent } from '../../types';

interface GridMonthProps {
    currentDate: Date;
    visibleEvents: CalendarEvent[];
    openModalNew: (date: string, type: CalendarEvent['type']) => void;
    openModalEdit: (event: CalendarEvent) => void;
    updateEvent: (event: CalendarEvent) => void;
    todayStr: string;
}

export const GridMonth: React.FC<GridMonthProps> = ({ currentDate, visibleEvents, openModalNew, openModalEdit, updateEvent, todayStr }) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const DAY_LABELS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

    const getDaysInMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    // Adjust day of week for Monday start (0=Mon, 6=Sun)
    const getFirstDayOfMonth = (d: Date) => {
        const day = new Date(d.getFullYear(), d.getMonth(), 1).getDay();
        return day === 0 ? 6 : day - 1;
    };

    const daysInMonth = getDaysInMonth(currentDate);
    const firstDayOfWeek = getFirstDayOfMonth(currentDate);
    const totalCells = Math.ceil((firstDayOfWeek + daysInMonth) / 7) * 7;

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, dateStr: string) => {
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

        if (type && !eventId) {
            if (dateStr >= todayStr) openModalNew(dateStr, type as CalendarEvent['type']);
            return;
        }

        if (eventId && dateStr >= todayStr) {
            const event = visibleEvents.find(ev => ev.id === eventId);
            if (event) {
                updateEvent({ ...event, date: dateStr });
            }
        }
    };

    const handleEventDragStart = (e: React.DragEvent, event: CalendarEvent) => {
        e.stopPropagation();
        e.dataTransfer.setData('eventId', event.id);
        e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'event', id: event.id }));
        e.dataTransfer.effectAllowed = 'move';
    };

    // Helper for pill badge color based on title or type
    const getEventBadgeStyle = (event: CalendarEvent) => {
        const titleLower = event.title.toLowerCase();
        if (titleLower.includes('compliance') || titleLower.includes('month close')) {
            return 'bg-[#ef4444] text-white';
        }
        if (titleLower.includes('whitfield') || titleLower.includes('holden') || titleLower.includes('call') || titleLower.includes('meeting')) {
            return 'bg-[#10b981] text-white';
        }
        if (titleLower.includes('team') || titleLower.includes('standup')) {
            return 'bg-[#8b5cf6] text-white';
        }
        if (titleLower.includes('foster') || titleLower.includes('contract')) {
            return 'bg-[#f59e0b] text-white';
        }
        return 'bg-[#0066cc] text-white';
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50 flex-shrink-0">
                {DAY_LABELS.map(d => (
                    <div key={d} className="py-4 text-center text-xs font-black text-slate-400 tracking-wider uppercase">
                        {d}
                    </div>
                ))}
            </div>

            {/* Grid */}
            <div className="flex-1 grid grid-cols-7 grid-rows-5 auto-rows-fr overflow-hidden bg-white">
                {Array.from({ length: totalCells }).map((_, i) => {
                    const dayNum = i - firstDayOfWeek + 1;
                    const isValid = dayNum >= 1 && dayNum <= daysInMonth;
                    const dateStr = isValid ? `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}` : '';
                    const isToday = dateStr === todayStr;

                    const dayEvents = isValid ? visibleEvents.filter(e => {
                        if (e.date === dateStr) return true;
                        if (e.endDate && dateStr >= e.date && dateStr <= e.endDate) return true;
                        return false;
                    }).sort((a, b) => a.time.localeCompare(b.time)) : [];

                    return (
                        <div
                            key={i}
                            onDragOver={handleDragOver}
                            onDrop={(e) => isValid ? handleDrop(e, dateStr) : undefined}
                            onClick={() => isValid ? openModalNew(dateStr, 'meeting') : undefined}
                            className={`border-r border-b border-slate-100 p-3 flex flex-col gap-2 min-h-[110px] transition-colors ${
                                isValid ? 'hover:bg-slate-50/80 cursor-pointer' : 'bg-slate-50/30'
                            }`}
                        >
                            {isValid && (
                                <div className="flex justify-between items-center mb-1">
                                    <span className={`text-xs font-extrabold ${
                                        isToday 
                                            ? 'w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-md shadow-blue-500/20' 
                                            : 'text-slate-700'
                                    }`}>
                                        {dayNum}
                                    </span>
                                </div>
                            )}

                            {isValid && (
                                <div className="flex flex-col gap-1.5 overflow-y-auto no-scrollbar">
                                    {dayEvents.map(event => (
                                        <motion.div
                                            key={event.id}
                                            draggable={event.status !== 'canceled'}
                                            onDragStart={(e: any) => handleEventDragStart(e, event)}
                                            onClick={(e: any) => {
                                                e.stopPropagation();
                                                openModalEdit(event);
                                            }}
                                            onMouseDown={e => e.stopPropagation()}
                                            whileHover={{ scale: 0.98 }}
                                            className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold truncate shadow-sm transition-all ${getEventBadgeStyle(event)}`}
                                        >
                                            {event.title}
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
