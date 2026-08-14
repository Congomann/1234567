# SignalWire Database Schema & Call Logging Analysis

**Target Focus:** Database schema (`telephony_calls`), call state transition logging, backend DB access logic, and call log query endpoints.

---

## 1. Schema File Audit & Database Access Logic

### Schema Files Examination
- **`backend/schema.sql`**: Main local PostgreSQL schema. **`telephony_calls` table is MISSING.**
- **`backend/supabase_schema.sql`**: Master schema for Supabase production deployment. **`telephony_calls` table is MISSING.**
- **`backend/migrations/signalwire_schema.sql`**: Dedicated migration file defining `telephony_calls`, `advisor_extensions`, and `telephony_sms` tables.
- **`backend/server.cjs`**: Initializes core PostgreSQL pool (`pg.Pool`) and runs self-healing `initDB()` for select tables (`portfolios`, `properties`). **`initDB()` does NOT initialize `telephony_calls`, `advisor_extensions`, or `telephony_sms`**.

### DB Access Logic in `backend/routes/signalwire.cjs`
- Creates a dedicated `pg.Pool` instance using `process.env.DATABASE_URL || process.env.POSTGRES_URL`.
- Executes SQL queries (`SELECT`, `INSERT`) inside `try/catch` blocks.
- Implements in-memory fallback stores (`memoryCallsStore`, `memoryExtensionsStore`, `memorySMSStore`) when DB queries fail or throw errors.

---

## 2. `telephony_calls` Table Schema Verification

### Schema Definition (from `backend/migrations/signalwire_schema.sql`):
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

### Key Schema Properties & Gaps:
1. **Primary Key**: `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
2. **Unique Identifier**: `call_sid VARCHAR(255) UNIQUE NOT NULL` for matching SignalWire REST API call SIDs.
3. **Columns**:
   - `from_number`, `to_number` (`VARCHAR(50)`)
   - `direction` (`VARCHAR(20)`)
   - `lead_name`, `lead_id`, `advisor_extension` (`VARCHAR`)
   - `status` (`VARCHAR(50) DEFAULT 'initiated'`)
   - `duration_seconds` (`INT DEFAULT 0`)
   - `recording_url`, `transcript` (`TEXT`)
   - `ai_rating`, `ai_qualification_summary` (`VARCHAR`/`TEXT`)
   - `created_at`, `updated_at` (`TIMESTAMPTZ DEFAULT NOW()`)
4. **Indexes**: **NO INDEXES** are currently defined. Lacks index on `created_at`, `call_sid`, or `lead_id`.
5. **Main Schema Integration Gap**: `telephony_calls` is not present in `backend/schema.sql` or `backend/supabase_schema.sql`.

---

## 3. Call State Transition Logging Inspection

### Current State Transition Flow in `backend/routes/signalwire.cjs`:
1. **Outbound Call Initiation (`POST /api/signalwire/call`)**:
   - Generates `call_sid = 'sw_call_' + randomBytes(6)`.
   - Sends REST API POST request to SignalWire (`Calls.json`).
   - Inserts record into `telephony_calls`.
   - **Bug Identified (Line 177)**: SQL insert parameter `$8` (status) is hardcoded as `'completed'`, even though JS object `newCall.status` is `'in-progress'`.
   - The record is saved as `'completed'` immediately at call start time before ringing or connection.

2. **AI Qualification Call (`POST /api/signalwire/ai-call`)**:
   - Generates `call_sid = 'sw_ai_' + randomBytes(6)`.
   - Inserts record into `telephony_calls` with hardcoded status `'completed'`.

3. **Status Updates & Call Teardown**:
   - **Missing Webhook Handler**: SignalWire asynchronously sends HTTP callbacks (`StatusCallback`) as calls transition through states (`queued` -> `ringing` -> `in-progress` -> `completed` / `failed` / `busy` / `no-answer`).
   - Currently, `backend/routes/signalwire.cjs` lacks a status webhook endpoint (`POST /api/signalwire/status` or `/status-callback`). Call state updates and final call durations are never recorded in DB after initiation.

---

## 4. Call History & Query Endpoints Inspection

### `GET /api/signalwire/calls` (Lines 131–138 in `backend/routes/signalwire.cjs`):
```javascript
router.get('/calls', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM telephony_calls ORDER BY created_at DESC');
    if (rows.length > 0) return res.json(rows);
  } catch (_) { }
  res.json(memoryCallsStore);
});
```

### Issues Identified:
1. **Empty Table Fallback Bug**: `if (rows.length > 0)` causes an empty database table to fall back to `memoryCallsStore` (mock demo calls), preventing users from seeing a clean empty state or actual empty call history.
2. **Missing Endpoint Alias**: `GET /api/signalwire/logs` is not implemented as an endpoint or alias.

---

## 5. Precise Recommendations & File Modification Plans

### A. Database Auto-Migration & Schema Consolidation
1. **Add `telephony_calls` to Master Schemas**:
   - Append `telephony_calls`, `advisor_extensions`, and `telephony_sms` to `backend/schema.sql` and `backend/supabase_schema.sql`.
   - Add performance indexes:
     ```sql
     CREATE INDEX IF NOT EXISTS idx_telephony_calls_created_at ON telephony_calls(created_at DESC);
     CREATE INDEX IF NOT EXISTS idx_telephony_calls_sid ON telephony_calls(call_sid);
     CREATE INDEX IF NOT EXISTS idx_telephony_calls_lead_id ON telephony_calls(lead_id);
     ```
2. **Integrate into Server Startup (`backend/server.cjs`)**:
   - Update `initDB()` in `backend/server.cjs` to include auto-creation of `telephony_calls`, `advisor_extensions`, and `telephony_sms` tables.

### B. Robust Call Logging & State Transition Webhook
1. **Fix Call Initiation SQL (`POST /api/signalwire/call`)**:
   - Change `$8` parameter in SQL insert to pass `newCall.status` (e.g. `'initiated'` or `'in-progress'`) instead of hardcoding `'completed'`.
   - Include `StatusCallback` parameter pointing to `/api/signalwire/status` in the SignalWire API payload.
2. **Implement Status Update Webhook (`POST /api/signalwire/status`)**:
   - Parse `CallSid`, `CallStatus`, `CallDuration`, `RecordingUrl` from request body.
   - Execute SQL query:
     ```sql
     UPDATE telephony_calls 
     SET status = $1, 
         duration_seconds = COALESCE($2, duration_seconds),
         recording_url = COALESCE($3, recording_url),
         updated_at = NOW()
     WHERE call_sid = $4
     ```
   - Update `memoryCallsStore` entry for matching `call_sid`.

### C. Query Endpoint Fixes (`GET /api/signalwire/calls` & `GET /api/signalwire/logs`)
1. **Fix Fallback Logic**:
   - Only return `memoryCallsStore` when `pool.query` throws an exception (DB error or connection failure). Return `rows` directly when query succeeds.
2. **Expose Alias Endpoint**:
   - Add `router.get('/logs', ...)` forwarding to the same query logic as `/calls`.
