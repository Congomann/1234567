# Webhook Interface Requirements Analysis Report (POST `/api/webhooks/campaigns`)

## 1. Observation

### File & Code Findings
1. **Endpoint Mount & Router Setup**:
   - In `backend/server.cjs` (line 19 & line 133):
     ```javascript
     const webhooksRouter = require('./routes/webhooks.cjs');
     app.use('/api/webhooks', webhooksRouter);
     ```
   - In `backend/routes/webhooks.cjs` (lines 120-192), the router defines `router.post('/campaigns', async (req, res) => ...)` which resolves to the absolute endpoint URL `POST /api/webhooks/campaigns`.

2. **Interface Contracts**:
   - `PROJECT.md` (lines 45-49):
     - **Endpoint**: `POST /api/webhooks/campaigns`
     - **Request Headers**: `Content-Type: application/json`
     - **Request Body**:
       ```json
       {
         "channel": "meta" | "google" | "tv",
         "campaign_id": "string",
         "lead": {
           "full_name": "string",
           "email": "string",
           "phone": "string",
           "annual_income": 0,
           "asset_volume": 0,
           "credit_score": 0
         }
       }
       ```
     - **Response**: `{ "success": boolean, "lead_id": string, "status": string }`
   - `SCOPE.md` (lines 20-26) re-confirms this exact interface contract for Milestone M4.

3. **Current Webhook Implementation**:
   - `backend/routes/webhooks.cjs` lines 123-192 currently performs basic lead extraction:
     ```javascript
     const { channel, campaign_id, lead } = req.body || {};
     if (!lead || typeof lead !== 'object') {
       return res.status(400).json({
         success: false,
         error: 'Invalid payload: "lead" object is required'
       });
     }
     ```
   - It performs insertion into Supabase `leads` table and returns status `200` with `{ success: true, lead_id: leadId, status: status }`.

4. **Ad Simulator Payload Generator**:
   - `backend/scripts/adSimulator.cjs` lines 79-90 generates payloads with:
     - `channel`: `'meta'`, `'google'`, or `'tv'`
     - `campaign_id`: string (e.g. `'cmp_meta_wealth_2026'`)
     - `lead`: `{ full_name, email, phone, annual_income, asset_volume, credit_score }`

5. **Database Schema (`leads` table)**:
   - `backend/supabase_schema.sql` (lines 58-83) defines `leads` table columns:
     - `id` (UUID PRIMARY KEY)
     - `name` (VARCHAR(255))
     - `email` (VARCHAR(255))
     - `phone` (VARCHAR(50))
     - `status` (VARCHAR(50) DEFAULT 'New')
     - `source` (VARCHAR(100))
     - `campaign_id` (VARCHAR(255))
     - `custom_details` (JSONB - stores `channel`, `annual_income`, `asset_volume`, `credit_score`)
     - `platform_data` (JSONB)

---

## 2. Logic Chain

1. **Routing Logic**:
   - Because `backend/server.cjs` mounts `webhooksRouter` at `/api/webhooks`, defining `router.post('/campaigns', ...)` inside `backend/routes/webhooks.cjs` directly serves incoming `POST /api/webhooks/campaigns` HTTP requests.

2. **Validation Rule Derivation**:
   - Based on the contract in `PROJECT.md` & `SCOPE.md`, payload fields are categorized into top-level parameters (`channel`, `campaign_id`, `lead`) and nested `lead` attributes (`full_name`, `email`, `phone`, `annual_income`, `asset_volume`, `credit_score`).
   - Validation must verify both presence and correct data types/ranges:
     - `channel`: String, restricted to `'meta'`, `'google'`, or `'tv'` (case-insensitive checking recommended).
     - `campaign_id`: Non-empty string.
     - `lead`: Non-null JSON object.
     - `lead.full_name`: Non-empty string.
     - `lead.email`: String matching email regex (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`).
     - `lead.phone`: Non-empty string.
     - `lead.annual_income`: Non-negative number (`>= 0`).
     - `lead.asset_volume`: Non-negative number (`>= 0`).
     - `lead.credit_score`: Number within standard FICO credit score bounds (`300` to `850`).

3. **Status Codes & Error Formatting Logic**:
   - HTTP `400 Bad Request` must be returned when any of the validation checks fail, containing JSON body `{ "success": false, "error": "<specific error description>" }`.
   - HTTP `415 Unsupported Media Type` or `400 Bad Request` if `Content-Type` is invalid or request body is malformed JSON.
   - HTTP `500 Internal Server Error` with `{ "success": false, "error": "<server error message>" }` if an unexpected exception or unhandled database connection failure occurs.

4. **Success Response Logic**:
   - Upon successful validation and lead insertion into the `leads` table, return HTTP `200 OK` (or `201 Created`) with JSON payload:
     ```json
     {
       "success": true,
       "lead_id": "<generated UUID>",
       "status": "received"
     }
     ```
   - `status` defaults to `"received"` to indicate the lead is stored and pending qualification by the M5 qualification engine.

5. **Testing Strategy Derivation**:
   - Unit and integration tests for `backend/routes/webhooks.cjs` must cover all validation success paths, edge cases, error conditions, and simulator payload integration using Express request simulation (`supertest` or HTTP `fetch` integration scripts).

---

## 3. Caveats

- **No Source Code Modifications**: This report is produced under read-only investigation rules. Implementation fixes or code modifications to `backend/routes/webhooks.cjs` will be executed by Worker agents.
- **Database Fallbacks**: In environments where Supabase / Postgres database credentials are not connected or temporary DB timeouts occur, `webhooks.cjs` uses a fallback UUID generator (`crypto.randomUUID()`) to avoid losing incoming ad lead webhooks. Tests should account for both live DB connection and mocked/fallback execution modes.

---

## 4. Conclusion

### Summary of Requirements & Specifications

#### 1. Payload Validation Rules

| Field | Type | Mandatory? | Validation Criteria / Constraints |
|---|---|---|---|
| `channel` | `string` | **Yes** | Must be one of `['meta', 'google', 'tv']` (case-insensitive string matching). |
| `campaign_id` | `string` | **Yes** | Must be a non-empty string. |
| `lead` | `object` | **Yes** | Must be a non-null JSON object containing lead details. |
| `lead.full_name` | `string` | **Yes** | Must be a non-empty string (fallback: `lead.name`). |
| `lead.email` | `string` | **Yes** | Must be a valid email string (matches `^[^\s@]+@[^\s@]+\.[^\s@]+$`). |
| `lead.phone` | `string` | **Yes** | Must be a non-empty phone string. |
| `lead.annual_income` | `number` | **Yes** | Must be a finite, non-negative number (`>= 0`). |
| `lead.asset_volume` | `number` | **Yes** | Must be a finite, non-negative number (`>= 0`). |
| `lead.credit_score` | `number` | **Yes** | Must be an integer/number between `300` and `850` (FICO score range). |

#### 2. Error Response Format & HTTP Status Codes

- **HTTP Status Codes**:
  - `400 Bad Request`: Payload validation failures (missing/invalid fields).
  - `500 Internal Server Error`: Uncaught backend or database infrastructure failures.
- **JSON Error Payload Structure**:
  ```json
  {
    "success": false,
    "error": "Validation error message specifying invalid field(s)"
  }
  ```

#### 3. Success Response Structure

- **HTTP Status Code**: `200 OK`
- **JSON Success Payload Structure**:
  ```json
  {
    "success": true,
    "lead_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "status": "received"
  }
  ```

#### 4. Unit / Integration Testing Strategy (`backend/routes/webhooks.cjs`)

- **Runner & Setup**: Use `supertest` / Express router testing script or `node:test` harness importing the Express `app` / `webhooksRouter`.
- **Test Suite Structure**:
  1. **Success Cases**:
     - Meta lead payload -> Returns `200 OK`, `success: true`, `status: "received"`, valid `lead_id`.
     - Google lead payload -> Returns `200 OK`.
     - TV lead payload -> Returns `200 OK`.
  2. **Validation Failure Cases (HTTP 400)**:
     - Missing `channel` or unsupported channel (e.g., `'tiktok'`, `'twitter'`).
     - Missing or empty `campaign_id`.
     - Missing `lead` object or non-object `lead`.
     - Missing or empty `lead.full_name`.
     - Invalid `lead.email` format (e.g. `'not-an-email'`).
     - Invalid `lead.annual_income` (negative or non-numeric).
     - Invalid `lead.asset_volume` (negative or non-numeric).
     - Invalid `lead.credit_score` (out of FICO range, e.g. `< 300` or `> 850`).
  3. **Error Handling Cases (HTTP 500)**:
     - Simulated database write failure -> Graceful `500 Internal Server Error` JSON response.
  4. **Ad Simulator Cross-Verification**:
     - Execute `adSimulator.generateMockLead('meta')`, `generateMockLead('google')`, `generateMockLead('tv')` and assert all produced payloads pass validation 100% of the time.

---

## 5. Verification Method

To verify these findings and tests independently:

1. **Inspect Route File**:
   ```bash
   view_file /Users/newholland/1234567/backend/routes/webhooks.cjs
   ```
2. **Inspect Simulator Script**:
   ```bash
   view_file /Users/newholland/1234567/backend/scripts/adSimulator.cjs
   ```
3. **Execute Single Simulator Test**:
   ```bash
   node /Users/newholland/1234567/backend/scripts/adSimulator.cjs --once --target=http://localhost:3001/api/webhooks/campaigns
   ```
4. **Invalidation Conditions**:
   - The contract in `PROJECT.md` or `SCOPE.md` changes.
   - Channel list expands beyond Meta, Google, and TV.
