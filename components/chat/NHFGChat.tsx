
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { UserRole } from '../../types';
import { chatService, ChatChannel, ChatMessage } from '../../services/chatService';
import { Backend } from '../../services/apiBackend';
import { ChatInput } from './ChatInput';
import { Search, Hash, Users, MessageSquare, Pin, File as FileIcon, Clock, Filter, ChevronLeft, Bell, Info, ShieldCheck, Activity, Trash2, ShieldAlert, Plus } from 'lucide-react';

export const NHFGChat: React.FC = () => {
    const { user, allUsers } = useData();
    const [channels, setChannels] = useState<ChatChannel[]>([]);
    const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState<'all' | 'direct' | 'case' | 'group'>('all');

    const messageEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadChannels();
    }, []);

    useEffect(() => {
        if (activeChannelId) {
            loadMessages(activeChannelId);
        }
    }, [activeChannelId]);

    useEffect(() => {
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const loadChannels = async () => {
        try {
            const data = await chatService.getChannels();
            setChannels(data);
            if (data.length > 0 && !activeChannelId) {
                setActiveChannelId(data[0].id);
            }
        } catch (err) {
            console.error('Failed to load channels', err);
        }
    };

    const loadMessages = async (channelId: string) => {
        setLoading(true);
        try {
            const data = await chatService.getMessages(channelId);
            setMessages(data);
        } catch (err) {
            console.error('Failed to load messages', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async (content: string, metadata?: any) => {
        if (!activeChannelId) return;
        try {
            const newMessage = await chatService.sendMessage(activeChannelId, content, metadata);
            setMessages(prev => [...prev, newMessage]);
        } catch (err) {
            console.error('Failed to send message', err);
            alert("Error sending message. Check restrictions.");
        }
    };

    const activeChannel = useMemo(() =>
        channels.find(c => c.id === activeChannelId),
        [channels, activeChannelId]);

    const isSubAdminInChannel = useMemo(() => {
        // Implementation check: In direct chat with sub-admin OR sub-admin exists in group
        // For simplicity, we can fetch from member roles if available
        // For now, assume if it's a Case Chat, we check user list
        return true; // Advisor must be blocked if Sub-Admin is present
    }, [activeChannelId]);

    const filteredChannels = useMemo(() => {
        return channels.filter(c => {
            const matchesSearch = c.name?.toLowerCase().includes(search.toLowerCase());
            if (activeCategory === 'all') return matchesSearch;
            if (activeCategory === 'direct') return c.type === 'direct' && matchesSearch;
            if (activeCategory === 'case') return c.type === 'case_chat' && matchesSearch;
            if (activeCategory === 'group') return (c.type === 'group' || c.type === 'advisor_channel') && matchesSearch;
            return matchesSearch;
        });
    }, [channels, search, activeCategory]);

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const handleCreateChannel = async () => {
        if (!['Administrator', 'Manager', 'Sub-Admin'].includes(user?.role || '')) {
            alert("Insufficient permissions to create group channels.");
            return;
        }
        const name = prompt("Enter Channel Name (e.g., IUL Advisors):");
        if (!name) return;
        try {
            const channel = await Backend.post<ChatChannel>('/chat/channels', {
                name,
                type: 'advisor_channel',
                product_type: name.split(' ')[0] // Simple auto-link
            });
            setChannels(prev => [...prev, channel]);
            alert(`Channel "${name}" created successfully!`);
        } catch (err) {
            console.error('Failed to create channel', err);
            alert("Failed to create channel. Please ensure you have administrative permissions.");
        }
    };

    const handleInviteMember = async () => {
        if (!activeChannelId) return;
        const input = prompt("Enter Member Email or User ID to invite:");
        if (!input) return;

        try {
            const payload = input.includes('@') ? { email: input } : { userId: input };
            await Backend.post(`/chat/channels/${activeChannelId}/invite`, payload);
            alert(`Invitation sent to ${input}`);
            loadChannels(); // Refresh member lists
        } catch (err) {
            console.error('Invite failed', err);
            alert("Failed to send invite. Limit of 50 members may have been reached.");
        }
    };

    const isAdmin = ['Administrator', 'Manager', 'Sub-Admin'].includes(user?.role || '');

    return (
        <div className="h-full flex bg-slate-50/50 rounded-[3rem] overflow-hidden border border-slate-200 shadow-xl relative backdrop-blur-3xl">
            {/* Sidebar */}
            <div className={`w-80 flex flex-col border-r border-slate-100 bg-white/60 backdrop-blur-md transition-all`}>
                <div className="p-8 pb-4">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-black text-[#0B2240] tracking-tighter uppercase leading-none">Internal DM</h2>
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,1)]"></div>
                    </div>

                    <div className="relative group mb-6">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="Find discussion..."
                            className="w-full bg-slate-100/50 hover:bg-slate-100/80 border border-transparent focus:border-blue-200 focus:bg-white rounded-2xl py-3 pl-10 pr-4 text-[11px] font-black uppercase tracking-widest outline-none transition-all placeholder:text-slate-400"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar">
                        {['all', 'direct', 'case', 'group'].map((cat: any) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeCategory === cat ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-8 no-scrollbar">
                    {filteredChannels.length === 0 ? (
                        <div className="text-center p-8 text-slate-300 italic text-sm">No activity found</div>
                    ) : (
                        <div className="space-y-2">
                            {filteredChannels.map(c => (
                                <button
                                    key={c.id}
                                    onClick={() => setActiveChannelId(c.id)}
                                    className={`w-full group flex items-center gap-4 p-4 rounded-3xl transition-all ${activeChannelId === c.id ? 'bg-[#0B2240] text-white shadow-2xl scale-[1.02]' : 'hover:bg-white/80 text-slate-600'}`}
                                >
                                    <div className={`h-11 w-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:rotate-6 ${activeChannelId === c.id ? 'bg-blue-500 shadow-lg shadow-blue-500/30' : 'bg-slate-100 text-slate-400'}`}>
                                        {c.type === 'direct' ? <MessageSquare size={18} /> : c.type === 'case_chat' ? <Activity size={18} /> : <Hash size={18} />}
                                    </div>
                                    <div className="flex-1 text-left overflow-hidden">
                                        <span className={`block text-[11px] font-black uppercase tracking-widest mb-0.5 truncate ${activeChannelId === c.id ? 'text-blue-300' : 'text-slate-400'}`}>
                                            {c.type.replace('_', ' ')}
                                        </span>
                                        <span className="block text-sm font-bold truncate leading-tight">{c.name || 'Personal Thread'}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {isAdmin && (
                    <div className="p-6 border-t border-slate-100">
                        <button
                            onClick={handleCreateChannel}
                            className="w-full py-4 bg-[#0B2240] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-900 transition-colors shadow-lg"
                        >
                            INITIATE NEW CHANNEL +
                        </button>
                    </div>
                )}
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col h-full bg-white">
                {activeChannel ? (
                    <>
                        <header className="h-24 px-10 flex items-center justify-between border-b border-slate-50 bg-white/50 backdrop-blur-md">
                            <div className="flex items-center gap-6">
                                <div className="h-14 w-14 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
                                    {activeChannel.type === 'case_chat' ? <ShieldAlert size={28} /> : <Users size={28} />}
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-[#0B2240] tracking-tighter leading-tight">{activeChannel.name}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            {activeChannel.member_count || 1} {activeChannel.member_count === 1 ? 'Member' : 'Members'} • {messages.length} Events Logged
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                {activeChannel.type !== 'direct' && (
                                    <button 
                                        onClick={handleInviteMember}
                                        className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                                    >
                                        <Plus size={14} /> Invite External
                                    </button>
                                )}
                                <button className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:text-blue-600 transition-colors"><Pin size={18} /></button>
                                <button className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:text-blue-600 transition-colors"><Search size={18} /></button>
                                <button className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:text-blue-600 transition-colors"><Info size={18} /></button>
                            </div>
                        </header>

                        <div className="flex-1 overflow-y-auto px-10 py-10 space-y-10 no-scrollbar">
                            {messages.map((m, idx) => {
                                const isMe = m.sender_id === user?.id;
                                return (
                                    <div key={m.id} className={`flex gap-4 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <div className={`h-11 w-11 rounded-3xl flex-shrink-0 overflow-hidden border-2 border-white shadow-xl ${isMe ? '-rotate-3' : 'rotate-3'}`}>
                                            <img src={m.sender_avatar || `https://ui-avatars.com/api/?name=${m.sender_name}&background=f1f5f9&color=64748b`} className="h-full w-full object-cover" />
                                        </div>
                                        <div className={`max-w-[70%] space-y-2 ${isMe ? 'items-end' : 'items-start'}`}>
                                            <div className={`flex items-center gap-3 mb-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                                <span className="text-[10px] font-black text-[#0B2240] uppercase tracking-widest">{m.sender_name}</span>
                                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">{formatTime(m.created_at)}</span>
                                                <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase text-white ${m.sender_role === 'Sub-Admin' ? 'bg-orange-500' : 'bg-blue-500'}`}>{m.sender_role}</span>
                                            </div>
                                            <div className={`p-5 rounded-[2rem] shadow-sm relative ${isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-100 text-slate-700 rounded-tl-none border border-slate-200/50'}`}>
                                                <p className="text-sm font-medium leading-relaxed">{m.content}</p>
                                                {m.metadata?.suggestedCarrier && (
                                                    <div className="mt-3 bg-white/20 p-3 rounded-2xl border border-white/20 flex items-center gap-3">
                                                        <ShieldCheck size={16} />
                                                        <span className="text-[11px] font-bold uppercase tracking-wider italic">Proposed Carrier: {m.metadata.suggestedCarrier}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messageEndRef} />
                        </div>

                        <ChatInput
                            onSend={handleSendMessage}
                            userRole={user?.role as UserRole}
                            isSubAdminInChannel={isSubAdminInChannel}
                            channelType={activeChannel.type}
                        />
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-300 bg-white/50 backdrop-blur-3xl">
                        <div className="h-32 w-32 rounded-[3.5rem] bg-white shadow-2xl flex items-center justify-center mb-8 border border-slate-100 animate-pulse">
                            <MessageSquare size={60} className="text-slate-100" />
                        </div>
                        <h4 className="text-2xl font-black text-slate-400 uppercase tracking-tighter mb-2">Secure Communications</h4>
                        <p className="text-sm font-bold text-slate-300 uppercase tracking-widest">Select a prioritized briefing to begin</p>
                    </div>
                )}
            </div>

            {/* Right Details Sidebar (Optional / Case Notes) */}
            {activeChannel?.type === 'case_chat' && (
                <div className="w-80 border-l border-slate-100 bg-white p-8 overflow-y-auto no-scrollbar">
                    <div className="mb-10">
                        <h3 className="text-xs font-black text-[#0B2240] uppercase tracking-widest mb-6 flex items-center gap-2">
                            <ShieldCheck size={14} className="text-blue-500" /> Case Management
                        </h3>
                        <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Internal Status</span>
                            <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]"></div>
                                <span className="text-sm font-black text-slate-700 uppercase tracking-tight">Underwriting Review</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div>
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Underwriting Notes</h4>
                            {/* Placeholder for real notes fetching */}
                            <div className="p-5 bg-orange-50 border border-orange-100 rounded-3xl relative overflow-hidden group">
                                <Activity className="absolute -right-4 -top-4 text-orange-200 opacity-20 group-hover:rotate-12 transition-transform" size={80} />
                                <span className="block text-[9px] font-black text-orange-600 uppercase tracking-widest mb-2">Medical History Update</span>
                                <p className="text-xs font-bold text-orange-800 leading-relaxed mb-4">Patient currently prescribed Lisinopril for high blood pressure. Carrier reconsideration required.</p>
                                <span className="text-[9px] font-bold text-orange-400 tracking-tighter uppercase">Logged by Sub-Admin • 2h ago</span>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Documents</h4>
                            <div className="space-y-2">
                                {['Application_Draft.pdf', 'Med_Records_Release.pdf'].map(doc => (
                                    <div key={doc} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-colors cursor-pointer group">
                                        <div className="p-2 bg-white rounded-xl text-slate-400 group-hover:text-blue-500 transition-colors shadow-sm"><FileIcon size={14} /></div>
                                        <span className="text-[10px] font-black text-slate-600 truncate uppercase tracking-wider">{doc}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
