const fs = require('fs');
const file = '/Users/newholland/1234567/pages/public/BookingPage.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace {step === 1 && ( with <AnimatePresence mode="wait"> {step === 1 && (
content = content.replace('{step === 1 && (', '<AnimatePresence mode="wait">\n            {step === 1 && (');

// Close AnimatePresence
content = content.replace('          </div>\n        </div>\n\n        {/* BOTTOM NOTICES */}', '          </AnimatePresence>\n          </div>\n        </div>\n\n        {/* BOTTOM NOTICES */}');

// Change step 1 to motion.div
content = content.replace('<div className="space-y-8 animate-in fade-in duration-300">', '<motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="space-y-8">');

// Change step 2 to motion.div
content = content.replace('<div className="space-y-6 animate-in fade-in duration-300 flex flex-col h-full">', '<motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="space-y-6 flex flex-col h-full">');

// Change step 3 to motion.form
content = content.replace('<form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-300 flex flex-col h-full justify-between">', '<motion.form key="step3" onSubmit={handleSubmit} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="space-y-6 flex flex-col h-full justify-between">');
content = content.replace('</form>\n            )}', '</motion.form>\n            )}');

// Change step 4 to motion.div
content = content.replace('<div className="text-center py-12 space-y-6 animate-in zoom-in-95 duration-500 my-auto">', '<motion.div key="step4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} className="text-center py-12 space-y-6 my-auto">');

fs.writeFileSync(file, content);
