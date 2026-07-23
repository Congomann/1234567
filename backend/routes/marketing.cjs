const express = require('express');
const { Pool } = require('pg');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');
const router = express.Router();

// Use the existing pool config pattern from server.cjs
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

// GET /api/marketing/campaigns
router.get('/campaigns', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        c.*, 
        a.name as audience_name, 
        a.size as audience_size 
      FROM marketing_campaigns c
      LEFT JOIN marketing_audiences a ON c.audience_id = a.id
      ORDER BY c.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
});

// GET /api/marketing/audiences
router.get('/audiences', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM marketing_audiences ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching audiences:', error);
    res.status(500).json({ error: 'Failed to fetch audiences' });
  }
});

// POST /api/marketing/campaigns/fund
// Processes a real payment intent for a campaign budget using Stripe
router.post('/campaigns/fund', async (req, res) => {
  const { campaignId, amount, paymentMethodId } = req.body;
  
  if (!campaignId || !amount || amount <= 0) {
    return res.status(400).json({ error: 'Invalid campaign ID or amount' });
  }

  try {
    // In a fully real scenario, we'd use paymentMethodId to confirm the PaymentIntent
    // Here we create a simple charge or payment intent simulation
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe expects cents
      currency: 'usd',
      payment_method: paymentMethodId || 'pm_card_visa', // Fallback for test mode if not provided
      confirm: true,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never'
      }
    });

    if (paymentIntent.status === 'succeeded') {
      // Record transaction
      await pool.query(`
        INSERT INTO payment_transactions (campaign_id, amount, status, stripe_charge_id)
        VALUES ($1, $2, $3, $4)
      `, [campaignId, amount, 'succeeded', paymentIntent.id]);

      // Update campaign budget and status
      const { rows } = await pool.query(`
        UPDATE marketing_campaigns 
        SET budget = budget + $1, status = 'Active' 
        WHERE id = $2
        RETURNING *
      `, [amount, campaignId]);

      res.json({ success: true, campaign: rows[0], transaction: paymentIntent.id });
    } else {
      res.status(400).json({ error: 'Payment failed to process', status: paymentIntent.status });
    }
  } catch (error) {
    console.error('Stripe payment error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/marketing/social/mentions
// Simulates fetching real mentions from connected APIs (Twitter, Meta, LinkedIn)
router.get('/social/mentions', async (req, res) => {
  // In reality, this would query the social_integrations table for OAuth tokens,
  // then make parallel HTTP requests to Twitter API, Facebook Graph API, etc.
  // Since we don't have real tokens yet, we return the structure the frontend expects.
  try {
    const mockMentions = [
      { id: '1', platform: 'Twitter', user: '@logistics_pro', content: 'New Holland Financial is a game changer for our fleet.', sentiment: 'positive', date: new Date().toISOString() },
      { id: '2', platform: 'LinkedIn', user: 'Sarah Jenkins', content: 'Does anyone have experience with NHFG for trucking loans?', sentiment: 'neutral', date: new Date(Date.now() - 86400000).toISOString() },
    ];
    res.json(mockMentions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch mentions' });
  }
});

// POST /api/marketing/automations
// Saves a new workflow automation to the database
router.post('/automations', async (req, res) => {
  const { name, trigger, actions } = req.body;
  if (!name || !trigger || !actions) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const { rows } = await pool.query(`
      INSERT INTO workflow_automations (name, trigger_event, actions)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [name, trigger, JSON.stringify(actions)]);
    res.json(rows[0]);
  } catch (error) {
    console.error('Error saving automation:', error);
    res.status(500).json({ error: 'Failed to save automation' });
  }
});

module.exports = router;
