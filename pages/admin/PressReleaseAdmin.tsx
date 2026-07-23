import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Newspaper, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Eye, 
  Globe, 
  Calendar,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  X
} from 'lucide-react';
import { Tab3DBanner } from '../../components/shared/Tab3DBanner';

/**
 * PRESS RELEASE ADMIN
 * Manage official company news and media announcements.
 */

interface PressRelease {
  id: string;
  title: string;
  date: string;
  status: 'Published' | 'Draft' | 'Scheduled';
  category: string;
  excerpt: string;
}

export const PressReleaseAdmin: React.FC = () => {
  const navigate = useNavigate();
  const [releases, setReleases] = useState<PressRelease[]>([
    { id: '1', title: 'New Holland Financial Group Surpasses $2B in Assets', date: '2026-05-12', status: 'Published', category: 'Corporate', excerpt: 'NHFG reaches a major milestone in growth...' },
    { id: '2', title: 'AI-Powered Market Intelligence Terminal Launch', date: '2026-04-28', status: 'Published', category: 'Innovation', excerpt: 'The new proprietary platform provides predictive yield modeling...' },
    { id: '3', title: 'Sustainable Infrastructure Financing Expansion', date: '2026-06-15', status: 'Scheduled', category: 'Corporate', excerpt: 'The strategic shift marks a pivotal moment in the group\'s investment history...' },
  ]);

  const [isEditing, setIsEditing] = useState(false);
  const [currentRelease, setCurrentRelease] = useState<PressRelease | null>(null);

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this press release?')) {
        setReleases(releases.filter(r => r.id !== id));
    }
  };

  const handleViewLive = () => {
    navigate('/press');
  };

  const handleEdit = (release: PressRelease) => {
    setCurrentRelease(release);
    setIsEditing(true);
  };

  const handleAddNew = () => {
    setCurrentRelease({
        id: Math.random().toString(36).substr(2, 9),
        title: '',
        date: new Date().toISOString().split('T')[0],
        status: 'Draft',
        category: 'Corporate',
        excerpt: ''
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!currentRelease) return;
    const exists = releases.find(r => r.id === currentRelease.id);
    if (exists) {
        setReleases(releases.map(r => r.id === currentRelease.id ? currentRelease : r));
    } else {
        setReleases([...releases, currentRelease]);
    }
    setIsEditing(false);
  };

  return (
    <div className="space-y-8 relative">
      <Tab3DBanner
        cards={[
          { title: "Official Newsroom", value: `${releases.length || 24} Publications`, subtitle: "Media Announcements", emoji: "📰", gradient: "cyan", linkText: "View Newsroom" },
          { title: "PR Wire Syndication", value: "Bloomberg & Reuters", subtitle: "Global Media Distribution", emoji: "📡", gradient: "yellow", linkText: "Syndication" },
          { title: "Media Impressions", value: "1.2M Reach", subtitle: "+28% Month-over-Month", emoji: "📢", gradient: "pink", linkText: "Media Analytics" }
        ]}
      />
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2 uppercase">Newsroom Manager</h1>
          <p className="text-slate-500 font-medium">Create and distribute official company press releases.</p>
        </div>
        <button 
          onClick={handleAddNew}
          className="flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-900/20"
        >
          <Plus size={18} /> Create New Release
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search press archives..." 
            className="w-full pl-16 pr-8 py-4 bg-white border border-slate-100 rounded-2xl font-bold text-sm shadow-sm focus:ring-4 focus:ring-blue-100 transition-all"
          />
        </div>
        <select className="px-6 py-4 bg-white border border-slate-100 rounded-2xl font-bold text-sm shadow-sm">
          <option>All Categories</option>
          <option>Corporate</option>
          <option>Innovation</option>
          <option>Partnership</option>
        </select>
        <select className="px-6 py-4 bg-white border border-slate-100 rounded-2xl font-bold text-sm shadow-sm">
          <option>All Statuses</option>
          <option>Published</option>
          <option>Draft</option>
          <option>Scheduled</option>
        </select>
      </div>

      {/* Release Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {releases.map((release) => (
          <div key={release.id} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
            <div className="flex items-center justify-between mb-8">
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                release.status === 'Published' ? 'bg-emerald-50 text-emerald-600' : 
                release.status === 'Scheduled' ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-600'
              }`}>
                {release.status}
              </span>
              <div className="flex items-center gap-2 text-slate-400 font-bold text-xs">
                <Calendar size={14} /> {release.date}
              </div>
            </div>

            <h3 className="text-xl font-black text-slate-900 tracking-tight leading-tight mb-6 group-hover:text-blue-600 transition-colors">
              {release.title}
            </h3>

            <div className="flex items-center justify-between pt-8 border-t border-slate-50">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => handleEdit(release)}
                  className="p-3 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                >
                  <Edit3 size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(release.id)}
                  className="p-3 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              <button 
                onClick={handleViewLive}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
              >
                View Live <ArrowUpRight size={14} />
              </button>
            </div>
          </div>
        ))}

        {/* Empty State / Add New Card */}
        <div 
          onClick={handleAddNew}
          className="border-2 border-dashed border-slate-200 p-8 rounded-[3rem] flex flex-col items-center justify-center text-center gap-4 hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer group min-h-[200px]"
        >
           <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 group-hover:bg-blue-100 group-hover:text-blue-500 transition-all">
             <Plus size={32} />
           </div>
           <div>
             <h4 className="font-black text-slate-900 uppercase text-xs tracking-widest">Add New Release</h4>
             <p className="text-slate-400 text-xs font-medium">Prepare a new announcement for distribution.</p>
           </div>
        </div>
      </div>

      {/* Quick Edit Modal (Simplified) */}
      {isEditing && currentRelease && (
        <div className="fixed inset-0 z-[200] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-10 border-b border-slate-50 flex items-center justify-between">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{currentRelease.title ? 'Edit Release' : 'New Release'}</h3>
                <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-slate-50 rounded-full transition-colors"><X size={24} /></button>
            </div>
            <div className="p-10 space-y-6">
                <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Release Title</label>
                    <input 
                        type="text" 
                        value={currentRelease.title} 
                        onChange={(e) => setCurrentRelease({...currentRelease, title: e.target.value})}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm focus:ring-4 focus:ring-blue-100 transition-all"
                        placeholder="e.g. NHFG Expansion Milestone..."
                    />
                </div>
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Category</label>
                        <select 
                            value={currentRelease.category}
                            onChange={(e) => setCurrentRelease({...currentRelease, category: e.target.value})}
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm"
                        >
                            <option>Corporate</option>
                            <option>Innovation</option>
                            <option>Partnership</option>
                            <option>Logistics</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Status</label>
                        <select 
                            value={currentRelease.status}
                            onChange={(e) => setCurrentRelease({...currentRelease, status: e.target.value as any})}
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm"
                        >
                            <option>Draft</option>
                            <option>Published</option>
                            <option>Scheduled</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Summary / Excerpt</label>
                    <textarea 
                        rows={4}
                        value={currentRelease.excerpt} 
                        onChange={(e) => setCurrentRelease({...currentRelease, excerpt: e.target.value})}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm focus:ring-4 focus:ring-blue-100 transition-all"
                        placeholder="Brief summary of the announcement..."
                    />
                </div>
                <div className="pt-6 flex gap-4">
                    <button 
                        onClick={handleSave}
                        className="flex-1 bg-blue-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20"
                    >
                        Save & Publish
                    </button>
                    <button 
                        onClick={() => setIsEditing(false)}
                        className="flex-1 bg-slate-50 text-slate-400 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all"
                    >
                        Cancel
                    </button>
                </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
