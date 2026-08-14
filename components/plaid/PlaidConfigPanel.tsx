import React, { useState, useCallback } from 'react';
import {
  ShieldCheck, CheckCircle, XCircle, RefreshCw, AlertCircle,
  ExternalLink, Eye, EyeOff, Copy, Landmark, Zap, Info
} from 'lucide-react';
import { CompanySettings } from '../../types';

// ─── Types ────────────────────────────────────────────────────────────────────
interface PlaidTestResult {
  ok: boolean;
  env?: string;
  institution?: string;
  linkTokenPreview?: string;
  error?: string;
}

interface Props {
  settingsForm: CompanySettings;
  setSettingsForm: (s: CompanySettings) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export const PlaidConfigPanel: React.FC<Props> = ({ settingsForm, setSettingsForm }) => {
  const [showSecret, setShowSecret] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<PlaidTestResult | null>(null);
  const [copied, setCopied] = useState('');

  // ── Live Connection Test ────────────────────────────────────────────────────
  const handleTest = useCallback(async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const token = localStorage.getItem('nhfg_access_token');
      const mock = localStorage.getItem('nhfg_mock_user_id');
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (mock) headers['x-mock-user-id'] = mock;

      // Test 1: Try to get a link token (real Plaid API call)
      const res = await fetch('/api/plaid/create-link-token', {
        method: 'POST',
        headers,
        body: JSON.stringify({ clientName: 'NHFG Connection Test', userId: 'test-admin' }),
      });

      const data = await res.json();

      if (res.ok && data.link_token) {
        setTestResult({
          ok: true,
          env: settingsForm.plaidEnv || 'production',
          linkTokenPreview: data.link_token.substring(0, 40) + '…',
        });
      } else {
        setTestResult({ ok: false, error: data.error || data.error_message || `HTTP ${res.status}` });
      }
    } catch (e: any) {
      setTestResult({ ok: false, error: e.message });
    } finally {
      setTesting(false);
    }
  }, [settingsForm.plaidEnv]);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  };

  // ── UI ──────────────────────────────────────────────────────────────────────
  return (
    <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-[#0C2340] to-[#1e40af]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center">
            <Landmark size={18} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm">Plaid Banking Integration</p>
            <p className="text-blue-200 text-xs">Real-time ACH · Bank Verification · Balance Checks</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {testResult && (
            <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${testResult.ok ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
              {testResult.ok ? <CheckCircle size={12} /> : <XCircle size={12} />}
              {testResult.ok ? 'Connected' : 'Error'}
            </span>
          )}
          <span className="text-[10px] uppercase font-bold tracking-widest bg-white/20 text-white px-3 py-1.5 rounded-full">
            {(settingsForm.plaidEnv || 'production').toUpperCase()}
          </span>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Status banner */}
        {testResult && (
          <div className={`flex items-start gap-3 rounded-xl px-4 py-3 text-sm ${testResult.ok ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-rose-50 border border-rose-200 text-rose-800'}`}>
            {testResult.ok ? <CheckCircle size={16} className="mt-0.5 shrink-0" /> : <XCircle size={16} className="mt-0.5 shrink-0" />}
            <div>
              {testResult.ok ? (
                <>
                  <p className="font-bold">Plaid is connected and working ✓</p>
                  <p className="text-xs mt-1 font-mono opacity-80">link_token: {testResult.linkTokenPreview}</p>
                </>
              ) : (
                <>
                  <p className="font-bold">Connection failed</p>
                  <p className="text-xs mt-1">{testResult.error}</p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Plaid Client ID</label>
            <div className="relative">
              <input
                type="text"
                placeholder="69acce04b0c813000cd1ba83"
                value={settingsForm.plaidClientId || ''}
                onChange={e => setSettingsForm({ ...settingsForm, plaidClientId: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-slate-700"
              />
              {settingsForm.plaidClientId && (
                <button type="button" onClick={() => copy(settingsForm.plaidClientId!, 'cid')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                  {copied === 'cid' ? <CheckCircle size={14} className="text-emerald-500" /> : <Copy size={14} />}
                </button>
              )}
            </div>
            <p className="text-[10px] text-slate-400">Found at dashboard.plaid.com → Keys</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Plaid Secret Key</label>
            <div className="relative">
              <input
                type={showSecret ? 'text' : 'password'}
                placeholder="Your Plaid secret key"
                value={settingsForm.plaidSecret || ''}
                onChange={e => setSettingsForm({ ...settingsForm, plaidSecret: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 pr-16 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-slate-700"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                <button type="button" onClick={() => setShowSecret(v => !v)} className="text-slate-400 hover:text-slate-700">
                  {showSecret ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                {settingsForm.plaidSecret && (
                  <button type="button" onClick={() => copy(settingsForm.plaidSecret!, 'sec')} className="text-slate-400 hover:text-slate-700">
                    {copied === 'sec' ? <CheckCircle size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  </button>
                )}
              </div>
            </div>
            <p className="text-[10px] text-slate-400">Use the secret for the environment below</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Environment</label>
          <select
            value={settingsForm.plaidEnv || 'production'}
            onChange={e => setSettingsForm({ ...settingsForm, plaidEnv: e.target.value as any })}
            className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="sandbox">Sandbox — Testing with fake banks (no real accounts)</option>
            <option value="development">Development — Real banks, limited items</option>
            <option value="production">Production — Live real bank accounts (deployed)</option>
          </select>
          {settingsForm.plaidEnv === 'production' && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              <AlertCircle size={12} className="text-amber-600 shrink-0" />
              <p className="text-xs text-amber-700 font-semibold">Production mode — ensure you're using your Production Secret key, not the Sandbox one.</p>
            </div>
          )}
        </div>

        {/* Test Button */}
        <button
          type="button"
          onClick={handleTest}
          disabled={testing || !settingsForm.plaidClientId}
          className="w-full flex items-center justify-center gap-2 py-3 bg-[#0C2340] hover:bg-[#1e3a5f] disabled:opacity-50 text-white rounded-xl text-sm font-bold uppercase tracking-wider transition-all"
        >
          {testing ? <RefreshCw size={15} className="animate-spin" /> : <Zap size={15} />}
          {testing ? 'Testing Plaid Connection…' : 'Test Live Plaid Connection'}
        </button>

        {/* How it works */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
          <p className="text-xs font-bold text-blue-800 flex items-center gap-1.5"><Info size={12} /> HOW BANK VERIFICATION WORKS IN YOUR CRM</p>
          <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside leading-relaxed">
            <li>Advisor opens <strong>CRM → Bank Verification</strong> and enters client name + email</li>
            <li>System generates a secure, expiring link and sends it to client via Email or SMS</li>
            <li>Client clicks the link → Plaid Link widget opens on their device</li>
            <li>Client selects their bank and logs in <em>directly with their bank</em> (NHFG never sees credentials)</li>
            <li>Plaid returns account routing/mask data → saved to database with verification status</li>
            <li>Advisor sees real-time update in the verification dashboard</li>
          </ol>
        </div>

        {/* Vercel env guide */}
        <details className="bg-slate-100 rounded-xl">
          <summary className="px-4 py-3 text-xs font-bold text-slate-700 cursor-pointer select-none flex items-center gap-2">
            <ExternalLink size={12} /> Vercel Production Environment Variables (click to expand)
          </summary>
          <div className="px-4 pb-4 space-y-2">
            <p className="text-xs text-slate-500 mt-2">Set these in your <strong>Vercel Dashboard → Project → Settings → Environment Variables</strong>:</p>
            {[
              { key: 'PLAID_CLIENT_ID', val: '69acce04b0c813000cd1ba83' },
              { key: 'PLAID_SECRET', val: 'c024ff72dbf79cb87c4b73427a92da' },
              { key: 'PLAID_ENV', val: 'production' },
              { key: 'PLAID_PRODUCTS', val: 'auth' },
              { key: 'PLAID_COUNTRY_CODES', val: 'US' },
            ].map(({ key, val }) => (
              <div key={key} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-slate-200">
                <span className="font-mono text-xs text-slate-700 font-bold">{key}</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-slate-500 truncate max-w-[180px]">{key.includes('SECRET') ? '•••••••••••••••' : val}</span>
                  <button type="button" onClick={() => copy(val, key)} className="text-slate-400 hover:text-slate-700">
                    {copied === key ? <CheckCircle size={12} className="text-emerald-500" /> : <Copy size={12} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </details>
      </div>
    </div>
  );
};
