const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const http = require('http');
const WebSocket = require('ws');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// WebSocket setup
const wss = new WebSocket.Server({ server, path: '/ws' });

wss.on('connection', (ws) => {
  console.log('[WebSocket] Client connected');
  ws.on('close', () => console.log('[WebSocket] Client disconnected'));
});

// Helper to broadcast to all connected clients
const broadcast = (data) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};

const PORT = process.env.PORT || 3001;
const SECRET_KEY = process.env.SECRET_KEY || 'your_super_secret_key_change_this_in_production';

// Swagger setup
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'NHFG CRM API',
      version: '1.0.0',
      description: 'API documentation for the NHFG CRM backend',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./backend/server.js'], // files containing annotations as above
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database Connection - Google Cloud SQL Support
let poolConfig;

if (process.env.INSTANCE_CONNECTION_NAME) {
  // Cloud SQL Connection via Unix Socket (Standard for Cloud Run / App Engine)
  console.log(`Connecting to Cloud SQL instance: ${process.env.INSTANCE_CONNECTION_NAME}`);
  poolConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`,
    max: 10, // Adjust based on Cloud SQL tier
    connectionTimeoutMillis: 5000,
  };
} else {
  // Standard TCP Connection (Localhost or External IP)
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  };
}

const pool = new Pool(poolConfig);

// --- JWT Middleware ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    if (process.env.NODE_ENV === 'development') {
      req.user = { id: 'mock-user-id', role: 'admin' };
      return next();
    }
    return res.status(401).json({ error: 'Unauthorized' });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      if (process.env.NODE_ENV === 'development') {
        req.user = { id: 'mock-user-id', role: 'admin' };
        return next();
      }
      return res.status(403).json({ error: 'Forbidden' });
    }
    req.user = user;
    next();
  });
};

// --- HELPER: WEBHOOK NORMALIZERS ---
// These functions automatically correct incoming messy JSON from ad platforms into our clean Schema

const WebhookNormalizer = {
  google: async (payload) => {
    const fields = {};
    // Google sends data in a 'user_column_data' array
    if (payload.user_column_data) {
      payload.user_column_data.forEach(col => {
        fields[col.column_id] = col.string_value;
      });
    }
    return {
      name: fields.FULL_NAME || `${fields.FIRST_NAME || ''} ${fields.LAST_NAME || ''}`.trim() || 'Google Lead',
      email: fields.EMAIL || 'Not Provided',
      phone: fields.PHONE_NUMBER || 'N/A',
      interest: fields.PRODUCT_INTEREST || 'Life Insurance', // Default fallback
      campaign_id: payload.campaign_id || 'Unknown',
      source: 'google_ads'
    };
  },
  meta: async (payload) => {
    const entry = payload.entry?.[0];
    const change = entry?.changes?.[0]?.value || payload;

    // REAL-WORLD META GRAPH API FETCHING
    if (change.leadgen_id && process.env.META_ACCESS_TOKEN) {
      try {
        const res = await fetch(`https://graph.facebook.com/v19.0/${change.leadgen_id}?access_token=${process.env.META_ACCESS_TOKEN}`);
        const leadData = await res.json();
        // Overwrite 'change' with the actual fetched lead data for normalization
        if (leadData.field_data) {
          change.field_data = leadData.field_data;
        }
      } catch (e) {
        console.error("Meta Graph API error:", e);
      }
    }

    const fieldMap = {};
    if (change.field_data) {
      change.field_data.forEach(f => fieldMap[f.name] = f.values[0]);
    }

    return {
      name: fieldMap.full_name || change.full_name || 'Meta Lead',
      email: fieldMap.email || change.email || 'Not Provided',
      phone: fieldMap.phone_number || change.phone_number || 'N/A',
      interest: fieldMap.job_title || 'Business Insurance',
      campaign_id: change.campaign_id || 'Unknown',
      source: 'meta_ads'
    };
  },
  tiktok: async (payload) => {
    const data = payload.data || {};
    return {
      name: data.details?.name || 'TikTok Lead',
      email: data.details?.email || 'Not Provided',
      phone: data.details?.phone || 'N/A',
      interest: 'Indexed Universal Life (IUL)',
      campaign_id: data.campaign_id || 'Unknown',
      source: 'tiktok_ads'
    };
  },
  linkedin: async (payload) => {
    // LinkedIn Lead Gen Forms format
    const formResponseInfo = payload.formResponseInfo || {};
    return {
      name: `${formResponseInfo.firstName || ''} ${formResponseInfo.lastName || ''}`.trim() || 'LinkedIn Lead',
      email: formResponseInfo.emailAddress || 'Not Provided',
      phone: formResponseInfo.phoneNumber || 'N/A',
      interest: formResponseInfo.jobTitle || 'Executive Financial Planning',
      campaign_id: payload.campaignId || 'Unknown',
      source: 'linkedin_ads'
    };
  }
};

// --- API ROUTES ---

/**
 * @openapi
 * /api/dashboard/metrics:
 *   get:
 *     summary: Retrieve dashboard metrics
 *     description: Returns key performance indicators for the dashboard.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A successful response with dashboard metrics.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalRevenue:
 *                   type: number
 *                   description: The total accumulated revenue across all clients.
 *                 activeClients:
 *                   type: integer
 *                   description: The total number of currently active clients.
 *                 pendingLeads:
 *                   type: integer
 *                   description: The total number of leads with a 'New' status.
 *                 monthlyPerformance:
 *                   type: array
 *                   description: A breakdown of performance metrics by month.
 *                   items:
 *                     type: object
 *                     properties:
 *                       month:
 *                         type: string
 *                         description: The month of the performance data (e.g., 'Jan').
 *                       revenue:
 *                         type: number
 *                         description: Total revenue generated in this month.
 *                       leads:
 *                         type: integer
 *                         description: Number of leads acquired in this month.
 */
// 1. Dashboard Metrics
app.get('/api/dashboard/metrics', authenticateToken, async (req, res) => {
  try {
    const revenueQuery = await pool.query('SELECT SUM(premium) as total FROM clients');
    const clientsQuery = await pool.query('SELECT COUNT(*) as count FROM clients');
    const leadsQuery = await pool.query("SELECT COUNT(*) as count FROM leads WHERE status = 'New'");

    res.json({
      totalRevenue: parseFloat(revenueQuery.rows[0].total || 0),
      activeClients: parseInt(clientsQuery.rows[0].count),
      pendingLeads: parseInt(leadsQuery.rows[0].count),
      monthlyPerformance: [
        { month: 'Jan', revenue: 45000, leads: 24 },
        { month: 'Feb', revenue: 52000, leads: 30 },
        { month: 'Mar', revenue: 48000, leads: 28 },
      ]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// 2. Leads Management
app.get('/api/leads', authenticateToken, async (req, res) => {
  try {
    const { advisorId } = req.query;
    let query = 'SELECT * FROM leads WHERE is_archived = false';
    const params = [];

    if (advisorId) {
      query += ' AND (assigned_to = $1 OR assigned_to IS NULL)';
      params.push(advisorId);
    }

    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query, params);

    // Convert snake_case DB to camelCase for frontend
    const leads = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      interest: row.interest,
      status: row.status,
      assignedTo: row.assigned_to,
      source: row.source,
      priority: row.priority,
      score: row.score,
      qualification: row.qualification,
      message: row.message,
      date: row.created_at,
      lifeDetails: row.life_details,
      realEstateDetails: row.real_estate_details,
      securitiesDetails: row.securities_details,
      customDetails: row.custom_details
    }));

    res.json(leads);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.post('/api/leads', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    const { name, email, phone, interest, status, source, assignedTo, message, lifeDetails, realEstateDetails, securitiesDetails, customDetails } = req.body;

    await client.query('BEGIN');

    const insertQuery = `
      INSERT INTO leads (
          name, email, phone, interest, status, source, assigned_to, message, 
          life_details, real_estate_details, securities_details, custom_details
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id
    `;

    const result = await client.query(insertQuery, [
      name, email, phone, interest, status || 'New', source, assignedTo, message,
      lifeDetails, realEstateDetails, securitiesDetails, customDetails
    ]);

    await client.query('COMMIT');
    res.status(201).json({ id: result.rows[0].id, success: true });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// 2.5 API Trace Logs
app.get('/api/logs', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM integration_logs ORDER BY created_at DESC LIMIT 50');
    // Map snake_case to camelCase structure where needed or just pass directly
    const logs = result.rows.map(row => ({
      id: row.id,
      platform: row.platform,
      event: row.event_type,
      status: row.status === 'failure' ? 'error' : 'success', // Frontend expects 'success' or 'error'
      payload: row.payload || { error: row.error_message },
      timestamp: row.created_at
    }));
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2.6 Webhook Verification Challenges (GET)
// Meta-specific Verification Endpoint
app.get('/api/meta/webhook', (req, res) => {
  const VERIFY_TOKEN = "newholland_meta_verify_2026";

  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Generic Fallback Verification
app.get('/api/webhooks/:platform', (req, res) => {
  const { platform } = req.params;
  const challenge = req.query['hub.challenge'] || req.query.challenge;
  const token = req.query['hub.verify_token'] || req.query.token;

  console.log(`[API Webhook Verification] Platform: ${platform}, Token: ${token}`);

  // Real-world validation (Mocked 'valid' for demo, in prod check against process.env.META_VERIFY_TOKEN)
  if (challenge) {
    res.status(200).send(challenge);
  } else {
    res.status(403).send('Verification failed');
  }
});

// 3. Webhook Ingestion Handler
const processWebhookIngestion = async (req, res, platform) => {
  const payload = req.body;

  console.log(`[API] Received ${platform} webhook`);

  // 1. Log Raw Event
  await pool.query(
    'INSERT INTO integration_logs (platform, event_type, status, payload) VALUES ($1, $2, $3, $4)',
    [platform, 'INGEST_ATTEMPT', 'pending', JSON.stringify(payload)]
  );

  try {
    // 2. Normalize Data
    let leadData = null;
    if (platform === 'google') leadData = await WebhookNormalizer.google(payload);
    else if (platform === 'meta') leadData = await WebhookNormalizer.meta(payload);
    else if (platform === 'tiktok') leadData = await WebhookNormalizer.tiktok(payload);
    else if (platform === 'linkedin') leadData = await WebhookNormalizer.linkedin(payload);
    else throw new Error('Unsupported platform');

    // 3. Insert Normalized Lead
    if (leadData) {
      const result = await pool.query(
        `INSERT INTO leads (name, email, phone, interest, source, campaign_id, status, platform_data, message)
               VALUES ($1, $2, $3, $4, $5, $6, 'New', $7, 'Auto-Imported via Webhook') RETURNING *`,
        [leadData.name, leadData.email, leadData.phone, leadData.interest, leadData.source, leadData.campaign_id, JSON.stringify(payload)]
      );

      // 4. Transform DB obj for frontend
      const newLeadObj = {
        id: result.rows[0].id.toString(),
        name: result.rows[0].name,
        email: result.rows[0].email,
        phone: result.rows[0].phone || 'N/A',
        interest: result.rows[0].interest,
        source: result.rows[0].source,
        message: result.rows[0].message || 'Auto-Imported via Webhook',
        status: result.rows[0].status,
        date: result.rows[0].created_at || new Date().toISOString()
      };

      // 5. Broadcast to realtime CRM clients
      broadcast({ type: 'NEW_LEAD', payload: newLeadObj });

      res.status(200).json({ success: true, message: 'Lead normalized and ingested' });
    } else {
      res.status(400).json({ error: 'Normalization failed' });
    }

  } catch (err) {
    console.error(err);
    // Log Failure
    await pool.query(
      'INSERT INTO integration_logs (platform, event_type, status, error_message) VALUES ($1, $2, $3, $4)',
      [platform, 'INGEST_ERROR', 'failure', err.message]
    );
    res.status(500).json({ error: err.message });
  }
};

app.post('/api/meta/webhook', async (req, res) => {
  await processWebhookIngestion(req, res, 'meta');
});

app.post('/api/webhooks/:platform', async (req, res) => {
  await processWebhookIngestion(req, res, req.params.platform);
});

// 4. Auth
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL', [email]);
    if (result.rows.length > 0) {
      const u = result.rows[0];

      // Simple SHA-256 comparison for the provided internal password
      const hash = crypto.createHash('sha256').update(password || '').digest('hex');

      // If the user has a password_hash, check it. Otherwise (for demo/fallback), allow if it's the default 'password'
      const isValid = u.password_hash ? (u.password_hash === hash) : (password === 'password');

      if (!isValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { sub: u.email, id: u.id, role: u.role },
        SECRET_KEY,
        { expiresIn: '30d' }
      );
      res.json({
        access_token: token,
        token_type: 'bearer',
        user: {
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          category: u.category,
          avatar: u.avatar_url,
          productsSold: u.products_sold
        }
      });
    } else {
      res.status(401).json({ error: 'User not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4.5 Users Management
app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, email, name, role, category, title, phone, avatar, bio, microsite_enabled as "micrositeEnabled", products_sold as "productsSold", license_states as "licenseStates", onboarding_completed as "onboardingCompleted", created_at as "createdAt", deleted_at as "deletedAt" FROM users ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users', authenticateToken, async (req, res) => {
  // STRICT PERMISSION: Only Admin can manage users
  if (req.user.role !== 'Administrator') {
    return res.status(403).json({ error: 'Forbidden: Admin access only' });
  }

  const client = await pool.connect();
  try {
    const { id, email, name, role, category, title, phone, avatar, bio, micrositeEnabled, productsSold, licenseStates, onboardingCompleted, password } = req.body;

    await client.query('BEGIN');

    let passwordHash = null;
    if (password) {
      passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    }

    const upsertQuery = `
      INSERT INTO users (
        id, email, name, role, category, title, phone, avatar, bio, 
        microsite_enabled, products_sold, license_states, onboarding_completed, password_hash
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        name = EXCLUDED.name,
        role = EXCLUDED.role,
        category = EXCLUDED.category,
        title = EXCLUDED.title,
        phone = EXCLUDED.phone,
        avatar = EXCLUDED.avatar,
        bio = EXCLUDED.bio,
        microsite_enabled = EXCLUDED.microsite_enabled,
        products_sold = EXCLUDED.products_sold,
        license_states = EXCLUDED.license_states,
        onboarding_completed = EXCLUDED.onboarding_completed,
        password_hash = COALESCE(EXCLUDED.password_hash, users.password_hash)
      RETURNING id
    `;

    const userId = id || crypto.randomUUID();
    const result = await client.query(upsertQuery, [
      userId, email, name, role, category, title, phone, avatar, bio,
      micrositeEnabled || false, productsSold || [], licenseStates || [], onboardingCompleted || false,
      passwordHash
    ]);

    await client.query('COMMIT');
    res.json({ id: result.rows[0].id, success: true });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// 5. Calendar Events
app.get('/api/events', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM events ORDER BY date ASC, time ASC');
    const events = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      // Format date to YYYY-MM-DD
      date: row.date ? new Date(row.date).toISOString().split('T')[0] : null,
      time: row.time,
      endTime: row.end_time,
      type: row.type,
      status: row.status,
      description: row.description,
      hasGoogleMeet: row.has_google_meet,
      meetingLink: row.meeting_link,
      participants: row.participants,
      creatorId: row.creator_id,
      creatorName: row.creator_name
    }));
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/events', authenticateToken, async (req, res) => {
  try {
    const { id, title, date, time, endTime, type, status, description, hasGoogleMeet, meetingLink, participants, creatorId, creatorName } = req.body;

    const upsertQuery = `
      INSERT INTO events (
        id, title, date, time, end_time, type, status, description, 
        has_google_meet, meeting_link, participants, creator_id, creator_name
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title, date = EXCLUDED.date, time = EXCLUDED.time,
        end_time = EXCLUDED.end_time, type = EXCLUDED.type, status = EXCLUDED.status,
        description = EXCLUDED.description, has_google_meet = EXCLUDED.has_google_meet,
        meeting_link = EXCLUDED.meeting_link, participants = EXCLUDED.participants,
        creator_id = EXCLUDED.creator_id, creator_name = EXCLUDED.creator_name,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id
    `;

    const result = await pool.query(upsertQuery, [
      id, title, date, time, endTime, type, status || 'scheduled', description,
      hasGoogleMeet || false, meetingLink, JSON.stringify(participants || []), creatorId, creatorName
    ]);

    res.status(200).json({ id: result.rows[0].id, success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/events/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, date, time, endTime, type, status, description, hasGoogleMeet, meetingLink, participants } = req.body;

    const updateQuery = `
      UPDATE events SET
        title = $1, date = $2, time = $3, end_time = $4, type = $5, status = $6, description = $7, 
        has_google_meet = $8, meeting_link = $9, participants = $10, updated_at = CURRENT_TIMESTAMP
      WHERE id = $11
    `;

    await pool.query(updateQuery, [
      title, date, time, endTime, type, status, description,
      hasGoogleMeet, meetingLink, JSON.stringify(participants || []), id
    ]);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/events/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM events WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Content Management System (Settings & Workflows)
app.get('/api/settings', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM company_settings WHERE id = 'global_config'");
    if (result.rows.length > 0) {
      res.json([result.rows[0].data]);
    } else {
      res.json([]);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/settings', authenticateToken, async (req, res) => {
  try {
    const settings = req.body;
    await pool.query(
      `INSERT INTO company_settings (id, data, updated_at) 
       VALUES ('global_config', $1::jsonb, CURRENT_TIMESTAMP) 
       ON CONFLICT (id) DO UPDATE SET data = $1::jsonb, updated_at = CURRENT_TIMESTAMP`,
      [JSON.stringify(settings)]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/workflows', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM workflows');
    res.json(result.rows.map(row => row.data));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/workflows', authenticateToken, async (req, res) => {
  try {
    const workflow = req.body;
    const { id } = workflow;
    if (!id) return res.status(400).json({ error: 'Missing workflow ID' });

    await pool.query(
      `INSERT INTO workflows (id, data, updated_at) 
       VALUES ($1, $2, CURRENT_TIMESTAMP) 
       ON CONFLICT (id) DO UPDATE SET data = $2, updated_at = CURRENT_TIMESTAMP`,
      [id, JSON.stringify(workflow)]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ═════════════════════════════════════════════════════════════════════════════
// PLAID INTEGRATION — Matches Plaid Postman Auth Collection
// ═════════════════════════════════════════════════════════════════════════════
// Docs:    https://plaid.com/docs/api/
// SDK:     https://github.com/plaid/plaid-node
// Postman: https://github.com/plaid/plaid-postman
//
// Full Auth flow (matches Postman collection steps):
//  [Sandbox] POST /sandbox/public_token/create → public_token (skip Link UI)
//  Step 1.   POST /item/public_token/exchange  → access_token + item_id
//  Step 2.   POST /auth/get                    → accounts[] + numbers.ach[]
//  Step 3.   (optional) POST /auth/verify      → verify raw account/routing
//
// Required env vars (.env):
//   PLAID_CLIENT_ID    — dashboard.plaid.com → Developers → Keys
//   PLAID_SECRET       — Sandbox / Development / Production secret
//   PLAID_ENV          — "sandbox" | "development" | "production"
//   PLAID_PRODUCTS     — "auth" (comma-separated, e.g. "auth,identity")
//   PLAID_COUNTRY_CODES — "US"
//   PLAID_WEBHOOK_URL  — Your HTTPS endpoint (optional)
// ═════════════════════════════════════════════════════════════════════════════

let plaidClient = null;
let PlaidEnvs = null;   // PlaidEnvironments — cached after first require

const initPlaid = () => {
  const { PLAID_CLIENT_ID, PLAID_SECRET, PLAID_ENV } = process.env;
  if (!PLAID_CLIENT_ID || PLAID_CLIENT_ID === 'your_plaid_client_id_here') {
    console.warn('[Plaid] ⚠️  PLAID_CLIENT_ID not set — endpoints will return 503 until configured.');
    return;
  }
  try {
    const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');
    PlaidEnvs = PlaidEnvironments;

    const envMap = {
      sandbox: PlaidEnvironments.sandbox,
      development: PlaidEnvironments.development,
      production: PlaidEnvironments.production,
    };

    const configuration = new Configuration({
      basePath: envMap[PLAID_ENV] || PlaidEnvironments.sandbox,
      baseOptions: {
        headers: {
          'PLAID-CLIENT-ID': PLAID_CLIENT_ID,
          'PLAID-SECRET': PLAID_SECRET,
        },
      },
    });

    plaidClient = new PlaidApi(configuration);
    console.log(`[Plaid] ✅ SDK ready — env: ${PLAID_ENV || 'sandbox'}`);
  } catch (err) {
    console.error('[Plaid] Init failed:', err.message);
  }
};

initPlaid();

// ── DB Tables (idempotent — safe on every boot) ────────────────────────────────
const migratePlaidTables = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS plaid_items (
        id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        item_id          VARCHAR(255) UNIQUE NOT NULL,
        access_token     TEXT NOT NULL,
        institution_id   VARCHAR(100),
        institution_name VARCHAR(255),
        auth_method      VARCHAR(50),
        created_by       VARCHAR(255),
        client_name      VARCHAR(255),
        created_at       TIMESTAMPTZ DEFAULT NOW(),
        updated_at       TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS bank_verifications (
        id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        plaid_item_id             UUID REFERENCES plaid_items(id),
        client_name               VARCHAR(255) NOT NULL,
        client_email              VARCHAR(255),
        client_phone              VARCHAR(50),
        institution_name          VARCHAR(255) NOT NULL DEFAULT 'Pending',
        account_name              VARCHAR(255),
        account_mask              VARCHAR(10)  NOT NULL DEFAULT '????',
        account_type              VARCHAR(30),
        account_holder_type       VARCHAR(20),
        routing_number            VARCHAR(20),
        wire_routing              VARCHAR(20),
        plaid_account_id          VARCHAR(255),
        status                    VARCHAR(25) NOT NULL DEFAULT 'pending',
        verification_method       VARCHAR(10) NOT NULL DEFAULT 'plaid',
        auth_method               VARCHAR(50),
        plaid_verification_status VARCHAR(50),
        name_match                BOOLEAN DEFAULT FALSE,
        name_match_score          INT,
        account_active            BOOLEAN DEFAULT FALSE,
        has_numbers_match         BOOLEAN,
        is_numbers_match_verified BOOLEAN,
        has_prior_returns         BOOLEAN,
        account_num_format        VARCHAR(20),
        draft_risk                VARCHAR(10) DEFAULT 'medium',
        balance_available         NUMERIC(15,2),
        balance_current           NUMERIC(15,2),
        balance_currency          VARCHAR(10) DEFAULT 'USD',
        transactions_7d           JSONB,
        statement_summary         JSONB,
        data_captured_at          TIMESTAMPTZ,
        notification_method       VARCHAR(10),
        notification_sent_at      TIMESTAMPTZ,
        notification_message      TEXT,
        verified_at               TIMESTAMPTZ,
        verified_by               VARCHAR(255),
        sent_by                   VARCHAR(255),
        notes                     TEXT,
        created_at                TIMESTAMPTZ DEFAULT NOW(),
        updated_at                TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS verification_links (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        token           VARCHAR(128) UNIQUE NOT NULL,
        verification_id UUID REFERENCES bank_verifications(id) ON DELETE CASCADE,
        client_name     VARCHAR(255),
        client_email    VARCHAR(255),
        client_phone    VARCHAR(50),
        custom_message  TEXT,
        sent_via        VARCHAR(10),
        sent_at         TIMESTAMPTZ DEFAULT NOW(),
        expires_at      TIMESTAMPTZ NOT NULL,
        opened_at       TIMESTAMPTZ,
        completed_at    TIMESTAMPTZ,
        created_by      VARCHAR(255),
        is_used         BOOLEAN DEFAULT FALSE
      )
    `);

    // Safe column additions for existing deployments
    const safeAdd = async (col, def) => {
      await pool.query(`ALTER TABLE bank_verifications ADD COLUMN IF NOT EXISTS ${col} ${def}`).catch(() => { });
    };
    await safeAdd('balance_available', 'NUMERIC(15,2)');
    await safeAdd('balance_current', 'NUMERIC(15,2)');
    await safeAdd('balance_currency', "VARCHAR(10) DEFAULT 'USD'");
    await safeAdd('transactions_7d', 'JSONB');
    await safeAdd('statement_summary', 'JSONB');
    await safeAdd('data_captured_at', 'TIMESTAMPTZ');
    await safeAdd('notification_method', 'VARCHAR(10)');
    await safeAdd('notification_sent_at', 'TIMESTAMPTZ');
    await safeAdd('notification_message', 'TEXT');
    await safeAdd('sent_by', 'VARCHAR(255)');

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_bv_client   ON bank_verifications(client_name);
      CREATE INDEX IF NOT EXISTS idx_bv_status   ON bank_verifications(status);
      CREATE INDEX IF NOT EXISTS idx_pi_item_id  ON plaid_items(item_id);
      CREATE INDEX IF NOT EXISTS idx_vl_token    ON verification_links(token);
    `).catch(() => { });

    console.log('[DB] ✅ Plaid tables ready');
  } catch (err) {
    console.warn('[DB] Plaid migration warning:', err.message);
  }
};
migratePlaidTables();

// ════════════════════════════════════════════════════════════════════════════════
// ENDPOINT 2 — Create Link Token
// Matches Postman: Link → "Create Link Token"
// POST /link/token/create
// https://plaid.com/docs/api/link/#linktokencreate
// ════════════════════════════════════════════════════════════════════════════════
app.post('/api/plaid/create-link-token', authenticateToken, async (req, res) => {
  if (!requirePlaid(res)) return;

  const { clientName, userId } = req.body;
  if (!clientName) return res.status(400).json({ error: 'clientName is required' });

  try {
    const products = (process.env.PLAID_PRODUCTS || 'auth').split(',').map(s => s.trim());
    const countryCodes = (process.env.PLAID_COUNTRY_CODES || 'US').split(',').map(s => s.trim());

    const linkRequest = {
      user: { client_user_id: userId || req.user?.id || 'nhfg-user' },
      client_name: 'New Holland Financial Group',
      products,
      country_codes: countryCodes,
      language: 'en',
      ...(process.env.PLAID_WEBHOOK_URL ? { webhook: process.env.PLAID_WEBHOOK_URL } : {}),
    };

    const response = await plaidClient.linkTokenCreate(linkRequest);
    console.log(`[Plaid] link_token created — expires: ${response.data.expiration} `);

    res.json({
      link_token: response.data.link_token,
      expiration: response.data.expiration,
      request_id: response.data.request_id,
    });
  } catch (err) {
    const pd = err.response?.data;
    console.error('[Plaid] linkTokenCreate error:', pd || err.message);
    res.status(500).json({ error: pd?.error_message || err.message, error_code: pd?.error_code });
  }
});


// ════════════════════════════════════════════════════════════════════════════════
// ENDPOINT 3 — Exchange Public Token + Auth Get
// Matches Postman flow:
//   Items → Item Creation → "Exchange Token"  (/item/public_token/exchange)
//   Auth  →                 "Retrieve Auth"   (/auth/get)
//
// This is the primary endpoint called after Plaid Link onSuccess callback.
// Returns only SAFE metadata to the frontend.
// access_token is NEVER returned — only stored in plaid_items table.
// ════════════════════════════════════════════════════════════════════════════════
app.post('/api/plaid/exchange-token', authenticateToken, async (req, res) => {
  if (!requirePlaid(res)) return;

  const {
    publicToken,
    institutionId,
    institutionName,
    clientName,
    clientEmail,
    clientPhone,
    accountId,        // Plaid account_id returned in onSuccess metadata.accounts[0].id
    accounts: metaAccounts = [], // Full accounts array from Plaid Link onSuccess metadata
  } = req.body;

  if (!publicToken) return res.status(400).json({ error: 'publicToken is required' });
  if (!clientName) return res.status(400).json({ error: 'clientName is required' });

  try {
    // ── Step A: /item/public_token/exchange ─────────────────────────────────────
    const exchangeRes = await plaidClient.itemPublicTokenExchange({ public_token: publicToken });
    const { access_token, item_id, request_id: exchangeRequestId } = exchangeRes.data;
    console.log(`[Plaid] Token exchanged — item_id: ${item_id} `);

    // ── Step B: /item/get — resolve institution_name from Plaid if not passed ───
    let resolvedInstitutionName = institutionName || null;
    let authMethodFromItem = null;
    try {
      const itemRes = await plaidClient.itemGet({ access_token });
      const itemData = itemRes.data.item;
      resolvedInstitutionName = resolvedInstitutionName || itemData.institution_name || null;
      authMethodFromItem = itemData.auth_method || null;
      // Possible auth_method values from Plaid docs:
      // INSTANT_AUTH | INSTANT_MATCH | AUTOMATED_MICRODEPOSITS | SAME_DAY_MICRODEPOSITS
      // INSTANT_MICRODEPOSITS | DATABASE_MATCH | DATABASE_INSIGHTS
    } catch (_) { /* non-fatal */ }

    // ── Step C: /auth/get ───────────────────────────────────────────────────────
    // Full Plaid Auth response shape (from Plaid Postman + docs):
    // {
    //   accounts: [{ account_id, balances, mask, name, official_name, subtype, type,
    //                verification_status, verification_insights: {
    //                  name_match_score, network_status: { has_numbers_match, is_numbers_match_verified },
    //                  previous_returns: { has_previous_administrative_return },
    //                  account_number_format  // "valid"|"invalid"|"unknown"
    //                }, holder_category }],
    //   numbers: {
    //     ach: [{ account_id, account, routing, wire_routing, is_tokenized_account_number }],
    //     eft: [...], international: [...], bacs: [...]
    //   },
    //   item: { item_id, institution_id, institution_name, auth_method, ... }
    // }
    const authRes = await plaidClient.authGet({ access_token });
    const authData = authRes.data;

    const plaidAccounts = authData.accounts || [];
    const plaidNumbers = authData.numbers || {};
    const achNumbers = plaidNumbers.ach || [];

    // Prefer the account the user explicitly selected in Link, then fallback to checking
    const targetAcct = plaidAccounts.find(a => a.account_id === accountId)
      || plaidAccounts.find(a => a.subtype === 'checking')
      || plaidAccounts.find(a => a.type === 'depository')
      || plaidAccounts[0];

    // Match ACH numbers to target account
    const achEntry = achNumbers.find(n => n.account_id === targetAcct?.account_id)
      || achNumbers[0]
      || {};

    // Pull verification_insights (available when identity product included or Database Auth)
    const insights = targetAcct?.verification_insights || {};
    const networkStatus = insights.network_status || {};
    const prevReturns = insights.previous_returns || {};
    const nameMatchScore = insights.name_match_score ?? null;
    const hasNumbersMatch = networkStatus.has_numbers_match ?? null;
    const isNumbersVerified = networkStatus.is_numbers_match_verified ?? null;
    const hasPriorReturns = prevReturns.has_previous_administrative_return ?? null;
    const accountNumFormat = insights.account_number_format ?? null;
    const plaidVerifStatus = targetAcct?.verification_status ?? null;
    const holderCategory = targetAcct?.holder_category ?? null;

    const routingNumber = achEntry.routing || null;
    const wireRouting = achEntry.wire_routing || null;
    const isActive = (targetAcct?.balances?.current ?? null) !== null;
    const nameMatch = nameMatchScore != null ? nameMatchScore >= 70 : true;

    const draftRisk = computeDraftRisk(insights, plaidVerifStatus, hasPriorReturns, authMethodFromItem);

    // Map Plaid verification_status → our internal status
    // automatically_verified → verified, pending_automatic_verification → pending, etc.
    const statusMap = {
      automatically_verified: 'verified',
      manually_verified: 'verified',
      database_matched: 'verified',
      database_insights_pass: 'verified',
      database_insights_pass_with_caution: 'verified',
      pending_automatic_verification: 'micro_deposit',
      pending_manual_verification: 'micro_deposit',
      verification_failed: 'failed',
      verification_expired: 'failed',
      database_insights_fail: 'failed',
    };
    const internalStatus = statusMap[plaidVerifStatus]
      || (authMethodFromItem === 'INSTANT_AUTH' ? 'verified' : 'pending');

    // ── Step D: Store plaid_item (access_token NEVER leaves this table) ──────────
    const itemUpsert = await pool.query(
      `INSERT INTO plaid_items
  (item_id, access_token, institution_id, institution_name, auth_method, created_by, client_name)
VALUES($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT(item_id) DO UPDATE
         SET access_token = EXCLUDED.access_token,
  institution_name = COALESCE(EXCLUDED.institution_name, plaid_items.institution_name),
  auth_method = EXCLUDED.auth_method,
  updated_at = NOW()
       RETURNING id`,
      [item_id, access_token, institutionId || null, resolvedInstitutionName,
        authMethodFromItem, req.user?.id || null, clientName]
    );
    const plaidItemDbId = itemUpsert.rows[0].id;

    // ── Step E: Insert bank_verifications record ─────────────────────────────────
    const verifyInsert = await pool.query(
      `INSERT INTO bank_verifications(
    plaid_item_id, client_name, client_email, client_phone,
    institution_name, account_name, account_mask, account_type, account_holder_type,
    routing_number, wire_routing, plaid_account_id,
    status, verification_method, auth_method, plaid_verification_status,
    name_match, name_match_score, account_active,
    has_numbers_match, is_numbers_match_verified, has_prior_returns,
    account_num_format, draft_risk,
    verified_at, verified_by
  ) VALUES(
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12,
    $13:: text, 'plaid', $14, $15, $16, $17, $18, $19, $20, $21, $22, $23,
    CASE WHEN $13:: text = 'verified' THEN NOW() ELSE NULL END,
    CASE WHEN $13:: text = 'verified' THEN $24 ELSE NULL END
  ) RETURNING * `,
      [
        plaidItemDbId, clientName, clientEmail || null, clientPhone || null,
        resolvedInstitutionName || targetAcct?.name || null,
        targetAcct?.official_name || targetAcct?.name || null,
        targetAcct?.mask || null,
        targetAcct?.subtype || null,
        holderCategory || null,
        routingNumber, wireRouting,
        targetAcct?.account_id || null,
        internalStatus,
        authMethodFromItem, plaidVerifStatus,
        nameMatch, nameMatchScore, isActive,
        hasNumbersMatch, isNumbersVerified, hasPriorReturns,
        accountNumFormat, draftRisk,
        req.user?.id || null,
      ]
    );

    const savedRecord = verifyInsert.rows[0];

    // ── Return SAFE metadata only (no access_token, no full account numbers) ─────
    res.json({
      success: true,
      verificationId: savedRecord.id,
      // Account metadata (safe to show)
      accountMask: targetAcct?.mask || '****',
      accountType: targetAcct?.subtype || 'checking',
      accountName: targetAcct?.official_name || targetAcct?.name || null,
      institutionName: resolvedInstitutionName || null,
      // Routing shown partially masked — full value is in DB only
      routingNumberMasked: routingNumber ? `**** ${routingNumber.slice(-4)} ` : null,
      wireRoutingMasked: wireRouting ? `**** ${wireRouting.slice(-4)} ` : null,
      // Risk & verification signals
      status: internalStatus,
      authMethod: authMethodFromItem,
      plaidVerifStatus,
      nameMatch,
      nameMatchScore,
      accountActive: isActive,
      hasNumbersMatch,
      isNumbersVerified,
      hasPriorReturns,
      accountNumFormat,
      draftRisk,
      holderCategory,
      // Audit
      verifiedAt: savedRecord.verified_at,
      createdAt: savedRecord.created_at,
      requestId: exchangeRequestId,
    });

  } catch (err) {
    const pd = err.response?.data;
    console.error('[Plaid] exchange-token error:', pd || err.message);

    // Plaid error shape: { error_type, error_code, error_message, display_message, request_id }
    res.status(500).json({
      error: pd?.error_message || err.message,
      error_type: pd?.error_type || null,
      error_code: pd?.error_code || null,
      display: pd?.display_message || null,
      request_id: pd?.request_id || null,
    });
  }
});


// ════════════════════════════════════════════════════════════════════════════════
// ENDPOINT 4 — Re-fetch Auth for an existing Item
// Matches Postman: Auth → "Retrieve Auth Data" (/auth/get)
// Called when DEFAULT_UPDATE webhook fires and you need fresh routing numbers.
// ════════════════════════════════════════════════════════════════════════════════
app.post('/api/plaid/auth/refresh/:verificationId', authenticateToken, async (req, res) => {
  if (!requirePlaid(res)) return;
  const { verificationId } = req.params;

  try {
    // Fetch plaid_item via the verification record
    const bvRow = await pool.query(
      `SELECT pi.access_token, pi.item_id, bv.plaid_account_id
       FROM bank_verifications bv
       JOIN plaid_items pi ON pi.id = bv.plaid_item_id
       WHERE bv.id = $1`, [verificationId]
    );
    if (!bvRow.rows.length) return res.status(404).json({ error: 'Verification not found' });

    const { access_token, plaid_account_id } = bvRow.rows[0];

    const authRes = await plaidClient.authGet({ access_token });
    const achNumbers = authRes.data.numbers?.ach || [];
    const accts = authRes.data.accounts || [];

    const targetAcct = accts.find(a => a.account_id === plaid_account_id) || accts[0];
    const achEntry = achNumbers.find(n => n.account_id === targetAcct?.account_id) || achNumbers[0] || {};

    const routingNumber = achEntry.routing || null;
    const wireRouting = achEntry.wire_routing || null;
    const insights = targetAcct?.verification_insights || {};

    await pool.query(
      `UPDATE bank_verifications
       SET routing_number = COALESCE($1, routing_number),
  wire_routing = COALESCE($2, wire_routing),
  account_active = $3,
  updated_at = NOW()
       WHERE id = $4`,
      [routingNumber, wireRouting, (targetAcct?.balances?.current ?? null) !== null, verificationId]
    );

    res.json({
      success: true,
      routingNumberMasked: routingNumber ? `**** ${routingNumber.slice(-4)} ` : null,
      wireRoutingMasked: wireRouting ? `**** ${wireRouting.slice(-4)} ` : null,
      accountNumFormat: insights.account_number_format || null,
    });
  } catch (err) {
    const pd = err.response?.data;
    console.error('[Plaid] auth refresh error:', pd || err.message);
    res.status(500).json({ error: pd?.error_message || err.message });
  }
});


// ════════════════════════════════════════════════════════════════════════════════
// ENDPOINT 5 — List Verifications (with search, status filter, pagination)
// ════════════════════════════════════════════════════════════════════════════════
app.get('/api/plaid/verifications', authenticateToken, async (req, res) => {
  try {
    const { search, status, limit = 100, offset = 0 } = req.query;
    const params = [];
    let where = 'WHERE 1=1';

    if (search) {
      params.push(`% ${search}% `);
      where += ` AND(bv.client_name ILIKE $${params.length} OR bv.institution_name ILIKE $${params.length} OR bv.account_mask ILIKE $${params.length})`;
    }
    if (status && status !== 'all') {
      params.push(status);
      where += ` AND bv.status = $${params.length} `;
    }

    const query = `
SELECT
bv.id, bv.client_name, bv.client_email, bv.client_phone,
  bv.institution_name, bv.account_name, bv.account_mask, bv.account_type,
  bv.account_holder_type, bv.routing_number, bv.wire_routing,
  bv.status, bv.verification_method, bv.auth_method, bv.plaid_verification_status,
  bv.name_match, bv.name_match_score, bv.account_active,
  bv.has_numbers_match, bv.is_numbers_match_verified,
  bv.has_prior_returns, bv.account_num_format, bv.draft_risk,
  bv.verified_at, bv.verified_by, bv.notes, bv.created_at
      FROM bank_verifications bv ${where}
      ORDER BY bv.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
`;
    params.push(parseInt(limit, 10), parseInt(offset, 10));

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('[Plaid] list verifications error:', err.message);
    res.status(500).json({ error: err.message });
  }
});


// ════════════════════════════════════════════════════════════════════════════════
// ENDPOINT 6 — Update Status / Notes
// ════════════════════════════════════════════════════════════════════════════════
app.patch('/api/plaid/verifications/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;
  const allowed = ['pending', 'verified', 'failed', 'micro_deposit'];

  if (!allowed.includes(status))
    return res.status(400).json({ error: `status must be one of: ${allowed.join(', ')} ` });

  try {
    const result = await pool.query(
      `UPDATE bank_verifications
       SET status = $1::text,
           notes = COALESCE($2, notes),
           verified_at = CASE WHEN $1::text = 'verified' THEN NOW()         ELSE verified_at END,
           verified_by = CASE WHEN $1::text = 'verified' THEN $3::VARCHAR    ELSE verified_by END,
           updated_at = NOW()
       WHERE id = $4::uuid
       RETURNING * `,
      [status, notes || null, req.user?.id || null, id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Verification not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ════════════════════════════════════════════════════════════════════════════════
/**
 * Validates a 9-digit ABA routing number using the mod-10 checksum algorithm.
 * Formula: 3(d1+d4+d7) + 7(d2+d5+d8) + (d3+d6+d9) mod 10 = 0
 */
function validateABA(n) {
  if (!n || n.length !== 9 || !/^\d{9}$/.test(n)) return false;
  const d = n.split('').map(Number);
  const sum = 3 * (d[0] + d[3] + d[6]) +
    7 * (d[1] + d[4] + d[7]) +
    1 * (d[2] + d[5] + d[8]);
  return sum % 10 === 0;
}

// ENDPOINT 7 — Manual ACH Entry
// Validates routing # via ABA mod-10 checksum (same algorithm Plaid uses internally)
// Only stores last 4 digits (mask) of account number — full number never persisted
// ════════════════════════════════════════════════════════════════════════════════
app.post('/api/plaid/verifications/manual', authenticateToken, async (req, res) => {
  const {
    clientName, clientEmail, clientPhone,
    institutionName, accountMask, accountType,
    routingNumber, notes,
  } = req.body;

  if (!clientName || !institutionName || !accountMask)
    return res.status(400).json({ error: 'clientName, institutionName, accountMask are required' });

  if (!routingNumber)
    return res.status(400).json({ error: 'routingNumber is required for manual ACH verification' });

  if (!validateABA(routingNumber))
    return res.status(422).json({
      error: 'Invalid routing number',
      detail: 'Must be 9 digits and pass the ABA mod-10 checksum.',
      hint: 'Example valid sandbox routing: 021000021 (JPMorgan Chase)',
    });

  try {
    const result = await pool.query(
      `INSERT INTO bank_verifications(
  client_name, client_email, client_phone, institution_name,
  account_mask, account_type, routing_number,
  status, verification_method, notes, verified_by
) VALUES($1, $2, $3, $4, $5, $6, $7, 'micro_deposit', 'manual', $8, $9)
RETURNING * `,
      [clientName, clientEmail || null, clientPhone || null, institutionName,
        accountMask, accountType || 'checking', routingNumber,
        notes || null, req.user?.id || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ════════════════════════════════════════════════════════════════════════════════
// ENDPOINT 7.1 — Edit Verification Info
// ════════════════════════════════════════════════════════════════════════════════
app.patch('/api/plaid/verifications/:id/info', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { client_name, client_email, client_phone, institution_name, routing_number, notes } = req.body;

  try {
    const result = await pool.query(
      `UPDATE bank_verifications
       SET 
          client_name = COALESCE($1, client_name),
          client_email = COALESCE($2, client_email),
          client_phone = COALESCE($3, client_phone),
          institution_name = COALESCE($4, institution_name),
          routing_number = COALESCE($5, routing_number),
          notes = COALESCE($6, notes),
          updated_at = NOW()
       WHERE id = $7::uuid
       RETURNING *`,
      [client_name, client_email || null, client_phone || null, institution_name || null, routing_number || null, notes || null, id]
    );

    if (!result.rows.length) return res.status(404).json({ error: 'Verification not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ════════════════════════════════════════════════════════════════════════════════
// ENDPOINT 7.2 — Delete Verification
// ════════════════════════════════════════════════════════════════════════════════
app.delete('/api/plaid/verifications/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM bank_verifications WHERE id = $1::uuid RETURNING *', [id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Verification not found' });
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ════════════════════════════════════════════════════════════════════════════════
// ENDPOINT 8 — Plaid Webhook Receiver
// Matches Plaid Auth webhooks from docs + Postman:
//   AUTH / AUTOMATICALLY_VERIFIED
//   AUTH / VERIFICATION_EXPIRED
//   AUTH / DEFAULT_UPDATE          (routing numbers changed — re-pull /auth/get)
//   ITEM / ERROR
// POST /api/plaid/webhook
// Register this URL at: dashboard.plaid.com → Team → Webhooks
// ════════════════════════════════════════════════════════════════════════════════
app.post('/api/plaid/webhook', async (req, res) => {
  // Always ack immediately — Plaid retries on any non-2xx
  res.status(200).json({ received: true });

  const { webhook_type, webhook_code, item_id, account_id, error,
    account_ids_with_updated_auth } = req.body;

  console.log(`[Plaid Webhook] ${webhook_type}/${webhook_code} — item: ${item_id}`);

  try {
    const itemRow = await pool.query(
      'SELECT id, access_token FROM plaid_items WHERE item_id = $1', [item_id]
    );
    if (!itemRow.rows.length) return;  // Unknown item — ignore
    const { id: plaidItemDbId, access_token } = itemRow.rows[0];

    // AUTH / AUTOMATICALLY_VERIFIED — micro-deposit confirmed, mark verified
    if (webhook_type === 'AUTH' && webhook_code === 'AUTOMATICALLY_VERIFIED') {
      await pool.query(
        `UPDATE bank_verifications
         SET status = 'verified', verified_at = NOW(),
             plaid_verification_status = 'automatically_verified', updated_at = NOW()
         WHERE plaid_item_id = $1
           AND ($2::VARCHAR IS NULL OR plaid_account_id = $2)`,
        [plaidItemDbId, account_id || null]
      );
      console.log(`[Plaid Webhook] ✅ Auto-verified — item: ${item_id}`);
    }

    // AUTH / VERIFICATION_EXPIRED — micro-deposit window closed
    if (webhook_type === 'AUTH' && webhook_code === 'VERIFICATION_EXPIRED') {
      await pool.query(
        `UPDATE bank_verifications
         SET status = 'failed', notes = 'Micro-deposit verification window expired.',
             plaid_verification_status = 'verification_expired', updated_at = NOW()
         WHERE plaid_item_id = $1
           AND ($2::VARCHAR IS NULL OR plaid_account_id = $2)`,
        [plaidItemDbId, account_id || null]
      );
      console.log(`[Plaid Webhook] ⏰ Verification expired — item: ${item_id}`);
    }

    // AUTH / DEFAULT_UPDATE — routing numbers changed; re-fetch auth immediately
    if (webhook_type === 'AUTH' && webhook_code === 'DEFAULT_UPDATE') {
      const changedAccountIds = Object.keys(account_ids_with_updated_auth || {});
      console.log(`[Plaid Webhook] ⚠️  DEFAULT_UPDATE — ${changedAccountIds.length} accts changed`);

      if (plaidClient && access_token) {
        try {
          const authRes = await plaidClient.authGet({ access_token });
          const achNumbers = authRes.data.numbers?.ach || [];

          for (const acId of changedAccountIds) {
            const ach = achNumbers.find(n => n.account_id === acId);
            if (!ach) continue;
            await pool.query(
              `UPDATE bank_verifications
               SET routing_number = $1, wire_routing = $2,
                   notes = 'Routing number updated via AUTH/DEFAULT_UPDATE webhook',
                   updated_at = NOW()
               WHERE plaid_item_id = $3 AND plaid_account_id = $4`,
              [ach.routing || null, ach.wire_routing || null, plaidItemDbId, acId]
            );
          }
          console.log(`[Plaid Webhook] Routing numbers refreshed for item: ${item_id}`);
        } catch (authErr) {
          console.error('[Plaid Webhook] Auth re-fetch failed:', authErr.message);
        }
      }
    }

    // ITEM / ERROR — item needs re-authentication
    if (webhook_type === 'ITEM' && webhook_code === 'ERROR' && error) {
      await pool.query(
        `UPDATE bank_verifications
         SET status = 'failed',
             notes  = $1,
             updated_at = NOW()
         WHERE plaid_item_id = $2`,
        [`Plaid Item Error [${error.error_code}]: ${error.error_message}`, plaidItemDbId]
      );
      console.log(`[Plaid Webhook] ❌ Item error — ${error.error_code}: ${error.error_message}`);
    }
  } catch (dbErr) {
    console.error('[Plaid Webhook] DB error:', dbErr.message);
  }
});



// ════════════════════════════════════════════════════════════════════════════════
// ADDITIONAL DB COLUMNS & verification_links TABLE (idempotent)
// ════════════════════════════════════════════════════════════════════════════════
const migrateClientLinkTables = async () => {
  try {
    // Add new columns to bank_verifications
    const safeAdd = async (col, def) => {
      await pool.query(
        `ALTER TABLE bank_verifications ADD COLUMN IF NOT EXISTS ${col} ${def}`
      ).catch(() => { });
    };
    await safeAdd('balance_available', 'NUMERIC(15,2)');
    await safeAdd('balance_current', 'NUMERIC(15,2)');
    await safeAdd('balance_currency', "VARCHAR(10) DEFAULT 'USD'");
    await safeAdd('transactions_7d', 'JSONB');
    await safeAdd('statement_summary', 'JSONB');
    await safeAdd('data_captured_at', 'TIMESTAMPTZ');
    await safeAdd('notification_method', 'VARCHAR(10)');
    await safeAdd('notification_sent_at', 'TIMESTAMPTZ');
    await safeAdd('notification_message', 'TEXT');
    await safeAdd('sent_by', 'VARCHAR(255)');

    // Secure client verification link table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS verification_links (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        token           VARCHAR(128) UNIQUE NOT NULL,
        verification_id UUID REFERENCES bank_verifications(id) ON DELETE CASCADE,
        client_name     VARCHAR(255),
        client_email    VARCHAR(255),
        client_phone    VARCHAR(50),
        custom_message  TEXT,
        sent_via        VARCHAR(10),
        sent_at         TIMESTAMPTZ DEFAULT NOW(),
        expires_at      TIMESTAMPTZ NOT NULL,
        opened_at       TIMESTAMPTZ,
        completed_at    TIMESTAMPTZ,
        created_by      VARCHAR(255),
        is_used         BOOLEAN DEFAULT FALSE
      )
    `);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_vl_token ON verification_links(token)`).catch(() => { });
    console.log('[DB] ✅ Client link tables ready');
  } catch (err) {
    console.warn('[DB] Client link migration warning:', err.message);
  }
};
migrateClientLinkTables();

// ── Notification helpers ───────────────────────────────────────────────────────

// Nodemailer — lazy-init so server boots even without SMTP config
const sendEmail = async ({ to, subject, html }) => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE, EMAIL_FROM } = process.env;
  if (!SMTP_USER || !SMTP_PASS) {
    console.log(`[Email] No SMTP config — would send to: ${to}\nSubject: ${subject}`);
    return { simulated: true };
  }
  const nodemailer = require('nodemailer');
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(SMTP_PORT || '587', 10),
    secure: SMTP_SECURE === 'true',
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return transporter.sendMail({ from: EMAIL_FROM || SMTP_USER, to, subject, html });
};

// Twilio SMS — lazy-init
const sendSMS = async ({ to, body }) => {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER } = process.env;
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    console.log(`[SMS] No Twilio config — would send to: ${to}\nBody: ${body}`);
    return { simulated: true };
  }
  const twilio = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  return twilio.messages.create({ body, from: TWILIO_FROM_NUMBER, to });
};

// Build the styled verification email HTML
const buildVerificationEmail = (clientName, verifyUrl, customMessage, advisorName) => `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.10)">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#1e3a5f 0%,#2563eb 100%);padding:32px 36px">
      <p style="color:rgba(255,255,255,.7);font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0 0 6px">New Holland Financial Group</p>
      <h1 style="color:#fff;font-size:22px;font-weight:700;margin:0">Bank Account Verification</h1>
    </div>
    <!-- Body -->
    <div style="padding:36px">
      <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 16px">Hi <strong>${clientName}</strong>,</p>
      <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 24px">
        ${customMessage || `${advisorName || 'Your advisor'} at New Holland Financial Group has requested a quick bank verification to ensure your name matches your bank account on file. This helps us prevent unauthorized ACH drafts and protect your account.`}
      </p>
      <!-- Notice box -->
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:16px 20px;margin:0 0 28px">
        <p style="color:#166534;font-size:13px;font-weight:600;margin:0 0 8px">✅ Safe &amp; Secure</p>
        <ul style="color:#15803d;font-size:13px;line-height:1.8;margin:0;padding-left:18px">
          <li>You will <strong>NOT be charged</strong> for this verification</li>
          <li>Your banking credentials are never seen by NHFG</li>
          <li>Secured by Plaid — trusted by millions of Americans</li>
          <li>This link expires in <strong>48 hours</strong></li>
        </ul>
      </div>
      <!-- CTA -->
      <div style="text-align:center;margin:0 0 28px">
        <a href="${verifyUrl}" style="display:inline-block;background:linear-gradient(135deg,#1e3a5f,#2563eb);color:#fff;font-size:16px;font-weight:700;padding:16px 40px;border-radius:50px;text-decoration:none;letter-spacing:.5px">
          Verify My Bank Account →
        </a>
      </div>
      <p style="color:#9ca3af;font-size:12px;text-align:center;margin:0">
        Or copy this link: <a href="${verifyUrl}" style="color:#2563eb">${verifyUrl}</a>
      </p>
    </div>
    <!-- Footer -->
    <div style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 36px;text-align:center">
      <p style="color:#9ca3af;font-size:11px;margin:0">New Holland Financial Group · This email was sent by your advisor. If you did not expect this, please ignore it or call us.</p>
    </div>
  </div>
</body>
</html>`;


// ════════════════════════════════════════════════════════════════════════════════
// ENDPOINT 9 — Advisor sends verification link to client (email / SMS / both)
// POST /api/plaid/send-link
// ════════════════════════════════════════════════════════════════════════════════
app.post('/api/plaid/send-link', authenticateToken, async (req, res) => {
  const {
    clientName, clientEmail, clientPhone,
    sendVia = 'email',        // 'email' | 'sms' | 'both'
    customMessage,
  } = req.body;

  if (!clientName) return res.status(400).json({ error: 'clientName is required' });
  if (sendVia !== 'sms' && !clientEmail) return res.status(400).json({ error: 'clientEmail is required for email delivery' });
  if (sendVia !== 'email' && !clientPhone) return res.status(400).json({ error: 'clientPhone is required for SMS delivery' });

  try {
    // 1. Create a pending bank_verifications record
    const bvResult = await pool.query(
      `INSERT INTO bank_verifications
         (client_name, client_email, client_phone, institution_name, account_mask,
          status, verification_method, notification_method, notification_message, sent_by)
       VALUES ($1, $2, $3, 'Pending', '????', 'pending', 'plaid', $4, $5, $6)
       RETURNING id`,
      [clientName, clientEmail || null, clientPhone || null,
        sendVia, customMessage || null, req.user?.id || null]
    );
    const verificationId = bvResult.rows[0].id;

    // 2. Create a secure random token (48 hours expiry)
    const token = require('crypto').randomBytes(48).toString('hex');
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

    await pool.query(
      `INSERT INTO verification_links
         (token, verification_id, client_name, client_email, client_phone,
          custom_message, sent_via, expires_at, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [token, verificationId, clientName, clientEmail || null, clientPhone || null,
        customMessage || null, sendVia, expiresAt, req.user?.id || null]
    );

    const appUrl = process.env.APP_URL || 'http://localhost:5173';
    const verifyUrl = `${appUrl}/verify/${token}`;
    const advisorName = req.user?.name || req.user?.email || 'Your advisor';

    const results = { email: null, sms: null, verificationId, verifyUrl };

    // 3. Send via email
    if (sendVia === 'email' || sendVia === 'both') {
      results.email = await sendEmail({
        to: clientEmail,
        subject: `Action Required: Verify Your Bank Account — NHFG`,
        html: buildVerificationEmail(clientName, verifyUrl, customMessage, advisorName),
      });
    }

    // 4. Send via SMS
    if (sendVia === 'sms' || sendVia === 'both') {
      const smsBody = `Hi ${clientName}, NHFG needs to verify your bank account to prevent unauthorized drafts. Click here to complete (free, takes 2 min): ${verifyUrl} — This link expires in 48 hrs. Reply STOP to opt out.`;
      results.sms = await sendSMS({ to: clientPhone, body: smsBody });
    }

    // 5. Mark notification as sent
    await pool.query(
      `UPDATE bank_verifications SET notification_sent_at = NOW() WHERE id = $1`,
      [verificationId]
    );

    res.json({
      success: true,
      verificationId,
      verifyUrl,
      sentVia: sendVia,
      expiresAt: expiresAt.toISOString(),
      emailSent: !!results.email,
      smsSent: !!results.sms,
      _simulated: results.email?.simulated || results.sms?.simulated || false,
    });
  } catch (err) {
    console.error('[Plaid] send-link error:', err.message);
    res.status(500).json({ error: err.message });
  }
});


// ════════════════════════════════════════════════════════════════════════════════
// ENDPOINT 10 — Client opens link → get link_token (PUBLIC — no auth required)
// GET /api/plaid/client-verify/:token
// ════════════════════════════════════════════════════════════════════════════════
app.get('/api/plaid/client-verify/:token', async (req, res) => {
  const { token } = req.params;

  try {
    const linkRow = await pool.query(
      `SELECT vl.*, bv.client_name as bv_name
       FROM verification_links vl
       JOIN bank_verifications bv ON bv.id = vl.verification_id
       WHERE vl.token = $1`,
      [token]
    );
    if (!linkRow.rows.length) return res.status(404).json({ error: 'Verification link not found or expired' });

    const link = linkRow.rows[0];
    if (link.is_used) return res.status(410).json({ error: 'This verification link has already been used.' });
    if (new Date(link.expires_at) < new Date()) return res.status(410).json({ error: 'This verification link has expired. Please ask your advisor to send a new one.' });

    // Mark link as opened
    await pool.query(`UPDATE verification_links SET opened_at = COALESCE(opened_at, NOW()) WHERE token = $1`, [token]);

    // Create a Plaid link_token for this client
    let linkToken = null;
    if (plaidClient) {
      const products = ['auth', 'transactions'];
      const countryCodes = (process.env.PLAID_COUNTRY_CODES || 'US').split(',').map(s => s.trim());
      const linkResp = await plaidClient.linkTokenCreate({
        user: { client_user_id: link.verification_id },
        client_name: 'New Holland Financial Group',
        products,
        country_codes: countryCodes,
        language: 'en',
      });
      linkToken = linkResp.data.link_token;
    }

    res.json({
      clientName: link.client_name,
      customMessage: link.custom_message,
      verificationId: link.verification_id,
      linkToken,
      expiresAt: link.expires_at,
      plaidReady: !!plaidClient,
    });
  } catch (err) {
    console.error('[Plaid] client-verify GET error:', err.message);
    res.status(500).json({ error: err.message });
  }
});


// ════════════════════════════════════════════════════════════════════════════════
// ENDPOINT 11 — Client completes Plaid → send public_token back (PUBLIC)
// Captures: Auth (routing), Balance, 7-day Transactions, Statement summary
// POST /api/plaid/client-verify/:token/complete
// ════════════════════════════════════════════════════════════════════════════════
app.post('/api/plaid/client-verify/:token/complete', async (req, res) => {
  const { token } = req.params;
  const { publicToken, accountId, accounts: metaAccounts = [] } = req.body;

  if (!publicToken) return res.status(400).json({ error: 'publicToken is required' });

  try {
    const linkRow = await pool.query(
      `SELECT * FROM verification_links WHERE token = $1`,
      [token]
    );
    if (!linkRow.rows.length) return res.status(404).json({ error: 'Link not found' });

    const link = linkRow.rows[0];
    if (link.is_used) return res.status(410).json({ error: 'Already completed' });
    if (new Date(link.expires_at) < new Date()) return res.status(410).json({ error: 'Link expired' });
    if (!plaidClient) return res.status(503).json({ error: 'Plaid not configured on server' });

    const verificationId = link.verification_id;

    // ── A: Exchange public_token ─────────────────────────────────────────────
    const exchRes = await plaidClient.itemPublicTokenExchange({ public_token: publicToken });
    const { access_token, item_id } = exchRes.data;

    // ── B: /item/get → institution + auth_method ────────────────────────────
    let institutionName = null, authMethodFromItem = null;
    try {
      const itemRes = await plaidClient.itemGet({ access_token });
      institutionName = itemRes.data.item.institution_name || null;
      authMethodFromItem = itemRes.data.item.auth_method || null;
    } catch (_) { }

    // ── C: /auth/get → routing + account numbers ────────────────────────────
    const authRes = await plaidClient.authGet({ access_token });
    const plaidAccts = authRes.data.accounts || [];
    const achNums = authRes.data.numbers?.ach || [];

    const targetAcct = plaidAccts.find(a => a.account_id === accountId)
      || plaidAccts.find(a => a.subtype === 'checking')
      || plaidAccts[0];
    const achEntry = achNums.find(n => n.account_id === targetAcct?.account_id) || achNums[0] || {};

    const routingNumber = achEntry.routing || null;
    const wireRouting = achEntry.wire_routing || null;
    const insights = targetAcct?.verification_insights || {};
    const nameMatchScoreRaw = insights.name_match_score ?? null;

    // ── D: /accounts/balance/get → real-time balance ────────────────────────
    let balanceAvail = null, balanceCurrent = null, balanceCurrency = 'USD';
    try {
      const balRes = await plaidClient.accountsBalanceGet({ access_token });
      const balAcct = balRes.data.accounts.find(a => a.account_id === targetAcct?.account_id)
        || balRes.data.accounts[0];
      if (balAcct) {
        balanceAvail = balAcct.balances.available ?? null;
        balanceCurrent = balAcct.balances.current ?? null;
        balanceCurrency = balAcct.balances.iso_currency_code || 'USD';
      }
    } catch (balErr) {
      console.warn('[Plaid] Balance fetch skipped:', balErr.message);
    }

    // ── E: /transactions/get → last 7 days ──────────────────────────────────
    let transactions7d = [];
    let statementSummary = null;
    try {
      const today = new Date();
      const sevenDaysAgo = new Date(today - 7 * 24 * 60 * 60 * 1000);
      const fmt = d => d.toISOString().slice(0, 10);

      const txRes = await plaidClient.transactionsGet({
        access_token,
        start_date: fmt(sevenDaysAgo),
        end_date: fmt(today),
        options: { count: 100, offset: 0, account_ids: targetAcct ? [targetAcct.account_id] : undefined },
      });

      const rawTx = txRes.data.transactions || [];
      // Store safe subset — no full account details in transaction objects
      transactions7d = rawTx.map(t => ({
        date: t.date,
        name: t.name,
        amount: t.amount,         // positive = debit, negative = credit
        category: t.category?.[0] || null,
        pending: t.pending,
        merchant: t.merchant_name || null,
      }));

      // Build statement summary
      const debits = rawTx.filter(t => t.amount > 0);
      const credits = rawTx.filter(t => t.amount < 0);
      statementSummary = {
        period: `${fmt(sevenDaysAgo)} to ${fmt(today)}`,
        totalTransactions: rawTx.length,
        totalDebits: debits.reduce((s, t) => s + t.amount, 0).toFixed(2),
        totalCredits: Math.abs(credits.reduce((s, t) => s + t.amount, 0)).toFixed(2),
        largestDebit: debits.length ? Math.max(...debits.map(t => t.amount)).toFixed(2) : '0.00',
        pendingCount: rawTx.filter(t => t.pending).length,
      };
    } catch (txErr) {
      console.warn('[Plaid] Transactions fetch skipped:', txErr.message);
    }

    // ── F: Save plaid_item ───────────────────────────────────────────────────
    const itemUpsert = await pool.query(
      `INSERT INTO plaid_items
         (item_id, access_token, institution_name, auth_method, client_name, created_by)
       VALUES ($1, $2, $3, $4, $5, 'client-self-verify')
       ON CONFLICT (item_id) DO UPDATE
         SET access_token = EXCLUDED.access_token, updated_at = NOW()
       RETURNING id`,
      [item_id, access_token, institutionName, authMethodFromItem,
        link.client_name]
    );
    const plaidItemDbId = itemUpsert.rows[0].id;

    // ── G: Risk + status mapping ─────────────────────────────────────────────
    const plaidVerifStatus = targetAcct?.verification_status ?? null;
    const statusMap = {
      automatically_verified: 'verified', manually_verified: 'verified',
      database_matched: 'verified', database_insights_pass: 'verified',
      pending_automatic_verification: 'micro_deposit',
      pending_manual_verification: 'micro_deposit',
      verification_failed: 'failed', verification_expired: 'failed',
    };
    const internalStatus = statusMap[plaidVerifStatus]
      || (authMethodFromItem === 'INSTANT_AUTH' ? 'verified' : 'pending');

    const hasPriorReturns = insights.previous_returns?.has_previous_administrative_return ?? null;
    const draftRisk = hasPriorReturns ? 'high'
      : (internalStatus === 'verified' ? 'low' : 'medium');

    // ── H: Update bank_verifications ─────────────────────────────────────────
    await pool.query(
      `UPDATE bank_verifications SET
         plaid_item_id             = $1::uuid,
         institution_name          = COALESCE($2, 'Unknown Bank'),
         account_name              = $3,
         account_mask              = COALESCE($4, '????'),
         account_type              = $5,
         account_holder_type       = $6,
         routing_number            = $7,
         wire_routing              = $8,
         plaid_account_id          = $9,
         status                    = $10::text,
         auth_method               = $11,
         plaid_verification_status = $12,
         name_match                = $13,
         name_match_score          = $14,
         account_active            = $15,
         has_numbers_match         = $16,
         is_numbers_match_verified = $17,
         has_prior_returns         = $18,
         account_num_format        = $19,
         draft_risk                = $20,
         balance_available         = $21,
         balance_current           = $22,
         balance_currency          = $23,
         transactions_7d           = $24,
         statement_summary         = $25,
         data_captured_at          = NOW(),
         verified_at               = CASE WHEN $10::text = 'verified' THEN NOW() ELSE NULL END,
         updated_at                = NOW()
       WHERE id = $26::uuid`,
      [
        plaidItemDbId,
        institutionName,
        targetAcct?.official_name || targetAcct?.name || null,
        targetAcct?.mask || null,
        targetAcct?.subtype || null,
        targetAcct?.holder_category || null,
        routingNumber, wireRouting,
        targetAcct?.account_id || null,
        internalStatus, authMethodFromItem, plaidVerifStatus,
        nameMatchScoreRaw != null ? nameMatchScoreRaw >= 70 : true,
        nameMatchScoreRaw,
        (targetAcct?.balances?.current ?? null) !== null,
        insights.network_status?.has_numbers_match ?? null,
        insights.network_status?.is_numbers_match_verified ?? null,
        hasPriorReturns,
        insights.account_number_format ?? null,
        draftRisk,
        balanceAvail, balanceCurrent, balanceCurrency,
        transactions7d.length > 0 ? JSON.stringify(transactions7d) : null,
        statementSummary ? JSON.stringify(statementSummary) : null,
        verificationId,
      ]
    );

    // ── I: Mark link as used ─────────────────────────────────────────────────
    await pool.query(
      `UPDATE verification_links SET is_used = TRUE, completed_at = NOW() WHERE token = $1`,
      [token]
    );

    res.json({
      success: true,
      verificationId,
      status: internalStatus,
      institutionName: institutionName || null,
      accountMask: targetAcct?.mask || '????',
      accountType: targetAcct?.subtype || 'checking',
      routingNumberMasked: routingNumber ? `****${routingNumber.slice(-4)}` : null,
      authMethod: authMethodFromItem,
      draftRisk,
      balanceAvailable: balanceAvail,
      balanceCurrent,
      transactionCount: transactions7d.length,
      statementSummary,
      message: 'Verification complete! Your advisor has been notified.',
    });
  } catch (err) {
    const pd = err.response?.data;
    console.error('[Plaid] client complete error:', pd || err.message);
    res.status(500).json({ error: pd?.error_message || err.message });
  }
});


// ════════════════════════════════════════════════════════════════════════════════
// ENDPOINT 12 — Get account data for a verification (balance + transactions)
// GET /api/plaid/verifications/:id/data
// ════════════════════════════════════════════════════════════════════════════════
app.get('/api/plaid/verifications/:id/data', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, client_name, institution_name, account_mask, account_type,
              balance_available, balance_current, balance_currency,
              transactions_7d, statement_summary, data_captured_at, status, draft_risk
       FROM bank_verifications WHERE id = $1`,
      [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

server.listen(PORT, () => {
  console.log(`NHFG CRM API Server running on port ${PORT}`);
});
