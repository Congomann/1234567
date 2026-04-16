
import React, { useState, useEffect } from 'react';
import {
    Layout,
    Plus,
    Trash2,
    Eye,
    Save,
    Globe,
    ExternalLink,
    Settings,
    MousePointer2,
    Palette,
    FileText,
    Activity,
    CloudIcon,
    ArrowUpRight,
    Search,
    Clock,
    Package,
    Edit2
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import ConfirmModal from '../../components/shared/ConfirmModal';

interface LandingPage {
    id: string;
    slug: string;
    title: string;
    content: any;
    style_config: any;
    is_published: boolean;
    created_at: string;
    views?: number;
    leads_count?: number;
}

export const LandingPageBuilder: React.FC = () => {
    const { landingPages, saveLandingPage, deleteLandingPage, companySettings } = useData();
    const [loading, setLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [viewMode, setViewMode] = useState<'list' | 'editor'>('list');
    const [currentPage, setCurrentPage] = useState<Partial<LandingPage>>({
        title: 'New Landing Page',
        slug: 'new-campaign',
        is_published: false,
        content: { hero_title: 'Unlocking Future Wealth', hero_subtitle: 'The IUL strategy built for professionals.', cta_text: 'Get Illustration' },
        style_config: { primary_color: '#0A62A7', font_family: 'Inter, sans-serif', show_pixel: true }
    });

    // Removed local fetch as it's now handled by DataContext bootstrap

    const handleSave = async () => {
        if (!currentPage.slug) return alert('Slug is required');
        
        setIsSaving(true);
        const success = await saveLandingPage(currentPage);
        setIsSaving(false);
        
        if (success) {
            setViewMode('list');
        } else {
            alert('Failed to save campaign. Check console for details.');
        }
    };

    const handleConfirmedDelete = async () => {
        if (!confirmDeleteId) return;
        setIsDeleting(true);
        try {
            await deleteLandingPage(confirmDeleteId);
            setConfirmDeleteId(null);
        } catch (e) {
            alert("Deletion failed. Please try again.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-8 pb-20 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Campaign Page Engine</h1>
                    <p className="text-slate-500 font-medium mt-1">Deploy high-conversion headless landing pages for ad campaigns.</p>
                </div>
                <div className="flex gap-4">
                    {viewMode === 'list' ? (
                        <button
                            onClick={() => {
                                setViewMode('editor');
                                setCurrentPage({
                                    title: '', slug: '', is_published: false,
                                    content: { hero_title: '', hero_subtitle: '', cta_text: 'Get Started' },
                                    style_config: { primary_color: '#0A62A7', font_family: 'Inter', show_pixel: true }
                                });
                            }}
                            className="bg-[#0A62A7] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-2 hover:bg-blue-700 transition-all"
                        >
                            <Plus size={16} /> Create Deployment
                        </button>
                    ) : (
                        <div className="flex gap-3">
                            <button onClick={() => setViewMode('list')} className="px-8 py-4 bg-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">Back to List</button>
                            <button onClick={handleSave} disabled={isSaving} className="px-8 py-4 bg-green-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-green-700 transition-all shadow-xl flex items-center gap-2 disabled:opacity-50">
                                {isSaving ? <Activity size={16} className="animate-spin" /> : <CloudIcon size={16} />}
                                Publish Now
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {viewMode === 'list' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {landingPages.map((page: any) => (
                        <div key={page.id} className="bg-white rounded-[3rem] p-8 border border-slate-200 shadow-sm group hover:shadow-2xl transition-all relative overflow-hidden">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-4 bg-blue-50 text-blue-600 rounded-3xl transition-colors group-hover:bg-blue-600 group-hover:text-white">
                                    <Globe size={28} />
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${page.is_published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {page.is_published ? 'Published' : 'Draft'}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-bold mt-2 flex items-center gap-1"><Clock size={10} /> {new Date(page.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <h3 className="text-xl font-black text-slate-800 mb-2 truncate">{page.title}</h3>
                            <p className="text-[10px] font-mono text-blue-500 mb-6 flex items-center gap-1 font-bold">
                                <ExternalLink size={10} /> nhfg.cc/{page.slug}
                            </p>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="bg-slate-50 p-4 rounded-2xl">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Live Views</p>
                                    <p className="text-xl font-black text-slate-800">{page.views || 0}</p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-2xl">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Capped Leads</p>
                                    <p className="text-xl font-black text-slate-800">{page.leads_count || 0}</p>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button onClick={() => { setCurrentPage(page); setViewMode('editor'); }} className="flex-1 bg-slate-900 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all">Configure</button>
                                <button onClick={() => setConfirmDeleteId(page.id)} className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={16} /></button>
                            </div>
                        </div>
                    ))}

                    {landingPages.length === 0 && (
                        <div className="lg:col-span-3 py-32 flex flex-col items-center opacity-30">
                            <Layout size={64} className="mb-4" />
                            <p className="text-xs font-black uppercase tracking-[0.2em]">No campaign pages deployed</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-fade-in">
                    {/* Settings Sidebar */}
                    <div className="lg:col-span-1 space-y-8">
                        <section className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm space-y-6">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Settings size={14} /> Campaign Config</h3>

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Internal Project Title</label>
                                <input className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500" value={currentPage.title} onChange={e => setCurrentPage({ ...currentPage, title: e.target.value })} />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Vanity URL Slug (nhfg.cc/___)</label>
                                <input className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-xs font-mono font-bold outline-none focus:ring-2 focus:ring-blue-500" value={currentPage.slug} onChange={e => setCurrentPage({ ...currentPage, slug: e.target.value })} />
                            </div>

                            <div className="pt-4 border-t border-slate-100">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className={`h-6 w-11 rounded-full transition-all relative ${currentPage.is_published ? 'bg-green-500' : 'bg-slate-200'}`} onClick={() => setCurrentPage({ ...currentPage, is_published: !currentPage.is_published })}>
                                        <div className={`absolute top-1 left-1 bg-white h-4 w-4 rounded-full transition-all ${currentPage.is_published ? 'translate-x-5' : ''}`}></div>
                                    </div>
                                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Live Deployment</span>
                                </label>
                            </div>
                        </section>

                        <section className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm space-y-6">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Package size={14} /> Product Integration</h3>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Advertised Product (Optional)</label>
                                <select 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
                                    value={currentPage.content?.linked_product_id || ''}
                                    onChange={e => {
                                        const productId = e.target.value;
                                        const product = companySettings.customProducts?.find(p => p.id === productId);
                                        if (product) {
                                            setCurrentPage(prev => ({
                                                ...prev,
                                                title: prev.title === 'New Landing Page' ? `${product.title} Promo Flyer` : prev.title,
                                                content: {
                                                    ...prev.content,
                                                    linked_product_id: product.id,
                                                    product_title: product.title,
                                                    product_description: product.description,
                                                    product_image: product.image,
                                                    product_features: product.features || []
                                                }
                                            }));
                                        } else {
                                            setCurrentPage(prev => ({
                                                ...prev,
                                                content: { ...prev.content, linked_product_id: '' }
                                            }));
                                        }
                                    }}
                                >
                                    <option value="">No Product Selected</option>
                                    {(companySettings.customProducts || []).map(p => (
                                        <option key={p.id} value={p.id}>{p.title}</option>
                                    ))}
                                </select>
                                <p className="text-[9px] text-slate-400 font-medium mt-3">Selecting a product will automatically configure the Flyer Mockup below.</p>
                            </div>
                        </section>

                        <section className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm space-y-6">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Palette size={14} /> Visual Identity</h3>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Accent Branding Color</label>
                                <div className="flex gap-4 items-center">
                                    <input type="color" className="h-10 w-10 p-0 border-0 rounded-full cursor-pointer" value={currentPage.style_config?.primary_color} onChange={e => setCurrentPage({ ...currentPage, style_config: { ...currentPage.style_config, primary_color: e.target.value } })} />
                                    <span className="text-xs font-mono font-bold text-slate-500">{currentPage.style_config?.primary_color}</span>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Content Editor */}
                    <div className="lg:col-span-2 space-y-8">
                        <section className="bg-white p-10 rounded-[4rem] border border-slate-200 shadow-2xl relative">
                            <div className="absolute top-8 right-10 text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                                <MousePointer2 size={12} /> Click to Edit Content
                            </div>

                            <div className="space-y-12">
                                <div>
                                    <label className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] block mb-4">Hero Section Branding</label>
                                    <input className="text-5xl font-black text-slate-900 border-b-2 border-transparent hover:border-slate-100 focus:border-blue-500 w-full outline-none py-2 transition-all" value={currentPage.content?.hero_title} onChange={e => setCurrentPage({ ...currentPage, content: { ...currentPage.content, hero_title: e.target.value } })} placeholder="Primary Headline Goes Here..." />
                                </div>

                                <textarea className="text-xl font-medium text-slate-500 border-b-2 border-transparent hover:border-slate-100 focus:border-blue-500 w-full outline-none py-2 transition-all resize-none" rows={3} value={currentPage.content?.hero_subtitle} onChange={e => setCurrentPage({ ...currentPage, content: { ...currentPage.content, hero_subtitle: e.target.value } })} placeholder="Write a compelling subheadline that connects with your target audience..." />

                                <div className="pt-8">
                                    <div className="inline-flex gap-4 p-2 bg-slate-50 rounded-[2.5rem]">
                                        <div className="px-10 py-5 rounded-[2rem] text-sm font-black uppercase tracking-widest text-white shadow-xl flex items-center justify-center gap-3 cursor-text group" style={{ backgroundColor: currentPage.style_config?.primary_color }}>
                                            <Edit2 className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                                            <input className="bg-transparent border-0 outline-none w-32 placeholder-white/70" placeholder="Button Text..." value={currentPage.content?.cta_text} onChange={e => setCurrentPage({ ...currentPage, content: { ...currentPage.content, cta_text: e.target.value } })} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {currentPage.content?.linked_product_id ? (
                                <div className="mt-16 pt-10 border-t border-slate-100 animate-fade-in">
                                    <label className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] block mb-6">Promoted Product Flyer Mockup</label>
                                    <div className="bg-slate-50 rounded-[3rem] p-8 border border-slate-200">
                                        {currentPage.content?.product_image && (
                                            <div className="h-64 w-full rounded-[2rem] overflow-hidden mb-8 shadow-sm">
                                                <img src={currentPage.content.product_image} alt="Product Flyer Hero" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                        <input 
                                            className="text-3xl font-black text-slate-900 border-b-2 border-transparent hover:border-slate-200 focus:border-blue-500 w-full outline-none py-2 transition-all bg-transparent mb-4" 
                                            value={currentPage.content?.product_title || ''} 
                                            onChange={e => setCurrentPage({ ...currentPage, content: { ...currentPage.content, product_title: e.target.value } })} 
                                        />
                                        <textarea 
                                            className="text-base font-medium text-slate-500 border-b-2 border-transparent hover:border-slate-200 focus:border-blue-500 w-full outline-none py-2 transition-all resize-none bg-transparent mb-8" 
                                            rows={4} 
                                            value={currentPage.content?.product_description || ''} 
                                            onChange={e => setCurrentPage({ ...currentPage, content: { ...currentPage.content, product_description: e.target.value } })} 
                                        />
                                        
                                        {(currentPage.content?.product_features?.length > 0) && (
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] mb-4">Key Benefits</p>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {currentPage.content.product_features.map((feat: string, idx: number) => (
                                                        <div key={idx} className="flex items-start gap-3 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                                                            <div className="mt-1 h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: currentPage.style_config?.primary_color }}></div>
                                                            <p className="text-sm font-bold text-slate-700">{feat}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-20 pt-10 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-10 opacity-30 pointer-events-none select-none">
                                    <div className="p-8 border-2 border-dashed border-slate-200 rounded-[2rem] flex items-center gap-4">
                                        <FileText size={40} />
                                        <div>
                                            <div className="h-3 w-32 bg-slate-200 rounded-full mb-2"></div>
                                            <div className="h-2 w-24 bg-slate-100 rounded-full"></div>
                                        </div>
                                    </div>
                                    <div className="p-8 border-2 border-dashed border-slate-200 rounded-[2rem] flex items-center gap-4">
                                        <Activity size={40} />
                                        <div>
                                            <div className="h-3 w-32 bg-slate-200 rounded-full mb-2"></div>
                                            <div className="h-2 w-24 bg-slate-100 rounded-full"></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            )}
            <ConfirmModal 
                isOpen={!!confirmDeleteId}
                onClose={() => setConfirmDeleteId(null)}
                onConfirm={handleConfirmedDelete}
                loading={isDeleting}
                title="Delete Campaign Page?"
                message="Are you sure you want to permanently delete this landing page? This will immediately disable the public URL and remove all associated data. This action cannot be undone."
                confirmText="Delete Deployment"
            />
        </div>
    );
};
