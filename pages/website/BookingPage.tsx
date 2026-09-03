import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { Calendar as CalendarIcon, Clock, User, Mail, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Backend } from '../../services/apiBackend';

export const BookingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });

  // Generate 7 days starting from currentDate
  const days = Array.from({ length: 7 }).map((_, i) => addDays(currentDate, i));

  // Generate time slots (9 AM to 5 PM)
  const timeSlots = Array.from({ length: 16 }).map((_, i) => {
    const hour = Math.floor(i / 2) + 9;
    const minute = i % 2 === 0 ? '00' : '30';
    return `${hour.toString().padStart(2, '0')}:${minute}:00`;
  });

  const fetchAvailability = async (date: Date) => {
    if (!id) return;
    setIsLoading(true);
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const data = await Backend.getPublicAvailability(id, dateStr);
      setBookedTimes(data.bookedTimes.map((t: any) => t.time));
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateSelect = (d: Date) => {
    setSelectedDate(d);
    setSelectedTime(null);
    fetchAvailability(d);
  };

  const handleTimeSelect = (t: string) => {
    setSelectedTime(t);
  };

  const handleNext = () => {
    if (step === 1 && selectedDate && selectedTime) {
      setStep(2);
    }
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !selectedDate || !selectedTime) return;
    setIsLoading(true);
    try {
      const [hour, minute] = selectedTime.split(':');
      let endHour = parseInt(hour);
      let endMinute = parseInt(minute) + 30;
      if (endMinute >= 60) {
        endHour += 1;
        endMinute -= 60;
      }
      const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}:00`;

      await Backend.bookPublicEvent({
        advisorId: id,
        name: formData.name,
        email: formData.email,
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: selectedTime,
        endTime
      });
      setStep(3);
    } catch (err) {
      console.error(err);
      alert('Failed to book meeting. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col md:flex-row min-h-[600px]"
      >
        {/* Left Side: Info */}
        <div className="md:w-1/3 bg-slate-900 p-10 text-white flex flex-col">
          <div className="mb-auto">
            <h1 className="text-3xl font-black mb-2 tracking-tight">NHFG</h1>
            <p className="text-slate-400 font-medium">New Holland Financial Group</p>
          </div>
          
          <div className="space-y-6 my-12">
            <h2 className="text-2xl font-bold">Schedule an Advisory Session</h2>
            <div className="flex items-center gap-3 text-slate-300">
              <Clock className="w-5 h-5 text-blue-400" />
              <span>30 Minute Session</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <CalendarIcon className="w-5 h-5 text-blue-400" />
              <span>
                {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
                {selectedTime && ` at ${format(new Date(\`2000-01-01T\${selectedTime}\`), 'h:mm a')}`}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Flow */}
        <div className="md:w-2/3 p-10 bg-white">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full flex flex-col"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-extrabold text-slate-900">Select Date & Time</h3>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setCurrentDate(addDays(currentDate, -7))}
                      className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-slate-600"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => setCurrentDate(addDays(currentDate, 7))}
                      className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-slate-600"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Date Picker row */}
                <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
                  {days.map(d => {
                    const isSelected = selectedDate && isSameDay(d, selectedDate);
                    return (
                      <button
                        key={d.toISOString()}
                        onClick={() => handleDateSelect(d)}
                        className={\`flex-shrink-0 w-16 h-20 rounded-2xl flex flex-col items-center justify-center border-2 transition-all \${
                          isSelected 
                            ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm' 
                            : 'border-slate-100 bg-white hover:border-slate-300 text-slate-600'
                        }\`}
                      >
                        <span className="text-xs font-bold uppercase mb-1">{format(d, 'EEE')}</span>
                        <span className="text-xl font-black">{format(d, 'd')}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Time Slots grid */}
                <div className="flex-1">
                  {selectedDate ? (
                    isLoading ? (
                      <div className="h-full flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-3">
                        {timeSlots.map(time => {
                          const isBooked = bookedTimes.includes(time);
                          const isSelected = selectedTime === time;
                          return (
                            <button
                              key={time}
                              disabled={isBooked}
                              onClick={() => handleTimeSelect(time)}
                              className={\`py-3 px-4 rounded-xl font-bold text-sm transition-all \${
                                isBooked
                                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-50'
                                  : isSelected
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                                    : 'bg-white border-2 border-slate-100 text-slate-700 hover:border-blue-600 hover:text-blue-600'
                              }\`}
                            >
                              {format(new Date(\`2000-01-01T\${time}\`), 'h:mm a')}
                            </button>
                          );
                        })}
                      </div>
                    )
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-400 font-medium">
                      Select a date to view available times
                    </div>
                  )}
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    disabled={!selectedDate || !selectedTime}
                    onClick={handleNext}
                    className="px-8 py-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-black rounded-xl transition-colors shadow-lg"
                  >
                    Continue →
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
                className="h-full flex flex-col justify-center"
              >
                <button 
                  onClick={() => setStep(1)}
                  className="self-start mb-8 text-sm font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                
                <h3 className="text-2xl font-extrabold text-slate-900 mb-8">Your Details</h3>
                
                <form onSubmit={handleBook} className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        required
                        type="text"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-slate-50 border-2 border-slate-200 focus:border-blue-600 focus:bg-white rounded-xl py-4 pl-12 pr-4 font-semibold text-slate-900 transition-colors outline-none"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        required
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-slate-50 border-2 border-slate-200 focus:border-blue-600 focus:bg-white rounded-xl py-4 pl-12 pr-4 font-semibold text-slate-900 transition-colors outline-none"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 mt-8 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 text-white font-black rounded-xl shadow-lg shadow-blue-500/30 transition-all flex justify-center items-center"
                  >
                    {isLoading ? (
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      'Confirm Booking'
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full flex flex-col items-center justify-center text-center px-4"
              >
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-4">You're Scheduled!</h3>
                <p className="text-slate-500 font-medium mb-8 max-w-sm">
                  Your meeting has been confirmed. A calendar invitation has been sent to your email address.
                </p>
                <button
                  onClick={() => window.location.href = '/'}
                  className="px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black rounded-xl transition-colors"
                >
                  Return Home
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
