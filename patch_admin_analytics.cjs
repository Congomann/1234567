const fs = require('fs');
const path = './pages/admin/AdminAnalytics.tsx';
let content = fs.readFileSync(path, 'utf8');

const mappingTarget = `device_type: 'Unknown',`;
const mappingStr = `device_type: (s.deviceType || 'desktop').toLowerCase(),
                browser: s.browser || 'Unknown Browser',
                os: s.os || 'Unknown OS',`;
                
if(!content.includes('s.deviceType')) {
    content = content.replace(mappingTarget, mappingStr);
}

// Update the rendering row in AdminAnalytics
const renderTarget = `{visitor.device_type === 'desktop' ? <Monitor size={16} /> :
                                                            visitor.device_type === 'mobile' ? <Smartphone size={16} /> : <Tablet size={16} />}`;
const renderStr = `{visitor.device_type === 'desktop' ? <Monitor size={16} className="text-slate-500" /> :
                                                            visitor.device_type === 'mobile' ? <Smartphone size={16} className="text-slate-500" /> : <Tablet size={16} className="text-slate-500" />}`;
content = content.replace(renderTarget, renderStr);

fs.writeFileSync(path, content);
