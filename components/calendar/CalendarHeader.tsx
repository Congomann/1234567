import React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus } from 'lucide-react';

export type FilterType = 'all' | 'events' | 'meeting' | 'conflicted' | 'canceled';

interface CalendarHeaderProps {
    currentDate: Date;
    formatDateHeader: (date: Date) => string;
    changeMonth: (offset: number) => void;
    setCurrentDate: (date: Date) => void;
    setIsSettingsOpen: (isOpen: boolean) => void;
    filterType: FilterType;
    setFilterType: (type: FilterType) => void;
}

const TABS: { id: FilterType; label: string }[] = [
    { id: 'all', label: 'All Schedule' },
    { id: 'events', label: 'Events' },
    { id: 'meeting', label: 'Meeting' },
    { id: 'conflicted', label: 'Conflicted' },
    { id: 'canceled', label: 'Canceled' },
];

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
    currentDate,
    formatDateHeader,
    changeMonth,
    setCurrentDate,
    setIsSettingsOpen,
    filterType,
    setFilterType,
}) => {
    return (
        <div style={{ background: '#fff', padding: '28px 28px 0 28px', flexShrink: 0 }}>
            {/* ── Title ── */}
            <div style={{ marginBottom: 16 }}>
                <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827', margin: 0, lineHeight: 1.2 }}>Calendar</h1>
                <p style={{ fontSize: 13.5, color: '#9ca3af', margin: '4px 0 0', fontWeight: 400 }}>
                    Stay organized and on track with your personalized calendar
                </p>
            </div>

            {/* ── Filter Tabs ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 0 }}>
                {TABS.map((tab, idx) => {
                    const active = filterType === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setFilterType(tab.id)}
                            style={{
                                padding: '7px 16px',
                                borderRadius: active ? 8 : 8,
                                border: active ? '1px solid #e5e7eb' : '1px solid transparent',
                                background: active ? '#fff' : 'transparent',
                                color: active ? '#111827' : '#9ca3af',
                                fontWeight: active ? 600 : 400,
                                fontSize: 14,
                                cursor: 'pointer',
                                transition: 'all 0.15s',
                                boxShadow: active ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                                marginRight: idx < TABS.length - 1 ? 2 : 0,
                            }}
                        >
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* ── Divider ── */}
            <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '14px -28px 14px' }} />

            {/* ── Date Controls ── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {/* Today button */}
                    <button
                        onClick={() => setCurrentDate(new Date())}
                        style={{
                            height: 34, padding: '0 16px',
                            border: '1px solid #e5e7eb', borderRadius: 8,
                            background: '#fff', color: '#374151',
                            fontSize: 13.5, fontWeight: 500,
                            cursor: 'pointer', whiteSpace: 'nowrap',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                        }}
                    >
                        Today
                    </button>

                    {/* Month navigator */}
                    <div style={{
                        display: 'flex', alignItems: 'center',
                        border: '1px solid #e5e7eb', borderRadius: 8,
                        background: '#fff', overflow: 'hidden',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                        height: 34,
                    }}>
                        <button
                            onClick={() => changeMonth(-1)}
                            style={{ padding: '0 8px', border: 'none', background: 'transparent', cursor: 'pointer', height: '100%', color: '#9ca3af', borderRight: '1px solid #f1f5f9' }}
                        >
                            <ChevronLeft size={15} />
                        </button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 12px', fontSize: 13.5, fontWeight: 500, color: '#374151' }}>
                            <CalendarIcon size={14} style={{ color: '#9ca3af' }} />
                            {formatDateHeader(currentDate)}
                        </div>
                        <button
                            onClick={() => changeMonth(1)}
                            style={{ padding: '0 8px', border: 'none', background: 'transparent', cursor: 'pointer', height: '100%', color: '#9ca3af', borderLeft: '1px solid #f1f5f9' }}
                        >
                            <ChevronRight size={15} />
                        </button>
                    </div>
                </div>

                {/* Right side: view toggle + add */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                </div>
            </div>
        </div>
    );
};
