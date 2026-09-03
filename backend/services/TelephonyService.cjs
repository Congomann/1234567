const { Voice } = require('@signalwire/realtime-api');
const crypto = require('crypto');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

class TelephonyService {
  constructor() {
    if (process.env.SIGNALWIRE_PROJECT_ID && process.env.SIGNALWIRE_API_TOKEN) {
      this.client = new Voice.Client({
        project: process.env.SIGNALWIRE_PROJECT_ID,
        token: process.env.SIGNALWIRE_API_TOKEN,
        contexts: ['default', 'inbound'],
      });
      
      this.setupListeners();
    } else {
      console.warn('[TelephonyService] SignalWire credentials missing. Running in disconnected mode.');
    }
  }

  setupListeners() {
    if (!this.client) return;

    this.client.on('call.received', async (call) => {
      console.log(`[TelephonyService] Incoming call from ${call.from} to ${call.to}`);
      
      // Store initial call record
      const callId = crypto.randomUUID();
      try {
        await pool.query(`
          INSERT INTO telephony_calls (id, signalwire_call_id, direction, from_number, to_number, status, started_at)
          VALUES ($1, $2, 'inbound', $3, $4, 'initiated', NOW())
        `, [callId, call.id, call.from, call.to]);
      } catch (err) {
        console.error('[TelephonyService] DB Insert Error', err);
      }

      try {
        await call.answer();
        
        await pool.query('UPDATE telephony_calls SET status = $1, answered_at = NOW() WHERE signalwire_call_id = $2', ['in-progress', call.id]);
        
        // Phase 7: Inbound Call Center - Route to Queue
        await call.playAudio({ url: 'https://cdn.signalwire.com/default-music/welcome.mp3' });
        
        // Find default queue
        const queueRes = await pool.query(`SELECT id FROM telephony_queues LIMIT 1`);
        if (queueRes.rows.length > 0) {
          await this.routeToQueue(call, queueRes.rows[0].id);
        } else {
          await call.hangup();
        }

      } catch (error) {
        console.error('[TelephonyService] Call handling error:', error);
      }
    });
  }

  // Phase 7: Queue Routing Logic (Longest Idle)
  async routeToQueue(call, queueId) {
    console.log(`[TelephonyService] Routing call to queue ${queueId}`);
    try {
      const agentRes = await pool.query(`
        SELECT qm.agent_id, u.email
        FROM telephony_queue_members qm
        JOIN telephony_agents a ON qm.agent_id = a.id
        JOIN users u ON a.id = u.id
        WHERE qm.queue_id = $1 AND a.status = 'available'
        ORDER BY a.created_at ASC
        LIMIT 1
      `, [queueId]);

      if (agentRes.rows.length > 0) {
        const agent = agentRes.rows[0];
        console.log(`[TelephonyService] Connecting to Agent: ${agent.email}`);
        
        // Connect to agent's WebRTC endpoint
        const peer = await call.connect({
          devices: new Voice.DeviceBuilder().addSip({
            to: `sip:${agent.agent_id}@newholland.signalwire.com`
          })
        });

        // Phase 10: Automatic Call Recording (Inbound)
        if (peer) {
          const recording = await call.recordAudio({ direction: 'both' });
          console.log(`[TelephonyService] Inbound recording started`);
          // Save recording metadata to DB when finished...
        }
      } else {
        console.log(`[TelephonyService] No available agents in queue ${queueId}`);
        // No agents available, play message and leave voicemail (Phase 10 preview)
        await call.playTTS({ text: 'All agents are currently busy. Please leave a message.' });
        await call.recordAudio({ direction: 'speak' });
      }
    } catch (err) {
      console.error('[TelephonyService] Routing Error:', err);
    }
  }

  async makeOutboundCall(from, to, agentId) {
    if (!this.client) throw new Error('SignalWire client not initialized');
    
    try {
      const call = await this.client.dialPhone({
        from: from,
        to: to,
        timeout: 30
      });

      const callId = crypto.randomUUID();
      await pool.query(`
        INSERT INTO telephony_calls (id, signalwire_call_id, agent_id, direction, from_number, to_number, status, started_at)
        VALUES ($1, $2, $3, 'outbound', $4, $5, 'initiated', NOW())
      `, [callId, call.id, agentId, from, to]);

      // Phase 10: Automatic Call Recording (Outbound)
      const recording = await call.recordAudio({ direction: 'both' });
      console.log(`[TelephonyService] Outbound recording started`);

      return { success: true, callId: callId, signalwireCallId: call.id };
    } catch (error) {
      console.error('[TelephonyService] Outbound dial failed', error);
      throw error;
    }
  }

  // Generate WebRTC token for browser softphone
  async getBrowserToken(agentId) {
    // Usually achieved via REST API to create a SAT (SignalWire Access Token) or JWT for the browser client
    const authHeader = 'Basic ' + Buffer.from(`${process.env.SIGNALWIRE_PROJECT_ID}:${process.env.SIGNALWIRE_API_TOKEN}`).toString('base64');
    const spaceUrl = process.env.SIGNALWIRE_SPACE_URL;
    
    // Stub implementation: Needs actual endpoint for SAT token creation based on SignalWire v3 docs.
    return { token: 'stub_webrtc_token_for_' + agentId };
  }
}

module.exports = new TelephonyService();
