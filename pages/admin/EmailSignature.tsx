import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useData } from '../../context/DataContext';
import { UserRole, SocialLink as SocialLinkType } from '../../types';
import { Copy, Check, Download, Plus, Trash2, RotateCcw, X, Mail, Phone, Globe, MapPin, Facebook, Linkedin, Twitter, Instagram, Maximize2, Move, Ghost, ChevronDown, Database, Link as LinkIcon, ExternalLink, Image as ImageIcon, CheckCircle2, FileImage, Loader2, ShieldCheck } from 'lucide-react';
import { toPng } from 'html-to-image';
import { Tab3DBanner } from '../../components/shared/Tab3DBanner';

type Tab = 'Personal' | 'Contact' | 'Social' | 'Legal';

interface CropperProps {
    imageUrl: string;
    onSave: (croppedImageUrl: string) => void;
    onCancel: () => void;
}

const ImageCropper: React.FC<CropperProps> = ({ imageUrl, onSave, onCancel }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [zoom, setZoom] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const imageRef = useRef<HTMLImageElement | null>(null);

    useEffect(() => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = imageUrl;
        img.onload = () => {
            imageRef.current = img;
            draw();
        };
    }, [imageUrl]);

    const draw = () => {
        const canvas = canvasRef.current;
        const img = imageRef.current;
        if (!canvas || !img) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const size = Math.min(canvas.width, canvas.height);
        const drawWidth = img.width * zoom;
        const drawHeight = img.height * zoom;

        const x = (canvas.width - drawWidth) / 2 + offset.x;
        const y = (canvas.height - drawHeight) / 2 + offset.y;

        ctx.save();
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, size / 2 - 10, 0, Math.PI * 2);
        ctx.clip();

        ctx.drawImage(img, x, y, drawWidth, drawHeight);
        ctx.restore();

        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, size / 2 - 10, 0, Math.PI * 2);
        ctx.strokeStyle = '#3B82F6';
        ctx.lineWidth = 2;
        ctx.stroke();
    };

    useEffect(() => {
        draw();
    }, [zoom, offset]);

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        setOffset({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        });
    };

    const handleMouseUp = () => setIsDragging(false);

    const handleSave = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 400;
        const ctx = canvas.getContext('2d');
        const img = imageRef.current;
        if (!ctx || !img) return;

        const zoomFactor = 400 / 300;
        const drawWidth = img.width * zoom * zoomFactor;
        const drawHeight = img.height * zoom * zoomFactor;
        const x = (400 - drawWidth) / 2 + offset.x * zoomFactor;
        const y = (400 - drawHeight) / 2 + offset.y * zoomFactor;

        ctx.beginPath();
        ctx.arc(200, 200, 200, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, x, y, drawWidth, drawHeight);

        onSave(canvas.toDataURL('image/png'));
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md p-8 animate-fade-in">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-[#0B2240]">Crop & Fit Photo</h3>
                    <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X /></button>
                </div>

                <div className="flex flex-col items-center gap-6">
                    <div
                        className="cursor-move bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-inner"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                    >
                        <canvas ref={canvasRef} width={300} height={300} className="block" />
                    </div>

                    <div className="w-full space-y-2">
                        <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <span>Zoom</span>
                            <span>{Math.round(zoom * 100)}%</span>
                        </div>
                        <input
                            type="range"
                            min="0.1"
                            max="3"
                            step="0.01"
                            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            value={zoom}
                            onChange={(e) => setZoom(parseFloat(e.target.value))}
                        />
                    </div>

                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                        <Move size={12} /> Drag to position image within the frame
                    </div>

                    <div className="flex gap-4 w-full pt-4">
                        <button onClick={onCancel} className="flex-1 py-4 bg-slate-100 text-slate-500 font-bold rounded-2xl hover:bg-slate-200 transition-all">Cancel</button>
                        <button onClick={handleSave} className="flex-1 py-4 bg-[#0B2240] text-white font-bold rounded-2xl hover:bg-blue-900 transition-all shadow-lg">Apply Crop</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const EmailSignature: React.FC = () => {
    const { allUsers, companySettings, updateUser, user } = useData();
    const [selectedAdvisorId, setSelectedAdvisorId] = useState<string>('');
    const [activeTab, setActiveTab] = useState<Tab>('Personal');
    const [copied, setCopied] = useState(false);
    const [isCropping, setIsCropping] = useState(false);
    const [tempImage, setTempImage] = useState<string>('');
    const [isDownloadingImage, setIsDownloadingImage] = useState(false);
    const [visualCopied, setVisualCopied] = useState(false);

    const signatureRef = useRef<HTMLDivElement>(null);
    const exportRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const lastLoadedId = useRef<string | null>(null);

    const DEFAULT_LEGAL = "This email and any attachments may contain confidential and proprietary information intended only for the named recipient(s). If you have received this message in error, please notify the sender immediately and permanently delete it. Any unauthorized review, use, disclosure, or distribution is strictly prohibited.";

    const [editForm, setEditForm] = useState({
        firstName: 'Remmy',
        lastName: 'Shabani',
        title: 'REAL ESTATE & INSURANCE ADVISOR',
        titleFontSize: 11,
        tagline: 'Helping you grow, protect, and preserve what matters most.',
        email: 'remmyk@newhollandfinancial.com',
        phone: '(717) 847-9638',
        phone2: '(515) 318-7450',
        addressLine1: 'Des Moines, IA',
        addressLine2: 'Des Moines, IA 50309',
        city: 'Des Moines',
        state: 'IA',
        zip: '50309',
        avatar: '',
        website: 'www.newhollandfinancial.com',
        socialLinks: [
            { platform: 'Instagram' as const, url: 'https://instagram.com/remmyshabani' },
            { platform: 'TikTok' as const, url: 'https://tiktok.com/@remmyshabani' },
            { platform: 'Facebook' as const, url: 'https://facebook.com/remmyshabani' }
        ],
        confidentialityNotice: DEFAULT_LEGAL
    });

    const eligibleUsers = allUsers.filter(u =>
        u.role === UserRole.ADVISOR ||
        u.role === UserRole.ADMIN ||
        u.role === UserRole.MANAGER ||
        u.role === UserRole.SUB_ADMIN
    );

    useEffect(() => {
        if (eligibleUsers.length > 0 && !selectedAdvisorId) {
            if (user && eligibleUsers.find(u => u.id === user.id)) {
                setSelectedAdvisorId(user.id);
            } else {
                setSelectedAdvisorId(eligibleUsers[0].id);
            }
        }
    }, [eligibleUsers, selectedAdvisorId, user]);

    useEffect(() => {
        const adv = allUsers.find(u => u.id === selectedAdvisorId);

        if (adv && selectedAdvisorId !== lastLoadedId.current) {
            const nameParts = adv.name.split(' ');
            setEditForm({
                firstName: nameParts[0] || '',
                lastName: nameParts.slice(1).join(' ') || '',
                title: adv.title || (adv.role === UserRole.ADVISOR ? `${adv.category} Advisor` : adv.role),
                titleFontSize: 11,
                tagline: adv.bio?.substring(0, 80) || 'Leading the way in personalized financial solutions.',
                email: adv.email,
                phone: adv.phone || companySettings.phone,
                phone2: '(800) 555-0199',
                addressLine1: adv.address || companySettings.address,
                addressLine2: `${adv.city || companySettings.city}, ${adv.state || companySettings.state} ${companySettings.zip}`,
                city: adv.city || companySettings.city,
                state: adv.state || companySettings.state,
                zip: companySettings.zip,
                avatar: adv.avatar || '',
                website: 'www.newhollandfinancial.com',
                socialLinks: adv.socialLinks || [],
                confidentialityNotice: DEFAULT_LEGAL
            });
            lastLoadedId.current = selectedAdvisorId;
        }
    }, [selectedAdvisorId, allUsers, companySettings]);

    const handleReset = () => {
        lastLoadedId.current = null;
        const adv = allUsers.find(u => u.id === selectedAdvisorId);
        if (adv) {
            const currentId = selectedAdvisorId;
            setSelectedAdvisorId('');
            setTimeout(() => setSelectedAdvisorId(currentId), 10);
        }
    };

    const handleInputChange = (field: string, value: any) => {
        setEditForm(prev => ({ ...prev, [field]: value }));
    };

    const handleSocialChange = (index: number, field: keyof SocialLinkType, value: string) => {
        const updated = [...(editForm.socialLinks || [])];
        updated[index] = { ...updated[index], [field]: value };
        setEditForm(prev => ({ ...prev, socialLinks: updated }));
    };

    const handleAddSocial = () => {
        setEditForm(prev => ({
            ...prev,
            socialLinks: [...(prev.socialLinks || []), { platform: 'LinkedIn', url: '' }]
        }));
    };

    const handleRemoveSocial = (index: number) => {
        const updated = [...(editForm.socialLinks || [])];
        updated.splice(index, 1);
        setEditForm(prev => ({ ...prev, socialLinks: updated }));
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setTempImage(reader.result as string);
                setIsCropping(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveChanges = () => {
        if (selectedAdvisorId) {
            updateUser(selectedAdvisorId, {
                name: `${editForm.firstName} ${editForm.lastName}`,
                title: editForm.title,
                email: editForm.email,
                phone: editForm.phone,
                avatar: editForm.avatar,
                address: editForm.addressLine1,
                city: editForm.city,
                state: editForm.state,
                socialLinks: editForm.socialLinks
            });
            alert("User profile updated!");
        }
    };

    const getExportHtml = () => {
        const logoSrc = companySettings.logoUrl || logoFullColorBase64;
        const socialPillsHtml = (editForm.socialLinks || []).map(link => {
            let iconStr = '🔗 ';
            if (link.platform === 'Instagram') iconStr = '📷 ';
            else if (link.platform === 'TikTok') iconStr = '🎵 ';
            else if (link.platform === 'Facebook') iconStr = 'f ';
            return `
            <td style="padding-right: 8px;">
                <a href="${link.url || '#'}" target="_blank" style="display: inline-block; border: 1.5px solid #e2e8f0; border-radius: 20px; padding: 6px 16px; font-size: 12px; font-weight: 700; color: #334155; text-decoration: none; background-color: #ffffff;">
                    ${iconStr}${link.platform}
                </a>
            </td>
            `;
        }).join('');

        return `
<table cellpadding="0" cellspacing="0" border="0" style="font-family: -apple-system, BlinkMacSystemFont, Arial, sans-serif; max-width: 680px; width: 100%; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 24px; overflow: hidden; border-collapse: separate; border-spacing: 0;">
  <tr>
    <td width="32%" bgcolor="#0c0d12" valign="top" style="padding: 32px 24px; background-color: #0c0d12; vertical-align: top;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%" height="100%">
        <tr>
          <td valign="top">
            <div style="width: 64px; height: 64px; background-color: #000000; border-radius: 16px; border: 1px solid rgba(255,255,255,0.12); display: flex; align-items: center; justify-content: center; overflow: hidden;">
              <img src="${logoSrc}" width="38" height="38" style="display: block; object-fit: contain;" alt="Logo" />
            </div>
          </td>
        </tr>
        <tr>
          <td valign="bottom" style="padding-top: 100px;">
            <p style="font-size: 10px; font-weight: 800; color: #94a3b8; letter-spacing: 1.5px; margin: 0; text-transform: uppercase;">NEW HOLLAND</p>
            <p style="font-size: 10px; font-weight: 800; color: #64748b; letter-spacing: 1.5px; margin: 4px 0 0 0; text-transform: uppercase;">FINANCIAL GROUP</p>
          </td>
        </tr>
      </table>
    </td>

    <td width="68%" bgcolor="#ffffff" valign="top" style="padding: 32px 36px; background-color: #ffffff; vertical-align: top;">
      <h1 style="font-size: 26px; font-weight: 800; color: #0f172a; margin: 0 0 4px 0; letter-spacing: -0.5px;">
        ${editForm.firstName} ${editForm.lastName}
      </h1>
      <p style="font-size: ${editForm.titleFontSize || 11}px; font-weight: 800; color: #64748b; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1.5px;">
        ${editForm.title}
      </p>
      <p style="font-size: 13px; font-style: italic; color: #64748b; margin: 0 0 20px 0; line-height: 1.4;">
        ${editForm.tagline}
      </p>

      <table cellpadding="0" cellspacing="0" border="0" width="100%">
        ${editForm.phone ? `
        <tr>
          <td style="padding-bottom: 10px;">
            <table cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td width="30" height="30" bgcolor="#f1f5f9" align="center" style="border-radius: 10px; background-color: #f1f5f9;">
                  <img src="https://img.icons8.com/ios-filled/50/64748b/phone.png" width="14" height="14" style="display: block;" alt="Phone" />
                </td>
                <td style="padding-left: 12px; font-size: 13px; font-weight: 700; color: #1e293b;">
                  <span style="font-size: 10px; font-weight: 800; color: #94a3b8; letter-spacing: 1px; margin-right: 6px;">DIRECT</span>
                  <a href="tel:${(editForm.phone || '').replace(/[^0-9]/g, '')}" style="color: #1e293b; text-decoration: none;">${editForm.phone}</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        ` : ''}

        ${editForm.phone2 ? `
        <tr>
          <td style="padding-bottom: 10px;">
            <table cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td width="30" height="30" bgcolor="#f1f5f9" align="center" style="border-radius: 10px; background-color: #f1f5f9;">
                  <img src="https://img.icons8.com/ios-filled/50/64748b/phone.png" width="14" height="14" style="display: block;" alt="Phone" />
                </td>
                <td style="padding-left: 12px; font-size: 13px; font-weight: 700; color: #1e293b;">
                  <span style="font-size: 10px; font-weight: 800; color: #94a3b8; letter-spacing: 1px; margin-right: 6px;">OFFICE</span>
                  <a href="tel:${(editForm.phone2 || '').replace(/[^0-9]/g, '')}" style="color: #1e293b; text-decoration: none;">${editForm.phone2}</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        ` : ''}

        ${editForm.email ? `
        <tr>
          <td style="padding-bottom: 10px;">
            <table cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td width="30" height="30" bgcolor="#f1f5f9" align="center" style="border-radius: 10px; background-color: #f1f5f9;">
                  <img src="https://img.icons8.com/ios-filled/50/64748b/email.png" width="14" height="14" style="display: block;" alt="Email" />
                </td>
                <td style="padding-left: 12px; font-size: 13px; font-weight: 700; color: #1e293b;">
                  <a href="mailto:${editForm.email}" style="color: #1e293b; text-decoration: none;">${editForm.email}</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        ` : ''}

        ${editForm.website ? `
        <tr>
          <td style="padding-bottom: 10px;">
            <table cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td width="30" height="30" bgcolor="#f1f5f9" align="center" style="border-radius: 10px; background-color: #f1f5f9;">
                  <img src="https://img.icons8.com/ios-filled/50/64748b/domain.png" width="14" height="14" style="display: block;" alt="Website" />
                </td>
                <td style="padding-left: 12px; font-size: 13px; font-weight: 700; color: #1e293b;">
                  <a href="${(editForm.website || '').startsWith('http') ? editForm.website : 'https://' + editForm.website}" style="color: #1e293b; text-decoration: none;">${editForm.website}</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        ` : ''}

        ${(editForm.city || editForm.addressLine1) ? `
        <tr>
          <td style="padding-bottom: 18px;">
            <table cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td width="30" height="30" bgcolor="#f1f5f9" align="center" style="border-radius: 10px; background-color: #f1f5f9;">
                  <img src="https://img.icons8.com/ios-filled/50/64748b/marker.png" width="14" height="14" style="display: block;" alt="Location" />
                </td>
                <td style="padding-left: 12px; font-size: 13px; font-weight: 700; color: #1e293b;">
                  ${editForm.city ? `${editForm.city}, ${editForm.state}` : editForm.addressLine1}
                </td>
              </tr>
            </table>
          </td>
        </tr>
        ` : ''}
      </table>

      ${(editForm.socialLinks || []).length > 0 ? `
      <table cellpadding="0" cellspacing="0" border="0" style="margin-top: 10px;">
        <tr>
          ${socialPillsHtml}
        </tr>
      </table>
      ` : ''}
    </td>
  </tr>

  <tr>
    <td colSpan="2" bgcolor="#f8fafc" style="padding: 18px 30px; background-color: #f8fafc; border-top: 1px solid #f1f5f9;">
      <p style="font-size: 10px; color: #94a3b8; line-height: 1.5; margin: 0; font-weight: 500;">
        <strong style="color: #64748b;">CONFIDENTIALITY NOTICE:</strong> ${editForm.confidentialityNotice}
      </p>
    </td>
  </tr>
</table>
        `;
    };

    const handleCopyHtmlCode = () => {
        const fullHtml = getExportHtml();
        navigator.clipboard.writeText(fullHtml);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleCopyVisual = () => {
        const fullHtml = getExportHtml();
        navigator.clipboard.writeText(fullHtml);
        setVisualCopied(true);
        setTimeout(() => setVisualCopied(false), 2000);
    };

    const handleDownloadImage = useCallback(async () => {
        if (exportRef.current === null) return;

        setIsDownloadingImage(true);
        try {
            const dataUrl = await toPng(exportRef.current, {
                cacheBust: true,
                pixelRatio: 2,
                style: {
                    fontFamily: 'Inter, sans-serif'
                }
            });
            const link = document.createElement('a');
            link.download = `${editForm.firstName}_Signature.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error('Error generating image signature', err);
            alert("Image generation failed. Check your internet and try again.");
        } finally {
            setIsDownloadingImage(false);
        }
    }, [editForm.firstName]);

    const STYLES = {
        fontFamily: "'Inter', sans-serif",
        colors: {
            navy: '#0B2240',
            grey: '#64748B',
            lightGrey: '#94A3B8',
            blue: '#3B82F6',
            white: '#ffffff',
            btnGray: '#B7BDC5',
            logoBar: '#0B2240'
        }
    };

    // Official full-color logo version (amber/yellow)
    const logoFullColorBase64 = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3QgeD0iNSIgeT0iMTUiIHdpZHRoPSI5MCIgaGVpZ2h0PSI2MCIgcng9IjEyIiBmaWxsPSIjRjU5RTBCIiAvPjxyZWN0IHg9IjEwIiB5PSIzNSIgd2lkdGg9IjgwIiBoZWlnaHQ9IjU1IiByeD0iMTIiIGZpbGw9IiNGQ0QzNEQiIC8+PHJlY3QgeD0iNDIiIHk9IjUyIiB3aWR0aD0iMTYiIGhlaWdodD0iMjIiIHJ4PSI0IiBmaWxsPSIjQjQ1MzA5IiBmaWxsLW9wYWNpdHk9IjAuMjUiIC8+PC9zdmc+";

    const getSocialIconUrl = (platform: string) => {
        const color = "0B2240";
        switch (platform) {
            case 'LinkedIn': return `https://img.icons8.com/ios-filled/50/${color}/linkedin.png`;
            case 'Facebook': return `https://img.icons8.com/ios-filled/50/${color}/facebook-new.png`;
            case 'Twitter': case 'X': return `https://img.icons8.com/ios-filled/50/${color}/twitter.png`;
            case 'Instagram': return `https://img.icons8.com/ios-filled/50/${color}/instagram-new.png`;
            case 'YouTube': return `https://img.icons8.com/ios-filled/50/${color}/youtube-play.png`;
            case 'TikTok': return `https://img.icons8.com/ios-filled/50/${color}/tiktok.png`;
            case 'Snapchat': return `https://img.icons8.com/ios-filled/50/${color}/snapchat.png`;
            default: return `https://img.icons8.com/ios-filled/50/${color}/domain.png`;
        }
    };

    const ICON_PHONE = "https://cdn-icons-png.flaticon.com/32/3059/3059502.png";
    const ICON_WEB = "https://cdn-icons-png.flaticon.com/32/2885/2885417.png";
    const ICON_MAP = "https://cdn-icons-png.flaticon.com/32/3082/3082383.png";

    return (
        <div className="space-y-8 relative">
            <Tab3DBanner
                cards={[
                    { title: "HTML Signature Builder", value: "NHFG Brand", subtitle: "Outlook & Gmail Compatible", emoji: "✉️", gradient: "cyan" },
                    { title: "FINRA & SEC Compliance", value: "Verified Footer", subtitle: "Mandatory Regulatory Notice", emoji: "✒️", gradient: "yellow" },
                    { title: "1-Click HTML Generator", value: "Active Template", subtitle: "Responsive Email Format", emoji: "📱", gradient: "pink" }
                ]}
            />
            {isCropping && (
                <ImageCropper
                    imageUrl={tempImage}
                    onSave={(cropped) => {
                        setEditForm(prev => ({ ...prev, avatar: cropped }));
                        setIsCropping(false);
                    }}
                    onCancel={() => setIsCropping(false)}
                />
            )}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-black text-[#0B2240] tracking-tight uppercase leading-none">Terminal Console</h1>
                </div>

                <div className="flex items-center gap-3 bg-white p-2 rounded-full border border-slate-200 shadow-sm">
                    <span className="pl-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Advisor:</span>
                    <select
                        className="bg-slate-50 border-none rounded-full px-4 py-2 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-[#0A62A7] outline-none cursor-pointer"
                        value={selectedAdvisorId}
                        onChange={(e) => setSelectedAdvisorId(e.target.value)}
                    >
                        {eligibleUsers.map(u => (
                            <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                {/* EDITOR */}
                <div className="xl:col-span-4 space-y-6">
                    <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col h-[750px]">
                        <div className="flex overflow-x-auto border-b border-slate-100 p-2 bg-slate-50/50 no-scrollbar">
                            {['Personal', 'Contact', 'Social', 'Legal'].map((tab: any) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-6 py-4 text-xs font-black uppercase tracking-widest rounded-[1.5rem] whitespace-nowrap transition-all ${activeTab === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        <div className="p-8 flex-grow overflow-y-auto no-scrollbar space-y-6">
                            {activeTab === 'Personal' && (
                                <>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">First Name</label>
                                        <input className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none" value={editForm.firstName} onChange={e => handleInputChange('firstName', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Last Name</label>
                                        <input className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none" value={editForm.lastName} onChange={e => handleInputChange('lastName', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Professional Title</label>
                                        <input className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none" value={editForm.title} onChange={e => handleInputChange('title', e.target.value)} />
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-center mb-2 ml-1">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Title Font Size</label>
                                            <span className="text-[10px] font-bold text-slate-500">{editForm.titleFontSize}px</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="8"
                                            max="24"
                                            step="1"
                                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                            value={editForm.titleFontSize}
                                            onChange={(e) => handleInputChange('titleFontSize', parseInt(e.target.value))}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Microsite Tagline</label>
                                        <textarea className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 outline-none h-24 resize-none" value={editForm.tagline} onChange={e => handleInputChange('tagline', e.target.value)} />
                                    </div>
                                    <div className="pt-4 border-t border-slate-100">
                                        <div className="flex justify-between items-center mb-3 ml-1">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Identity Photo</label>
                                            <span className="text-[9px] font-bold text-blue-500 uppercase tracking-wider">Crop on upload</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-200 border-2 border-white shadow-md relative">
                                                {editForm.avatar ? (
                                                    <img src={editForm.avatar} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-400"><X size={20} /></div>
                                                )}
                                            </div>
                                            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
                                            <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 text-[10px] font-black bg-blue-50 text-blue-600 px-4 py-2 rounded-lg uppercase tracking-widest hover:bg-blue-100 transition-colors">
                                                <Maximize2 size={12} /> Update & Crop
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                            {activeTab === 'Contact' && (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Direct Line</label>
                                            <input className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 outline-none" value={editForm.phone} onChange={e => handleInputChange('phone', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Office Line</label>
                                            <input className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 outline-none" value={editForm.phone2} onChange={e => handleInputChange('phone2', e.target.value)} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Email</label>
                                        <input className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 outline-none" value={editForm.email} onChange={e => handleInputChange('email', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Website</label>
                                        <input className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 outline-none" value={editForm.website} onChange={e => handleInputChange('website', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Street Address</label>
                                        <input className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 outline-none" value={editForm.addressLine1} onChange={e => handleInputChange('addressLine1', e.target.value)} placeholder="e.g. 123 Main St" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">City</label>
                                            <input className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 outline-none" value={editForm.city} onChange={e => handleInputChange('city', e.target.value)} placeholder="e.g. New York" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">State</label>
                                            <input className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 outline-none" value={editForm.state} onChange={e => handleInputChange('state', e.target.value)} placeholder="e.g. NY" />
                                        </div>
                                    </div>
                                </>
                            )}
                            {activeTab === 'Social' && (
                                <div className="space-y-4">
                                    <button onClick={handleAddSocial} className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] hover:border-blue-300 hover:text-blue-600 transition-colors flex items-center justify-center gap-2">
                                        <Plus size={14} /> Add Profile Link
                                    </button>
                                    <div className="space-y-3">
                                        {(editForm.socialLinks || []).map((link, idx) => (
                                            <div key={idx} className="flex gap-2 items-center bg-slate-50 p-2 rounded-xl border border-slate-100">
                                                <select value={link.platform} onChange={e => handleSocialChange(idx, 'platform', e.target.value as any)} className="bg-white border border-slate-200 rounded-lg px-2 py-2 text-[10px] font-black uppercase text-slate-700">
                                                    {['LinkedIn', 'Facebook', 'Twitter', 'Instagram', 'TikTok', 'YouTube', 'Snapchat', 'X'].map(k => <option key={k} value={k}>{k}</option>)}
                                                </select>
                                                <input value={link.url} onChange={e => handleSocialChange(idx, 'url', e.target.value)} className="bg-transparent border-none text-xs flex-1 outline-none font-medium text-slate-600" placeholder="URL..." />
                                                <button onClick={() => handleRemoveSocial(idx)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {activeTab === 'Legal' && (
                                <div className="space-y-6">
                                    <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100">
                                        <h3 className="text-xs font-black text-blue-700 uppercase tracking-widest mb-2 flex items-center gap-2">
                                            <ShieldCheck size={14} /> Compliance Standards
                                        </h3>
                                        <p className="text-[10px] text-blue-600 font-medium leading-relaxed">
                                            All advisor communications must include the mandatory confidentiality notice to comply with regional financial regulations and HIPAA privacy standards.
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Confidentiality Notice</label>
                                        <textarea
                                            className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-4 text-xs font-medium text-slate-600 outline-none h-48 resize-none shadow-inner"
                                            value={editForm.confidentialityNotice}
                                            onChange={e => handleInputChange('confidentialityNotice', e.target.value)}
                                        />
                                    </div>
                                    <button
                                        onClick={() => handleInputChange('confidentialityNotice', DEFAULT_LEGAL)}
                                        className="text-[9px] font-black text-blue-500 uppercase tracking-widest hover:text-blue-700 transition-colors"
                                    >
                                        Revert to Group Standard
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="p-6 bg-slate-50 border-t border-slate-200 flex gap-4">
                            <button onClick={handleReset} className="p-4 bg-white border border-slate-200 text-slate-400 rounded-2xl hover:bg-slate-100 shadow-sm" title="Revert Changes"><RotateCcw size={18} /></button>
                            <button onClick={handleSaveChanges} className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-[#0B2240] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-900 transition-colors shadow-lg">
                                COMMIT UPDATES
                            </button>
                        </div>
                    </div>
                </div>

                {/* PREVIEW CONTAINER - MICHEL SMITH STYLE */}
                <div className="xl:col-span-8 flex flex-col space-y-12 overflow-x-auto">
                    {/* MAIN BANNER PREVIEW */}
                    <div className="bg-white p-12 rounded-[4rem] shadow-2xl border border-slate-200 flex flex-col items-center justify-center flex-grow min-w-[800px]">

                        <div className="w-full max-w-[850px] bg-gradient-to-br from-blue-50 to-yellow-50 p-12 rounded-[4rem] shadow-inner flex flex-col items-center justify-center">
                            {/* THE SIGNATURE CARD - EXPORT TARGET */}
                            <div ref={exportRef} className="shadow-2xl relative overflow-hidden text-left" style={{ width: '680px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '24px', display: 'flex', flexDirection: 'column' }}>

                                {/* TOP SECTION: LEFT DARK PANEL + RIGHT DETAILS */}
                                <div style={{ display: 'flex', width: '100%', minHeight: '310px' }}>
                                    {/* LEFT DARK SIDEBAR */}
                                    <div style={{ width: '32%', backgroundColor: '#0c0d12', padding: '32px 24px', display: 'flex', flexDirection: 'column', justifyBetween: 'space-between', borderTopLeftRadius: '24px' }}>
                                        {/* Logo Badge */}
                                        <div style={{ width: '64px', height: '64px', backgroundColor: '#000000', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                            <img
                                                src={companySettings.logoUrl || logoFullColorBase64}
                                                style={{ width: '36px', height: '36px', objectFit: 'contain' }}
                                                alt="Logo"
                                            />
                                        </div>

                                        {/* Bottom Branding */}
                                        <div style={{ marginTop: 'auto', paddingTop: '60px' }}>
                                            <p style={{ fontSize: '10px', fontWeight: '800', color: '#94a3b8', letterSpacing: '1.5px', margin: 0, textTransform: 'uppercase' }}>NEW HOLLAND</p>
                                            <p style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', letterSpacing: '1.5px', margin: '4px 0 0 0', textTransform: 'uppercase' }}>FINANCIAL GROUP</p>
                                        </div>
                                    </div>

                                    {/* RIGHT DETAILS AREA */}
                                    <div style={{ width: '68%', backgroundColor: '#ffffff', padding: '32px 36px', display: 'flex', flexDirection: 'column' }}>
                                        <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0', letterSpacing: '-0.5px' }}>
                                            {editForm.firstName} {editForm.lastName}
                                        </h1>
                                        <p style={{ fontSize: `${editForm.titleFontSize || 11}px`, fontWeight: '800', color: '#64748b', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                                            {editForm.title}
                                        </p>
                                        <p style={{ fontSize: '13px', fontStyle: 'italic', color: '#64748b', margin: '0 0 20px 0', lineHeight: '1.4' }}>
                                            {editForm.tagline}
                                        </p>

                                        {/* CONTACT DETAILS STACK */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                                            {editForm.phone && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{ width: '30px', height: '30px', borderRadius: '10px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                                                        <Phone size={14} />
                                                    </div>
                                                    <div>
                                                        <span style={{ fontSize: '10px', fontWeight: '800', color: '#94a3b8', letterSpacing: '1px', marginRight: '6px' }}>DIRECT</span>
                                                        <a href={`tel:${(editForm.phone || '').replace(/[^0-9]/g, '')}`} style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', textDecoration: 'none' }}>
                                                            {editForm.phone}
                                                        </a>
                                                    </div>
                                                </div>
                                            )}

                                            {editForm.phone2 && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{ width: '30px', height: '30px', borderRadius: '10px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                                                        <Phone size={14} />
                                                    </div>
                                                    <div>
                                                        <span style={{ fontSize: '10px', fontWeight: '800', color: '#94a3b8', letterSpacing: '1px', marginRight: '6px' }}>OFFICE</span>
                                                        <a href={`tel:${(editForm.phone2 || '').replace(/[^0-9]/g, '')}`} style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', textDecoration: 'none' }}>
                                                            {editForm.phone2}
                                                        </a>
                                                    </div>
                                                </div>
                                            )}

                                            {editForm.email && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{ width: '30px', height: '30px', borderRadius: '10px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                                                        <Mail size={14} />
                                                    </div>
                                                    <a href={`mailto:${editForm.email}`} style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', textDecoration: 'none' }}>
                                                        {editForm.email}
                                                    </a>
                                                </div>
                                            )}

                                            {editForm.website && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{ width: '30px', height: '30px', borderRadius: '10px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                                                        <Globe size={14} />
                                                    </div>
                                                    <a href={(editForm.website || '').startsWith('http') ? editForm.website : `https://${editForm.website}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', textDecoration: 'none' }}>
                                                        {editForm.website}
                                                    </a>
                                                </div>
                                            )}

                                            {(editForm.city || editForm.addressLine1) && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{ width: '30px', height: '30px', borderRadius: '10px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                                                        <MapPin size={14} />
                                                    </div>
                                                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>
                                                        {editForm.city ? `${editForm.city}, ${editForm.state}` : editForm.addressLine1}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* SOCIAL PILLS */}
                                        {(editForm.socialLinks || []).length > 0 && (
                                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: 'auto' }}>
                                                {(editForm.socialLinks || []).map((link, idx) => (
                                                    <a
                                                        key={idx}
                                                        href={link.url || '#'}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{
                                                            border: '1.5px solid #e2e8f0',
                                                            borderRadius: '20px',
                                                            padding: '5px 14px',
                                                            fontSize: '12px',
                                                            fontWeight: '700',
                                                            color: '#334155',
                                                            textDecoration: 'none',
                                                            backgroundColor: '#ffffff',
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '6px'
                                                        }}
                                                    >
                                                        {link.platform === 'Instagram' ? '📷' : link.platform === 'TikTok' ? '🎵' : link.platform === 'Facebook' ? 'f' : '🔗'} {link.platform}
                                                    </a>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* BOTTOM FULL-WIDTH CONFIDENTIALITY FOOTER */}
                                <div style={{ padding: '16px 28px', backgroundColor: '#f8fafc', borderTop: '1px solid #f1f5f9' }}>
                                    <p style={{ fontSize: '10px', color: '#94a3b8', lineHeight: '1.5', margin: 0, fontWeight: '500' }}>
                                        <strong style={{ color: '#64748b' }}>CONFIDENTIALITY NOTICE:</strong> {editForm.confidentialityNotice}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4 mt-12 w-full max-w-[850px] items-center justify-center">
                            <button
                                onClick={handleDownloadImage}
                                disabled={isDownloadingImage}
                                className="px-10 py-5 bg-[#B7BDC5] text-white font-black rounded-full shadow-lg transition-all flex items-center justify-center gap-3 uppercase text-[10px] tracking-widest active:scale-95 disabled:opacity-70"
                            >
                                {isDownloadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileImage className="h-4 w-4" />}
                                {isDownloadingImage ? 'Generating...' : 'DOWNLOAD PNG'}
                            </button>
                            <button
                                onClick={handleCopyVisual}
                                className="px-10 py-5 bg-[#0B2240] text-white font-black rounded-full shadow-lg transition-all flex items-center justify-center gap-3 uppercase text-[10px] tracking-widest hover:bg-blue-900 border border-transparent"
                            >
                                {visualCopied ? <Check className="h-4 w-4 text-green-300" /> : <Ghost className="h-4 w-4 text-blue-300" />}
                                {visualCopied ? 'COPIED TO LARK' : 'COPY VISUAL (FOR LARK)'}
                            </button>
                            <button
                                onClick={handleCopyHtmlCode}
                                className="px-10 py-5 bg-white text-[#64748B] font-black rounded-full shadow-lg border border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center gap-3 uppercase text-[10px] tracking-widest"
                            >
                                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                {copied ? 'COPIED HTML' : 'COPY HTML CODE'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};