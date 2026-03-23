import app from '../backend/server.cjs';

// Vercel handles the listening part for us, but our server.cjs
// has a server.listen() block at the bottom. 
// When imported as a module, we just need to export default the app.
export default app;
