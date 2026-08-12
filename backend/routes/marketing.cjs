const express = require('express');
const { Pool } = require('pg');
const router = express.Router();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

// Helper: get Stripe lazily (won't crash if key not set)
function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key.includes('placeholder')) return null;
  return require('stripe')(key);
}

// GET /api/marketing/campaigns
router.get('/campaigns', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT c.*, a.name as audience_name, a.size as audience_size
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

// POST /api/marketing/campaigns — create a new campaign
router.post('/campaigns', async (req, res) => {
  const { name, type, budget, audienceId, subjectLine, messageBody, targetUrl, scheduledAt } = req.body;
  if (!name) return res.status(400).json({ error: 'Campaign name is required' });
  try {
    const { rows } = await pool.query(`
      INSERT INTO marketing_campaigns (name, type, budget, audience_id, subject_line, message_body, target_url, scheduled_at, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Draft')
      RETURNING *
    `, [name, type || 'Email', budget || 0, audienceId || null, subjectLine || '', messageBody || '', targetUrl || '', scheduledAt || null]);
    res.json(rows[0]);
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({ error: 'Failed to create campaign' });
  }
});

// PATCH /api/marketing/campaigns/:id — update a campaign
router.patch('/campaigns/:id', async (req, res) => {
  const { id } = req.params;
  const { name, status, type, budget, subjectLine, messageBody, audienceId } = req.body;
  try {
    const { rows } = await pool.query(`
      UPDATE marketing_campaigns 
      SET 
        name = COALESCE($1, name),
        status = COALESCE($2, status),
        type = COALESCE($3, type),
        budget = COALESCE($4, budget),
        subject_line = COALESCE($5, subject_line),
        message_body = COALESCE($6, message_body),
        audience_id = COALESCE($7, audience_id),
        updated_at = NOW()
      WHERE id = $8
      RETURNING *
    `, [name, status, type, budget, subjectLine, messageBody, audienceId, id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Campaign not found' });
    res.json(rows[0]);
  } catch (error) {
    console.error('Error updating campaign:', error);
    res.status(500).json({ error: 'Failed to update campaign' });
  }
});

// DELETE /api/marketing/campaigns/:id
router.delete('/campaigns/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM marketing_campaigns WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete campaign' });
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

// POST /api/marketing/audiences — create a new audience segment
router.post('/audiences', async (req, res) => {
  const { name, description, criteria, source } = req.body;
  if (!name) return res.status(400).json({ error: 'Audience name is required' });
  try {
    const { rows } = await pool.query(`
      INSERT INTO marketing_audiences (name, description, criteria, source, size)
      VALUES ($1, $2, $3, $4, 0)
      RETURNING *
    `, [name, description || '', JSON.stringify(criteria || {}), source || 'Manual']);
    res.json(rows[0]);
  } catch (error) {
    console.error('Error creating audience:', error);
    res.status(500).json({ error: 'Failed to create audience' });
  }
});

// DELETE /api/marketing/audiences/:id
router.delete('/audiences/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM marketing_audiences WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete audience' });
  }
});

// GET /api/marketing/email-sends — get all email send records
router.get('/email-sends', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT e.*, a.name as audience_name, c.name as campaign_name
      FROM email_sends e
      LEFT JOIN marketing_audiences a ON e.audience_id = a.id
      LEFT JOIN marketing_campaigns c ON e.campaign_id = c.id
      ORDER BY e.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch email sends' });
  }
});

// POST /api/marketing/email-sends — dispatch an email blast
router.post('/email-sends', async (req, res) => {
  const { campaignId, audienceId, subjectLine, messageBody } = req.body;
  if (!subjectLine || !messageBody) return res.status(400).json({ error: 'Subject and message body required' });
  try {
    // Get audience size for sent_count
    let sentCount = 0;
    if (audienceId) {
      const { rows: audRows } = await pool.query('SELECT size FROM marketing_audiences WHERE id = $1', [audienceId]);
      if (audRows.length > 0) sentCount = audRows[0].size;
    }

    const { rows } = await pool.query(`
      INSERT INTO email_sends (campaign_id, audience_id, subject_line, message_body, sent_count, status, sent_at)
      VALUES ($1, $2, $3, $4, $5, 'sent', NOW())
      RETURNING *
    `, [campaignId || null, audienceId || null, subjectLine, messageBody, sentCount]);

    res.json({ success: true, emailSend: rows[0], sentCount });
  } catch (error) {
    console.error('Error dispatching email:', error);
    res.status(500).json({ error: 'Failed to dispatch email' });
  }
});

// GET /api/marketing/email-sends/history — email send history
router.get('/email-sends/history', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT e.*, a.name as audience_name
      FROM email_sends e
      LEFT JOIN marketing_audiences a ON e.audience_id = a.id
      ORDER BY e.created_at DESC LIMIT 50
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch email history' });
  }
});

// GET /api/marketing/payments — get payment transactions
router.get('/payments', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT p.*, c.name as campaign_name
      FROM payment_transactions p
      LEFT JOIN marketing_campaigns c ON p.campaign_id = c.id
      ORDER BY p.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// POST /api/marketing/campaigns/fund — fund a campaign via Stripe or simulate
router.post('/campaigns/fund', async (req, res) => {
  const { campaignId, amount, paymentMethodId } = req.body;
  if (!campaignId || !amount || amount <= 0) {
    return res.status(400).json({ error: 'Invalid campaign ID or amount' });
  }

  try {
    const stripe = getStripe();
    let stripeChargeId = `sim_${Date.now()}`;
    let paymentStatus = 'succeeded';

    if (stripe) {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: 'usd',
        payment_method: paymentMethodId || 'pm_card_visa',
        confirm: true,
        automatic_payment_methods: { enabled: true, allow_redirects: 'never' }
      });
      stripeChargeId = paymentIntent.id;
      paymentStatus = paymentIntent.status === 'succeeded' ? 'succeeded' : 'failed';
    }

    if (paymentStatus === 'succeeded') {
      await pool.query(`
        INSERT INTO payment_transactions (campaign_id, amount, status, stripe_charge_id)
        VALUES ($1, $2, 'succeeded', $3)
      `, [campaignId, amount, stripeChargeId]);

      const { rows } = await pool.query(`
        UPDATE marketing_campaigns
        SET budget = budget + $1, status = 'Active', updated_at = NOW()
        WHERE id = $2 RETURNING *
      `, [amount, campaignId]);

      res.json({ success: true, campaign: rows[0], transactionId: stripeChargeId });
    } else {
      res.status(400).json({ error: 'Payment failed' });
    }
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({ error: error.message || 'Payment processing failed' });
  }
});

// GET /api/marketing/social/mentions
router.get('/social/mentions', async (req, res) => {
  const mockMentions = [
    { id: '1', platform: 'Twitter/X', user: '@logistics_pro', content: 'New Holland Financial is a game changer for our fleet. Best freight rates we\'ve seen.', sentiment: 'positive', date: new Date().toISOString() },
    { id: '2', platform: 'LinkedIn', user: 'Sarah Jenkins, CFO', content: 'Does anyone have experience with NHFG for commercial trucking insurance?', sentiment: 'neutral', date: new Date(Date.now() - 86400000).toISOString() },
    { id: '3', platform: 'Facebook', user: 'Mike Torres', content: 'NHFG helped me get my mortgage approved in 48 hours. Highly recommend!', sentiment: 'positive', date: new Date(Date.now() - 172800000).toISOString() },
    { id: '4', platform: 'Google Reviews', user: 'Anonymous', content: 'Wish they had more local office locations.', sentiment: 'neutral', date: new Date(Date.now() - 259200000).toISOString() }
  ];
  res.json(mockMentions);
});

// POST /api/marketing/automations
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
