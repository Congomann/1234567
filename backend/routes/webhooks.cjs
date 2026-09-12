const express = require('express');
const router = express.Router();
const { supabase } = require('../supabase.cjs');

// META WEBHOOK VERIFICATION
router.get('/meta', (req, res) => {
  const VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN || 'nhfg_meta_webhook_2025';
  
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
    
  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);      
    }
  } else {
    res.sendStatus(400);
  }
});

// META WEBHOOK INGESTION
router.post('/meta', async (req, res) => {
  const body = req.body;
  if (body.object !== 'page') {
    return res.sendStatus(404);
  }

  try {
    for (const entry of body.entry) {
      for (const change of entry.changes) {
        if (change.field === 'leadgen') {
          const leadData = change.value;
          
          const newLead = {
            id: `meta_${leadData.leadgen_id}`,
            name: 'New Meta Lead',
            email: `lead_${leadData.leadgen_id}@example.com`,
            phone: '555-000-0000',
            interest: 'Life Insurance',
            message: 'Lead captured from Meta Ads Lead Form',
            date: new Date(leadData.created_time * 1000).toISOString(),
            status: 'New',
            score: 50,
            qualification: 'Warm',
            source: 'Meta Ads',
            campaign: leadData.campaign_id || 'Unknown Campaign'
          };

          const { error } = await supabase
            .from('leads')
            .upsert(newLead, { onConflict: 'id' });

          if (error) console.error('Error inserting Meta lead:', error);
          
          // Insert activity
          await supabase.from('lead_activities').insert({
            lead_id: newLead.id,
            type: 'meta_lead_received',
            description: 'Lead captured from Meta Ads Lead Form'
          });
        }
      }
    }
    res.status(200).send('EVENT_RECEIVED');
  } catch (err) {
    console.error('Meta Webhook Error:', err);
    res.sendStatus(500);
  }
});

// GOOGLE ADS WEBHOOK INGESTION
router.post('/google', async (req, res) => {
  try {
    const leadData = req.body;
    let name = 'Google Ads Lead';
    let email = '';
    let phone = '';

    if (leadData.user_column_data) {
      for (const field of leadData.user_column_data) {
        if (field.column_id === 'FULL_NAME' || field.column_id === 'FIRST_NAME') {
          name = field.string_value;
        } else if (field.column_id === 'EMAIL') {
          email = field.string_value;
        } else if (field.column_id === 'PHONE_NUMBER') {
          phone = field.string_value;
        }
      }
    }

    const newLead = {
      id: `google_${leadData.lead_id || Date.now()}`,
      name: name || 'Google Ads Lead',
      email: email,
      phone: phone,
      interest: 'Life Insurance',
      message: 'Lead captured from Google Ads Lead Form',
      date: new Date().toISOString(),
      status: 'New',
      score: 50,
      qualification: 'Warm',
      source: 'Google Ads',
      campaign: leadData.campaign_id || 'Google Search'
    };

    const { error } = await supabase
      .from('leads')
      .upsert(newLead, { onConflict: 'id' });

    if (error) console.error('Error inserting Google lead:', error);

    await supabase.from('lead_activities').insert({
      lead_id: newLead.id,
      type: 'google_lead_received',
      description: 'Lead captured from Google Ads Lead Form'
    });

    res.status(200).send('Google Lead Processed');
  } catch (err) {
    console.error('Google Webhook Error:', err);
    res.sendStatus(500);
  }
});

module.exports = router;
