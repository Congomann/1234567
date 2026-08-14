# Handoff Report — Explorer 1 (M3: Connected SignalWire Dialer & Call Logging)

## 1. Observation
- **`backend/routes/signalwire.cjs`**:
  - Exposes `/credentials`, `/extensions`, `/calls`, `/call`, `/ai-call`, `/sms/history`, `/sms/send`, `/ivr`, `/ivr-route`.
  - Credentials in environment variables: `SIGNALWIRE_SPACE_URL`, `SIGNALWIRE_PROJECT_ID`, `SIGNALWIRE_API_TOKEN`, `SIGNALWIRE_PHONE_NUMBER`.
  - `POST /api/signalwire/call` (Line 177) inserts call record into `telephony_calls` with hardcoded status `'completed'` instead of `'in-progress'`.
  - Expects `req.body.toNumber` rather than accepting `req.body.to` as specified in API contract (`PROJECT.md` / `SCOPE.md`).
  - No hangup endpoint (`POST /api/signalwire/hangup`) or status update endpoint exists.
  - `GET /api/signalwire/calls` (Line 135) uses `if (rows.length > 0) return res.json(rows);`, falling back to `memoryCallsStore` when DB query succeeds with 0 rows.
- **Database Schema Files**:
  - `backend/migrations/signalwire_schema.sql` defines `advisor_extensions`, `telephony_calls`, and `telephony_sms`.
  - `backend/schema.sql` & `backend/supabase_schema.sql` do **not** contain `telephony_calls`, `advisor_extensions`, or `telephony_sms`.
- **Server Database Initialization (`backend/server.cjs`)**:
  - `initDB()` routine auto-creates `portfolios` and `properties`, but omits `telephony_calls`, `advisor_extensions`, and `telephony_sms`.

## 2. Logic Chain
1. **Schema Propagation**: Without adding `telephony_calls` definitions to `backend/schema.sql` and `backend/supabase_schema.sql` and updating `initDB()` in `server.cjs`, database deployments and automated test setups will lack the required telephony tables.
2. **Call State Integrity**: Hardcoding `$8 = 'completed'` on `INSERT` in `POST /api/signalwire/call` forces all calls to be logged as completed upon creation, breaking state tracking (`initiated` -> `in-progress` -> `completed`).
3. **API Contract Compatibility**: Accepting `toNumber || to` in `POST /api/signalwire/call` and returning `callId` + `sid` ensures compliance with the contract in `PROJECT.md` while maintaining compatibility with `TelephonyHub.tsx`.
4. **Call Termination & Status Operations**: Adding `POST /api/signalwire/hangup` enables SignalWire REST API call cancellation and updates DB status to `completed` with duration.
5. **Fallback Correctness**: Removing `rows.length > 0` check in `GET` handlers ensures DB empty states (`[]`) are rendered correctly without falling back to mock data.

## 3. Caveats
- Live SignalWire REST API calls require valid `SIGNALWIRE_SPACE_URL`, `SIGNALWIRE_PROJECT_ID`, and `SIGNALWIRE_API_TOKEN` environment variables. When running without active credentials, the route logs a warning and proceeds with database / in-memory store logging.
- AI qualification calls currently simulate conversation transcripts in JS. A live AI voice flow requires SWML / SWAIG agent deployment.

## 4. Conclusion
Milestone M3 implementation is structurally feasible with targeted enhancements to `backend/routes/signalwire.cjs`, `backend/server.cjs`, and `backend/schema.sql` / `backend/supabase_schema.sql`. Detailed Worker implementation steps and verification commands are documented in `report.md`.

## 5. Verification Method
- **Schema & Init Test**: Run `node backend/server.cjs` and verify `telephony_calls` table exists in PostgreSQL.
- **API Contract Test**: Send `POST http://localhost:3001/api/signalwire/call` with payload `{"to": "+13125550188"}` and verify response contains `callId`, `sid`, `status: "in-progress"`.
- **Call State Test**: Verify SQL `SELECT status FROM telephony_calls` returns `'in-progress'`, and sending `POST /api/signalwire/hangup` updates status to `'completed'`.
- **Build & Lint Test**: Run `npm run lint` and `npm run build`.
