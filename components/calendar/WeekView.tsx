import React, { useMemo, useState, useEffect } from 'react';
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
    handleDateClick?: (dateStr: string, timeStr?: string) => void;
}

const toLocalDateStr = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const parseTime = (timeStr: string): { h: number; m: number } => {
    if (!timeStr || timeStr === 'All Day') return { h: 9, m: 0 };
    const parts = timeStr.trim().split(' ');
    const [hStr, mStr] = (parts[0] || '9:00').split(':');
    let h = parseInt(hStr) || 9;
    const m = parseInt(mStr) || 0;
    const modifier = parts[1]?.toUpperCase();
    if (modifier === 'PM' && h !== 12) h += 12;
    if (modifier === 'AM' && h === 12) h = 0;
    return { h, m };
};

// Pixel height for one hour
const PX_PER_HOUR = 120;
// Start hour offset for the grid (we display 6am onward)
const GRID_START_HOUR = 6;

// Hours to display in the left column
const DISPLAY_HOURS = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];

const hourLabel = (h: number) => {
    if (h === 0 || h === 24) return '12am';
    if (h === 12) return '12pm';
    return h < 12 ? `${h}am` : `${h - 12}pm`;
};

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
    handleDragOver,
    handleDateClick,
}) => {
    // Compute the 7 days of the current week (Mon..Sun or Sun..Sat – using Mon-first as in Figma)
    const weekDays = useMemo(() => {
        const d = new Date(currentDate);
        const day = d.getDay(); // 0=Sun
        const diffToMon = day === 0 ? -6 : 1 - day;
        d.setDate(d.getDate() + diffToMon);
        return Array.from({ length: 7 }, (_, i) => {
            const nd = new Date(d);
            nd.setDate(d.getDate() + i);
            return nd;
        });
    }, [currentDate]);

    const [now, setNow] = useState(new Date());
    useEffect(() => {
        const iv = setInterval(() => setNow(new Date()), 60000);
        return () => clearInterval(iv);
    }, []);

    const gridHeight = DISPLAY_HOURS.length * PX_PER_HOUR;

    // Compute absolute positioning for an event card
    const getEventPos = (event: CalendarEvent) => {
        const start = parseTime(event.time);
        const end = event.endTime ? parseTime(event.endTime) : { h: start.h + 1, m: start.m };
        const startMins = (start.h - GRID_START_HOUR) * 60 + start.m;
        const durationMins = (end.h * 60 + end.m) - (start.h * 60 + start.m);
        return {
            top: Math.max(0, startMins) * (PX_PER_HOUR / 60),
            height: Math.max(30, durationMins * (PX_PER_HOUR / 60)),
        };
    };

    const handleColumnDrop = (e: React.DragEvent, dateStr: string, colRect: DOMRect) => {
        const y = e.clientY - colRect.top;
        const minutesFromStart = Math.max(0, y / (PX_PER_HOUR / 60));
        const totalMins = Math.floor(minutesFromStart);
        const hour = GRID_START_HOUR + Math.floor(totalMins / 60);
        const minute = totalMins % 60;
        const h12 = hour % 12 || 12;
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const timeStr = `${h12}:${String(minute).padStart(2, '0')} ${ampm}`;
        handleEventDrop(e, dateStr, timeStr);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: '#fff' }}>
            {/* ─── Header Row ─── */}
            <div style={{
                display: 'flex',
                borderBottom: '1px solid #e5e7eb',
                flexShrink: 0,
                background: '#fff',
            }}>
                {/* GMT label cell */}
                <div style={{
                    width: 72, flexShrink: 0,
                    padding: '14px 0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRight: '1px solid #e5e7eb',
                    fontSize: 12, fontWeight: 600, color: '#6b7280', letterSpacing: 0.5,
                }}>
                    GMT
                </div>

                {/* Day header cells */}
                {weekDays.map((day, i) => {
                    const dateStr = toLocalDateStr(day);
                    const isToday = dateStr === todayStr;
                    const dayName = day.toLocaleDateString('en-US', { weekday: 'short' }); // Mon, Tue …
                    const dayNum = String(day.getDate()).padStart(2, '0');

                    return (
                        <div
                            key={i}
                            style={{
                                flex: 1,
                                padding: '12px 0',
                                textAlign: 'center',
                                borderRight: i < 6 ? '1px solid #e5e7eb' : 'none',
                                background: isToday ? '#f9fafb' : '#fff',
                                fontSize: 13,
                                fontWeight: isToday ? 700 : 500,
                                color: isToday ? '#111827' : '#374151',
                            }}
                        >
                            {dayNum} {dayName}
                        </div>
                    );
                })}
            </div>

            {/* ─── Time Grid ─── */}
            <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
                <div style={{ display: 'flex', height: gridHeight }}>
                    {/* Time Labels column */}
                    <div style={{
                        width: 72, flexShrink: 0,
                        borderRight: '1px solid #e5e7eb',
                        background: '#fff',
                    }}>
                        {DISPLAY_HOURS.map(h => (
                            <div
                                key={h}
                                style={{
                                    height: PX_PER_HOUR,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderBottom: '1px solid #f1f5f9',
                                }}
                            >
                                <span style={{
                                    fontSize: 13,
                                    fontWeight: 500,
                                    color: '#6b7280',
                                }}>
                                    {hourLabel(h)}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Day columns */}
                    {weekDays.map((day, colIdx) => {
                        const dateStr = toLocalDateStr(day);
                        const isToday = dateStr === todayStr;
                        const dayEvents = visibleEvents.filter(e => e.date === dateStr && e.type !== 'off-day');

                        // current-time indicator offset
                        const nowOffsetPx = isToday && now.getHours() >= GRID_START_HOUR
                            ? ((now.getHours() - GRID_START_HOUR) * 60 + now.getMinutes()) * (PX_PER_HOUR / 60)
                            : null;

                        return (
                            <div
                                key={colIdx}
                                style={{
                                    flex: 1,
                                    borderRight: colIdx < 6 ? '1px solid #e5e7eb' : 'none',
                                    position: 'relative',
                                    background: '#fff',
                                }}
                                onDragOver={handleDragOver}
                                onDrop={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    handleColumnDrop(e, dateStr, rect);
                                }}
                                onClick={(e) => {
                                    if ((e.target as HTMLElement) !== e.currentTarget) return;
                                    if (!handleDateClick) return;
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const y = e.clientY - rect.top;
                                    const totalMins = Math.max(0, y / (PX_PER_HOUR / 60));
                                    const hour = GRID_START_HOUR + Math.floor(totalMins / 60);
                                    const minute = Math.floor(totalMins) % 60;
                                    const h12 = hour % 12 || 12;
                                    const ampm = hour >= 12 ? 'PM' : 'AM';
                                    handleDateClick(dateStr, `${h12}:${String(minute).padStart(2, '0')} ${ampm}`);
                                }}
                            >
                                {/* Horizontal hour grid lines */}
                                {DISPLAY_HOURS.map((h, hi) => {
                                    const isLunch = h === 12;
                                    return (
                                        <div
                                            key={hi}
                                            style={{
                                                position: 'absolute',
                                                top: hi * PX_PER_HOUR,
                                                left: 0, right: 0,
                                                height: PX_PER_HOUR,
                                                borderBottom: '1px solid #f1f5f9',
                                                pointerEvents: 'none',
                                                zIndex: 0,
                                                // Diagonal stripe pattern for the lunch hour (12pm)
                                                ...(isLunch ? {
                                                    backgroundImage: 'repeating-linear-gradient(135deg, transparent, transparent 8px, #f1f5f9 8px, #f1f5f9 9px)',
                                                } : {}),
                                            }}
                                        />
                                    );
                                })}

                                {/* Current-time red line */}
                                {nowOffsetPx !== null && (
                                    <div style={{
                                        position: 'absolute',
                                        top: nowOffsetPx,
                                        left: 0, right: 0,
                                        height: 2,
                                        backgroundColor: '#ef4444',
                                        zIndex: 30,
                                        pointerEvents: 'none',
                                    }}>
                                        <div style={{
                                            width: 8, height: 8, borderRadius: '50%',
                                            backgroundColor: '#ef4444',
                                            marginTop: -3, marginLeft: -1,
                                        }} />
                                    </div>
                                )}

                                {/* Today column highlight strip */}
                                {isToday && (
                                    <div style={{
                                        position: 'absolute', inset: 0,
                                        backgroundColor: 'rgba(59,130,246,0.02)',
                                        zIndex: 0, pointerEvents: 'none',
                                    }} />
                                )}

                                {/* Events */}
                                {dayEvents.map(event => {
                                    const { top, height } = getEventPos(event);
                                    return (
                                        <div
                                            key={event.id}
                                            style={{
                                                position: 'absolute',
                                                top, height,
                                                left: 4, right: 4,
                                                zIndex: 10,
                                            }}
                                        >
                                            <CalendarEventCard
                                                event={event}
                                                user={user}
                                                animConfig={animConfig}
                                                isEventStartingSoon={isEventStartingSoon}
                                                handleEventDragStart={handleEventDragStart}
                                                handleEventClick={handleEventClick}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
