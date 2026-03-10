import React from 'react';
import { motion } from 'framer-motion';
import { CalendarEvent } from '../../types';

interface CalendarEventCardProps {
  event: CalendarEvent;
  user: any;
  animConfig: any;
  isEventStartingSoon: (date: string, time: string) => boolean;
  handleEventDragStart: (e: React.DragEvent, event: CalendarEvent) => void;
  handleEventClick: (event: CalendarEvent) => void;
}

// Compact pill colors per event type
const TYPE_STYLES: Record<string, { bg: string; dot: string; text: string; border: string }> = {
  meeting: { bg: '#f4f0ff', dot: '#8b5cf6', text: '#5b21b6', border: '#ddd6fe' },
  reminder: { bg: '#fff0f3', dot: '#f43f5e', text: '#be123c', border: '#fecdd3' },
  task: { bg: '#eff6ff', dot: '#3b82f6', text: '#1d4ed8', border: '#bfdbfe' },
  'off-day': { bg: '#ecfdf5', dot: '#10b981', text: '#065f46', border: '#a7f3d0' },
};
const DEFAULT_STYLE = { bg: '#f8fafc', dot: '#94a3b8', text: '#475569', border: '#e2e8f0' };

export const CalendarEventCard: React.FC<CalendarEventCardProps> = ({
  event,
  user,
  animConfig,
  isEventStartingSoon,
  handleEventDragStart,
  handleEventClick,
}) => {
  const isCanceled = event.status === 'canceled';
  const s = TYPE_STYLES[event.type] ?? DEFAULT_STYLE;
  const isDraggable = event.creatorId === user?.id && !isCanceled;

  const label = event.type === 'off-day'
    ? `${event.creatorName?.split(' ')[0] || 'Off'}: OFF`
    : event.title;

  return (
    <motion.div
      layoutId={event.id}
      draggable={isDraggable}
      onDragStart={(e) => handleEventDragStart(e as any, event)}
      onClick={(e) => { e.stopPropagation(); handleEventClick(event); }}
      onMouseDown={(e) => e.stopPropagation()}
      initial={{ opacity: 0, y: 2 }}
      animate={{ opacity: isCanceled ? 0.5 : 1, y: 0 }}
      exit={{ opacity: 0 }}
      whileHover={{ filter: 'brightness(0.96)' }}
      transition={{ duration: 0.12 }}
      title={`${label}${event.time ? ' · ' + event.time : ''}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        backgroundColor: s.bg,
        border: `1px solid ${s.border}`,
        borderRadius: 6,
        padding: '2px 7px',
        cursor: isDraggable ? 'grab' : 'default',
        userSelect: 'none',
        textDecoration: isCanceled ? 'line-through' : 'none',
        overflow: 'hidden',
        minWidth: 0,
        // compact single-line height
        height: 22,
        boxSizing: 'border-box',
      }}
    >
      {/* Colored dot */}
      <span style={{
        width: 7, height: 7, borderRadius: '50%',
        backgroundColor: s.dot,
        flexShrink: 0,
      }} />

      {/* Title – truncated */}
      <span style={{
        fontSize: 11.5,
        fontWeight: 600,
        color: s.text,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        flex: 1,
        minWidth: 0,
      }}>
        {label}
      </span>

      {/* Time – optional, only if space */}
      {event.time && event.type !== 'off-day' && (
        <span style={{
          fontSize: 10,
          color: s.dot,
          whiteSpace: 'nowrap',
          flexShrink: 0,
          opacity: 0.85,
        }}>
          {event.time.replace(':00', '').replace(' AM', 'a').replace(' PM', 'p')}
        </span>
      )}
    </motion.div>
  );
};
