const fs = require('fs');
const path = './backend/server.cjs';
let content = fs.readFileSync(path, 'utf8');

const crypto = require('crypto');

// 1. Add column invite_token to users if it doesn't exist
const dbMigrations = `
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS invite_token VARCHAR(255)').catch(() => {});
`;
content = content.replace("// Analytics Tables", dbMigrations + "\n    // Analytics Tables");

// 2. Add endpoints
const inviteEndpoints = `
// --- ADVISOR INVITE & ONBOARDING ---
app.post('/api/admin/invite-user', authenticateToken, async (req, res) => {
  if (req.user.role !== 'Administrator') return res.status(403).json({ error: 'Admin only' });
  const { name, email, role, category } = req.body;
  
  if (!email || !name) return res.status(400).json({ error: 'Name and email required' });
  
  try {
    const inviteToken = require('crypto').randomBytes(32).toString('hex');
    const query = \`
      INSERT INTO users (name, email, role, category, status, invite_token, onboarding_completed)
      VALUES ($1, $2, $3, $4, 'pending_activation', $5, false)
      ON CONFLICT (email) DO UPDATE 
      SET invite_token = EXCLUDED.invite_token, status = 'pending_activation'
      RETURNING *
    \`;
    const { rows } = await pool.query(query, [name, email, role || 'Advisor', category || 'Insurance & General', inviteToken]);
    
    // Send Invite Email
    const origin = req.headers.origin || 'http://localhost:5173';
    const inviteLink = \`\${origin}/onboarding/setup?token=\${inviteToken}\`;
    const html = \`
      <div style="font-family: Arial, sans-serif; text-align: center; max-width: 600px; margin: 0 auto; padding: 40px; background-color: #f8fafc;">
        <h1 style="color: #0B2240;">Welcome to New Holland Financial Group</h1>
        <p style="color: #475569; font-size: 16px;">Hello \${name},</p>
        <p style="color: #475569; font-size: 16px;">An administrator has set up your advisor account. Click the button below to set your password, complete your profile, and accept our terms.</p>
        <a href="\${inviteLink}" style="display: inline-block; background-color: #0A62A7; color: #ffffff; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 8px; margin: 20px 0;">Setup My Account</a>
      </div>
    \`;
    
    await sendEmail({
      to: email,
      subject: 'Welcome to New Holland Financial Group - Setup Your Account',
      html
    });
    
    res.json({ success: true, message: 'Invite sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to invite user' });
  }
});

app.post('/api/onboarding/setup-account', async (req, res) => {
  const { token, password, termsAgreed } = req.body;
  if (!token || !password || !termsAgreed) return res.status(400).json({ error: 'Missing fields' });
  
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE invite_token = $1', [token]);
    if (rows.length === 0) return res.status(400).json({ error: 'Invalid or expired token' });
    
    const user = rows[0];
    const bcrypt = require('bcryptjs');
    const passwordHash = await bcrypt.hash(password, 10);
    
    await pool.query(
      "UPDATE users SET password_hash = $1, invite_token = NULL, status = 'active', onboarding_completed = true WHERE id = $2",
      [passwordHash, user.id]
    );
    
    res.json({ success: true, message: 'Account setup complete' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to complete setup' });
  }
});
`;

if(!content.includes('/api/admin/invite-user')) {
    content = content.replace("// --- SERVE STATIC FRONTEND", inviteEndpoints + "\n// --- SERVE STATIC FRONTEND");
    fs.writeFileSync(path, content);
}
