import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, CheckCircle2, Circle, Plus, Trash2 } from 'lucide-react';
import { CalendarEvent, Task, TaskPriority } from '../../types';
import { useData } from '../../context/DataContext';
import { BlockPalette } from './BlockPalette';

interface AgendaSidebarProps {
    upcomingEvents: CalendarEvent[];
    animConfig: any;
    isEventStartingSoon: (date: string, time: string) => boolean;
    handleEventClick: (event: CalendarEvent) => void;
}

export const AgendaSidebar: React.FC<AgendaSidebarProps> = ({
    upcomingEvents,
    animConfig,
    isEventStartingSoon,
    handleEventClick
}) => {
    const { tasks, addTask, toggleTask, deleteTask, user } = useData();
    const [activeTab, setActiveTab] = useState<'agenda' | 'tasks'>('agenda');
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskDueDate, setNewTaskDueDate] = useState('');

    const getEventStyles = (type: string) => {
        switch (type) {
            case 'meeting': return 'bg-emerald-500 text-white border-emerald-600';
            case 'reminder': return 'bg-amber-400 text-white border-amber-500';
            case 'task': return 'bg-blue-500 text-white border-blue-600';
            case 'off-day': return 'bg-rose-500 text-white border-rose-600';
            default: return 'bg-slate-500 text-white border-slate-600';
        }
    };

    const getEventIcon = (type: string) => {
        switch (type) {
            case 'meeting': return <CalendarIcon className="h-3 w-3 mr-1.5" />;
            default: return <CalendarIcon className="h-3 w-3 mr-1.5" />;
        }
    };

    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle.trim() || !user) return;
        addTask({
            title: newTaskTitle.trim(),
            priority: TaskPriority.MEDIUM,
            completed: false,
            advisorId: user.id,
            dueDate: newTaskDueDate || undefined
        });
        setNewTaskTitle('');
        setNewTaskDueDate('');
    };

    const userTasks = tasks.filter(t => t.advisorId === user?.id).sort((a, b) => a.completed === b.completed ? 0 : a.completed ? 1 : -1);

    return (
        <div className="w-full lg:w-[24rem] flex-shrink-0 bg-white rounded-[2.5rem] shadow-sm border border-slate-200 flex flex-col overflow-hidden h-full">

            {/* ── Block Palette ── */}
            <BlockPalette />

            {/* ── Tab switcher ── */}
            <div className="px-6 pb-3 border-b border-slate-100 bg-white flex gap-3">
                <button
                    onClick={() => setActiveTab('agenda')}
                    className={`flex-1 py-2.5 text-sm font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'agenda' ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                >
                    Agenda
                </button>
                <button
                    onClick={() => setActiveTab('tasks')}
                    className={`flex-1 py-2.5 text-sm font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'tasks' ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                >
                    Tasks
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
                {activeTab === 'agenda' ? (
                    upcomingEvents.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-60 text-slate-400">
                            <CalendarIcon className="h-12 w-12 mb-4 opacity-10" />
                            <p className="text-sm font-bold uppercase tracking-widest opacity-40">No upcoming events</p>
                        </div>
                    ) : (
                        <AnimatePresence>
                            {upcomingEvents.slice(0, 10).map((event) => {
                                const startingSoon = isEventStartingSoon(event.date, event.time);
                                return (
                                    <motion.div
                                        key={event.id}
                                        draggable={event.creatorId === user?.id && event.status !== 'canceled'}
                                        onDragStart={(e: any) => {
                                            e.dataTransfer.setData('eventId', event.id);
                                            e.dataTransfer.setData('application/json', JSON.stringify({ type: 'event', id: event.id }));
                                            e.dataTransfer.effectAllowed = 'move';
                                        }}
                                        onClick={() => handleEventClick(event)}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        whileHover={animConfig.event.whileHover}
                                        transition={animConfig.event.transition}
                                        className={`p-5 rounded-[1.5rem] border cursor-pointer shadow-sm group/item flex flex-col gap-3 ${getEventStyles(event.type)} ${startingSoon ? 'animate-pulse ring-2 ring-white/50 ring-offset-2' : ''}`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="flex-1">
                                                <h4 className="text-xs font-black leading-tight mb-2 flex items-center justify-between uppercase tracking-wide">
                                                    <span className="flex items-center gap-2">
                                                        {getEventIcon(event.type)}
                                                        {event.type === 'off-day' ? `${event.creatorName}: OFF` : event.title}
                                                    </span>
                                                </h4>
                                                <div className="flex items-center text-[10px] font-bold opacity-80 uppercase tracking-widest">
                                                    <span className="bg-white/20 px-2 py-0.5 rounded-lg">{new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                                                    <span className="mx-2">•</span>
                                                    <span>{event.time}</span>
                                                </div>
                                            </div>
                                        </div>
                                        {event.type === 'meeting' && (
                                            <div className="pt-3 border-t border-white/20 flex justify-end">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        window.open(event.meetingLink || 'https://meet.google.com', '_blank');
                                                    }}
                                                    className="px-4 py-1.5 bg-white text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider shadow-sm"
                                                >
                                                    Join Meeting
                                                </button>
                                            </div>
                                        )}
                                    </motion.div>
                                )
                            })}
                        </AnimatePresence>
                    )
                ) : (
                    <div className="flex flex-col h-full">
                        <form onSubmit={handleAddTask} className="mb-6 flex flex-col gap-2">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Add a new task..."
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-12 py-3 text-sm font-medium focus:ring-2 focus:ring-[#0A62A7] outline-none"
                                    value={newTaskTitle}
                                    onChange={(e) => setNewTaskTitle(e.target.value)}
                                />
                                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-[#0A62A7] text-white rounded-lg hover:bg-blue-700 transition-colors">
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="flex items-center gap-2">
                                <CalendarIcon className="h-4 w-4 text-slate-400" />
                                <input
                                    type="date"
                                    className="bg-transparent text-xs font-bold text-slate-500 outline-none cursor-pointer"
                                    value={newTaskDueDate}
                                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                                />
                            </div>
                        </form>

                        <div className="flex-1 space-y-2">
                            {userTasks.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                                    <CheckCircle2 className="h-10 w-10 mb-3 opacity-20" />
                                    <p className="text-xs font-bold uppercase tracking-widest opacity-50">All caught up!</p>
                                </div>
                            ) : (
                                <AnimatePresence>
                                    {userTasks.map(task => (
                                        <motion.div
                                            key={task.id}
                                            draggable={!task.completed}
                                            onDragStart={(e: any) => {
                                                e.dataTransfer.setData('taskId', task.id);
                                                e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'task', id: task.id }));
                                                e.dataTransfer.effectAllowed = 'copy';
                                            }}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className={`flex items-center justify-between p-4 rounded-xl border transition-all ${task.completed ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-slate-200 shadow-sm hover:border-blue-200'}`}
                                        >
                                            <div className="flex items-center gap-3 flex-1 overflow-hidden">
                                                <button onClick={() => toggleTask(task.id)} className={`flex-shrink-0 transition-colors ${task.completed ? 'text-green-500' : 'text-slate-300 hover:text-blue-500'}`}>
                                                    {task.completed ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                                                </button>
                                                <div className="flex flex-col overflow-hidden">
                                                    <span className={`text-sm font-bold truncate ${task.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                                        {task.title}
                                                    </span>
                                                    {task.dueDate && (
                                                        <span className={`text-[10px] font-bold uppercase tracking-wider ${task.completed ? 'text-slate-400' : new Date(task.dueDate) < new Date() ? 'text-red-500' : 'text-blue-500'}`}>
                                                            Due: {new Date(task.dueDate).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <button onClick={() => deleteTask(task.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 md:opacity-100">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
