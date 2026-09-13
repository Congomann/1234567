const fs = require('fs');
const path = './pages/admin/AdminAnalytics.tsx';
let content = fs.readFileSync(path, 'utf8');

const target1 = `visitor.device_type === 'desktop' ? <Monitor size={16} className="text-slate-500" /> :
                                                            visitor.device_type === 'mobile' ? <Smartphone size={16} className="text-slate-500" /> : <Tablet size={16} className="text-slate-500" />`;
const target2 = `visitor.device_type === 'desktop' ? <Monitor size={16} /> :
                                                            visitor.device_type === 'mobile' ? <Smartphone size={16} /> : <Tablet size={16} />`;

const replacement = `visitor.device_type === 'desktop' ? <Monitor size={16} /> :
                                                            visitor.device_type === 'mobile' ? <Smartphone size={16} /> : <Tablet size={16} />`;
content = content.replace(target1, replacement);

const subtitleTarget = `<p className="text-[9px] text-slate-400 font-bold">{visitor.screen_resolution}</p>`;
const subtitleReplacement = `<p className="text-[9px] text-slate-400 font-bold">{visitor.metadata?.browser || 'Browser'} • {visitor.metadata?.os || 'OS'}</p>`;
content = content.replace(subtitleTarget, subtitleReplacement);

fs.writeFileSync(path, content);
