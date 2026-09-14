const fs = require('fs');
let content = fs.readFileSync('backend/server.cjs', 'utf8');

const target = `    await sendEmail({
      to: email,
      subject: 'Welcome to New Holland Financial Group - Setup Your Account',
      html
    });
    
    res.json({ success: true, message: 'Invite sent' });`;

const replacement = `    try {
      await sendEmail({
        to: email,
        subject: 'Welcome to New Holland Financial Group - Setup Your Account',
        html
      });
      res.json({ success: true, message: 'Invite sent', user: rows[0] });
    } catch (emailErr) {
      console.warn('[Email Warning] Failed to send invite email:', emailErr.message);
      res.json({ success: true, message: 'User added, but email failed to send', emailError: emailErr.message, user: rows[0] });
    }`;

content = content.replace(target, replacement);
fs.writeFileSync('backend/server.cjs', content);
console.log('Patched invite-user in server.cjs');
