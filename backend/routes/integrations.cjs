const express = require('express');
const router = express.Router();
const { supabase } = require('../supabase.cjs');

// HEALTH DASHBOARD ENDPOINT
router.get('/health', async (req, res) => {
  try {
    const { data, error } = await supabase.from('integration_health').select('*');
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error('[Integrations] Fetch health failed', err);
    res.status(500).json({ error: 'Failed to fetch integration health' });
  }
});

// GOOGLE OAUTH
router.get('/google/oauth', (req, res) => {
  // Real implementation would redirect to Google OAuth URL
  const clientId = process.env.GOOGLE_CLIENT_ID || 'MISSING_CLIENT_ID';
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent('https://newhollandfinancial.com/api/integrations/google/oauth/callback')}&response_type=code&scope=https://www.googleapis.com/auth/adwords`;
  res.redirect(authUrl);
});

router.get('/google/oauth/callback', async (req, res) => {
  // Handle code, exchange for token, update DB
  try {
    await supabase.from('integration_health')
      .update({ status: 'connected' })
      .eq('platform', 'google');
    // Redirect back to frontend
    res.redirect('http://localhost:5173/crm/admin/marketing?integration=google_success');
  } catch (err) {
    res.status(500).send('OAuth Failed');
  }
});

// LINKEDIN OAUTH
router.get('/linkedin/oauth', (req, res) => {
  const clientId = process.env.LINKEDIN_CLIENT_ID || 'MISSING_CLIENT_ID';
  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent('https://newhollandfinancial.com/api/integrations/linkedin/oauth/callback')}&scope=r_liteprofile%20r_emailaddress%20rw_ads`;
  res.redirect(authUrl);
});

router.get('/linkedin/oauth/callback', async (req, res) => {
  try {
    // If API access is pending LinkedIn approval, set status accordingly
    const isApproved = process.env.LINKEDIN_APPROVED === 'true'; // In reality we'd check token scope/validity
    const status = isApproved ? 'connected' : 'awaiting_approval';
    
    await supabase.from('integration_health')
      .update({ status })
      .eq('platform', 'linkedin');
    
    res.redirect(`http://localhost:5173/crm/admin/marketing?integration=linkedin_${status}`);
  } catch (err) {
    res.status(500).send('OAuth Failed');
  }
});

// TIKTOK OAUTH
router.get('/tiktok/oauth', (req, res) => {
  const authUrl = `https://business-api.tiktok.com/portal/auth?app_id=REAL_APP_ID&redirect_uri=${encodeURIComponent('https://api.nhfg.com/api/integrations/tiktok/oauth/callback')}&state=tiktok`;
  res.redirect(authUrl);
});

router.get('/tiktok/oauth/callback', async (req, res) => {
  try {
    await supabase.from('integration_health')
      .update({ status: 'connected' })
      .eq('platform', 'tiktok');
    res.redirect('http://localhost:5173/crm/admin/marketing?integration=tiktok_success');
  } catch (err) {
    res.status(500).send('OAuth Failed');
  }
});

// META OAUTH
const encryptionService = require('../encryptionService.cjs');

router.get('/meta/oauth', (req, res) => {
  const clientId = process.env.META_CLIENT_ID || 'MISSING_CLIENT_ID';
  const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent('https://newhollandfinancial.com/api/integrations/meta/oauth/callback')}&scope=ads_management,leads_retrieval`;
  res.redirect(authUrl);
});

router.get('/meta/oauth/callback', async (req, res) => {
  try {
    const code = req.query.code;
    // In a real flow, exchange 'code' for 'access_token' via Meta Graph API
    // We mock the token exchange here and encrypt it
    const mockAccessToken = `mock_meta_access_token_${Date.now()}`;
    const encryptedToken = encryptionService.encrypt(mockAccessToken);

    // Upsert into integration_accounts
    const { data: existing } = await supabase.from('integration_accounts').select('id').eq('platform', 'meta');
    if (existing && existing.length > 0) {
      await supabase.from('integration_accounts').update({
        access_token: encryptedToken,
        updated_at: new Date().toISOString()
      }).eq('id', existing[0].id);
    } else {
      await supabase.from('integration_accounts').insert([{
        platform: 'meta',
        access_token: encryptedToken,
        status: 'active'
      }]);
    }

    await supabase.from('integration_health').upsert([{ platform: 'meta', status: 'connected' }]);

    res.redirect('http://localhost:5173/crm/admin/marketing?integration=meta_success');
  } catch (err) {
    res.status(500).send('OAuth Failed');
  }
});

module.exports = router;
