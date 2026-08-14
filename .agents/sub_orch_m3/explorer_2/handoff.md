# Handoff Report: Explorer 2 (Retry 3) — Database Schema & Call State Logging Analysis

## 1. Observation

- **Schema Files**:
  - `backend/schema.sql`: Contains core tables (`users`, `leads`, `clients`, `events`, `portfolios`, `transactions`, etc.), but does **not** contain `telephony_calls`.
  - `backend/supabase_schema.sql`: Contains master deployment tables (539 lines), but does **not** contain `telephony_calls`.
  - `backend/migrations/signalwire_schema.sql`: Lines 16–33 define `telephony_calls` table with columns: `id`, `call_sid`, `direction`, `from_number`, `to_number`, `lead_name`, `lead_id`, `advisor_extension`, `status`, `duration_seconds`, `recording_url`, `transcript`, `ai_rating`, `ai_qualification_summary`, `created_at`, `updated_at`. No indexes are defined on this table.
- **Server DB Initialization**:
  - `backend/server.cjs`: `initDB()` (lines 208–245) creates `portfolios` and `properties` if missing, but does **not** create `telephony_calls`, `advisor_extensions`, or `telephony_sms`.
- **Backend API Routes (`backend/routes/signalwire.cjs`)**:
  - **`POST /api/signalwire/call` (Line 177)**: SQL query parameter `$8` for `status` is hardcoded as `'completed'`:
    ```javascript
    INSERT INTO telephony_calls 
    (call_sid, direction, from_number, to_number, lead_name, lead_id, advisor_extension, status, duration_seconds, recording_url, transcript, ai_rating, ai_qualification_summary)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    ```
    Where `$8` receives `'completed'` hardcoded, despite `newCall.status` being `'in-progress'`.
  - **Status Updates**: There is currently no `POST /api/signalwire/status` endpoint to handle SignalWire status callbacks (`queued`, `ringing`, `in-progress`, `completed`, `failed`, `busy`, `no-answer`).
  - **`GET /api/signalwire/calls` (Lines 131–138)**: Uses `if (rows.length > 0) return res.json(rows);`. When the DB table exists but has 0 rows, `rows.length > 0` is false, forcing fallback to `memoryCallsStore`.
  - **`GET /api/signalwire/logs`**: Endpoint does not currently exist.

## 2. Logic Chain

1. **Observation**: `telephony_calls` exists in `signalwire_schema.sql`, but is omitted from `schema.sql`, `supabase_schema.sql`, and `server.cjs` `initDB()`.
   **Inference**: Fresh PostgreSQL database setups or environments that did not manually execute `signalwire_schema.sql` will throw DB errors on call insert unless auto-created by `initDB()`.
2. **Observation**: Line 177 of `signalwire.cjs` passes `'completed'` for `$8` in the SQL `INSERT` statement.
   **Inference**: Outbound calls are logged in PostgreSQL immediately as `'completed'` rather than tracking real-time status transitions.
3. **Observation**: SignalWire REST API sends asynchronous status webhooks, but `signalwire.cjs` lacks a status callback route (`POST /api/signalwire/status`).
   **Inference**: Post-initiation updates (e.g. call duration, ringing, answered, completed, recording URL) are never reflected in the database.
4. **Observation**: `GET /api/signalwire/calls` checks `rows.length > 0` before returning DB results.
   **Inference**: An empty database returns mock data (`memoryCallsStore`) instead of an empty array (`[]`).
5. **Conclusion**: Adding `telephony_calls` auto-initialization to `server.cjs`, creating `POST /api/signalwire/status`, fixing the hardcoded SQL parameter in `POST /api/signalwire/call`, and fixing fallback logic in `GET /api/signalwire/calls` will ensure robust DB call state logging.

## 3. Caveats

- Live SignalWire REST API requires valid network credentials (`SIGNALWIRE_PROJECT_ID`, `SIGNALWIRE_API_TOKEN`, `SIGNALWIRE_SPACE_URL`, `SIGNALWIRE_PHONE_NUMBER`) for live call dispatching.
- In-memory store fallback logic should remain active when DB connection fails to guarantee zero-downtime demo mode operation.

## 4. Conclusion

The database schema definition for `telephony_calls` is structurally sound in `signalwire_schema.sql`, but requires:
1. Consolidation into `backend/schema.sql`, `backend/supabase_schema.sql`, and `initDB()` in `backend/server.cjs`.
2. Addition of indexes on `created_at DESC`, `call_sid`, and `lead_id`.
3. Correction of hardcoded `'completed'` SQL status parameter in `POST /api/signalwire/call`.
4. Creation of `POST /api/signalwire/status` for real-time status transitions (`queued`, `ringing`, `in-progress`, `completed`, `failed`, `busy`, `no-answer`).
5. Fixing `GET /api/signalwire/calls` empty table handling and alias endpoint `GET /api/signalwire/logs`.

## 5. Verification Method

- **Schema Check**: Run `node backend/scripts/diagnose_db.cjs` or execute `SELECT table_name FROM information_schema.tables WHERE table_name = 'telephony_calls'` against the database.
- **Call Insertion & Update Check**: Send `POST /api/signalwire/call` with payload `{ "toNumber": "+13125550188" }` and verify `telephony_calls` status is initialized to `'initiated'` or `'in-progress'`.
- **Status Webhook Check**: Send `POST /api/signalwire/status` with `{ "CallSid": "sw_call_...", "CallStatus": "completed", "CallDuration": "45" }` and verify SQL row is updated.
- **Call History Endpoint Check**: Execute `curl http://localhost:3001/api/signalwire/calls` and `curl http://localhost:3001/api/signalwire/logs`.
