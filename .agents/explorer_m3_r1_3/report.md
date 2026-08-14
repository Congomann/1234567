# Milestone M3 Investigation Report: Connected SignalWire Dialer & Call Logging

**Explorer**: Explorer 3 (Milestone M3)  
**Working Directory**: `/Users/newholland/1234567/.agents/explorer_m3_r1_3`  
**Workspace Root**: `/Users/newholland/1234567`  
**Date**: 2026-08-13  

---

## Executive Summary

Milestone M3 focuses on establishing a fully integrated **SignalWire Outbound Softphone Dialer** and **DB Call Logging Infrastructure** for the New Holland Financial CRM platform. This investigation examined the end-to-end architecture, contract compliance, environment variable handling, database schema, error handling mechanisms, edge cases, and test strategy requirements.

### Key Discoveries & Recommendations:
1. **Interface Contract Discrepancy Identified**:
   - `PROJECT.md` & `SCOPE.md` define `POST /api/signalwire/call` request payload as `{ "to": string, "from"?: string, "extension"?: string }` and response payload as `{ "success": boolean, "callId": string, "status": string, "sid"?: string }`.
   - `backend/routes/signalwire.cjs` currently expects `{ toNumber, leadName, leadId, advisorExtension }` and returns `{ success: true, call: newCall }`.
   - **Recommendation**: The Worker must update `POST /api/signalwire/call` to support both `to` and `toNumber`, `extension` and `advisorExtension`, and return top-level `callId`, `status`, and `sid` alongside the complete `call` object.
2. **Environment Variable Fallback Resilience**:
   - Credentials (`SIGNALWIRE_PROJECT_ID`, `SIGNALWIRE_API_TOKEN`, `SIGNALWIRE_SPACE_URL`, `SIGNALWIRE_PHONE_NUMBER`) default to fallback strings when unset in process environment.
   - When live credentials are provided, `signalwireFetch` dispatches REST API requests to SignalWire LAML (`Calls.json`). If API calls fail or credentials are missing/invalid, the system gracefully falls back without crashing.
3. **Database & In-Memory Dual Persistence**:
   - Calls are inserted into the PostgreSQL `telephony_calls` table (`backend/migrations/signalwire_schema.sql`).
   - If PostgreSQL is disconnected, an in-memory array (`memoryCallsStore`) ensures zero-downtime availability for UI components. However, empty `catch (_)` blocks currently swallow DB errors without diagnostic output.
4. **Phone Number Validation Gap**:
   - `signalwire.cjs` checks if `toNumber` is present, but does not validate phone number formats (E.164 compliance). Invalid inputs like `"abc"` or `"123"` currently pass through to SignalWire / DB insertion.

---

## 1. System Structure Overview

The SignalWire Dialer & Call Logging subsystem consists of four core components:

```
  ┌─────────────────────────────────────────────────────────────┐
  │                   Frontend Softphone UI                     │
  │              (pages/crm/TelephonyHub.tsx)                   │
  └──────────────────────────────┬──────────────────────────────┘
                                 │ HTTP REST API
                                 ▼
  ┌─────────────────────────────────────────────────────────────┐
  │                 Backend Express API Router                  │
  │      (backend/routes/signalwire.cjs mounted @ /api/signalwire)│
  └──────────────┬──────────────────────────────┬───────────────┘
                 │                              │
                 ▼                              ▼
  ┌──────────────────────────────┐  ┌───────────────────────────┐
  │     SignalWire REST API      │  │   PostgreSQL Database     │
  │ (https://{spaceUrl}/api/...) │  │   (`telephony_calls`)     │
  └──────────────────────────────┘  └───────────────────────────┘
```

### Component Details:

1. **Frontend Softphone UI (`pages/crm/TelephonyHub.tsx`)**:
   - **Tabs**:
     - **Corporate Softphone**: Keypad dialer, extension selector, live call timer, mute toggle, dual-channel recording indicator.
     - **Advisor Extensions Directory**: Lists advisors (`Marcus Vance Ext 101`, `Sarah Jenkins Ext 102`, etc.) with quick-dial actions.
     - **2-Way SMS Inbox**: Threaded SMS interface.
     - **AI Lead Qualifier Bot**: Trigger automated outbound AI qualification calls.
     - **Call Recordings & AI Ratings Log**: Historical view of call audio playback, transcripts, and AI intent ratings (`Warm`, `Mild`, `Cold`).
   - **API Integrations**:
     - `GET /api/signalwire/credentials`
     - `GET /api/signalwire/extensions`
     - `GET /api/signalwire/calls`
     - `GET /api/signalwire/sms/history`
     - `POST /api/signalwire/call`
     - `POST /api/signalwire/ai-call`
     - `POST /api/signalwire/sms/send`

2. **Backend API Router (`backend/routes/signalwire.cjs`)**:
   - Mounted in `backend/server.cjs` at line 137 (`app.use('/api/signalwire', signalwireRouter);`).
   - Leverages `pg.Pool` connected via `process.env.DATABASE_URL || process.env.POSTGRES_URL`.
   - Utilizes `signalwireFetch` helper function to transmit outbound calls/messages to SignalWire REST endpoints via HTTP Basic Auth.
   - Maintains dual persistence: writes to PostgreSQL tables (`telephony_calls`, `advisor_extensions`, `telephony_sms`) and updates in-memory arrays (`memoryCallsStore`, `memoryExtensionsStore`, `memorySMSStore`).

3. **Database Schema (`backend/migrations/signalwire_schema.sql`)**:
   - `telephony_calls`:
     - `id`: UUID (PRIMARY KEY)
     - `call_sid`: VARCHAR(255) (UNIQUE NOT NULL)
     - `direction`: VARCHAR(20) NOT NULL (`outbound` | `inbound` | `ai_qualification`)
     - `from_number`: VARCHAR(50) NOT NULL
     - `to_number`: VARCHAR(50) NOT NULL
     - `lead_name`: VARCHAR(255)
     - `lead_id`: VARCHAR(255)
     - `advisor_extension`: VARCHAR(10)
     - `status`: VARCHAR(50) NOT NULL DEFAULT 'initiated' (`initiated` | `ringing` | `in-progress` | `completed` | `failed`)
     - `duration_seconds`: INT DEFAULT 0
     - `recording_url`: TEXT
     - `transcript`: TEXT
     - `ai_rating`: VARCHAR(20) (`Warm` | `Mild` | `Cold`)
     - `ai_qualification_summary`: TEXT
     - `created_at`, `updated_at`: TIMESTAMPTZ DEFAULT NOW()

---

## 2. Environment Variables & Credentials Handling

The following environment variables govern SignalWire connectivity:

| Environment Variable | Description | Fallback Default Value |
|----------------------|-------------|------------------------|
| `SIGNALWIRE_SPACE_URL` | SignalWire SIP/API Space Hostname | `newhollandfinancialgroup.signalwire.com` |
| `SIGNALWIRE_PROJECT_ID` | SignalWire Account/Project UUID | `3b3475f1-9582-41fb-b2e2-7e6453821fb2` |
| `SIGNALWIRE_API_TOKEN` | SignalWire Project API Token | `PT5b546759c1617e256c38864661f64f54fbe6b3f7e17b89e4` |
| `SIGNALWIRE_PHONE_NUMBER` | Corporate Outbound DID Number | `+18885550199` |

### SignalWire Dispatch Mechanism (`signalwireFetch`):
```javascript
const signalwireFetch = async (endpoint, options = {}) => {
  const authHeader = 'Basic ' + Buffer.from(`${SIGNALWIRE_PROJECT_ID}:${SIGNALWIRE_API_TOKEN}`).toString('base64');
  const url = `https://${SIGNALWIRE_SPACE_URL}/api/laml/2010-04-01/Accounts/${SIGNALWIRE_PROJECT_ID}/${endpoint}`;
  
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
        ...(options.headers || {})
      }
    });
    return await res.json();
  } catch (err) {
    console.warn('[SignalWire API Warning]:', err.message);
    return null;
  }
};
```

### Observations on Credentials Handling:
1. **Zero-Crash Resilience**: If SignalWire credentials are unset, invalid, or API host is unreachable, `signalwireFetch` catches errors and returns `null`. The backend call handler proceeds without crashing, storing the call record in PostgreSQL and in-memory fallback store.
2. **Static Scope Evaluation**: Env vars are evaluated at module load time. Dynamic runtime mutations of `process.env` during test runs require reading environment variables inside request execution or getter helpers.
3. **Mock Mode Reporting**: `GET /api/signalwire/credentials` returns `status: 'connected'` regardless of whether credentials are real or placeholder defaults. Adding a status check (`isMock: boolean` or `status: 'connected' | 'mock'`) provides explicit transparency.

---

## 3. Existing Tests, Build Commands & Verification Tools

### Build & Syntax Verification:
- **Production Web Build**:
  ```bash
  npm run build
  ```
  *Status*: Tested & Passing (Built in 3.68s, 2853 modules transformed). Note: Requires standard filesystem write permissions (`BypassSandbox: true` when running in sandbox environment).
- **Backend Node Syntax Check**:
  ```bash
  node -c backend/routes/signalwire.cjs && node -c backend/server.cjs
  ```
  *Status*: Tested & Passing (0 syntax errors).
- **SignalWire Integration Diagnostic Script**:
  ```bash
  node backend/scripts/setup_signalwire_agent.cjs
  ```
  *Status*: Tested & Passing. Queries SignalWire `IncomingPhoneNumbers.json` API and outputs SWML agent JSON payload definition.

### E2E Test Suite Alignment (`TEST_INFRA.md`):
The project test architecture defines specific test cases for Feature 6 (R3.1) and Feature 7 (R3.2):
- **Tier 1 (Feature Coverage)**:
  - `T1-R3.1-1`: Submit dial request to `/api/signalwire/call` with valid target phone number.
  - `T1-R3.1-2`: Verify backend reads SignalWire environment credentials.
  - `T1-R3.1-3`: Verify API response returns success status and generated call SID/id.
  - `T1-R3.1-4`: Verify softphone UI transitions to "Calling" state.
  - `T1-R3.1-5`: Verify softphone UI provides functional "Hangup" control.
  - `T1-R3.2-1`: Outbound call placement creates record in `telephony_calls` table.
  - `T1-R3.2-2`: Call log entry captures phone number, timestamp, direction ('outbound'), status ('initiated'/'in-progress').
  - `T1-R3.2-3`: Call state update updates existing DB record.
  - `T1-R3.2-4`: Call duration recorded upon termination.
  - `T1-R3.2-5`: `GET /api/signalwire/calls` returns historical call records.
- **Tier 2 (Boundary & Corner)**:
  - `T2-R3.1-1`: Invalid phone number format (`abc`, `123`) returns HTTP 400.
  - `T2-R3.1-2`: Missing SignalWire env vars returns graceful fallback response or mock status.
  - `T2-R3.1-3`: Network timeout to SignalWire API handles error cleanly.
  - `T2-R3.1-4`: Duplicate simultaneous call attempt rejected or handled cleanly.
  - `T2-R3.1-5`: International phone number format (`+44 20 7946 0912`) processed correctly.
  - `T2-R3.2-1`: Long call duration (8+ hours / 28,800s) integer safety.
  - `T2-R3.2-2`: Failed call attempt status logged accurately in DB.
  - `T2-R3.2-3`: Database disconnection during call logs error cleanly without API crash.
  - `T2-R3.2-4`: Special characters in client name/notes sanitized before SQL insertion.
  - `T2-R3.2-5`: Concurrent call logs (50+ calls) handle DB transaction locking cleanly.

---

## 4. Edge Cases & Potential Failure Modes

| Edge Case ID | Scenario | Current Behavior | Target / Expected Behavior |
|--------------|----------|------------------|---------------------------|
| **EC-01** | Invalid Phone Number (`"abc"`, `"123"`, `""`) | Passed directly to SignalWire API & DB insertion. Returns 200 with fake SID. | Return HTTP 400 `{ error: "Invalid phone number format. Phone number must be in valid E.164 format (e.g. +18885550199)" }`. |
| **EC-02** | Payload Parameter Key Mismatch (`"to"` vs `"toNumber"`) | Route checks `if (!toNumber)` and returns HTTP 400 if only `"to"` is sent. | Support both `to` and `toNumber` transparently (`const targetNumber = req.body.to || req.body.toNumber;`). |
| **EC-03** | Interface Contract Missing Top-Level Response Fields | Response returns `{ success: true, call: newCall }` without top-level `callId` or `sid`. | Return `{ success: true, callId: newCall.id, status: newCall.status, sid: newCall.call_sid, call: newCall }`. |
| **EC-04** | SignalWire REST API Timeout / 500 Error | `signalwireFetch` catches error, logs warning, returns `null`. Express route succeeds with mock call. | Maintain resilience, log warning cleanly, record `status: 'completed'` (mock mode) or `status: 'failed'` depending on execution mode. |
| **EC-05** | PostgreSQL Database Disconnection / Query Error | Silent empty catch `catch (_)` in `signalwire.cjs`. Call saved to memory store only. | Log error explicitly (`console.error('[SignalWire DB Error]:', err.message)`), fallback to in-memory store cleanly. |
| **EC-06** | Special Characters / SQL Injection in `leadName` or `transcript` | Parameterized SQL queries (`$1..$13`) prevent SQL injection. | Maintain parameterized queries and add basic string sanitization for XSS prevention in UI. |
| **EC-07** | High Concurrent Outbound Call Requests | Handled sequentially by Express event loop. Memory store unshifted. | DB connection pool handles up to 20 concurrent connections; in-memory store thread-safe in single-thread Node.js loop. |

---

## 5. Test Strategies & Verification Checklists

### A. Test Execution Strategy:
- Build E2E test file `tests/e2e/m3_telephony.test.mjs` using native Node.js HTTP/fetch requests against local backend server (`http://localhost:3001`).
- Test runner script should exit with `code 0` on 100% pass, and non-zero code on failure.

### B. Unit & Integration Verification Steps:
1. **Parameter & Payload Normalization Test**:
   - Post `{ "to": "+13125550188", "extension": "101" }` -> verify HTTP 200 and response contains `callId`, `status`, and `sid`.
   - Post `{ "toNumber": "+13125550188", "advisorExtension": "101" }` -> verify HTTP 200 and successful call object.
2. **Invalid Phone Number Validation Test**:
   - Post `{ "to": "invalid_phone" }` -> verify HTTP 400 error.
   - Post `{ "to": "" }` -> verify HTTP 400 error.
3. **Database Insertion & Retrieval Test**:
   - Post valid call request -> verify response call ID matches record returned by `GET /api/signalwire/calls`.
4. **Extension Listing Test**:
   - `GET /api/signalwire/extensions` -> verify array of extensions containing `101`, `102`, `103`, `104`.
5. **Credentials Endpoint Test**:
   - `GET /api/signalwire/credentials` -> verify valid JSON returning `spaceUrl`, `projectId`, `phoneNumber`, and `status`.

---

### C. Role-Based Verification Checklists

#### 1. Worker Checklist:
- [ ] Implement dual-key normalization in `POST /api/signalwire/call` (`to` / `toNumber`, `extension` / `advisorExtension`).
- [ ] Align `POST /api/signalwire/call` response payload with `PROJECT.md` contract (`success`, `callId`, `status`, `sid`).
- [ ] Add phone number validation (E.164 regex check) returning HTTP 400 for invalid formats.
- [ ] Add explicit error logging in `catch` blocks for DB operations (replace silent `catch (_)`).
- [ ] Verify `npm run build` and `node -c backend/routes/signalwire.cjs` execute without errors.
- [ ] Write and run local verification test script.

#### 2. Reviewer Checklist:
- [ ] Verify exact adherence to Interface Contract specified in `PROJECT.md` and `SCOPE.md`.
- [ ] Inspect error handling code: confirm no unhandled promise rejections or silent crash risks.
- [ ] Confirm parameterized SQL query usage for all DB insertions (`telephony_calls`).
- [ ] Validate dual-persistence mechanism (PostgreSQL DB with in-memory store fallback).
- [ ] Verify UI component (`TelephonyHub.tsx`) handles API responses and errors gracefully.

#### 3. Challenger Checklist:
- [ ] Execute attack vectors: pass malformed phone numbers (`"abc"`, `"<script>alert(1)</script>"`, `null`).
- [ ] Test missing request body properties (`{}` or `{ "from": "+1800" }`).
- [ ] Simulate network failure or invalid credentials in `SIGNALWIRE_API_TOKEN` and verify API stability.
- [ ] Execute concurrent burst of 50 dial requests to test database pool locking and memory store stability.
- [ ] Confirm test suite execution returns exit code `0` on success and non-zero code on failure.

---

## Conclusion

Milestone M3 has a strong architectural foundation in both backend (`backend/routes/signalwire.cjs`) and frontend (`pages/crm/TelephonyHub.tsx`). By closing the interface contract parameter gaps, enforcing phone number validation, enhancing error logging, and establishing the automated test suite, Milestone M3 will achieve full production readiness and gate compliance.
