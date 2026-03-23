export default async function(req, res) {
  try {
    const mod = await import('../backend/server.cjs');
    const app = mod.default || mod;
    return app(req, res);
  } catch (err) {
    console.error("Boot error:", err);
    return res.status(500).json({ 
      error: err.message, 
      stack: String(err.stack),
      type: 'BOOT_CRASH'
    });
  }
}
