import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarEvent } from '../../types';
import { Sidebar } from '../../components/calendar/Sidebar';
import { GridMonth } from '../../components/calendar/GridMonth';
import { GridWeek } from '../../components/calendar/GridWeek';
import { GridDay } from '../../components/calendar/GridDay';
import { EventModal } from '../../components/calendar/EventModal';
import { Tab3DBanner } from '../../components/shared/Tab3DBanner';
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

  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyBookingLink = () => {
    const advisorSlug = user?.name ? user.name.toLowerCase().replace(/\s+/g, '-') : 'remmy-shabani';
    const link = `${window.location.origin}/schedule?advisor=${advisorSlug}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  return (
    <div className="space-y-6">
      <Tab3DBanner
        cards={[
          { title: "Scheduled Appointments", value: "42 Meetings", subtitle: "This Month", emoji: "📅", gradient: "cyan", linkText: "View Schedule" },
          { title: "Upcoming Client Calls", value: "18 Calls Today", subtitle: "SignalWire Integrated", emoji: "⏰", gradient: "yellow", linkText: "Join Calls" },
          { title: "Completed Consultations", value: "128 Sessions", subtitle: "98% Attendance Rate", emoji: "🏆", gradient: "pink", linkText: "Review Logs" }
        ]}
      />

      {/* Copy Link Toast Alert */}
      {copiedLink && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 font-bold text-xs flex items-center gap-3 animate-in fade-in">
          <span>✅ Personal Client Booking Link Copied to Clipboard! (`/schedule?advisor=${user?.name?.toLowerCase().replace(/\s+/g, '-') || 'remmy-shabani'}`)</span>
        </div>
      )}

      <div className="flex h-full w-full bg-[#f6f8fb] text-slate-800 rounded-[2.5rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
      {/* Sidebar with Alerts */}
      <Sidebar visibleEvents={visibleEvents} onAlertClick={openModalEdit} />

      <div className="flex-1 flex flex-col h-full overflow-hidden bg-white/50 backdrop-blur-xl">
        {/* Header matching exact screenshot aesthetics */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-8 py-6 border-b border-slate-100 bg-white gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Calendar</h1>
            <p className="text-sm font-semibold text-slate-400 mt-0.5">{titleFormat()}</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyBookingLink}
              className="px-5 py-2.5 bg-[#0B2240] hover:bg-slate-800 text-white text-xs font-black rounded-xl shadow-lg transition-all flex items-center gap-2"
            >
              <span>🔗 Copy My Booking Link</span>
            </button>

            <button 
              onClick={handlePrev} 
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold rounded-xl transition-all"
            >
              ← Prev
            </button>

            <button 
              onClick={handleToday} 
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black rounded-xl shadow-lg shadow-blue-500/20 transition-all"
            >
              Today
            </button>

            <button 
              onClick={handleNext} 
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold rounded-xl transition-all"
            >
              Next →
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
    </div>
  );
};

const PlusIcon = ({ className, onClick }: { className?: string; onClick?: () => void }) => (
  <svg onClick={onClick} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);
