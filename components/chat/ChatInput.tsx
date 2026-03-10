
import React, { useState } from 'react';
import { Send, PlusCircle, CheckCircle2, AlertCircle, Info, Activity, ShieldAlert, Pill } from 'lucide-react';
import { UserRole } from '../../types';

interface ChatInputProps {
  onSend: (text: string, metadata?: any) => void;
  userRole: UserRole;
  isSubAdminInChannel: boolean;
  channelType: 'direct' | 'group' | 'advisor_channel' | 'case_chat';
}

const PREDEFINED_MESSAGES = [
  { text: "Application declined because of medication history.", group: "Status", icon: <Pill size={14} /> },
  { text: "Please recheck that the client address is correct.", group: "Follow-up", icon: <Info size={14} /> },
  { text: "Please verify that the client's SSN is correct.", group: "Verification", icon: <ShieldAlert size={14} /> },
  { text: "Please verify that the client's bank information is correct.", group: "Verification", icon: <ShieldAlert size={14} /> },
  { text: "Does the client currently have another policy?", group: "Follow-up", icon: <CheckCircle2 size={14} /> },
  { text: "Application declined. Let's try a different carrier.", group: "Status", icon: <AlertCircle size={14} /> }
];

const CARRIER_SUGGESTIONS = [
  "Aflac", "Transamerica", "GEICO", "Combined Insurance", "Colonial Life"
];

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, userRole, isSubAdminInChannel, channelType }) => {
  const [text, setText] = useState('');
  const [showPresets, setShowPresets] = useState(false);
  const [showCarriers, setShowCarriers] = useState(false);
  const [currentFollowUp, setCurrentFollowUp] = useState<string | null>(null);

  const isAdvisor = userRole === UserRole.ADVISOR;
  // Advisors must use predefined messages if a Sub-Admin is present in Case Chats / System Channels
  const isRestricted = isAdvisor && isSubAdminInChannel && (channelType === 'case_chat' || channelType === 'advisor_channel');

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text);
    setText('');
    setCurrentFollowUp(null);
    setShowPresets(false);
    setShowCarriers(false);
  };

  const handleSelectPreset = (msg: string) => {
    if (msg === "Does the client currently have another policy?") {
      setCurrentFollowUp(msg);
      setText(msg);
    } else if (msg === "Application declined. Let's try a different carrier.") {
      setShowCarriers(true);
      setText(msg);
    } else {
      onSend(msg);
      setShowPresets(false);
      setText('');
    }
  };

  const handleFollowUpResponse = (response: 'Yes' | 'No') => {
    const fullMsg = `${currentFollowUp} Selection: ${response}. ${response === 'Yes' ? 'Pending coverage amount...' : 'No further info required.'}`;
    if (response === 'Yes') {
      setText(`${currentFollowUp} Response: Yes. Checking coverage amount...`);
      setCurrentFollowUp("coverage_amount");
    } else {
      onSend(fullMsg);
      setCurrentFollowUp(null);
      setText('');
    }
  };

  const handleCarrierSelect = (carrier: string) => {
    onSend(`Application declined. Suggested Carrier: ${carrier}`, { suggestedCarrier: carrier });
    setShowCarriers(false);
    setShowPresets(false);
    setText('');
  };

  if (isRestricted) {
    return (
      <div className="p-4 border-t border-slate-100 bg-slate-50 relative bottom-0">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert size={12} className="text-orange-500" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Restricted Management Channel</span>
          </div>

          {currentFollowUp === "Does the client currently have another policy?" ? (
            <div className="flex gap-2">
              <button onClick={() => handleFollowUpResponse('Yes')} className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-lg">YES</button>
              <button onClick={() => handleFollowUpResponse('No')} className="flex-1 py-3 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold">NO</button>
            </div>
          ) : currentFollowUp === "coverage_amount" ? (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type coverage amount (e.g. $100k)..."
                className="flex-1 px-4 py-3 rounded-xl bg-white border border-slate-200 text-xs font-bold outline-none ring-2 ring-blue-500/20"
                value={text.split('Response: Yes. ')[1] || ''}
                onChange={(e) => setText(`Does the client currently have another policy? Response: Yes. ${e.target.value}`)}
              />
              <button onClick={() => handleSend()} className="px-6 py-3 bg-blue-600 text-white rounded-xl text-xs font-bold">SEND</button>
            </div>
          ) : showCarriers ? (
            <div className="grid grid-cols-2 gap-2">
              {CARRIER_SUGGESTIONS.map(c => (
                <button key={c} onClick={() => handleCarrierSelect(c)} className="py-2.5 px-4 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-600 hover:bg-blue-50 hover:border-blue-200 transition-all text-left uppercase">{c}</button>
              ))}
              <button onClick={() => setShowCarriers(false)} className="col-span-2 py-2 text-[10px] font-bold text-slate-400">Back to presets</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1 no-scrollbar">
              {PREDEFINED_MESSAGES.map((m, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectPreset(m.text)}
                  className="group flex items-center gap-3 w-full p-3 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all text-left"
                >
                  <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-blue-100 text-slate-400 group-hover:text-blue-600 transition-colors">
                    {m.icon}
                  </div>
                  <div className="flex-1">
                    <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">{m.group}</span>
                    <span className="text-xs font-bold text-slate-700">{m.text}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white border-t border-slate-100">
      <div className="flex items-center gap-3 bg-slate-50 rounded-2xl p-1.5 border border-slate-100 focus-within:ring-2 focus-within:ring-blue-500/10 focus-within:bg-white transition-all shadow-inner">
        <button className="p-3 text-slate-400 hover:text-blue-600 transition-colors">
          <PlusCircle size={20} />
        </button>
        <input
          type="text"
          className="flex-1 bg-transparent border-none px-2 py-3 text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button
          onClick={handleSend}
          disabled={!text.trim()}
          className="p-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all disabled:opacity-50 disabled:shadow-none"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};
