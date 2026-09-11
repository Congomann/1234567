import React, { useState, useMemo } from "react";
import { useData } from "../../context/DataContext";
import {
  FileText,
  Video,
  ExternalLink,
  Download,
  Search,
  Youtube,
  Image as ImageIcon,
  BookOpen,
  Heart,
  Share2,
  MessageSquare,
  ThumbsDown,
  X,
  Send,
  PlayCircle,
  Minimize2,
  AlertCircle,
} from "lucide-react";
import { Resource } from "../../types";
import { jsPDF } from "jspdf";
import { PDFBrandingService } from "../../services/pdfBrandingService";

export const AdvisorResources: React.FC = () => {
  const [toast, setToast] = React.useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const toastRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
      setToast({ msg, type });
      clearTimeout(toastRef.current);
      toastRef.current = setTimeout(() => setToast(null), 4000);
  };

  const {
    resources,
    likeResource,
    dislikeResource,
    shareResource,
    addResourceComment,
    user,
  } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(
    null,
  );
  const [commentInput, setCommentInput] = useState("");
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

  // Filter resources based on advisor's products sold and category
  const advisorResources = useMemo(() => {
    if (!user) return resources;
    const advisorTags = [
      user.category,
      ...(user.productsSold || [])
    ].map(t => t.toLowerCase());

    if (user.role === 'Administrator') return resources;

    return resources.filter((r) => {
      if (!r.tags || r.tags.length === 0) return true; // if resource has no tags, show it
      return r.tags.some(tag => advisorTags.some(at => tag.toLowerCase().includes(at) || at.includes(tag.toLowerCase())));
    });
  }, [resources, user]);

  const selectedResource =
    advisorResources.find((r) => r.id === selectedResourceId) || null;

  const filters = ["All", "PDF", "Video", "YouTube", "Article", "Blog"];

  const filteredResources = advisorResources.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.tags?.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = activeFilter === "All" 
      || r.type === activeFilter 
      || r.tags?.includes(activeFilter);
      
    return matchesSearch && matchesFilter;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case "PDF": return <FileText className="h-5 w-5 text-red-500" />;
      case "Video": return <Video className="h-5 w-5 text-purple-500" />;
      case "YouTube": return <Youtube className="h-5 w-5 text-red-600" />;
      case "Article":
      case "Link": return <ExternalLink className="h-5 w-5 text-blue-500" />;
      case "Blog": return <BookOpen className="h-5 w-5 text-green-500" />;
      case "Image": return <ImageIcon className="h-5 w-5 text-amber-500" />;
      default: return <ExternalLink className="h-5 w-5 text-slate-500" />;
    }
  };

  const handleShare = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    shareResource(id);
    navigator.clipboard.writeText(window.location.href);
    showToast("Link copied to clipboard!");
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedResource && commentInput.trim()) {
      addResourceComment(
        selectedResource.id,
        commentInput,
        user?.name || "Advisor",
      );
      setCommentInput("");
    }
  };

  const getYoutubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const toggleInlinePlay = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setPlayingVideoId(playingVideoId === id ? null : id);
  };

  const generateBrandedPDF = (resource: Resource) => {
    const doc = new jsPDF();
    PDFBrandingService.addHeader(doc, resource.title);
    doc.setFontSize(11);
    doc.setTextColor(51, 65, 85);
    doc.setFont("helvetica", "normal");
    const content = resource.content || resource.description || "No preview available.";
    const splitText = doc.splitTextToSize(content, 180);
    let cursorY = 60;
    const pageHeight = doc.internal.pageSize.getHeight();
    splitText.forEach((line: string) => {
      if (cursorY > pageHeight - 30) {
        doc.addPage();
        PDFBrandingService.addHeader(doc, resource.title);
        cursorY = 60;
      }
      doc.text(line, 14, cursorY);
      cursorY += 7;
    });
    PDFBrandingService.addFooter(doc);
    doc.save(`NHFG_${resource.title.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="w-full">
            {toast && (
              <div style={{ position: 'fixed', top: 20, right: 24, zIndex: 9999, background: toast.type === 'success' ? '#ecfdf5' : '#fff1f2', border: `1px solid ${toast.type === 'success' ? '#a7f3d0' : '#fecdd3'}`, color: toast.type === 'success' ? '#065f46' : '#9f1239', padding: '12px 18px', borderRadius: 12, fontSize: 13, fontWeight: 600, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
                  {toast.msg}
              </div>
            )}

      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Advisor Training & Resources</h1>
        <p className="text-sm text-slate-500 font-medium">
          Access specialized materials and guides tailored to your active product lines.
        </p>
      </div>

      <div className="mb-8 space-y-6">
        <div className="relative max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search training materials..."
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeFilter === f
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredResources.map((resource) => (
          <div
            key={resource.id}
            onClick={() => setSelectedResourceId(resource.id)}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all  flex flex-col group cursor-pointer overflow-hidden"
          >
            <div className="relative h-40 bg-slate-100 overflow-hidden">
              {playingVideoId === resource.id ? (
                <div className="w-full h-full relative bg-black" onClick={(e) => e.stopPropagation()}>
                  {resource.type === "YouTube" ? (
                    <iframe
                      width="100%" height="100%"
                      src={`https://www.youtube.com/embed/${getYoutubeId(resource.url)}?autoplay=1`}
                      title="YouTube" frameBorder="0" allowFullScreen
                    ></iframe>
                  ) : (
                    <video controls autoPlay className="w-full h-full object-contain" src={resource.url} />
                  )}
                  <button
                    onClick={(e) => toggleInlinePlay(e, resource.id)}
                    className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-red-600 z-20"
                  >
                    <Minimize2 className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  {resource.thumbnail ? (
                    <img src={resource.thumbnail} alt={resource.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform " />
                  ) : resource.type === "YouTube" ? (
                    <img src={`https://img.youtube.com/vi/${getYoutubeId(resource.url)}/hqdefault.jpg`} alt={resource.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform " />
                  ) : resource.type === "Video" ? (
                    <video className="w-full h-full object-cover" src={resource.url} muted onMouseOver={(e) => (e.target as HTMLVideoElement).play()} onMouseOut={(e) => { (e.target as HTMLVideoElement).pause(); (e.target as HTMLVideoElement).currentTime = 0; }} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-50">{getIcon(resource.type)}</div>
                  )}
                  {(resource.type === "YouTube" || resource.type === "Video") && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <button onClick={(e) => toggleInlinePlay(e, resource.id)} className="bg-white/90 text-red-600 p-2.5 rounded-full shadow-lg pointer-events-auto hover:scale-110 transition-transform">
                        <PlayCircle className="h-6 w-6 fill-red-600 text-white" />
                      </button>
                    </div>
                  )}
                  <div className="absolute top-3 left-3 pointer-events-none flex flex-col gap-2">
                    <span className="px-2 py-1 bg-white/90 backdrop-blur-md text-slate-800 rounded text-[10px] font-bold uppercase flex items-center gap-1.5 shadow-sm">
                      {getIcon(resource.type)} {resource.type}
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="p-4 flex flex-col flex-1">
              <h3 className="text-sm font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-2">{resource.title}</h3>
              <p className="text-slate-500 text-xs mb-4 line-clamp-2 flex-1">{resource.description}</p>
              <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-slate-400 text-[10px] font-bold">
                <span>{new Date(resource.dateAdded).toLocaleDateString()}</span>
                <div className="flex gap-3">
                  <span className="flex items-center gap-1 hover:text-red-500" onClick={(e) => { e.stopPropagation(); likeResource(resource.id); }}>
                    <Heart className={`h-3 w-3 ${resource.likes > 0 ? "fill-red-500 text-red-500" : ""}`} /> {resource.likes}
                  </span>
                  <span className="flex items-center gap-1 hover:text-blue-500">
                    <MessageSquare className="h-3 w-3" /> {resource.comments.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredResources.length === 0 && (
        <div className="text-center py-20 text-slate-400 bg-white rounded-2xl border border-slate-200">
          <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-sm font-medium">No training materials found for your active products.</p>
        </div>
      )}

      {selectedResource && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
          <div className="absolute inset-0" onClick={() => setSelectedResourceId(null)}></div>
          <div className="bg-white rounded-3xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden shadow-2xl relative z-10">
            <div className="p-4 md:p-6 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="p-2 bg-slate-100 rounded-lg">{getIcon(selectedResource.type)}</span>
                <h2 className="text-lg font-bold text-slate-900 truncate max-w-lg">{selectedResource.title}</h2>
              </div>
              <button onClick={() => setSelectedResourceId(null)} className="p-2 hover:bg-slate-100 rounded-full"><X className="h-5 w-5 text-slate-400" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 min-h-full">
                <div className="lg:col-span-2 p-6 border-r border-slate-100">
                  {selectedResource.type === "YouTube" && getYoutubeId(selectedResource.url) ? (
                    <div className="aspect-video w-full rounded-xl overflow-hidden bg-black mb-6">
                      <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${getYoutubeId(selectedResource.url)}?autoplay=1`} title="YouTube" frameBorder="0" allowFullScreen></iframe>
                    </div>
                  ) : selectedResource.type === "Video" ? (
                    <div className="aspect-video w-full rounded-xl overflow-hidden bg-black mb-6">
                      <video controls className="w-full h-full" poster={selectedResource.thumbnail}><source src={selectedResource.url} /></video>
                    </div>
                  ) : selectedResource.type === "Image" ? (
                    <div className="rounded-xl overflow-hidden mb-6"><img src={selectedResource.url} alt={selectedResource.title} className="w-full h-auto" /></div>
                  ) : null}

                  <div className="prose prose-sm max-w-none text-slate-600">
                    {selectedResource.content ? <div className="whitespace-pre-wrap">{selectedResource.content}</div> : <p>{selectedResource.description}</p>}
                  </div>

                  {["PDF", "Link", "Article"].includes(selectedResource.type) && (
                    <div className="mt-8 p-5 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap gap-4 items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-white rounded-lg shadow-sm">{selectedResource.type === "PDF" ? <FileText className="h-5 w-5 text-red-500" /> : <ExternalLink className="h-5 w-5 text-blue-500" />}</div>
                        <div><p className="text-sm font-bold text-slate-900">External Resource</p><p className="text-xs text-slate-500">Opens externally</p></div>
                      </div>
                      <div className="flex gap-3">
                        {(selectedResource.content || selectedResource.type === 'Blog' || selectedResource.type === 'Article') && (
                          <button onClick={() => generateBrandedPDF(selectedResource)} className="px-4 py-2 bg-white border border-blue-200 text-blue-600 text-xs font-bold rounded-lg hover:bg-blue-50">Download Branded PDF</button>
                        )}
                        <a href={selectedResource.url} target="_blank" rel="noreferrer" className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700">
                          {selectedResource.type === "PDF" ? "Original PDF" : "Visit Link"}
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-slate-50 p-6 flex flex-col h-full">
                  <div className="flex gap-3 mb-6 pb-4 border-b border-slate-200">
                    <button onClick={() => likeResource(selectedResource.id)} className="flex-1 flex items-center justify-center gap-2 py-2 bg-white rounded-lg border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-600"><Heart className={`h-4 w-4 ${selectedResource.likes > 0 ? "fill-red-500 text-red-500" : ""}`} /> {selectedResource.likes}</button>
                    <button onClick={() => dislikeResource(selectedResource.id)} className="flex-1 flex items-center justify-center gap-2 py-2 bg-white rounded-lg border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-600"><ThumbsDown className={`h-4 w-4 ${selectedResource.dislikes > 0 ? "fill-slate-500 text-slate-500" : ""}`} /> {selectedResource.dislikes}</button>
                    <button onClick={(e) => handleShare(selectedResource.id, e)} className="flex-1 flex items-center justify-center gap-2 py-2 bg-white rounded-lg border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-600"><Share2 className="h-4 w-4" /> Share</button>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mb-3">Comments ({selectedResource.comments.length})</h3>
                  <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
                    {selectedResource.comments.map(c => (
                      <div key={c.id} className="bg-white p-3 rounded-lg border border-slate-100">
                        <div className="flex justify-between items-start mb-1"><span className="font-bold text-[11px]">{c.user}</span><span className="text-[9px] text-slate-400">{new Date(c.date).toLocaleDateString()}</span></div>
                        <p className="text-xs text-slate-600">{c.text}</p>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleCommentSubmit} className="relative mt-auto">
                    <input type="text" placeholder="Add a comment..." className="w-full pl-3 pr-10 py-2.5 rounded-lg border border-slate-200 text-xs outline-none focus:border-blue-500" value={commentInput} onChange={e => setCommentInput(e.target.value)} />
                    <button type="submit" disabled={!commentInput.trim()} className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"><Send className="h-3 w-3" /></button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
