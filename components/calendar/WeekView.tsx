import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { CalendarEvent } from '../../types';
import { CalendarEventCard } from './CalendarEventCard';

interface WeekViewProps {
  currentDate: Date;
  visibleEvents: CalendarEvent[];
  user: any;
  animConfig: any;
  todayStr: string;
  isEventStartingSoon: (date: string, time: string) => boolean;
  handleEventClick: (event: CalendarEvent) => void;
  handleEventDragStart: (e: React.DragEvent, event: CalendarEvent) => void;
  handleEventDrop: (e: React.DragEvent, dateStr: string, timeStr?: string) => void;
  handleDragOver: (e: React.DragEvent) => void;
}

export const WeekView: React.FC<WeekViewProps> = ({
  currentDate,
  visibleEvents,
  user,
  animConfig,
  todayStr,
  isEventStartingSoon,
  handleEventClick,
  handleEventDragStart,
  handleEventDrop,
  handleDragOver
}) => {
  const weekDays = useMemo(() => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    startOfWeek.setDate(diff);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      days.push(d);
    }
    return days;
  }, [currentDate]);

  const hours = Array.from({ length: 18 }, (_, i) => i + 6); // 6 AM to 11 PM

  const getEventStyle = (event: CalendarEvent) => {
    const parseTime = (timeStr: string) => {
        if (timeStr === 'All Day') return { h: 9, m: 0 };
        const [time, modifier] = timeStr.split(' ');
        let [h, m] = time.split(':').map(Number);
        if (modifier === 'PM' && h !== 12) h += 12;
        if (modifier === 'AM' && h === 12) h = 0;
        return { h, m };
    };

    const start = parseTime(event.time);
    const end = event.endTime ? parseTime(event.endTime) : { h: start.h + 1, m: start.m };

    const startMinutes = (start.h - 6) * 60 + start.m; // Offset by 6 AM
    const durationMinutes = (end.h * 60 + end.m) - (start.h * 60 + start.m);
    
    // 1 hour = 120px (2px per minute)
    const top = startMinutes * 2;
    const height = durationMinutes * 2;

    return {
        top: `${top}px`,
        height: `${height}px`,
        position: 'absolute' as const,
        left: '4px',
        right: '4px',
        zIndex: 10
    };
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">
      {/* Header Row */}
      <div className="flex border-b border-slate-200">
        <div className="w-20 flex-shrink-0 p-4 text-center font-bold text-slate-400 text-xs bg-slate-50 border-r border-slate-100">
            GMT
        </div>
        <div className="flex-1 grid grid-cols-7 divide-x divide-slate-100">
            {weekDays.map((day, i) => {
                const dateStr = day.toISOString().split('T')[0];
                const isToday = dateStr === todayStr;
                return (
                    <div key={i} className={`p-4 text-center border-b-4 ${isToday ? 'bg-blue-50/50 border-blue-600' : 'border-transparent'}`}>
                        <div className={`text-sm font-bold uppercase ${isToday ? 'text-blue-600' : 'text-slate-500'}`}>
                            <span className="text-lg mr-1">{day.getDate().toString().padStart(2, '0')}</span>
                            {day.toLocaleDateString('en-US', { weekday: 'short' })}
                        </div>
                    </div>
                );
            })}
        </div>
      </div>

      {/* Time Grid */}
      <div className="flex-1 overflow-y-auto no-scrollbar relative">
        <div className="flex min-h-[1440px]"> {/* 12 hours * 120px = 1440px minimum, but we have 18 hours */}
            {/* Time Labels */}
            <div className="w-20 flex-shrink-0 bg-slate-50 border-r border-slate-100 divide-y divide-slate-100">
                {hours.map(hour => (
                    <div key={hour} className="h-[120px] relative">
                        <span className="absolute -top-3 left-0 right-0 text-center text-xs font-bold text-slate-400">
                            {hour > 12 ? `${hour - 12}pm` : hour === 12 ? '12pm' : `${hour}am`}
                        </span>
                    </div>
                ))}
            </div>

            {/* Days Columns */}
            <div className="flex-1 grid grid-cols-7 divide-x divide-slate-100 relative">
                {/* Horizontal Grid Lines */}
                <div className="absolute inset-0 pointer-events-none z-0">
                    {hours.map(hour => (
                        <div key={hour} className="h-[120px] border-b border-slate-50 w-full" />
                    ))}
                </div>

                {weekDays.map((day, i) => {
                    const dateStr = day.toISOString().split('T')[0];
                    const dayEvents = visibleEvents.filter(e => e.date === dateStr && e.type !== 'off-day');

                    return (
                        <div 
                            key={i} 
                            className="relative h-full group"
                            onDragOver={handleDragOver}
                            onDrop={(e) => {
                                // Calculate time based on drop position Y
                                const rect = e.currentTarget.getBoundingClientRect();
                                const y = e.clientY - rect.top + e.currentTarget.scrollTop;
                                const minutesFrom6am = y / 2;
                                const hour = Math.floor(minutesFrom6am / 60) + 6;
                                const minute = Math.floor(minutesFrom6am % 60);
                                const timeStr = `${hour > 12 ? hour - 12 : hour}:${minute.toString().padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'}`;
                                handleEventDrop(e, dateStr, timeStr);
                            }}
                        >
                            {/* Render Events */}
                            {dayEvents.map(event => (
                                <div key={event.id} style={getEventStyle(event)}>
                                    <CalendarEventCard
                                        event={event}
                                        user={user}
                                        animConfig={animConfig}
                                        isEventStartingSoon={isEventStartingSoon}
                                        handleEventDragStart={handleEventDragStart}
                                        handleEventClick={handleEventClick}
                                    />
                                </div>
                            ))}
                        </div>
                    );
                })}
            </div>
        </div>
      </div>
    </div>
  );
};
