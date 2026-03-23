const app = require('../backend/server.cjs');

// Vercel handles the listening part for us, but our server.cjs
// has a server.listen() block at the bottom. 
// When required as a module, we just need to export the app.
module.exports = app;
