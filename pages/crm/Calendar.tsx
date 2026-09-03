import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { AnimatePresence } from 'framer-motion';
import { CalendarEvent } from '../../types';
import { Sidebar } from '../../components/calendar/Sidebar';
import { GridMonth } from '../../components/calendar/GridMonth';
import { GridWeek } from '../../components/calendar/GridWeek';
import { GridDay } from '../../components/calendar/GridDay';
import { EventModal } from '../../components/calendar/EventModal';
import { MeetingsDashboard } from '../../components/calendar/MeetingsDashboard';
import { LayoutDashboard, Calendar as CalendarIcon, Link as LinkIcon } from 'lucide-react';

export type CalendarViewType = 'month' | 'week' | 'day';
export type MainViewMode = 'dashboard' | 'calendar';

export const Calendar: React.FC = () => {
  const { events, updateEvent, user } = useData();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarViewType>('month');
  const [mainViewMode, setMainViewMode] = useState<MainViewMode>('dashboard');

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
      const isPublic = e.visibility ? e.visibility === 'public' : (e.type === 'meeting' || e.type === 'off-day');
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
      {/* Top View Toggle Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-2 bg-slate-200/50 dark:bg-slate-900/50 rounded-2xl backdrop-blur-md border border-white/20 dark:border-white/10">
        <div className="flex items-center gap-1.5 p-1 bg-slate-300/60 dark:bg-slate-800/80 rounded-xl">
          <button
            onClick={() => setMainViewMode('dashboard')}
            className={`px-5 py-2.5 rounded-lg text-xs font-black transition-all flex items-center gap-2 ${
              mainViewMode === 'dashboard'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>3D Meetings Dashboard</span>
          </button>
          <button
            onClick={() => setMainViewMode('calendar')}
            className={`px-5 py-2.5 rounded-lg text-xs font-black transition-all flex items-center gap-2 ${
              mainViewMode === 'calendar'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            <span>Calendar Grid View</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyBookingLink}
            className="px-4 py-2 bg-[#0B2240] hover:bg-slate-800 text-white text-xs font-black rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            <span>🔗 Copy Booking Link</span>
          </button>
          <button
            onClick={() => openModalNew(todayStr)}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-black rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-1.5"
          >
            <span>+ Schedule Meeting</span>
          </button>
        </div>
      </div>

      {/* Copy Link Toast Alert */}
      {copiedLink && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 font-bold text-xs flex items-center gap-3 animate-in fade-in">
          <span>✅ Personal Client Booking Link Copied to Clipboard!</span>
        </div>
      )}

      {/* Main Mode 1: 3D Meetings Dashboard */}
      {mainViewMode === 'dashboard' && (
        <MeetingsDashboard onOpenNewModal={() => openModalNew(todayStr)} />
      )}

      {/* Main Mode 2: Calendar Grid View */}
      {mainViewMode === 'calendar' && (
        <div className="flex h-full w-full bg-[#f6f8fb] text-slate-800 rounded-[2.5rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
          {/* Sidebar with Alerts */}
          <Sidebar visibleEvents={visibleEvents} onAlertClick={openModalEdit} />

          <div className="flex-1 flex flex-col h-full overflow-hidden bg-white/50 backdrop-blur-xl">
            {/* Header matching exact aesthetics */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-8 py-6 border-b border-slate-100 bg-white gap-4">
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Calendar Grid</h1>
                <p className="text-sm font-semibold text-slate-400 mt-0.5">{titleFormat()}</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
                  <button
                    onClick={() => setView('month')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      view === 'month' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Month
                  </button>
                  <button
                    onClick={() => setView('week')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      view === 'week' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Week
                  </button>
                  <button
                    onClick={() => setView('day')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      view === 'day' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Day
                  </button>
                </div>

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

                <div className="w-px h-6 bg-slate-200 mx-1"></div>

                <button 
                  onClick={() => {
                    const url = `${window.location.origin}/book/${user?.id || 'admin'}`;
                    navigator.clipboard.writeText(url);
                    alert(`Public booking link copied to clipboard!\n${url}`);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-black rounded-xl shadow-lg shadow-slate-900/20 transition-all"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  Copy Booking Link
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
        </div>
      )}

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
