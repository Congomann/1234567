# Handoff Report: Milestone M4 Backend & Webhooks Analysis

## 1. Observation

Direct code observations from inspecting the codebase:

### A. Route Registration & Mounting (`backend/server.cjs`)
- **Imports** (`backend/server.cjs` lines 19-21):
  ```javascript
  const webhooksRouter = require('./routes/webhooks.cjs');
  const marketingRouter = require('./routes/marketing.cjs');
  const signalwireRouter = require('./routes/signalwire.cjs');
  ```
- **Global Body Parser Middleware** (`backend/server.cjs` lines 89-91):
  ```javascript
  app.use(cors());
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
  ```
- **Router Mounting** (`backend/server.cjs` lines 132-137):
  ```javascript
  // Mount Webhooks Router
  app.use('/api/webhooks', webhooksRouter);
  // Mount Marketing Router
  app.use('/api/marketing', marketingRouter);
  // Mount SignalWire Corporate Telephony Router
  app.use('/api/signalwire', signalwireRouter);
  ```

### B. Current Webhook Endpoint (`backend/routes/webhooks.cjs`)
- **Router Instantiation** (`backend/routes/webhooks.cjs` lines 1-3):
  ```javascript
  const express = require('express');
  const crypto = require('crypto');
  const router = express.Router();
  ```
- **Campaign Webhook Handler** (`backend/routes/webhooks.cjs` lines 123-192):
  ```javascript
  router.post('/campaigns', async (req, res) => {
    try {
      const { channel, campaign_id, lead } = req.body || {};

      if (!lead || typeof lead !== 'object') {
        return res.status(400).json({
          success: false,
          error: 'Invalid payload: "lead" object is required'
        });
      }

      const leadName = lead.full_name || lead.name || 'Ad Campaign Lead';
      const leadEmail = lead.email || null;
      const leadPhone = lead.phone || null;

      let sourceName = 'Ad Campaign';
      if (channel) {
        const formattedChannel = channel.toString().trim();
        sourceName = `${formattedChannel.charAt(0).toUpperCase() + formattedChannel.slice(1)} Ads`;
      }

      const customDetails = {
        channel: channel || 'unknown',
        annual_income: Number(lead.annual_income) || 0,
        asset_volume: Number(lead.asset_volume) || 0,
        credit_score: Number(lead.credit_score) || 0,
        ...lead
      };

      const newLeadRecord = {
        name: leadName,
        email: leadEmail,
        phone: leadPhone,
        source: sourceName,
        status: 'received',
        campaign_id: campaign_id || 'unknown',
        interest: 'Ad Campaign',
        custom_details: customDetails,
        platform_data: req.body
      };

      let leadId = crypto.randomUUID();
      let status = 'received';

      try {
        const { data, error } = await supabase
          .from('leads')
          .insert([newLeadRecord])
          .select('id, status');

        if (!error && data && data[0]) {
          leadId = data[0].id || leadId;
          status = data[0].status || status;
        } else if (error) {
          console.warn('[Webhooks /campaigns] Supabase insert notice:', error.message || error);
        }
      } catch (dbErr) {
        console.warn('[Webhooks /campaigns] DB operation warning:', dbErr.message || dbErr);
      }

      return res.status(200).json({
        success: true,
        lead_id: leadId,
        status: status
      });
    } catch (err) {
      console.error('[Webhooks /campaigns] Ingestion failed:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });
  ```

### C. Database Schema (`backend/schema.sql`)
- **`leads` Table Schema** (`backend/schema.sql` lines 38-72):
  ```sql
  CREATE TABLE leads (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255),
      phone VARCHAR(50),
      interest VARCHAR(100),
      status VARCHAR(50) DEFAULT 'New',
      score INT DEFAULT 50,
      qualification VARCHAR(20) CHECK (qualification IN ('Hot', 'Warm', 'Cold')),
      source VARCHAR(100),
      assigned_to UUID REFERENCES users(id),
      message TEXT,
      notes TEXT,
      priority VARCHAR(20) DEFAULT 'Low',
      
      life_details JSONB, 
      real_estate_details JSONB, 
      securities_details JSONB,
      custom_details JSONB,
      
      campaign_id VARCHAR(255),
      ad_group_id VARCHAR(255),
      ad_id VARCHAR(255),
      platform_data JSONB,
      
      is_archived BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );
  ```

### D. Ad Lead Simulator Integration (`backend/scripts/adSimulator.cjs`)
- **Simulator Delivery Target** (`backend/scripts/adSimulator.cjs` lines 100-127):
  Sends POST requests to `http://localhost:3001/api/webhooks/campaigns` with payload:
  ```json
  {
    "channel": "meta" | "google" | "tv",
    "campaign_id": "cmp_meta_wealth_2026",
    "lead": {
      "full_name": "Alexander Anderson",
      "email": "alexander.anderson12@gmail.com",
      "phone": "+15554329876",
      "annual_income": 120000,
      "asset_volume": 450000,
      "credit_score": 740
    }
  }
  ```

---

## 2. Logic Chain

1. **Route Mounting Mechanism**:
   - `backend/server.cjs` loads Express (`const app = express()`).
   - `bodyParser.json()` middleware is registered globally on `app` before any API routers.
   - `webhooksRouter` is imported from `./routes/webhooks.cjs`.
   - `app.use('/api/webhooks', webhooksRouter)` mounts the sub-router.
   - Sub-routes defined as `router.post('/campaigns')` inside `backend/routes/webhooks.cjs` map directly to `POST /api/webhooks/campaigns`.

2. **Lead Storage & Resilient Fallback Mechanics**:
   - **PostgreSQL / Supabase Storage**:
     - `webhooks.cjs` imports `supabase` from `../supabase.cjs`.
     - `supabase.from('leads').insert([newLeadRecord]).select('id, status')` inserts the normalized record into PostgreSQL.
     - The column `custom_details` (JSONB) stores financial screening data (`channel`, `annual_income`, `asset_volume`, `credit_score`, etc.) for downstream qualification engine (M5).
     - `platform_data` (JSONB) stores the raw JSON request body for debugging and audit logging.
   - **Resilient Fallback Mechanics**:
     - DB calls are wrapped in a nested `try...catch` block.
     - If Supabase/PostgreSQL is unreachable, unconfigured, or throws a runtime error, the endpoint logs a warning (`[Webhooks /campaigns] DB operation warning:`), generates a fallback UUID (`crypto.randomUUID()`), maintains `status = 'received'`, and still returns an HTTP 200 JSON response:
       ```json
       {
         "success": true,
         "lead_id": "<generated_uuid>",
         "status": "received"
       }
       ```
     - This guarantees the ad simulator and webhook clients do not suffer 500 internal server errors when running offline or during DB maintenance.

3. **Contract Alignment**:
   - Interface Contract (M4 ↔ M5) in `PROJECT.md` / `SCOPE.md`:
     - Endpoint: `POST /api/webhooks/campaigns`
     - Request Header: `Content-Type: application/json`
     - Request Body: `{ "channel": string, "campaign_id": string, "lead": { "full_name": string, "email": string, "phone": string, "annual_income": number, "asset_volume": number, "credit_score": number } }`
     - Response: `{ "success": boolean, "lead_id": string, "status": string }`
   - `backend/routes/webhooks.cjs` aligns with this contract.

---

## 3. Caveats

1. **Database Fallback In-Memory Persistence**:
   - While `webhooks.cjs` gracefully returns HTTP 200 on DB errors, leads generated during a database outage are not currently stored in an in-memory `Map` or array cache in `webhooks.cjs`.
   - If downstream services (e.g. M5 Qualification Engine) query `GET /api/leads` during a database outage, they will only see records that were successfully saved in PostgreSQL.
2. **Dual Database Access Patterns**:
   - `backend/server.cjs` initializes a direct `pg.Pool` connection (`pool`) for SQL queries, whereas `webhooks.cjs` uses `@supabase/supabase-js` (`supabase`).
   - If `SUPABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY` environment variables are absent, `supabase` calls will failover to the DB error handler.
3. **Channel Formatting**:
   - Channel names sent by ad platforms or simulators (e.g., `'meta'`, `'google'`, `'tv'`) are formatted into source names like `'Meta Ads'`, `'Google Ads'`, `'Tv Ads'`. Ensure TV formatting formats nicely as `'TV Ads'`.

---

## 4. Conclusion & Recommendations

### Question 1 Answer (Route Registration):
- `backend/routes/webhooks.cjs` exports an Express router (`module.exports = router`).
- In `backend/server.cjs`, it is imported via `const webhooksRouter = require('./routes/webhooks.cjs');` and mounted via `app.use('/api/webhooks', webhooksRouter);`.
- `router.post('/campaigns', ...)` in `webhooks.cjs` resolves to `POST /api/webhooks/campaigns`.

### Question 2 Answer (Lead Storage):
- Leads are stored in the PostgreSQL `leads` table via `@supabase/supabase-js` (or fallback pg queries).
- `custom_details` (JSONB) stores lead financial attributes (`annual_income`, `asset_volume`, `credit_score`).
- On DB failure, fallback logic generates a UUID via `crypto.randomUUID()`, assigns `status = 'received'`, logs the warning, and returns `{ success: true, lead_id, status }` HTTP 200.

### Question 3 Recommendations for `backend/routes/webhooks.cjs`:
1. **Payload Structure Validation**:
   - Verify `lead` object exists and return 400 Bad Request if missing.
   - Extract `full_name`, `email`, `phone`, `annual_income`, `asset_volume`, `credit_score`.
2. **Channel Name Formatting**:
   - Normalize `channel` strings (`meta` -> `Meta Ads`, `google` -> `Google Ads`, `tv` -> `TV Ads`).
3. **Enhanced In-Memory Lead Fallback Array**:
   - Maintain an in-memory `inMemoryLeads` array in `webhooks.cjs` or a shared memory store. When DB insert fails, push the record into `inMemoryLeads` so that offline test suites or dev runs can still access simulated leads via lead query endpoints.
4. **Contract Adherence**:
   - Always return `{ "success": true, "lead_id": leadId, "status": status }` with HTTP 200 on success or fallback.

---

## 5. Verification Method

To independently verify the implementation:

1. **Verify Route Mounting & Server Startup**:
   - Run `node backend/server.cjs` or `npm run server:local`.
   - Ensure output contains `[DB] Pool initialized` and server listens on port 3001.

2. **Test Campaign Webhook Endpoint via Curl**:
   ```bash
   curl -X POST http://localhost:3001/api/webhooks/campaigns \
     -H "Content-Type: application/json" \
     -d '{
       "channel": "meta",
       "campaign_id": "cmp_meta_wealth_2026",
       "lead": {
         "full_name": "Jane Doe",
         "email": "jane.doe@example.com",
         "phone": "+15559876543",
         "annual_income": 150000,
         "asset_volume": 600000,
         "credit_score": 760
       }
     }'
   ```
   - Expected Output: `{"success":true,"lead_id":"...","status":"received"}` with HTTP 200.

3. **Test Ad Simulator**:
   ```bash
   node backend/scripts/adSimulator.cjs --once
   ```
   - Expected Output: `[AdSimulator] ✅ Webhook accepted! Lead ID: ... | Status: received ...`
