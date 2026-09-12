import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SEO } from '../../components/SEO';
import { useData } from '../../context/DataContext';
import { Video, Settings, Users, Link as LinkIcon, ExternalLink, Shield } from 'lucide-react';

export const VideoConferencing: React.FC = () => {
  const { user } = useData();
  const [toast, setToast] = React.useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const toastRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
      setToast({ msg, type });
      clearTimeout(toastRef.current);
      toastRef.current = setTimeout(() => setToast(null), 4000);
  };

  const containerRef = useRef<HTMLDivElement>(null);
  const [searchParams] = useSearchParams();
  const [jitsiApi, setJitsiApi] = useState<any>(null);
  const [roomName, setRoomName] = useState(searchParams.get('room') || 'NHFG-Advisory-Room-' + Math.floor(Math.random() * 10000));
  const [inMeeting, setInMeeting] = useState(false);
  const [advisorName, setAdvisorName] = useState(user?.name || 'NHFG Advisor');

  const startMeeting = () => {
    setInMeeting(true);
  };

  useEffect(() => {
    if (!inMeeting) return;
    
    const setupMeeting = async () => {
      // 1. Fetch JWT token from backend
      let jwtToken = null;
      try {
        const token = localStorage.getItem('nhfg_access_token');
        const res = await fetch('/api/video/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ roomName, userName: advisorName })
        });
        const data = await res.json();
        if (data.token) {
          jwtToken = data.token;
        }
      } catch (err) {
        console.error('Failed to fetch Jitsi token', err);
      }

      // Slight delay to ensure DOM is ready
      setTimeout(() => {
        if (!containerRef.current) return;
        
        if (!(window as any).JitsiMeetExternalAPI) {
          const script = document.createElement('script');
          script.src = 'https://meet.newhollandfinancial.com/external_api.js';
          script.async = true;
          script.onload = () => initJitsi(jwtToken);
          document.body.appendChild(script);
        } else {
          initJitsi(jwtToken);
        }
      }, 100);
    };

    setupMeeting();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inMeeting]);

  const initJitsi = (jwtToken: string | null = null) => {
    if (jitsiApi) jitsiApi.dispose();

    const domain = 'meet.newhollandfinancial.com';
    const options: any = {
      roomName: roomName,
      width: '100%',
      height: '100%',
      parentNode: containerRef.current,
      ...(jwtToken && { jwt: jwtToken }),
      userInfo: {
        displayName: advisorName
      },
      configOverwrite: {
        disableDeepLinking: true,
        prejoinPageEnabled: false,
        brandingDataUrl: '',
        defaultLogoUrl: '',
        disableThirdPartyRequests: true,
        hideLobbyButton: false,
        requireDisplayName: true,
      },
      interfaceConfigOverwrite: {
        APP_NAME: 'New Holland Financial Group Meeting',
        NATIVE_APP_NAME: 'NHFG Meeting',
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        SHOW_BRAND_WATERMARK: true,
        BRAND_WATERMARK_LINK: 'https://newhollandfinancial.com',
        DEFAULT_BACKGROUND: '#0f172a',
        DEFAULT_LOCAL_DISPLAY_NAME: 'Advisor',
        DEFAULT_REMOTE_DISPLAY_NAME: 'Client',
        DISABLE_VIDEO_BACKGROUND: true,
        DISPLAY_WELCOME_PAGE_CONTENT: false,
        HIDE_INVITE_MORE_HEADER: true,
        MOBILE_APP_PROMO: false,
        SETTINGS_SECTIONS: ['devices', 'language', 'profile'],
      }
    };

    const api = new (window as any).JitsiMeetExternalAPI(domain, options);
    
    api.addEventListener('videoConferenceJoined', () => {
      setInMeeting(true);
    });

    api.addEventListener('videoConferenceLeft', () => {
      setInMeeting(false);
      api.dispose();
      setJitsiApi(null);
    });

    setJitsiApi(api);
  };

  const leaveMeeting = () => {
    if (jitsiApi) {
      jitsiApi.executeCommand('hangup');
    }
  };

  useEffect(() => {
    return () => {
      if (jitsiApi) {
        jitsiApi.dispose();
      }
    };
  }, [jitsiApi]);

  const copyInviteLink = () => {
    navigator.clipboard.writeText(`https://meet.newhollandfinancial.com/${roomName}`);
    showToast('Meeting link copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-slate-900 pb-20">
            {toast && (
              <div style={{ position: 'fixed', top: 20, right: 24, zIndex: 9999, background: toast.type === 'success' ? '#ecfdf5' : '#fff1f2', border: `1px solid ${toast.type === 'success' ? '#a7f3d0' : '#fecdd3'}`, color: toast.type === 'success' ? '#065f46' : '#9f1239', padding: '12px 18px', borderRadius: 12, fontSize: 13, fontWeight: 600, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
                  {toast.msg}
              </div>
            )}

      <SEO />

      <div className="apple-glass p-8 md:p-10 rounded-[2.5rem] mb-8 border border-white/80 shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl text-white shadow-xl shadow-indigo-500/20">
            <Video className="h-8 w-8 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">NHFG Video Meetings</h1>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-700 text-xs font-extrabold border border-indigo-500/20">
                <Shield className="w-3.5 h-3.5" /> Secure & Private
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Host branded video conferences with clients directly within the CRM.
            </p>
          </div>
        </div>
      </div>

      {!inMeeting ? (
        <div className="apple-glass border border-white/80 rounded-[2.5rem] p-10 shadow-2xl max-w-2xl mx-auto flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-indigo-50 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner border border-indigo-100">
            <Users className="w-10 h-10 text-indigo-600" />
          </div>
          
          <h2 className="text-2xl font-black text-slate-900 mb-2">Start a Client Meeting</h2>
          <p className="text-sm text-slate-500 mb-8 max-w-md">
            Create a secure, NHFG-branded meeting room. Your clients won't see any third-party logos or branding.
          </p>
          
          <div className="w-full space-y-5">
            <div className="text-left">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Your Display Name</label>
              <input 
                type="text" 
                value={advisorName}
                onChange={e => setAdvisorName(e.target.value)}
                className="w-full bg-white border border-slate-200 text-slate-800 text-sm font-bold p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all"
              />
            </div>
            
            <div className="text-left">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Meeting Room ID (Auto-generated)</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={roomName}
                  onChange={e => setRoomName(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-800 text-sm font-bold p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all"
                />
                <button 
                  onClick={copyInviteLink}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all"
                  title="Copy Invite Link"
                >
                  <LinkIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            <button 
              onClick={startMeeting}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-sm shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 mt-4"
            >
              <Video className="w-4 h-4" /> Start Meeting Now
            </button>
          </div>
        </div>
      ) : (
        <div className="apple-glass border border-white/80 rounded-[2.5rem] p-4 shadow-2xl flex flex-col h-[75vh]">
          <div className="flex items-center justify-between px-4 pb-4 mb-2 border-b border-slate-200/50">
            <div>
              <h3 className="font-black text-slate-900">NHFG Encrypted Meeting</h3>
              <p className="text-xs text-slate-500 font-mono">Room: {roomName}</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={copyInviteLink}
                className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-extrabold rounded-xl shadow-sm transition-all flex items-center gap-2"
              >
                <LinkIcon className="w-3.5 h-3.5" /> Copy Invite Link
              </button>
              <button 
                onClick={leaveMeeting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold rounded-xl shadow-sm transition-all"
              >
                End Meeting
              </button>
            </div>
          </div>
          
          {/* Jitsi IFrame Container */}
          <div 
            ref={containerRef} 
            className="flex-1 w-full h-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-800"
          />
        </div>
      )}
    </div>
  );
};
