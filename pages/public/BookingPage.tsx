import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link, useParams } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarEvent, LeadStatus, ProductType, User } from '../../types';
import {
  Calendar,
  Clock,
  User as UserIcon,
  Mail,
  Phone,
  MessageSquare,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Globe,
  CheckCircle2,
  Sparkles,
  Shield,
  Video,
  Copy,
  Building2,
  Truck,
  Landmark,
  ArrowRight
} from 'lucide-react';

export const BookingPage: React.FC = () => {
  const { addEvent, addLead, events, allUsers, companySettings } = useData();
  const [searchParams] = useSearchParams();
  const { id } = useParams();
  const advisorParam = id || searchParams.get('advisor') || searchParams.get('advisor_id') || searchParams.get('agent');

  // Steps: 1 = Advisor & Meeting Type, 2 = Date & Time, 3 = Client Details, 4 = Confirmation
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Selected Advisor State
  const [selectedAdvisor, setSelectedAdvisor] = useState<User | null>(null);

  // Meeting Type Options
  const meetingTypes = [
    { id: 'discovery', name: '30-Min Discovery Session', duration: '30 Minutes', icon: Clock, desc: 'Introductory consultation to review your financial, insurance, or real estate goals.' },
    { id: 'wealth', name: '45-Min Wealth & Estate Review', duration: '45 Minutes', icon: Landmark, desc: 'In-depth analysis of portfolio management, annuities, or legacy protection.' },
    { id: 'realtor', name: '45-Min Realtor & Property Strategy', duration: '45 Minutes', icon: Building2, desc: 'Discuss property acquisition, listings, or real estate market intelligence.' },
    { id: 'freight', name: '60-Min Freight & Logistics Quote', duration: '60 Minutes', icon: Truck, desc: 'Custom load dispatching, carrier network, and fleet freight logistics.' },
  ];

  const [selectedMeetingType, setSelectedMeetingType] = useState(meetingTypes[0]);

  // Form Data
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Find Advisors List
  const activeAdvisors = useMemo(() => {
    const list = (allUsers || []).filter(u => u.role === 'Advisor' || u.role === 'Admin' || u.role === 'Manager');
    if (list.length === 0) {
      return [{
        id: 'remmy-shabani',
        name: 'Remmy Shabani',
        email: 'remmyk@newhollandfinancial.com',
        phone: '(717) 847-9638',
        role: 'Advisor' as const,
        advisorCategory: 'Real Estate & Insurance',
          avatar: `https://ui-avatars.com/api/?name=Remmy+Shabani&background=0A62A7&color=fff`,
        active: true
      }];
    }
    return list;
  }, [allUsers]);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (advisorParam) {
      const cleanParam = advisorParam.toLowerCase().trim();
      const found = activeAdvisors.find(a => 
        a.id.toLowerCase() === cleanParam || 
        a.name.toLowerCase().replace(/\s+/g, '-') === cleanParam ||
        a.name.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanParam.replace(/[^a-z0-9]/g, '') ||
        a.email.toLowerCase().includes(cleanParam)
      );
      if (found) {
        setSelectedAdvisor(found);
      } else {
        setSelectedAdvisor({
          id: 'remmy-shabani',
          name: 'Remmy Shabani',
          email: 'remmyk@newhollandfinancial.com',
          phone: '(717) 847-9638',
          role: 'Advisor' as any,
          advisorCategory: 'Real Estate & Insurance Advisor',
            avatar: `https://ui-avatars.com/api/?name=Remmy+Shabani&background=0A62A7&color=fff`,
          active: true
        });
      }
    } else {
      setSelectedAdvisor(activeAdvisors[0] || {
        id: 'remmy-shabani',
        name: 'Remmy Shabani',
        email: 'remmyk@newhollandfinancial.com',
        phone: '(717) 847-9638',
        role: 'Advisor' as any,
        advisorCategory: 'Real Estate & Insurance Advisor',
          avatar: `https://ui-avatars.com/api/?name=Remmy+Shabani&background=0A62A7&color=fff`,
        active: true
      });
    }
  }, [advisorParam, activeAdvisors]);

  // Month & Days Grid Logic
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const getDaysInMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1).getDay();

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDayOfWeek = getFirstDayOfMonth(currentMonth);

  // Available Time Slots
  const availableTimes = useMemo(() => {
    if (!selectedDate) return [];
    const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
    const allTimes = [
      '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
      '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM'
    ];

    const blockedSlots = new Set<string>();
    (events || []).forEach(e => {
      if (e.date === dateStr && e.status !== 'canceled') {
        if (e.time) blockedSlots.add(e.time);
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
    if (!selectedDate || !selectedTime || !name || !email || !selectedAdvisor) return;

    setIsSubmitting(true);

    const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;

    // 1. Create Lead in CRM assigned to this specific Advisor
    addLead({
      name,
      email,
      phone: phone || '(555) 000-0000',
      status: LeadStatus.NEW,
      source: `Website Booking (${selectedAdvisor.name})`,
      message: `[Scheduled Meeting: ${selectedMeetingType.name}] Date: ${dateStr} at ${selectedTime}. Notes: ${notes}`,
      interest: ProductType.LIFE,
      customDetails: {
        advisorAssigned: selectedAdvisor.name,
        meetingType: selectedMeetingType.name,
        meetingTime: `${dateStr} ${selectedTime}`
      }
    });

    // 2. Insert Calendar Event on Advisor's CRM Calendar
    const meetingEvent: Partial<CalendarEvent> = {
      title: `Meeting: ${name} w/ ${selectedAdvisor.name}`,
      type: 'meeting',
      date: dateStr,
      time: selectedTime,
      description: `Client: ${name}\nEmail: ${email}\nPhone: ${phone}\nAdvisor: ${selectedAdvisor.name}\nMeeting Type: ${selectedMeetingType.name}\nNotes: ${notes}`,
      visibility: 'public',
      status: 'scheduled',
      creatorId: selectedAdvisor.id,
      meetingLink: `https://meet.google.com/nhfg-${Math.random().toString(36).substring(7)}`
    };
    addEvent(meetingEvent as CalendarEvent);

    // 3. Trigger SMTP Confirmation Email via Backend API
    try {
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          subject: `Meeting Confirmed with ${selectedAdvisor.name} - New Holland Financial Group`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #050b14; color: #ffffff; border-radius: 16px;">
              <h2 style="color: #60a5fa; margin-bottom: 5px;">New Holland Financial Group</h2>
              <p style="color: #94a3b8; font-size: 14px;">Meeting Confirmation Notice</p>
              <hr style="border: 1px solid #1e293b; margin: 20px 0;" />
              <p>Hi <strong>${name}</strong>,</p>
              <p>Your appointment with <strong>${selectedAdvisor.name}</strong> has been successfully scheduled.</p>
              <div style="background: #0f172a; padding: 16px; border-radius: 12px; margin: 20px 0;">
                <p style="margin: 4px 0; color: #60a5fa;"><strong>Date:</strong> ${selectedDate.toDateString()}</p>
                <p style="margin: 4px 0; color: #60a5fa;"><strong>Time:</strong> ${selectedTime}</p>
                <p style="margin: 4px 0;"><strong>Advisor:</strong> ${selectedAdvisor.name} (${selectedAdvisor.email})</p>
                <p style="margin: 4px 0;"><strong>Session Type:</strong> ${selectedMeetingType.name}</p>
              </div>
              <p style="color: #94a3b8; font-size: 13px;">If you need to reschedule, please reply directly to this email or call (717) 847-9638.</p>
            </div>
          `
        })
      });
    } catch (err) {
      console.warn('SMTP confirmation email notification skipped:', err);
    }

    setIsSubmitting(false);
    setStep(4);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 sm:p-8 font-sans selection:bg-blue-500/30">
      <div className="rounded-[24px] overflow-hidden border border-slate-200 bg-white w-full max-w-[900px] shadow-2xl flex flex-col">
        <div className="flex flex-col md:flex-row min-h-[600px]">
          
          {/* LEFT PANEL */}
          <div className="md:w-[32%] bg-[#0c0d12] p-8 flex flex-col justify-between shrink-0">
            <div>
              {/* Logo Box */}
              <div className="mb-8">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#F59E0B] to-amber-600 flex items-center justify-center mb-4 shadow-lg shadow-amber-500/20">
                  <Shield size={20} className="text-white" />
                </div>
                <h2 className="text-[10px] font-black text-slate-400 tracking-[1.5px] uppercase leading-relaxed">
                  New Holland<br />Financial Group
                </h2>
              </div>

              {/* Advisor Card */}
              {selectedAdvisor && (
                <div className="space-y-3">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Selected Advisor</span>
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedAdvisor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedAdvisor.name)}&background=0A62A7&color=fff`}
                      alt={selectedAdvisor.name}
                      className="w-12 h-12 rounded-full object-cover border border-white/10"
                    />
                    <div>
                      <h3 className="font-bold text-white text-sm leading-tight">{selectedAdvisor.name}</h3>
                      <p className="text-[11px] text-[#F59E0B] font-semibold mt-0.5">{selectedAdvisor.advisorCategory || selectedAdvisor.role}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Selected Meeting Summary */}
              <div className="space-y-4 pt-6 mt-6 border-t border-white/10">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Meeting Details</span>
                <div className="space-y-3 text-xs font-medium text-slate-300">
                  <div className="flex items-center gap-3">
                    <Clock size={14} className="text-[#F59E0B] shrink-0" />
                    <span>{selectedMeetingType.duration}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Video size={14} className="text-emerald-400 shrink-0" />
                    <span>Google Meet / Phone</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Globe size={14} className="text-indigo-400 shrink-0" />
                    <span className="truncate">{Intl.DateTimeFormat().resolvedOptions().timeZone.replace(/_/g, ' ')}</span>
                  </div>
                </div>
              </div>

              {/* Selected Date/Time Badge */}
              {selectedDate && selectedTime && (
                <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Scheduled For</span>
                  <p className="font-bold text-sm text-white">{selectedDate.toDateString()}</p>
                  <p className="text-xs font-semibold text-[#F59E0B]">@ {selectedTime}</p>
                </div>
              )}
            </div>

            <div className="pt-8 mt-8 border-t border-white/10 text-slate-500 text-[10px] font-medium leading-relaxed">
              Instant confirmation will be dispatched to your email.
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="md:w-[68%] bg-white p-8 lg:p-10 flex flex-col justify-between relative">
            
            {/* STEP 1 */}
            {step === 1 && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-1">Step 1: Choose Session</h3>
                  <p className="text-slate-500 text-xs font-medium">Select your preferred advisor and consultation type.</p>
                </div>

                <div className="space-y-6">
                  {/* Advisor Selector */}
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">
                      {advisorParam ? "Your Selected Advisor" : "Available Advisors"}
                    </label>
                    <div className={`grid ${advisorParam ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'} gap-3`}>
                      {(advisorParam && selectedAdvisor ? [selectedAdvisor] : activeAdvisors).map(adv => {
                        const isSelected = selectedAdvisor?.id === adv.id;
                        return (
                          <button
                            key={adv.id}
                            onClick={() => !advisorParam && setSelectedAdvisor(adv)}
                            className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                              isSelected
                                ? 'bg-blue-50 border-blue-500 shadow-sm cursor-default ring-1 ring-blue-500'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <img src={adv.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(adv.name)}&background=0A62A7&color=fff`} alt={adv.name} className="w-10 h-10 rounded-full object-cover" />
                            <div className="overflow-hidden">
                              <span className={`font-bold text-xs block truncate ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>{adv.name}</span>
                              <span className={`text-[10px] block truncate ${isSelected ? 'text-blue-600' : 'text-slate-500'}`}>{adv.advisorCategory || adv.role}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Meeting Type Selector */}
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Select Session Type</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {meetingTypes.map(m => {
                        const isSelected = selectedMeetingType.id === m.id;
                        const Icon = m.icon;
                        return (
                          <button
                            key={m.id}
                            onClick={() => setSelectedMeetingType(m)}
                            className={`p-4 rounded-xl border text-left transition-all space-y-2 ${
                              isSelected
                                ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500'
                                : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <Icon size={16} className={isSelected ? 'text-blue-600' : 'text-slate-400'} />
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isSelected ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                                {m.duration}
                              </span>
                            </div>
                            <h4 className={`font-bold text-xs ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>{m.name}</h4>
                            <p className={`text-[11px] leading-relaxed font-medium ${isSelected ? 'text-blue-700/80' : 'text-slate-500'}`}>{m.desc}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setStep(2)}
                    className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-full text-[11px] uppercase tracking-widest transition-all shadow-md flex items-center gap-2"
                  >
                    Next: Date &amp; Time <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in duration-300 flex flex-col h-full">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-1">Step 2: Date &amp; Time</h3>
                    <p className="text-slate-500 text-xs font-medium">Choose an available slot for your appointment.</p>
                  </div>
                  <button onClick={() => setStep(1)} className="text-[11px] font-bold text-slate-400 hover:text-slate-900 uppercase tracking-wider">Back</button>
                </div>

                {/* Calendar */}
                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">
                      {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                    <div className="flex items-center gap-2">
                      <button onClick={handlePrevMonth} className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"><ChevronLeft size={14} /></button>
                      <button onClick={handleNextMonth} className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"><ChevronRight size={14} /></button>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-center">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                      <span key={d} className="text-slate-400 font-bold py-1 text-[9px] uppercase tracking-wider">{d}</span>
                    ))}
                    {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                      <div key={`empty-${i}`} />
                    ))}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const dayNum = i + 1;
                      const dateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), dayNum);
                      const isPast = dateObj < new Date(today.getFullYear(), today.getMonth(), today.getDate());
                      const isSelected = selectedDate?.toDateString() === dateObj.toDateString();

                      return (
                         <button
                           key={dayNum}
                           disabled={isPast}
                           onClick={() => setSelectedDate(dateObj)}
                           className={`py-2 rounded-lg font-bold text-xs transition-all ${
                             isPast
                               ? 'text-slate-300 cursor-not-allowed'
                               : isSelected
                               ? 'bg-slate-900 text-white shadow-md'
                               : 'text-slate-700 hover:bg-slate-100'
                           }`}
                         >
                           {dayNum}
                         </button>
                      );
                    })}
                  </div>
                </div>

                {/* Time Slots */}
                {selectedDate && (
                  <div className="space-y-3">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                      Slots for {selectedDate.toDateString()}
                    </span>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-32 overflow-y-auto pr-1">
                      {availableTimes.map((time) => {
                        const isSelected = selectedTime === time;
                        return (
                          <button
                            key={time}
                            onClick={() => setSelectedTime(time)}
                            className={`py-2 rounded-lg font-bold text-xs transition-all border ${
                              isSelected
                                ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500'
                                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            {time}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="pt-2 flex justify-end mt-auto">
                  <button
                    disabled={!selectedDate || !selectedTime}
                    onClick={() => setStep(3)}
                    className={`px-6 py-3 font-black rounded-full text-[11px] uppercase tracking-widest transition-all flex items-center gap-2 ${
                      selectedDate && selectedTime
                        ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-md'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    Next: Your Details <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-300 flex flex-col h-full justify-between">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-1">Step 3: Details</h3>
                      <p className="text-slate-500 text-xs font-medium">Provide contact info for your calendar invitation.</p>
                    </div>
                    <button type="button" onClick={() => setStep(2)} className="text-[11px] font-bold text-slate-400 hover:text-slate-900 uppercase tracking-wider">Back</button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Email Address *</label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="john@example.com"
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Phone Number</label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="(717) 847-9638"
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Additional Notes</label>
                      <textarea
                        rows={2}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Topics for discussion..."
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-full text-[11px] uppercase tracking-widest transition-all shadow-md shadow-blue-600/20 flex items-center gap-2"
                  >
                    {isSubmitting ? 'Scheduling...' : 'Confirm Appointment'} <CheckCircle2 size={14} />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 4 */}
            {step === 4 && (
              <div className="text-center py-12 space-y-6 animate-in zoom-in-95 duration-500 my-auto">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-sm ring-1 ring-emerald-100">
                  <CheckCircle2 size={32} />
                </div>

                <div>
                  <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">Confirmed!</h3>
                  <p className="text-slate-500 text-sm font-medium max-w-sm mx-auto leading-relaxed">
                    Your session with <strong className="text-slate-900">{selectedAdvisor?.name}</strong> is scheduled.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 max-w-sm mx-auto text-left space-y-2 text-xs">
                  <p><strong className="text-slate-500">Date:</strong> <span className="text-slate-900 font-bold">{selectedDate?.toDateString()}</span></p>
                  <p><strong className="text-slate-500">Time:</strong> <span className="text-slate-900 font-bold">{selectedTime}</span></p>
                  <p><strong className="text-slate-500">Advisor:</strong> <span className="text-slate-900 font-bold">{selectedAdvisor?.name}</span></p>
                  <p><strong className="text-slate-500">Session:</strong> <span className="text-slate-900 font-bold">{selectedMeetingType.name}</span></p>
                </div>

                <div className="pt-4 flex justify-center gap-3">
                  <Link
                    to="/"
                    className="px-6 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-full text-[11px] uppercase tracking-widest transition-all"
                  >
                    Home
                  </Link>
                  <Link
                    to="/products"
                    className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-full text-[11px] uppercase tracking-widest transition-all shadow-md"
                  >
                    Solutions
                  </Link>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* BOTTOM BAND */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 text-center text-[10px] text-slate-400 font-bold tracking-widest uppercase">
          CONFIDENTIALITY NOTICE: Secure &amp; Encrypted Booking Portal
        </div>
      </div>
    </div>
  );
};
