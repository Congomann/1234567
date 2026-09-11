const fs = require('fs');
const file = '/Users/newholland/1234567/pages/public/BookingPage.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace Step 1 wrapper
content = content.replace('{step === 1 && (\n              <div className="space-y-8 animate-in fade-in duration-300">', 
'<AnimatePresence mode="wait">\n            {step === 1 && (\n              <motion.div key="step1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-8">');

content = content.replace('                  </button>\n                </div>\n              </div>\n            )}\n\n            {/* STEP 2 */}',
'                  </button>\n                </div>\n              </motion.div>\n            )}\n\n            {/* STEP 2 */}');

// Replace Step 2 wrapper
content = content.replace('{step === 2 && (\n              <div className="space-y-6 animate-in fade-in duration-300 flex flex-col h-full">',
'{step === 2 && (\n              <motion.div key="step2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6 flex flex-col h-full">');

content = content.replace('                  </button>\n                </div>\n              </div>\n            )}\n\n            {/* STEP 3 */}',
'                  </button>\n                </div>\n              </motion.div>\n            )}\n\n            {/* STEP 3 */}');

// Replace Step 3 wrapper
content = content.replace('{step === 3 && (\n              <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-300 flex flex-col h-full justify-between">',
'{step === 3 && (\n              <motion.form key="step3" onSubmit={handleSubmit} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6 flex flex-col h-full justify-between">');

content = content.replace('                  </button>\n                </div>\n              </form>\n            )}\n\n            {/* STEP 4 */}',
'                  </button>\n                </div>\n              </motion.form>\n            )}\n\n            {/* STEP 4 */}');

// Replace Step 4 wrapper
content = content.replace('{step === 4 && (\n              <div className="text-center py-12 space-y-6 animate-in zoom-in-95 duration-500 my-auto">',
'{step === 4 && (\n              <motion.div key="step4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="text-center py-12 space-y-6 my-auto">');

content = content.replace('                  </Link>\n                </div>\n              </div>\n            )}',
'                  </Link>\n                </div>\n              </motion.div>\n            )}\n            </AnimatePresence>');

fs.writeFileSync(file, content);
