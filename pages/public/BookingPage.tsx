import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarEvent, LeadStatus, ProductType } from '../../types';
import { Calendar, Clock, User as UserIcon, Mail, Phone, MessageSquare, CheckCircle, ChevronRight, ChevronLeft, Globe } from 'lucide-react';

export const BookingPage: React.FC = () => {
    const { addEvent, addLead, events } = useData();

    // Steps
    const [step, setStep] = useState<1 | 2 | 3>(1);

    // Form data
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [notes, setNotes] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);

    // ── Grid Logic ──
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

    const getDaysInMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    const getFirstDayOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1).getDay();

    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDayOfWeek = getFirstDayOfMonth(currentMonth);

    // Filter available times
    const availableTimes = useMemo(() => {
        if (!selectedDate) return [];
        const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
        // Basic 9AM to 5PM array
        const allTimes = [
            '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
            '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
            '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'
        ];

        // Find meetings or off-days on this day to simulate conflict detection
        const blockedSlots = new Set<string>();
        events.forEach(e => {
            if (e.date === dateStr && e.status !== 'canceled') {
                if (e.type === 'meeting' && e.time) {
                    blockedSlots.add(e.time);
                }
                if (e.type === 'off-day') {
                    // Block entire day if off-day
                    allTimes.forEach(t => blockedSlots.add(t));
                }
            }
        });

        return allTimes.filter(t => !blockedSlots.has(t));
    }, [selectedDate, events]);

    const handleNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const handlePrevMonth = () => {
        const prev = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
        if (prev < new Date(today.getFullYear(), today.getMonth(), 1)) return;
        setCurrentMonth(prev);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDate || !selectedTime || !name || !email) return;

        setIsSubmitting(true);
        // Simulate network
        await new Promise(r => setTimeout(r, 1200));

        const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;

        // Create Lead
        addLead({
            name, email, phone,
            status: LeadStatus.NEW,
            source: 'Website Booking',
            message: notes,
            interest: ProductType.LIFE,
            date: new Date().toISOString()
        });

        // Create Meeting
        const meetingEvent: Partial<CalendarEvent> = {
            title: `Meeting: ${name}`,
            type: 'meeting',
            date: dateStr,
            time: selectedTime,
            description: `Lead Details:\nEmail: ${email}\nPhone: ${phone}\n\nClient Notes: ${notes}`,
            visibility: 'public',
            status: 'scheduled',
            meetingLink: 'https://meet.google.com/new' // auto-generate mock link
        };
        addEvent(meetingEvent as CalendarEvent);

        setIsSubmitting(false);
        setStep(3);
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center py-12 px-4" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-4xl bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden flex flex-col md:flex-row min-h-[600px]"
            >
                {/* Left Panel */}
                <div className="w-full md:w-[35%] bg-slate-50 border-r border-slate-100 p-8 flex flex-col">
                    <div className="mb-6">
                        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-sm">
                            <Calendar className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800">New Holland Financial</h2>
                        <h1 className="text-2xl font-black text-slate-900 mt-2">Discovery Call</h1>
                        <p className="text-slate-500 font-medium text-sm mt-3 leading-relaxed">
                            Book a quick 30-minute discovery call with one of our specialized advisors to discuss your financial goals.
                        </p>
                    </div>

                    <div className="space-y-4 mt-4">
                        <div className="flex items-center gap-3 text-slate-600 font-medium text-sm">
                            <Clock className="w-5 h-5 text-slate-400" />
                            <span>30 Minutes</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-600 font-medium text-sm">
                            <Calendar className="w-5 h-5 text-slate-400" />
                            <span>Google Meet or Phone Call</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-600 font-medium text-sm">
                            <Globe className="w-5 h-5 text-slate-400" />
                            <span>{Intl.DateTimeFormat().resolvedOptions().timeZone.replace(/_/g, ' ')} Time</span>
                        </div>
                    </div>

                    {selectedDate && selectedTime && (
                        <div className="mt-auto pt-8">
                            <div className="bg-white border text-blue-800 border-blue-100 p-4 rounded-2xl shadow-sm">
                                <p className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-1">Selected</p>
                                <p className="font-bold text-sm">
                                    {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                </p>
                                <p className="font-semibold text-sm opacity-80 mt-0.5">{selectedTime}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Panel */}
                <div className="w-full md:w-[65%] p-8 md:p-10 relative">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="h-full flex flex-col"
                            >
                                <h3 className="text-lg font-bold text-slate-800 mb-6">Select a Date & Time</h3>

                                <div className="flex gap-8 h-full">
                                    {/* Calendar Grid */}
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="font-bold text-slate-800">
                                                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <button onClick={handlePrevMonth} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
                                                    <ChevronLeft className="w-5 h-5" />
                                                </button>
                                                <button onClick={handleNextMonth} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
                                                    <ChevronRight className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-7 gap-1 text-center mb-2">
                                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                                                <div key={i} className="text-xs font-bold text-slate-400 py-1">{d}</div>
                                            ))}
                                        </div>

                                        <div className="grid grid-cols-7 gap-1">
                                            {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`empty-${i}`} />)}
                                            {Array.from({ length: daysInMonth }).map((_, i) => {
                                                const dayNum = i + 1;
                                                const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), dayNum);

                                                const isPast = d < new Date(today.getFullYear(), today.getMonth(), today.getDate());
                                                const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                                                const isUnavailable = isPast || isWeekend; // Example logic: No weekends

                                                const isSelected = selectedDate?.toDateString() === d.toDateString();

                                                return (
                                                    <button
                                                        key={dayNum}
                                                        onClick={() => !isUnavailable && setSelectedDate(d)}
                                                        disabled={isUnavailable}
                                                        className={`aspect-square flex items-center justify-center rounded-xl text-sm font-semibold transition-all
                                                            ${isUnavailable ? 'text-slate-300 cursor-not-allowed'
                                                                : isSelected ? 'bg-blue-600 text-white shadow-md scale-105'
                                                                    : 'bg-slate-50 text-slate-700 hover:bg-blue-50 hover:text-blue-600 cursor-pointer'}
                                                        `}
                                                    >
                                                        {dayNum}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Timelist */}
                                    {selectedDate && (
                                        <div className="w-40 flex flex-col gap-2 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                                            <div className="text-sm font-bold text-slate-800 mb-2 sticky top-0 bg-white py-1">Available Times</div>
                                            {availableTimes.length === 0 ? (
                                                <p className="text-xs text-slate-500">No times available.</p>
                                            ) : (
                                                availableTimes.map(time => (
                                                    <button
                                                        key={time}
                                                        onClick={() => setSelectedTime(time)}
                                                        className={`py-3 px-4 rounded-xl text-sm font-semibold transition-all
                                                            ${selectedTime === time
                                                                ? 'bg-slate-800 text-white shadow-md'
                                                                : 'border border-slate-200 text-slate-600 hover:border-blue-500 hover:text-blue-600 cursor-pointer'}
                                                        `}
                                                    >
                                                        {time}
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="mt-auto pt-6 flex justify-end">
                                    <button
                                        disabled={!selectedDate || !selectedTime}
                                        onClick={() => setStep(2)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="h-full flex flex-col"
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <button onClick={() => setStep(1)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <h3 className="text-lg font-bold text-slate-800">Enter Details</h3>
                                </div>

                                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-2 space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Full Name *</label>
                                        <div className="relative">
                                            <UserIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input required value={name} onChange={e => setName(e.target.value)} type="text" className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold rounded-xl pl-12 pr-4 py-3.5 outline-none focus:border-blue-500 transition-all" placeholder="John Doe" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Email Address *</label>
                                        <div className="relative">
                                            <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input required value={email} onChange={e => setEmail(e.target.value)} type="email" className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold rounded-xl pl-12 pr-4 py-3.5 outline-none focus:border-blue-500 transition-all" placeholder="john@example.com" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Phone Number</label>
                                        <div className="relative">
                                            <Phone className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input value={phone} onChange={e => setPhone(e.target.value)} type="tel" className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold rounded-xl pl-12 pr-4 py-3.5 outline-none focus:border-blue-500 transition-all" placeholder="(555) 000-0000" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Additional Notes</label>
                                        <div className="relative">
                                            <MessageSquare className="w-5 h-5 absolute left-4 top-4 text-slate-400" />
                                            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold rounded-xl pl-12 pr-4 py-3.5 outline-none focus:border-blue-500 transition-all resize-none" placeholder="Let us know what you want to discuss..." />
                                        </div>
                                    </div>

                                    <div className="mt-8">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting || !name || !email}
                                            className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center min-h-[56px]"
                                        >
                                            {isSubmitting ? (
                                                <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                'Schedule Meeting'
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="h-full flex flex-col items-center justify-center text-center space-y-4"
                            >
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-500 mb-2">
                                    <CheckCircle className="w-10 h-10" />
                                </div>
                                <h2 className="text-2xl font-black text-slate-900">You're Scheduled!</h2>
                                <p className="text-slate-500 font-medium max-w-[300px]">
                                    A calendar invitation with the meeting link has been sent to your email address.
                                </p>
                                <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl w-full max-w-[340px] mt-4 text-left shadow-sm">
                                    <h4 className="font-bold text-slate-800 text-sm mb-4 border-b border-slate-200 pb-2">Meeting Details</h4>
                                    <div className="space-y-3">
                                        <div className="flex gap-3 text-sm">
                                            <UserIcon className="w-5 h-5 text-slate-400" />
                                            <span className="font-semibold text-slate-700">{name} & NHFG</span>
                                        </div>
                                        <div className="flex gap-3 text-sm">
                                            <Calendar className="w-5 h-5 text-slate-400" />
                                            <span className="font-semibold text-slate-700">{selectedDate?.toLocaleDateString()} at {selectedTime}</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};
