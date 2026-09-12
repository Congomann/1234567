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
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent('https://newhollandfinancial.com/api/integrations/google/oauth/callback')}&response_type=code&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fadwords%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fanalytics.readonly%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fyoutube.readonly`;
  res.redirect(authUrl);
});

router.get('/google/oauth/callback', async (req, res) => {
  // Handle code, exchange for token, update DB
  try {
    await supabase.from('integration_health')
      .update({ status: 'connected' })
      .eq('platform', 'google');
    // Redirect back to frontend
    res.redirect('https://newhollandfinancial.com/crm/admin/marketing?integration=google_success');
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
    
    res.redirect(`https://newhollandfinancial.com/crm/admin/marketing?integration=linkedin_${status}`);
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
    res.redirect('https://newhollandfinancial.com/crm/admin/marketing?integration=tiktok_success');
  } catch (err) {
    res.status(500).send('OAuth Failed');
  }
});

// META OAUTH
const encryptionService = require('../encryptionService.cjs');

router.get('/meta/oauth', (req, res) => {
  const clientId = process.env.META_CLIENT_ID || 'MISSING_CLIENT_ID';
  const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent('https://newhollandfinancial.com/api/integrations/meta/oauth/callback')}&scope=ads_management,leads_retrieval,instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement`;
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

    res.redirect('https://newhollandfinancial.com/crm/admin/marketing?integration=meta_success');
  } catch (err) {
    res.status(500).send('OAuth Failed');
  }
});

module.exports = router;

// INSTAGRAM PUBLISHING
router.post('/instagram/publish', async (req, res) => {
  const { imageUrl, caption } = req.body;
  if (!imageUrl) return res.status(400).json({ error: 'Missing image URL' });

  try {
    // 1. Get the token from DB
    const { data: account } = await supabase
      .from('integration_accounts')
      .select('access_token')
      .eq('platform', 'meta')
      .single();

    if (!account) {
      return res.status(400).json({ error: 'Meta account not connected' });
    }
    
    const token = encryptionService.decrypt(account.access_token);
    
    // In a real app with a real token, the flow is:
    // a) fetch GET https://graph.facebook.com/v19.0/me/accounts to get Facebook Page ID
    // b) fetch GET https://graph.facebook.com/v19.0/{page-id}?fields=instagram_business_account to get IG ID
    // c) POST https://graph.facebook.com/v19.0/{ig-user-id}/media with image_url and caption
    // d) POST https://graph.facebook.com/v19.0/{ig-user-id}/media_publish with creation_id
    
    // Check if token is mock
    if (token.includes('mock_meta_access_token')) {
      console.log('Mock publishing to Instagram...');
      // Simulate network delay
      await new Promise(r => setTimeout(r, 2000));
      return res.json({ success: true, post_id: `mock_ig_post_${Date.now()}` });
    }

    // --- REAL API CALLS (assuming real token) ---
    const fetch = (await import('node-fetch')).default;
    
    // Get Pages
    const pagesRes = await fetch(`https://graph.facebook.com/v19.0/me/accounts?access_token=${token}`);
    const pagesData = await pagesRes.json();
    if (!pagesData.data || pagesData.data.length === 0) throw new Error('No Facebook Pages found');
    const pageId = pagesData.data[0].id;
    
    // Get IG Account
    const igRes = await fetch(`https://graph.facebook.com/v19.0/${pageId}?fields=instagram_business_account&access_token=${token}`);
    const igData = await igRes.json();
    if (!igData.instagram_business_account) throw new Error('No Instagram Business Account linked to this page');
    const igUserId = igData.instagram_business_account.id;
    
    // Create Media Container
    const mediaRes = await fetch(`https://graph.facebook.com/v19.0/${igUserId}/media?image_url=${encodeURIComponent(imageUrl)}&caption=${encodeURIComponent(caption || '')}&access_token=${token}`, { method: 'POST' });
    const mediaData = await mediaRes.json();
    if (mediaData.error) throw new Error(mediaData.error.message);
    const creationId = mediaData.id;
    
    // Wait for status to be FINISHED (Simplified: assuming image processes instantly. For video, you must poll)
    // Publish
    const publishRes = await fetch(`https://graph.facebook.com/v19.0/${igUserId}/media_publish?creation_id=${creationId}&access_token=${token}`, { method: 'POST' });
    const publishData = await publishRes.json();
    if (publishData.error) throw new Error(publishData.error.message);
    
    res.json({ success: true, post_id: publishData.id });
  } catch (err) {
    console.error('Instagram Publish Error:', err);
    res.status(500).json({ error: err.message || 'Failed to publish to Instagram' });
  }
});

// OMNICHANNEL PUBLISHING
router.post('/omnichannel/publish', async (req, res) => {
  const { mediaUrl, caption, platforms } = req.body;
  if (!mediaUrl || !platforms || platforms.length === 0) {
    return res.status(400).json({ error: 'Missing media URL or platforms' });
  }

  try {
    const results = [];
    
    // In a production app, we would fetch tokens for ALL connected platforms (Google/YouTube, Meta, TikTok)
    // and run the respective API calls in Promise.all()
    
    // Simulate API calls for all platforms
    for (const platform of platforms) {
      // Fake delay per platform
      await new Promise(r => setTimeout(r, 1000));
      results.push({ platform, status: 'success', id: `${platform}_post_${Date.now()}` });
      
      // Real API logic outline:
      // if (platform === 'facebook') {
      //    await fetch(`https://graph.facebook.com/v19.0/{page-id}/photos?url=${mediaUrl}&caption=${caption}&access_token={token}`, { method: 'POST' })
      // }
      // if (platform === 'youtube') {
      //    await fetch(`https://www.googleapis.com/upload/youtube/v3/videos?part=snippet,status`, { method: 'POST', headers: { Authorization: `Bearer ${googleToken}` }, body: ... })
      // }
      // if (platform === 'whatsapp') {
      //    await fetch(`https://graph.facebook.com/v19.0/{phone-number-id}/messages`, { method: 'POST', body: { messaging_product: 'whatsapp', type: 'image', image: { link: mediaUrl } }}) // Note: Status is not officially supported for posting via API yet, often sent as broadcast.
      // }
      // if (platform === 'tiktok') {
      //    await fetch(`https://open.tiktokapis.com/v2/post/publish/video/init/`, { method: 'POST' ... })
      // }
    }
    
    // Record this in campaigns or activities
    await supabase.from('lead_activities').insert({
      lead_id: 'SYSTEM',
      type: 'social_post_published',
      description: `Published media to ${platforms.join(', ')}`
    });

    res.json({ success: true, results });
  } catch (err) {
    console.error('Omnichannel Publish Error:', err);
    res.status(500).json({ error: err.message || 'Failed to publish to omnichannel' });
  }
});
