const fetch = require('node-fetch');
const { exec } = require('child_process');

(async () => {
  try {
    const loginRes = await fetch('https://newhollandfinancial.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'info@newhollandfinancial.com', password: 'NewHollandAdmin@2025' })
    });
    const loginData = await loginRes.json();
    const token = loginData.access_token || loginData.token;

    if (!token) {
      console.log('Login failed on live:', loginData);
      return;
    }

    const inviteRes = await fetch('https://newhollandfinancial.com/api/admin/invite-user', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name: 'Remy Trek', email: 'remytrek@gmail.com' })
    });
    
    const inviteData = await inviteRes.json();
    console.log('Live Invite API Response:', inviteData);

    if (inviteData.user && inviteData.user.invite_token) {
      const inviteUrl = `https://newhollandfinancial.com/onboarding/setup?token=${inviteData.user.invite_token}`;
      console.log('Opening Live URL:', inviteUrl);
      
      exec(`open -a "Google Chrome" "${inviteUrl}"`, (err) => {
        if (err) console.error('Failed to open Chrome:', err);
        else console.log('Successfully opened Chrome on user machine to live site!');
      });
    }

  } catch (err) {
    console.error(err);
  }
})();
