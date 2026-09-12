import React, { useState, useRef } from 'react';
import { Send, Image as ImageIcon, Video, AlertCircle, CheckCircle, Loader2, Instagram, Facebook, Youtube, MessageCircle, Music, UploadCloud } from 'lucide-react';
import { useData } from '../../context/DataContext';

export const OmnichannelPublisher: React.FC = () => {
  const { user } = useData();
  const [mediaUrl, setMediaUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [platforms, setPlatforms] = useState({
    instagram: true,
    facebook: true,
    youtube: false,
    whatsapp: false,
    tiktok: false
  });
  const [status, setStatus] = useState<'idle' | 'uploading' | 'publishing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const togglePlatform = (key: keyof typeof platforms) => {
    setPlatforms(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus('uploading');
    setMessage('Uploading file...');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('nhfg_access_token');
      const response = await fetch('/api/upload-multipart', {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: formData
      });

      const res = await response.json();
      if (response.ok && res.url) {
        setMediaUrl(res.url);
        setStatus('idle');
        setMessage('');
      } else {
        throw new Error(res.error || 'Failed to upload file');
      }
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'File upload failed');
    }
  };

  const handlePublish = async () => {
    if (!mediaUrl) {
      setStatus('error');
      setMessage('Media URL is required for publishing.');
      return;
    }
    
    const selected = Object.keys(platforms).filter(k => platforms[k as keyof typeof platforms]);
    if (selected.length === 0) {
      setStatus('error');
      setMessage('Please select at least one platform.');
      return;
    }
    
    setStatus('publishing');
    setMessage('');
    
    try {
      const response = await fetch('/api/integrations/omnichannel/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaUrl, caption, platforms: selected })
      });
      
      const res = await response.json();

      if (res.success) {
        setStatus('success');
        setMessage(`Successfully published to ${selected.join(', ')}!`);
        setMediaUrl('');
        setCaption('');
      } else {
        throw new Error(res.error || 'Failed to publish');
      }
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'An error occurred while publishing.');
    }
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 shadow-xl">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
          <Send className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-xl font-bold text-white">Omnichannel Publisher</h3>
      </div>
      
      <div className="space-y-5">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Publish To</label>
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => togglePlatform('instagram')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl border transition-all ${platforms.instagram ? 'bg-gradient-to-r from-purple-600 to-pink-500 border-transparent text-white' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'}`}
            >
              <Instagram className="w-4 h-4" /> <span>Instagram</span>
            </button>
            <button 
              onClick={() => togglePlatform('facebook')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl border transition-all ${platforms.facebook ? 'bg-blue-600 border-transparent text-white' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'}`}
            >
              <Facebook className="w-4 h-4" /> <span>Facebook</span>
            </button>
            <button 
              onClick={() => togglePlatform('youtube')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl border transition-all ${platforms.youtube ? 'bg-red-600 border-transparent text-white' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'}`}
            >
              <Youtube className="w-4 h-4" /> <span>YouTube</span>
            </button>
            <button 
              onClick={() => togglePlatform('tiktok')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl border transition-all ${platforms.tiktok ? 'bg-slate-950 border-cyan-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'}`}
            >
              <Music className="w-4 h-4" /> <span>TikTok</span>
            </button>
            <button 
              onClick={() => togglePlatform('whatsapp')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl border transition-all ${platforms.whatsapp ? 'bg-green-600 border-transparent text-white' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'}`}
            >
              <MessageCircle className="w-4 h-4" /> <span>WhatsApp Status</span>
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Media Upload</label>
          <div className="flex space-x-3 items-center">
            <input 
              type="url" 
              placeholder="https://example.com/media.jpg"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-slate-500 text-sm font-semibold">OR</span>
            <input 
              type="file" 
              accept="image/*,video/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={status === 'uploading'}
              className="flex items-center space-x-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-3 rounded-xl font-bold transition-all disabled:opacity-50"
            >
              {status === 'uploading' ? <Loader2 className="w-5 h-5 animate-spin" /> : <UploadCloud className="w-5 h-5" />}
              <span>Upload Local</span>
            </button>
          </div>
        </div>
        
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Caption</label>
          <textarea 
            rows={4}
            placeholder="Write your caption here... #marketing #finance"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
        
        {mediaUrl && (
          <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-900 h-48 flex items-center justify-center relative group">
             {mediaUrl.match(/\.(mp4|mov|webm)$/i) ? (
                <video src={mediaUrl} controls className="max-h-full object-contain" />
             ) : (
                <img src={mediaUrl} alt="Preview" className="max-h-full object-contain" onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM5NDBhMWUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cmVjdCB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHg9IjMiIHk9IjMiIHJ4PSIyIiByeT0iMiIvPjxjaXJjbGUgY3g9IjkiIGN5PSI5IiByPSIyIi8+PHBhdGggZD0ibTIxIDE1LTMuMDgtMy4wOGExLjIgMS4yIDAgMCAwLTEuNzEgMGwtNS4wNCA1LjA0Ii8+PHBhdGggZD0ibTEyIDE4LTQuMDgtNC4wOGExLjIgMS4yIDAgMCAwLTEuNzEgMGwtMy4xMyAzLjEzIi8+PC9zdmc+';
                }} />
             )}
          </div>
        )}
        
        {status === 'error' && (
          <div className="p-4 rounded-xl bg-red-900/30 border border-red-500/50 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-200">{message}</p>
          </div>
        )}
        
        {status === 'success' && (
          <div className="p-4 rounded-xl bg-emerald-900/30 border border-emerald-500/50 flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-emerald-200">{message}</p>
          </div>
        )}
        
        <div className="flex justify-end pt-2">
          <button 
            onClick={handlePublish}
            disabled={status === 'publishing' || status === 'uploading' || !mediaUrl || Object.values(platforms).every(v => !v)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
          >
            {status === 'publishing' ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
            <span>Publish Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};
