import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { CalendarEvent } from '../../types';
import { CalendarEventCard } from './CalendarEventCard';

interface CalendarGridProps {
  currentDate: Date;
  visibleEvents: CalendarEvent[];
  user: any;
  animConfig: any;
  todayStr: string;
  dragStartDate: string | null;
  dragCurrentDate: string | null;
  isEventStartingSoon: (date: string, time: string) => boolean;
  handleDateClick: (dateStr: string) => void;
  handleDragStart: (dateStr: string) => void;
  handleDragEnter: (dateStr: string) => void;
  handleDragEnd: () => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleEventDrop: (e: React.DragEvent, dateStr: string) => void;
  handleContextMenu: (e: React.MouseEvent, dateStr: string) => void;
  handleEventDragStart: (e: React.DragEvent, event: CalendarEvent) => void;
  handleEventClick: (event: CalendarEvent) => void;
  getFirstDayOfMonth: (date: Date) => number;
  getDaysInMonth: (date: Date) => number;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  currentDate,
  visibleEvents,
  user,
  animConfig,
  todayStr,
  dragStartDate,
  dragCurrentDate,
  isEventStartingSoon,
  handleDateClick,
  handleDragStart,
  handleDragEnter,
  handleDragEnd,
  handleDragOver,
  handleEventDrop,
  handleContextMenu,
  handleEventDragStart,
  handleEventClick,
  getFirstDayOfMonth,
  getDaysInMonth
}) => {
  return (
    <>
      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/50">
        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
          <div key={day} className="py-5 text-center text-xs font-bold text-slate-400 tracking-widest">{day}</div>
        ))}
      </div>

      <div className="flex-1 grid grid-cols-7 grid-rows-5 overflow-y-auto">
        {Array.from({ length: getFirstDayOfMonth(currentDate) }).map((_, i) => (
          <div key={`empty-${i}`} className="border-r border-b border-slate-100 bg-slate-50/30" />
        ))}

        {Array.from({ length: getDaysInMonth(currentDate) }).map((_, i) => {
          const day = i + 1;
          const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dayEvents = visibleEvents.filter(e => e.date === dateStr);
          const isTodayDay = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear();
          const isPast = dateStr < todayStr;
          
          const isDraggingOver = dragStartDate && dragCurrentDate && (
              (dateStr >= dragStartDate && dateStr <= dragCurrentDate) ||
              (dateStr <= dragStartDate && dateStr >= dragCurrentDate)
          );

          return (
            <div 
              key={day} 
              onClick={() => handleDateClick(dateStr)}
              onMouseDown={() => handleDragStart(dateStr)}
              onMouseEnter={() => handleDragEnter(dateStr)}
              onMouseUp={handleDragEnd}
              onDragOver={handleDragOver}
              onDrop={(e) => handleEventDrop(e, dateStr)}
              onContextMenu={(e) => handleContextMenu(e, dateStr)}
              className={`relative border-r border-b border-slate-100 p-4 min-h-[120px] transition-all duration-200 group select-none ${isDraggingOver ? 'bg-blue-50/60 ring-2 ring-blue-400 ring-inset' : isTodayDay ? 'bg-blue-50/40' : 'bg-white'} ${isPast ? 'opacity-60 cursor-default' : 'cursor-pointer hover:bg-slate-50'}`}
            >
              <span className={`inline-flex items-center justify-center w-9 h-9 text-sm font-bold rounded-full mb-3 transition-colors ${isTodayDay ? 'bg-blue-600 text-white shadow-lg' : isPast ? 'text-slate-300' : 'text-slate-700 group-hover:bg-slate-200'}`}>
                {day}
              </span>
              
              <div className="space-y-1.5">
                <AnimatePresence>
                  {dayEvents.map(event => (
                    <CalendarEventCard
                      key={event.id}
                      event={event}
                      user={user}
                      animConfig={animConfig}
                      isEventStartingSoon={isEventStartingSoon}
                      handleEventDragStart={handleEventDragStart}
                      handleEventClick={handleEventClick}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};
