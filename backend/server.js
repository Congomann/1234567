
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
require('dotenv').config();

const app = express();
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

  if (token == null) return res.status(401).json({ error: 'Unauthorized' });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: 'Forbidden' });
    req.user = user;
    next();
  });
};

// --- HELPER: WEBHOOK NORMALIZERS ---
// These functions automatically correct incoming messy JSON from ad platforms into our clean Schema

const WebhookNormalizer = {
    google: (payload) => {
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
            campaign_id: payload.campaign_id,
            source: 'google_ads'
        };
    },
    meta: (payload) => {
        // Meta/Facebook sends data in entry[].changes[].value
        const entry = payload.entry?.[0];
        const change = entry?.changes?.[0]?.value || payload; // Handle raw test payloads too
        const form = change.form_data || {}; // Hypothetical flattened structure or normalize field_data
        
        // Real Meta payloads often use 'field_data' array mapping name->values
        const fieldMap = {};
        if (change.field_data) {
            change.field_data.forEach(f => fieldMap[f.name] = f.values[0]);
        }

        return {
            name: fieldMap.full_name || change.full_name || 'Meta Lead',
            email: fieldMap.email || change.email || 'Not Provided',
            phone: fieldMap.phone_number || change.phone_number || 'N/A',
            interest: fieldMap.job_title || 'Business Insurance', // Often mapped to custom questions
            campaign_id: change.campaign_id,
            source: 'meta_ads'
        };
    },
    tiktok: (payload) => {
        const data = payload.data || {};
        return {
            name: data.details?.name || 'TikTok Lead',
            email: data.details?.email || 'Not Provided',
            phone: data.details?.phone || 'N/A',
            interest: 'Indexed Universal Life (IUL)', // TikTok default high intent
            campaign_id: data.campaign_id,
            source: 'tiktok_ads'
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

// 3. Webhook Ingestion (The Auto-Corrector)
app.post('/api/webhooks/:platform', async (req, res) => {
  const { platform } = req.params;
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
      if (platform === 'google') leadData = WebhookNormalizer.google(payload);
      else if (platform === 'meta') leadData = WebhookNormalizer.meta(payload);
      else if (platform === 'tiktok') leadData = WebhookNormalizer.tiktok(payload);
      else throw new Error('Unsupported platform');

      // 3. Insert Normalized Lead
      if (leadData) {
          await pool.query(
              `INSERT INTO leads (name, email, phone, interest, source, campaign_id, status, platform_data, message)
               VALUES ($1, $2, $3, $4, $5, $6, 'New', $7, 'Auto-Imported via Webhook')`,
              [leadData.name, leadData.email, leadData.phone, leadData.interest, leadData.source, leadData.campaign_id, JSON.stringify(payload)]
          );
          
          res.json({ success: true, message: 'Lead normalized and ingested' });
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
});

// 4. Auth
app.post('/api/auth/login', async (req, res) => {
  const { email } = req.body;
  // Simplified login for demo - in prod use bcrypt compare
  const result = await pool.query('SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL', [email]);
  if (result.rows.length > 0) {
      const u = result.rows[0];
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
    const { title, date, time, endTime, type, status, description, hasGoogleMeet, meetingLink, participants, creatorId, creatorName } = req.body;
    
    const insertQuery = `
      INSERT INTO events (
        title, date, time, end_time, type, status, description, 
        has_google_meet, meeting_link, participants, creator_id, creator_name
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id
    `;
    
    const result = await pool.query(insertQuery, [
      title, date, time, endTime, type, status || 'scheduled', description,
      hasGoogleMeet || false, meetingLink, JSON.stringify(participants || []), creatorId, creatorName
    ]);
    
    res.status(201).json({ id: result.rows[0].id, success: true });
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

app.listen(PORT, () => {
  console.log(`NHFG CRM API Server running on port ${PORT}`);
});
