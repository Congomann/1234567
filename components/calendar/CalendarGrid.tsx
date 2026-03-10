import React from 'react';
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
  handleDateClick?: (dateStr: string) => void;
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

const DAY_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MAX_VISIBLE = 3; // max event pills per cell before "+N more"

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
  getDaysInMonth,
}) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayOfWeek = getFirstDayOfMonth(currentDate);

  // Total cells (pad to fill 6-row grid so height is stable)
  const totalCells = Math.ceil((firstDayOfWeek + daysInMonth) / 7) * 7;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>

      {/* ── Day-of-week header ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        borderBottom: '1px solid #e2e8f0',
        backgroundColor: '#f8fafc',
        flexShrink: 0,
      }}>
        {DAY_LABELS.map(d => (
          <div key={d} style={{
            padding: '10px 0',
            textAlign: 'center',
            fontSize: 11,
            fontWeight: 700,
            color: '#9ca3af',
            letterSpacing: 1.2,
          }}>{d}</div>
        ))}
      </div>

      {/* ── Day cells grid ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gridTemplateRows: `repeat(${totalCells / 7}, 1fr)`,
        flex: 1,
        overflow: 'hidden',
      }}>
        {Array.from({ length: totalCells }).map((_, cellIdx) => {
          const dayNum = cellIdx - firstDayOfWeek + 1;
          const isValidDay = dayNum >= 1 && dayNum <= daysInMonth;

          if (!isValidDay) {
            return (
              <div key={`empty-${cellIdx}`} style={{
                borderRight: '1px solid #f1f5f9',
                borderBottom: '1px solid #f1f5f9',
                backgroundColor: '#fafafa',
              }} />
            );
          }

          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
          const dayEvents = visibleEvents.filter(e => e.date === dateStr);
          const isToday = dateStr === todayStr;
          const isPast = dateStr < todayStr;

          const isDragOver = !!(dragStartDate && dragCurrentDate && (
            (dateStr >= dragStartDate && dateStr <= dragCurrentDate) ||
            (dateStr <= dragStartDate && dateStr >= dragCurrentDate)
          ));

          const visiblePills = dayEvents.slice(0, MAX_VISIBLE);
          const overflow = dayEvents.length - MAX_VISIBLE;

          return (
            <div
              key={dateStr}
              onClick={() => handleDateClick && handleDateClick(dateStr)}
              onMouseDown={() => handleDragStart(dateStr)}
              onMouseEnter={() => handleDragEnter(dateStr)}
              onMouseUp={handleDragEnd}
              onDragOver={handleDragOver}
              onDrop={(e) => handleEventDrop(e, dateStr)}
              onContextMenu={(e) => handleContextMenu(e, dateStr)}
              style={{
                borderRight: '1px solid #f1f5f9',
                borderBottom: '1px solid #f1f5f9',
                backgroundColor: isDragOver
                  ? '#eff6ff'
                  : isToday
                    ? '#f0f7ff'
                    : isPast
                      ? '#fafafa'
                      : '#ffffff',
                padding: '6px 5px 4px',
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
                cursor: isPast ? 'default' : 'pointer',
                outline: isDragOver ? '2px solid #3b82f6' : isToday ? '2px solid #3b82f620' : 'none',
                outlineOffset: -2,
                overflow: 'hidden',
                transition: 'background-color 0.1s',
                position: 'relative',
              }}
            >
              {/* Day number */}
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 26,
                height: 26,
                borderRadius: '50%',
                fontSize: 13,
                fontWeight: isToday ? 700 : 400,
                color: isToday ? '#fff' : isPast ? '#cbd5e1' : '#374151',
                backgroundColor: isToday ? '#3b82f6' : 'transparent',
                flexShrink: 0,
                alignSelf: 'flex-start',
                marginBottom: 2,
              }}>
                {dayNum}
              </span>

              {/* Event pills — each locked to one line */}
              {visiblePills.map(event => (
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

              {/* Overflow indicator */}
              {overflow > 0 && (
                <div style={{
                  fontSize: 10.5,
                  fontWeight: 600,
                  color: '#6b7280',
                  paddingLeft: 4,
                  cursor: 'pointer',
                  lineHeight: '18px',
                }}>
                  +{overflow} more
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
