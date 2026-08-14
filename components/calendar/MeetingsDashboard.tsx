import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../../context/DataContext';
import { CalendarEvent } from '../../types';
import {
  Video,
  Calendar,
  Clock,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Copy,
  Check,
  ExternalLink,
  Search,
  Filter,
  Disc,
  Play,
  Users,
  Globe,
  RefreshCw,
  XCircle,
  CheckCircle2,
  Sparkles,
  Shield,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';

export type DashboardTab = 'upcoming' | 'previous' | 'personal_room' | 'templates';

const AVAILABLE_TIMEZONES = ['EDT', 'PDT', 'CST', 'MST', 'GMT', 'UTC'];

interface TemplateItem {
  id: string;
  title: string;
  duration: string;
  type: string;
  description: string;
  badge: string;
}

const MEETING_TEMPLATES: TemplateItem[] = [
  {
    id: 'tmpl-1',
    title: '15-min Quick Consultation',
    duration: '15 mins',
    type: 'Intake Sync',
    description: 'Rapid financial discovery call for new prospective clients.',
    badge: 'Popular'
  },
  {
    id: 'tmpl-2',
    title: '30-min Wealth Strategy Review',
    duration: '30 mins',
    type: 'Portfolio Advisory',
    description: 'Mid-term asset allocation and portfolio rebalancing check-in.',
    badge: 'Executive'
  },
  {
    id: 'tmpl-3',
    title: '60-min Estate & Trust Planning',
    duration: '60 mins',
    type: 'Comprehensive',
    description: 'Deep-dive session covering tax minimization and trust structures.',
    badge: 'Advisory'
  },
  {
    id: 'tmpl-4',
    title: '45-min Real Estate Escrow Sync',
    duration: '45 mins',
    type: 'Transaction',
    description: 'Commercial property loan closing and escrow documentation review.',
    badge: 'Closing'
  }
];

export const MeetingsDashboard: React.FC<{ onOpenNewModal?: () => void }> = ({ onOpenNewModal }) => {
  const { events, updateEvent } = useData();

  // Tab & Filter States
  const [activeTab, setActiveTab] = useState<DashboardTab>('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'scheduled' | 'rescheduled' | 'canceled' | 'completed'>('all');
  
  // Interactive Personal Room State
  const [roomCameraOn, setRoomCameraOn] = useState(true);
  const [roomMicOn, setRoomMicOn] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Toast System
  const [toast, setToast] = useState<{ id: number; message: string; type?: 'info' | 'success' } | null>(null);

  const showToast = (message: string, type: 'info' | 'success' = 'success') => {
    const id = Date.now();
    setToast({ id, message, type });
    setTimeout(() => {
      setToast(prev => (prev?.id === id ? null : prev));
    }, 3000);
  };

  // Helper for copying text
  const handleCopy = (text: string, label: string, keyId: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(keyId);
    showToast(`${label} copied to clipboard!`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Dynamic Header Stats
  const stats = useMemo(() => {
    let scheduled = 0;
    let rescheduled = 0;
    let canceled = 0;

    events.forEach(ev => {
      const st = ev.status || 'scheduled';
      if (st === 'scheduled') scheduled++;
      else if (st === 'rescheduled') rescheduled++;
      else if (st === 'canceled') canceled++;
    });

    return { scheduled, rescheduled, canceled };
  }, [events]);

  // Tab & Search Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter(ev => {
      const evStatus = ev.status || 'scheduled';

      // 1. Status Card / Dropdown Filter
      if (statusFilter !== 'all' && evStatus !== statusFilter) {
        return false;
      }

      // 2. Tab Filter
      if (activeTab === 'upcoming') {
        if (evStatus === 'canceled' && statusFilter === 'all') return false;
        if (evStatus === 'completed' && statusFilter === 'all') return false;
      } else if (activeTab === 'previous') {
        if (evStatus !== 'completed' && evStatus !== 'canceled' && statusFilter === 'all') {
          // Check if date is in past
          const evDate = new Date(`${ev.date} ${ev.time || '00:00'}`);
          if (evDate >= new Date() && evStatus !== 'completed') return false;
        }
      }

      // 3. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = ev.title.toLowerCase().includes(q);
        const descMatch = ev.description?.toLowerCase().includes(q) || false;
        const participantMatch = ev.participants?.some(p => p.name.toLowerCase().includes(q)) || false;
        return titleMatch || descMatch || participantMatch;
      }

      return true;
    });
  }, [events, activeTab, statusFilter, searchQuery]);

  // Avatar Initials Helper
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto px-1 sm:px-4 py-2">
      {/* Toast Feedback Popup */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900/90 dark:bg-slate-100/95 text-white dark:text-slate-900 shadow-2xl backdrop-blur-md border border-cyan-500/30 text-sm font-medium"
          >
            <Sparkles className="w-4 h-4 text-cyan-400 dark:text-cyan-600 animate-pulse" />
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* R1.1 3D GLASSMorphic HEADER STATS CARDS                                   */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Scheduled Meetings */}
        <motion.div
          whileHover={{ y: -6, scale: 1.02 }}
          onClick={() => setStatusFilter(prev => (prev === 'scheduled' ? 'all' : 'scheduled'))}
          className={`apple-3d-card apple-glass relative overflow-hidden rounded-2xl p-6 cursor-pointer border transition-all duration-300 ${
            statusFilter === 'scheduled'
              ? 'ring-2 ring-cyan-400 border-cyan-400/50 shadow-[0_0_25px_rgba(6,182,212,0.35)]'
              : 'border-white/20 dark:border-white/10 hover:border-cyan-500/40'
          }`}
        >
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-gradient-to-br from-cyan-500/20 to-blue-600/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                Active Schedule
              </p>
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
                {stats.scheduled} <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Meetings</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Confirmed & Upcoming</p>
            </div>

            {/* 3D Levitating Badge */}
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 p-0.5 shadow-lg shadow-cyan-500/30 animate-float-3d">
              <div className="w-full h-full bg-slate-900/40 backdrop-blur-md rounded-[14px] flex items-center justify-center text-white">
                <Calendar className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-200/50 dark:border-slate-800/50 text-xs">
            <span className="text-cyan-600 dark:text-cyan-400 font-medium flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              {statusFilter === 'scheduled' ? 'Filter Active (Click to Reset)' : 'Click to filter list'}
            </span>
            <span className="text-slate-400 font-mono text-[10px]">LIVE SYNC</span>
          </div>
        </motion.div>

        {/* Card 2: Rescheduled Meetings */}
        <motion.div
          whileHover={{ y: -6, scale: 1.02 }}
          onClick={() => setStatusFilter(prev => (prev === 'rescheduled' ? 'all' : 'rescheduled'))}
          className={`apple-3d-card apple-glass relative overflow-hidden rounded-2xl p-6 cursor-pointer border transition-all duration-300 ${
            statusFilter === 'rescheduled'
              ? 'ring-2 ring-amber-400 border-amber-400/50 shadow-[0_0_25px_rgba(245,158,11,0.35)]'
              : 'border-white/20 dark:border-white/10 hover:border-amber-500/40'
          }`}
        >
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-gradient-to-br from-amber-500/20 to-orange-600/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Action Required
              </p>
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
                {stats.rescheduled} <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Shifted</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Pending Time Adjustments</p>
            </div>

            {/* 3D Levitating Badge */}
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 p-0.5 shadow-lg shadow-amber-500/30 animate-float-3d">
              <div className="w-full h-full bg-slate-900/40 backdrop-blur-md rounded-[14px] flex items-center justify-center text-white">
                <RefreshCw className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-200/50 dark:border-slate-800/50 text-xs">
            <span className="text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {statusFilter === 'rescheduled' ? 'Filter Active (Click to Reset)' : 'Click to filter list'}
            </span>
            <span className="text-slate-400 font-mono text-[10px]">TIME SHIFT</span>
          </div>
        </motion.div>

        {/* Card 3: Canceled Meetings */}
        <motion.div
          whileHover={{ y: -6, scale: 1.02 }}
          onClick={() => setStatusFilter(prev => (prev === 'canceled' ? 'all' : 'canceled'))}
          className={`apple-3d-card apple-glass relative overflow-hidden rounded-2xl p-6 cursor-pointer border transition-all duration-300 ${
            statusFilter === 'canceled'
              ? 'ring-2 ring-rose-400 border-rose-400/50 shadow-[0_0_25px_rgba(244,63,94,0.35)]'
              : 'border-white/20 dark:border-white/10 hover:border-rose-500/40'
          }`}
        >
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-gradient-to-br from-rose-500/20 to-pink-600/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                Archived & Voided
              </p>
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
                {stats.canceled} <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Canceled</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Declined or Closed</p>
            </div>

            {/* 3D Levitating Badge */}
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 p-0.5 shadow-lg shadow-rose-500/30 animate-float-3d">
              <div className="w-full h-full bg-slate-900/40 backdrop-blur-md rounded-[14px] flex items-center justify-center text-white">
                <XCircle className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-200/50 dark:border-slate-800/50 text-xs">
            <span className="text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" />
              {statusFilter === 'canceled' ? 'Filter Active (Click to Reset)' : 'Click to filter list'}
            </span>
            <span className="text-slate-400 font-mono text-[10px]">HISTORICAL</span>
          </div>
        </motion.div>
      </div>

      {/* Filter Status Reset Pill if active */}
      {statusFilter !== 'all' && (
        <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
          <span>Filtering by status:</span>
          <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 uppercase tracking-wider font-bold">
            {statusFilter}
          </span>
          <button
            onClick={() => setStatusFilter('all')}
            className="text-cyan-500 hover:underline hover:text-cyan-600 font-semibold ml-1"
          >
            Clear Filter
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* R1.2 4-TAB NAVIGATION & FILTER CONTROLS                                   */}
      {/* ========================================================================= */}
      <div className="apple-glass rounded-2xl p-4 border border-white/20 dark:border-white/10 shadow-lg space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* 4 Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-200/60 dark:bg-slate-900/60 rounded-xl backdrop-blur-md">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'upcoming'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Upcoming</span>
            </button>

            <button
              onClick={() => setActiveTab('previous')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'previous'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              onClick={() => setActiveTab('personal_room')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'personal_room'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Video className="w-4 h-4" />
              <span>Personal room</span>
            </button>

            <button
              onClick={() => setActiveTab('templates')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'templates'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Templates</span>
            </button>
          </div>

          {/* Search Bar & Dropdown Filter (Visible for Schedule Tabs) */}
          {(activeTab === 'upcoming' || activeTab === 'previous') && (
            <div className="flex items-center gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 md:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search meeting or attendee..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm rounded-xl bg-white/70 dark:bg-slate-800/70 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                />
              </div>

              {/* Status Dropdown */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value as any)}
                  className="appearance-none pl-3 pr-8 py-2 text-sm rounded-xl bg-white/70 dark:bg-slate-800/70 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/50 cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="rescheduled">Rescheduled</option>
                  <option value="completed">Completed</option>
                  <option value="canceled">Canceled</option>
                </select>
                <ChevronDown className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB CONTENT RENDERERS                                                     */}
      {/* ========================================================================= */}

      {/* TAB 1 & 2: SCHEDULE LIST (Upcoming / Previous) */}
      {(activeTab === 'upcoming' || activeTab === 'previous') && (
        <div className="space-y-4">
          {filteredEvents.length === 0 ? (
            <div className="apple-glass rounded-2xl p-12 text-center border border-white/20 dark:border-white/10">
              <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-3 animate-bounce" />
              <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200">No Meetings Found</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                No meetings match your current tab or status filter criteria.
              </p>
              {onOpenNewModal && (
                <button
                  onClick={onOpenNewModal}
                  className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Schedule Meeting</span>
                </button>
              )}
            </div>
          ) : (
            filteredEvents.map(meeting => {
              const timezone = meeting.timezone || 'EDT';
              const isRecOn = Boolean(meeting.recordingEnabled);
              const mStatus = meeting.status || 'scheduled';

              return (
                <motion.div
                  key={meeting.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="apple-glass relative overflow-hidden rounded-2xl p-5 md:p-6 border border-white/20 dark:border-white/10 shadow-lg hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                    {/* Left: Meeting Info */}
                    <div className="space-y-2.5 flex-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        {/* Status Badge */}
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            mStatus === 'scheduled'
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                              : mStatus === 'rescheduled'
                              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                              : mStatus === 'canceled'
                              ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                              : 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/30'
                          }`}
                        >
                          {mStatus}
                        </span>

                        {/* Meeting Category/Type */}
                        <span className="px-2.5 py-0.5 rounded-md bg-slate-200/70 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 text-xs font-semibold">
                          {meeting.type}
                        </span>

                        {/* Pulsing Red REC Badge if Recording Enabled */}
                        {isRecOn && (
                          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-500 border border-rose-500/40 text-xs font-bold">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
                            </span>
                            REC ACTIVE
                          </span>
                        )}
                      </div>

                      {/* Title & Description */}
                      <div>
                        <h4 className="text-lg font-extrabold text-slate-900 dark:text-white group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors">
                          {meeting.title}
                        </h4>
                        {meeting.description && (
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                            {meeting.description}
                          </p>
                        )}
                      </div>

                      {/* Date, Time & Interactive Timezone Selector */}
                      <div className="flex items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-400 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-cyan-500" />
                          <span>{meeting.date}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-cyan-500" />
                          <span>
                            {meeting.time} {meeting.endTime ? `- ${meeting.endTime}` : ''}
                          </span>
                        </div>

                        {/* Interactive Timezone Dropdown */}
                        <div className="flex items-center gap-1 bg-slate-200/50 dark:bg-slate-800/50 px-2 py-1 rounded-lg border border-slate-300/40 dark:border-slate-700/40">
                          <Globe className="w-3.5 h-3.5 text-cyan-500" />
                          <select
                            value={timezone}
                            onChange={e => {
                              const newTz = e.target.value;
                              updateEvent({ id: meeting.id, timezone: newTz });
                              showToast(`Timezone for "${meeting.title}" set to ${newTz}`);
                            }}
                            className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                          >
                            {AVAILABLE_TIMEZONES.map(tz => (
                              <option key={tz} value={tz} className="bg-slate-800 text-white">
                                {tz}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Right: Attendee Avatars, Recording Switch, Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-200/50 dark:border-slate-800/50">
                      {/* Overlapping Attendee Avatar Stack */}
                      <div className="flex items-center">
                        <div className="flex -space-x-2.5 overflow-hidden">
                          {meeting.participants && meeting.participants.length > 0 ? (
                            meeting.participants.slice(0, 3).map((p, idx) => (
                              <div
                                key={idx}
                                title={p.name}
                                className="inline-block h-9 w-9 rounded-full ring-2 ring-white dark:ring-slate-900 bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-sm"
                              >
                                {p.avatar ? (
                                  <img
                                    src={p.avatar}
                                    alt={p.name}
                                    className="h-full w-full rounded-full object-cover"
                                  />
                                ) : (
                                  getInitials(p.name)
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="inline-block h-9 w-9 rounded-full ring-2 ring-white dark:ring-slate-900 bg-slate-700 text-white text-xs font-bold flex items-center justify-center">
                              NH
                            </div>
                          )}

                          {meeting.participants && meeting.participants.length > 3 && (
                            <div className="inline-block h-9 w-9 rounded-full ring-2 ring-white dark:ring-slate-900 bg-slate-800 text-slate-300 text-xs font-bold flex items-center justify-center">
                              +{meeting.participants.length - 3}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* R1.3 Interactive Recording Toggle Switch */}
                      <div className="flex items-center gap-2 bg-slate-200/60 dark:bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-300/40 dark:border-slate-700/40">
                        <Disc
                          className={`w-4 h-4 ${
                            isRecOn ? 'text-rose-500 animate-pulse' : 'text-slate-400'
                          }`}
                        />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Record
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const nextState = !isRecOn;
                            updateEvent({ id: meeting.id, recordingEnabled: nextState });
                            showToast(
                              nextState
                                ? `Recording ENABLED for "${meeting.title}"`
                                : `Recording DISABLED for "${meeting.title}"`,
                              nextState ? 'success' : 'info'
                            );
                          }}
                          className={`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            isRecOn ? 'bg-cyan-500' : 'bg-slate-400 dark:bg-slate-700'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              isRecOn ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Action Buttons: Join & Copy Link */}
                      <div className="flex items-center gap-2">
                        {/* Copy Link Button */}
                        <button
                          onClick={() =>
                            handleCopy(
                              meeting.meetingLink || `https://meet.nhfg.com/room/${meeting.id}`,
                              'Meeting Link',
                              meeting.id
                            )
                          }
                          title="Copy Link"
                          className="p-2.5 rounded-xl bg-slate-200/70 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                        >
                          {copiedId === meeting.id ? (
                            <Check className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>

                        {/* Join Button */}
                        <button
                          onClick={() => {
                            const link = meeting.meetingLink || `https://meet.nhfg.com/room/${meeting.id}`;
                            window.open(link, '_blank');
                            showToast(`Launching meeting: ${meeting.title}`);
                          }}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-cyan-500/25 flex items-center gap-1.5 transition-all"
                        >
                          <Video className="w-4 h-4" />
                          <span>Join</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 3: PERSONAL ROOM */}
      {activeTab === 'personal_room' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="apple-glass rounded-2xl p-6 md:p-8 border border-white/20 dark:border-white/10 shadow-xl space-y-6"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-200/60 dark:border-slate-800/60">
            <div>
              <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider border border-cyan-500/30">
                Personal Video Hub
              </span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                Advisor Dedicated Room
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Your permanent 24/7 instant meeting link for direct client consultations.
              </p>
            </div>

            {/* Start Personal Meeting Now CTA */}
            <button
              onClick={() => {
                showToast('Launching Personal Meeting Room...', 'success');
                window.open('https://meet.nhfg.com/room/advisor-personal', '_blank');
              }}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white font-extrabold text-sm shadow-xl shadow-cyan-500/30 hover:scale-[1.02] transition-transform flex items-center gap-2"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Start Personal Meeting Now</span>
            </button>
          </div>

          {/* Personal Room Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Link & Access Info */}
            <div className="space-y-4 bg-slate-100/50 dark:bg-slate-900/50 p-5 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Personal Meeting URL
                </label>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="text"
                    readOnly
                    value="https://meet.nhfg.com/room/advisor-personal"
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-mono text-cyan-600 dark:text-cyan-400 font-bold focus:outline-none"
                  />
                  <button
                    onClick={() =>
                      handleCopy('https://meet.nhfg.com/room/advisor-personal', 'Personal URL', 'personal-url')
                    }
                    className="px-4 py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-xs font-bold border border-cyan-500/30 flex items-center gap-1.5"
                  >
                    {copiedId === 'personal-url' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>Copy</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Meeting ID
                  </label>
                  <p className="text-base font-mono font-bold text-slate-900 dark:text-white mt-1">
                    849-2041-9920
                  </p>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Passcode PIN
                  </label>
                  <p className="text-base font-mono font-bold text-slate-900 dark:text-white mt-1">
                    7742
                  </p>
                </div>
              </div>
            </div>

            {/* Device Pre-Check Controls */}
            <div className="space-y-4 bg-slate-100/50 dark:bg-slate-900/50 p-5 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Pre-Flight Hardware Check
              </h4>

              <div className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  {roomCameraOn ? (
                    <Camera className="w-5 h-5 text-cyan-500" />
                  ) : (
                    <CameraOff className="w-5 h-5 text-rose-500" />
                  )}
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Camera Preview
                    </p>
                    <p className="text-[10px] text-slate-500">HD FaceTime Camera</p>
                  </div>
                </div>
                <button
                  onClick={() => setRoomCameraOn(!roomCameraOn)}
                  className={`px-3 py-1 rounded-md text-xs font-bold ${
                    roomCameraOn
                      ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                      : 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {roomCameraOn ? 'Enabled' : 'Muted'}
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  {roomMicOn ? (
                    <Mic className="w-5 h-5 text-cyan-500" />
                  ) : (
                    <MicOff className="w-5 h-5 text-rose-500" />
                  )}
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Microphone Stream
                    </p>
                    <p className="text-[10px] text-slate-500">Built-in Array Mic</p>
                  </div>
                </div>
                <button
                  onClick={() => setRoomMicOn(!roomMicOn)}
                  className={`px-3 py-1 rounded-md text-xs font-bold ${
                    roomMicOn
                      ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                      : 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {roomMicOn ? 'Enabled' : 'Muted'}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB 4: TEMPLATES */}
      {activeTab === 'templates' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
        >
          {MEETING_TEMPLATES.map(tmpl => (
            <div
              key={tmpl.id}
              className="apple-glass rounded-2xl p-6 border border-white/20 dark:border-white/10 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-bold border border-cyan-500/30">
                    {tmpl.badge}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-cyan-500" />
                    {tmpl.duration}
                  </span>
                </div>

                <h4 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {tmpl.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {tmpl.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between gap-3">
                <button
                  onClick={() =>
                    handleCopy(
                      `https://meet.nhfg.com/book/${tmpl.id}`,
                      'Template Booking Link',
                      tmpl.id
                    )
                  }
                  className="px-3.5 py-2 rounded-xl bg-slate-200/60 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-300 text-xs font-bold flex items-center gap-1.5"
                >
                  {copiedId === tmpl.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  <span>Copy Link</span>
                </button>

                <button
                  onClick={() => {
                    showToast(`Loaded "${tmpl.title}" template for scheduling`);
                    if (onOpenNewModal) onOpenNewModal();
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold shadow-md shadow-cyan-500/20 hover:scale-[1.02] transition-transform"
                >
                  Use Template
                </button>
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
};
