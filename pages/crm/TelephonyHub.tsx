import React, { useState, useEffect } from 'react';
import { 
  Phone, PhoneCall, PhoneOff, Mic, MicOff, MessageSquare, Send, Bot, 
  Users, Play, Pause, Sparkles, Shield, CheckCircle2, AlertCircle, 
  ArrowUpRight, RefreshCw, Radio, Volume2
} from 'lucide-react';
import { SEO } from '../../components/SEO';

interface Extension {
  id: string;
  advisor_name: string;
  extension: string;
  phone_number: string;
  department: string;
  status: string;
}

interface CallLog {
  id: string;
  call_sid: string;
  direction: string;
  from_number: string;
  to_number: string;
  lead_name: string;
  advisor_extension: string;
  status: string;
  duration_seconds: number;
  recording_url: string;
  transcript: string;
  ai_rating: string;
  ai_qualification_summary: string;
  created_at: string;
}

interface SMSMessage {
  id: string;
  message_sid: string;
  direction: string;
  from_number: string;
  to_number: string;
  lead_name: string;
  message_text: string;
  status: string;
  created_at: string;
}

export const TelephonyHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'softphone' | 'extensions' | 'sms' | 'ai_qualifier' | 'logs'>('softphone');
  
  // Credentials & Telephony State
  const [credentials, setCredentials] = useState<{ spaceUrl: string; projectId: string; phoneNumber: string; status: string } | null>(null);
  const [extensions, setExtensions] = useState<Extension[]>([]);
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [smsHistory, setSmsHistory] = useState<SMSMessage[]>([]);

  // Softphone State
  const [dialNumber, setDialNumber] = useState('');
  const [selectedExtension, setSelectedExtension] = useState('101');
  const [isCalling, setIsCalling] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isRecording, setIsRecording] = useState(true);

  // SMS State
  const [smsRecipient, setSmsRecipient] = useState('+13125550188');
  const [smsRecipientName, setSmsRecipientName] = useState('Jonathan Miller');
  const [smsText, setSmsText] = useState('');

  // AI Calling State
  const [aiLeadName, setAiLeadName] = useState('Jonathan Miller');
  const [aiLeadPhone, setAiLeadPhone] = useState('+13125550188');
  const [isAiCalling, setIsAiCalling] = useState(false);

  // Fetch SignalWire Telephony Data
  const fetchData = async () => {
    try {
      const [credRes, extRes, callsRes, smsRes] = await Promise.all([
        fetch('/api/signalwire/credentials'),
        fetch('/api/signalwire/extensions'),
        fetch('/api/signalwire/calls'),
        fetch('/api/signalwire/sms/history')
      ]);

      if (credRes.ok) setCredentials(await credRes.json());
      if (extRes.ok) setExtensions(await extRes.json());
      if (callsRes.ok) setCallLogs(await callsRes.json());
      if (smsRes.ok) setSmsHistory(await smsRes.json());
    } catch (err) {
      console.error('[TelephonyHub] Data fetch error:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Timer for active calls
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isCalling) {
      timer = setInterval(() => setCallDuration(prev => prev + 1), 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [isCalling]);

  // Handle Softphone Dialing
  const handleKeypadPress = (key: string) => {
    setDialNumber(prev => prev + key);
  };

  const handleStartCall = async () => {
    if (!dialNumber) return;
    setIsCalling(true);
    try {
      await fetch('/api/signalwire/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toNumber: dialNumber,
          leadName: 'Direct Softphone Call',
          advisorExtension: selectedExtension
        })
      });
      fetchData();
    } catch (err) {
      console.error('Call failed:', err);
    }
  };

  const handleEndCall = () => {
    setIsCalling(false);
  };

  // Handle SMS Send
  const handleSendSMS = async () => {
    if (!smsText || !smsRecipient) return;
    try {
      await fetch('/api/signalwire/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toNumber: smsRecipient,
          leadName: smsRecipientName,
          messageText: smsText
        })
      });
      setSmsText('');
      fetchData();
    } catch (err) {
      console.error('SMS send failed:', err);
    }
  };

  // Trigger Outbound AI Lead Qualification Call
  const handleTriggerAiCall = async () => {
    if (!aiLeadPhone) return;
    setIsAiCalling(true);
    try {
      await fetch('/api/signalwire/ai-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toNumber: aiLeadPhone,
          leadName: aiLeadName
        })
      });
      fetchData();
    } catch (err) {
      console.error('AI call failed:', err);
    } finally {
      setIsAiCalling(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getRatingBadge = (rating: string) => {
    switch (rating) {
      case 'Warm':
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 font-extrabold text-xs border border-rose-200">🔥 Warm</span>;
      case 'Mild':
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 font-extrabold text-xs border border-amber-200">🌤️ Mild</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-extrabold text-xs border border-slate-200">❄️ Cold</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-slate-900 pb-20 selection:bg-blue-500/20">
      <SEO />

      {/* HEADER & SIGNALWIRE STATUS (APPLE GLASS) */}
      <div className="apple-glass p-8 md:p-10 rounded-[2.5rem] mb-8 border border-white/80 shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl text-white shadow-xl shadow-blue-500/20">
            <Radio className="h-8 w-8 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">SignalWire Telephony & AI Suite</h1>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-extrabold border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" /> Connected
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1 font-mono">
              Space: <span className="text-blue-600 font-bold">{credentials?.spaceUrl || 'newhollandfinancialgroup.signalwire.com'}</span> • Main Line: <span className="text-emerald-600 font-bold">{credentials?.phoneNumber || '+18885550199'}</span>
            </p>
          </div>
        </div>

        <button 
          onClick={fetchData}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-extrabold transition-all border border-slate-200 shadow-sm apple-card"
        >
          <RefreshCw className="w-4 h-4 text-blue-600" /> Refresh Telephony
        </button>
      </div>

      {/* APPLE SEGMENTED CONTROL TABS */}
      <div className="bg-slate-200/60 backdrop-blur-xl p-1.5 rounded-2xl inline-flex items-center gap-1 mb-8 border border-slate-300/40">
        {[
          { id: 'softphone', label: 'Corporate Softphone', icon: Phone },
          { id: 'extensions', label: 'Advisor Extensions', icon: Users },
          { id: 'sms', label: '2-Way SMS Inbox', icon: MessageSquare },
          { id: 'ai_qualifier', label: 'AI Lead Qualifier Bot', icon: Bot },
          { id: 'logs', label: 'Call Recordings & AI Ratings', icon: Volume2 }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                isActive 
                  ? 'bg-white text-slate-900 shadow-md border border-slate-200/80' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5 text-blue-600" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: SOFTPHONE DIALER ── */}
      {activeTab === 'softphone' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Keypad Column */}
          <div className="apple-glass border border-white/80 rounded-[2.5rem] p-8 shadow-2xl flex flex-col items-center">
            <div className="w-full mb-6 text-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Target Phone Number</span>
              <input 
                type="text" 
                value={dialNumber}
                onChange={e => setDialNumber(e.target.value)}
                placeholder="+1 (888) 000-0000"
                className="w-full text-center text-2xl font-black bg-white border border-slate-200 text-slate-900 py-3 rounded-2xl mt-2 tracking-wider focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              />
            </div>

            {/* Keypad Grid */}
            <div className="grid grid-cols-3 gap-3 mb-6 w-full max-w-[280px]">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map(key => (
                <button
                  key={key}
                  onClick={() => handleKeypadPress(key)}
                  className="w-full aspect-square rounded-2xl bg-white hover:bg-blue-50 border border-slate-200 text-slate-800 text-xl font-black transition-all active:scale-95 flex items-center justify-center shadow-sm"
                >
                  {key}
                </button>
              ))}
            </div>

            {/* Extension Selection */}
            <div className="w-full max-w-[280px] mb-6">
              <label className="text-xs text-slate-400 font-extrabold block mb-2">Advisor Extension Line</label>
              <select
                value={selectedExtension}
                onChange={e => setSelectedExtension(e.target.value)}
                className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-bold p-3 rounded-xl focus:outline-none shadow-sm"
              >
                {extensions.map(ext => (
                  <option key={ext.id} value={ext.extension}>
                    Ext {ext.extension} - {ext.advisor_name} ({ext.department})
                  </option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            {!isCalling ? (
              <button
                onClick={handleStartCall}
                disabled={!dialNumber}
                className="w-full max-w-[280px] py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all apple-card"
              >
                <PhoneCall className="w-4 h-4" /> Start Call
              </button>
            ) : (
              <button
                onClick={handleEndCall}
                className="w-full max-w-[280px] py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20 transition-all apple-card"
              >
                <PhoneOff className="w-4 h-4" /> End Call
              </button>
            )}
          </div>

          {/* Active Call Console */}
          <div className="lg:col-span-2 apple-glass border border-white/80 rounded-[2.5rem] p-8 shadow-2xl flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900 mb-1">Active Call Console</h2>
              <p className="text-xs text-slate-400 font-medium">SignalWire LAML Voice Protocol • Dual Channel Recording</p>

              {isCalling ? (
                <div className="my-12 p-8 bg-blue-50/80 rounded-3xl border border-blue-200 text-center">
                  <div className="w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-ping">
                    <Phone className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-1">Call in Progress</h3>
                  <p className="text-sm text-slate-500 font-mono mb-4">{dialNumber} • Ext {selectedExtension}</p>
                  <div className="inline-block px-6 py-2 rounded-full bg-white text-blue-600 font-mono text-xl font-black shadow-sm border border-blue-200">
                    {formatTime(callDuration)}
                  </div>
                </div>
              ) : (
                <div className="my-12 p-12 bg-white/60 rounded-3xl border border-slate-200 text-center">
                  <PhoneOff className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-extrabold text-slate-800">Softphone Ready</h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">Enter a phone number on the keypad to initiate a corporate call.</p>
                </div>
              )}
            </div>

            {/* Mute & Record Controls */}
            <div className="flex items-center justify-around p-4 bg-white/80 rounded-2xl border border-slate-200/80">
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className={`p-3.5 rounded-xl font-extrabold flex items-center gap-2 text-xs transition-all ${
                  isMuted ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                {isMuted ? 'Muted' : 'Mute'}
              </button>

              <button 
                onClick={() => setIsRecording(!isRecording)}
                className={`p-3.5 rounded-xl font-extrabold flex items-center gap-2 text-xs transition-all ${
                  isRecording ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-slate-100 text-slate-400'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                {isRecording ? 'Recording Active' : 'Recording Off'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: ADVISOR EXTENSIONS DIRECTORY ── */}
      {activeTab === 'extensions' && (
        <div className="apple-glass border border-white/80 rounded-[2.5rem] p-8 shadow-2xl">
          <h2 className="text-xl font-black text-slate-900 mb-1">Corporate Advisor Extension Directory</h2>
          <p className="text-xs text-slate-400 font-medium mb-6">Incoming calls to company main line (+1 888-555-0199) route automatically via IVR.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {extensions.map(ext => (
              <div key={ext.id} className="apple-glass p-6 rounded-3xl border border-white/80 apple-card flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 font-mono font-black text-xs border border-blue-200">
                      Ext {ext.extension}
                    </span>
                    <span className={`w-2.5 h-2.5 rounded-full ${ext.status === 'available' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  </div>

                  <h3 className="text-lg font-extrabold text-slate-900 mb-1">{ext.advisor_name}</h3>
                  <p className="text-xs text-slate-500 font-medium mb-4">{ext.department}</p>
                  <p className="text-xs font-mono text-slate-400 mb-6">{ext.phone_number}</p>
                </div>

                <button 
                  onClick={() => { setDialNumber(ext.phone_number); setActiveTab('softphone'); }}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                >
                  <Phone className="w-3.5 h-3.5" /> Call Extension
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 3: 2-WAY SMS INBOX ── */}
      {activeTab === 'sms' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="apple-glass border border-white/80 rounded-[2.5rem] p-6 shadow-2xl">
            <h2 className="text-lg font-black text-slate-900 mb-4">Recent SMS Conversations</h2>
            <div className="space-y-3">
              {smsHistory.map(sms => (
                <div 
                  key={sms.id}
                  onClick={() => { setSmsRecipient(sms.to_number); setSmsRecipientName(sms.lead_name); }}
                  className="p-4 bg-white/80 hover:bg-white border border-slate-200/80 rounded-2xl cursor-pointer transition-all shadow-sm"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-sm text-slate-900">{sms.lead_name}</span>
                    <span className="text-[10px] text-slate-400">{new Date(sms.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-1">{sms.message_text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 apple-glass border border-white/80 rounded-[2.5rem] p-8 shadow-2xl flex flex-col justify-between h-[500px]">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">{smsRecipientName}</h3>
                  <p className="text-xs font-mono text-slate-400">{smsRecipient}</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-extrabold border border-emerald-200">
                  SignalWire 2-Way SMS
                </span>
              </div>

              <div className="space-y-4 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                {smsHistory.filter(s => s.to_number === smsRecipient || s.from_number === smsRecipient).map(msg => (
                  <div key={msg.id} className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] p-4 rounded-2xl text-xs leading-relaxed ${
                      msg.direction === 'outbound' ? 'bg-blue-600 text-white rounded-br-none shadow-md shadow-blue-500/10' : 'bg-slate-200 text-slate-800 rounded-bl-none'
                    }`}>
                      {msg.message_text}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
              <input
                type="text"
                value={smsText}
                onChange={e => setSmsText(e.target.value)}
                placeholder="Type SMS message to lead..."
                className="flex-grow bg-white border border-slate-200 text-slate-900 text-xs p-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              />
              <button
                onClick={handleSendSMS}
                className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-2xl flex items-center gap-2 shadow-lg shadow-blue-500/20"
              >
                <Send className="w-4 h-4" /> Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: AI LEAD QUALIFIER BOT ── */}
      {activeTab === 'ai_qualifier' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="apple-glass border border-white/80 rounded-[2.5rem] p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-purple-500/10 text-purple-600 rounded-2xl">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900">Outbound AI Dialer</h2>
                <p className="text-xs text-slate-500 font-medium">Qualify lead requests automatically</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs font-extrabold text-slate-500 block mb-1">Lead Name</label>
                <input 
                  type="text" 
                  value={aiLeadName}
                  onChange={e => setAiLeadName(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-900 text-xs p-3 rounded-xl focus:outline-none shadow-sm"
                />
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-500 block mb-1">Lead Phone Number</label>
                <input 
                  type="text" 
                  value={aiLeadPhone}
                  onChange={e => setAiLeadPhone(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-900 text-xs p-3 rounded-xl focus:outline-none shadow-sm"
                />
              </div>
            </div>

            <button
              onClick={handleTriggerAiCall}
              disabled={isAiCalling}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20"
            >
              <Sparkles className="w-4 h-4" /> {isAiCalling ? 'Initiating AI Call...' : 'Launch Outbound AI Call'}
            </button>
          </div>

          <div className="lg:col-span-2 apple-glass border border-white/80 rounded-[2.5rem] p-8 shadow-2xl">
            <h3 className="text-xl font-black text-slate-900 mb-1">Automated AI Lead Temperature Rating</h3>
            <p className="text-xs text-slate-500 font-medium mb-6">SignalWire voice bot transcribes call audio and categorizes leads into 3 core tiers:</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="apple-glass p-6 rounded-3xl border border-rose-200">
                <span className="text-2xl mb-2 block">🔥</span>
                <h4 className="text-base font-extrabold text-slate-900 mb-1">Warm (High Priority)</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  Capital &gt; $50k or immediate timeline (&lt; 30 days). Automatically routed to senior advisors.
                </p>
              </div>

              <div className="apple-glass p-6 rounded-3xl border border-amber-200">
                <span className="text-2xl mb-2 block">🌤️</span>
                <h4 className="text-base font-extrabold text-slate-900 mb-1">Mild (Nurture Tier)</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  Evaluating options / 60–90 day timeline. Enrolled in automated SMS nurture sequences.
                </p>
              </div>

              <div className="apple-glass p-6 rounded-3xl border border-slate-200">
                <span className="text-2xl mb-2 block">❄️</span>
                <h4 className="text-base font-extrabold text-slate-900 mb-1">Cold (Low Intent)</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  Unresponsive or low capital threshold. Archived for drip marketing campaigns.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 5: CALL RECORDINGS & AI RATINGS LOG ── */}
      {activeTab === 'logs' && (
        <div className="apple-glass border border-white/80 rounded-[2.5rem] p-8 shadow-2xl">
          <h2 className="text-xl font-black text-slate-900 mb-6">Recorded Calls & AI Qualification Logs</h2>

          <div className="space-y-4">
            {callLogs.map(log => (
              <div key={log.id} className="apple-glass p-6 rounded-3xl border border-white/80 flex flex-col md:flex-row md:items-center justify-between gap-6 apple-card">
                <div className="space-y-2 flex-grow">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-extrabold text-slate-900">{log.lead_name}</h3>
                    {getRatingBadge(log.ai_rating)}
                    <span className="text-xs font-mono text-slate-400">{log.to_number}</span>
                  </div>

                  <p className="text-xs text-slate-700 bg-white/80 p-3 rounded-2xl border border-slate-200 font-mono whitespace-pre-wrap">
                    {log.transcript}
                  </p>

                  <p className="text-xs text-blue-600 font-extrabold">{log.ai_qualification_summary}</p>
                </div>

                <div className="flex items-center gap-4">
                  <audio controls className="h-10 rounded-xl max-w-[240px]">
                    <source src={log.recording_url} type="audio/mp3" />
                  </audio>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TelephonyHub;
