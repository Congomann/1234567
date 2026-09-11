const fs = require('fs');
const file = '/Users/newholland/1234567/components/calendar/GridMonth.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace motion.div with div
content = content.replace(/<motion\.div/g, '<div');
content = content.replace(/<\/motion\.div>/g, '</div>');
// Remove whileHover={{ scale: 0.98 }}
content = content.replace(/whileHover={{ scale: 0\.98 }}/g, 'className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold truncate shadow-sm transition-transform hover:scale-95 ${getEventBadgeStyle(event)}`}');
// Wait, className is already defined on the next line. Let's be careful.
