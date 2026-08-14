const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const { supabase } = require('../supabase.cjs');
const { assignLead, getLeadTypeId } = require('../services/routingEngine.cjs');
const AutomationEngine = require('../services/automationEngine.cjs');

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

    const newLead = {
      name: getName(),
      email: getEmail(),
      phone: getPhone(),
      source: 'Meta Ads',
      status: 'New',
      assigned_to: assignedAdvisorId,
      campaign_id: data.entry[0].changes[0].value.ad_id || 'unknown',
      interest: getRawLeadType() || 'General',
      platform_data: data
    };

    // Database Injection
    const { data: insertedLead } = await supabase.from('leads').insert([newLead]).select().single();
    
    // Trigger Automation Engine
    if (insertedLead) {
      AutomationEngine.triggerEvent('LEAD_INGESTION', insertedLead);
    }

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

    const newLead = {
      name: getAnswer('name') || 'Unknown TikTok Lead',
      email: getAnswer('email'),
      phone: getAnswer('phone'),
      source: 'TikTok Ads',
      status: 'New',
      assigned_to: assignedAdvisorId,
      campaign_id: data.ad_id || 'unknown',
      interest: rawType || 'General',
      platform_data: data
    };

    const { data: insertedLead } = await supabase.from('leads').insert([newLead]).select().single();
    
    // Trigger Automation Engine
    if (insertedLead) {
      AutomationEngine.triggerEvent('LEAD_INGESTION', insertedLead);
    }

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

    const newLead = {
      name: getValue('Full Name') || 'Unknown Google Lead',
      email: getValue('Email'),
      phone: getValue('Phone Number'),
      source: 'Google Ads',
      status: 'New',
      assigned_to: assignedAdvisorId,
      campaign_id: data.campaignId || 'unknown',
      interest: rawType || 'General',
      platform_data: data
    };

    const { data: insertedLead } = await supabase.from('leads').insert([newLead]).select().single();
    
    // Trigger Automation Engine
    if (insertedLead) {
      AutomationEngine.triggerEvent('LEAD_INGESTION', insertedLead);
    }

    res.sendStatus(200);
  } catch (err) {
    console.error('[Webhooks] Google parsing failed', err);
    res.sendStatus(500);
  }
});

/**
 * UNIFIED AD CAMPAIGN LEAD INGESTION WEBHOOK (R4.1)
 * Accepts lead generation payloads for Meta, Google, and TV ads.
 */
router.post('/campaigns', async (req, res) => {
  try {
    const { channel, campaign_id, lead } = req.body || {};

    // 1. Validate channel
    if (!channel || typeof channel !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Invalid payload: "channel" string is required'
      });
    }

    const normalizedChannel = channel.trim().toLowerCase();
    const validChannels = ['meta', 'google', 'tv'];
    if (!validChannels.includes(normalizedChannel)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid channel: must be one of ["meta", "google", "tv"]'
      });
    }

    // 2. Validate campaign_id
    if (!campaign_id || typeof campaign_id !== 'string' || campaign_id.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid payload: "campaign_id" non-empty string is required'
      });
    }

    // 3. Validate lead object
    if (!lead || typeof lead !== 'object' || Array.isArray(lead)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid payload: "lead" object is required'
      });
    }

    // 4. Validate lead.full_name (accept full_name or name)
    const fullName = lead.full_name || lead.name;
    if (!fullName || typeof fullName !== 'string' || fullName.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid lead: "full_name" non-empty string is required'
      });
    }

    // 5. Validate lead.email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!lead.email || typeof lead.email !== 'string' || !emailRegex.test(lead.email.trim())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid lead: valid "email" string is required'
      });
    }

    // 6. Validate lead.phone
    if (!lead.phone || typeof lead.phone !== 'string' || lead.phone.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid lead: "phone" non-empty string is required'
      });
    }

    // 7. Validate lead.annual_income (non-negative number >= 0)
    const income = Number(lead.annual_income);
    if (
      lead.annual_income === undefined ||
      lead.annual_income === null ||
      typeof lead.annual_income === 'boolean' ||
      isNaN(income) ||
      income < 0
    ) {
      return res.status(400).json({
        success: false,
        error: 'Invalid lead: "annual_income" must be a non-negative number'
      });
    }

    // 8. Validate lead.asset_volume (non-negative number >= 0)
    const assets = Number(lead.asset_volume);
    if (
      lead.asset_volume === undefined ||
      lead.asset_volume === null ||
      typeof lead.asset_volume === 'boolean' ||
      isNaN(assets) ||
      assets < 0
    ) {
      return res.status(400).json({
        success: false,
        error: 'Invalid lead: "asset_volume" must be a non-negative number'
      });
    }

    // 9. Validate lead.credit_score (integer/number between 300 and 850)
    const credit = Number(lead.credit_score);
    if (
      lead.credit_score === undefined ||
      lead.credit_score === null ||
      typeof lead.credit_score === 'boolean' ||
      isNaN(credit) ||
      credit < 300 ||
      credit > 850
    ) {
      return res.status(400).json({
        success: false,
        error: 'Invalid lead: "credit_score" must be a number between 300 and 850'
      });
    }

    // Format source channel name
    let sourceName = 'Ad Campaign';
    if (normalizedChannel === 'meta') {
      sourceName = 'Meta Ads';
    } else if (normalizedChannel === 'google') {
      sourceName = 'Google Ads';
    } else if (normalizedChannel === 'tv') {
      sourceName = 'TV Ads';
    }

    const customDetails = {
      channel: normalizedChannel,
      annual_income: income,
      asset_volume: assets,
      credit_score: credit,
      ...lead
    };

    const newLeadRecord = {
      name: fullName.trim(),
      email: lead.email.trim(),
      phone: lead.phone.trim(),
      source: sourceName,
      status: 'received',
      campaign_id: campaign_id.trim(),
      interest: 'Ad Campaign',
      custom_details: customDetails,
      platform_data: req.body
    };

    // 12. Insert Database Record
    const { data: insertedLead, error: insertError } = await supabase
      .from('leads')
      .insert([newLeadRecord])
      .select()
      .single();

    if (insertError) {
      console.error('[Webhooks] DB Insert failed for campaign lead', insertError);
      return res.status(500).json({ success: false, error: 'Database ingestion failed' });
    }

    // Trigger Automation Engine
    if (insertedLead) {
      AutomationEngine.triggerEvent('LEAD_INGESTION', insertedLead);
    }

    return res.status(200).json({
      success: true,
      message: 'Lead ingested and routed successfully',
      lead_id: insertedLead.id,
      assigned_to: insertedLead.assigned_to
    });
  } catch (err) {
    console.error('[Webhooks /campaigns] Ingestion failed:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

