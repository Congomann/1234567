const fs = require('fs');
const file = '/Users/newholland/1234567/pages/admin/MarketingIntegrations.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add Meta icon if missing
if (!content.includes('Facebook')) {
    content = content.replace('Music,', 'Music, Facebook,');
}

// Add the object
const oldPlatforms = "        { id: 'tiktok', name: 'TikTok', icon: Music, color: 'text-white', desc: 'High-velocity form capture.' }";
const newPlatforms = "        { id: 'tiktok', name: 'TikTok', icon: Music, color: 'text-white', desc: 'High-velocity form capture.' },\n        { id: 'meta', name: 'Meta Ads', icon: Facebook, color: 'text-blue-500', desc: 'Facebook & Instagram lead ads.' }";

content = content.replace(oldPlatforms, newPlatforms);
fs.writeFileSync(file, content);
