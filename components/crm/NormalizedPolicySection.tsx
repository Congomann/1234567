import React, { useState, useEffect } from 'react';
import { Client } from '../../types';
import {
    carrierRegistry,
    NormalizedPolicyData,
    NormalizedPolicyStatus
} from '../../services/carrier';
import {
    ShieldCheck,
    AlertTriangle,
    Clock,
    Calendar,
    DollarSign,
    RefreshCw,
    CheckCircle2,
    AlertOctagon,
    User,
    Check,
    Building2,
    Shield,
    Sparkles,
    FileText,
    ArrowRight
} from 'lucide-react';

interface NormalizedPolicySectionProps {
    client: Client;
    onPolicyUpdated?: (updatedData: NormalizedPolicyData) => void;
}

export const NormalizedPolicySection: React.FC<NormalizedPolicySectionProps> = ({ client, onPolicyUpdated }) => {
    const [isSyncing, setIsSyncing] = useState<boolean>(false);
    const [selectedCarrier, setSelectedCarrier] = useState<'acme-mutual' | 'apex-life'>('acme-mutual');
    const [scenario, setScenario] = useState<'active' | 'grace_period' | 'lapsed'>('active');
    const [policyData, setPolicyData] = useState<NormalizedPolicyData | null>(null);
    const [syncSuccess, setSyncSuccess] = useState<boolean>(false);
    const [syncMessage, setSyncMessage] = useState<string>('');

    // Detect carrier based on client data
    useEffect(() => {
        if (client.carrier) {
            const lower = client.carrier.toLowerCase();
            if (lower.includes('apex')) {
                setSelectedCarrier('apex-life');
            } else {
                setSelectedCarrier('acme-mutual');
            }
        }
    }, [client.carrier]);

    /**
     * Executes mock carrier adapter normalization through CarrierRegistry
     */
    const executeSync = async (carrierId = selectedCarrier, targetScenario = scenario) => {
        setIsSyncing(true);
        setSyncSuccess(false);

        // Simulate network latency of remote carrier API gateway
        await new Promise(res => setTimeout(res, 450));

        try {
            let rawPayload: unknown;
            const clientName = client.name || 'Jane Doe';
            const clientEmail = client.email || 'jane.doe@example.com';
            const policyNumber = client.policyNumber || 'POL-882190';
            const basePremium = client.premium || 2400;

            if (carrierId === 'acme-mutual') {
                // Acme Mutual (Legacy Carrier System) Schema
                const statusMap = {
                    active: 'IN_FORCE',
                    grace_period: 'GRACE_PERIOD',
                    lapsed: 'LAPSED'
                };

                rawPayload = {
                    carrier_code: 'ACME_MUTUAL_LIFE',
                    contract_id: policyNumber.startsWith('ACM-') ? policyNumber : `ACM-${policyNumber}`,
                    insured_party: {
                        full_legal_name: clientName,
                        dob: '1983-05-14',
                        contact_email: clientEmail
                    },
                    policy_details: {
                        plan_code: 'TERM_20_PREMIER',
                        policy_status: statusMap[targetScenario],
                        issue_date: '2021/04/15',
                        expiry_date: '2041/04/15',
                        term_years: 20,
                        renewable_flag: true
                    },
                    coverage: {
                        face_amount_cents: 50000000 // $500,000 in cents
                    },
                    billing: {
                        modal_premium_cents: Math.round(basePremium * 100),
                        frequency: 'ANNUAL',
                        past_due_installments: targetScenario === 'grace_period' ? 1 : targetScenario === 'lapsed' ? 3 : 0,
                        past_due_cents: targetScenario === 'grace_period' ? Math.round(basePremium * 100) : targetScenario === 'lapsed' ? Math.round(basePremium * 3 * 100) : 0,
                        last_unpaid_due_date: targetScenario !== 'active' ? '2026-08-01' : undefined,
                        grace_period_end: targetScenario === 'grace_period' ? '2026-09-18' : undefined
                    }
                };
            } else {
                // Apex Life (Modern InsurTech System) Schema
                const statusMap = {
                    active: 'CURRENT',
                    grace_period: 'PAYMENT_PENDING',
                    lapsed: 'TERMINATED'
                };

                rawPayload = {
                    provider: 'ApexLife InsurTech',
                    policyId: policyNumber.startsWith('APX-') ? policyNumber : `APX-${policyNumber}`,
                    customer: {
                        name: clientName,
                        birthDate: '1979-11-28T00:00:00.000Z',
                        email: clientEmail,
                        phone: client.phone || '+1 (555) 723-9914'
                    },
                    state: statusMap[targetScenario],
                    planType: 'Apex Universal Life Plus',
                    benefitAmount: 750000.00,
                    periodicRate: Math.round((basePremium / 12) * 100) / 100,
                    billingSchedule: 'monthly',
                    inceptionDate: '2022-02-01T00:00:00.000Z',
                    expirationDate: '2052-02-01T00:00:00.000Z',
                    termYears: 30,
                    renewable: true,
                    delinquentPayments: targetScenario === 'grace_period' ? 1 : targetScenario === 'lapsed' ? 3 : 0,
                    totalPastDue: targetScenario === 'grace_period' ? Math.round((basePremium / 12) * 100) / 100 : targetScenario === 'lapsed' ? Math.round((basePremium / 12 * 3) * 100) / 100 : 0.00,
                    lastPaymentFailureDate: targetScenario !== 'active' ? '2026-08-05T00:00:00.000Z' : undefined,
                    gracePeriodEnd: targetScenario === 'grace_period' ? '2026-09-22T00:00:00.000Z' : undefined
                };
            }

            // Execute universal normalization through CarrierRegistry singleton
            const normalized = carrierRegistry.normalize(carrierId, rawPayload);
            normalized.clientId = client.id;
            setPolicyData(normalized);
            setSyncSuccess(true);
            setSyncMessage(`Successfully synchronized with ${normalized.carrierName} at ${new Date().toLocaleTimeString()}`);

            if (onPolicyUpdated) {
                onPolicyUpdated(normalized);
            }
        } catch (err: any) {
            console.error('[NormalizedPolicySection] Normalization failed:', err);
            setSyncMessage(`Sync error: ${err.message || 'Unknown carrier error'}`);
        } finally {
            setIsSyncing(false);
        }
    };

    // Auto-normalize on mount
    useEffect(() => {
        executeSync(selectedCarrier, scenario);
    }, [client.id]);

    const getStatusBadge = (status?: NormalizedPolicyStatus, rawStatus?: string) => {
        if (status === 'active') {
            return (
                <div className="flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-black text-xs uppercase tracking-wider shadow-sm">
                    <CheckCircle2 size={14} className="text-emerald-600" />
                    <span>Active</span>
                    {rawStatus && (
                        <span className="text-[9px] font-mono text-emerald-600/70 border-l border-emerald-300 pl-2">
                            {rawStatus}
                        </span>
                    )}
                </div>
            );
        }
        if (status === 'inactive') {
            return (
                <div className="flex items-center gap-2 px-3.5 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full font-black text-xs uppercase tracking-wider shadow-sm">
                    <AlertTriangle size={14} className="text-amber-600" />
                    <span>Inactive (Grace Period)</span>
                    {rawStatus && (
                        <span className="text-[9px] font-mono text-amber-600/70 border-l border-amber-300 pl-2">
                            {rawStatus}
                        </span>
                    )}
                </div>
            );
        }
        return (
            <div className="flex items-center gap-2 px-3.5 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-full font-black text-xs uppercase tracking-wider shadow-sm">
                <AlertOctagon size={14} className="text-rose-600" />
                <span>Lapsed</span>
                {rawStatus && (
                    <span className="text-[9px] font-mono text-rose-600/70 border-l border-rose-300 pl-2">
                        {rawStatus}
                    </span>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header & Carrier Synchronizer Bar */}
            <div className="bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-slate-50 p-6 rounded-[2.5rem] border border-blue-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-[#0B2240] text-white rounded-2xl shadow-lg shadow-blue-900/15">
                        <Building2 size={24} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-xl font-black text-[#0B2240] tracking-tight">
                                {policyData?.carrierName || 'Carrier API Integration'}
                            </h3>
                            <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 rounded-md text-[10px] font-black uppercase tracking-wider font-mono">
                                ID: {selectedCarrier}
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 font-medium">
                            Universal Carrier API Adapter • Normalized Policy Contract Engine
                        </p>
                    </div>
                </div>

                {/* Interactive Carrier Sync Button */}
                <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                    <button
                        onClick={() => executeSync(selectedCarrier, scenario)}
                        disabled={isSyncing}
                        className="flex items-center gap-2 px-6 py-3.5 bg-[#0B2240] hover:bg-blue-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-900/20 active:scale-95 disabled:opacity-50"
                    >
                        <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
                        <span>{isSyncing ? 'Synchronizing...' : 'Sync Carrier Data'}</span>
                    </button>
                </div>
            </div>

            {/* Test Simulation Controls */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-amber-500" />
                    <span className="font-black uppercase tracking-wider text-slate-500 text-[10px]">
                        Carrier Adapter Controls:
                    </span>
                </div>

                <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-400 text-[11px]">Carrier:</span>
                        <select
                            value={selectedCarrier}
                            onChange={(e) => {
                                const next = e.target.value as 'acme-mutual' | 'apex-life';
                                setSelectedCarrier(next);
                                executeSync(next, scenario);
                            }}
                            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 outline-none cursor-pointer"
                        >
                            <option value="acme-mutual">Acme Mutual (Legacy snake_case / Cents)</option>
                            <option value="apex-life">Apex Life (Modern InsurTech / ISO)</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-400 text-[11px]">Scenario:</span>
                        <select
                            value={scenario}
                            onChange={(e) => {
                                const next = e.target.value as 'active' | 'grace_period' | 'lapsed';
                                setScenario(next);
                                executeSync(selectedCarrier, next);
                            }}
                            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 outline-none cursor-pointer"
                        >
                            <option value="active">Active (Good Standing)</option>
                            <option value="grace_period">Grace Period (Missed Payment)</option>
                            <option value="lapsed">Lapsed (Terminated)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Sync Feedback Alert */}
            {syncMessage && (
                <div className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-bold transition-all ${
                    syncSuccess
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}>
                    <div className="flex items-center gap-2">
                        {syncSuccess ? <Check size={16} className="text-emerald-600" /> : <AlertOctagon size={16} className="text-rose-600" />}
                        <span>{syncMessage}</span>
                    </div>
                    {policyData?.syncedAt && (
                        <span className="text-[10px] font-mono opacity-70">
                            Synced: {new Date(policyData.syncedAt).toLocaleTimeString()}
                        </span>
                    )}
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════════ */}
            {/* THE 6 NORMALIZED POLICY FIELDS DISPLAY GRID */}
            {/* ═══════════════════════════════════════════════════════════════════ */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* 1. Policy Status Badge */}
                <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                            Field 1 • Policy Status
                        </span>
                        <div className="mt-1">
                            {getStatusBadge(policyData?.status, policyData?.rawStatus)}
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-bold">Policy Number</span>
                        <span className="font-mono font-black text-slate-800">
                            {policyData?.policyNumber || client.policyNumber}
                        </span>
                    </div>
                </div>

                {/* 2. Premium Amount & Payment Frequency */}
                <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                            Field 2 • Premium Amount & Schedule
                        </span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black text-slate-900 font-mono">
                                ${policyData?.premiumAmount ? policyData.premiumAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : client.premium.toLocaleString()}
                            </span>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                / {policyData?.premiumFrequency || 'annual'}
                            </span>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-bold">Billing Frequency</span>
                        <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-md text-[10px] font-black uppercase tracking-wider font-mono">
                            {policyData?.premiumFrequency || 'Annual'}
                        </span>
                    </div>
                </div>

                {/* 3. Total Coverage Benefit Amount */}
                <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                            Field 3 • Total Coverage Benefit
                        </span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black text-blue-600 font-mono">
                                ${policyData?.coverageAmount ? policyData.coverageAmount.toLocaleString() : '500,000'}
                            </span>
                            <span className="text-xs font-bold text-slate-400 uppercase">Face Benefit</span>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-bold">Product Type</span>
                        <span className="font-bold text-slate-700 truncate max-w-[150px]">
                            {policyData?.productType || client.product}
                        </span>
                    </div>
                </div>

                {/* 4. Insured Client Birthday & Calculated Age */}
                <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                            Field 4 • Insured Birthday & Age
                        </span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-black text-slate-900 font-mono">
                                Age {policyData?.clientAge ?? 43}
                            </span>
                            <span className="text-xs font-bold text-slate-400">Years Old</span>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-bold">Date of Birth</span>
                        <span className="font-mono font-bold text-slate-700 flex items-center gap-1">
                            <Calendar size={12} className="text-slate-400" />
                            {policyData?.clientBirthday || '1983-05-14'}
                        </span>
                    </div>
                </div>

                {/* 5. Missed Payments Status */}
                <div className={`p-6 rounded-[2rem] border shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow ${
                    policyData?.missedPayments.hasMissedPayment
                        ? 'bg-amber-50/40 border-amber-200'
                        : 'bg-white border-slate-200'
                }`}>
                    <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                            Field 5 • Missed Payments Status
                        </span>
                        {policyData?.missedPayments.hasMissedPayment ? (
                            <div>
                                <div className="flex items-center gap-2 text-amber-700 font-black text-sm">
                                    <AlertTriangle size={18} className="text-amber-600" />
                                    <span>{policyData.missedPayments.missedCount} Delinquent Payment(s)</span>
                                </div>
                                <p className="text-xs font-bold text-slate-600 mt-1 font-mono">
                                    Total Past Due: ${policyData.missedPayments.totalAmountDue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-emerald-700 font-black text-sm">
                                <CheckCircle2 size={18} className="text-emerald-600" />
                                <span>Clean Standing (0 Missed)</span>
                            </div>
                        )}
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-bold">Grace Period</span>
                        {policyData?.missedPayments.gracePeriodEndsAt ? (
                            <span className="font-mono font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded">
                                Ends: {policyData.missedPayments.gracePeriodEndsAt}
                            </span>
                        ) : (
                            <span className="font-bold text-emerald-600">N/A (Current)</span>
                        )}
                    </div>
                </div>

                {/* 6. Policy Duration & Tenure */}
                <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                            Field 6 • Policy Duration & Tenure
                        </span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-black text-slate-900 font-mono">
                                {policyData?.duration.tenureMonths ?? 63}
                            </span>
                            <span className="text-xs font-bold text-slate-500">Months Active</span>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
                        <div className="flex items-center gap-1 text-slate-400 font-bold">
                            <Clock size={12} />
                            <span>Issue / Expiry</span>
                        </div>
                        <span className="font-mono text-[11px] font-bold text-slate-700">
                            {policyData?.duration.effectiveDate} → {policyData?.duration.expirationDate || client.renewalDate}
                        </span>
                    </div>
                </div>
            </div>

            {/* Additional Carrier Metadata Card */}
            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
                <div className="flex items-center gap-3">
                    <Shield size={18} className="text-blue-600" />
                    <div>
                        <span className="font-black text-slate-800 uppercase tracking-wider text-[11px] block">
                            Normalized Schema Verified
                        </span>
                        <p className="text-slate-500 text-[11px] font-medium">
                            Universal Carrier Schema conforms to TypeScript interface <code>NormalizedPolicyData</code>.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4 self-end sm:self-auto font-mono text-[11px] text-slate-500">
                    <span>Term: {policyData?.duration.termYears || 20} Yrs</span>
                    <span>•</span>
                    <span>Renewable: {policyData?.duration.isRenewable ? 'Yes' : 'No'}</span>
                </div>
            </div>
        </div>
    );
};

export default NormalizedPolicySection;
