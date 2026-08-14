## 2026-08-13T17:49:36Z
You are Worker 1 for Milestone M3 (Connected SignalWire Dialer & Call Logging).
Working directory: /Users/newholland/1234567/.agents/worker_m3_r1_1
Workspace directory: /Users/newholland/1234567

MANDATORY ASSIGNMENT:
Read the following files before starting:
- /Users/newholland/1234567/ORIGINAL_REQUEST.md
- /Users/newholland/1234567/PROJECT.md
- /Users/newholland/1234567/.agents/sub_orch_m3/SCOPE.md
- /Users/newholland/1234567/.agents/explorer_m3_r1_1/report.md
- /Users/newholland/1234567/.agents/explorer_m3_r1_2/report.md
- /Users/newholland/1234567/.agents/explorer_m3_r1_3/report.md

WRITE OWNERSHIP:
You have exclusive write access to:
- `pages/crm/TelephonyHub.tsx`
- `backend/routes/signalwire.cjs`
- `backend/schema.sql` (and `backend/migrations/signalwire_schema.sql` or `backend/server.cjs` for DB init if required)

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

TASK SCOPE:
1. Backend & DB (`backend/routes/signalwire.cjs`, `backend/schema.sql`, `backend/server.cjs`):
   - Ensure `telephony_calls` table is properly created in DB schema / `initDB()` so call logs are reliably persisted in PostgreSQL / resilient store.
   - Align `POST /api/signalwire/call` with Telephony API Contract: accept `{ to, from, extension }` (as well as `toNumber`, `advisorExtension`), set initial status to `'in-progress'` (or `'connecting'`) when inserted into `telephony_calls`, and return `{ success: true, callId: string, status: string, sid: string }`.
   - Implement `POST /api/signalwire/hangup` (and/or `POST /api/signalwire/call/status`) endpoint to terminate live calls, update call status to `'completed'` or `'canceled'` and record duration and `ended_at` timestamp in `telephony_calls`.
   - Fix `GET /api/signalwire/calls` DB query fallback logic so actual DB rows are returned when available instead of always defaulting to mock data.
   - Add phone number format validation (e.g. E.164 or basic digit validation) returning HTTP 400 for invalid inputs like "abc".

2. Frontend Dialer UI (`pages/crm/TelephonyHub.tsx`):
   - Upgrade state management from simple boolean `isCalling` to a robust status machine (`idle` | `connecting` | `in-progress` | `ended` | `failed`).
   - Add Backspace / Clear button to keypad UI.
   - Dial button triggers live `POST /api/signalwire/call` call.
   - End Call button triggers `POST /api/signalwire/hangup` live call to terminate call and log duration in DB.
   - Live call timer tracking elapsed time during `in-progress` calls.
   - Display real call history from `GET /api/signalwire/calls` and refresh list when calls end.

3. Build & Test Verification:
   - Run `npm run build` and ensure Vite build passes cleanly with 0 errors.
   - Run `node -c backend/routes/signalwire.cjs` and `node -c backend/server.cjs` to verify syntax.
   - Test endpoints / API functionality if backend server can be executed or tested.

Write detailed implementation notes, build results, and handoff report to `/Users/newholland/1234567/.agents/worker_m3_r1_1/handoff.md` and notify parent via `send_message`.
