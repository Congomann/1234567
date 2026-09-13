import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, Shield, Upload, X } from 'lucide-react';
import { Backend } from '../../services/apiBackend';

export const SetupAccount: React.FC = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [avatar, setAvatar] = useState<File | null>(null);
    const [termsAgreed, setTermsAgreed] = useState(false);
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setAvatar(e.target.files[0]);
        }
    };

    const handleComplete = async () => {
        if (!termsAgreed) {
            setError("You must agree to the terms.");
            return;
        }
        
        setLoading(true);
        try {
            // Note: Avatar upload could be added here if needed
            await Backend.setupAccount({
                token,
                password,
                termsAgreed
            });
            navigate('/login?setup=success');
        } catch (err: any) {
            setError(err.message || 'Failed to setup account');
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center p-8 bg-white rounded-3xl shadow-xl max-w-md">
                    <Shield className="h-16 w-16 text-red-500 mx-auto mb-6" />
                    <h2 className="text-2xl font-black text-[#0B2240] mb-4">Invalid Invite Link</h2>
                    <p className="text-slate-500">This invite link is missing or invalid. Please request a new invite from your administrator.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col md:flex-row">
                
                {/* Left Side Branding */}
                <div className="bg-[#0B2240] p-10 flex flex-col justify-between md:w-1/3 text-white hidden md:flex relative overflow-hidden">
                    <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(ellipse_at_center,rgba(10,98,167,0.3)_0%,rgba(11,34,64,1)_70%)] opacity-50 pointer-events-none"></div>
                    <div className="relative z-10">
                        <img src="https://files.readme.io/ef0f845-NHFG_Logo.png" alt="NHFG" className="h-8 mb-8 brightness-0 invert" />
                        <h2 className="text-3xl font-black mb-4">Welcome to NHFG</h2>
                        <p className="text-blue-200 text-sm">Let's get your advisor profile set up.</p>
                    </div>
                    <div className="relative z-10 space-y-4">
                        <div className={`flex items-center gap-3 text-sm font-bold \${step >= 1 ? 'text-white' : 'text-blue-400'}`}>
                            <div className={`h-6 w-6 rounded-full flex items-center justify-center \${step >= 1 ? 'bg-[#0A62A7]' : 'border border-blue-400'}`}>1</div>
                            Password
                        </div>
                        <div className={`flex items-center gap-3 text-sm font-bold \${step >= 2 ? 'text-white' : 'text-blue-400/50'}`}>
                            <div className={`h-6 w-6 rounded-full flex items-center justify-center \${step >= 2 ? 'bg-[#0A62A7]' : 'border border-blue-400/50'}`}>2</div>
                            Profile
                        </div>
                        <div className={`flex items-center gap-3 text-sm font-bold \${step >= 3 ? 'text-white' : 'text-blue-400/50'}`}>
                            <div className={`h-6 w-6 rounded-full flex items-center justify-center \${step >= 3 ? 'bg-[#0A62A7]' : 'border border-blue-400/50'}`}>3</div>
                            Terms
                        </div>
                    </div>
                </div>

                {/* Right Side Content */}
                <div className="p-10 md:w-2/3">
                    {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-100 flex items-center gap-2"><X className="h-4 w-4"/> {error}</div>}
                    
                    {step === 1 && (
                        <div className="animate-fade-in">
                            <h3 className="text-2xl font-black text-[#0B2240] mb-2">Secure Your Account</h3>
                            <p className="text-slate-500 text-sm mb-8">Create a strong password for your CRM access.</p>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">New Password</label>
                                    <input 
                                        type="password" 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Confirm Password</label>
                                    <input 
                                        type="password" 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold"
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                            
                            <div className="mt-8">
                                <button 
                                    onClick={() => {
                                        if (password.length < 8) setError('Password must be at least 8 characters');
                                        else if (password !== confirmPassword) setError('Passwords do not match');
                                        else { setError(''); setStep(2); }
                                    }}
                                    className="w-full bg-[#0A62A7] text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors"
                                >
                                    Continue
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="animate-fade-in">
                            <h3 className="text-2xl font-black text-[#0B2240] mb-2">Add Your Photo</h3>
                            <p className="text-slate-500 text-sm mb-8">This will be visible to your clients in the portal.</p>
                            
                            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors relative">
                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleFileChange} />
                                {avatar ? (
                                    <div className="text-center">
                                        <div className="h-20 w-20 rounded-full bg-blue-100 mx-auto mb-4 overflow-hidden">
                                            <img src={URL.createObjectURL(avatar)} alt="Avatar" className="h-full w-full object-cover" />
                                        </div>
                                        <p className="text-sm font-bold text-blue-600">{avatar.name}</p>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <Upload className="h-10 w-10 text-slate-400 mx-auto mb-4" />
                                        <p className="text-sm font-bold text-slate-600">Click to upload photo</p>
                                        <p className="text-xs text-slate-400 mt-1">PNG, JPG up to 5MB</p>
                                    </div>
                                )}
                            </div>
                            
                            <div className="mt-8 flex gap-4">
                                <button onClick={() => setStep(1)} className="px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200">Back</button>
                                <button onClick={() => setStep(3)} className="flex-1 bg-[#0A62A7] text-white font-bold py-3 rounded-xl hover:bg-blue-700">Continue</button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="animate-fade-in">
                            <h3 className="text-2xl font-black text-[#0B2240] mb-2">Terms & Conditions</h3>
                            <p className="text-slate-500 text-sm mb-8">Please review and accept our advisor agreement.</p>
                            
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 h-48 overflow-y-auto mb-6 text-xs text-slate-600 space-y-4">
                                <p><strong>1. Welcome to NHFG CRM</strong><br/>By accessing this CRM, you agree to handle all client data with strict confidentiality in accordance with SEC, FINRA, and NHFG compliance guidelines.</p>
                                <p><strong>2. Data Privacy</strong><br/>You may not export, share, or duplicate client records outside of authorized CRM functions. All interactions are logged and monitored for compliance.</p>
                                <p><strong>3. Property Rights</strong><br/>All leads, quotes, and policies generated within this CRM remain the intellectual property of New Holland Financial Group.</p>
                            </div>

                            <label className="flex items-start gap-3 cursor-pointer group">
                                <div className="mt-0.5">
                                    <input type="checkbox" className="hidden" checked={termsAgreed} onChange={e => setTermsAgreed(e.target.checked)} />
                                    <div className={`h-5 w-5 rounded border flex items-center justify-center transition-colors \${termsAgreed ? 'bg-[#0A62A7] border-[#0A62A7]' : 'border-slate-300 group-hover:border-[#0A62A7]'}`}>
                                        {termsAgreed && <CheckCircle2 className="h-3 w-3 text-white" />}
                                    </div>
                                </div>
                                <span className="text-sm font-medium text-slate-700 select-none">
                                    I agree to the NHFG CRM Terms of Service, Data Privacy Policy, and Compliance Standards.
                                </span>
                            </label>
                            
                            <div className="mt-8 flex gap-4">
                                <button onClick={() => setStep(2)} className="px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200">Back</button>
                                <button 
                                    onClick={handleComplete} 
                                    disabled={!termsAgreed || loading}
                                    className="flex-1 bg-[#0B2240] text-white font-bold py-3 rounded-xl hover:bg-slate-800 disabled:opacity-50 flex justify-center items-center gap-2"
                                >
                                    {loading ? <span className="animate-spin border-2 border-white/20 border-t-white h-5 w-5 rounded-full"></span> : 'Complete Setup'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
