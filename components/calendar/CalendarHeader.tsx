import React from 'react';
import { ChevronLeft, ChevronRight, Settings, Plus, Calendar as CalendarIcon, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';

export type FilterType = 'all' | 'events' | 'meeting' | 'conflicted' | 'canceled';

interface CalendarHeaderProps {
  currentDate: Date;
  formatDateHeader: (date: Date) => string;
  changeMonth: (offset: number) => void;
  setCurrentDate: (date: Date) => void;
  setIsSettingsOpen: (isOpen: boolean) => void;
  handleOpenCreateModal: () => void;
  filterType: FilterType;
  setFilterType: (type: FilterType) => void;
  viewMode: 'month' | 'week';
  setViewMode: (mode: 'month' | 'week') => void;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  formatDateHeader,
  changeMonth,
  setCurrentDate,
  setIsSettingsOpen,
  handleOpenCreateModal,
  filterType,
  setFilterType,
  viewMode,
  setViewMode
}) => {
  const tabs: { id: FilterType; label: string }[] = [
    { id: 'all', label: 'All Schedule' },
    { id: 'events', label: 'Events' },
    { id: 'meeting', label: 'Meeting' },
    { id: 'conflicted', label: 'Conflicted' },
    { id: 'canceled', label: 'Canceled' },
  ];

  return (
    <div className="flex flex-col bg-white px-8 pt-8 pb-4">
      {/* Title & Subtitle */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Calendar</h1>
        <p className="text-slate-500 text-sm">Stay organized and on track with your personalized calendar</p>
      </div>

      {/* Tabs & Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-50/50 p-1 rounded-xl">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setFilterType(tab.id)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                        filterType === tab.id
                        ? 'bg-white text-slate-900 shadow-sm ring-1 ring-black/5 font-bold'
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                    }`}
                >
                    {tab.label}
                </button>
            ))}
        </div>

        {/* Date Controls */}
        <div className="flex items-center gap-3">
            <button 
                onClick={() => setCurrentDate(new Date())}
                className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
            >
                Today
            </button>
            
            <div className="flex items-center bg-white border border-slate-200 rounded-xl shadow-sm px-2">
                <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
                    <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-2 px-2 py-2 min-w-[140px] justify-center text-slate-700 font-bold text-sm">
                    <CalendarIcon className="h-4 w-4 text-slate-400" />
                    {formatDateHeader(currentDate)}
                </div>
                <button onClick={() => changeMonth(1)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>

            <div className="flex items-center bg-slate-100 rounded-lg p-1 ml-2">
                <button 
                    onClick={() => setViewMode('week')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === 'week' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Week
                </button>
                <button 
                    onClick={() => setViewMode('month')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === 'month' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Month
                </button>
            </div>
            
            <button 
                onClick={handleOpenCreateModal}
                className="ml-2 p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
            >
                <Plus className="h-5 w-5" />
            </button>
        </div>
      </div>
    </div>
  );
};
