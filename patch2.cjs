const fs = require('fs');
const file = '/Users/newholland/1234567/pages/public/BookingPage.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace('                </div>\n              </div>\n            )}', '                </div>\n              </motion.div>\n            )}\n            </AnimatePresence>');
content = content.replace('                  </button>\n                </div>\n              </div>\n            )}', '                  </button>\n                </div>\n              </motion.div>\n            )}');
content = content.replace('                  </button>\n                </div>\n              </div>\n            )}\n\n            {/* STEP 3 */}', '                  </button>\n                </div>\n              </motion.div>\n            )}\n\n            {/* STEP 3 */}');

fs.writeFileSync(file, content);
