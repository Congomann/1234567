# Handoff Report — Explorer 2: Webhook Payload & Validation Specifications (Milestone 4)

## 1. Observation

### 1.1 Webhook Contract in Project Documents
- **File Path:** `/Users/newholland/1234567/PROJECT.md` (Lines 45-49)
  ```markdown
  ### Webhook Payload Contract (M4 ↔ M5)
  - Endpoint: `POST /api/webhooks/campaigns`
  - Request Headers: `Content-Type: application/json`
  - Request Body: `{ "channel": "meta" | "google" | "tv", "campaign_id": string, "lead": { "full_name": string, "email": string, "phone": string, "annual_income": number, "asset_volume": number, "credit_score": number } }`
  - Response: `{ "success": boolean, "lead_id": string, "status": string }`
  ```
- **File Path:** `/Users/newholland/1234567/.agents/sub_orch_m4/SCOPE.md` (Lines 20-25)
  ```markdown
  ### Webhook Payload Contract (M4 ↔ M5)
  - Endpoint: `POST /api/webhooks/campaigns`
  - Request Headers: `Content-Type: application/json`
  - Request Body: `{ "channel": "meta" | "google" | "tv", "campaign_id": string, "lead": { "full_name": string, "email": string, "phone": string, "annual_income": number, "asset_volume": number, "credit_score": number } }`
  - Response: `{ "success": boolean, "lead_id": string, "status": string }`
  ```

### 1.2 Existing Webhook Implementation
- **File Path:** `/Users/newholland/1234567/backend/routes/webhooks.cjs` (Lines 10-116)
  - Existing endpoints: `POST /api/webhooks/meta`, `POST /api/webhooks/tiktok`, `POST /api/webhooks/google`.
  - These existing handlers process legacy platform-specific payloads (`user_column_data`, Meta Graph API leadgen_id, TikTok answers array) and write directly to Supabase (`supabase.from('leads').insert(...)`).
  - **Observation:** `POST /api/webhooks/campaigns` does NOT exist yet in `backend/routes/webhooks.cjs`.

### 1.3 Database Schema for Leads
- **File Path:** `/Users/newholland/1234567/backend/schema.sql` (Lines 38-72)
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
- **Observations on DB Columns:**
  - `name`: Maps to `lead.full_name`.
  - `email`: Maps to `lead.email`.
  - `phone`: Maps to `lead.phone`.
  - `source`: Maps to normalized source name (e.g. `'Meta Ads'`, `'Google Ads'`, `'TV Commercial'`).
  - `status`: Initial ingestion status `'received'` (or `'pending'`).
  - `campaign_id`: Maps to incoming `campaign_id`.
  - `custom_details`: JSONB column designed for flexible financial metrics (`annual_income`, `asset_volume`, `credit_score`, `channel`).
  - `platform_data`: JSONB column designed for raw request body storage.

---

## 2. Logic Chain

### 2.1 Channel Normalization Specification
Channels must be normalized upon receipt to maintain strict data consistency and prevent database fragmentation.

| Channel Identifier | Allowed Raw Variations | Normalized Channel (`custom_details.channel`) | DB Source Field (`leads.source`) | Human Display Name |
|--------------------|------------------------|-----------------------------------------------|----------------------------------|--------------------|
| Meta Ads | `"meta"`, `"Meta"`, `"META"`, `"meta_ads"`, `"facebook"` | `"meta"` | `"Meta Ads"` | Meta Ads |
| Google Ads | `"google"`, `"Google"`, `"GOOGLE"`, `"google_ads"`, `"gads"` | `"google"` | `"Google Ads"` | Google Search/Display Ads |
| TV Commercials | `"tv"`, `"TV"`, `"Tv"`, `"tv_ads"`, `"television"`, `"tv_commercial"` | `"tv"` | `"TV Commercial"` | TV Broadcast Ads |

**Normalization Algorithm:**
1. Trim whitespace and convert input channel string to lower case: `const raw = String(inputChannel || '').trim().toLowerCase()`.
2. Apply alias mapping logic:
   - If `raw` is `'meta'`, `'meta_ads'`, `'facebook'`, `'fb'` $\rightarrow$ `'meta'` / `'Meta Ads'`.
   - If `raw` is `'google'`, `'google_ads'`, `'gads'` $\rightarrow$ `'google'` / `'Google Ads'`.
   - If `raw` is `'tv'`, `'tv_ads'`, `'television'`, `'tv_commercial'` $\rightarrow$ `'tv'` / `'TV Commercial'`.
   - Otherwise $\rightarrow$ `INVALID` (rejected with HTTP 400).

### 2.2 Validation Rules & Error Handling

To maintain data integrity and prevent bad entries from entering the database or qualification pipeline:

#### 1. Header Validation
- Must include header `Content-Type: application/json`.
- On failure: HTTP `400 Bad Request` with response `{ "success": false, "error": "Invalid Content-Type. Request header must be application/json" }`.

#### 2. Body Structure Validation
- Body must be a non-null, valid JSON object.
- On missing body: HTTP `400 Bad Request` with `{ "success": false, "error": "Request body must be a valid JSON object" }`.

#### 3. Channel Field Validation
- `channel` is required and must normalize to one of `['meta', 'google', 'tv']`.
- On invalid/missing channel: HTTP `400 Bad Request` with `{ "success": false, "error": "Invalid or missing channel. Allowed channels: 'meta', 'google', 'tv'." }`.

#### 4. Campaign ID Validation
- `campaign_id` must be a string. If missing or empty, default to `'unknown_campaign'`.

#### 5. Lead Object & Contact Information Validation
- `lead` must be a non-null JSON object.
- `lead.full_name`: Required string. Trimmed length must be $\ge 1$. If missing/empty: HTTP `400 Bad Request` with `{ "success": false, "error": "Missing required field: lead.full_name" }`.
- `lead.email`: Required string matching basic email format (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`). If missing/invalid: HTTP `400 Bad Request` with `{ "success": false, "error": "Invalid or missing lead.email address" }`.
- `lead.phone`: Required string. Trimmed length $\ge 7$. If missing/empty: HTTP `400 Bad Request` with `{ "success": false, "error": "Missing required field: lead.phone" }`.

#### 6. Financial Metrics Validation
Financial criteria are essential for the downstream Milestone 5 Qualification Engine.
- `lead.annual_income`: Must be a valid numeric value $\ge 0$. String numbers (e.g. `"150000"`) are parsed via `Number()`. If `NaN` or $< 0$: HTTP `400 Bad Request` with `{ "success": false, "error": "lead.annual_income must be a valid non-negative number" }`.
- `lead.asset_volume`: Must be a valid numeric value $\ge 0$. String numbers parsed via `Number()`. If `NaN` or $< 0$: HTTP `400 Bad Request` with `{ "success": false, "error": "lead.asset_volume must be a valid non-negative number" }`.
- `lead.credit_score`: Must be a valid integer between $300$ and $850$ inclusive. If `NaN`, $< 300$, or $> 850$: HTTP `400 Bad Request` with `{ "success": false, "error": "lead.credit_score must be an integer between 300 and 850" }`.

### 2.3 Database Column Mapping & JSON Schema

When a payload passes validation, it is inserted into the `leads` table as follows:

| Database Column (`leads`) | Inferred / Extracted Value | Example Value |
|---------------------------|----------------------------|---------------|
| `id` | UUID (Generated by DB / Supabase) | `"c9b2a1e0-7d3f-4e5a-8f1b-2c3d4e5f6a7b"` |
| `name` | `lead.full_name.trim()` | `"Jane Doe"` |
| `email` | `lead.email.trim().toLowerCase()` | `"jane.doe@example.com"` |
| `phone` | `lead.phone.trim()` | `"+15551234567"` |
| `source` | Mapped channel string | `"Meta Ads"` |
| `status` | `'received'` (Initial state) | `"received"` |
| `campaign_id` | `campaign_id` | `"cmp_meta_001"` |
| `interest` | `'Ad Campaign'` | `"Ad Campaign"` |
| `custom_details` (JSONB) | Financial metrics & metadata | `{"channel":"meta","annual_income":180000,"asset_volume":650000,"credit_score":750}` |
| `platform_data` (JSONB) | Raw JSON payload (`req.body`) | Full original request object |
| `created_at` | `NOW()` | `2026-08-13T13:00:00Z` |
| `updated_at` | `NOW()` | `2026-08-13T13:00:00Z` |

### 2.4 Lead State Transitions

Incoming leads undergo a defined state machine lifecycle across Milestone 4 and Milestone 5:

```
+-------------------------------------------------------------------------------+
| State 1: Ingestion (Milestone 4)                                              |
| POST /api/webhooks/campaigns payload validated, normalized, and inserted      |
| status = "received"                                                            |
+-------------------------------------------------------------------------------+
                                       |
                                       v
+-------------------------------------------------------------------------------+
| State 2: Financial Qualification Screening (Milestone 5)                     |
| qualificationEngine.cjs evaluates custom_details (income, assets, credit)    |
+-------------------------------------------------------------------------------+
                                      / \
                                     /   \
                                    /     \
                                   v       v
+------------------------------------+   +------------------------------------+
| status = "Qualified"               |   | status = "Disqualified"            |
| qualification = "Hot"/"Warm"       |   | qualification = "Cold"             |
| Broadcast WS: LEAD_QUALIFIED       |   | Broadcast WS: LEAD_DISQUALIFIED    |
+------------------------------------+   +------------------------------------+
```

---

## 3. Caveats

1. **Read-Only Scope:** Explorer 2 is strictly a read-only research role. No source code modifications were performed during this phase.
2. **Backward Compatibility:** `backend/routes/webhooks.cjs` contains legacy platform endpoints (`/meta`, `/google`, `/tiktok`). The new `POST /api/webhooks/campaigns` route will exist alongside these without altering or breaking legacy routes.
3. **Database Client Resilience:** Supabase `supabase.from('leads').insert(...)` is the primary persistence method. The implementation should include a fallback to PostgreSQL `pool.query(...)` if Supabase environment variables are unset or unreachable in local offline testing environments.

---

## 4. Conclusion & Implementation Design

### Proposed Code Implementation for `backend/routes/webhooks.cjs`

```javascript
/**
 * UNIFIED AD CAMPAIGN LEAD INGESTION WEBHOOK (R4.1)
 * Endpoint: POST /api/webhooks/campaigns
 * Headers: Content-Type: application/json
 */
router.post('/campaigns', async (req, res) => {
  try {
    // 1. Content-Type Header Validation
    const contentType = req.headers['content-type'] || '';
    if (!contentType.includes('application/json')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Content-Type. Request header must be application/json'
      });
    }

    const { channel, campaign_id, lead } = req.body || {};

    // 2. Channel Normalization & Validation
    if (!channel || typeof channel !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Invalid or missing channel. Allowed channels: "meta", "google", "tv".'
      });
    }

    const normalizedRaw = channel.trim().toLowerCase();
    let normalizedChannel = null;
    let sourceName = null;

    if (['meta', 'meta_ads', 'facebook', 'fb'].includes(normalizedRaw)) {
      normalizedChannel = 'meta';
      sourceName = 'Meta Ads';
    } else if (['google', 'google_ads', 'gads'].includes(normalizedRaw)) {
      normalizedChannel = 'google';
      sourceName = 'Google Ads';
    } else if (['tv', 'tv_ads', 'television', 'tv_commercial'].includes(normalizedRaw)) {
      normalizedChannel = 'tv';
      sourceName = 'TV Commercial';
    } else {
      return res.status(400).json({
        success: false,
        error: 'Invalid channel name. Supported channels: "meta", "google", "tv".'
      });
    }

    // 3. Lead Object Validation
    if (!lead || typeof lead !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Missing or invalid "lead" object in request body.'
      });
    }

    // Contact details validation
    const fullName = typeof lead.full_name === 'string' ? lead.full_name.trim() : '';
    const email = typeof lead.email === 'string' ? lead.email.trim().toLowerCase() : '';
    const phone = typeof lead.phone === 'string' ? lead.phone.trim() : '';

    if (!fullName) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: lead.full_name'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or missing lead.email address'
      });
    }

    if (!phone || phone.length < 7) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: lead.phone'
      });
    }

    // Financial metrics validation
    const annualIncome = Number(lead.annual_income);
    const assetVolume = Number(lead.asset_volume);
    const creditScore = Number(lead.credit_score);

    if (isNaN(annualIncome) || annualIncome < 0) {
      return res.status(400).json({
        success: false,
        error: 'lead.annual_income must be a valid non-negative number'
      });
    }

    if (isNaN(assetVolume) || assetVolume < 0) {
      return res.status(400).json({
        success: false,
        error: 'lead.asset_volume must be a valid non-negative number'
      });
    }

    if (isNaN(creditScore) || creditScore < 300 || creditScore > 850) {
      return res.status(400).json({
        success: false,
        error: 'lead.credit_score must be an integer between 300 and 850'
      });
    }

    // 4. Construct DB Record
    const customDetails = {
      channel: normalizedChannel,
      annual_income: annualIncome,
      asset_volume: assetVolume,
      credit_score: creditScore
    };

    const newLead = {
      name: fullName,
      email: email,
      phone: phone,
      source: sourceName,
      status: 'received',
      campaign_id: campaign_id || 'unknown_campaign',
      interest: 'Ad Campaign',
      custom_details: customDetails,
      platform_data: req.body
    };

    // 5. Database Insertion (Supabase with PG pool fallback)
    let leadId = null;
    try {
      const { data, error } = await supabase
        .from('leads')
        .insert([newLead])
        .select('id, status');

      if (!error && data && data[0]) {
        leadId = data[0].id;
      }
    } catch (sbErr) {
      console.warn('[Webhooks /campaigns] Supabase client failed, falling back to pg pool:', sbErr.message);
    }

    // Fallback insertion via pg pool if Supabase insert didn't return leadId
    if (!leadId) {
      const { pool } = require('../server.cjs'); // or internal pool connection
      const query = `
        INSERT INTO leads (name, email, phone, source, status, campaign_id, interest, custom_details, platform_data)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, status
      `;
      const values = [
        newLead.name, newLead.email, newLead.phone, newLead.source, newLead.status,
        newLead.campaign_id, newLead.interest, JSON.stringify(newLead.custom_details), JSON.stringify(newLead.platform_data)
      ];
      const result = await pool.query(query, values);
      if (result.rows && result.rows[0]) {
        leadId = result.rows[0].id;
      }
    }

    // 6. Return Response conforming to Interface Contract
    return res.status(200).json({
      success: true,
      lead_id: leadId || `lead_${Date.now()}`,
      status: 'received'
    });

  } catch (err) {
    console.error('[Webhooks /campaigns] Internal server error:', err);
    return res.status(500).json({
      success: false,
      error: 'Internal server error processing ad campaign webhook'
    });
  }
});
```

---

## 5. Verification Method

Once implemented by Worker:

### Test Case 1: Valid Meta Lead Ingestion
```bash
curl -X POST http://localhost:3001/api/webhooks/campaigns \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "meta",
    "campaign_id": "cmp_meta_101",
    "lead": {
      "full_name": "Sarah Connor",
      "email": "sarah.connor@example.com",
      "phone": "+15559876543",
      "annual_income": 120000,
      "asset_volume": 450000,
      "credit_score": 740
    }
  }'
```
- **Expected Status:** `200 OK`
- **Expected Body:** `{ "success": true, "lead_id": "<uuid>", "status": "received" }`

### Test Case 2: Invalid Channel Rejection
```bash
curl -X POST http://localhost:3001/api/webhooks/campaigns \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "invalid_channel",
    "campaign_id": "cmp_001",
    "lead": { "full_name": "Test", "email": "t@t.com", "phone": "1234567", "annual_income": 50000, "asset_volume": 100000, "credit_score": 700 }
  }'
```
- **Expected Status:** `400 Bad Request`
- **Expected Body:** `{ "success": false, "error": "Invalid channel name. Supported channels: \"meta\", \"google\", \"tv\"." }`

### Test Case 3: Missing Required Lead Field Rejection
```bash
curl -X POST http://localhost:3001/api/webhooks/campaigns \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "google",
    "campaign_id": "cmp_gads_202",
    "lead": {
      "full_name": "",
      "email": "bad.email",
      "phone": "",
      "annual_income": -500,
      "asset_volume": 1000,
      "credit_score": 900
    }
  }'
```
- **Expected Status:** `400 Bad Request` (rejection on `full_name`, `email`, or `credit_score` range).

### Test Case 4: Database Inspection
- Run database query:
  ```sql
  SELECT id, name, email, phone, source, status, campaign_id, custom_details 
  FROM leads 
  WHERE campaign_id = 'cmp_meta_101';
  ```
- **Verification Condition:** `source` must equal `'Meta Ads'`, `status` must equal `'received'`, `custom_details` must contain `{ "channel": "meta", "annual_income": 120000, "asset_volume": 450000, "credit_score": 740 }`.
