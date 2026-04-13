const express = require('express');
const router = express.Router();
const { supabase } = require('../supabase.cjs');
const { assignLead, getLeadTypeId } = require('../services/routingEngine.cjs');

/**
 * META LEAD ADS WEBHOOK
 * Listens for Instant Forms webhook push.
 */
router.post('/meta', async (req, res) => {
  try {
    const data = req.body;
    
    // Facebook API validation challenge response (verification process)
    if (req.query['hub.mode'] === 'subscribe' && req.query['hub.challenge']) {
      return res.status(200).send(req.query['hub.challenge']);
    }

    if (!data.entry || !data.entry[0].changes) return res.sendStatus(200);
    
    const leadData = data.entry[0].changes[0].value.custom_fields || [];
    
    // Extract mapped fields
    const getName = () => leadData.find(f => f.name === 'full_name')?.values[0] || 'Unknown Meta Lead';
    const getEmail = () => leadData.find(f => f.name === 'email')?.values[0] || null;
    const getPhone = () => leadData.find(f => f.name === 'phone_number')?.values[0] || null;
    const getRawLeadType = () => leadData.find(f => f.name === 'lead_type')?.values[0] || null;

    const leadTypeId = getRawLeadType() ? await getLeadTypeId(getRawLeadType()) : null;
    const assignedAdvisorId = leadTypeId ? await assignLead(leadTypeId) : null;

    // Database Injection
    await supabase.from('leads').insert([{
      name: getName(),
      email: getEmail(),
      phone: getPhone(),
      source: 'Meta Ads',
      status: 'New',
      assigned_to: assignedAdvisorId,
      campaign_id: data.entry[0].changes[0].value.ad_id || 'unknown',
      interest: getRawLeadType() || 'General',
      platform_data: data
    }]);

    res.sendStatus(200);
  } catch (err) {
    console.error('[Webhooks] Meta parsing failed', err);
    res.sendStatus(500);
  }
});

/**
 * TIKTOK LEAD GEN WEBHOOK
 */
router.post('/tiktok', async (req, res) => {
  try {
    const data = req.body;
    const answers = data.answers || [];
    
    const getAnswer = (key) => answers.find(a => a.question === key)?.answer || null;
    
    const rawType = getAnswer('lead_type');
    const leadTypeId = rawType ? await getLeadTypeId(rawType) : null;
    const assignedAdvisorId = leadTypeId ? await assignLead(leadTypeId) : null;

    await supabase.from('leads').insert([{
      name: getAnswer('name') || 'Unknown TikTok Lead',
      email: getAnswer('email'),
      phone: getAnswer('phone'),
      source: 'TikTok Ads',
      status: 'New',
      assigned_to: assignedAdvisorId,
      campaign_id: data.ad_id || 'unknown',
      interest: rawType || 'General',
      platform_data: data
    }]);

    res.sendStatus(200);
  } catch (err) {
    console.error('[Webhooks] TikTok parsing failed', err);
    res.sendStatus(500);
  }
});

/**
 * GOOGLE LEAD FORM WEBHOOK
 */
router.post('/google', async (req, res) => {
  try {
    const data = req.body;
    const userCols = data.userColumnData || [];
    
    const getValue = (key) => userCols.find(c => c.columnName === key)?.stringValue || null;
    
    const rawType = getValue('Lead Type');
    const leadTypeId = rawType ? await getLeadTypeId(rawType) : null;
    const assignedAdvisorId = leadTypeId ? await assignLead(leadTypeId) : null;

    await supabase.from('leads').insert([{
      name: getValue('Full Name') || 'Unknown Google Lead',
      email: getValue('Email'),
      phone: getValue('Phone Number'),
      source: 'Google Ads',
      status: 'New',
      assigned_to: assignedAdvisorId,
      campaign_id: data.campaignId || 'unknown',
      interest: rawType || 'General',
      platform_data: data
    }]);

    res.sendStatus(200);
  } catch (err) {
    console.error('[Webhooks] Google parsing failed', err);
    res.sendStatus(500);
  }
});

module.exports = router;
