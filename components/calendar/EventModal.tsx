import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar as CalendarIcon, AlertCircle, CheckCircle2, Coffee } from 'lucide-react';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  isReadOnly: boolean;
  editingId: string | null;
  formData: any;
  setFormData: (data: any) => void;
  handleSubmit: (e: React.FormEvent) => void;
  handleDelete: () => void;
  animConfig: any;
  user: any;
  todayStr: string;
}

export const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  isReadOnly,
  editingId,
  formData,
  setFormData,
  handleSubmit,
  handleDelete,
  animConfig,
  user,
  todayStr
}) => {
  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col bg-white overflow-y-auto no-scrollbar"
    >
      <motion.div 
        initial={animConfig.modal.initial}
        animate={animConfig.modal.animate}
        exit={animConfig.modal.exit}
        transition={animConfig.modal.transition}
        className="flex-1 flex flex-col w-full"
      >
        <div className="flex items-center justify-between px-10 py-8 border-b border-slate-100 bg-white sticky top-0 z-10 shadow-sm">
          <button onClick={onClose} className="flex items-center gap-3 text-slate-800 hover:text-blue-600 transition-all font-black text-sm uppercase tracking-widest group">
            <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" /> Back
          </button>
          <h3 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">
            {editingId ? 'Event Details' : 'Create New Calendar Entry'}
          </h3>
          <div className="w-16" />
        </div>

        <div className="flex-1 w-full max-w-4xl mx-auto px-8 py-16 pb-32">
          <form onSubmit={handleSubmit} className="space-y-12">
            <div>
              <label className="block text-[11px] font-black text-slate-400 uppercase mb-4 ml-2 tracking-[0.2em]">Title / Description</label>
              <input 
                type="text" required autoFocus disabled={isReadOnly || formData.type === 'off-day'}
                className="w-full bg-slate-50 border border-slate-200 rounded-[2.5rem] px-10 py-8 text-2xl font-black focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-slate-200 shadow-inner disabled:opacity-70"
                placeholder={formData.type === 'off-day' ? "Advisor Out of Office" : "e.g. Portfolio Strategy Review"}
                value={formData.type === 'off-day' ? `${user?.name} Off-Day` : formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase mb-4 ml-2 tracking-[0.2em]">
                  {formData.type === 'off-day' ? 'Start Date' : 'Event Date'}
                </label>
                <input type="date" required min={todayStr} disabled={isReadOnly}
                  className="w-full bg-slate-50 border border-slate-200 rounded-[2.5rem] px-8 py-6 text-xl font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-inner disabled:opacity-70"
                  value={formData.startDate}
                  onChange={e => setFormData({...formData, startDate: e.target.value, endDate: e.target.value > formData.endDate ? e.target.value : formData.endDate})}
                />
              </div>
              {formData.type === 'off-day' && (
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase mb-4 ml-2 tracking-[0.2em]">End Date (Until)</label>
                  <input type="date" required min={formData.startDate} disabled={isReadOnly}
                    className="w-full bg-slate-50 border border-slate-200 rounded-[2.5rem] px-8 py-6 text-xl font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-inner"
                    value={formData.endDate}
                    onChange={e => setFormData({...formData, endDate: e.target.value})}
                  />
                </div>
              )}
              {formData.type !== 'off-day' && (
                  <>
                    <div>
                        <label className="block text-[11px] font-black text-slate-400 uppercase mb-4 ml-2 tracking-[0.2em]">Start Time</label>
                        <input type="time" required disabled={isReadOnly}
                            className="w-full bg-slate-50 border border-slate-200 rounded-[2.5rem] px-8 py-6 text-xl font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-300 transition-all shadow-inner"
                            value={formData.time}
                            onChange={e => setFormData({...formData, time: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-[11px] font-black text-slate-400 uppercase mb-4 ml-2 tracking-[0.2em]">End Time</label>
                        <input type="time" required disabled={isReadOnly}
                            className="w-full bg-slate-50 border border-slate-200 rounded-[2.5rem] px-8 py-6 text-xl font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-300 transition-all shadow-inner"
                            value={formData.endTime}
                            onChange={e => setFormData({...formData, endTime: e.target.value})}
                        />
                    </div>
                  </>
              )}
            </div>

            {formData.type === 'meeting' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div>
                      <label className="block text-[11px] font-black text-slate-400 uppercase mb-4 ml-2 tracking-[0.2em]">Meeting Link</label>
                      <input 
                          type="url" 
                          disabled={isReadOnly}
                          className="w-full bg-slate-50 border border-slate-200 rounded-[2.5rem] px-8 py-6 text-lg font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-inner"
                          placeholder="https://meet.google.com/..."
                          value={formData.meetingLink}
                          onChange={e => setFormData({...formData, meetingLink: e.target.value})}
                      />
                  </div>
                  <div>
                      <label className="block text-[11px] font-black text-slate-400 uppercase mb-4 ml-2 tracking-[0.2em]">Participants (Comma Separated)</label>
                      <input 
                          type="text" 
                          disabled={isReadOnly}
                          className="w-full bg-slate-50 border border-slate-200 rounded-[2.5rem] px-8 py-6 text-lg font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-inner"
                          placeholder="John Doe, Jane Smith..."
                          value={formData.participants}
                          onChange={e => setFormData({...formData, participants: e.target.value})}
                      />
                  </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-black text-slate-400 uppercase mb-8 ml-2 tracking-[0.2em]">Classification</label>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                  {[
                    { id: 'meeting', icon: CalendarIcon, label: 'Meeting', active: 'border-emerald-600 text-emerald-600 ring-emerald-50' },
                    { id: 'reminder', icon: AlertCircle, label: 'Reminder', active: 'border-amber-400 text-amber-500 ring-amber-50' },
                    { id: 'task', icon: CheckCircle2, label: 'Task', active: 'border-blue-600 text-blue-600 ring-blue-50' },
                    { id: 'off-day', icon: Coffee, label: 'Off Day', active: 'border-rose-600 text-rose-600 ring-rose-50' }
                  ].map(type => (
                      <button
                          key={type.id}
                          type="button"
                          disabled={isReadOnly}
                          onClick={() => setFormData({...formData, type: type.id as any})}
                          className={`flex flex-col items-center justify-center gap-5 py-12 rounded-[4rem] border-2 transition-all group relative overflow-hidden
                              ${formData.type === type.id ? `bg-white ${type.active} shadow-2xl scale-105 z-10 ring-8` : 'bg-slate-50 border-transparent text-slate-400 hover:border-slate-200 hover:bg-white'}
                              ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}
                          `}
                      >   
                          <type.icon className={`h-12 w-12 transition-transform duration-500 group-hover:scale-110`} />
                          <div className="text-center">
                              <span className="block text-[11px] font-black uppercase tracking-[0.25em]">{type.label}</span>
                              <span className="text-[9px] font-bold opacity-60 uppercase tracking-widest mt-1">
                                  {(type.id === 'reminder' || type.id === 'task') ? 'Private' : 'Public'}
                              </span>
                          </div>
                      </button>
                  ))}
              </div>
            </div>

            <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase mb-4 ml-2 tracking-[0.2em]">Additional Notes</label>
                <textarea 
                    disabled={isReadOnly}
                    className="w-full bg-slate-50 border border-slate-200 rounded-[2.5rem] px-8 py-6 text-lg font-medium outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-inner min-h-[150px]"
                    placeholder="Add any details, agenda items, or notes here..."
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                />
            </div>

            <div className="flex items-center gap-4 pt-8">
                {editingId && !isReadOnly && (
                    <>
                        <button 
                            type="button"
                            onClick={handleDelete}
                            className="px-6 py-5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-full font-black uppercase tracking-widest text-xs transition-all border border-rose-100 hover:border-rose-200"
                        >
                            Delete
                        </button>
                        <button 
                            type="button"
                            onClick={() => setFormData({ ...formData, status: formData.status === 'canceled' ? 'scheduled' : 'canceled' })}
                            className={`px-6 py-5 rounded-full font-black uppercase tracking-widest text-xs transition-all border ${
                                formData.status === 'canceled' 
                                ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-100' 
                                : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border-slate-200'
                            }`}
                        >
                            {formData.status === 'canceled' ? 'Restore Event' : 'Cancel Event'}
                        </button>
                    </>
                )}
                <div className="flex-1" />
                <button 
                    type="button"
                    onClick={onClose}
                    className="px-10 py-5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-full font-black uppercase tracking-widest text-xs transition-all"
                >
                    Close
                </button>
                {!isReadOnly && (
                    <button 
                        type="submit"
                        className="px-12 py-5 bg-blue-600 text-white hover:bg-blue-700 rounded-full font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-blue-600/20 hover:scale-105 active:scale-95"
                    >
                        {editingId ? 'Save Changes' : 'Create Event'}
                    </button>
                )}
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};
