import React, { useState, useEffect, useCallback } from 'react';
import { 
  Target, Users, Send, TrendingUp, Plus, BarChart3, Mail, 
  DollarSign, Share2, CreditCard, X, Edit2, Trash2, Play,
  Pause, CheckCircle, AlertCircle, Eye, MousePointer, RefreshCw,
  Megaphone, MessageSquare, Globe, Filter, ChevronDown
} from 'lucide-react';
import { Tab3DBanner } from '../../components/shared/Tab3DBanner';
import { PaymentApprovalModal } from '../../components/marketing/PaymentApprovalModal';

// ─── Types ───────────────────────────────────────────────────────────────────
interface Campaign {
  id: string;
  name: string;
  status: 'Draft' | 'Active' | 'Paused' | 'Completed' | 'Cancelled';
  type: 'Email' | 'Social' | 'Google Ads' | 'Meta Ads' | 'SMS' | 'Multi-Channel';
  budget: number;
  spend: number;
  roi: number;
  impressions: number;
  clicks: number;
  conversions: number;
  subject_line?: string;
  message_body?: string;
  audience_name?: string;
  audience_id?: string;
  created_at?: string;
}

interface Audience {
  id: string;
  name: string;
  description?: string;
  size: number;
  criteria: Record<string, any>;
  source?: string;
  synced_to_meta?: boolean;
  synced_to_google?: boolean;
}

interface EmailSend {
  id: string;
  subject_line: string;
  audience_name?: string;
  sent_count: number;
  open_count: number;
  click_count: number;
  status: string;
  sent_at: string;
}

interface PaymentTxn {
  id: string;
  campaign_name?: string;
  amount: number;
  status: string;
  stripe_charge_id?: string;
  created_at: string;
}

// ─── API Helpers ─────────────────────────────────────────────────────────────
const API = '/api/marketing';
const headers = () => {
  const token = localStorage.getItem('nhfg_access_token');
  const mock = localStorage.getItem('nhfg_mock_user_id');
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) h['Authorization'] = `Bearer ${token}`;
  if (mock) h['x-mock-user-id'] = mock;
  return h;
};

const apiFetch = async (path: string, opts?: RequestInit) => {
  const res = await fetch(path, { headers: headers(), ...opts });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

// ─── Subcomponents ───────────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Draft: 'bg-amber-50 text-amber-700 border-amber-200',
    Paused: 'bg-slate-100 text-slate-600 border-slate-200',
    Completed: 'bg-blue-50 text-blue-700 border-blue-200',
    Cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
    sent: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    queued: 'bg-amber-50 text-amber-700 border-amber-200',
    succeeded: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    failed: 'bg-rose-50 text-rose-700 border-rose-200',
  };
  return (
    <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${styles[status] || 'bg-slate-50 text-slate-500 border-slate-200'}`}>
      {status}
    </span>
  );
};

// ─── Campaign Creator Modal ────────────────────────────────────────────────
const CampaignModal = ({ audiences, onClose, onCreated }: { audiences: Audience[], onClose: () => void, onCreated: (c: Campaign) => void }) => {
  const [form, setForm] = useState({ name: '', type: 'Email', budget: '', audienceId: '', subjectLine: '', messageBody: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Campaign name is required'); return; }
    setLoading(true);
    try {
      const created = await apiFetch(`${API}/campaigns`, {
        method: 'POST',
        body: JSON.stringify({ name: form.name, type: form.type, budget: parseFloat(form.budget) || 0, audienceId: form.audienceId || undefined, subjectLine: form.subjectLine, messageBody: form.messageBody })
      });
      onCreated(created);
      onClose();
    } catch (e: any) { setError(e.message || 'Failed to create campaign'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-black text-slate-900">New Campaign</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><X size={20} /></button>
        </div>

        {error && <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl px-4 py-3 mb-4"><AlertCircle size={14} />{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Campaign Name *</label>
            <input className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Q4 Freight Drive" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Type</label>
              <select className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                {['Email','Social','Google Ads','Meta Ads','SMS','Multi-Channel'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Budget ($)</label>
              <input type="number" min="0" step="100" className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="5000" value={form.budget} onChange={e => setForm({...form, budget: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Audience</label>
            <select className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.audienceId} onChange={e => setForm({...form, audienceId: e.target.value})}>
              <option value="">No audience selected</option>
              {audiences.map(a => <option key={a.id} value={a.id}>{a.name} ({a.size.toLocaleString()} contacts)</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Subject Line</label>
            <input className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Exclusive Rates Inside..." value={form.subjectLine} onChange={e => setForm({...form, subjectLine: e.target.value})} />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Message Body</label>
            <textarea rows={4} className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Write your campaign message..." value={form.messageBody} onChange={e => setForm({...form, messageBody: e.target.value})} />
          </div>
          <button type="submit" disabled={loading} className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2">
            {loading ? <RefreshCw size={16} className="animate-spin" /> : <Plus size={16} />}
            {loading ? 'Creating...' : 'Create Campaign'}
          </button>
        </form>
      </div>
    </div>
  );
};

// ─── Audience Creator Modal ────────────────────────────────────────────────
const AudienceModal = ({ onClose, onCreated }: { onClose: () => void, onCreated: (a: Audience) => void }) => {
  const [form, setForm] = useState({ name: '', description: '', source: 'Manual', industry: '', minSize: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Audience name is required'); return; }
    setLoading(true);
    try {
      const criteria: Record<string, any> = {};
      if (form.industry) criteria.industry = form.industry;
      if (form.minSize) criteria.min_contacts = parseInt(form.minSize);

      const created = await apiFetch(`${API}/audiences`, {
        method: 'POST',
        body: JSON.stringify({ name: form.name, description: form.description, source: form.source, criteria })
      });
      onCreated(created);
      onClose();
    } catch (e: any) { setError(e.message || 'Failed to create audience'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-black text-slate-900">Create Audience Segment</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><X size={20} /></button>
        </div>

        {error && <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl px-4 py-3 mb-4"><AlertCircle size={14} />{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Segment Name *</label>
            <input className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. High-Value Freight Owners" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Description</label>
            <textarea rows={2} className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" placeholder="Who is this audience?" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Source</label>
              <select className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500" value={form.source} onChange={e => setForm({...form, source: e.target.value})}>
                {['CRM','Analytics','Manual','Import','Ad Platform'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Industry Filter</label>
              <select className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500" value={form.industry} onChange={e => setForm({...form, industry: e.target.value})}>
                <option value="">All Industries</option>
                {['Freight','Insurance','Mortgage','Real Estate','Securities'].map(i => <option key={i}>{i}</option>)}
              </select>
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2">
            {loading ? <RefreshCw size={16} className="animate-spin" /> : <Users size={16} />}
            {loading ? 'Creating...' : 'Create Segment'}
          </button>
        </form>
      </div>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
export const CampaignManager: React.FC = () => {
  type Tab = 'dashboard' | 'campaigns' | 'audiences' | 'email' | 'social' | 'payments';
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [audiences, setAudiences] = useState<Audience[]>([]);
  const [emailSends, setEmailSends] = useState<EmailSend[]>([]);
  const [payments, setPayments] = useState<PaymentTxn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showAudienceModal, setShowAudienceModal] = useState(false);
  const [editCampaign, setEditCampaign] = useState<Campaign | null>(null);
  const [fundCampaign, setFundCampaign] = useState<Campaign | null>(null);
  const [toast, setToast] = useState('');

  // Email Blast state
  const [emailForm, setEmailForm] = useState({ audienceId: '', subjectLine: '', messageBody: '' });
  const [emailSending, setEmailSending] = useState(false);
  const [emailResult, setEmailResult] = useState<{ success: boolean, message: string } | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 4000); };

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const [camp, aud, emails, pay] = await Promise.allSettled([
        apiFetch(`${API}/campaigns`),
        apiFetch(`${API}/audiences`),
        apiFetch(`${API}/email-sends/history`),
        apiFetch(`${API}/payments`),
      ]);
      if (camp.status === 'fulfilled') setCampaigns(camp.value || []);
      if (aud.status === 'fulfilled') setAudiences(aud.value || []);
      if (emails.status === 'fulfilled') setEmailSends(emails.value || []);
      if (pay.status === 'fulfilled') setPayments(pay.value || []);
      if (camp.status === 'rejected') setError('Backend not connected — showing empty state. Run backend server to see live data.');
    } finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Derived dashboard stats
  const totalSpend = campaigns.reduce((s, c) => s + (c.spend || 0), 0);
  const totalRevenue = campaigns.reduce((s, c) => s + (c.spend || 0) * (1 + (c.roi || 0) / 100), 0);
  const avgRoi = campaigns.filter(c => c.roi > 0).reduce((s, c, _, a) => s + c.roi / a.length, 0);
  const totalLeads = campaigns.reduce((s, c) => s + (c.conversions || 0), 0);

  const handleDeleteCampaign = async (id: string) => {
    if (!window.confirm('Delete this campaign?')) return;
    try {
      await apiFetch(`${API}/campaigns/${id}`, { method: 'DELETE' });
      setCampaigns(prev => prev.filter(c => c.id !== id));
      showToast('Campaign deleted');
    } catch { showToast('Failed to delete'); }
  };

  const handleStatusToggle = async (campaign: Campaign) => {
    const newStatus = campaign.status === 'Active' ? 'Paused' : 'Active';
    try {
      const updated = await apiFetch(`${API}/campaigns/${campaign.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      setCampaigns(prev => prev.map(c => c.id === updated.id ? updated : c));
      showToast(`Campaign ${newStatus}`);
    } catch { showToast('Failed to update status'); }
  };

  const handleEmailDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailForm.subjectLine.trim() || !emailForm.messageBody.trim()) {
      setEmailResult({ success: false, message: 'Subject line and message body are required' });
      return;
    }
    setEmailSending(true);
    setEmailResult(null);
    try {
      const result = await apiFetch(`${API}/email-sends`, {
        method: 'POST',
        body: JSON.stringify({ audienceId: emailForm.audienceId || undefined, subjectLine: emailForm.subjectLine, messageBody: emailForm.messageBody })
      });
      const audience = audiences.find(a => a.id === emailForm.audienceId);
      setEmailResult({ success: true, message: `✅ Blast dispatched to ${result.sentCount?.toLocaleString() || audience?.size?.toLocaleString() || 'your'} contacts!` });
      setEmailForm({ audienceId: '', subjectLine: '', messageBody: '' });
      // Refresh email history
      apiFetch(`${API}/email-sends/history`).then(data => setEmailSends(data || [])).catch(() => {});
    } catch (e: any) {
      setEmailResult({ success: false, message: e.message || 'Failed to dispatch email' });
    } finally { setEmailSending(false); }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white text-sm font-bold px-6 py-3 rounded-2xl shadow-2xl animate-in slide-in-from-top-2 duration-300 flex items-center gap-2">
          <CheckCircle size={16} className="text-emerald-400" /> {toast}
        </div>
      )}

      {/* Modals */}
      {showCampaignModal && <CampaignModal audiences={audiences} onClose={() => setShowCampaignModal(false)} onCreated={c => { setCampaigns(prev => [c, ...prev]); showToast('Campaign created!'); }} />}
      {showAudienceModal && <AudienceModal onClose={() => setShowAudienceModal(false)} onCreated={a => { setAudiences(prev => [a, ...prev]); showToast('Audience segment created!'); }} />}
      {fundCampaign && (
        <PaymentApprovalModal
          isOpen={true}
          onClose={() => setFundCampaign(null)}
          campaignId={fundCampaign.id}
          amount={fundCampaign.budget}
          onApprove={async () => {
            await fetchAll();
            setFundCampaign(null);
            showToast('Campaign funded & activated!');
          }}
        />
      )}

      {/* Header & Tabs */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-white/80 backdrop-blur-xl p-8 rounded-3xl border border-slate-200/60 shadow-sm">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
            <div className="p-3 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-2xl shadow-lg shadow-blue-500/30">
              <Target size={28} />
            </div>
            Marketing Hub Pro
          </h1>
          <p className="text-slate-500 font-medium mt-2">Omnichannel campaigns · Audience segments · Email blasts · Budget approvals</p>
        </div>
        <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-full overflow-x-auto">
          {(['dashboard','campaigns','audiences','email','social','payments'] as Tab[]).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 capitalize whitespace-nowrap ${
                activeTab === tab ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-800'
              }`}
            >{tab}</button>
          ))}
        </div>
      </div>

      {/* 3D Banners */}
      <Tab3DBanner cards={[
        { title: 'Active Campaigns', value: `${campaigns.filter(c => c.status === 'Active').length} Live`, subtitle: `$${totalSpend.toLocaleString()} Total Spend`, emoji: '📢', gradient: 'cyan', linkText: 'Manage' },
        { title: 'Total Conversions', value: `${totalLeads.toLocaleString()} Leads`, subtitle: `${avgRoi.toFixed(0)}% Avg ROI`, emoji: '🎯', gradient: 'yellow', linkText: 'View Leads' },
        { title: 'Revenue Generated', value: `$${totalRevenue.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`, subtitle: 'Campaign-attributed revenue', emoji: '🚀', gradient: 'pink', linkText: 'Analytics' },
      ]} />

      {error && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 text-amber-800 text-sm font-semibold px-6 py-4 rounded-2xl">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Content */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/60 shadow-sm p-8 lg:p-10 min-h-[500px]">

        {/* ── DASHBOARD ── */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black text-slate-900">Campaign ROI Dashboard</h3>
              <button onClick={fetchAll} className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-full text-xs font-bold uppercase tracking-widest transition-all">
                <RefreshCw size={13} /> Refresh
              </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Spend YTD', value: `$${totalSpend.toLocaleString()}`, icon: DollarSign, color: 'text-rose-600', bg: 'bg-rose-50' },
                { label: 'Revenue Generated', value: `$${totalRevenue.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { label: 'Avg Campaign ROI', value: `${avgRoi.toFixed(0)}%`, icon: BarChart3, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Total Conversions', value: totalLeads.toLocaleString(), icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
              ].map((stat, i) => (
                <div key={i} className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4`}>
                    <stat.icon size={20} />
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                  <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                </div>
              ))}
            </div>

            <div>
              <h4 className="text-lg font-black text-slate-900 mb-4">All Campaigns at a Glance</h4>
              {isLoading ? (
                <div className="flex items-center justify-center h-32 text-slate-400 font-semibold"><RefreshCw size={20} className="animate-spin mr-2" /> Loading...</div>
              ) : campaigns.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <Megaphone size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="font-semibold">No campaigns yet. Create your first one.</p>
                  <button onClick={() => setShowCampaignModal(true)} className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all">+ New Campaign</button>
                </div>
              ) : (
                <div className="space-y-3">
                  {campaigns.slice(0, 5).map(c => (
                    <div key={c.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
                      <div className="flex items-center gap-3">
                        <StatusBadge status={c.status} />
                        <span className="font-bold text-sm text-slate-900">{c.name}</span>
                        <span className="text-xs text-slate-400 font-semibold">{c.type}</span>
                      </div>
                      <div className="flex items-center gap-6 text-xs font-bold text-slate-600">
                        <span>${(c.spend || 0).toLocaleString()} / ${(c.budget || 0).toLocaleString()}</span>
                        <span className="text-emerald-600">{c.roi > 0 ? `${c.roi}% ROI` : '—'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── CAMPAIGNS ── */}
        {activeTab === 'campaigns' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black text-slate-900">Campaign Creator</h3>
              <button onClick={() => setShowCampaignModal(true)} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
                <Plus size={14} /> New Campaign
              </button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center h-40 text-slate-400"><RefreshCw size={20} className="animate-spin mr-2" /> Loading campaigns...</div>
            ) : campaigns.length === 0 ? (
              <div className="text-center py-20 text-slate-400">
                <Target size={48} className="mx-auto mb-4 opacity-20" />
                <p className="font-bold text-lg">No campaigns found</p>
                <p className="text-sm mt-1">Create your first campaign to get started</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-100">
                <table className="w-full text-left">
                  <thead className="bg-slate-50">
                    <tr>
                      {['Campaign Name','Type','Status','Budget / Spend','ROI','Impressions','Actions'].map(h => (
                        <th key={h} className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {campaigns.map(camp => (
                      <tr key={camp.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-5 py-4">
                          <p className="font-bold text-sm text-slate-900">{camp.name}</p>
                          {camp.audience_name && <p className="text-[10px] text-slate-400 mt-0.5">→ {camp.audience_name}</p>}
                        </td>
                        <td className="px-5 py-4 text-xs font-semibold text-slate-600">{camp.type}</td>
                        <td className="px-5 py-4"><StatusBadge status={camp.status} /></td>
                        <td className="px-5 py-4 font-bold text-sm text-slate-700">
                          ${(camp.spend || 0).toLocaleString()} <span className="text-slate-400 font-normal">/ ${(camp.budget || 0).toLocaleString()}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`font-black text-sm ${camp.roi > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                            {camp.roi > 0 ? `${camp.roi}%` : '—'}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-semibold text-sm text-slate-600">{(camp.impressions || 0).toLocaleString()}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {camp.status === 'Draft' && (
                              <button onClick={() => setFundCampaign(camp)} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-black transition-colors">Fund</button>
                            )}
                            <button onClick={() => handleStatusToggle(camp)} title={camp.status === 'Active' ? 'Pause' : 'Activate'} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-500">
                              {camp.status === 'Active' ? <Pause size={14} /> : <Play size={14} />}
                            </button>
                            <button onClick={() => handleDeleteCampaign(camp.id)} className="p-1.5 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors text-slate-400">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── AUDIENCES ── */}
        {activeTab === 'audiences' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black text-slate-900">Audience Builder</h3>
              <button onClick={() => setShowAudienceModal(true)} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20">
                <Plus size={14} /> Create Segment
              </button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center h-40 text-slate-400"><RefreshCw size={20} className="animate-spin mr-2" /> Loading audiences...</div>
            ) : audiences.length === 0 ? (
              <div className="text-center py-20 text-slate-400">
                <Users size={48} className="mx-auto mb-4 opacity-20" />
                <p className="font-bold text-lg">No audience segments yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {audiences.map(aud => (
                  <div key={aud.id} className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-base text-slate-900">{aud.name}</h4>
                        {aud.description && <p className="text-xs text-slate-500 mt-1">{aud.description}</p>}
                      </div>
                      <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-black whitespace-nowrap">{aud.size.toLocaleString()} contacts</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                      <span className="bg-slate-100 px-2 py-0.5 rounded-md">{aud.source || 'CRM'}</span>
                      {aud.synced_to_meta && <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md">Meta ✓</span>}
                      {aud.synced_to_google && <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded-md">Google ✓</span>}
                    </div>

                    {Object.keys(aud.criteria || {}).length > 0 && (
                      <pre className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-[10px] text-slate-600 font-mono overflow-x-auto">
                        {JSON.stringify(aud.criteria, null, 2)}
                      </pre>
                    )}

                    <button className="w-full py-2.5 bg-white border border-slate-200 hover:bg-indigo-50 hover:border-indigo-200 text-slate-700 hover:text-indigo-700 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex justify-center items-center gap-2">
                      <Share2 size={13} /> Sync to Ad Platforms
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── EMAIL BLAST ── */}
        {activeTab === 'email' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Composer */}
              <div>
                <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                  <Mail size={22} className="text-blue-600" /> Email Blast Composer
                </h3>

                {emailResult && (
                  <div className={`flex items-center gap-2 rounded-2xl px-5 py-4 mb-5 text-sm font-bold ${emailResult.success ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                    {emailResult.success ? <CheckCircle size={16} /> : <AlertCircle size={16} />} {emailResult.message}
                  </div>
                )}

                <form onSubmit={handleEmailDispatch} className="space-y-5 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Target Audience</label>
                    <select className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={emailForm.audienceId} onChange={e => setEmailForm({...emailForm, audienceId: e.target.value})}>
                      <option value="">All subscribers</option>
                      {audiences.map(a => <option key={a.id} value={a.id}>{a.name} ({a.size.toLocaleString()} contacts)</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Subject Line *</label>
                    <input required className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Exclusive Freight Rates Inside..." value={emailForm.subjectLine} onChange={e => setEmailForm({...emailForm, subjectLine: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Message Body *</label>
                    <textarea required rows={8} className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      placeholder="Dear [Name],&#10;&#10;We're excited to share..." value={emailForm.messageBody} onChange={e => setEmailForm({...emailForm, messageBody: e.target.value})} />
                  </div>
                  <button type="submit" disabled={emailSending} className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:opacity-90 disabled:opacity-50 shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2">
                    {emailSending ? <><RefreshCw size={16} className="animate-spin" /> Dispatching...</> : <><Send size={16} /> Dispatch Email Blast</>}
                  </button>
                </form>
              </div>

              {/* Send History */}
              <div>
                <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                  <Eye size={22} className="text-indigo-600" /> Send History
                </h3>
                {emailSends.length === 0 ? (
                  <div className="text-center py-16 text-slate-400 bg-slate-50 rounded-2xl border border-slate-100">
                    <MessageSquare size={36} className="mx-auto mb-3 opacity-20" />
                    <p className="font-semibold text-sm">No emails sent yet</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                    {emailSends.map(es => (
                      <div key={es.id} className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <p className="font-bold text-sm text-slate-900 flex-1 truncate">{es.subject_line}</p>
                          <StatusBadge status={es.status} />
                        </div>
                        <p className="text-xs text-slate-500 mb-3">{es.audience_name || 'All subscribers'} · {new Date(es.sent_at).toLocaleDateString()}</p>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          {[
                            { label: 'Sent', val: es.sent_count, icon: Send, color: 'text-blue-600' },
                            { label: 'Opens', val: es.open_count, icon: Eye, color: 'text-emerald-600' },
                            { label: 'Clicks', val: es.click_count, icon: MousePointer, color: 'text-indigo-600' },
                          ].map(stat => (
                            <div key={stat.label} className="bg-slate-50 rounded-xl p-2">
                              <p className={`font-black text-lg ${stat.color}`}>{stat.val.toLocaleString()}</p>
                              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{stat.label}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── SOCIAL ── */}
        {activeTab === 'social' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h3 className="text-2xl font-black text-slate-900">Social Listening & Mentions</h3>
            <SocialMentions />
          </div>
        )}

        {/* ── PAYMENTS ── */}
        {activeTab === 'payments' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black text-slate-900">Campaign Payments & Billing</h3>
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                <CreditCard size={18} /> Stripe Connected
              </div>
            </div>

            {payments.length === 0 ? (
              <div className="text-center py-20 text-slate-400">
                <DollarSign size={48} className="mx-auto mb-4 opacity-20" />
                <p className="font-bold text-lg">No transactions yet</p>
                <p className="text-sm mt-1">Fund a campaign to see transactions here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {payments.map(txn => (
                  <div key={txn.id} className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-slate-200 transition-colors">
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{txn.campaign_name || 'Campaign'}</p>
                      <p className="text-xs text-slate-400 mt-0.5 font-mono">{txn.stripe_charge_id} · {new Date(txn.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <p className="font-black text-slate-900 text-lg">${(txn.amount || 0).toLocaleString()}</p>
                      <StatusBadge status={txn.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Draft campaigns that need funding */}
            {campaigns.filter(c => c.status === 'Draft' && c.budget > 0).length > 0 && (
              <div className="mt-8">
                <h4 className="text-base font-black text-slate-900 mb-4">Draft Campaigns Awaiting Funding</h4>
                <div className="space-y-3">
                  {campaigns.filter(c => c.status === 'Draft' && c.budget > 0).map(c => (
                    <div key={c.id} className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                      <div>
                        <p className="font-bold text-sm text-slate-900">{c.name}</p>
                        <p className="text-xs text-amber-600 font-semibold mt-0.5">Budget: ${c.budget.toLocaleString()}</p>
                      </div>
                      <button onClick={() => setFundCampaign(c)} className="px-5 py-2.5 bg-indigo-600 text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all">
                        Fund Now
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Social Mentions Subcomponent ─────────────────────────────────────────────
const SocialMentions: React.FC = () => {
  const [mentions, setMentions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch(`${API}/social/mentions`)
      .then(data => setMentions(data || []))
      .catch(() => setMentions([]))
      .finally(() => setLoading(false));
  }, []);

  const sentimentColor = (s: string) => s === 'positive' ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : s === 'negative' ? 'text-rose-600 bg-rose-50 border-rose-200' : 'text-slate-600 bg-slate-50 border-slate-200';
  const platformColor = (p: string) => p.includes('Twitter') || p.includes('X') ? 'bg-slate-900 text-white' : p.includes('LinkedIn') ? 'bg-blue-700 text-white' : p.includes('Facebook') ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white';

  if (loading) return <div className="flex items-center justify-center h-40 text-slate-400"><RefreshCw size={20} className="animate-spin mr-2" /> Loading mentions...</div>;

  return (
    <div className="space-y-4">
      {mentions.map(m => (
        <div key={m.id} className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${platformColor(m.platform)}`}>{m.platform}</span>
              <span className="font-bold text-sm text-slate-900">{m.user}</span>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${sentimentColor(m.sentiment)}`}>{m.sentiment}</span>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed">{m.content}</p>
          <p className="text-xs text-slate-400 mt-2">{new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
        </div>
      ))}
    </div>
  );
};
