import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarEvent } from '../../types';
import { getAnimationConfig, getDaysInMonth, getFirstDayOfMonth, formatDateHeader, formatTimeForInput, isEventStartingSoon } from '../../components/calendar/utils';
import { CalendarHeader, FilterType } from '../../components/calendar/CalendarHeader';
import { CalendarGrid } from '../../components/calendar/CalendarGrid';
import { WeekView } from '../../components/calendar/WeekView';
import { AgendaSidebar } from '../../components/calendar/AgendaSidebar';
import { ReminderToast } from '../../components/calendar/ReminderToast';
import { ContextMenu } from '../../components/calendar/ContextMenu';
import { EventModal } from '../../components/calendar/EventModal';
import { AnimationSettings } from '../../components/calendar/AnimationSettings';

export const Calendar: React.FC = () => {
  const { events, addEvent, updateEvent, deleteEvent, user } = useData();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('week');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [animationMode, setAnimationMode] = useState<'Minimal' | 'Professional' | 'Friendly' | 'Dynamic'>('Professional');
  const [filterType, setFilterType] = useState<FilterType>('all');
  
  const [dragStartDate, setDragStartDate] = useState<string | null>(null);
  const [dragCurrentDate, setDragCurrentDate] = useState<string | null>(null);

  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, dateStr: string } | null>(null);

  const [activeReminder, setActiveReminder] = useState<CalendarEvent | null>(null);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const animConfig = getAnimationConfig(animationMode);

  /**
   * Filter logic for privacy AND tabs:
   * 1. Off-days are public (everyone sees everyone's red marks)
   * 2. Meetings are public (company-wide)
   * 3. Reminders and Tasks are PRIVATE (only visible to creator)
   */
  const visibleEvents = useMemo(() => {
    // 1. Privacy Filter
    let filtered = events.filter(e => {
        if (e.type === 'off-day' || e.type === 'meeting') return true;
        return e.creatorId === user?.id;
    });

    // 2. Tab Filter
    switch (filterType) {
        case 'events':
            // Show non-meeting events (tasks, reminders)
            filtered = filtered.filter(e => e.type !== 'meeting' && e.type !== 'off-day');
            break;
        case 'meeting':
            filtered = filtered.filter(e => e.type === 'meeting');
            break;
        case 'canceled':
            filtered = filtered.filter(e => e.status === 'canceled');
            break;
        case 'conflicted':
            // Basic conflict detection (assuming 1 hour duration for simplicity)
            // Ideally we check start/end times but we only have start time.
            // We'll mark conflicts if they are on the same day and same hour.
            const conflictIds = new Set<string>();
            const eventMap = new Map<string, CalendarEvent[]>();
            
            filtered.forEach(e => {
                if (e.status === 'canceled') return;
                const key = `${e.date}-${e.time}`;
                if (!eventMap.has(key)) eventMap.set(key, []);
                eventMap.get(key)?.push(e);
            });

            eventMap.forEach((group) => {
                if (group.length > 1) {
                    group.forEach(e => conflictIds.add(e.id));
                }
            });
            
            filtered = filtered.filter(e => conflictIds.has(e.id));
            break;
        case 'all':
        default:
            // No additional filtering
            break;
    }

    return filtered;
  }, [events, user, filterType]);

  const [formData, setFormData] = useState<{
    title: string;
    startDate: string;
    endDate: string;
    time: string;
    endTime: string;
    type: 'meeting' | 'reminder' | 'task' | 'off-day';
    status: 'scheduled' | 'canceled' | 'completed';
    description?: string;
    meetingLink?: string;
    participants?: string; // Comma separated names
  }>({
    title: '',
    startDate: todayStr,
    endDate: todayStr,
    time: '09:00',
    endTime: '10:00',
    type: 'meeting',
    status: 'scheduled',
    description: '',
    meetingLink: '',
    participants: ''
  });
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const editingEvent = events.find(e => e.id === editingId);
  const isReadOnly = editingId ? editingEvent?.creatorId !== user?.id : false;

  const changeMonth = (offset: number) => {
    const newDate = new Date(currentDate.setMonth(currentDate.getMonth() + offset));
    setCurrentDate(new Date(newDate));
  };

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setFormData({
        title: '',
        startDate: todayStr,
        endDate: todayStr,
        time: '09:00',
        endTime: '10:00',
        type: 'meeting',
        status: 'scheduled',
        description: '',
        meetingLink: '',
        participants: ''
    });
    setIsModalOpen(true);
  };

  const handleDateClick = (dateStr: string) => {
    if (dateStr < todayStr) return;
    setEditingId(null);
    setFormData({
        title: '',
        startDate: dateStr,
        endDate: dateStr,
        time: '09:00',
        endTime: '10:00',
        type: 'meeting',
        status: 'scheduled',
        description: '',
        meetingLink: '',
        participants: ''
    });
    setIsModalOpen(true);
  };

  // Drag to Create (Selection)
  const handleDragStart = (dateStr: string) => {
    if (dateStr < todayStr) return;
    setDragStartDate(dateStr);
    setDragCurrentDate(dateStr);
  };

  const handleDragEnter = (dateStr: string) => {
    if (!dragStartDate || dateStr < todayStr) return;
    setDragCurrentDate(dateStr);
  };

  const handleDragEnd = () => {
    if (!dragStartDate || !dragCurrentDate) {
        setDragStartDate(null);
        setDragCurrentDate(null);
        return;
    }

    const start = dragStartDate < dragCurrentDate ? dragStartDate : dragCurrentDate;
    const end = dragStartDate > dragCurrentDate ? dragStartDate : dragCurrentDate;

    if (start !== end) {
      setEditingId(null);
      setFormData({
          title: '',
          startDate: start,
          endDate: end,
          time: '09:00',
          endTime: '10:00',
          type: 'meeting',
          status: 'scheduled',
          description: '',
          meetingLink: '',
          participants: ''
      });
      setIsModalOpen(true);
    }
    
    setDragStartDate(null);
    setDragCurrentDate(null);
  };

  // Drag to Reschedule (Event)
  const handleEventDragStart = (e: React.DragEvent, event: CalendarEvent) => {
    e.stopPropagation();
    e.dataTransfer.setData('eventId', event.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleEventDrop = (e: React.DragEvent, dateStr: string) => {
    e.preventDefault();
    e.stopPropagation();
    const eventId = e.dataTransfer.getData('eventId');
    if (eventId && dateStr >= todayStr) {
      const event = events.find(e => e.id === eventId);
      if (event && event.creatorId === user?.id) {
        updateEvent({ ...event, date: dateStr });
      }
    }
  };

  const handleWeekEventDrop = (e: React.DragEvent, dateStr: string, timeStr?: string) => {
      e.preventDefault();
      e.stopPropagation();
      const eventId = e.dataTransfer.getData('eventId');
      if (eventId && dateStr >= todayStr) {
        const event = events.find(e => e.id === eventId);
        if (event && event.creatorId === user?.id) {
          const updates: any = { date: dateStr };
          if (timeStr) updates.time = timeStr;
          updateEvent({ ...event, ...updates });
        }
      }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleContextMenu = (e: React.MouseEvent, dateStr: string) => {
    e.preventDefault();
    if (dateStr < todayStr) return;
    setContextMenu({ x: e.clientX, y: e.clientY, dateStr });
  };

  const closeContextMenu = () => setContextMenu(null);

  const handleQuickAction = (type: 'meeting' | 'reminder' | 'task' | 'off-day') => {
    if (!contextMenu) return;
    setEditingId(null);
    setFormData({
        title: '',
        startDate: contextMenu.dateStr,
        endDate: contextMenu.dateStr,
        time: '09:00',
        endTime: '10:00',
        type,
        status: 'scheduled',
        description: '',
        meetingLink: '',
        participants: ''
    });
    setIsModalOpen(true);
    closeContextMenu();
  };

  const handleEventClick = (event: CalendarEvent) => {
    setEditingId(event.id);
    setFormData({
        title: event.title,
        startDate: event.date,
        endDate: event.date,
        time: formatTimeForInput(event.time),
        endTime: event.endTime ? formatTimeForInput(event.endTime) : '10:00',
        type: event.type,
        status: event.status || 'scheduled',
        description: event.description || '',
        meetingLink: event.meetingLink || '',
        participants: event.participants?.map(p => p.name).join(', ') || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    
    const [hours, minutes] = formData.time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    const formattedTime = formData.type === 'off-day' ? 'All Day' : `${hour12}:${minutes} ${ampm}`;

    const [endHours, endMinutes] = formData.endTime.split(':');
    const endHour = parseInt(endHours);
    const endAmpm = endHour >= 12 ? 'PM' : 'AM';
    const endHour12 = endHour % 12 || 12;
    const formattedEndTime = formData.type === 'off-day' ? 'All Day' : `${endHour12}:${endMinutes} ${endAmpm}`;

    const participantsList = formData.participants
      ? formData.participants.split(',').map(name => ({ name: name.trim() })).filter(p => p.name)
      : [];

    if (editingId) {
        updateEvent({
            id: editingId,
            title: formData.title,
            date: formData.startDate,
            time: formattedTime,
            endTime: formattedEndTime,
            type: formData.type,
            status: formData.status,
            description: formData.description,
            meetingLink: formData.meetingLink,
            participants: participantsList,
            creatorId: editingEvent?.creatorId,
            creatorName: editingEvent?.creatorName
        });
    } else {
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        
        if (start > end) {
            alert("End date cannot be before start date.");
            return;
        }

        const tempDate = new Date(start);
        while (tempDate <= end) {
            const currentStr = tempDate.toISOString().split('T')[0];
            addEvent({
                title: formData.type === 'off-day' ? `${user?.name || 'Advisor'} Off-Day` : formData.title,
                date: currentStr,
                time: formattedTime,
                endTime: formattedEndTime,
                type: formData.type,
                status: formData.status,
                description: formData.description,
                meetingLink: formData.meetingLink,
                participants: participantsList,
                creatorId: user?.id,
                creatorName: user?.name
            });
            tempDate.setDate(tempDate.getDate() + 1);
        }
    }
    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (editingId && !isReadOnly) {
        if(window.confirm('Delete this event?')) {
            deleteEvent(editingId);
            setIsModalOpen(false);
        }
    }
  };

  const upcomingEvents = useMemo(() => {
      return [...visibleEvents]
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .filter(e => new Date(e.date) >= new Date(new Date().setHours(0,0,0,0)));
  }, [visibleEvents]);

  const checkEventStartingSoon = (date: string, time: string) => isEventStartingSoon(date, time, todayStr);

  // Check for upcoming meetings to show reminder toast
  useEffect(() => {
    const checkReminders = () => {
      const upcomingMeeting = upcomingEvents.find(e => e.type === 'meeting' && checkEventStartingSoon(e.date, e.time));
      if (upcomingMeeting && activeReminder?.id !== upcomingMeeting.id) {
        setActiveReminder(upcomingMeeting);
      } else if (!upcomingMeeting) {
        setActiveReminder(null);
      }
    };
    
    checkReminders();
    const interval = setInterval(checkReminders, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [upcomingEvents, activeReminder, todayStr]);

  return (
    <motion.div 
      className="flex flex-col lg:flex-row h-full gap-8"
      initial={animConfig.container.initial}
      animate={animConfig.container.animate}
      transition={animConfig.container.transition}
    >
      <div className="flex-1 flex flex-col bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
        <CalendarHeader
          currentDate={currentDate}
          formatDateHeader={formatDateHeader}
          changeMonth={changeMonth}
          setCurrentDate={setCurrentDate}
          setIsSettingsOpen={setIsSettingsOpen}
          handleOpenCreateModal={handleOpenCreateModal}
          filterType={filterType}
          setFilterType={setFilterType}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
            {viewMode === 'month' ? (
                <CalendarGrid
                currentDate={currentDate}
                visibleEvents={visibleEvents}
                user={user}
                animConfig={animConfig}
                todayStr={todayStr}
                dragStartDate={dragStartDate}
                dragCurrentDate={dragCurrentDate}
                isEventStartingSoon={checkEventStartingSoon}
                handleDateClick={handleDateClick}
                handleDragStart={handleDragStart}
                handleDragEnter={handleDragEnter}
                handleDragEnd={handleDragEnd}
                handleDragOver={handleDragOver}
                handleEventDrop={handleEventDrop}
                handleContextMenu={handleContextMenu}
                handleEventDragStart={handleEventDragStart}
                handleEventClick={handleEventClick}
                getFirstDayOfMonth={getFirstDayOfMonth}
                getDaysInMonth={getDaysInMonth}
                />
            ) : (
                <WeekView
                    currentDate={currentDate}
                    visibleEvents={visibleEvents}
                    user={user}
                    animConfig={animConfig}
                    todayStr={todayStr}
                    isEventStartingSoon={checkEventStartingSoon}
                    handleEventClick={handleEventClick}
                    handleEventDragStart={handleEventDragStart}
                    handleEventDrop={handleWeekEventDrop}
                    handleDragOver={handleDragOver}
                />
            )}
        </div>
      </div>

      <AgendaSidebar
        upcomingEvents={upcomingEvents}
        animConfig={animConfig}
        isEventStartingSoon={checkEventStartingSoon}
        handleEventClick={handleEventClick}
      />

      <ReminderToast
        activeReminder={activeReminder}
        setActiveReminder={setActiveReminder}
      />

      <ContextMenu
        contextMenu={contextMenu}
        closeContextMenu={closeContextMenu}
        handleQuickAction={handleQuickAction}
      />

      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isReadOnly={isReadOnly}
        editingId={editingId}
        formData={formData}
        setFormData={setFormData}
        handleSubmit={handleSubmit}
        handleDelete={handleDelete}
        animConfig={animConfig}
        user={user}
        todayStr={todayStr}
      />

      <AnimationSettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        animationMode={animationMode}
        setAnimationMode={setAnimationMode}
      />
    </motion.div>
  );
};
