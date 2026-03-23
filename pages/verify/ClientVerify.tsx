import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { usePlaidLink } from 'react-plaid-link';

const API = '/api';

interface LinkData {
    clientName: string;
    customMessage: string | null;
    verificationId: string;
    linkToken: string | null;
    expiresAt: string;
    plaidReady: boolean;
}

// ── styled helpers (inline — no external CSS needed) ──────────────────────────
const styles: Record<string, React.CSSProperties> = {
    page: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #1e40af 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
    },
    card: {
        background: '#fff',
        borderRadius: 20,
        boxShadow: '0 25px 60px rgba(0,0,0,.35)',
        maxWidth: 480,
        width: '100%',
        overflow: 'hidden',
    },
    header: {
        background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)',
        padding: '28px 32px',
    },
    eyebrow: {
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: 2.5,
        textTransform: 'uppercase' as const,
        color: 'rgba(255,255,255,.6)',
        margin: '0 0 6px',
    },
    title: { color: '#fff', fontSize: 22, fontWeight: 800, margin: 0 },
    body: { padding: '32px' },
    greeting: { fontSize: 17, fontWeight: 600, color: '#111827', marginBottom: 10 },
    message: { fontSize: 14, color: '#374151', lineHeight: 1.7, marginBottom: 24 },
    infoBox: {
        background: '#f0fdf4',
        border: '1.5px solid #bbf7d0',
        borderRadius: 12,
        padding: '16px 20px',
        marginBottom: 28,
    },
    infoTitle: { fontSize: 13, fontWeight: 700, color: '#166534', marginBottom: 8 },
    infoItem: { fontSize: 13, color: '#15803d', lineHeight: 2, display: 'flex', alignItems: 'flex-start', gap: 8 },
    btn: {
        display: 'block',
        width: '100%',
        background: 'linear-gradient(135deg, #1e3a5f, #2563eb)',
        color: '#fff',
        fontSize: 16,
        fontWeight: 700,
        padding: '16px 0',
        border: 'none',
        borderRadius: 12,
        cursor: 'pointer',
        letterSpacing: 0.5,
        transition: 'opacity .2s, transform .15s',
        marginBottom: 12,
    },
    successBox: {
        textAlign: 'center' as const,
        padding: '12px 0 0',
    },
    errBox: {
        background: '#fef2f2',
        border: '1.5px solid #fca5a5',
        borderRadius: 10,
        padding: '14px 18px',
        color: '#991b1b',
        fontSize: 14,
        marginBottom: 20,
    },
    footer: {
        background: '#f8fafc',
        borderTop: '1px solid #e2e8f0',
        padding: '16px 32px',
        textAlign: 'center' as const,
        fontSize: 11,
        color: '#9ca3af',
    },
    spinner: {
        display: 'inline-block',
        width: 24,
        height: 24,
        border: '3px solid rgba(255,255,255,.3)',
        borderTopColor: '#fff',
        borderRadius: '50%',
        animation: 'spin .8s linear infinite',
        verticalAlign: 'middle',
        marginRight: 8,
    },
};

// ── PlaidLink sub-component ────────────────────────────────────────────────────
function PlaidConnectButton({ linkToken, token, onSuccess, onError }: {
    linkToken: string;
    token: string;
    onSuccess: (result: any) => void;
    onError: (msg: string) => void;
}) {
    const [submitting, setSubmitting] = useState(false);

    const onPlaidSuccess = useCallback(async (publicToken: string, metadata: any) => {
        setSubmitting(true);
        try {
            const res = await fetch(`${API}/plaid/client-verify/${token}/complete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    publicToken,
                    accountId: metadata?.accounts?.[0]?.id || null,
                    accounts: metadata?.accounts || [],
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Verification failed');
            onSuccess(data);
        } catch (err: any) {
            onError(err.message);
        } finally {
            setSubmitting(false);
        }
    }, [token, onSuccess, onError]);

    const { open, ready } = usePlaidLink({ token: linkToken, onSuccess: onPlaidSuccess });

    return (
        <button
            style={{ ...styles.btn, opacity: (!ready || submitting) ? 0.7 : 1 }}
            disabled={!ready || submitting}
            onClick={() => open()}
        >
            {submitting ? (
                <><span style={styles.spinner} />Saving your verification…</>
            ) : (
                '🔐 Connect My Bank Account'
            )}
        </button>
    );
}


// ── Main Page ──────────────────────────────────────────────────────────────────
export default function ClientVerify() {
    const { token } = useParams<{ token: string }>();
    const [status, setStatus] = useState<'loading' | 'ready' | 'done' | 'error'>('loading');
    const [linkData, setLinkData] = useState<LinkData | null>(null);
    const [result, setResult] = useState<any>(null);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (!token) { setStatus('error'); setErrorMsg('Invalid link.'); return; }
        (async () => {
            try {
                const res = await fetch(`${API}/plaid/client-verify/${token}`);
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Link not found');
                setLinkData(data);
                setStatus('ready');
            } catch (err: any) {
                setErrorMsg(err.message);
                setStatus('error');
            }
        })();
    }, [token]);

    const handleSuccess = (res: any) => {
        setResult(res);
        setStatus('done');
    };

    const handleError = (msg: string) => {
        setErrorMsg(msg);
    };

    // ── Loading ──
    if (status === 'loading') return (
        <div style={styles.page}>
            <div style={styles.card}>
                <div style={styles.header}>
                    <p style={styles.eyebrow}>New Holland Financial Group</p>
                    <h1 style={styles.title}>Bank Verification</h1>
                </div>
                <div style={{ ...styles.body, textAlign: 'center', padding: '48px 32px' }}>
                    <div style={{ width: 48, height: 48, border: '4px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin .8s linear infinite', margin: '0 auto 20px' }} />
                    <p style={{ color: '#6b7280', fontSize: 15 }}>Loading your verification request…</p>
                </div>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
    );

    // ── Error / Expired ──
    if (status === 'error') return (
        <div style={styles.page}>
            <div style={styles.card}>
                <div style={{ ...styles.header, background: 'linear-gradient(135deg,#7f1d1d,#dc2626)' }}>
                    <p style={styles.eyebrow}>New Holland Financial Group</p>
                    <h1 style={styles.title}>Link Unavailable</h1>
                </div>
                <div style={styles.body}>
                    <div style={styles.errBox}>❌ {errorMsg}</div>
                    <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.7 }}>
                        If you believe this is an error, please contact your NHFG advisor and ask them to resend the verification link.
                    </p>
                </div>
                <div style={styles.footer}>New Holland Financial Group · Secure Bank Verification</div>
            </div>
        </div>
    );

    // ── Success ──
    if (status === 'done') return (
        <div style={styles.page}>
            <div style={styles.card}>
                <div style={{ ...styles.header, background: 'linear-gradient(135deg,#14532d,#16a34a)' }}>
                    <p style={styles.eyebrow}>New Holland Financial Group</p>
                    <h1 style={styles.title}>✅ Verification Complete!</h1>
                </div>
                <div style={styles.body}>
                    <p style={styles.greeting}>Thank you, {linkData?.clientName || 'valued client'}!</p>
                    <p style={styles.message}>
                        Your bank account has been successfully verified. Your NHFG advisor has been notified and your records have been securely updated.
                    </p>

                    {/* Summary card */}
                    {result && (
                        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '16px 20px', marginBottom: 20 }}>
                            <p style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12 }}>Verification Summary</p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 20px' }}>
                                {[
                                    ['Institution', result.institutionName || 'Verified'],
                                    ['Account', result.accountMask ? `••••${result.accountMask}` : 'Verified'],
                                    ['Type', result.accountType || '—'],
                                    ['Status', result.status === 'verified' ? '✅ Verified' : '⏳ Pending'],
                                    ['Risk Level', result.draftRisk === 'low' ? '🟢 Low' : result.draftRisk === 'high' ? '🔴 High' : '🟡 Medium'],
                                    ['Transactions', result.transactionCount != null ? `${result.transactionCount} (7 days)` : '—'],
                                    ...(result.balanceCurrent != null ? [['Current Balance', `$${Number(result.balanceCurrent).toLocaleString('en-US', { minimumFractionDigits: 2 })}`]] : []),
                                    ...(result.balanceAvailable != null ? [['Available', `$${Number(result.balanceAvailable).toLocaleString('en-US', { minimumFractionDigits: 2 })}`]] : []),
                                ].map(([label, value]) => (
                                    <div key={label}>
                                        <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginTop: 2 }}>{String(value)}</div>
                                    </div>
                                ))}
                            </div>
                            {result.statementSummary && (
                                <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #e2e8f0' }}>
                                    <p style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1 }}>7-Day Statement ({result.statementSummary.period})</p>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 20px', marginTop: 8 }}>
                                        {[
                                            ['Total Debits', `$${result.statementSummary.totalDebits}`],
                                            ['Total Credits', `$${result.statementSummary.totalCredits}`],
                                            ['Transactions', result.statementSummary.totalTransactions],
                                            ['Largest Debit', `$${result.statementSummary.largestDebit}`],
                                        ].map(([l, v]) => (
                                            <div key={l}>
                                                <div style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1 }}>{l}</div>
                                                <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginTop: 2 }}>{String(v)}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '14px 18px', fontSize: 13, color: '#15803d' }}>
                        🔒 Your banking credentials were never shared with NHFG. This verification was powered by Plaid, trusted by millions of Americans.
                    </div>
                </div>
                <div style={styles.footer}>New Holland Financial Group · Secure Bank Verification · Powered by Plaid</div>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
    );

    // ── Ready — main screen ──
    return (
        <div style={styles.page}>
            <div style={styles.card}>
                {/* Header */}
                <div style={styles.header}>
                    <p style={styles.eyebrow}>New Holland Financial Group</p>
                    <h1 style={styles.title}>🏦 Bank Account Verification</h1>
                </div>

                <div style={styles.body}>
                    {/* Personalized greeting */}
                    <p style={styles.greeting}>Hi {linkData?.clientName || 'there'} 👋</p>
                    <p style={styles.message}>
                        {linkData?.customMessage ||
                            'Your NHFG advisor has requested a quick bank verification to ensure your name matches your bank account on file. This helps us prevent unauthorized ACH drafts and protect your account.'}
                    </p>

                    {/* Safety box */}
                    <div style={styles.infoBox}>
                        <p style={styles.infoTitle}>✅ Safe, Secure & Free</p>
                        {[
                            'You will NOT be charged for this verification',
                            'NHFG never sees your banking username or password',
                            'Powered by Plaid — used by millions of Americans',
                            'Bank-grade 256-bit TLS encryption',
                            `This link expires: ${linkData ? new Date(linkData.expiresAt).toLocaleString() : '48 hrs'}`,
                        ].map(item => (
                            <div key={item} style={styles.infoItem}>
                                <span style={{ flexShrink: 0, color: '#16a34a' }}>✓</span>
                                <span>{item}</span>
                            </div>
                        ))}
                    </div>

                    {/* Error display */}
                    {errorMsg && <div style={styles.errBox}>⚠️ {errorMsg}</div>}

                    {/* Plaid button */}
                    {linkData?.linkToken ? (
                        <PlaidConnectButton
                            linkToken={linkData.linkToken}
                            token={token!}
                            onSuccess={handleSuccess}
                            onError={setErrorMsg}
                        />
                    ) : (
                        <div style={{ ...styles.errBox, background: '#fffbeb', borderColor: '#fcd34d', color: '#92400e' }}>
                            ⚠️ Plaid is not configured on this server. Please ask your advisor to try again.
                        </div>
                    )}

                    <p style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', lineHeight: 1.6 }}>
                        By continuing, you authorize New Holland Financial Group to verify your bank account information for fraud prevention purposes.
                    </p>
                </div>

                <div style={styles.footer}>
                    New Holland Financial Group · Powered by Plaid · NACHA Compliant · Bank-grade OAuth
                </div>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
    );
}
