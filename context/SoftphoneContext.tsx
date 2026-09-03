import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SignalWire from '@signalwire/js';

type SoftphoneState = 'offline' | 'registering' | 'registered' | 'ringing' | 'active' | 'held' | 'error';

interface SoftphoneContextType {
  status: SoftphoneState;
  activeCallId: string | null;
  remoteNumber: string | null;
  isMuted: boolean;
  isOnHold: boolean;
  callDuration: number;
  register: (agentId: string) => Promise<void>;
  makeCall: (to: string) => Promise<void>;
  answerCall: () => Promise<void>;
  endCall: () => Promise<void>;
  toggleMute: () => Promise<void>;
  toggleHold: () => Promise<void>;
  blindTransfer: (destination: string) => Promise<void>;
  warmTransfer: (destination: string) => Promise<void>;
}

const SoftphoneContext = createContext<SoftphoneContextType | undefined>(undefined);

export const SoftphoneProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<SoftphoneState>('offline');
  const [client, setClient] = useState<any>(null);
  const [activeCall, setActiveCall] = useState<any>(null);
  const [activeCallId, setActiveCallId] = useState<string | null>(null);
  const [remoteNumber, setRemoteNumber] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (status === 'active') {
      timer = setInterval(() => setCallDuration((d) => d + 1), 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [status]);

  const register = async (agentId: string) => {
    setStatus('registering');
    try {
      // 1. Fetch token from backend (Never store secret here)
      const tokenRes = await fetch('/api/telephony/token', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('nhfg_access_token')}` }
      });
      if (!tokenRes.ok) throw new Error('Failed to get token');
      const { token } = await tokenRes.json();

      // 2. Init WebRTC client
      const swClient = await SignalWire.Relay({
        project: 'backend-handled', // Using token-only auth if possible via SAT
        token: token
      });
      
      setClient(swClient);
      setStatus('registered');
      
      // Setup incoming listeners...
    } catch (err) {
      console.error('Softphone registration failed', err);
      setStatus('error');
    }
  };

  const makeCall = async (to: string) => {
    if (!client) return;
    setStatus('ringing');
    setRemoteNumber(to);
    // Logic to initiate outbound using SignalWire WebRTC
  };

  const answerCall = async () => {
    if (!activeCall) return;
    setStatus('active');
    // Logic to accept incoming WebRTC media
  };

  const endCall = async () => {
    setStatus('registered');
    setRemoteNumber(null);
    setActiveCall(null);
    setActiveCallId(null);
  };

  const toggleMute = async () => setIsMuted(!isMuted);
  const toggleHold = async () => setIsOnHold(!isOnHold);
  
  const blindTransfer = async (destination: string) => { 
    console.log(`[Phase 8] Blind transferring call to ${destination}`);
    if (activeCall) {
      // In SignalWire WebRTC, this could be activeCall.transfer(destination) if supported, or via REST
      alert(`Initiating blind transfer to ${destination}`);
    }
  };

  const warmTransfer = async (destination: string) => {
    console.log(`[Phase 8] Warm transferring call to ${destination}`);
    alert(`Placing caller on hold and dialing ${destination} for warm transfer...`);
  };

  return (
    <SoftphoneContext.Provider value={{
      status, activeCallId, remoteNumber, isMuted, isOnHold, callDuration,
      register, makeCall, answerCall, endCall, toggleMute, toggleHold, blindTransfer, warmTransfer
    }}>
      {children}
    </SoftphoneContext.Provider>
  );
};

export const useSoftphone = () => {
  const context = useContext(SoftphoneContext);
  if (!context) throw new Error('useSoftphone must be used within SoftphoneProvider');
  return context;
};
