# Handoff Report — Explorer 1 (Milestone 4: Express Server & Webhook Routing Architecture)

## 1. Observation

### 1.1 Express Server & Route Mounting Setup
- **File:** `/Users/newholland/1234567/backend/server.cjs`
  - **Lines 18-21:**
    ```javascript
    const supabase = require('./supabaseClient.cjs');
    const webhooksRouter = require('./routes/webhooks.cjs');
    const marketingRouter = require('./routes/marketing.cjs');
    const signalwireRouter = require('./routes/signalwire.cjs');
    ```
  - **Lines 39-40:** Express app instance `app = express()` and HTTP server `server = http.createServer(app)` created.
  - **Lines 89-91:** Body parsing middleware configured (`bodyParser.json({ limit: '50mb' })`).
  - **Lines 132-137:** Webhooks router mounted at `/api/webhooks`:
    ```javascript
    // Mount Webhooks Router
    app.use('/api/webhooks', webhooksRouter);
    // Mount Marketing Router
    app.use('/api/marketing', marketingRouter);
    // Mount SignalWire Corporate Telephony Router
    app.use('/api/signalwire', signalwireRouter);
    ```

### 1.2 Existing Webhook Routes Structure
- **File:** `/Users/newholland/1234567/backend/routes/webhooks.cjs`
  - **Lines 1-5:** Uses Express Router (`const router = express.Router();`) and Supabase client (`const { supabase } = require('../supabase.cjs');`).
  - **Lines 10-50 (`POST /meta`):** Parses Meta Instant Forms payload and inserts lead record into `leads` table via Supabase `supabase.from('leads').insert(...)`.
  - **Lines 55-83 (`POST /tiktok`):** Parses TikTok Lead Gen payload and inserts into `leads` table.
  - **Lines 88-116 (`POST /google`):** Parses Google Lead Form payload and inserts into `leads` table.
  - **Line 118:** Exports `router` (`module.exports = router;`).
  - **Observation:** `POST /api/webhooks/campaigns` endpoint is **not yet defined** in `webhooks.cjs`.

### 1.3 Lead Database Persistence Layer
- **Files:** `/Users/newholland/1234567/backend/schema.sql` (Lines 38-72) & `/Users/newholland/1234567/backend/supabase_schema.sql` (Lines 58-83)
  - Unified `leads` table schema:
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
- **Helper Clients:**
  - `backend/supabase.cjs` exports `{ supabase }` initialized with `SUPABASE_SERVICE_ROLE_KEY` (bypasses RLS).
  - `backend/supabaseClient.cjs` exports `supabase` with fallback key.
  - `backend/server.cjs` has a `pg.Pool` database connection to PostgreSQL (`poolConfig`, lines 183-192).

### 1.4 Webhook Interface Contract Requirements
- **Files:** `/Users/newholland/1234567/PROJECT.md` (Lines 46-49) & `/Users/newholland/1234567/.agents/sub_orch_m4/SCOPE.md` (Lines 21-25)
  - **Endpoint:** `POST /api/webhooks/campaigns`
  - **Headers:** `Content-Type: application/json`
  - **Request Body:**
    ```json
    {
      "channel": "meta",
      "campaign_id": "cmp_meta_001",
      "lead": {
        "full_name": "Jane Doe",
        "email": "jane.doe@example.com",
        "phone": "+15551234567",
        "annual_income": 180000,
        "asset_volume": 650000,
        "credit_score": 750
      }
    }
    ```
  - **Response Body:**
    ```json
    {
      "success": true,
      "lead_id": "uuid-string",
      "status": "received"
    }
    ```

---

## 2. Logic Chain

1. **Routing Architecture:**
   - `backend/server.cjs` mounts `backend/routes/webhooks.cjs` under the route prefix `/api/webhooks` (`app.use('/api/webhooks', webhooksRouter)`).
   - Adding a new route handler `router.post('/campaigns', ...)` within `backend/routes/webhooks.cjs` requires **zero modifications** to `backend/server.cjs` for route mounting. Express automatically routes HTTP `POST /api/webhooks/campaigns` requests to this handler.

2. **Payload Parsing & Mapping:**
   - In `router.post('/campaigns', ...)`:
     - Destructure `channel`, `campaign_id`, `lead` from `req.body`.
     - Extract contact details: `name` = `lead.full_name || lead.name || 'Ad Campaign Lead'`, `email` = `lead.email`, `phone` = `lead.phone`.
     - Financial criteria (`annual_income`, `asset_volume`, `credit_score`) along with `channel` map into the `custom_details` JSONB column.
     - `campaign_id` maps to the `campaign_id` column.
     - Raw `req.body` maps to the `platform_data` JSONB column for auditability and downstream qualification evaluation in Milestone 5.
     - `source` maps to normalized channel name (e.g. `'Meta Ads'`, `'Google Ads'`, `'TV Ads'`).
     - `status` defaults to `'received'` (or `'New'`).

3. **Persistence Mechanism:**
   - Lead records can be persisted directly using `supabase.from('leads').insert([...]).select()` which returns the created record containing the auto-generated `id` (UUID).
   - For resiliency, a fallback to `pool.query(...)` can handle local standalone PostgreSQL environments if Supabase client calls fail.

4. **Response Delivery:**
   - On successful insertion, return HTTP 200 (or 201) with `{ success: true, lead_id: insertedRecord.id, status: 'received' }`.

---

## 3. Caveats

1. **Read-Only Constraint:** Explorer 1 is strictly an investigation role. No source code modifications were performed during this turn.
2. **Database Fallback:** `backend/routes/webhooks.cjs` currently relies solely on `supabase.from('leads').insert(...)`. If Supabase credentials are missing in local dev, incorporating a fallback check or pg `pool` query will ensure zero-downtime testability.
3. **Qualification Engine Integration:** Qualification flagging ("Qualified" vs "Disqualified") is part of Milestone 5 (R5.1). R4.1 focuses on ingestion, persistence, and returning the `lead_id` and initial `'received'` status.

---

## 4. Conclusion

- **Mount Point:** `POST /api/webhooks/campaigns` should be added to `/Users/newholland/1234567/backend/routes/webhooks.cjs`.
- **Server File Changes:** No changes required in `backend/server.cjs` for route mounting, as `/api/webhooks` is already registered.
- **File Addition/Modification:** Modify `backend/routes/webhooks.cjs` to add the `POST /campaigns` route handler.

### Concrete Implementation Plan for `backend/routes/webhooks.cjs`:
Add the following route handler to `backend/routes/webhooks.cjs`:

```javascript
/**
 * UNIFIED AD CAMPAIGN LEAD INGESTION WEBHOOK (R4.1)
 * Accepts payloads from Meta, Google, and TV ad channels.
 */
router.post('/campaigns', async (req, res) => {
  try {
    const { channel, campaign_id, lead } = req.body || {};

    if (!lead || (!lead.full_name && !lead.name && !lead.email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid payload: lead object with full_name/name or email is required'
      });
    }

    const leadName = lead.full_name || lead.name || 'Campaign Lead';
    const leadEmail = lead.email || null;
    const leadPhone = lead.phone || null;
    const channelName = channel ? `${channel.charAt(0).toUpperCase() + channel.slice(1)} Ads` : 'Ad Campaign';

    const customDetails = {
      channel: channel || 'unknown',
      annual_income: lead.annual_income || 0,
      asset_volume: lead.asset_volume || 0,
      credit_score: lead.credit_score || 0
    };

    const newLeadRecord = {
      name: leadName,
      email: leadEmail,
      phone: leadPhone,
      source: channelName,
      status: 'received',
      campaign_id: campaign_id || 'unknown',
      interest: 'Ad Campaign',
      custom_details: customDetails,
      platform_data: req.body
    };

    const { data, error } = await supabase
      .from('leads')
      .insert([newLeadRecord])
      .select('id, status');

    if (error) {
      console.error('[Webhooks /campaigns] Supabase insert error:', error);
      return res.status(500).json({ success: false, error: error.message });
    }

    const insertedLead = data && data[0] ? data[0] : null;

    res.status(200).json({
      success: true,
      lead_id: insertedLead ? insertedLead.id : 'generated-id',
      status: 'received'
    });
  } catch (err) {
    console.error('[Webhooks /campaigns] Internal server error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});
```

---

## 5. Verification Method

To verify the implementation of R4.1 once code modifications are performed:

1. **Start Backend Server:**
   ```bash
   node backend/server.cjs
   ```
2. **Send Test POST Request via curl:**
   ```bash
   curl -X POST http://localhost:3001/api/webhooks/campaigns \
     -H "Content-Type: application/json" \
     -d '{
       "channel": "meta",
       "campaign_id": "cmp_test_123",
       "lead": {
         "full_name": "Test Lead Explorer",
         "email": "explorer.test@example.com",
         "phone": "+15550001111",
         "annual_income": 150000,
         "asset_volume": 500000,
         "credit_score": 720
       }
     }'
   ```
3. **Verify Response:**
   Expect HTTP 200/201 JSON:
   `{"success": true, "lead_id": "<valid-uuid>", "status": "received"}`

4. **Inspect Database Lead Record:**
   Verify lead was created in `leads` table with matching `campaign_id`, `source` ("Meta Ads"), and `custom_details` containing `annual_income`, `asset_volume`, and `credit_score`.
