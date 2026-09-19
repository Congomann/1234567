const fs = require('fs');
let content = fs.readFileSync('backend/server.cjs', 'utf8');

const oldBlock = `          const contractingUrl = urls[0]; // Take the first URL found`;

const newBlock = `          // Filter out garbage signature links
          let realUrls = urls.filter(u => 
            !u.toLowerCase().includes('newhollandfinancial.com') && 
            !u.toLowerCase().includes('instagram.com') && 
            !u.toLowerCase().includes('tiktok.com') && 
            !u.toLowerCase().includes('facebook.com') && 
            !u.toLowerCase().includes('linkedin.com') &&
            !u.toLowerCase().includes('w3.org')
          );
          
          if (realUrls.length === 0) continue; // Skip if no real links found
          const contractingUrl = realUrls[0];`;

content = content.replace(oldBlock, newBlock);
fs.writeFileSync('backend/server.cjs', content);
console.log("Patched server.cjs to filter out signature links");
