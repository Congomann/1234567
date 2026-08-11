import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
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
  const advisorParam = searchParams.get('advisor') || searchParams.get('advisor_id') || searchParams.get('agent');

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
    <div className="min-h-screen bg-[#050A14] text-white pt-32 pb-20 font-sans relative overflow-hidden selection:bg-blue-500/30">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-black uppercase tracking-widest mb-4">
            <Sparkles size={14} /> Official Advisor Booking Portal
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight uppercase mb-4">
            Schedule <span className="text-blue-500">Consultation.</span>
          </h1>
          <p className="text-slate-400 text-base font-medium leading-relaxed">
            Select an advisor, pick your meeting type, and choose an available date &amp; time slot.
          </p>
        </div>

        {/* Main Card Container */}
        <div className="bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
          
          {/* LEFT SIDEBAR: Selected Advisor Profile & Summary */}
          <div className="lg:col-span-4 bg-slate-950 p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col justify-between">
            <div className="space-y-6">
              
              {/* Advisor Card */}
              {selectedAdvisor ? (
                <div className="space-y-4">
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest block">Selected Advisor</span>
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                    <img
                      src={selectedAdvisor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedAdvisor.name)}&background=0A62A7&color=fff`}
                      alt={selectedAdvisor.name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-blue-500/50 shadow-md"
                    />
                    <div>
                      <h3 className="font-bold text-white text-base leading-tight">{selectedAdvisor.name}</h3>
                      <p className="text-xs text-blue-400 font-semibold mt-0.5">{selectedAdvisor.advisorCategory || selectedAdvisor.role}</p>
                      <p className="text-[11px] text-slate-400 font-medium mt-1">{selectedAdvisor.phone || '(717) 847-9638'}</p>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Selected Meeting Summary */}
              <div className="space-y-4 pt-4 border-t border-white/10">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Meeting Summary</span>
                <div className="space-y-3 text-xs font-semibold text-slate-300">
                  <div className="flex items-center gap-3">
                    <Clock size={16} className="text-blue-400 shrink-0" />
                    <span>{selectedMeetingType.duration} ({selectedMeetingType.name})</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Video size={16} className="text-emerald-400 shrink-0" />
                    <span>Google Meet Video / Direct Phone Call</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Globe size={16} className="text-indigo-400 shrink-0" />
                    <span>{Intl.DateTimeFormat().resolvedOptions().timeZone.replace(/_/g, ' ')} Time Zone</span>
                  </div>
                </div>
              </div>

              {/* Selected Date/Time Badge */}
              {selectedDate && selectedTime && (
                <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-300 space-y-1">
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest block">Scheduled For</span>
                  <p className="font-bold text-sm text-white">{selectedDate.toDateString()}</p>
                  <p className="text-xs font-semibold text-blue-300">@ {selectedTime}</p>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-white/10 text-slate-500 text-[11px] font-medium leading-relaxed">
              Instant email confirmation dispatched upon completion.
            </div>
          </div>

          {/* RIGHT SIDE: 4-STEP INTERACTIVE BOOKING FLOW */}
          <div className="lg:col-span-8 p-8 lg:p-12 flex flex-col justify-between">
            
            {/* STEP 1: SELECT ADVISOR & MEETING TYPE */}
            {step === 1 && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Step 1: Choose Advisor &amp; Session</h3>
                  <p className="text-slate-400 text-xs font-medium">Select your preferred advisor and the type of consultation you require.</p>
                </div>

                {/* Advisor Selector Grid */}
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Available Advisors</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeAdvisors.map(adv => {
                      const isSelected = selectedAdvisor?.id === adv.id;
                      return (
                        <button
                          key={adv.id}
                          onClick={() => setSelectedAdvisor(adv)}
                          className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all ${
                            isSelected
                              ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg'
                              : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                          }`}
                        >
                          <img src={adv.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(adv.name)}&background=0A62A7&color=fff`} alt={adv.name} className="w-10 h-10 rounded-full object-cover" />
                          <div className="overflow-hidden">
                            <span className="font-bold text-xs block text-white truncate">{adv.name}</span>
                            <span className="text-[10px] text-slate-400 block truncate">{adv.advisorCategory || adv.role}</span>
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
                          className={`p-4 rounded-2xl border text-left transition-all space-y-2 ${
                            isSelected
                              ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg'
                              : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <Icon size={18} className={isSelected ? 'text-blue-400' : 'text-slate-400'} />
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-slate-300">{m.duration}</span>
                          </div>
                          <h4 className="font-bold text-xs text-white">{m.name}</h4>
                          <p className="text-[11px] text-slate-400 leading-relaxed font-medium">{m.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={() => setStep(2)}
                    className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-full text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2"
                  >
                    Continue to Date &amp; Time <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: DATE & TIME PICKER */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-1">Step 2: Select Date &amp; Time</h3>
                    <p className="text-slate-400 text-xs font-medium">Choose an available date and time slot for your appointment.</p>
                  </div>
                  <button onClick={() => setStep(1)} className="text-xs text-slate-400 hover:text-white underline">Back</button>
                </div>

                {/* Calendar Month Navigation */}
                <div className="bg-white/5 border border-white/10 p-6 rounded-3xl space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white">
                      {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                    <div className="flex items-center gap-2">
                      <button onClick={handlePrevMonth} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white"><ChevronLeft size={16} /></button>
                      <button onClick={handleNextMonth} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white"><ChevronRight size={16} /></button>
                    </div>
                  </div>

                  {/* Days Grid */}
                  <div className="grid grid-cols-7 gap-2 text-center text-xs">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                      <span key={d} className="text-slate-500 font-bold py-1 text-[10px] uppercase">{d}</span>
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
                          className={`py-3 rounded-xl font-bold text-xs transition-all ${
                            isPast
                              ? 'text-slate-700 cursor-not-allowed'
                              : isSelected
                              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/40 scale-105 font-black'
                              : 'text-slate-300 hover:bg-white/10'
                          }`}
                        >
                          {dayNum}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Time Slots Grid */}
                {selectedDate && (
                  <div className="space-y-3">
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest block">
                      Available Time Slots for {selectedDate.toDateString()}
                    </span>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-40 overflow-y-auto pr-1">
                      {availableTimes.map((time) => {
                        const isSelected = selectedTime === time;
                        return (
                          <button
                            key={time}
                            onClick={() => setSelectedTime(time)}
                            className={`py-2.5 rounded-xl font-bold text-xs transition-all ${
                              isSelected
                                ? 'bg-blue-600 text-white border border-blue-400 shadow-md'
                                : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10'
                            }`}
                          >
                            {time}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="pt-4 flex justify-between items-center">
                  <button onClick={() => setStep(1)} className="text-xs text-slate-400 hover:text-white">Back to Advisor</button>
                  <button
                    disabled={!selectedDate || !selectedTime}
                    onClick={() => setStep(3)}
                    className={`px-8 py-4 font-black rounded-full text-xs uppercase tracking-widest transition-all ${
                      selectedDate && selectedTime
                        ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30'
                        : 'bg-white/10 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    Confirm Date &amp; Time <ArrowRight size={14} className="inline ml-1" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: CLIENT DETAILS */}
            {step === 3 && (
              <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-1">Step 3: Client Details</h3>
                    <p className="text-slate-400 text-xs font-medium">Provide your contact details so we can send the meeting invitation.</p>
                  </div>
                  <button type="button" onClick={() => setStep(2)} className="text-xs text-slate-400 hover:text-white underline">Back</button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-medium text-white placeholder:text-slate-500 outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-medium text-white placeholder:text-slate-500 outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="(717) 847-9638"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-medium text-white placeholder:text-slate-500 outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Additional Notes / Topics for Discussion</label>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Please let us know what specific financial, real estate, or freight insurance topic you'd like to discuss..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-medium text-white placeholder:text-slate-500 outline-none focus:border-blue-500 resize-none"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-between items-center">
                  <button type="button" onClick={() => setStep(2)} className="text-xs text-slate-400 hover:text-white">Back to Date</button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-full text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2"
                  >
                    {isSubmitting ? 'Scheduling Meeting...' : 'Confirm Appointment'} <CheckCircle2 size={16} />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 4: CONFIRMATION */}
            {step === 4 && (
              <div className="text-center py-12 space-y-6 animate-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 size={40} />
                </div>

                <div>
                  <h3 className="text-3xl font-black text-white uppercase tracking-tight mb-2">Appointment Confirmed!</h3>
                  <p className="text-slate-400 text-sm font-medium max-w-md mx-auto leading-relaxed">
                    Your discovery session with <strong className="text-white">{selectedAdvisor?.name}</strong> has been scheduled and added to their CRM calendar.
                  </p>
                </div>

                <div className="p-6 rounded-3xl bg-white/5 border border-white/10 max-w-md mx-auto text-left space-y-2 text-xs">
                  <p><strong className="text-slate-400">Date:</strong> <span className="text-white font-bold">{selectedDate?.toDateString()}</span></p>
                  <p><strong className="text-slate-400">Time:</strong> <span className="text-white font-bold">{selectedTime}</span></p>
                  <p><strong className="text-slate-400">Advisor:</strong> <span className="text-white font-bold">{selectedAdvisor?.name}</span> ({selectedAdvisor?.email})</p>
                  <p><strong className="text-slate-400">Session:</strong> <span className="text-white font-bold">{selectedMeetingType.name}</span></p>
                </div>

                <div className="pt-4 flex justify-center gap-4">
                  <Link
                    to="/"
                    className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-full text-xs uppercase tracking-widest transition-all"
                  >
                    Return Home
                  </Link>
                  <Link
                    to="/products"
                    className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-600/30"
                  >
                    Explore Solutions
                  </Link>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};
