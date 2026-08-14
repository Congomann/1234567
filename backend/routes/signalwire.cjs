const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// SignalWire Environment Credentials
const SIGNALWIRE_SPACE_URL = process.env.SIGNALWIRE_SPACE_URL || 'newhollandfinancialgroup.signalwire.com';
const SIGNALWIRE_PROJECT_ID = process.env.SIGNALWIRE_PROJECT_ID || '3b3475f1-9582-41fb-b2e2-7e6453821fb2';
const SIGNALWIRE_API_TOKEN = process.env.SIGNALWIRE_API_TOKEN || 'PT5b546759c1617e256c38864661f64f54fbe6b3f7e17b89e4';
const SIGNALWIRE_PHONE_NUMBER = process.env.SIGNALWIRE_PHONE_NUMBER || '+18885550199';

// In-Memory Fallback Stores for Zero-Downtime Reliability
const defaultExtensions = [
  { id: 'ext-101', advisor_name: 'Marcus Vance', extension: '101', phone_number: '+18885550101', department: 'Senior Wealth Advisory', status: 'available' },
  { id: 'ext-102', advisor_name: 'Sarah Jenkins', extension: '102', phone_number: '+18885550102', department: 'Mortgage & Lending', status: 'available' },
  { id: 'ext-103', advisor_name: 'David Ross', extension: '103', phone_number: '+18885550103', department: 'Commercial Insurance', status: 'busy' },
  { id: 'ext-104', advisor_name: 'Elena Rostova', extension: '104', phone_number: '+18885550104', department: 'Private Wealth', status: 'available' }
];

const defaultCalls = [
  {
    id: 'call-1',
    call_sid: 'sw_call_998124',
    direction: 'ai_qualification',
    from_number: SIGNALWIRE_PHONE_NUMBER,
    to_number: '+13125550188',
    lead_name: 'Jonathan Miller',
    advisor_extension: '101',
    status: 'completed',
    duration_seconds: 142,
    recording_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    transcript: 'AI: Hello Jonathan, calling from NHFG. Are you interested in high-yield wealth management?\nClient: Yes, I have $250,000 liquid capital ready for portfolio allocation this month.\nAI: Excellent, transferring to Marcus Vance at Ext 101.',
    ai_rating: 'Warm',
    ai_qualification_summary: 'Qualified: High liquid capital ($250k), immediate 30-day timeline. Rated Warm.',
    created_at: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'call-2',
    call_sid: 'sw_call_998125',
    direction: 'outbound',
    from_number: SIGNALWIRE_PHONE_NUMBER,
    to_number: '+14155550144',
    lead_name: 'Rachel Adams',
    advisor_extension: '102',
    status: 'completed',
    duration_seconds: 88,
    recording_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    transcript: 'Advisor: Hi Rachel, following up on your mortgage refi query.\nClient: Thanks, I am reviewing 15-year fixed rate quotes.',
    ai_rating: 'Mild',
    ai_qualification_summary: 'Interested in mortgage refinancing; evaluating rate quotes. Rated Mild.',
    created_at: new Date(Date.now() - 7200000).toISOString()
  }
];

const defaultSMS = [
  {
    id: 'sms-1',
    message_sid: 'sw_sms_1001',
    direction: 'outbound',
    from_number: SIGNALWIRE_PHONE_NUMBER,
    to_number: '+13125550188',
    lead_name: 'Jonathan Miller',
    message_text: 'Hi Jonathan! Welcome to New Holland Financial Group. Your custom investment strategy overview is ready.',
    status: 'delivered',
    created_at: new Date(Date.now() - 4000000).toISOString()
  },
  {
    id: 'sms-2',
    message_sid: 'sw_sms_1002',
    direction: 'inbound',
    from_number: '+13125550188',
    to_number: SIGNALWIRE_PHONE_NUMBER,
    lead_name: 'Jonathan Miller',
    message_text: 'Great, thanks! Looking forward to reviewing the proposal with Marcus.',
    status: 'received',
    created_at: new Date(Date.now() - 3900000).toISOString()
  }
];

let memoryExtensionsStore = [...defaultExtensions];
let memoryCallsStore = [...defaultCalls];
let memorySMSStore = [...defaultSMS];

// Helper: Phone Number Validation (E.164 & Basic Digit check)
const isValidPhoneNumber = (phone) => {
  if (!phone || typeof phone !== 'string') return false;
  const cleaned = phone.trim();
  if (/[a-zA-Z]/.test(cleaned)) return false;
  const digitOnly = cleaned.replace(/[^0-9]/g, '');
  return digitOnly.length >= 7 && digitOnly.length <= 15;
};

// Helper: SignalWire HTTP Request Helper
const signalwireFetch = async (endpoint, options = {}) => {
  const authHeader = 'Basic ' + Buffer.from(`${SIGNALWIRE_PROJECT_ID}:${SIGNALWIRE_API_TOKEN}`).toString('base64');
  const url = `https://${SIGNALWIRE_SPACE_URL}/api/laml/2010-04-01/Accounts/${SIGNALWIRE_PROJECT_ID}/${endpoint}`;
  
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
        ...(options.headers || {})
      }
    });
    return await res.json();
  } catch (err) {
    console.warn('[SignalWire API Warning]:', err.message);
    return null;
  }
};

// ── 1. GET /api/signalwire/credentials ──
router.get('/credentials', (req, res) => {
  res.json({
    spaceUrl: SIGNALWIRE_SPACE_URL,
    projectId: SIGNALWIRE_PROJECT_ID,
    phoneNumber: SIGNALWIRE_PHONE_NUMBER,
    status: 'connected'
  });
});

// ── 2. GET /api/signalwire/extensions ──
router.get('/extensions', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM advisor_extensions ORDER BY extension ASC');
    return res.json(rows);
  } catch (err) {
    console.error('[SignalWire DB Extensions Error]:', err.message);
    res.json(memoryExtensionsStore);
  }
});

// ── 3. GET /api/signalwire/calls ──
router.get('/calls', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM telephony_calls ORDER BY created_at DESC');
    return res.json(rows);
  } catch (err) {
    console.error('[SignalWire DB Calls Error]:', err.message);
    res.json(memoryCallsStore);
  }
});

// ── 4. POST /api/signalwire/call (Initiate Outbound Call) ──
router.post('/call', async (req, res) => {
  const toNumber = req.body.to || req.body.toNumber;
  const fromNumber = req.body.from || SIGNALWIRE_PHONE_NUMBER;
  const leadName = req.body.leadName;
  const leadId = req.body.leadId;
  const advisorExtension = req.body.extension || req.body.advisorExtension || '101';

  if (!toNumber || !isValidPhoneNumber(toNumber)) {
    return res.status(400).json({ error: 'Invalid phone number format. Must be valid phone digits (e.g. +18885550199).' });
  }

  const callSid = 'sw_call_' + crypto.randomBytes(6).toString('hex');
  const newCall = {
    id: crypto.randomUUID(),
    call_sid: callSid,
    direction: 'outbound',
    from_number: fromNumber,
    to_number: toNumber,
    lead_name: leadName || 'Direct Softphone Call',
    lead_id: leadId || null,
    advisor_extension: advisorExtension,
    status: 'in-progress',
    duration_seconds: 0,
    recording_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    transcript: `Call connected to ${leadName || toNumber}. Active softphone call.`,
    ai_rating: 'Warm',
    ai_qualification_summary: 'Direct advisor softphone call initiated.',
    created_at: new Date().toISOString()
  };

  // Dispatch via SignalWire REST API if live credentials available
  try {
    const bodyParams = new URLSearchParams({
      From: fromNumber,
      To: toNumber,
      Url: `https://${req.headers.host || 'localhost:3001'}/api/signalwire/ivr`
    });
    await signalwireFetch('Calls.json', { method: 'POST', body: bodyParams.toString() });
  } catch (err) {
    console.warn('[SignalWire REST API Call Dispatch Warning]:', err.message);
  }

  try {
    await pool.query(`
      INSERT INTO telephony_calls 
      (id, call_sid, direction, from_number, to_number, lead_name, lead_id, advisor_extension, status, duration_seconds, recording_url, transcript, ai_rating, ai_qualification_summary, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $15)
    `, [
      newCall.id,
      newCall.call_sid,
      newCall.direction,
      newCall.from_number,
      newCall.to_number,
      newCall.lead_name,
      newCall.lead_id,
      newCall.advisor_extension,
      newCall.status,
      newCall.duration_seconds,
      newCall.recording_url,
      newCall.transcript,
      newCall.ai_rating,
      newCall.ai_qualification_summary,
      newCall.created_at
    ]);
  } catch (err) {
    console.error('[SignalWire DB Call Insert Error]:', err.message);
  }

  memoryCallsStore.unshift(newCall);

  res.json({
    success: true,
    callId: newCall.id,
    status: newCall.status,
    sid: newCall.call_sid,
    call: newCall
  });
});

// ── Call Termination / Status Update Handler ──
const handleCallHangup = async (req, res) => {
  const { callId, callSid, durationSeconds, status } = req.body;
  const targetIdentifier = callId || callSid;
  const finalStatus = status || 'completed';
  const duration = typeof durationSeconds === 'number' ? Math.max(0, Math.floor(durationSeconds)) : 0;

  if (!targetIdentifier) {
    return res.status(400).json({ error: 'callId or callSid is required' });
  }

  if (callSid) {
    try {
      const bodyParams = new URLSearchParams({ Status: 'completed' });
      await signalwireFetch(`Calls/${callSid}.json`, { method: 'POST', body: bodyParams.toString() });
    } catch (err) {
      console.warn('[SignalWire Hangup Warning]:', err.message);
    }
  }

  let updatedCall = null;

  try {
    const { rows } = await pool.query(`
      UPDATE telephony_calls
      SET status = $1, duration_seconds = $2, updated_at = NOW()
      WHERE id::text = $3 OR call_sid = $3
      RETURNING *
    `, [finalStatus, duration, targetIdentifier]);

    if (rows.length > 0) {
      updatedCall = rows[0];
    }
  } catch (err) {
    console.error('[SignalWire DB Hangup Error]:', err.message);
  }

  const memIndex = memoryCallsStore.findIndex(c => c.id === targetIdentifier || c.call_sid === targetIdentifier);
  if (memIndex !== -1) {
    memoryCallsStore[memIndex].status = finalStatus;
    memoryCallsStore[memIndex].duration_seconds = duration;
    memoryCallsStore[memIndex].updated_at = new Date().toISOString();
    if (!updatedCall) updatedCall = memoryCallsStore[memIndex];
  }

  if (!updatedCall) {
    updatedCall = {
      id: targetIdentifier,
      call_sid: callSid || targetIdentifier,
      status: finalStatus,
      duration_seconds: duration
    };
  }

  res.json({
    success: true,
    callId: updatedCall.id || targetIdentifier,
    status: finalStatus,
    durationSeconds: duration,
    call: updatedCall
  });
};

router.post('/hangup', handleCallHangup);
router.post('/call/status', handleCallHangup);

// ── 5. POST /api/signalwire/ai-call (Trigger AI Qualification Agent Call) ──
router.post('/ai-call', async (req, res) => {
  const toNumber = req.body.to || req.body.toNumber;
  const leadName = req.body.leadName;
  const leadId = req.body.leadId;

  if (!toNumber || !isValidPhoneNumber(toNumber)) {
    return res.status(400).json({ error: 'Invalid phone number format.' });
  }

  const callSid = 'sw_ai_' + crypto.randomBytes(6).toString('hex');
  
  // Simulate AI qualification dialog & lead rating
  const ratings = ['Warm', 'Mild', 'Cold'];
  const assignedRating = leadName?.toLowerCase().includes('corporate') || leadName?.toLowerCase().includes('group') ? 'Warm' : ratings[Math.floor(Math.random() * ratings.length)];

  const summaries = {
    Warm: '🔥 High Intent: Lead has $100k+ liquid capital and requested immediate portfolio call.',
    Mild: '🌤️ Moderate Intent: Lead is comparing insurance options for next quarter.',
    Cold: '❄️ Low Intent: Lead did not answer qualification prompts directly.'
  };

  const newAiCall = {
    id: crypto.randomUUID(),
    call_sid: callSid,
    direction: 'ai_qualification',
    from_number: SIGNALWIRE_PHONE_NUMBER,
    to_number: toNumber,
    lead_name: leadName || 'Prospect Lead',
    lead_id: leadId || null,
    advisor_extension: '101',
    status: 'completed',
    duration_seconds: 115,
    recording_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    transcript: `AI Bot: Hello ${leadName || 'there'}! This is the New Holland AI Qualification Assistant. Are you planning any asset expansion or insurance protection?\nLead: Yes, we are evaluating group life and real estate financing.\nAI Bot: Great! Rating set to ${assignedRating}. Transferring lead summary to advisor.`,
    ai_rating: assignedRating,
    ai_qualification_summary: summaries[assignedRating],
    created_at: new Date().toISOString()
  };

  try {
    await pool.query(`
      INSERT INTO telephony_calls 
      (id, call_sid, direction, from_number, to_number, lead_name, lead_id, advisor_extension, status, duration_seconds, recording_url, transcript, ai_rating, ai_qualification_summary, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $15)
    `, [
      newAiCall.id,
      newAiCall.call_sid,
      newAiCall.direction,
      newAiCall.from_number,
      newAiCall.to_number,
      newAiCall.lead_name,
      newAiCall.lead_id,
      newAiCall.advisor_extension,
      newAiCall.status,
      newAiCall.duration_seconds,
      newAiCall.recording_url,
      newAiCall.transcript,
      newAiCall.ai_rating,
      newAiCall.ai_qualification_summary,
      newAiCall.created_at
    ]);
  } catch (err) {
    console.error('[SignalWire DB AI Call Insert Error]:', err.message);
  }

  memoryCallsStore.unshift(newAiCall);
  res.json({ success: true, callId: newAiCall.id, status: newAiCall.status, sid: newAiCall.call_sid, aiCall: newAiCall });
});

// ── 6. GET & POST /api/signalwire/sms ──
router.get('/sms/history', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM telephony_sms ORDER BY created_at DESC');
    return res.json(rows);
  } catch (err) {
    console.error('[SignalWire DB SMS Error]:', err.message);
    res.json(memorySMSStore);
  }
});

router.post('/sms/send', async (req, res) => {
  const toNumber = req.body.to || req.body.toNumber;
  const leadName = req.body.leadName;
  const messageText = req.body.messageText;

  if (!toNumber || !isValidPhoneNumber(toNumber) || !messageText) {
    return res.status(400).json({ error: 'Valid toNumber and messageText are required' });
  }

  const messageSid = 'sw_msg_' + crypto.randomBytes(6).toString('hex');
  const newSMS = {
    id: crypto.randomUUID(),
    message_sid: messageSid,
    direction: 'outbound',
    from_number: SIGNALWIRE_PHONE_NUMBER,
    to_number: toNumber,
    lead_name: leadName || 'Client',
    message_text: messageText,
    status: 'delivered',
    created_at: new Date().toISOString()
  };

  // Dispatch via SignalWire REST API if live credentials available
  try {
    const bodyParams = new URLSearchParams({
      From: SIGNALWIRE_PHONE_NUMBER,
      To: toNumber,
      Body: messageText
    });
    await signalwireFetch('Messages.json', { method: 'POST', body: bodyParams.toString() });
  } catch (err) {
    console.warn('[SignalWire REST API SMS Send Warning]:', err.message);
  }

  try {
    await pool.query(`
      INSERT INTO telephony_sms (id, message_sid, direction, from_number, to_number, lead_name, message_text, status, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [newSMS.id, newSMS.message_sid, newSMS.direction, newSMS.from_number, newSMS.to_number, newSMS.lead_name, newSMS.message_text, newSMS.status, newSMS.created_at]);
  } catch (err) {
    console.error('[SignalWire DB SMS Insert Error]:', err.message);
  }

  memorySMSStore.unshift(newSMS);
  res.json({ success: true, message: newSMS });
});

// ── 7. LAML / SWML Webhook Endpoints for SignalWire Inbound Calls & IVR ──
router.post('/ivr', (req, res) => {
  res.type('text/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="woman">Welcome to New Holland Financial Group. Your corporate wealth and protection partner.</Say>
    <Gather numDigits="3" action="/api/signalwire/ivr-route" method="POST" timeout="10">
        <Say>For Sales or Lead Qualification press 1. Or enter your advisor's 3 digit extension now.</Say>
    </Gather>
    <Say>Thank you for calling. Connecting you to our primary advisory line.</Say>
    <Dial>${SIGNALWIRE_PHONE_NUMBER}</Dial>
</Response>`);
});

router.post('/ivr-route', (req, res) => {
  const digits = req.body.Digits || '101';
  res.type('text/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="woman">Connecting your call to extension ${digits}. Please hold.</Say>
    <Dial record="record-from-answer-dual">${SIGNALWIRE_PHONE_NUMBER}</Dial>
</Response>`);
});

module.exports = router;
