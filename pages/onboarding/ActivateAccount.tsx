
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, CheckCircle2, Loader2, Landmark, Check, AlertTriangle } from 'lucide-react';
import { Backend } from '../../services/apiBackend';

export default function ActivateAccount() {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [user, setUser] = useState<any>(null);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [activating, setActivating] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const verifyToken = async () => {
            try {
                const data = await Backend.get<any>(`/onboarding/activate/${token}`);
                setUser(data.user);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        verifyToken();
    }, [token]);

    const handleActivate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        setActivating(true);
        setError('');
        try {
            await Backend.post('/onboarding/complete-activation', { token, password });
            setSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setActivating(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                <p className="text-slate-400 font-medium tracking-tight">Verifying activation link...</p>
            </div>
        );
    }

    if (error && !user) {
        return (
            <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full bg-white rounded-[32px] p-10 text-center shadow-2xl">
                    <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-600">
                        <AlertTriangle className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Link Expired</h2>
                    <p className="text-slate-500 mb-8 leading-relaxed">This activation link is either invalid or has already been used. Please contact your administrator for a new link.</p>
                    <button onClick={() => navigate('/login')} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-4 rounded-2xl transition-all">
                        Return to Login
                    </button>
                </motion.div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full bg-white rounded-[32px] p-10 text-center shadow-2xl">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600">
                        <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Account Active!</h2>
                    <p className="text-slate-500 mb-8 leading-relaxed">Your Advisor account for NHFG is now active. You are being redirected to the login page.</p>
                    <div className="w-full bg-emerald-50 text-emerald-700 py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" /> Redirecting...
                    </div>
                </motion.div>
            </div>
        );
    }

    const passReqs = [
        { label: 'At least 8 characters', met: password.length >= 8 },
        { label: 'Passwords match', met: password === confirmPassword && password !== '' }
    ];

    return (
        <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-6 relative">
            <div className="absolute top-[20%] left-[10%] w-[30%] h-[30%] bg-blue-600/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-[20%] right-[10%] w-[30%] h-[30%] bg-indigo-600/10 rounded-full blur-[100px]" />

            <div className="max-w-md w-full relative">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-4">
                        <Landmark className="w-3 h-3" /> NHFG Official Onboarding
                    </div>
                    <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Complete Profile</h1>
                    <p className="text-slate-400 font-medium">Set your security credentials to start.</p>
                </div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[40px] p-8 md:p-10 shadow-2xl">
                    <form onSubmit={handleActivate} className="space-y-6">
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-medium flex items-center gap-3">
                                <AlertTriangle className="w-5 h-5" /> {error}
                            </div>
                        )}

                        <div className="space-y-6">
                            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0">
                                    <Mail className="w-6 h-6 text-slate-400" />
                                </div>
                                <div className="min-w-0">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Company Email</div>
                                    <div className="text-sm font-bold text-slate-900 truncate">{user?.email}</div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="relative group">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 block mb-1.5">New Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPass ? 'text' : 'password'}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-12 text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all font-medium"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                        />
                                        <div className="absolute inset-y-0 left-4 flex items-center text-slate-400">
                                            <Lock className="w-4 h-4" />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setShowPass(!showPass)}
                                            className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-slate-600"
                                        >
                                            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="relative group">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 block mb-1.5">Confirm Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPass ? 'text' : 'password'}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-12 text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all font-medium"
                                            placeholder="••••••••"
                                            value={confirmPassword}
                                            onChange={e => setConfirmPassword(e.target.value)}
                                        />
                                        <div className="absolute inset-y-0 left-4 flex items-center text-slate-400">
                                            <Lock className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 px-2">
                            {passReqs.map((req, i) => (
                                <div key={i} className={`flex items-center gap-2 text-xs font-semibold ${req.met ? 'text-emerald-600' : 'text-slate-400'}`}>
                                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${req.met ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                                        {req.met ? <Check className="w-2.5 h-2.5" /> : <div className="w-1 h-1 bg-slate-300 rounded-full" />}
                                    </div>
                                    {req.label}
                                </div>
                            ))}
                        </div>

                        <button
                            type="submit"
                            disabled={activating || !passReqs.every(r => r.met)}
                            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-2 group"
                        >
                            {activating ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                <>
                                    Activate My Account
                                    <ShieldCheck className="w-5 h-5 transition-transform group-hover:scale-110" />
                                </>
                            )}
                        </button>
                    </form>
                </motion.div>

                <p className="mt-8 text-center text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">
                    Secured by New Holland Financial Group
                </p>
            </div>
        </div>
    );
}
