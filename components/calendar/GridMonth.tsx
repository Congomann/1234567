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

    const getDaysInMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    const getFirstDayOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1).getDay();

    const daysInMonth = getDaysInMonth(currentDate);
    const firstDayOfWeek = getFirstDayOfMonth(currentDate);
    const totalCells = Math.ceil((firstDayOfWeek + daysInMonth) / 7) * 7;

    const DAY_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

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
            // Dropped from palette
            if (dateStr >= todayStr) openModalNew(dateStr, type as CalendarEvent['type']);
            return;
        }

        if (eventId && dateStr >= todayStr) {
            // Dropped existing event
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

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header */}
            <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50 flex-shrink-0">
                {DAY_LABELS.map(d => (
                    <div key={d} className="py-3 text-center text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                        {d}
                    </div>
                ))}
            </div>

            {/* Grid */}
            <div className="flex-1 grid grid-cols-7 grid-rows-6 auto-rows-fr overflow-hidden">
                {Array.from({ length: totalCells }).map((_, i) => {
                    const dayNum = i - firstDayOfWeek + 1;
                    const isValid = dayNum >= 1 && dayNum <= daysInMonth;
                    const dateStr = isValid ? `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}` : '';
                    const isToday = dateStr === todayStr;
                    const isPast = isValid && dateStr < todayStr;

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
                            onClick={() => isValid && !isPast ? openModalNew(dateStr, 'meeting') : undefined}
                            className={`border-r border-b border-slate-100 p-2 flex flex-col gap-1 transition-colors
                                ${isValid && !isPast ? 'hover:bg-slate-50 cursor-pointer' : ''}
                                ${isToday ? 'bg-blue-50/20' : ''}
                            `}
                        >
                            {isValid && (
                                <div className="flex justify-between items-center mb-1">
                                    <span className={`text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white shadow-sm' : isPast ? 'text-slate-300' : 'text-slate-700'}`}>
                                        {dayNum}
                                    </span>
                                </div>
                            )}

                            {isValid && (
                                <div className="flex flex-col gap-1 overflow-y-auto no-scrollbar">
                                    {dayEvents.map(event => {
                                        let bg = 'bg-slate-100', text = 'text-slate-600', dot = 'bg-slate-400';
                                        if (event.type === 'meeting') { bg = 'bg-blue-50'; text = 'text-blue-700'; dot = 'bg-blue-500'; }
                                        if (event.type === 'task') { bg = 'bg-orange-50'; text = 'text-orange-700'; dot = 'bg-orange-500'; }
                                        if (event.type === 'reminder') { bg = 'bg-yellow-50'; text = 'text-yellow-700'; dot = 'bg-yellow-500'; }
                                        if (event.type === 'off-day') { bg = 'bg-slate-100'; text = 'text-slate-600'; dot = 'bg-slate-500'; }

                                        return (
                                            <motion.div
                                                key={event.id}
                                                draggable={!isPast && event.status !== 'canceled'}
                                                onDragStart={(e: any) => handleEventDragStart(e, event)}
                                                onClick={(e: any) => {
                                                    e.stopPropagation();
                                                    openModalEdit(event);
                                                }}
                                                onMouseDown={e => e.stopPropagation()}
                                                whileHover={{ scale: 0.98 }}
                                                className={`flex items-center gap-1.5 px-2 py-1 rounded-md ${bg} ${event.status === 'canceled' ? 'opacity-50 line-through' : ''} cursor-grab active:cursor-grabbing border border-black/5`}
                                            >
                                                <div className={`w-1.5 h-1.5 rounded-full ${dot} flex-shrink-0`} />
                                                <span className={`text-xs font-semibold truncate ${text}`}>{event.title}</span>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
