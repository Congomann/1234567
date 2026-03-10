import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CalendarEvent } from '../../types';
import { useData } from '../../context/DataContext';

interface EventModalProps {
    isOpen: boolean;
    close: () => void;
    selectedDate: Date | null;
    selectedEvent: CalendarEvent | null;
    prefillType: CalendarEvent['type'];
}

export const EventModal: React.FC<EventModalProps> = ({ isOpen, close, selectedDate, selectedEvent, prefillType }) => {
    const { addEvent, updateEvent, deleteEvent, user } = useData();

    // Default states
    const [title, setTitle] = useState('');
    const [type, setType] = useState<CalendarEvent['type']>(prefillType);
    const [date, setDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [time, setTime] = useState('09:00 AM');
    const [description, setDescription] = useState('');
    const [meetingLink, setMeetingLink] = useState('');

    // Auto visibility defaults: Meeting -> Public, Off Day -> Public, Task -> Private, Reminder -> Private
    const getDefaultVisibility = (t: CalendarEvent['type']) => (t === 'meeting' || t === 'off-day') ? 'public' : 'private';
    const [visibility, setVisibility] = useState<'public' | 'private'>(getDefaultVisibility(prefillType));

    useEffect(() => {
        if (selectedEvent) {
            setTitle(selectedEvent.title);
            setType(selectedEvent.type);
            setDate(selectedEvent.date);
            setEndDate(selectedEvent.endDate || '');
            setTime(selectedEvent.time || '09:00 AM');
            setDescription(selectedEvent.description || '');
            setMeetingLink(selectedEvent.meetingLink || '');
            setVisibility(selectedEvent.visibility || getDefaultVisibility(selectedEvent.type));
        } else if (selectedDate) {
            const dStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
            setDate(dStr);
            setEndDate('');
            setType(prefillType);
            setVisibility(getDefaultVisibility(prefillType));
            const defaults = { meeting: 'New Meeting', task: 'New Task', reminder: 'New Reminder', 'off-day': 'Off Day' };
            setTitle(defaults[prefillType]);
            setDescription('');
            setMeetingLink('');
            setTime('09:00 AM');
        }
    }, [selectedEvent, selectedDate, prefillType]);

    // Handle manual type change to auto-update visibility
    const handleTypeChange = (newType: CalendarEvent['type']) => {
        setType(newType);
        setVisibility(getDefaultVisibility(newType));
    };

    const handleSave = () => {
        if (!title.trim() || !date) return;

        const eventData: Partial<CalendarEvent> = {
            title, type, date, time, description, meetingLink, visibility,
            endDate: type === 'off-day' && endDate ? endDate : undefined,
            creatorId: user?.id, creatorName: user?.name, status: 'scheduled'
        };

        if (selectedEvent) {
            updateEvent({ ...selectedEvent, ...eventData } as CalendarEvent);
        } else {
            addEvent(eventData as CalendarEvent);
        }
        close();
    };

    const handleDelete = () => {
        if (selectedEvent) {
            deleteEvent(selectedEvent.id);
            close();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4" onClick={close}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden flex flex-col"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-800">{selectedEvent ? 'Edit Event' : 'New Event'}</h2>
                    <button onClick={close} className="text-slate-400 hover:text-slate-600 bg-slate-100 p-2 rounded-full transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body form */}
                <div className="p-6 space-y-4 overflow-y-auto max-h-[70vh] no-scrollbar">

                    {/* Title */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="Event Title..."
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:font-normal placeholder:text-slate-400"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Type */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Type</label>
                            <select
                                value={type}
                                onChange={e => handleTypeChange(e.target.value as any)}
                                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none"
                            >
                                <option value="meeting">Meeting</option>
                                <option value="task">Task</option>
                                <option value="reminder">Reminder</option>
                                <option value="off-day">Off Day</option>
                            </select>
                        </div>

                        {/* Visibility */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Visibility</label>
                            <select
                                value={visibility}
                                onChange={e => setVisibility(e.target.value as any)}
                                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none"
                            >
                                <option value="public">Public (Team)</option>
                                <option value="private">Private (Only You)</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Date */}
                        <div className={type === 'off-day' ? 'col-span-1' : 'col-span-2'}>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Date {type === 'off-day' ? '(From)' : ''}</label>
                            <input
                                type="date"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                            />
                        </div>

                        {/* End Date (Only for Off-Day) */}
                        {type === 'off-day' && (
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">End Date (To)</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={e => setEndDate(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                />
                            </div>
                        )}

                        {/* Time */}
                        {type !== 'off-day' && (
                            <div className="col-span-2 mt-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Time</label>
                                <input
                                    type="text"
                                    value={time}
                                    onChange={e => setTime(e.target.value)}
                                    placeholder="09:00 AM"
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                />
                            </div>
                        )}
                    </div>

                    {/* External Link */}
                    {(type === 'meeting' || meetingLink) && (
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Meeting Link</label>
                            <div className="flex gap-2">
                                <input
                                    type="url"
                                    value={meetingLink}
                                    onChange={e => setMeetingLink(e.target.value)}
                                    placeholder="https://zoom.us/j/..."
                                    className="flex-1 bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:font-normal placeholder:text-slate-400"
                                />
                                {meetingLink && (
                                    <a
                                        href={meetingLink.startsWith('http') ? meetingLink : `https://${meetingLink}`}
                                        target="_blank" rel="noreferrer"
                                        className="bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center px-4 rounded-xl text-sm font-bold shadow-sm transition-colors whitespace-nowrap"
                                    >
                                        Join
                                    </a>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Notes */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Notes / Description</label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Add details, agendas, or reminders..."
                            rows={3}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:font-normal placeholder:text-slate-400 resize-none"
                        />
                    </div>
                </div>

                {/* Footer actions */}
                <div className="p-6 pt-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 mt-auto">
                    {selectedEvent ? (
                        <button
                            onClick={handleDelete}
                            className="px-4 py-2.5 text-sm font-bold text-red-600 bg-red-100 hover:bg-red-200 rounded-xl transition-colors"
                        >
                            Delete
                        </button>
                    ) : (
                        <div /> // spacer
                    )}

                    <div className="flex gap-3">
                        <button
                            onClick={close}
                            className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 bg-slate-100 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!title.trim()}
                            className="px-6 py-2.5 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-sm transition-all active:scale-95"
                        >
                            Save
                        </button>
                    </div>
                </div>

            </motion.div>
        </div>
    );
};
