const fs = require('fs');
let file = fs.readFileSync('backend/server.cjs', 'utf8');

// We will add a utility to generate Jitsi JWTs
const jwtLogic = `
const jwt = require('jsonwebtoken');

function generateJitsiToken(roomName, userName, userEmail, isModerator) {
  const appId = process.env.JITSI_APP_ID;
  const appSecret = process.env.JITSI_APP_SECRET;
  
  if (!appId || !appSecret) return null;

  const payload = {
    aud: 'jitsi',
    iss: appId,
    sub: process.env.JITSI_DOMAIN || 'meet.jit.si',
    room: roomName,
    context: {
      user: {
        name: userName,
        email: userEmail,
        affiliation: isModerator ? 'owner' : 'member'
      },
      features: {
        livestreaming: isModerator,
        recording: isModerator
      }
    }
  };

  return jwt.sign(payload, appSecret, { algorithm: 'HS256', expiresIn: '2h' });
}
`;

// Insert the jwtLogic near the top, after requires
file = file.replace(/const crypto = require\('crypto'\);/, "const crypto = require('crypto');\n" + jwtLogic);

// Update /api/public/book to use JITSI_DOMAIN
file = file.replace(
  /const meetingLink = \`https:\/\/meet\.jit\.si\/NHFG-\$\{eventId\}\`;/,
  "const jitsiDomain = process.env.JITSI_DOMAIN || 'meet.jit.si';\n    const meetingLink = `https://${jitsiDomain}/NHFG-${eventId}`;"
);

// We should also expose an endpoint for authenticated CRM users to get a JWT for their rooms
const jitsiEndpoint = `
app.post('/api/jitsi/token', authenticateToken, async (req, res) => {
  try {
    const { roomName } = req.body;
    const userRes = await pool.query('SELECT name, email FROM users WHERE id = $1', [req.user.id]);
    const user = userRes.rows[0];
    
    if (!user) return res.status(404).json({ error: 'User not found' });

    const token = generateJitsiToken(roomName, user.name, user.email, true);
    
    res.json({ token, domain: process.env.JITSI_DOMAIN || 'meet.jit.si' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
`;

// Insert the endpoint before app.listen
file = file.replace(/app\.listen\(/, jitsiEndpoint + "\napp.listen(");

fs.writeFileSync('backend/server.cjs', file);
console.log('Updated backend for self-hosted Jitsi JWT auth');
