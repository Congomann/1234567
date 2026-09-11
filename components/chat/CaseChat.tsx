
import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../../context/DataContext';
import { chatService, ChatMessage, ChatChannel, CaseNote } from '../../services/chatService';
import { ChatInput } from './ChatInput';
import { UserRole } from '../../types';
import { MessageSquare, ShieldAlert, Activity, Clock, Plus, Trash2, Pill, Stethoscope, ChevronDown, ChevronUp } from 'lucide-react';

interface CaseChatProps {
    caseId: string;
    clientName: string;
}

export const CaseChat: React.FC<CaseChatProps> = ({ caseId, clientName }) => {
    const { user } = useData();
    const [channel, setChannel] = useState<ChatChannel | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [notes, setNotes] = useState<CaseNote[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNotes, setShowNotes] = useState(true);
    const messageEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        init();
    }, [caseId]);

    const init = async () => {
        setLoading(true);
        try {
            const ch = await chatService.getOrCreateCaseChat(caseId);
            setChannel(ch);
            const [msgs, nt] = await Promise.all([
                chatService.getMessages(ch.id),
                chatService.getCaseNotes(caseId)
            ]);
            setMessages(msgs);
            setNotes(nt);
        } catch (err) {
            console.error('Case Chat Init Error', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async (content: string, metadata?: any) => {
        if (!channel) return;
        try {
            const msg = await chatService.sendMessage(channel.id, content, metadata);
            setMessages(prev => [...prev, msg]);
            messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        } catch (err) {
            console.error('Send Error', err);
        }
    };

    const handleAddNote = async () => {
        const note = prompt("Enter Underwriting Note:");
        if (!note) return;
        try {
            const newNote = await chatService.addCaseNote(caseId, 'underwriting', note);
            setNotes(prev => [newNote, ...prev]);
        } catch (err) {
            alert("Permission Denied: Only Underwriting staff can add specialized notes.");
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 animate-pulse">
            <ShieldAlert size={48} className="text-slate-100 mb-4" />
            <div className="h-4 w-32 bg-slate-100 rounded"></div>
        </div>
    );

    return (
        <div className="flex flex-col lg:flex-row gap-8 h-[600px]">
            {/* Chat Section */}
            <div className="flex-1 flex flex-col bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-50 bg-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg">
                            <MessageSquare size={18} />
                        </div>
                        <div>
                            <h4 className="text-sm font-black text-[#0B2240] uppercase tracking-tighter">Underwriting Chat</h4>
                            <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Direct line to Sub-Admin</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar bg-white">
                    {messages.length === 0 && (
                        <div className="text-center py-20 text-slate-300">
                            <ShieldAlert className="mx-auto mb-4 opacity-20" size={40} />
                            <p className="text-xs font-bold uppercase tracking-widest">No communication log for this case</p>
                        </div>
                    )}
                    {messages.map((m) => {
                        const isMe = m.sender_id === user?.id;
                        return (
                            <div key={m.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`max-w-[80%] space-y-1 ${isMe ? 'items-end' : 'items-start'}`}>
                                    <div className={`p-4 rounded-2xl text-xs font-semibold leading-relaxed ${isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-100 text-slate-700 rounded-tl-none border border-slate-200'}`}>
                                        {m.content}
                                    </div>
                                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">
                                        {m.sender_name} • {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messageEndRef} />
                </div>

                <ChatInput
                    onSend={handleSendMessage}
                    userRole={user?.role as UserRole}
                    isSubAdminInChannel={true}
                    channelType="case_chat"
                />
            </div>

            {/* Structured Notes Section */}
            <div className="w-full lg:w-80 flex flex-col gap-6">
                <div className="bg-[#0B2240] rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
                    <Activity className="absolute -right-6 -top-6 text-white/10" size={120} />
                    <div className="relative z-10">
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-4 text-blue-400">Medical Intelligence</h4>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                                <Stethoscope size={24} className="text-blue-300" />
                            </div>
                            <div>
                                <p className="text-xl font-black tracking-tight">{notes.filter(n => n.note_type === 'medical').length}</p>
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Critical Alerts</p>
                            </div>
                        </div>
                        <button
                            onClick={handleAddNote}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-500/20"
                        >
                            + LOG UNDERWRITING NOTE
                        </button>
                    </div>
                </div>

                <div className="flex-1 bg-slate-50 rounded-[2.5rem] border border-slate-200 p-6 overflow-y-auto no-scrollbar shadow-inner">
                    <div className="flex items-center justify-between mb-6">
                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Case Feed</h5>
                        <button onClick={() => setShowNotes(!showNotes)} className="text-slate-400 hover:text-blue-600">
                            {showNotes ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                    </div>

                    {showNotes && (
                        <div className="space-y-4">
                            {notes.length === 0 && (
                                <p className="text-[10px] font-bold text-slate-300 italic text-center py-10 uppercase tracking-widest">No clinical notes recorded</p>
                            )}
                            {notes.map(note => (
                                <div key={note.id} className={`p-4 rounded-2xl border ${note.note_type === 'medical' ? 'bg-orange-50 border-orange-100' : 'bg-white border-slate-100'} shadow-sm`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        {note.note_type === 'medical' ? <Pill size={12} className="text-orange-500" /> : <Clock size={12} className="text-slate-400" />}
                                        <span className={`text-[9px] font-black uppercase tracking-widest ${note.note_type === 'medical' ? 'text-orange-600' : 'text-slate-400'}`}>
                                            {note.note_type}
                                        </span>
                                    </div>
                                    <p className={`text-xs font-bold leading-relaxed mb-3 ${note.note_type === 'medical' ? 'text-orange-900' : 'text-slate-700'}`}>
                                        {note.content}
                                    </p>
                                    <div className="flex justify-between items-center opacity-60">
                                        <span className="text-[8px] font-black uppercase text-slate-400">{note.author_name}</span>
                                        <span className="text-[8px] font-bold text-slate-400 uppercase">{new Date(note.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
