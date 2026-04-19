const fs = require('fs');
let code = fs.readFileSync('services/apiBackend.ts', 'utf8');

// The issue was I replaced the closing brace previously. Let's find exactly where the error is.
// I will just read the file, fix the syntax by finding 'await DB.save('preferences', prefs);' 
// and ensuring it's followed by `    }\n}\n` and then the rest of the methods.

code = code.replace(/await DB\.save\('preferences', prefs\);\s*\/\/\s*---\s*TASKS\s*---/, 
    "await DB.save('preferences', prefs);\n    }\n}\n\n    // --- TASKS ---");

fs.writeFileSync('services/apiBackend.ts', code);
console.log("Fixed brace!");
