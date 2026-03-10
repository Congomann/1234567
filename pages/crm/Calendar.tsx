import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarEvent } from '../../types';
import { Sidebar } from '../../components/calendar/Sidebar';
import { GridMonth } from '../../components/calendar/GridMonth';
import { GridWeek } from '../../components/calendar/GridWeek';
import { GridDay } from '../../components/calendar/GridDay';
import { EventModal } from '../../components/calendar/EventModal';
import { ChevronLeft, ChevronRight, Search, List, Filter, Bell, Globe } from 'lucide-react';

export type CalendarViewType = 'month' | 'week' | 'day';

export const Calendar: React.FC = () => {
  const { events, addEvent, updateEvent, deleteEvent, user } = useData();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarViewType>('month');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [prefillType, setPrefillType] = useState<CalendarEvent['type']>('meeting');

  // Utilities
  const todayStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  // Visible events logic based on Public / Private
  const visibleEvents = useMemo(() => {
    return events.filter(e => {
      // Default visibility fallback based on instructions if undefined
      const isPublic = e.visibility ? e.visibility === 'public' : (e.type === 'meeting' || e.type === 'off-day');

      // Public events visible to all. Private visible only to creator.
      if (isPublic) return true;
      return e.creatorId === user?.id;
    });
  }, [events, user]);

  // Handlers
  const handlePrev = () => {
    const d = new Date(currentDate);
    if (view === 'month') d.setMonth(d.getMonth() - 1);
    if (view === 'week') d.setDate(d.getDate() - 7);
    if (view === 'day') d.setDate(d.getDate() - 1);
    setCurrentDate(d);
  };

  const handleNext = () => {
    const d = new Date(currentDate);
    if (view === 'month') d.setMonth(d.getMonth() + 1);
    if (view === 'week') d.setDate(d.getDate() + 7);
    if (view === 'day') d.setDate(d.getDate() + 1);
    setCurrentDate(d);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const openModalNew = (date: string, type: CalendarEvent['type'] = 'meeting', time: string = '09:00 AM') => {
    setSelectedEvent(null);
    setSelectedDate(new Date(date + 'T00:00:00'));
    setPrefillType(type);
    setModalOpen(true);
  };

  const openModalEdit = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setSelectedDate(null);
    setModalOpen(true);
  };

  const titleFormat = () => {
    if (view === 'month') {
      return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } else if (view === 'week') {
      const start = new Date(currentDate);
      start.setDate(start.getDate() - start.getDay());
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else {
      return currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    }
  };

  return (
    <div className="flex h-full w-full bg-[#f6f8fb] text-slate-800 rounded-[2.5rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
      {/* Sidebar with Alerts */}
      <Sidebar visibleEvents={visibleEvents} onAlertClick={openModalEdit} />

      <div className="flex-1 flex flex-col h-full overflow-hidden bg-white/50 backdrop-blur-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl">
              <button onClick={handleToday} className="px-4 py-1.5 text-sm font-semibold text-slate-700 bg-white rounded-lg shadow-sm">Today</button>
              <button onClick={handlePrev} className="p-2 text-slate-500 hover:text-slate-900 transition-colors"><ChevronLeft size={20} /></button>
              <button onClick={handleNext} className="p-2 text-slate-500 hover:text-slate-900 transition-colors"><ChevronRight size={20} /></button>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 min-w-[160px]">{titleFormat()}</h2>
            <div className="text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 flex items-center gap-1.5 ml-1 mt-1 uppercase tracking-widest">
              <Globe size={14} />
              {Intl.DateTimeFormat().resolvedOptions().timeZone.replace(/_/g, ' ')}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-slate-100/80 p-1 rounded-xl text-sm font-medium">
              <button
                onClick={() => setView('month')}
                className={`px-4 py-1.5 rounded-lg transition-all ${view === 'month' ? 'bg-white shadow-sm text-slate-900 font-semibold' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Month
              </button>
              <button
                onClick={() => setView('week')}
                className={`px-4 py-1.5 rounded-lg transition-all ${view === 'week' ? 'bg-white shadow-sm text-slate-900 font-semibold' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Week
              </button>
              <button
                onClick={() => setView('day')}
                className={`px-4 py-1.5 rounded-lg transition-all ${view === 'day' ? 'bg-white shadow-sm text-slate-900 font-semibold' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Day
              </button>
            </div>
            <button className="bg-slate-900 text-white p-2.5 rounded-full hover:bg-slate-800 transition-transform hover:scale-105 active:scale-95 shadow-sm">
              <PlusIcon className="w-5 h-5" onClick={() => openModalNew(todayStr)} />
            </button>
          </div>
        </div>

        {/* Calendar View Area */}
        <div className="flex-1 overflow-auto bg-white relative">
          {view === 'month' && (
            <GridMonth
              currentDate={currentDate}
              visibleEvents={visibleEvents}
              openModalNew={openModalNew}
              openModalEdit={openModalEdit}
              updateEvent={updateEvent}
              todayStr={todayStr}
            />
          )}
          {view === 'week' && (
            <GridWeek
              currentDate={currentDate}
              visibleEvents={visibleEvents}
              openModalNew={openModalNew}
              openModalEdit={openModalEdit}
              updateEvent={updateEvent}
              todayStr={todayStr}
            />
          )}
          {view === 'day' && (
            <GridDay
              currentDate={currentDate}
              visibleEvents={visibleEvents}
              openModalNew={openModalNew}
              openModalEdit={openModalEdit}
              updateEvent={updateEvent}
              todayStr={todayStr}
            />
          )}
        </div>
      </div>

      <AnimatePresence>
        {modalOpen && (
          <EventModal
            isOpen={modalOpen}
            close={() => setModalOpen(false)}
            selectedDate={selectedDate}
            selectedEvent={selectedEvent}
            prefillType={prefillType}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const PlusIcon = ({ className, onClick }: { className?: string; onClick?: () => void }) => (
  <svg onClick={onClick} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);
