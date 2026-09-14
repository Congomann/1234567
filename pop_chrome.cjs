const fetch = require('node-fetch');
const { exec } = require('child_process');

(async () => {
  try {
    const loginRes = await fetch('http://localhost:3005/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'info@newhollandfinancial.com', password: 'NewHollandAdmin@2025' })
    });
    const loginData = await loginRes.json();
    const token = loginData.access_token; // <--- FIX HERE

    if (!token) {
      console.log('Login failed:', loginData);
      return;
    }

    const inviteRes = await fetch('http://localhost:3005/api/admin/invite-user', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name: 'Remy Trek', email: 'remytrek@gmail.com' })
    });
    
    const inviteData = await inviteRes.json();
    console.log('Invite API Response:', inviteData);

    if (inviteData.user && inviteData.user.invite_token) {
      const inviteUrl = `http://localhost:3006/onboarding/setup?token=${inviteData.user.invite_token}`;
      console.log('Opening URL:', inviteUrl);
      
      exec(`open -a "Google Chrome" "${inviteUrl}"`, (err) => {
        if (err) console.error('Failed to open Chrome:', err);
        else console.log('Successfully opened Chrome on user machine!');
      });
    }

  } catch (err) {
    console.error(err);
  }
})();
