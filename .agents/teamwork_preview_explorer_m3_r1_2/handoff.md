# Handoff Report: Telephony Calls DB Schema & Access Layer Analysis

## 1. Observation

Direct observations from codebase inspection:

### Schema Definitions & Location
- **`backend/migrations/signalwire_schema.sql` (Lines 16–33)**: Defines `telephony_calls` table schema:
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
- **`backend/schema.sql` (439 lines)**: Main local PostgreSQL schema script. Does **not** contain `telephony_calls`.
- **`backend/supabase_schema.sql` (539 lines)**: Master Supabase production schema script. Does **not** contain `telephony_calls`.
- **`backend/server.cjs` (Lines 208–245)**: Self-healing database initialization function `initDB()` currently creates `portfolios` and `properties` if missing, but does **not** create `telephony_calls`, `advisor_extensions`, or `telephony_sms`.

### Existing Backend DB Access Layer
- **`backend/routes/signalwire.cjs`**:
  - Initializes PostgreSQL pool (`pg.Pool`) on lines 7–11 using `process.env.DATABASE_URL || process.env.POSTGRES_URL`.
  - Maintains `memoryCallsStore` array (lines 88, 27–60) as a fallback mechanism for missing tables or DB offline scenarios.
  - `GET /api/signalwire/calls` (Lines 132–138): Queries `SELECT * FROM telephony_calls ORDER BY created_at DESC`. Returns DB rows if `rows.length > 0`, else falls back to `memoryCallsStore`.
  - `POST /api/signalwire/call` (Lines 141–182): Generates random `callSid`, makes fetch request to SignalWire REST API, and inserts call record into `telephony_calls`:
    ```javascript
    await pool.query(`
      INSERT INTO telephony_calls 
      (call_sid, direction, from_number, to_number, lead_name, lead_id, advisor_extension, status, duration_seconds, recording_url, transcript, ai_rating, ai_qualification_summary)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    `, [newCall.call_sid, newCall.direction, newCall.from_number, newCall.to_number, newCall.lead_name, newCall.lead_id, newCall.advisor_extension, 'completed', newCall.duration_seconds, newCall.recording_url, newCall.transcript, newCall.ai_rating, newCall.ai_qualification_summary]);
    ```
    *Note*: Hardcodes status to `'completed'` and mock duration/recording/transcript directly on insertion.
  - `POST /api/signalwire/ai-call` (Lines 185–229): Inserts AI qualification call record into `telephony_calls` with assigned rating (`Warm`|`Mild`|`Cold`), summary, and transcript.

---

## 2. Table Structure & Index Specifications

### Columns & Data Types Table
| Column Name | Data Type | Constraints & Defaults | Description |
|-------------|-----------|------------------------|-------------|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Unique call record identifier |
| `call_sid` | `VARCHAR(255)` | `UNIQUE NOT NULL` | SignalWire Call SID (e.g. `sw_call_...`, `CA...`) |
| `direction` | `VARCHAR(20)` | `NOT NULL` | Call direction (`inbound`, `outbound`, `ai_qualification`) |
| `from_number` | `VARCHAR(50)` | `NOT NULL` | Caller phone number |
| `to_number` | `VARCHAR(50)` | `NOT NULL` | Recipient phone number |
| `lead_name` | `VARCHAR(255)` | Nullable | Associated lead name |
| `lead_id` | `VARCHAR(255)` | Nullable | Optional foreign key / ID linking to lead |
| `advisor_extension` | `VARCHAR(10)` | Nullable | Advisor extension handling the call (e.g., `101`) |
| `status` | `VARCHAR(50)` | `NOT NULL DEFAULT 'initiated'` | Lifecycle status (`initiated`, `ringing`, `in-progress`, `completed`, `failed`) |
| `duration_seconds` | `INT` | `DEFAULT 0` | Total duration of call in seconds |
| `recording_url` | `TEXT` | Nullable | URL to stored audio recording MP3 file |
| `transcript` | `TEXT` | Nullable | Conversation transcript text |
| `ai_rating` | `VARCHAR(20)` | Nullable | Lead qualification rating (`Warm`, `Mild`, `Cold`) |
| `ai_qualification_summary` | `TEXT` | Nullable | Summary from AI evaluation engine |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Record creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Record update timestamp |

### Index Recommendations
To optimize high-frequency query access paths, the following indexes should be added:
```sql
CREATE INDEX IF NOT EXISTS idx_telephony_calls_created_at ON telephony_calls(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_telephony_calls_call_sid ON telephony_calls(call_sid);
CREATE INDEX IF NOT EXISTS idx_telephony_calls_lead_id ON telephony_calls(lead_id);
```

---

## 3. Logic Chain

1. **Observation 1**: `telephony_calls` definition exists in `backend/migrations/signalwire_schema.sql` but is absent from `backend/schema.sql`, `backend/supabase_schema.sql`, and `backend/server.cjs` `initDB()`.
2. **Logic Step 1**: Without auto-creating `telephony_calls` on startup or running migrations during initialization, new environments or fresh local Postgres instances will throw `relation "telephony_calls" does not exist` on `pool.query('SELECT * FROM telephony_calls...')`. While the route safely falls back to `memoryCallsStore` on error, persistent call state logging will fail silently to memory.
3. **Observation 2**: `POST /api/signalwire/call` currently executes an `INSERT` statement with hardcoded status `'completed'`, hardcoded duration (45 seconds), and static recording/transcript strings immediately when the endpoint is invoked.
4. **Logic Step 2**: Real-time telephony lifecycle requires state progression. Upon call placement, the initial state should be `'initiated'` (or `'in-progress'`), and then updated to `'completed'`, `'failed'`, or `'no-answer'` when the call terminates or when SignalWire status callback/webhook is invoked.
5. **Observation 3**: SignalWire REST API supports `StatusCallback` parameters and webhook event notifications for call status changes.
6. **Logic Step 3**: A dedicated update function or endpoint (e.g. `POST /api/signalwire/status`) executing `UPDATE telephony_calls SET status = $2, duration_seconds = COALESCE($3, duration_seconds), updated_at = NOW() WHERE call_sid = $1` will cleanly transition states throughout the call lifecycle and keep both PostgreSQL and `memoryCallsStore` synchronized.

---

## 4. Caveats

- **No Caveats**: All relevant files (`signalwire_schema.sql`, `schema.sql`, `supabase_schema.sql`, `server.cjs`, `signalwire.cjs`, `TelephonyHub.tsx`, and `diagnose_db.cjs`) were examined directly.
- Assumption: `memoryCallsStore` must remain as an active fallback mechanism for un-migrated or offline DB environments to guarantee zero UI downtime.

---

## 5. Conclusion & Recommended DB Interaction Pattern

### Key Findings
1. Schema for `telephony_calls` is fully defined in `backend/migrations/signalwire_schema.sql`, but must be added to `server.cjs` `initDB()`, `backend/schema.sql`, and `backend/supabase_schema.sql` to guarantee self-healing execution on server start.
2. The database structure cleanly accommodates call SID, caller/callee numbers, direction, status, timestamps, duration, recording URL, transcript, and AI rating.
3. Recommended indexes (`idx_telephony_calls_created_at`, `idx_telephony_calls_call_sid`, `idx_telephony_calls_lead_id`) will ensure fast query execution for `GET /api/signalwire/calls` and status updates.

### Recommended Call Lifecycle DB Operations Pattern
```
[Client / Softphone] -> POST /api/signalwire/call
  │
  ├── 1. Generate call_sid (or receive from SignalWire API)
  ├── 2. DB INSERT into telephony_calls with status = 'initiated' (or 'in-progress')
  └── 3. Update memoryCallsStore unshift(newCall)

[SignalWire Event / Status Callback] -> POST /api/signalwire/status
  │
  ├── 1. Receive call_sid, CallStatus, CallDuration, RecordingUrl
  ├── 2. DB UPDATE telephony_calls 
  │      SET status = $2, duration_seconds = COALESCE($3, duration_seconds), 
  │          recording_url = COALESCE($4, recording_url), updated_at = NOW()
  │      WHERE call_sid = $1
  └── 3. Update matching item in memoryCallsStore
```

---

## 6. Verification Method

1. **Verify Schema Setup**:
   Inspect `backend/migrations/signalwire_schema.sql` lines 16–33.
2. **Verify Table Existence in Database**:
   Run node diagnostic tool:
   ```bash
   node backend/scripts/diagnose_db.cjs
   ```
   Or execute SQL query:
   ```sql
   SELECT table_name FROM information_schema.tables WHERE table_name = 'telephony_calls';
   ```
3. **Verify DB Read/Write Operations**:
   Execute POST call to endpoint `/api/signalwire/call` with payload `{"toNumber": "+13125550188"}` and verify that a row is inserted in `telephony_calls` with corresponding `call_sid`.
