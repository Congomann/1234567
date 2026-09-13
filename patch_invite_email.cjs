const fs = require('fs');
const path = './backend/server.cjs';
let content = fs.readFileSync(path, 'utf8');

const oldCode = `    await sendEmail({
      to: email,
      subject: 'Welcome to New Holland Financial Group - Setup Your Account',
      html
    });
    
    res.json({ success: true, message: 'Invite sent successfully', user: rows[0] });`;

const newCode = `    try {
      await sendEmail({
        to: email,
        subject: 'Welcome to New Holland Financial Group - Setup Your Account',
        html
      });
      res.json({ success: true, message: 'Invite sent successfully', user: rows[0] });
    } catch (emailErr) {
      console.error("[Email Error]", emailErr);
      res.json({ success: true, message: 'User created, but failed to send email. Check SMTP settings.', user: rows[0], emailError: emailErr.message });
    }`;

content = content.replace(oldCode, newCode);
fs.writeFileSync(path, content);
