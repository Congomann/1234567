const fs = require('fs');
let content = fs.readFileSync('components/Navbar.tsx', 'utf8');

// The banner wrapper
const oldWrapper = 'className="fixed top-0 left-0 right-0 z-[110] bg-black text-white h-10 flex items-center overflow-hidden border-b border-white/10"';
const newWrapper = 'className="fixed top-0 left-0 right-0 z-[110] bg-black text-white min-h-[40px] pt-[env(safe-area-inset-top)] flex items-center overflow-hidden border-b border-white/10 shadow-md"';
content = content.replace(oldWrapper, newWrapper);

// The marquee container
const oldMarquee = 'className="flex whitespace-nowrap animate-marquee px-4"';
const newMarquee = 'className="flex whitespace-nowrap animate-marquee px-4 w-max shrink-0 items-center"';
content = content.replace(oldMarquee, newMarquee);

// The nav push down should also account for safe area if possible, but let's just make it robust
const oldNav = 'className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 flex justify-center py-6 px-4 md:px-12 pointer-events-none ${companySettings?.maintenanceModeEnabled ? \'mt-10\' : \'\'}`}';
const newNav = 'className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 flex justify-center py-6 px-4 md:px-12 pointer-events-none pt-[calc(env(safe-area-inset-top)+1.5rem)] ${companySettings?.maintenanceModeEnabled ? \'mt-[calc(env(safe-area-inset-top)+40px)]\' : \'\'}`}';
content = content.replace(oldNav, newNav);

fs.writeFileSync('components/Navbar.tsx', content);
console.log('Patched maintenance banner for mobile safari / webviews');
