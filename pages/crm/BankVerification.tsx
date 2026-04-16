/**
 * NHFG — Bank Verification Page
 * ─────────────────────────────────────────────────────────────────────────────
 * Production-ready Plaid integration for internal staff use.
 *
 * Plaid Link flow:
 *  1. Advisor clicks "Verify via Plaid" → enters client name
 *  2. Frontend calls POST /api/plaid/create-link-token (backend → Plaid)
 *  3. usePlaidLink() opens the real Plaid Link widget
 *  4. Client selects bank + authenticates directly with their bank (OAuth or credentials)
 *  5. Plaid returns a one-time public_token to onSuccess callback
 *  6. Frontend calls POST /api/plaid/exchange-token (backend exchanges token, calls Auth,
 *     stores access_token in DB, returns masked metadata)
 *  7. Verification record saved to PostgreSQL — status: "verified"
 *
 * Manual ACH flow:
 *  1. Advisor clicks "Manual ACH Entry"
 *  2. Fills in client info + bank details (routing #, last 4 of account only)
 *  3. Backend validates ABA checksum on routing number
 *  4. Record saved with status: "micro_deposit" (awaiting 2 small deposits)
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlaidLink } from 'react-plaid-link';
import {
    ShieldCheck, CheckCircle2, XCircle, Clock, Search,
    ChevronDown, Landmark, RefreshCw, Eye, EyeOff, Info,
    Loader2, TrendingUp, BadgeCheck, User, Phone, Mail,
    Hash, ArrowRight, AlertTriangle, AlertCircle, Wifi, WifiOff,
    Edit2, Trash2, RotateCcw,
} from 'lucide-react';
import ConfirmModal from '../../components/shared/ConfirmModal';
import { useData } from '../../context/DataContext';
import {
    BankVerificationService,
    VerificationRecord,
    ManualVerificationPayload,
} from '../../services/bankingService';
import { socketService } from '../../services/socketService';

// ─── Sub-components ───────────────────────────────────────────────────────────

type VerifStatus = VerificationRecord['status'];

const STATUS_CFG: Record<VerifStatus, { text: string; bg: string; color: string; dot: string }> = {
    verified: { text: 'Verified', bg: '#ecfdf5', color: '#065f46', dot: '#10b981' },
    failed: { text: 'Failed', bg: '#fff1f2', color: '#9f1239', dot: '#f43f5e' },
    pending: { text: 'Pending', bg: '#fefce8', color: '#854d0e', dot: '#eab308' },
    micro_deposit: { text: 'Micro-Deposit', bg: '#eff6ff', color: '#1e40af', dot: '#3b82f6' },
};

const RISK_CFG = {
    low: { label: 'Low Risk', bg: '#ecfdf5', color: '#065f46' },
    medium: { label: 'Med Risk', bg: '#fefce8', color: '#92400e' },
    high: { label: 'High Risk', bg: '#fff1f2', color: '#9f1239' },
};

const StatusBadge = ({ status }: { status: VerifStatus }) => {
    const c = (status && STATUS_CFG[status]) ? STATUS_CFG[status] : STATUS_CFG.pending;
    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, backgroundColor: c.bg, color: c.color, padding: '3px 10px', borderRadius: 99, fontSize: 11.5, fontWeight: 600 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: c.dot, display: 'inline-block' }} />
            {c.text}
        </span>
    );
};

const RiskBadge = ({ risk }: { risk: 'low' | 'medium' | 'high' }) => {
    const c = RISK_CFG[risk];
    return <span style={{ backgroundColor: c.bg, color: c.color, fontSize: 10.5, fontWeight: 700, padding: '2px 8px', borderRadius: 99 }}>{c.label}</span>;
};

const Stat = ({ label, value, Icon, color, bg }: any) => (
    <div style={{ background: '#fff', borderRadius: 16, padding: '18px 20px', border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.8 }}>{label}</p>
            <div style={{ width: 32, height: 32, background: bg, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={16} color={color} />
            </div>
        </div>
        <p style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>{value}</p>
    </div>
);

// ─── Plaid Link Hook wrapper ───────────────────────────────────────────────────

interface PlaidLinkButtonProps {
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    onVerified: (record: VerificationRecord) => void;
    onError: (msg: string) => void;
    onClose: () => void;
}

const PlaidLinkButton: React.FC<PlaidLinkButtonProps> = ({
    clientName, clientEmail, clientPhone, onVerified, onError, onClose,
}) => {
    const { user } = useData();
    const [linkToken, setLinkToken] = useState<string | null>(null);
    const [loadingToken, setLoadingToken] = useState(true);
    const [tokenError, setTokenError] = useState<string | null>(null);

    // Fetch a fresh link token every time this component mounts
    useEffect(() => {
        const fetch = async () => {
            const { data, error } = await BankVerificationService.createLinkToken(clientName, user?.id);
            if (error || !data) {
                setTokenError(error || 'Failed to get link token');
            } else {
                setLinkToken(data.link_token);
            }
            setLoadingToken(false);
        };
        fetch();
    }, [clientName, user?.id]);

    const onSuccess = useCallback(async (publicToken: string, metadata: any) => {
        const institution = metadata?.institution || {};
        const accounts = metadata?.accounts || [];
        const firstAcct = accounts[0] || {};

        const { data, error } = await BankVerificationService.exchangeToken({
            publicToken,
            institutionId: institution.institution_id,
            institutionName: institution.name,
            clientName,
            clientEmail,
            clientPhone,
            accountId: firstAcct.id,
        });

        if (error || !data) {
            onError(error || 'Failed to exchange token');
            return;
        }

        // Optimistically construct a VerificationRecord to display immediately
        onVerified({
            id: data.verificationId,
            client_name: clientName,
            client_email: clientEmail,
            client_phone: clientPhone,
            institution_name: data.institutionName || institution.name || 'Bank',
            account_mask: data.accountMask,
            account_type: data.accountType as any,
            routing_number: data.routingNumber || undefined,
            status: 'verified',
            verification_method: 'plaid',
            name_match: data.nameMatch,
            account_active: data.accountActive,
            draft_risk: data.draftRisk,
            created_at: new Date().toISOString(),
            verified_at: new Date().toISOString(),
            verified_by: user?.name,
        });
    }, [clientName, clientEmail, clientPhone, onVerified, onError, user?.name]);

    const config = {
        token: linkToken || '',
        onSuccess,
        onExit: onClose,
    };

    const { open, ready } = usePlaidLink(config);

    if (loadingToken) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#6b7280', fontSize: 13 }}>
                <Loader2 size={18} className="animate-spin" /> Preparing Plaid Link…
            </div>
        );
    }

    if (tokenError) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f43f5e', fontSize: 13 }}>
                    <AlertCircle size={16} /> {tokenError}
                </div>
                <p style={{ fontSize: 12, color: '#6b7280' }}>Make sure <code>PLAID_CLIENT_ID</code> and <code>PLAID_SECRET</code> are set in <strong>Website Settings</strong>.</p>
            </div>
        );
    }

    return (
        <button
            onClick={() => open()}
            disabled={!ready}
            style={{
                width: '100%', padding: '13px',
                background: ready ? 'linear-gradient(135deg,#0C2340,#1e40af)' : '#e5e7eb',
                color: ready ? '#fff' : '#9ca3af',
                border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700,
                cursor: ready ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: ready ? '0 4px 16px rgba(30,64,175,0.3)' : 'none',
                transition: 'all 0.2s',
            }}
        >
            <Landmark size={16} /> {ready ? 'Open Plaid Bank Link' : 'Loading…'}
        </button>
    );
};

// ─── Plaid Setup Modal — 3-step: Info → Send → Sent ──────────────────────────

const PlaidSetupModal: React.FC<{
    onVerified: (r: VerificationRecord) => void;
    onError: (m: string) => void;
    onClose: () => void;
}> = ({ onVerified, onError, onClose }) => {
    type Step = 'info' | 'send' | 'sent';
    const [step, setStep] = useState<Step>('info');
    const [sending, setSending] = useState(false);
    const [sendResult, setSendResult] = useState<any>(null);
    const [form, setForm] = useState({
        clientName: '', clientEmail: '', clientPhone: '',
        sendVia: 'email' as 'email' | 'sms' | 'both',
        customMessage: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const DEFAULT_MSG = (name: string) =>
        `Hi ${name || '[Client Name]'}, New Holland Financial Group needs to verify your bank account to confirm your name matches and prevent unauthorized ACH drafts. This is free and takes about 2 minutes. You will NOT be charged.`;

    const validateInfo = () => {
        const e: Record<string, string> = {};
        if (!form.clientName.trim()) e.clientName = 'Required';
        if (form.sendVia !== 'sms' && !form.clientEmail.trim()) e.clientEmail = 'Required for email';
        if (form.sendVia !== 'email' && !form.clientPhone.trim()) e.clientPhone = 'Required for SMS';
        setErrors(e);
        return !Object.keys(e).length;
    };

    const handleSend = async () => {
        if (!validateInfo()) return;
        setSending(true);

        const token = localStorage.getItem('nhfg_access_token');
        try {
            const res = await fetch('/api/plaid/send-link', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                body: JSON.stringify({
                    clientName: form.clientName,
                    clientEmail: form.clientEmail || undefined,
                    clientPhone: form.clientPhone || undefined,
                    sendVia: form.sendVia,
                    customMessage: form.customMessage || DEFAULT_MSG(form.clientName),
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to send link');
            setSendResult(data);
            setStep('sent');
        } catch (err: any) {
            onError(err.message);
        } finally {
            setSending(false);
        }
    };

    const field = (label: string, key: keyof typeof form, type = 'text', ph = '') => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 11.5, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</label>
            <input
                type={type} placeholder={ph}
                value={form[key] as string}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                style={{ padding: '9px 12px', border: `1.5px solid ${errors[key] ? '#f43f5e' : '#e5e7eb'}`, borderRadius: 8, fontSize: 13, outline: 'none' }}
            />
            {errors[key] && <span style={{ fontSize: 11, color: '#f43f5e' }}>{errors[key]}</span>}
        </div>
    );

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={onClose}>
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                style={{ width: 500, maxHeight: '90vh', overflowY: 'auto', background: '#fff', borderRadius: 20, overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.25)' }}
            >
                {/* Header */}
                <div style={{ background: 'linear-gradient(135deg,#0C2340 0%,#1e40af 100%)', padding: '24px 28px', color: '#fff' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, background: '#fff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Landmark size={18} color="#1e40af" />
                        </div>
                        <div>
                            <p style={{ fontSize: 11, opacity: 0.7, letterSpacing: 1, margin: 0 }}>POWERED BY PLAID — REAL-TIME ACH VERIFICATION</p>
                            <p style={{ fontSize: 15, fontWeight: 700, margin: '2px 0 0' }}>
                                {step === 'info' ? 'Enter Client Information' :
                                    step === 'send' ? 'Send Verification Link' : '✅ Link Sent!'}
                            </p>
                        </div>
                    </div>
                    {/* Step indicator */}
                    <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                        {(['info', 'send', 'sent'] as Step[]).map((s, i) => (
                            <div key={s} style={{ height: 3, flex: 1, borderRadius: 99, background: step === 'sent' ? '#10b981' : i <= ['info', 'send', 'sent'].indexOf(step) ? '#fff' : 'rgba(255,255,255,0.3)', transition: 'background .3s' }} />
                        ))}
                    </div>
                </div>

                <div style={{ padding: 28, overflowY: 'auto' }}>
                    {/* ── STEP 1: Info ── */}
                    {step === 'info' && (
                        <>
                            <p style={{ fontSize: 13, color: '#374151', marginBottom: 18, fontWeight: 500 }}>
                                Enter the client's details. You'll send them a secure link so they can connect their bank from their own device.
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                {field('Client Full Name *', 'clientName', 'text', 'John Doe')}
                                {field('Client Email', 'clientEmail', 'email', 'john@email.com')}
                                {field('Client Phone', 'clientPhone', 'tel', '(504) 555-0100')}

                                {/* Send via selector */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                    <label style={{ fontSize: 11.5, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: 0.5 }}>Send Link Via *</label>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        {(['email', 'sms', 'both'] as const).map(opt => (
                                            <button key={opt} onClick={() => setForm(f => ({ ...f, sendVia: opt }))}
                                                style={{ flex: 1, padding: '8px 0', borderRadius: 8, border: `2px solid ${form.sendVia === opt ? '#1e40af' : '#e5e7eb'}`, background: form.sendVia === opt ? '#eff6ff' : '#fff', color: form.sendVia === opt ? '#1e40af' : '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all .15s', textTransform: 'capitalize' }}>
                                                {opt === 'email' ? '📧 Email' : opt === 'sms' ? '📱 SMS' : '📧+📱 Both'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '10px 14px', marginTop: 18, display: 'flex', gap: 8 }}>
                                <ShieldCheck size={15} color="#16a34a" style={{ flexShrink: 0, marginTop: 2 }} />
                                <p style={{ fontSize: 12, color: '#14532d', lineHeight: 1.5, margin: 0 }}>
                                    The client will verify their bank <strong>from their own device</strong>. NHFG never sees their credentials.
                                </p>
                            </div>

                            <button
                                onClick={() => validateInfo() && setStep('send')}
                                style={{ marginTop: 20, width: '100%', padding: '12px', background: 'linear-gradient(135deg,#0C2340,#1e40af)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                            >
                                Continue <ArrowRight size={16} />
                            </button>
                        </>
                    )}

                    {/* ── STEP 2: Send ── */}
                    {step === 'send' && (
                        <>
                            {/* Client summary */}
                            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px 16px', marginBottom: 20 }}>
                                <p style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>{form.clientName}</p>
                                {form.clientEmail && <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 2px' }}>📧 {form.clientEmail}</p>}
                                {form.clientPhone && <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>📱 {form.clientPhone}</p>}
                            </div>

                            {/* Custom message */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
                                <label style={{ fontSize: 11.5, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: 0.5 }}>Custom Message (optional)</label>
                                <textarea
                                    rows={4}
                                    placeholder={DEFAULT_MSG(form.clientName)}
                                    value={form.customMessage}
                                    onChange={e => setForm(f => ({ ...f, customMessage: e.target.value }))}
                                    style={{ padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 13, resize: 'vertical', outline: 'none', fontFamily: 'inherit', lineHeight: 1.6 }}
                                />
                                <p style={{ fontSize: 11, color: '#9ca3af' }}>Leave blank to use the default fraud-prevention message.</p>
                            </div>

                            {/* Preview */}
                            <div style={{ background: '#fffbeb', border: '1.5px solid #fcd34d', borderRadius: 10, padding: '12px 16px', marginBottom: 20 }}>
                                <p style={{ fontSize: 11, fontWeight: 700, color: '#92400e', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 8px' }}>📋 Message Preview</p>
                                <p style={{ fontSize: 13, color: '#292524', lineHeight: 1.6, margin: 0 }}>
                                    {form.customMessage || DEFAULT_MSG(form.clientName)}
                                </p>
                                <p style={{ fontSize: 12, color: '#78716c', marginTop: 8, margin: '8px 0 0' }}>
                                    🔗 A secure Plaid verification link will be attached. Expires in 48 hours.
                                </p>
                            </div>

                            <button
                                onClick={handleSend}
                                disabled={sending}
                                style={{ width: '100%', padding: '13px', background: sending ? '#e5e7eb' : 'linear-gradient(135deg,#0C2340,#1e40af)', color: sending ? '#9ca3af' : '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: sending ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                            >
                                {sending ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Sending…</> : `📤 Send via ${form.sendVia === 'both' ? 'Email & SMS' : form.sendVia === 'email' ? 'Email' : 'SMS'}`}
                            </button>
                            <button onClick={() => setStep('info')} style={{ marginTop: 10, width: '100%', padding: '10px', background: '#f1f5f9', color: '#374151', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                                ← Back
                            </button>
                        </>
                    )}

                    {/* ── STEP 3: Sent Confirmation ── */}
                    {step === 'sent' && sendResult && (
                        <>
                            <div style={{ textAlign: 'center', padding: '8px 0 24px' }}>
                                <div style={{ width: 64, height: 64, background: '#f0fdf4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                    <CheckCircle2 size={36} color="#16a34a" />
                                </div>
                                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>Link Sent Successfully!</h3>
                                <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6, margin: 0 }}>
                                    {form.clientName} will receive their verification link and can complete it at their convenience.
                                </p>
                            </div>

                            {/* Delivery summary */}
                            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '16px' }}>
                                <p style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 12px' }}>Delivery Summary</p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {[
                                        ['Client', form.clientName],
                                        ['Sent Via', form.sendVia === 'both' ? 'Email + SMS' : form.sendVia === 'email' ? '📧 Email' : '📱 SMS'],
                                        ['Expires', new Date(sendResult.expiresAt).toLocaleString()],
                                        ['Status', sendResult._simulated ? '⚠️ Simulated (no SMTP/Twilio configured)' : '✅ Delivered'],
                                    ].map(([l, v]) => (
                                        <div key={l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <span style={{ fontSize: 12, color: '#6b7280' }}>{l}</span>
                                            <span style={{ fontSize: 12, fontWeight: 600, color: '#111827', textAlign: 'right', maxWidth: '60%' }}>{v}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Shareable link (advisor can copy if email/SMS not set up) */}
                            {sendResult.verifyUrl && (
                                <div style={{ marginTop: 16 }}>
                                    <p style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>📎 Share Link Manually</p>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <input readOnly value={sendResult.verifyUrl} style={{ flex: 1, padding: '8px 10px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 11, color: '#374151', background: '#f8fafc', outline: 'none' }} />
                                        <button onClick={() => navigator.clipboard.writeText(sendResult.verifyUrl)} style={{ padding: '8px 14px', background: '#1e40af', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                                            Copy
                                        </button>
                                    </div>
                                    {sendResult._simulated && (
                                        <p style={{ fontSize: 11, color: '#d97706', marginTop: 6 }}>
                                            ⚠️ Email/SMS not configured — copy the link above and share it with the client manually. Add SMTP/Twilio credentials to .env to enable real sending.
                                        </p>
                                    )}
                                </div>
                            )}

                            <button onClick={onClose} style={{ marginTop: 20, width: '100%', padding: '12px', background: 'linear-gradient(135deg,#0C2340,#1e40af)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                                Done
                            </button>
                        </>
                    )}
                </div>

                <div style={{ padding: '12px 28px', borderTop: '1px solid #f1f5f9', background: '#f9fafb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: '#9ca3af' }}>🔒 256-bit TLS · Bank-grade OAuth · NACHA Compliant</span>
                    {step !== 'sent' && <button onClick={onClose} style={{ fontSize: 12, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}>Cancel</button>}
                </div>
            </motion.div>
        </div>
    );
};



// ─── Manual ACH Form ──────────────────────────────────────────────────────────

/** ABA checksum — same algorithm as the backend validateABA() */
const validateABA = (n: string): boolean => {
    if (!n || n.length !== 9 || !/^\d{9}$/.test(n)) return false;
    const d = n.split('').map(Number);
    const sum = 3 * (d[0] + d[3] + d[6])
              + 7 * (d[1] + d[4] + d[7])
              + 1 * (d[2] + d[5] + d[8]);
    return sum % 10 === 0;
};

const ManualForm: React.FC<{
    onSave: (record: VerificationRecord) => void;
    onError: (m: string) => void;
    onClose: () => void;
}> = ({ onSave, onError, onClose }) => {
    const [showAcct, setShowAcct] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [form, setForm] = useState<{
        clientName: string; clientEmail: string; clientPhone: string;
        institutionName: string; routingNumber: string;
        accountNumber: string; confirmAccount: string;
        accountType: 'checking' | 'savings'; notes: string;
    }>({
        clientName: '', clientEmail: '', clientPhone: '',
        institutionName: '', routingNumber: '',
        accountNumber: '', confirmAccount: '',
        accountType: 'checking', notes: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Real-time routing number status
    const routingStatus = (() => {
        if (!form.routingNumber) return null;
        if (!/^\d{9}$/.test(form.routingNumber)) return 'format';
        if (!validateABA(form.routingNumber)) return 'invalid';
        return 'valid';
    })();

    const validate = () => {
        const e: Record<string, string> = {};
        if (!form.clientName.trim()) e.clientName = 'Required';
        if (!form.institutionName.trim()) e.institutionName = 'Required';
        if (routingStatus !== 'valid') e.routingNumber =
            routingStatus === 'format' ? 'Must be exactly 9 digits' : 'Routing number fails ABA checksum — verify and try again';
        if (form.accountNumber.length < 4) e.accountNumber = 'Account number must be at least 4 digits';
        if (!/^\d+$/.test(form.accountNumber)) e.accountNumber = 'Must contain digits only';
        if (form.accountNumber !== form.confirmAccount) e.confirmAccount = "Numbers don't match — re-enter carefully";
        setErrors(e);
        return !Object.keys(e).length;
    };

    const handleSubmit = async () => {
        setSubmitError(null);
        if (!validate()) return;
        setSaving(true);

        const mask = form.accountNumber.slice(-4);
        const payload: ManualVerificationPayload = {
            clientName: form.clientName,
            clientEmail: form.clientEmail || undefined,
            clientPhone: form.clientPhone || undefined,
            institutionName: form.institutionName,
            accountMask: mask,
            accountType: form.accountType,
            routingNumber: form.routingNumber,
            notes: form.notes || undefined,
        };

        const { data, error } = await BankVerificationService.saveManual(payload);
        setSaving(false);

        if (error || !data) {
            setSubmitError(error || 'Failed to save verification. Please try again.');
            return;
        }

        onSave(data);
        onClose();
    };

    const inputStyle = (key: string): React.CSSProperties => ({
        padding: '9px 12px',
        border: `1.5px solid ${errors[key] ? '#f43f5e' : '#e5e7eb'}`,
        borderRadius: 8,
        fontSize: 13,
        outline: 'none',
        width: '100%',
        boxSizing: 'border-box',
        transition: 'border-color 0.15s',
        background: errors[key] ? '#fff8f8' : '#fff',
    });

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={onClose}>
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                onClick={e => e.stopPropagation()}
                style={{ width: 600, background: '#fff', borderRadius: 20, overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.25)', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}
            >
                {/* Header */}
                <div style={{ padding: '20px 28px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                    <div>
                        <p style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', margin: 0 }}>Manual ACH Verification</p>
                        <p style={{ fontSize: 12, color: '#6b7280', marginTop: 3 }}>Enter client banking details · ABA routing checksum validated in real-time</p>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 4 }}><XCircle size={22} /></button>
                </div>

                {/* Scrollable body */}
                <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 18, overflowY: 'auto', flex: 1 }}>

                    {/* ── Client Information ── */}
                    <div>
                        <p style={{ fontSize: 10.5, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 12 }}>Client Information</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            {/* Full Name */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, gridColumn: '1 / -1' }}>
                                <label style={{ fontSize: 11.5, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: 0.5 }}>Full Name *</label>
                                <input
                                    type="text" placeholder="John Doe"
                                    value={form.clientName}
                                    onChange={e => setForm(f => ({ ...f, clientName: e.target.value }))}
                                    style={inputStyle('clientName')}
                                />
                                {errors.clientName && <span style={{ fontSize: 11, color: '#f43f5e' }}>{errors.clientName}</span>}
                            </div>
                            {/* Email */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <label style={{ fontSize: 11.5, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: 0.5 }}>Email</label>
                                <input
                                    type="email" placeholder="john@email.com"
                                    value={form.clientEmail}
                                    onChange={e => setForm(f => ({ ...f, clientEmail: e.target.value }))}
                                    style={inputStyle('clientEmail')}
                                />
                            </div>
                            {/* Phone */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <label style={{ fontSize: 11.5, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: 0.5 }}>Phone</label>
                                <input
                                    type="tel" placeholder="(504) 555-0100"
                                    value={form.clientPhone}
                                    onChange={e => setForm(f => ({ ...f, clientPhone: e.target.value }))}
                                    style={inputStyle('clientPhone')}
                                />
                            </div>
                        </div>
                    </div>

                    <div style={{ height: 1, background: '#f1f5f9' }} />

                    {/* ── Banking Details ── */}
                    <div>
                        <p style={{ fontSize: 10.5, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 12 }}>Banking Details</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            {/* Institution */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <label style={{ fontSize: 11.5, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: 0.5 }}>Bank / Institution *</label>
                                <input
                                    type="text" placeholder="Bank of America"
                                    value={form.institutionName}
                                    onChange={e => setForm(f => ({ ...f, institutionName: e.target.value }))}
                                    style={inputStyle('institutionName')}
                                />
                                {errors.institutionName && <span style={{ fontSize: 11, color: '#f43f5e' }}>{errors.institutionName}</span>}
                            </div>

                            {/* Routing Number with real-time ABA check */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <label style={{ fontSize: 11.5, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                    Routing Number (ABA) *
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="text" placeholder="021000021"
                                        maxLength={9}
                                        value={form.routingNumber}
                                        onChange={e => {
                                            const v = e.target.value.replace(/\D/g, '').slice(0, 9);
                                            setForm(f => ({ ...f, routingNumber: v }));
                                            if (errors.routingNumber) setErrors(prev => ({ ...prev, routingNumber: '' }));
                                        }}
                                        style={{
                                            ...inputStyle('routingNumber'),
                                            paddingRight: 32,
                                            borderColor: routingStatus === 'valid' ? '#10b981' : routingStatus === 'invalid' ? '#f43f5e' : errors.routingNumber ? '#f43f5e' : '#e5e7eb',
                                            background: routingStatus === 'valid' ? '#f0fdf4' : routingStatus === 'invalid' ? '#fff8f8' : '#fff',
                                        }}
                                    />
                                    {/* Inline ABA status icon */}
                                    {form.routingNumber.length > 0 && (
                                        <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 14 }}>
                                            {routingStatus === 'valid' ? '✅' : routingStatus === 'invalid' ? '❌' : '…'}
                                        </span>
                                    )}
                                </div>
                                {/* Real-time routing feedback */}
                                {routingStatus === 'valid' && (
                                    <span style={{ fontSize: 11, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <CheckCircle2 size={11} /> Valid ABA routing number
                                    </span>
                                )}
                                {routingStatus === 'invalid' && (
                                    <span style={{ fontSize: 11, color: '#f43f5e', display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <AlertCircle size={11} /> Fails ABA checksum — check the number
                                    </span>
                                )}
                                {errors.routingNumber && routingStatus !== 'invalid' && (
                                    <span style={{ fontSize: 11, color: '#f43f5e' }}>{errors.routingNumber}</span>
                                )}
                            </div>

                            {/* Account Type */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, gridColumn: '1 / -1' }}>
                                <label style={{ fontSize: 11.5, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: 0.5 }}>Account Type</label>
                                <div style={{ display: 'flex', gap: 10 }}>
                                    {(['checking', 'savings'] as const).map(t => (
                                        <button key={t} onClick={() => setForm(f => ({ ...f, accountType: t }))} style={{
                                            flex: 1, padding: '10px',
                                            border: `2px solid ${form.accountType === t ? '#3b82f6' : '#e5e7eb'}`,
                                            borderRadius: 8,
                                            background: form.accountType === t ? '#eff6ff' : '#fff',
                                            color: form.accountType === t ? '#1d4ed8' : '#6b7280',
                                            fontWeight: 700, fontSize: 13, cursor: 'pointer', textTransform: 'capitalize',
                                            transition: 'all 0.15s',
                                        }}>
                                            {t === 'checking' ? '🏦 Checking' : '💰 Savings'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Account Number */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <label style={{ fontSize: 11.5, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: 0.5 }}>Account Number *</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showAcct ? 'text' : 'password'}
                                        placeholder="Full account number"
                                        value={form.accountNumber}
                                        inputMode="numeric"
                                        onChange={e => setForm(f => ({ ...f, accountNumber: e.target.value }))}
                                        style={{ ...inputStyle('accountNumber'), paddingRight: 36 }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowAcct(s => !s)}
                                        style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}
                                    >
                                        {showAcct ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                </div>
                                {errors.accountNumber && <span style={{ fontSize: 11, color: '#f43f5e' }}>{errors.accountNumber}</span>}
                            </div>

                            {/* Confirm Account Number */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <label style={{ fontSize: 11.5, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: 0.5 }}>Confirm Account *</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showConfirm ? 'text' : 'password'}
                                        placeholder="Re-enter account number"
                                        value={form.confirmAccount}
                                        inputMode="numeric"
                                        onChange={e => setForm(f => ({ ...f, confirmAccount: e.target.value }))}
                                        style={{
                                            ...inputStyle('confirmAccount'),
                                            paddingRight: 36,
                                            borderColor: form.confirmAccount && form.accountNumber && form.confirmAccount === form.accountNumber
                                                ? '#10b981'
                                                : errors.confirmAccount ? '#f43f5e' : '#e5e7eb',
                                            background: form.confirmAccount && form.accountNumber && form.confirmAccount === form.accountNumber
                                                ? '#f0fdf4' : errors.confirmAccount ? '#fff8f8' : '#fff',
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm(s => !s)}
                                        style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}
                                    >
                                        {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                </div>
                                {form.confirmAccount && form.accountNumber && form.confirmAccount === form.accountNumber && (
                                    <span style={{ fontSize: 11, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <CheckCircle2 size={11} /> Account numbers match
                                    </span>
                                )}
                                {errors.confirmAccount && <span style={{ fontSize: 11, color: '#f43f5e' }}>{errors.confirmAccount}</span>}
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <label style={{ fontSize: 11.5, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: 0.5 }}>Notes (optional)</label>
                        <textarea
                            placeholder="Any notes for the verification team (e.g. client confirmed via phone on 4/3/26)..."
                            value={form.notes}
                            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                            rows={2}
                            style={{ padding: '9px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', resize: 'vertical', width: '100%', boxSizing: 'border-box', fontFamily: 'inherit' }}
                        />
                    </div>

                    {/* Security Note */}
                    <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '10px 14px', display: 'flex', gap: 8 }}>
                        <Info size={15} color="#d97706" style={{ flexShrink: 0, marginTop: 2 }} />
                        <p style={{ fontSize: 12, color: '#92400e', lineHeight: 1.6, margin: 0 }}>
                            Manual entries go into <strong>Micro-Deposit</strong> status pending confirmation. The routing number is validated using the ABA mod-10 checksum.{' '}
                            <strong>Only the last 4 digits</strong> of the account number are stored — the full number is <em>never</em> saved to the database.
                        </p>
                    </div>

                    {/* Inline submit error */}
                    {submitError && (
                        <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 10, padding: '10px 14px', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                            <AlertTriangle size={15} color="#f43f5e" style={{ flexShrink: 0, marginTop: 2 }} />
                            <p style={{ fontSize: 12, color: '#9f1239', margin: 0, lineHeight: 1.5 }}>{submitError}</p>
                        </div>
                    )}

                    {/* Submit button */}
                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        style={{
                            width: '100%', padding: '13px',
                            background: saving ? '#e5e7eb' : 'linear-gradient(135deg,#0C2340,#1e40af)',
                            color: saving ? '#9ca3af' : '#fff',
                            border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700,
                            cursor: saving ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            transition: 'opacity 0.15s',
                        }}
                    >
                        {saving
                            ? <><Loader2 size={16} className="animate-spin" /> Submitting…</>
                            : <><Landmark size={16} /> Submit Manual Verification</>
                        }
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

// ─── Edit Info Form ──────────────────────────────────────────────────────────

const EditForm: React.FC<{
    record: VerificationRecord;
    onSave: (record: VerificationRecord) => void;
    onError: (m: string) => void;
    onClose: () => void;
}> = ({ record, onSave, onError, onClose }) => {
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        client_name: record.client_name || '',
        client_email: record.client_email || '',
        client_phone: record.client_phone || '',
        institution_name: record.institution_name || '',
        routing_number: record.routing_number || '',
        account_mask: record.account_mask || '',
        notes: record.notes || '',
    });

    const handleSubmit = async () => {
        if (!form.client_name.trim()) { onError('Client Name is required'); return; }
        setSaving(true);
        const { data, error } = await BankVerificationService.updateInfo(record.id, {
            client_name: form.client_name,
            client_email: form.client_email || undefined,
            client_phone: form.client_phone || undefined,
            institution_name: form.institution_name || undefined,
            routing_number: form.routing_number || undefined,
            account_mask: form.account_mask || undefined,
            notes: form.notes || undefined,
        });
        setSaving(false);
        if (error || !data) {
            onError(error || 'Failed to update info');
            return;
        }
        onSave({ ...record, ...data });
        onClose();
    };

    const field = (label: string, key: keyof typeof form, ph = '') => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 11.5, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</label>
            <input
                placeholder={ph}
                value={form[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                style={{ padding: '9px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box' }}
            />
        </div>
    );

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                onClick={e => e.stopPropagation()}
                style={{ width: 500, background: '#fff', borderRadius: 20, overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}
            >
                <div style={{ padding: '22px 28px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <p style={{ fontSize: 16, fontWeight: 800, color: '#111' }}>Edit Client Info</p>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><XCircle size={20} /></button>
                </div>

                <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                        {field('Full Name *', 'client_name')}
                        {field('Email', 'client_email')}
                        {field('Phone', 'client_phone')}
                        {field('Institution Name', 'institution_name')}
                        {field('Routing Number', 'routing_number')}
                        {field('Account Mask (Last 4)', 'account_mask')}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <label style={{ fontSize: 11.5, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: 0.5 }}>Notes (optional)</label>
                        <textarea
                            value={form.notes}
                            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                            rows={3}
                            style={{ padding: '9px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', resize: 'vertical' }}
                        />
                    </div>
                    <button onClick={handleSubmit} disabled={saving} style={{
                        width: '100%', padding: '13px', marginTop: 10,
                        background: saving ? '#e5e7eb' : 'linear-gradient(135deg,#0C2340,#1e40af)', color: saving ? '#9ca3af' : '#fff',
                        border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    }}>
                        {saving ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : 'Save Changes'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export const BankVerification: React.FC = () => {
    const { user } = useData();
    const [records, setRecords] = useState<VerificationRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [showPlaid, setShowPlaid] = useState(false);
    const [showManual, setShowManual] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [editRecord, setEditRecord] = useState<VerificationRecord | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);
    const [confirmReverify, setConfirmReverify] = useState<{ id: string; name: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
    const toastRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToast({ msg, type });
        clearTimeout(toastRef.current);
        toastRef.current = setTimeout(() => setToast(null), 4000);
    };

    const loadRecords = useCallback(async () => {
        setLoading(true);
        const { data, error } = await BankVerificationService.getVerifications(search || undefined, filterStatus);
        if (error) {
            // If it's a backend-offline error, note it
            setBackendOnline(false);
            // Fall back to any cached localStorage data
            const cached = localStorage.getItem('nhfg_bank_verifications');
            if (cached) setRecords(JSON.parse(cached));
        } else {
            setBackendOnline(true);
            setRecords(data || []);
            // Keep localStorage in sync as a local cache
            localStorage.setItem('nhfg_bank_verifications', JSON.stringify(data || []));
        }
        setLoading(false);
    }, [search, filterStatus]);

    useEffect(() => { loadRecords(); }, [loadRecords]);

    useEffect(() => {
        const unsubscribe = socketService.subscribe((data) => {
            if (data.type === 'BANK_VERIFICATION_CREATED') {
                setRecords(prev => {
                    const exists = prev.some(r => r.id === data.payload.id);
                    if (exists) return prev;
                    return [data.payload, ...prev];
                });
                showToast(`New verification: ${data.payload.client_name}`);
            } else if (data.type === 'BANK_VERIFICATION_UPDATED') {
                setRecords(prev => prev.map(r => r.id === data.payload.id ? { ...r, ...data.payload } : r));
                showToast(`Status updated: ${data.payload.client_name} (${data.payload.status})`);
            }
        });
        return () => unsubscribe();
    }, []);

    const handleUpdateStatus = async (id: string, status: VerificationRecord['status']) => {
        const { data, error } = await BankVerificationService.updateStatus(id, status);
        if (error) { showToast(error, 'error'); return; }
        setRecords(rs => rs.map(r => r.id === id ? { ...r, ...data! } : r));
        showToast(`Status updated to ${STATUS_CFG[status].text}`);
    };

    const handleVerified = (r: VerificationRecord) => {
        setRecords(rs => [r, ...rs]);
        showToast(`✅ ${r.client_name} — ${r.institution_name} account verified via Plaid`);
    };

    const handleManualSave = (r: VerificationRecord) => {
        setRecords(rs => [r, ...rs]);
        showToast(`📋 ${r.client_name} — manual entry submitted (Micro-Deposit status)`);
    };

    const handleDelete = async () => {
        if (!confirmDelete) return;
        setIsDeleting(true);
        const { error } = await BankVerificationService.deleteVerification(confirmDelete.id);
        setIsDeleting(false);
        if (error) { showToast(error, 'error'); return; }
        
        setRecords(rs => rs.filter(r => r.id !== confirmDelete.id));
        if (expandedId === confirmDelete.id) setExpandedId(null);
        showToast(`🗑️ Record for ${confirmDelete.name} deleted`);
        setConfirmDelete(null);
    };

    const handleReverify = async () => {
        if (!confirmReverify) return;
        setIsDeleting(true);
        const { error } = await BankVerificationService.deleteVerification(confirmReverify.id);
        setIsDeleting(false);
        if (error) { showToast(error, 'error'); return; }
        
        setRecords(rs => rs.filter(r => r.id !== confirmReverify.id));
        if (expandedId === confirmReverify.id) setExpandedId(null);
        showToast(`🔄 Restarting verification for ${confirmReverify.name}...`);
        
        // Reset state and open manual entry form as a fresh start
        setConfirmReverify(null);
        setShowManual(true);
    };

    const handleEditSave = (updated: VerificationRecord) => {
        setRecords(rs => rs.map(r => r.id === updated.id ? updated : r));
        showToast(`✅ Client info updated successfully`);
    };

    const stats = {
        total: records.length,
        verified: records.filter(r => r.status === 'verified').length,
        pending: records.filter(r => r.status === 'pending' || r.status === 'micro_deposit').length,
        failed: records.filter(r => r.status === 'failed').length,
    };

    return (
        <div style={{ paddingBottom: 60, position: 'relative' }}>

            {/* Toasts */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                        style={{
                            position: 'fixed', top: 20, right: 24, zIndex: 200,
                            background: toast.type === 'success' ? '#ecfdf5' : '#fff1f2',
                            border: `1px solid ${toast.type === 'success' ? '#a7f3d0' : '#fecdd3'}`,
                            color: toast.type === 'success' ? '#065f46' : '#9f1239',
                            padding: '12px 18px', borderRadius: 12, fontSize: 13, fontWeight: 600,
                            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                        }}
                    >
                        {toast.msg}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Header ── */}
            <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                            <h2 style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', letterSpacing: -0.5, lineHeight: 1.1 }}>Bank Verification</h2>
                            {/* Backend status indicator */}
                            {backendOnline !== null && (
                                <span style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 5,
                                    fontSize: 10.5, fontWeight: 700, padding: '3px 10px', borderRadius: 99,
                                    background: backendOnline ? '#ecfdf5' : '#fff1f2',
                                    color: backendOnline ? '#065f46' : '#9f1239',
                                }}>
                                    {backendOnline ? <Wifi size={11} /> : <WifiOff size={11} />}
                                    {backendOnline ? 'Backend Connected' : 'Backend Offline — localStorage cache'}
                                </span>
                            )}
                        </div>
                        <p style={{ fontSize: 13, color: '#64748b' }}>
                            Verify client bank accounts via Plaid Link or manual ACH to prevent draft returns
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <button onClick={loadRecords} title="Refresh" style={{ width: 38, height: 38, background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <RefreshCw size={15} color="#6b7280" />
                        </button>
                        <button onClick={() => setShowPlaid(true)} style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            padding: '10px 18px', background: 'linear-gradient(135deg,#0C2340,#1e40af)',
                            color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(30,64,175,0.3)',
                        }}>
                            <Landmark size={15} /> Verify via Plaid
                        </button>
                        <button onClick={() => setShowManual(true)} style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            padding: '10px 18px', background: '#fff', color: '#374151',
                            border: '1.5px solid #e5e7eb', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer',
                        }}>
                            <Hash size={15} /> Manual ACH Entry
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Stats ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 22 }}>
                <Stat label="Total Records" value={stats.total} Icon={Landmark} color="#3b82f6" bg="#eff6ff" />
                <Stat label="Approved" value={stats.verified} Icon={CheckCircle2} color="#10b981" bg="#ecfdf5" />
                <Stat label="Action Needed" value={stats.pending} Icon={Clock} color="#f59e0b" bg="#fefce8" />
                <Stat label="Failed / Rejected" value={stats.failed} Icon={XCircle} color="#f43f5e" bg="#fff1f2" />
            </div>

            {/* ── Plaid Info Banner ── */}
            <div style={{
                background: 'linear-gradient(135deg,#0C2340 0%,#1e3a5f 100%)',
                borderRadius: 14, padding: '16px 22px', marginBottom: 22,
                display: 'flex', alignItems: 'center', gap: 14, color: '#fff',
            }}>
                <ShieldCheck size={22} color="#60a5fa" style={{ flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 700 }}>Plaid Auth Integration — Production Ready</p>
                    <p style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>
                        Plug in your <code style={{ background: 'rgba(255,255,255,0.15)', padding: '1px 5px', borderRadius: 4 }}>PLAID_CLIENT_ID</code> and{' '}
                        <code style={{ background: 'rgba(255,255,255,0.15)', padding: '1px 5px', borderRadius: 4 }}>PLAID_SECRET</code> in <code style={{ background: 'rgba(255,255,255,0.15)', padding: '1px 5px', borderRadius: 4 }}>.env</code> to go live.
                        Routing numbers and account ownership verified directly from the bank via Plaid Auth.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 10, flexShrink: 0, flexWrap: 'wrap' }}>
                    {['256-bit TLS', 'Bank OAuth', 'NACHA Compliant', 'ABA Checksum'].map(t => (
                        <span key={t} style={{ fontSize: 10.5, fontWeight: 600, background: 'rgba(255,255,255,0.12)', padding: '4px 10px', borderRadius: 99 }}>✓ {t}</span>
                    ))}
                </div>
            </div>

            {/* ── Setup Instructions (when backend offline) ── */}
            {backendOnline === false && (
                <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 14, padding: '16px 20px', marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                        <AlertTriangle size={16} color="#ea580c" />
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#9a3412' }}>Plaid API Keys Not Configured</p>
                    </div>
                    <ol style={{ fontSize: 12, color: '#7c2d12', lineHeight: 2, paddingLeft: 20, margin: 0 }}>
                        <li>Go to <strong>dashboard.plaid.com</strong> → Developers → Keys</li>
                        <li>Copy your <strong>client_id</strong> and <strong>secret</strong></li>
                        <li>Navigate to the <strong>Website Settings</strong> module in your Admin Dashboard.</li>
                        <li>Scroll down to the <strong>Integrations & API Connections</strong> block and paste your keys.</li>
                        <li>Save settings! Ensure <code>Environment</code> is swapped to <code>production</code> when going live.</li>
                    </ol>
                </div>
            )}

            {/* ── Filters ── */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                    <input
                        placeholder="Search by client name or bank…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ width: '100%', padding: '9px 12px 9px 34px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                    />
                </div>
                {(['all', 'verified', 'pending', 'micro_deposit', 'failed'] as const).map(s => (
                    <button key={s} onClick={() => setFilterStatus(s)} style={{
                        padding: '8px 14px', borderRadius: 99, fontSize: 12, fontWeight: 600, border: '1.5px solid', cursor: 'pointer', whiteSpace: 'nowrap',
                        borderColor: filterStatus === s ? '#3b82f6' : '#e5e7eb',
                        background: filterStatus === s ? '#eff6ff' : '#fff',
                        color: filterStatus === s ? '#1e40af' : '#6b7280',
                    }}>
                        {s === 'all' ? 'All' : s === 'micro_deposit' ? 'Micro-Deposit' : s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                ))}
            </div>

            {/* ── Records Table ── */}
            <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                {/* Header row */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1.5fr 1fr 1fr 1fr 110px', padding: '12px 20px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                    {['Client', 'Bank / Account', 'Routing #', 'Type', 'Status', 'Risk', 'Actions'].map(h => (
                        <span key={h} style={{ fontSize: 10.5, fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.8 }}>{h}</span>
                    ))}
                </div>

                {loading ? (
                    <div style={{ padding: '60px 0', textAlign: 'center' }}>
                        <Loader2 size={28} className="animate-spin" style={{ color: '#3b82f6', margin: '0 auto 10px' }} />
                        <p style={{ fontSize: 13, color: '#9ca3af', fontWeight: 500 }}>Loading verifications…</p>
                    </div>
                ) : records.length === 0 ? (
                    <div style={{ padding: '70px 0', textAlign: 'center', color: '#9ca3af' }}>
                        <Landmark size={44} style={{ margin: '0 auto 14px', opacity: 0.15 }} />
                        <p style={{ fontWeight: 700, fontSize: 14 }}>No records found</p>
                        <p style={{ fontSize: 12, marginTop: 4 }}>Use "Verify via Plaid" or "Manual ACH Entry" to add the first record.</p>
                    </div>
                ) : (
                    <AnimatePresence>
                        {records.map(r => (
                            <motion.div key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                {/* Row */}
                                <div
                                    onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                                    style={{
                                        display: 'grid', gridTemplateColumns: '2fr 2fr 1.5fr 1fr 1fr 1fr 110px',
                                        padding: '14px 20px', alignItems: 'center', cursor: 'pointer',
                                        borderBottom: '1px solid #f8fafc', background: expandedId === r.id ? '#fafbff' : '#fff',
                                        transition: 'background 0.1s',
                                    }}
                                    onMouseEnter={e => { if (expandedId !== r.id) (e.currentTarget as HTMLDivElement).style.background = '#f9fafb'; }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = expandedId === r.id ? '#fafbff' : '#fff'; }}
                                >
                                    {/* Client */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div style={{ width: 34, height: 34, background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, color: '#475569', flexShrink: 0 }}>
                                            {(r.client_name || '?').charAt(0)}
                                        </div>
                                        <div>
                                            <p style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>{r.client_name || '—'}</p>
                                            <p style={{ fontSize: 11, color: '#9ca3af' }}>{r.verification_method === 'plaid' ? '⚡ Plaid' : '✍️ Manual'}</p>
                                        </div>
                                    </div>
                                    {/* Bank */}
                                    <div>
                                        <p style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{r.institution_name || '—'}</p>
                                        <p style={{ fontSize: 11, color: '#9ca3af', fontFamily: 'monospace' }}>••••••{r.account_mask || '????'} · {r.account_type || '—'}</p>
                                    </div>
                                    {/* Routing */}
                                    <span style={{ fontSize: 12, fontFamily: 'monospace', color: '#475569', background: '#f8fafc', padding: '3px 8px', borderRadius: 6 }}>
                                        {r.routing_number || '—'}
                                    </span>
                                    {/* Type */}
                                    <span style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'capitalize' }}>{r.account_type || '—'}</span>
                                    {/* Status */}
                                    <StatusBadge status={r.status} />
                                    {/* Risk */}
                                    <RiskBadge risk={(r.draft_risk as any) || 'medium'} />
                                    {/* Actions */}
                                    <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                                        <button onClick={e => { e.stopPropagation(); setEditRecord(r); }} title="Edit" style={{ width: 30, height: 30, border: '1.5px solid #e2e8f0', background: '#f8fafc', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Edit2 size={13} color="#475569" />
                                        </button>
                                        <button onClick={e => { e.stopPropagation(); setConfirmDelete({ id: r.id, name: r.client_name }); }} title="Delete" style={{ width: 30, height: 30, border: '1.5px solid #fecdd3', background: '#fff1f2', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Trash2 size={13} color="#f43f5e" />
                                        </button>
                                        {r.status !== 'verified' && (
                                            <button onClick={e => { e.stopPropagation(); handleUpdateStatus(r.id, 'verified'); }} title="Approve" style={{ width: 30, height: 30, border: '1.5px solid #a7f3d0', background: '#ecfdf5', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <CheckCircle2 size={14} color="#10b981" />
                                            </button>
                                        )}
                                        {r.status !== 'failed' && (
                                            <button onClick={e => { e.stopPropagation(); handleUpdateStatus(r.id, 'failed'); }} title="Reject" style={{ width: 30, height: 30, border: '1.5px solid #fecdd3', background: '#fff1f2', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <XCircle size={14} color="#f43f5e" />
                                            </button>
                                        )}
                                        <ChevronDown size={16} color="#9ca3af" style={{ transform: expandedId === r.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', marginLeft: 4 }} />
                                    </div>
                                </div>

                                {/* Expanded detail panel */}
                                <AnimatePresence>
                                    {expandedId === r.id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                            style={{ overflow: 'hidden', borderBottom: '2px solid #3b82f620' }}
                                        >
                                            <div style={{ padding: '18px 24px', background: '#f9fbff', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }}>
                                                {[
                                                    { label: 'Email', value: r.client_email || '—', Icon: Mail },
                                                    { label: 'Phone', value: r.client_phone || '—', Icon: Phone },
                                                    { label: 'Name Match', value: r.verification_method === 'plaid' ? (r.name_match ? '✅ Confirmed' : '❌ Mismatch') : (r.name_match ? '✅ Confirmed' : 'N/A (Manual)'), Icon: User },
                                                    { label: 'Acct Active', value: r.verification_method === 'plaid' ? (r.account_active ? '✅ Active' : '❌ Inactive') : (r.account_active ? '✅ Active' : 'N/A (Manual)'), Icon: ShieldCheck },
                                                    { label: 'Verified By', value: r.verified_by || '—', Icon: BadgeCheck },
                                                    { label: 'Verified At', value: r.verified_at ? new Date(r.verified_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—', Icon: Clock },
                                                    { label: 'Submitted', value: new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), Icon: Info },
                                                    { label: 'Notes', value: r.notes || 'No notes', Icon: AlertTriangle },
                                                ].map(d => {
                                                    const Icon = d.Icon;
                                                    return (
                                                        <div key={d.label}>
                                                            <p style={{ fontSize: 10.5, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4 }}>
                                                                <Icon size={10} style={{ display: 'inline', marginRight: 4 }} />{d.label}
                                                            </p>
                                                            <p style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{d.value}</p>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>

            {/* ── Modals ── */}
            <AnimatePresence>
                {showPlaid && (
                    <PlaidSetupModal
                        onVerified={handleVerified}
                        onError={m => showToast(m, 'error')}
                        onClose={() => setShowPlaid(false)}
                    />
                )}
                {showManual && (
                    <ManualForm
                        onSave={handleManualSave}
                        onError={m => showToast(m, 'error')}
                        onClose={() => setShowManual(false)}
                    />
                )}
                {editRecord && (
                    <EditForm
                        record={editRecord}
                        onSave={handleEditSave}
                        onError={m => showToast(m, 'error')}
                        onClose={() => setEditRecord(null)}
                    />
                )}
            </AnimatePresence>

            {/* Confirmation Modals */}
            <ConfirmModal 
                isOpen={!!confirmDelete}
                onClose={() => setConfirmDelete(null)}
                onConfirm={handleDelete}
                loading={isDeleting}
                title="Delete Verification Record?"
                message={`Are you sure you want to permanently delete the bank verification record for ${confirmDelete?.name}? This action cannot be undone and will remove all audit trails.`}
                confirmText="Delete Record"
            />

            <ConfirmModal 
                isOpen={!!confirmReverify}
                onClose={() => setConfirmReverify(null)}
                onConfirm={handleReverify}
                loading={isDeleting}
                title="Fresh Start & Re-verify?"
                message={`This will delete the current stale record for ${confirmReverify?.name} and immediately open the Manual Entry form to allow you to re-enter the correct details. Proceed?`}
                confirmText="Start Re-verification"
            />
        </div>
    );
};
