
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../../context/DataContext';
import { Resource, ProductType, SocialLink, CompanySettings } from '../../types';
import { Backend } from '../../services/apiBackend';
import { Save, Plus, Trash2, Globe, MapPin, Phone, Mail, Link as LinkIcon, AlertCircle, Image as ImageIcon, Video as VideoIcon, Youtube, Upload, PlayCircle, BookOpen, Camera, Handshake, CheckCircle2, Loader2, Eye, EyeOff, Layout, ShieldCheck, Share2, RotateCcw, Send } from 'lucide-react';
import ConfirmModal from '../../components/shared/ConfirmModal';
import { Tab3DBanner } from '../../components/shared/Tab3DBanner';
import { PlaidConfigPanel } from '../../components/plaid/PlaidConfigPanel';


export const WebsiteSettings: React.FC = () => {
    const { companySettings, updateCompanySettings, resources, addResource, deleteResource } = useData();

    // Settings Form State
    const [settingsForm, setSettingsForm] = useState<CompanySettings>(companySettings);
    const [isSaved, setIsSaved] = useState(false);
    const [partnersSaved, setPartnersSaved] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [newVideoUrl, setNewVideoUrl] = useState('');

    // Partner Management State
    const [newPartner, setNewPartner] = useState({ name: '', value: '' });

    // Resource Form State
    const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [newResource, setNewResource] = useState<Partial<Resource>>({
        title: '',
        type: 'PDF',
        url: '',
        description: '',
        content: '', // For Blog
    });
    const [confirmAction, setConfirmAction] = useState<{ id: string | number; type: 'resource' | 'reset-leads' | 'partner' | 'social'; metadata?: any } | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const cleaned = { ...companySettings };
        if (cleaned.heroBackgroundUrl && cleaned.heroBackgroundUrl.includes('unsplash.com')) {
            cleaned.heroBackgroundUrl = '';
        }
        setSettingsForm(cleaned);
    }, [companySettings]);

    const handleSettingsSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const cleaned = { ...settingsForm };
        if (cleaned.heroBackgroundUrl && cleaned.heroBackgroundUrl.includes('unsplash.com')) {
            cleaned.heroBackgroundUrl = '';
        }
        const success = await updateCompanySettings(cleaned);
        if (success) {
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 3000);
        } else {
            alert("Failed to save settings. Please check your connection.");
        }
    };

    const handlePartnersSave = async () => {
        const success = await updateCompanySettings(settingsForm);
        if (success) {
            setPartnersSaved(true);
            setTimeout(() => setPartnersSaved(false), 3000);
        } else {
            alert("Failed to save partners.");
        }
    };

    const handleResourceSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isUploading) return;

        if (!newResource.title) {
            alert("Please enter a title for the resource.");
            return;
        }
        if (!newResource.url && !newResource.content) {
            alert("Please provide a URL, upload a file, or enter content.");
            return;
        }

        addResource(newResource as any);
        setIsResourceModalOpen(false);
        setNewResource({ title: '', type: 'PDF', url: '', description: '', content: '', thumbnail: '' });
    };

    const handleConfirmedAction = async () => {
        if (!confirmAction) return;
        setIsProcessing(true);
        try {
            switch (confirmAction.type) {
                case 'resource':
                    await deleteResource(confirmAction.id as string);
                    break;
                case 'reset-leads':
                    setSettingsForm(prev => ({
                        ...prev,
                        leadStatuses: ['New', 'Contacted', 'Unavailable', 'Proposal', 'Approved', 'Closed', 'Lost', 'Assigned']
                    }));
                    break;
                case 'partner':
                    const updatedPartners = { ...(settingsForm.partners || {}) };
                    delete updatedPartners[confirmAction.metadata.name];
                    const pSettings = { ...settingsForm, partners: updatedPartners };
                    setSettingsForm(pSettings);
                    updateCompanySettings(pSettings);
                    break;
                case 'social':
                    const updatedSocials = [...(settingsForm.socialLinks || [])];
                    updatedSocials.splice(confirmAction.id as number, 1);
                    setSettingsForm(prev => ({ ...prev, socialLinks: updatedSocials }));
                    break;
            }
            setConfirmAction(null);
        } catch (e) {
            alert("Action failed. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    // Helper to read file and update state
    const readFile = (file: File, isVideo: boolean) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            if (settingsForm.heroBackgroundType === 'video' && isVideo) {
                const currentPlaylist = settingsForm.heroVideoPlaylist || [];
                if (currentPlaylist.length >= 3) {
                    setUploadError('Maximum of 3 videos allowed in rotation.');
                    return;
                }
                setSettingsForm(prev => ({
                    ...prev,
                    heroVideoPlaylist: [...(prev.heroVideoPlaylist || []), result]
                }));
            } else {
                setSettingsForm(prev => ({
                    ...prev,
                    heroBackgroundUrl: result,
                    heroBackgroundType: isVideo ? 'video' : 'image'
                }));
            }
        };
        reader.readAsDataURL(file);
    };

    // Handle File Upload via FormData to prevent OOM on large videos
    const handleFileUploadForSlot = async (e: React.ChangeEvent<HTMLInputElement>, slotIndex?: number) => {
        setUploadError('');
        const file = e.target.files?.[0];
        if (file) {
            setIsUploading(true);
            const isVideo = file.type.startsWith('video/');
            
            try {
                // Use the multipart form-data upload to handle massive files without memory/tier limits
                const storageUrl = await Backend.uploadFormData(file);
                
                let newPlaylist = [...(settingsForm.heroVideoPlaylist || [])];
                if (typeof slotIndex === 'number') {
                    newPlaylist[slotIndex] = storageUrl;
                } else if (isVideo) {
                    if (!newPlaylist.includes(storageUrl)) {
                        newPlaylist.push(storageUrl);
                    }
                }
                const cleanPlaylist = newPlaylist.slice(0, 3).filter(Boolean);

                const updatedSettings: CompanySettings = {
                    ...settingsForm,
                    heroBackgroundUrl: isVideo ? (cleanPlaylist[0] || storageUrl) : storageUrl,
                    heroBackgroundType: (isVideo ? 'video' : 'image'),
                    heroVideoPlaylist: isVideo ? cleanPlaylist : settingsForm.heroVideoPlaylist
                };

                setSettingsForm(updatedSettings);
                const savedOk = await updateCompanySettings(updatedSettings);
                if (savedOk) {
                    setIsSaved(true);
                    setTimeout(() => setIsSaved(false), 3000);
                }
            } catch (err: any) {
                console.error("FormData Upload failed:", err);
                setUploadError(err.message || 'Upload failed. File might be too large.');
            }
            
            setIsUploading(false);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleFileUploadForSlot(e);
    };

    const handleRemoveVideoSlot = async (index: number) => {
        const newPlaylist = [...(settingsForm.heroVideoPlaylist || [])];
        newPlaylist.splice(index, 1);
        const updatedSettings: CompanySettings = {
            ...settingsForm,
            heroVideoPlaylist: newPlaylist,
            heroBackgroundUrl: newPlaylist[0] || ''
        };
        setSettingsForm(updatedSettings);
        const savedOk = await updateCompanySettings(updatedSettings);
        if (savedOk) {
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 3000);
        }
    };

    const handleResourceThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIsUploading(true);
            try {
                const storageUrl = await Backend.uploadDirectToSupabase(file);
                setNewResource(prev => ({ ...prev, thumbnail: storageUrl }));
            } catch (err) {
                console.error("Resource thumbnail upload failed:", err);
            }
            setIsUploading(false);
        }
    };

    const handleResourceFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 1024 * 1024 * 1024) {
                alert("File is too large (>1GB).");
                return;
            }

            setIsUploading(true);
            try {
                const storageUrl = await Backend.uploadDirectToSupabase(file);
                setNewResource(prev => ({ ...prev, url: storageUrl }));
            } catch (err) {
                console.error("Resource file upload failed:", err);
            }
            setIsUploading(false);
        }
    };

    const handleAboutImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const storageUrl = await Backend.uploadDirectToSupabase(file);
                setSettingsForm(prev => ({ ...prev, aboutImageUrl: storageUrl }));
            } catch (err) {
                console.error("About image upload failed:", err);
            }
        }
    };

    const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, productType: string) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const storageUrl = await Backend.uploadDirectToSupabase(file);
                setSettingsForm(prev => ({
                    ...prev,
                    productImages: {
                        ...(prev.productImages || {}),
                        [productType]: storageUrl
                    }
                }));
            } catch (err) {
                console.error("Product image upload failed:", err);
            }
        }
    };

    const handlePartnerLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIsUploading(true);
            try {
                const storageUrl = await Backend.uploadDirectToSupabase(file);
                setNewPartner(prev => ({ ...prev, value: storageUrl }));
            } catch (err) {
                console.error("Partner logo upload failed:", err);
            }
            setIsUploading(false);
        }
    };

    const handleUrlChange = (value: string) => {
        setUploadError('');
        let cleanValue = value;
        if (value.includes('<iframe') || value.includes('src=')) {
            const srcMatch = value.match(/src=["']([^"']*)["']/);
            if (srcMatch && srcMatch[1]) {
                cleanValue = srcMatch[1];
            }
        }

        let type: 'image' | 'video' | 'youtube' = settingsForm.heroBackgroundType;
        const ytRegex = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        if (cleanValue.match(ytRegex)) {
            type = 'youtube';
        } else if (cleanValue.match(/\.(mp4|webm|ogg)$/i)) {
            type = 'video';
        } else if (cleanValue.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
            type = 'image';
        }

        setSettingsForm({
            ...settingsForm,
            heroBackgroundUrl: cleanValue,
            heroBackgroundType: type
        });
    };

    const addVideoToPlaylist = () => {
        if (!newVideoUrl) return;
        const currentPlaylist = settingsForm.heroVideoPlaylist || [];
        if (currentPlaylist.length >= 3) {
            setUploadError('Maximum of 3 videos allowed in rotation.');
            return;
        }
        setSettingsForm(prev => ({
            ...prev,
            heroVideoPlaylist: [...(prev.heroVideoPlaylist || []), newVideoUrl]
        }));
        setNewVideoUrl('');
    };

    const removeVideoFromPlaylist = (index: number) => {
        const newPlaylist = [...(settingsForm.heroVideoPlaylist || [])];
        newPlaylist.splice(index, 1);
        setSettingsForm(prev => ({ ...prev, heroVideoPlaylist: newPlaylist }));
    };

    const addPartner = () => {
        if (newPartner.name && newPartner.value) {
            const updatedSettings = {
                ...settingsForm,
                partners: {
                    ...(settingsForm.partners || {}),
                    [newPartner.name]: newPartner.value
                }
            };
            setSettingsForm(updatedSettings);
            // Auto-save to context to ensure visibility on home page immediately
            updateCompanySettings(updatedSettings);
            setNewPartner({ name: '', value: '' });
            setPartnersSaved(true);
            setTimeout(() => setPartnersSaved(false), 3000);
        }
    };

    const removePartner = (name: string) => {
        setConfirmAction({ id: name, type: 'partner', metadata: { name } });
    };

    const handleAddSocial = () => {
        const newLink: SocialLink = { platform: 'LinkedIn', url: '' };
        setSettingsForm(prev => ({
            ...prev,
            socialLinks: [...(prev.socialLinks || []), newLink]
        }));
    };

    const handleRemoveSocial = (index: number) => {
        setConfirmAction({ id: index, type: 'social' });
    };

    const handleSocialChange = (index: number, field: keyof SocialLink, value: string) => {
        const updated = [...(settingsForm.socialLinks || [])];
        updated[index] = { ...updated[index], [field]: value };
        setSettingsForm(prev => ({ ...prev, socialLinks: updated }));
    };

    const handleAddEmail = () => {
        const currentEmails = settingsForm.email ? settingsForm.email.split(',').map(e => e.trim()).filter(e => e) : [];
        currentEmails.push('New Label: email@example.com');
        setSettingsForm(prev => ({ ...prev, email: currentEmails.join(', ') }));
    };

    const handleRemoveEmail = (index: number) => {
        const currentEmails = settingsForm.email ? settingsForm.email.split(',').map(e => e.trim()).filter(e => e) : [];
        currentEmails.splice(index, 1);
        setSettingsForm(prev => ({ ...prev, email: currentEmails.join(', ') }));
    };

    const handleEmailChange = (index: number, type: 'label' | 'address', value: string) => {
        const currentEmails = settingsForm.email ? settingsForm.email.split(',').map(e => e.trim()).filter(e => e) : [];
        if (!currentEmails[index]) currentEmails[index] = ' : ';

        let label = '';
        let address = '';
        const parts = currentEmails[index].split(':');
        if (parts.length > 1) {
            label = parts[0].trim();
            address = parts.slice(1).join(':').trim();
        } else {
            address = currentEmails[index].trim();
        }

        if (type === 'label') label = value;
        if (type === 'address') address = value;

        const safeLabel = label.replace(/,/g, '');
        const safeAddress = address.replace(/,/g, '');

        currentEmails[index] = safeLabel ? `${safeLabel}: ${safeAddress}` : safeAddress;
        setSettingsForm(prev => ({ ...prev, email: currentEmails.join(', ') }));
    };

    const parsedEmails = (settingsForm.email || 'General Inquiry: info@newhollandfinancial.com, Sales: sales@newhollandfinancial.com').split(',').map(e => e.trim()).filter(e => e).map(e => {
        const p = e.split(':');
        if (p.length > 1) return { label: p[0].trim(), address: p.slice(1).join(':').trim() };
        return { label: '', address: e.trim() };
    });
    
    // CRM Customization Helpers
    const handleAddStatus = () => {
        const current = settingsForm.leadStatuses || [];
        setSettingsForm(prev => ({
            ...prev,
            leadStatuses: [...current, 'New Stage']
        }));
    };

    const handleRemoveStatus = (index: number) => {
        const current = [...(settingsForm.leadStatuses || [])];
        current.splice(index, 1);
        setSettingsForm(prev => ({ ...prev, leadStatuses: current }));
    };

    const handleStatusChange = (index: number, value: string) => {
        const current = [...(settingsForm.leadStatuses || [])];
        current[index] = value;
        setSettingsForm(prev => ({ ...prev, leadStatuses: current }));
    };

    const handleMoveStatus = (index: number, direction: 'up' | 'down') => {
        const current = [...(settingsForm.leadStatuses || [])];
        if (direction === 'up' && index > 0) {
            [current[index], current[index - 1]] = [current[index - 1], current[index]];
        } else if (direction === 'down' && index < current.length - 1) {
            [current[index], current[index + 1]] = [current[index + 1], current[index]];
        }
        setSettingsForm(prev => ({ ...prev, leadStatuses: current }));
    };

    const handleResetStatuses = () => {
        setConfirmAction({ id: 'reset', type: 'reset-leads' });
    };

    const [globalSaved, setGlobalSaved] = useState(false);

    const handleSaveGlobalConfig = async () => {
        setIsProcessing(true);
        const ok = await updateCompanySettings(settingsForm);
        setIsProcessing(false);
        if (ok) {
            setGlobalSaved(true);
            setTimeout(() => setGlobalSaved(false), 3500);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8 pb-10"
        >
            <Tab3DBanner
                cards={[
                    { title: "Global Website CMS", value: "v4.2 Live", subtitle: "Public Theme & Assets", emoji: "⚙️", gradient: "cyan", linkText: "Site Config", linkPath: "#site_config" },
                    { title: "Apple Glassmorphism", value: "iOS 18 Theme", subtitle: "Design System Active", emoji: "🎨", gradient: "yellow", linkText: "Theme Settings", linkPath: "#theme_settings" },
                    { title: "Domain & DNS Health", value: "100% Uptime", subtitle: "Production SSL Active", emoji: "🚀", gradient: "pink" }
                ]}
            />
            <div id="site_config">
                <h1 className="text-2xl font-bold text-[#0B2240]">Website Settings</h1>
                <p className="text-slate-500">Manage global company information and public resources.</p>
            </div>

            {/* Legal Onboarding Content Section */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8">
                <h2 className="text-lg font-bold text-[#0B2240] mb-6 flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-blue-600" />
                    Advisor Onboarding Legal Documents
                </h2>
                <div className="space-y-8">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-3 ml-2 tracking-wider">Terms of Use (Step 2)</label>
                        <textarea
                            className="w-full bg-slate-50 border border-slate-200 rounded-[2rem] p-6 text-sm font-medium focus:ring-2 focus:ring-[#0A62A7] focus:border-transparent transition-all focus:bg-white outline-none h-64"
                            value={settingsForm.termsOfUse || ''}
                            onChange={e => setSettingsForm({ ...settingsForm, termsOfUse: e.target.value })}
                            placeholder="Enter the full Terms of Use text..."
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-3 ml-2 tracking-wider">Solicitor & Independent Contractor Agreement (Step 3)</label>
                        <textarea
                            className="w-full bg-slate-50 border border-slate-200 rounded-[2rem] p-6 text-sm font-medium focus:ring-2 focus:ring-[#0A62A7] focus:border-transparent transition-all focus:bg-white outline-none h-64"
                            value={settingsForm.solicitorAgreement || ''}
                            onChange={e => setSettingsForm({ ...settingsForm, solicitorAgreement: e.target.value })}
                            placeholder="Enter the Solicitor Agreement text..."
                        />
                    </div>
                    <div className="flex justify-end pt-4 border-t border-slate-100">
                        <button
                            onClick={handleSettingsSave}
                            className="bg-[#0A62A7] text-white px-8 py-3 rounded-full font-bold text-sm shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2"
                        >
                            <Save className="h-4 w-4" /> Save Legal Content
                        </button>
                    </div>
                </div>
            </div>

            {/* Theme & Branding Configuration */}
            <div id="theme_settings" className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8">
                <h2 className="text-lg font-bold text-[#0B2240] mb-6 flex items-center gap-2">
                    <span className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white text-xs">✨</span>
                    Theme & Global Branding Settings
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    {/* Primary Color */}
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Primary Action Color</label>
                        <div className="flex items-center gap-4">
                            <input
                                type="color"
                                className="w-12 h-12 rounded cursor-pointer border-0 bg-transparent p-0"
                                value={settingsForm.themePrimaryColor || '#2563EB'}
                                onChange={e => setSettingsForm({ ...settingsForm, themePrimaryColor: e.target.value })}
                            />
                            <div className="flex-1">
                                <input
                                    type="text"
                                    className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono"
                                    value={settingsForm.themePrimaryColor || '#2563EB'}
                                    onChange={e => setSettingsForm({ ...settingsForm, themePrimaryColor: e.target.value })}
                                />
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2">Replaces default blue buttons and accents.</p>
                    </div>

                    {/* Secondary Color */}
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Secondary Theme Color (Navy)</label>
                        <div className="flex items-center gap-4">
                            <input
                                type="color"
                                className="w-12 h-12 rounded cursor-pointer border-0 bg-transparent p-0"
                                value={settingsForm.themeSecondaryColor || '#0B2240'}
                                onChange={e => setSettingsForm({ ...settingsForm, themeSecondaryColor: e.target.value })}
                            />
                            <div className="flex-1">
                                <input
                                    type="text"
                                    className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono"
                                    value={settingsForm.themeSecondaryColor || '#0B2240'}
                                    onChange={e => setSettingsForm({ ...settingsForm, themeSecondaryColor: e.target.value })}
                                />
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2">Replaces global dark backgrounds, Navbars, Footers.</p>
                    </div>

                    {/* Structure/Layout */}
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-3">System Layout Structure</label>
                        <select
                            className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent cursor-pointer font-bold"
                            value={settingsForm.themeStructure || 'default'}
                            onChange={e => setSettingsForm({ ...settingsForm, themeStructure: e.target.value as any })}
                        >
                            <option value="default">Default Framework (Standard Corners)</option>
                            <option value="modern">Modern Liquid (Pill Shapes & Huge Blurs)</option>
                            <option value="minimal">Minimalist Wireframe (Sharp & Flat)</option>
                            <option value="bold">Brutalist Bold (Thick Borders & Shadows)</option>
                            <option value="ios">Apple iOS 26 (Glassmorphism & Depth)</option>
                            <option value="macos">macOS Sequoia (Subtle Drop Shadows)</option>
                            <option value="material">Google Material You (Fat Rounded & Flat)</option>
                            <option value="neumorphic">Neumorphic Soft UI (Inset Extrusions)</option>
                        </select>
                        <p className="text-[10px] text-slate-400 mt-2">Instantly rebuilds UI edges, shadows, and spacing sizes globally.</p>
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100">
                    <button
                        onClick={handleSettingsSave}
                        className="bg-purple-600 text-white px-8 py-3 rounded-full font-bold text-sm shadow-lg hover:bg-purple-700 transition-all flex items-center gap-2"
                    >
                        <Save className="h-4 w-4" /> Save Global Theme
                    </button>
                </div>
            </div>

            {/* Integrations & API Connections Section */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8">
                <h2 className="text-lg font-bold text-[#0B2240] mb-6 flex items-center gap-2">
                    <LinkIcon className="h-5 w-5 text-indigo-600" />
                    Integrations & API Connections
                </h2>

                <form onSubmit={handleSettingsSave} className="space-y-6">
                    {/* ── Plaid Banking Integration ─────────────────────────────── */}
                    <PlaidConfigPanel settingsForm={settingsForm} setSettingsForm={setSettingsForm} />

                    <div className="flex justify-end pt-4 border-t border-slate-100">
                        <button
                            type="submit"
                            className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold text-sm shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2"
                        >
                            <Save className="h-4 w-4" /> Save API Integrations
                        </button>
                    </div>
                </form>
            </div>

            {/* System Maintenance Section */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8">
                <h2 className="text-lg font-bold text-[#0B2240] mb-6 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                    System Maintenance & Global Alerts
                </h2>
                <div className="space-y-6">
                    <div className="bg-orange-50 p-6 rounded-xl border border-orange-100">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-sm font-bold text-orange-900 uppercase tracking-wide">Maintenance Mode Banner</h3>
                                <p className="text-xs text-orange-700 mt-1">Show a global sliding marquee/notice to all website visitors.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    className="sr-only peer"
                                    checked={settingsForm.maintenanceModeEnabled || false}
                                    onChange={e => setSettingsForm({ ...settingsForm, maintenanceModeEnabled: e.target.checked })}
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                            </label>
                        </div>
                        
                        <div className="space-y-2 mt-6">
                            <label className="text-[10px] font-black text-orange-800 uppercase tracking-widest ml-2">Announcement Message</label>
                            <input
                                type="text"
                                className="w-full bg-white border border-orange-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 font-bold text-orange-900"
                                placeholder="e.g. Website is currently undergoing maintenance. Some services may be limited."
                                value={settingsForm.maintenanceModeText || ''}
                                onChange={e => setSettingsForm({ ...settingsForm, maintenanceModeText: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-slate-100">
                        <button
                            onClick={handleSettingsSave}
                            className="bg-orange-600 text-white px-8 py-3 rounded-full font-bold text-sm shadow-lg hover:bg-orange-700 transition-all flex items-center gap-2"
                        >
                            <Save className="h-4 w-4" /> Update Maintenance Status
                        </button>
                    </div>
                </div>
            </div>

            {/* Company Information Section */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8">
                <h2 className="text-lg font-bold text-[#0B2240] mb-6 flex items-center gap-2">
                    <Globe className="h-5 w-5 text-blue-600" />
                    Company Contact Information
                </h2>
                <form onSubmit={handleSettingsSave} className="space-y-6">

                    {/* Logo Settings */}
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-6">
                        <h3 className="text-sm font-bold text-[#0B2240] mb-4 uppercase tracking-wide flex items-center gap-2">
                            <ImageIcon className="h-4 w-4" /> Company Logo
                        </h3>
                        <div className="flex flex-col md:flex-row gap-6 items-center">
                            <div className="w-24 h-24 bg-slate-200 rounded-xl overflow-hidden relative flex items-center justify-center">
                                {settingsForm.logoUrl ? (
                                    <img
                                        src={settingsForm.logoUrl}
                                        className="w-full h-full object-contain p-2"
                                        alt="Logo"
                                    />
                                ) : (
                                    <span className="text-xs text-slate-400 font-bold">Default</span>
                                )}
                            </div>
                            <div className="flex-1 w-full space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Logo URL</label>
                                    <div className="flex gap-3">
                                        <input
                                            type="text"
                                            className="flex-1 bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0A62A7] focus:border-transparent"
                                            value={settingsForm.logoUrl || ''}
                                            onChange={e => setSettingsForm({ ...settingsForm, logoUrl: e.target.value })}
                                            placeholder="https://..."
                                        />
                                        <label className="cursor-pointer bg-white px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 flex items-center justify-center">
                                            <Upload className="h-4 w-4 text-slate-600" />
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        setIsUploading(true);
                                                        try {
                                                            const storageUrl = await Backend.uploadDirectToSupabase(file);
                                                            setSettingsForm(prev => ({ ...prev, logoUrl: storageUrl }));
                                                        } catch (err) {
                                                            console.error("Logo upload failed:", err);
                                                        }
                                                        setIsUploading(false);
                                                    }
                                                }}
                                            />
                                        </label>
                                    </div>
                                </div>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                        checked={settingsForm.hideLogo || false}
                                        onChange={e => setSettingsForm({ ...settingsForm, hideLogo: e.target.checked })}
                                    />
                                    <span className="text-sm font-bold text-slate-700">Hide Logo in Navbar</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Footer Description & Social Links */}
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-6">
                        <h3 className="text-sm font-bold text-[#0B2240] mb-4 uppercase tracking-wide flex items-center gap-2">
                            <Share2 className="h-4 w-4" /> Footer & Social Media
                        </h3>

                        <div className="mb-6">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Footer Description</label>
                            <textarea
                                className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#0A62A7] focus:border-transparent resize-none"
                                rows={3}
                                value={settingsForm.footerDescription || ''}
                                onChange={e => setSettingsForm({ ...settingsForm, footerDescription: e.target.value })}
                                placeholder="Brief company description for the footer..."
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase">Social Media Links</label>
                                <button type="button" onClick={handleAddSocial} className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800"><Plus className="h-3 w-3" /> Add Link</button>
                            </div>
                            {settingsForm.socialLinks?.map((link, index) => (
                                <div key={index} className="flex gap-3">
                                    <div className="w-1/3 md:w-1/4">
                                        <select
                                            className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#0A62A7] focus:border-transparent"
                                            value={link.platform}
                                            onChange={e => handleSocialChange(index, 'platform', e.target.value as any)}
                                        >
                                            <option value="LinkedIn">LinkedIn</option>
                                            <option value="Facebook">Facebook</option>
                                            <option value="Twitter">Twitter</option>
                                            <option value="Instagram">Instagram</option>
                                            <option value="X">X (Twitter)</option>
                                            <option value="TikTok">TikTok</option>
                                            <option value="YouTube">YouTube</option>
                                        </select>
                                    </div>
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-[#0A62A7] focus:border-transparent"
                                            placeholder="Profile URL"
                                            value={link.url}
                                            onChange={e => handleSocialChange(index, 'url', e.target.value)}
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveSocial(index)}
                                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Hero Background Settings */}
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-6">
                        <h3 className="text-sm font-bold text-[#0B2240] mb-4 uppercase tracking-wide flex items-center gap-2">
                            <ImageIcon className="h-4 w-4" /> Homepage Visuals
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Background Type</label>
                                <select
                                    className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#0A62A7] focus:border-transparent"
                                    value={settingsForm.heroBackgroundType}
                                    onChange={e => setSettingsForm({ ...settingsForm, heroBackgroundType: e.target.value as any })}
                                >
                                    <option value="image">Image</option>
                                    <option value="video">Direct Video (MP4)</option>
                                    <option value="youtube">YouTube Embed</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">

                                {settingsForm.heroBackgroundType !== 'video' ? (
                                    <div className="flex flex-col gap-3">
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Media Source</label>
                                        <div className="relative">
                                            {settingsForm.heroBackgroundType === 'youtube' ?
                                                <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" /> :
                                                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            }
                                            <input
                                                type="text"
                                                className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-[#0A62A7] focus:border-transparent"
                                                placeholder={
                                                    settingsForm.heroBackgroundType === 'youtube' ? "Paste YouTube URL or Embed Code" :
                                                        "e.g. https://picsum.photos/1600/900"
                                                }
                                                value={settingsForm.heroBackgroundUrl}
                                                onChange={e => handleUrlChange(e.target.value)}
                                            />
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-bold text-slate-400 uppercase">OR</span>
                                            <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 bg-white border border-dashed border-slate-300 rounded-xl py-2.5 hover:bg-slate-50 hover:border-blue-300 transition-all group relative">
                                                <Upload className="h-4 w-4 text-slate-400 group-hover:text-blue-500" />
                                                <span className="text-sm text-slate-600 group-hover:text-blue-600 font-medium">Upload File</span>
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={handleFileUpload}
                                                />
                                            </label>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-center justify-between">
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                                                Hero MP4 Video Playlist (Up to 3 Videos in Infinite Rotation)
                                            </label>
                                            <span className="text-[10px] font-black uppercase bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                                                {(settingsForm.heroVideoPlaylist || []).filter(Boolean).length} / 3 Videos Active
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4">
                                            {[0, 1, 2].map((slotIdx) => {
                                                const videoUrl = settingsForm.heroVideoPlaylist?.[slotIdx] || (slotIdx === 0 ? settingsForm.heroBackgroundUrl : '');
                                                return (
                                                    <div key={slotIdx} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-3 relative">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                                                                <VideoIcon className="h-4 w-4 text-blue-600" />
                                                                Video Slot {slotIdx + 1} {slotIdx === 0 && "(Primary)"}
                                                            </span>
                                                            {videoUrl && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveVideoSlot(slotIdx)}
                                                                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold"
                                                                    title="Remove Video"
                                                                >
                                                                    <Trash2 className="h-3.5 w-3.5" /> Remove
                                                                </button>
                                                            )}
                                                        </div>

                                                        {videoUrl ? (
                                                            <div className="rounded-xl overflow-hidden bg-black aspect-video relative border border-slate-200 max-h-48">
                                                                <video
                                                                    key={videoUrl}
                                                                    src={videoUrl}
                                                                    controls
                                                                    muted
                                                                    className="w-full h-full object-cover"
                                                                />
                                                                <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-md px-2.5 py-0.5 rounded-full text-white text-[9px] font-bold uppercase tracking-wider">
                                                                    Slot {slotIdx + 1} Live Preview
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="h-24 bg-white rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-xs font-semibold">
                                                                Empty Video Slot {slotIdx + 1}
                                                            </div>
                                                        )}

                                                        <div className="flex flex-col md:flex-row gap-3">
                                                            <input
                                                                type="text"
                                                                className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                                                                placeholder={`Video ${slotIdx + 1} MP4 URL or Storage Link`}
                                                                value={videoUrl || ''}
                                                                onChange={(e) => {
                                                                    const newPlaylist = [...(settingsForm.heroVideoPlaylist || [])];
                                                                    newPlaylist[slotIdx] = e.target.value;
                                                                    const cleanPlaylist = newPlaylist.slice(0, 3);
                                                                    const updated = {
                                                                        ...settingsForm,
                                                                        heroVideoPlaylist: cleanPlaylist,
                                                                        heroBackgroundUrl: cleanPlaylist[0] || e.target.value,
                                                                        heroBackgroundType: 'video' as const
                                                                    };
                                                                    setSettingsForm(updated);
                                                                    updateCompanySettings(updated);
                                                                }}
                                                            />
                                                            <label className="cursor-pointer flex items-center justify-center gap-2 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-600 border border-slate-300 hover:border-blue-300 px-4 py-2 rounded-xl transition-all font-medium text-xs">
                                                                <Upload className="h-4 w-4 text-blue-500" />
                                                                <span>Upload Local MP4</span>
                                                                <input
                                                                    type="file"
                                                                    className="hidden"
                                                                    accept="video/mp4,video/webm,video/mov"
                                                                    onChange={(e) => handleFileUploadForSlot(e, slotIdx)}
                                                                />
                                                            </label>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {uploadError && (
                                    <div className="flex items-center gap-2 text-red-600 text-xs font-bold animate-fade-in mt-2">
                                        <AlertCircle className="h-3 w-3" />
                                        {uploadError}
                                    </div>
                                )}
                            </div>
                            <div className="md:col-span-3">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Hero Title</label>
                                <input
                                    type="text"
                                    className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#0A62A7] focus:border-transparent"
                                    value={settingsForm.heroTitle || ''}
                                    onChange={e => setSettingsForm({ ...settingsForm, heroTitle: e.target.value })}
                                />
                            </div>
                            <div className="md:col-span-3">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Hero Subtitle</label>
                                <textarea
                                    className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#0A62A7] focus:border-transparent"
                                    rows={2}
                                    value={settingsForm.heroSubtitle || ''}
                                    onChange={e => setSettingsForm({ ...settingsForm, heroSubtitle: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* About Us Page Image Setting */}
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-6">
                        <h3 className="text-sm font-bold text-[#0B2240] mb-4 uppercase tracking-wide flex items-center gap-2">
                            <Camera className="h-4 w-4" /> About Us Page Image
                        </h3>
                        <div className="flex flex-col md:flex-row gap-6 items-center">
                            <div className="w-full md:w-1/3 h-40 bg-slate-200 rounded-xl overflow-hidden relative">
                                {settingsForm.aboutImageUrl ? (
                                    <img
                                        src={settingsForm.aboutImageUrl}
                                        className="w-full h-full object-cover"
                                        alt="About Page"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-400 text-xs font-bold uppercase tracking-wider">No Image Uploaded</div>
                                )}
                            </div>
                            <div className="flex-1 w-full">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Image URL</label>
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        className="flex-1 bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0A62A7] focus:border-transparent"
                                        value={settingsForm.aboutImageUrl || ''}
                                        onChange={e => setSettingsForm({ ...settingsForm, aboutImageUrl: e.target.value })}
                                        placeholder="https://..."
                                    />
                                    <label className="cursor-pointer bg-white px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 flex items-center justify-center">
                                        <Upload className="h-4 w-4 text-slate-600" />
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleAboutImageUpload}
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Product Page Images Setting */}
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-6">
                        <h3 className="text-sm font-bold text-[#0B2240] mb-4 uppercase tracking-wide flex items-center gap-2">
                            <BookOpen className="h-4 w-4" /> Product Page Images
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Object.values(ProductType).map(productType => {
                                if ([ProductType.LIFE, ProductType.BUSINESS, ProductType.REAL_ESTATE, ProductType.AUTO, ProductType.EO, ProductType.SECURITIES, ProductType.MORTGAGE].includes(productType)) {
                                    return (
                                        <div key={productType} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                            <p className="text-xs font-bold text-slate-500 uppercase mb-2 truncate" title={productType}>{productType}</p>
                                            <div className="w-full h-32 bg-slate-100 rounded-lg overflow-hidden mb-3 border border-slate-200 relative group">
                                                {settingsForm.productImages?.[productType] ? (
                                                    <img src={settingsForm.productImages[productType]} className="w-full h-full object-cover" alt={productType} />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">Default</div>
                                                )}
                                                <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                                    <span className="text-white text-xs font-bold flex items-center gap-1"><Upload className="h-3 w-3" /> Change</span>
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={(e) => handleProductImageUpload(e, productType)}
                                                    />
                                                </label>
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Image URL..."
                                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent outline-none"
                                                value={settingsForm.productImages?.[productType] || ''}
                                                onChange={(e) => setSettingsForm(prev => ({
                                                    ...prev,
                                                    productImages: { ...(prev.productImages || {}), [productType]: e.target.value }
                                                }))}
                                            />
                                        </div>
                                    )
                                }
                                return null;
                            })}
                        </div>
                    </div>

                    {/* Hidden Products Setting */}
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-6">
                        <h3 className="text-sm font-bold text-[#0B2240] mb-4 uppercase tracking-wide flex items-center gap-2">
                            <EyeOff className="h-4 w-4" /> Hidden Products
                        </h3>
                        <p className="text-xs text-slate-500 mb-4">Select products to hide from the public website navigation and product listings.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {Object.values(ProductType).map(productType => {
                                const isHidden = settingsForm.hiddenProducts?.includes(productType) || false;
                                return (
                                    <label key={productType} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${isHidden ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200 hover:border-blue-300'}`}>
                                        <input
                                            type="checkbox"
                                            className="rounded border-slate-300 text-red-600 focus:ring-red-500"
                                            checked={isHidden}
                                            onChange={(e) => {
                                                const currentHidden = settingsForm.hiddenProducts || [];
                                                const newHidden = e.target.checked
                                                    ? [...currentHidden, productType]
                                                    : currentHidden.filter(p => p !== productType);
                                                setSettingsForm(prev => ({ ...prev, hiddenProducts: newHidden }));
                                            }}
                                        />
                                        <span className={`text-sm font-bold ${isHidden ? 'text-red-700' : 'text-slate-700'}`}>{productType}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    type="text"
                                    className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-[#0A62A7] focus:border-transparent"
                                    value={settingsForm.phone}
                                    onChange={e => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase">
                                    Email Addresses
                                </label>
                                <button type="button" onClick={handleAddEmail} className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800">
                                    <Plus className="h-3 w-3" /> Add Email
                                </button>
                            </div>
                            <div className="space-y-3">
                                {parsedEmails.map((emailItem, index) => (
                                    <div key={index} className="flex gap-3 items-center">
                                        <div className="w-1/3 md:w-1/4 relative">
                                            <input
                                                className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-[#0A62A7] focus:border-transparent font-medium"
                                                placeholder="Label (e.g. Sales)"
                                                value={emailItem.label}
                                                onChange={e => handleEmailChange(index, 'label', e.target.value)}
                                            />
                                        </div>
                                        <div className="flex-1 relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <input
                                                className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-[#0A62A7] focus:border-transparent"
                                                placeholder="Email Address"
                                                value={emailItem.address}
                                                onChange={e => handleEmailChange(index, 'address', e.target.value)}
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveEmail(index)}
                                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Address Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <div className="flex justify-between items-center mb-1.5">
                                <label className="block text-xs font-bold text-slate-500 uppercase">Street Address</label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                        checked={settingsForm.hideStreetAddress || false}
                                        onChange={e => setSettingsForm({ ...settingsForm, hideStreetAddress: e.target.checked })}
                                    />
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Hide Street (Show City/State only)</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer ml-4">
                                    <input
                                        type="checkbox"
                                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                        checked={settingsForm.hideDirectLine || false}
                                        onChange={e => setSettingsForm({ ...settingsForm, hideDirectLine: e.target.checked })}
                                    />
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Hide Direct Line</span>
                                </label>
                            </div>
                            <div className={`relative transition-opacity duration-300 ${settingsForm.hideStreetAddress ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    type="text"
                                    className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-[#0A62A7] focus:border-transparent"
                                    value={settingsForm.address}
                                    onChange={e => setSettingsForm({ ...settingsForm, address: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">City</label>
                            <input
                                type="text"
                                className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#0A62A7] focus:border-transparent"
                                value={settingsForm.city}
                                onChange={e => setSettingsForm({ ...settingsForm, city: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">State</label>
                                <input
                                    type="text"
                                    className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#0A62A7] focus:border-transparent"
                                    value={settingsForm.state}
                                    onChange={e => setSettingsForm({ ...settingsForm, state: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Zip</label>
                                <input
                                    type="text"
                                    className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#0A62A7] focus:border-transparent"
                                    value={settingsForm.zip}
                                    onChange={e => setSettingsForm({ ...settingsForm, zip: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                        <p className="text-xs text-slate-400 flex items-center">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Updates reflect immediately on public site.
                        </p>
                        <div className="flex items-center gap-4">
                            {isSaved && <span className="text-green-600 text-sm font-bold animate-fade-in">Saved!</span>}
                            <button type="submit" className="bg-[#0A62A7] text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:bg-blue-700 transition-colors flex items-center gap-2">
                                <Save className="h-4 w-4" /> Save Settings
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* CRM Customization Section */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-[#0B2240] flex items-center gap-2">
                        <Layout className="h-5 w-5 text-blue-600" />
                        CRM Lead Customization
                    </h2>
                    <button 
                        onClick={handleResetStatuses}
                        className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest"
                    >
                        Reset to Defaults
                    </button>
                </div>

                <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-sm font-black text-[#0B2240] uppercase tracking-wide">Lead Lifecycle Stages</h3>
                            <p className="text-xs text-slate-500 mt-1">Define the workflow stages for your leads. These will appear in the Leads Database.</p>
                        </div>
                        <button 
                            onClick={handleAddStatus}
                            className="bg-blue-600 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md hover:bg-blue-700 transition-all flex items-center gap-2"
                        >
                            <Plus className="h-4 w-4" /> Add Stage
                        </button>
                    </div>

                    <div className="space-y-3">
                        {(settingsForm.leadStatuses || []).map((status, index) => (
                            <div key={index} className="flex items-center gap-3 animate-fade-in group">
                                <div className="flex flex-col gap-1">
                                    <button 
                                        onClick={() => handleMoveStatus(index, 'up')}
                                        disabled={index === 0}
                                        className="text-slate-300 hover:text-blue-500 disabled:opacity-0 transition-colors"
                                    >
                                        <Plus className="h-3 w-3 rotate-45 scale-75" />
                                    </button>
                                    <div className="h-1 w-1 bg-slate-300 rounded-full mx-auto"></div>
                                    <button 
                                        onClick={() => handleMoveStatus(index, 'down')}
                                        disabled={index === (settingsForm.leadStatuses?.length || 0) - 1}
                                        className="text-slate-300 hover:text-blue-500 disabled:opacity-0 transition-colors"
                                    >
                                        <Plus className="h-3 w-3 -rotate-45 scale-75" />
                                    </button>
                                </div>
                                
                                <input 
                                    type="text" 
                                    value={status} 
                                    onChange={(e) => handleStatusChange(index, e.target.value)}
                                    className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-[#0B2240] focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                                />

                                <button 
                                    onClick={() => handleRemoveStatus(index)}
                                    className="p-3 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                        
                        {(settingsForm.leadStatuses || []).length === 0 && (
                            <div className="text-center py-10 bg-white/50 rounded-2xl border-2 border-dashed border-slate-200">
                                <p className="text-sm text-slate-400 italic">No custom stages defined. Add your first stage above.</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-200 flex justify-end">
                        <button 
                            onClick={handleSettingsSave}
                            className="bg-[#0B2240] text-white px-8 py-3 rounded-full font-bold text-sm shadow-xl hover:bg-slate-800 transition-all flex items-center gap-2"
                        >
                            <Save className="h-4 w-4" /> Update CRM Stages
                        </button>
                    </div>
                </div>
            </div>

            {/* Partner Management Section */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-[#0B2240] flex items-center gap-2">
                        <Handshake className="h-5 w-5 text-blue-600" />
                        Partner Logos
                    </h2>
                    <div className="flex gap-2">
                        {partnersSaved && <span className="text-green-600 text-sm font-bold animate-fade-in flex items-center"><CheckCircle2 className="h-4 w-4 mr-1" /> Saved</span>}
                        <button onClick={handlePartnersSave} className="text-xs font-bold bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100">Save Changes</button>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
                    {Object.entries(settingsForm.partners || {}).map(([name, url]) => (
                        <div key={name} className="relative group bg-slate-50 rounded-xl p-4 flex flex-col items-center justify-center border border-slate-200">
                            <img
                                src={(url as string).startsWith('http') || (url as string).startsWith('data:') ? url : `https://logo.clearbit.com/${url}`}
                                alt={name}
                                className="h-8 object-contain mb-2"
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                            <span className="text-xs font-bold text-slate-500">{name}</span>
                            <button
                                onClick={() => removePartner(name)}
                                className="absolute top-1 right-1 p-1 bg-white rounded-full shadow-sm text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                            >
                                <Trash2 className="h-3 w-3" />
                            </button>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col md:flex-row gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <input
                        className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-[#0A62A7] outline-none"
                        placeholder="Partner Name"
                        value={newPartner.name}
                        onChange={e => setNewPartner({ ...newPartner, name: e.target.value })}
                    />
                    <div className="flex-1 relative">
                        <input
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-[#0A62A7] outline-none pr-10"
                            placeholder="Domain (e.g. google.com) or Upload"
                            value={newPartner.value}
                            onChange={e => setNewPartner({ ...newPartner, value: e.target.value })}
                        />
                        <label className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer text-slate-400 hover:text-blue-600 transition-colors" title="Upload Logo">
                            <Upload className="h-4 w-4" />
                            <input type="file" className="hidden" accept="image/*" onChange={handlePartnerLogoUpload} />
                        </label>
                    </div>
                    <button
                        onClick={addPartner}
                        className="bg-[#0B2240] text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors"
                    >
                        Add
                    </button>
                </div>

                <div className="mt-8 border-t border-slate-100 pt-8">
                    <label className="block text-sm font-bold text-[#0B2240] mb-2">Marquee Animation Speed (Seconds)</label>
                    <p className="text-xs text-slate-500 mb-4">Lower value = Faster scrolling. Higher value = Slower scrolling. Default is 30s.</p>
                    <div className="flex items-center gap-4 max-w-md">
                        <input
                            type="range"
                            min="5"
                            max="120"
                            step="1"
                            value={settingsForm.partnerMarqueeSpeed || 30}
                            onChange={e => {
                                const speed = parseInt(e.target.value);
                                const updated = { ...settingsForm, partnerMarqueeSpeed: speed };
                                setSettingsForm(updated);
                                updateCompanySettings(updated); // auto save
                            }}
                            className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                        <span className="font-bold text-slate-700 w-12">{settingsForm.partnerMarqueeSpeed || 30}s</span>
                    </div>
                </div>
            </div>
            {/* Resource Management Section */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-[#0B2240] flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                        Resource Library
                    </h2>
                    <button
                        onClick={() => setIsResourceModalOpen(true)}
                        className="bg-[#0A62A7] text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" /> Add Resource
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500">
                            <tr>
                                <th className="px-6 py-4 rounded-tl-xl">Title</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Likes</th>
                                <th className="px-6 py-4">Date Added</th>
                                <th className="px-6 py-4 rounded-tr-xl text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {resources.map(res => (
                                <tr key={res.id} className="hover:bg-slate-50/50">
                                    <td className="px-6 py-4 font-bold text-slate-800">{res.title}</td>
                                    <td className="px-6 py-4"><span className="bg-slate-100 px-2 py-1 rounded text-xs font-bold">{res.type}</span></td>
                                    <td className="px-6 py-4">{res.likes}</td>
                                    <td className="px-6 py-4 text-xs">{new Date(res.dateAdded).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => deleteResource(res.id)} className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {resources.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center py-8 text-slate-400 italic">No resources uploaded.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Resource Modal */}
            {isResourceModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B2240]/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg p-8 animate-fade-in max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold text-[#0B2240] mb-6">Add New Resource</h2>
                        <form onSubmit={handleResourceSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Title</label>
                                <input
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#0A62A7] outline-none"
                                    value={newResource.title}
                                    onChange={e => setNewResource({ ...newResource, title: e.target.value })}
                                    placeholder="e.g. Life Insurance Guide"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Type</label>
                                <select
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#0A62A7] outline-none"
                                    value={newResource.type}
                                    onChange={e => setNewResource({ ...newResource, type: e.target.value as any })}
                                >
                                    <option value="PDF">PDF Document</option>
                                    <option value="Video">Direct Video (MP4)</option>
                                    <option value="YouTube">YouTube Video</option>
                                    <option value="Link">External Link</option>
                                    <option value="Article">Article</option>
                                    <option value="Blog">Blog Post</option>
                                    <option value="Image">Image</option>
                                </select>
                            </div>

                            {(['PDF', 'Image', 'Video'].includes(newResource.type || '')) && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Upload File</label>
                                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
                                        <input
                                            type="file"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            accept={newResource.type === 'PDF' ? '.pdf' : newResource.type === 'Image' ? 'image/*' : 'video/*'}
                                            onChange={handleResourceFileUpload}
                                        />
                                        {isUploading ? (
                                            <div className="flex items-center justify-center gap-2 text-blue-600 font-bold">
                                                <Loader2 className="h-5 w-5 animate-spin" /> Uploading...
                                            </div>
                                        ) : newResource.url && newResource.url.startsWith('data:') ? (
                                            <div className="text-green-600 font-bold flex items-center justify-center gap-2">
                                                <CheckCircle2 className="h-5 w-5" /> File Ready
                                            </div>
                                        ) : (
                                            <>
                                                <Upload className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                                                <p className="text-sm font-medium text-slate-600">Click to upload or drag and drop</p>
                                                <p className="text-xs text-slate-400 mt-1">Max 250MB (Demo)</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            {(['Video', 'Blog', 'YouTube'].includes(newResource.type || '')) && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Cover Image / Thumbnail</label>
                                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
                                        <input
                                            type="file"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            accept="image/*"
                                            onChange={handleResourceThumbnailUpload}
                                        />
                                        {newResource.thumbnail ? (
                                            <img src={newResource.thumbnail} alt="Thumbnail" className="h-20 mx-auto object-cover rounded-lg" />
                                        ) : (
                                            <span className="text-xs text-slate-500 font-bold flex items-center justify-center gap-2"><ImageIcon className="h-4 w-4" /> Upload Cover Image</span>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                                    {newResource.type === 'YouTube' ? 'YouTube URL' :
                                        newResource.type === 'Blog' ? 'External Blog URL (Optional)' : 'Resource URL'}
                                </label>
                                <input
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#0A62A7] outline-none"
                                    value={newResource.url}
                                    onChange={e => setNewResource({ ...newResource, url: e.target.value })}
                                    placeholder={newResource.type === 'YouTube' ? 'https://youtube.com/watch?v=...' : 'https://...'}
                                    disabled={isUploading}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
                                <textarea
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#0A62A7] outline-none resize-none"
                                    rows={3}
                                    value={newResource.description}
                                    onChange={e => setNewResource({ ...newResource, description: e.target.value })}
                                />
                            </div>

                            {newResource.type === 'Blog' && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Blog Content</label>
                                    <textarea
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#0A62A7] focus:border-transparent outline-none resize-none h-40"
                                        placeholder="Write your article here..."
                                        value={newResource.content}
                                        onChange={e => setNewResource({ ...newResource, content: e.target.value })}
                                    />
                                </div>
                            )}

                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setIsResourceModalOpen(false)} className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-colors">Cancel</button>
                                <button type="submit" disabled={isUploading} className="flex-1 py-3 rounded-xl font-bold bg-[#0A62A7] text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/20 disabled:opacity-50">
                                    {isUploading ? 'Uploading...' : 'Add Resource'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            <ConfirmModal 
                isOpen={!!confirmAction}
                onClose={() => setConfirmAction(null)}
                onConfirm={handleConfirmedAction}
                loading={isProcessing}
                title={
                    confirmAction?.type === 'resource' ? "Delete Resource?" :
                    confirmAction?.type === 'reset-leads' ? "Reset Lead Stages?" :
                    confirmAction?.type === 'partner' ? "Remove Partner?" : "Remove Social Link?"
                }
                message={
                    confirmAction?.type === 'resource' ? "Are you sure you want to permanently delete this resource from the library?" :
                    confirmAction?.type === 'reset-leads' ? "This will reset all your custom lead stages to the system defaults. This cannot be undone." :
                    confirmAction?.type === 'partner' ? `Are you sure you want to remove ${confirmAction.metadata?.name} from your partners list?` :
                    "Are you sure you want to remove this social media link?"
                }
                confirmText={
                    confirmAction?.type === 'reset-leads' ? "Reset Now" : "Delete"
                }
            />

            {/* Floating Save All Button */}
            <div className="fixed bottom-8 right-8 z-50 flex items-center gap-3">
                {globalSaved && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, x: 20 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.9, x: 20 }}
                        className="bg-emerald-600 text-white font-bold text-xs px-5 py-3.5 rounded-full shadow-2xl flex items-center gap-2"
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        Saved Successfully!
                    </motion.div>
                )}
                <button
                    onClick={handleSaveGlobalConfig}
                    disabled={isProcessing}
                    className="flex items-center gap-3 px-8 py-4 bg-[#0A62A7] text-white rounded-full font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all group disabled:opacity-50"
                >
                    {isProcessing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    )}
                    Save Global Configuration
                </button>
            </div>
        </motion.div>
    );
};
