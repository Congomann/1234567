# Milestone M3 Investigation Report: Connected SignalWire Dialer & Call Logging

## Executive Summary
This report provides a detailed investigation into the backend SignalWire routes (`backend/routes/signalwire.cjs`, `backend/server.cjs`) and database logging infrastructure (`telephony_calls` table across schema files) for Milestone M3 (Features R3.1 and R3.2).

While basic SignalWire REST dispatch and fallback mock handlers exist in `backend/routes/signalwire.cjs`, several critical gaps, API contract mismatches, schema omissions, and logic bugs prevent full end-to-end integration and persistent call state logging.

---

## 1. Codebase Architecture & Key File Inspection

### 1.1 Backend Router (`backend/routes/signalwire.cjs`)
- **SignalWire Credentials**:
  - `SIGNALWIRE_SPACE_URL`: process.env.SIGNALWIRE_SPACE_URL || `'newhollandfinancialgroup.signalwire.com'`
  - `SIGNALWIRE_PROJECT_ID`: process.env.SIGNALWIRE_PROJECT_ID || `'3b3475f1-9582-41fb-b2e2-7e6453821fb2'`
  - `SIGNALWIRE_API_TOKEN`: process.env.SIGNALWIRE_API_TOKEN || `'PT5b546759c1617e256c38864661f64f54fbe6b3f7e17b89e4'`
  - `SIGNALWIRE_PHONE_NUMBER`: process.env.SIGNALWIRE_PHONE_NUMBER || `'+18885550199'`
- **SignalWire REST API Helper (`signalwireFetch`)**:
  - Constructs `Basic Auth` header using `Buffer.from(PROJECT_ID + ':' + API_TOKEN).toString('base64')`.
  - Target URL: `https://${SIGNALWIRE_SPACE_URL}/api/laml/2010-04-01/Accounts/${SIGNALWIRE_PROJECT_ID}/${endpoint}`.
  - Sends `x-www-form-urlencoded` payloads.

- **Existing Routes**:
  - `GET /api/signalwire/credentials`: Exposes space URL, project ID, phone number, and connection status.
  - `GET /api/signalwire/extensions`: Queries `advisor_extensions` with fallback to `memoryExtensionsStore`.
  - `GET /api/signalwire/calls`: Queries `telephony_calls` with fallback to `memoryCallsStore`.
  - `POST /api/signalwire/call`: Initiates outbound softphone call via SignalWire `Calls.json` REST API, inserts call record into `telephony_calls`, and updates `memoryCallsStore`.
  - `POST /api/signalwire/ai-call`: Simulates an outbound AI qualification call, assigns rating ('Warm'|'Mild'|'Cold'), inserts into `telephony_calls`, and updates `memoryCallsStore`.
  - `GET /api/signalwire/sms/history` & `POST /api/signalwire/sms/send`: Manages SMS sending and history.
  - `POST /api/signalwire/ivr` & `POST /api/signalwire/ivr-route`: Returns LaML XML for inbound interactive voice response (IVR).

### 1.2 Server & Database Initialization (`backend/server.cjs`)
- `backend/server.cjs` mounts `signalwireRouter` at `/api/signalwire` (Line 137).
- `server.cjs` runs `initDB()` (Lines 208–245) upon startup to automatically self-heal missing database tables (`portfolios`, `properties`).
- **Critical Finding**: `initDB()` does **NOT** include `telephony_calls`, `advisor_extensions`, or `telephony_sms`.

---

## 2. Database Schema Analysis (`telephony_calls`)

### 2.1 Schema Definitions Comparison
- **`backend/migrations/signalwire_schema.sql`**:
  Defines `telephony_calls` table:
  ```sql
  CREATE TABLE IF NOT EXISTS telephony_calls (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      call_sid VARCHAR(255) UNIQUE NOT NULL,
      direction VARCHAR(20) NOT NULL, -- 'inbound' | 'outbound' | 'ai_qualification'
      from_number VARCHAR(50) NOT NULL,
      to_number VARCHAR(50) NOT NULL,
      lead_name VARCHAR(255),
      lead_id VARCHAR(255),
      advisor_extension VARCHAR(10),
      status VARCHAR(50) NOT NULL DEFAULT 'initiated', -- 'initiated'|'ringing'|'in-progress'|'completed'|'failed'
      duration_seconds INT DEFAULT 0,
      recording_url TEXT,
      transcript TEXT,
      ai_rating VARCHAR(20), -- 'Warm' | 'Mild' | 'Cold'
      ai_qualification_summary TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
  );
  ```
- **`backend/schema.sql`**: `telephony_calls` table definition is **MISSING**.
- **`backend/supabase_schema.sql`**: `telephony_calls` table definition is **MISSING**.

### 2.2 Missing Indexes
No indexes exist for fast queries on `telephony_calls`. Recommended indexes:
- `idx_telephony_calls_created_at` ON `telephony_calls(created_at DESC)`
- `idx_telephony_calls_sid` ON `telephony_calls(call_sid)`
- `idx_telephony_calls_lead_id` ON `telephony_calls(lead_id)`

---

## 3. Detailed Gaps, Bugs, and Missing Features

| # | Category | Issue Description | Impact |
|---|----------|-------------------|--------|
| 1 | **Database Schema** | `telephony_calls`, `advisor_extensions`, `telephony_sms` missing from `backend/schema.sql` & `backend/supabase_schema.sql`. | Production setup/migrations will fail to create telephony tables. |
| 2 | **Self-Healing Init** | `initDB()` in `backend/server.cjs` does not initialize telephony tables. | Local/Dev startup without manually running migration script fails SQL queries on telephony tables. |
| 3 | **SQL Hardcode Bug** | `POST /api/signalwire/call` (Line 177) hardcodes status parameter `$8` to `'completed'` in SQL `INSERT`. | Calls are logged as `'completed'` immediately at initiation, violating state transition tracking (`initiated` -> `in-progress` -> `completed`). |
| 4 | **Missing Hangup Route** | No `POST /api/signalwire/hangup` or `POST /api/signalwire/call/:callSid/hangup` route. | Users clicking "End Call" cannot terminate live SignalWire calls or record call termination in DB. |
| 5 | **Missing Status Route** | No `GET /api/signalwire/call/:callSid` or `POST /api/signalwire/status` endpoint to fetch or process live call status callbacks. | Call status updates (`ringing`, `in-progress`, `completed`, `failed`) are never received or saved in DB. |
| 6 | **API Contract Mismatch** | `PROJECT.md`/`SCOPE.md` API contract specifies `POST /api/signalwire/call` payload `{ to, from?, extension? }` and response `{ success, callId, status, sid? }`. Code expects `toNumber` and returns `{ success, call }`. | Client calls using standard contract field names (`to`) return HTTP 400 error. |
| 7 | **Faulty DB Fallback** | `GET /api/signalwire/calls` line 135 checks `if (rows.length > 0) return res.json(rows)`. | If DB is connected and `telephony_calls` exists but has 0 records, it falls back to mock data (`memoryCallsStore`), masking real empty state. |
| 8 | **AI Call REST Dispatch** | `POST /api/signalwire/ai-call` creates local mock record but does not trigger live SignalWire REST call or SWML script. | Live AI qualification call is not placed to actual phone line. |

---

## 4. Worker Implementation Recommendations & Architectural Plan

### Step 1: Database Schema Integration & Auto-Initialization
1. Append `advisor_extensions`, `telephony_calls`, and `telephony_sms` schemas (including indexes) to both `backend/schema.sql` and `backend/supabase_schema.sql`.
2. Update `initDB()` in `backend/server.cjs` to include:
   ```sql
   CREATE TABLE IF NOT EXISTS advisor_extensions (...);
   CREATE TABLE IF NOT EXISTS telephony_calls (...);
   CREATE TABLE IF NOT EXISTS telephony_sms (...);
   ```
   Also insert seed extensions if `advisor_extensions` is empty.

### Step 2: Fix & Expand Backend SignalWire Router (`backend/routes/signalwire.cjs`)
1. **Normalize Input & Response for `POST /api/signalwire/call`**:
   - Parse `toNumber = req.body.toNumber || req.body.to`.
   - Set initial status to `'in-progress'` (or `'initiated'`).
   - Fix SQL `INSERT` parameter `$8` from `'completed'` to `newCall.status`.
   - Return `{ success: true, callId: newCall.id, sid: newCall.call_sid, status: newCall.status, call: newCall }`.
2. **Implement Call Hangup Endpoint (`POST /api/signalwire/hangup`)**:
   - Accept `{ callSid, durationSeconds }`.
   - Send REST POST to SignalWire `Calls/${callSid}.json` with `Status=completed`.
   - Run SQL `UPDATE telephony_calls SET status = 'completed', duration_seconds = $1, updated_at = NOW() WHERE call_sid = $2`.
   - Update in-memory `memoryCallsStore` entry.
3. **Implement Status Fetch & Callback Endpoint (`POST /api/signalwire/status` & `GET /api/signalwire/call/:callSid`)**:
   - Query DB for call status by `call_sid`.
   - Handle status callbacks from SignalWire to update call state in DB.
4. **Fix DB Query Fallback Logic**:
   - Change `GET /api/signalwire/calls` (and extensions, sms) to:
     ```javascript
     try {
       const { rows } = await pool.query('SELECT * FROM telephony_calls ORDER BY created_at DESC');
       return res.json(rows); // Return rows directly, even if empty array []
     } catch (_) {
       // Fallback ONLY when DB query throws error
       res.json(memoryCallsStore);
     }
     ```

### Step 3: Frontend Integration Sync (`pages/crm/TelephonyHub.tsx`)
1. Ensure softphone "End Call" handler invokes `POST /api/signalwire/hangup` passing active call SID and duration.

---

## 5. Independent Verification Method

1. **Schema & DB Initialization Check**:
   - Start backend server: `npm run server:local` or `node backend/server.cjs`.
   - Verify DB table creation using PostgreSQL client or diagnostic query: `SELECT count(*) FROM telephony_calls`.
2. **Outbound Call API & DB Insertion Check**:
   - Execute POST request:
     ```bash
     curl -X POST http://localhost:3001/api/signalwire/call \
       -H "Content-Type: application/json" \
       -d '{"to": "+13125550188", "leadName": "Test Lead", "advisorExtension": "101"}'
     ```
   - Verify response contains `success: true`, `callId`, `sid`, and `status: "in-progress"`.
   - Check DB query `SELECT status FROM telephony_calls WHERE call_sid = '<sid>'` returns `'in-progress'` (not hardcoded `'completed'`).
3. **Call Hangup Check**:
   - Execute POST hangup request:
     ```bash
     curl -X POST http://localhost:3001/api/signalwire/hangup \
       -H "Content-Type: application/json" \
       -d '{"callSid": "<sid>", "durationSeconds": 30}'
     ```
   - Check DB query `SELECT status, duration_seconds FROM telephony_calls WHERE call_sid = '<sid>'` returns `'completed'` and `30`.
4. **Build & Lint Verification**:
   - Run `npm run lint` (TypeScript compilation check).
   - Run `npm run build` (Vite frontend build).
