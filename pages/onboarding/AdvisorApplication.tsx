
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, User, Mail, Phone, FileText, CheckCircle2, Loader2, Landmark } from 'lucide-react';

export default function AdvisorApplication() {
    const [formData, setFormData] = useState({
        fullName: '',
        personalEmail: '',
        phone: '',
        licenseInfo: ''
    });
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/onboarding/apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Submission failed');

            setSubmitted(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center"
                >
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-4">Application Submitted!</h2>
                    <p className="text-slate-600 leading-relaxed mb-8">
                        Thank you for your interest in joining New Holland Financial Group.
                        Our team will review your license information and contact you at <strong>{formData.personalEmail}</strong> once approved.
                    </p>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-sm text-slate-500">
                        Please check your inbox (and spam folder) for a welcome email in the next 24-48 hours.
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-6 selection:bg-blue-500/30">
            {/* Branded Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-xl w-full relative">
                {/* Logo & Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-4">
                        <Landmark className="w-3 h-3" />
                        New Holland Financial Group
                    </div>
                    <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Advisor Onboarding</h1>
                    <p className="text-slate-400">Join our network of elite financial professionals.</p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 md:p-10 shadow-2xl"
                >
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-medium">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <InputField
                                label="Full Name"
                                icon={<User className="w-4 h-4" />}
                                placeholder="John Doe"
                                value={formData.fullName}
                                onChange={v => setFormData({ ...formData, fullName: v })}
                            />

                            <InputField
                                label="Personal Email"
                                type="email"
                                icon={<Mail className="w-4 h-4" />}
                                placeholder="john@personal.com"
                                value={formData.personalEmail}
                                onChange={v => setFormData({ ...formData, personalEmail: v })}
                            />

                            <InputField
                                label="Phone Number"
                                type="tel"
                                icon={<Phone className="w-4 h-4" />}
                                placeholder="(555) 000-0000"
                                value={formData.phone}
                                onChange={v => setFormData({ ...formData, phone: v })}
                            />

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">State License Information</label>
                                <div className="relative group">
                                    <textarea
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-12 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all resize-none h-32"
                                        placeholder="Enter your state license numbers and NPN..."
                                        value={formData.licenseInfo}
                                        onChange={e => setFormData({ ...formData, licenseInfo: e.target.value })}
                                    />
                                    <div className="absolute top-4 left-4 text-slate-500">
                                        <FileText className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Submit Application
                                    <ShieldCheck className="w-5 h-5 transition-transform group-hover:scale-110" />
                                </>
                            )}
                        </button>

                        <p className="text-center text-[10px] text-slate-500 uppercase tracking-widest leading-loose px-4">
                            By submitting this application, you agree to our terms of service and professional conduct guidelines.
                        </p>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}

function InputField({ label, type = "text", icon, placeholder, value, onChange }: any) {
    return (
        <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">{label}</label>
            <div className="relative group">
                <input
                    required
                    type={type}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-12 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                    placeholder={placeholder}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                />
                <div className="absolute inset-y-0 left-4 flex items-center text-slate-500 group-focus-within:text-blue-400 transition-colors">
                    {icon}
                </div>
            </div>
        </div>
    );
}
