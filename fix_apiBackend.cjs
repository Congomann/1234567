const fs = require('fs');
let file = fs.readFileSync('services/apiBackend.ts', 'utf8');

file = file.replace(
    /errorMessage = errorData\.message \|\| errorData\.error \|\| errorData\.detail \|\| errorMessage;/g,
    `errorMessage = errorData.message || (typeof errorData.error === 'string' ? errorData.error : (errorData.error ? JSON.stringify(errorData.error) : null)) || (typeof errorData.detail === 'string' ? errorData.detail : (errorData.detail ? JSON.stringify(errorData.detail) : null)) || errorMessage;`
);

fs.writeFileSync('services/apiBackend.ts', file);
console.log('Fixed apiBackend.ts');
