import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CloudIcon, CheckCircle2 } from 'lucide-react';

interface LandingPage {
    title: string;
    content: any;
    style_config: any;
    is_published: boolean;
}

export const CampaignLandingPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [pageConfig, setPageConfig] = useState<LandingPage | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [submitted, setSubmitted] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState({ name: '', email: '', phone: '' });

    useEffect(() => {
        const fetchPage = async () => {
            try {
                // Ensure we call the public endpoint
                const res = await fetch(`/api/public/landing-pages/${slug}`);
                if (!res.ok) {
                    if (res.status === 404) {
                        setError('Campaign Not Found or Not Live');
                    } else {
                        setError('Failed to load campaign data');
                    }
                    return;
                }
                const data = await res.json();
                setPageConfig(data);
                
                // Update Document Title
                document.title = data.title ? `${data.title} | NHFG` : 'New Holland Financial Group';
                
            } catch (err) {
                console.error('Fetch Landing Page Error:', err);
                setError('A network error occurred');
            } finally {
                setLoading(false);
            }
        };

        if (slug) fetchPage();
    }, [slug]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Use standard lead ingestion if you want, or just a custom one.
        // For now, we will submit standard lead.
        try {
            const res = await fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    interest: 'Campaign Landing Page',
                    notes: `Lead captured from landing page slug: ${slug}`,
                    source: 'Landing Page'
                })
            });
            
            if (res.ok) {
                setSubmitted(true);
            } else {
                alert('Failed to submit form. Please try again.');
            }
        } catch (err) {
            alert('A network error occurred during submission.');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin text-blue-500"><CloudIcon size={48} /></div>
            </div>
        );
    }

    if (error || !pageConfig) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
                <h1 className="text-3xl font-black text-slate-800 mb-2">404</h1>
                <p className="text-slate-500 mb-8">{error || 'Page not found'}</p>
                <button onClick={() => navigate('/')} className="px-6 py-3 bg-[#0B2240] text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-[#0A62A7] transition-all">
                    Return Home
                </button>
            </div>
        );
    }

    const { content, style_config } = pageConfig;
    const primaryColor = style_config?.primary_color || '#0A62A7';

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* Minimal Header */}
            <header className="absolute top-0 left-0 w-full p-6 z-10 flex justify-between items-center">
                <img src="/logo.png" alt="NHFG" className="h-10 opacity-80 mix-blend-multiply" onError={(e) => { e.currentTarget.style.display='none'; }} />
            </header>

            {/* Hero Section */}
            <main className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden flex items-center min-h-[90vh]">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 -mr-40 -mt-40 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none" style={{ backgroundColor: primaryColor }}></div>
                <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none" style={{ backgroundColor: primaryColor }}></div>

                <div className="max-w-7xl mx-auto px-6 w-full relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    
                    {/* Copy */}
                    <div className="space-y-8 animate-fade-in-up">
                        <h1 className="text-5xl lg:text-7xl font-black tracking-tight text-slate-900 leading-[1.1]">
                            {content?.hero_title || 'Unlock Your Financial Future'}
                        </h1>
                        <p className="text-xl text-slate-600 font-medium leading-relaxed max-w-xl">
                            {content?.hero_subtitle || 'Discover strategies built for modern professionals to preserve and grow wealth.'}
                        </p>
                    </div>

                    {/* Conversion Form Card */}
                    <div className="bg-white p-8 lg:p-12 rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-100 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                        {submitted ? (
                            <div className="text-center py-12 space-y-4">
                                <div className="inline-flex items-center justify-center p-4 rounded-full bg-green-50 mb-4">
                                    <CheckCircle2 size={48} className="text-green-500" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-800">Request Received</h3>
                                <p className="text-slate-500">We will be in touch shortly to assist you.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Full Name</label>
                                    <input 
                                        type="text" 
                                        required 
                                        className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-xl px-4 py-4 text-sm focus:ring-2 focus:border-transparent outline-none transition-all"
                                        style={{ '--tw-ring-color': primaryColor } as any}
                                        value={formData.name}
                                        onChange={e => setFormData({...formData, name: e.target.value})}
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Email Address</label>
                                    <input 
                                        type="email" 
                                        required 
                                        className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-xl px-4 py-4 text-sm focus:ring-2 focus:border-transparent outline-none transition-all"
                                        style={{ '--tw-ring-color': primaryColor } as any}
                                        value={formData.email}
                                        onChange={e => setFormData({...formData, email: e.target.value})}
                                        placeholder="john@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Phone Number</label>
                                    <input 
                                        type="tel" 
                                        className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-xl px-4 py-4 text-sm focus:ring-2 focus:border-transparent outline-none transition-all"
                                        style={{ '--tw-ring-color': primaryColor } as any}
                                        value={formData.phone}
                                        onChange={e => setFormData({...formData, phone: e.target.value})}
                                        placeholder="(555) 555-5555"
                                    />
                                </div>
                                
                                <button 
                                    type="submit"
                                    className="w-full text-white py-5 rounded-xl font-black tracking-widest uppercase text-sm shadow-xl hover:-translate-y-1 transition-all"
                                    style={{ backgroundColor: primaryColor, boxShadow: `0 10px 25px -5px ${primaryColor}66` }}
                                >
                                    {content?.cta_text || 'Get Started'}
                                </button>
                                
                                <p className="text-center text-[10px] text-slate-400 font-medium pt-2">
                                    By submitting, you agree to our Terms of Service & Privacy Policy.
                                </p>
                            </form>
                        )}
                    </div>

                </div>
            </main>

            {/* Minimal Footer */}
            <footer className="py-8 text-center text-slate-400 text-xs font-medium border-t border-slate-200 bg-white">
                <p>&copy; {new Date().getFullYear()} New Holland Financial Group. All rights reserved.</p>
            </footer>
        </div>
    );
};
