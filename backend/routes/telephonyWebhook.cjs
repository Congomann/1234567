const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const crypto = require('crypto');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Middleware to verify SignalWire Webhook Signature (To be implemented fully)
const verifySignalWireSignature = (req, res, next) => {
  // TODO: Use @signalwire/node or crypto to verify req.headers['x-signalwire-signature']
  next();
};

// Handle incoming call events from SignalWire
router.post('/events', verifySignalWireSignature, async (req, res) => {
  const event = req.body;
  const callId = event.call_id || event.CallSid;
  const eventType = event.event_type || event.CallStatus;
  
  if (!callId) return res.status(400).send('Missing call ID');

  console.log(`[TelephonyWebhook] Received event ${eventType} for call ${callId}`);

  try {
    // Log the event
    await pool.query(`
      INSERT INTO telephony_call_events (call_id, event_type, event_data)
      VALUES (
        (SELECT id FROM telephony_calls WHERE signalwire_call_id = $1 LIMIT 1),
        $2, $3
      )
    `, [callId, eventType, JSON.stringify(event)]);

    // Update call status based on event
    if (eventType === 'completed' || eventType === 'ended') {
      const duration = event.duration || event.CallDuration || 0;
      await pool.query(`
        UPDATE telephony_calls 
        SET status = 'completed', ended_at = NOW(), duration = $2 
        WHERE signalwire_call_id = $1
      `, [callId, duration]);
    }
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('[TelephonyWebhook] Error processing event:', error);
    res.status(500).send('Error');
  }
});

// Provide WebRTC Token for Browser Softphone
router.get('/token', async (req, res) => {
  try {
    const agentId = req.user?.id || 'anonymous';
    const token = 'webrtc_sat_stub_for_' + agentId;
    res.json({ token, success: true });
  } catch (error) {
    console.error('[TelephonyWebhook] Token Gen Error:', error);
    res.status(500).json({ error: 'Failed to generate WebRTC token' });
  }
});

// Phase 6: Power Dialer - Get Next Lead in Campaign
router.get('/campaigns/:id/next-lead', async (req, res) => {
  const { id } = req.params;
  try {
    // Transaction to safely fetch and lock the next pending lead
    const result = await pool.query(`
      UPDATE telephony_campaign_leads
      SET status = 'called', attempts = attempts + 1, last_attempt_at = NOW()
      WHERE id = (
        SELECT id FROM telephony_campaign_leads 
        WHERE campaign_id = $1 AND status = 'pending' 
        ORDER BY created_at ASC LIMIT 1
        FOR UPDATE SKIP LOCKED
      )
      RETURNING *;
    `, [id]);

    if (result.rows.length === 0) {
      return res.json({ nextLead: null, message: 'Campaign complete or empty' });
    }
    res.json({ nextLead: result.rows[0], success: true });
  } catch (error) {
    console.error('[PowerDialer] Error fetching next lead:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Provide LAML instructions for basic inbound routing if not using Realtime API directly
router.post('/inbound', (req, res) => {
  res.type('text/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say>Connecting you to an agent, please wait.</Say>
    <!-- We would use Dial with SIP to route to the browser softphone here -->
    <Enqueue waitUrl="https://cdn.signalwire.com/default-music/welcome.mp3">SupportQueue</Enqueue>
</Response>`);
});

module.exports = router;
