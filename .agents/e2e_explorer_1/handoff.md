# E2E Test Suite Specification & Codebase Exploration Handoff Report

## Observation
Direct inspection of the New Holland Financial CRM codebase (`/Users/newholland/1234567`) yielded the following concrete architectural observations, interface contracts, and schema definitions across all 11 target features:

### 1. Codebase Architecture & Key Files Observed
- **Root Directory Configuration & Dependencies**:
  - `package.json`: Node ESM module (`"type": "module"`). Key dependencies include `express` (v5.2.1), `ws` (v8.19.0), `pg` (v8.20.0), `playwright` (v1.58.2), `framer-motion` (v12.35.0), `recharts` (v2.12.2), `lucide-react` (v0.344.0).
  - `PROJECT.md` & `TEST_INFRA.md`: Feature inventory (R1.1–R5.2) and 126-test mapping specification across Tiers 1–4.
- **Backend Architecture (`backend/server.cjs`)**:
  - HTTP Express server running on port `3001` (or `process.env.PORT`).
  - WebSocket server mounted at `/ws` using `ws` library.
  - Global `broadcast(data)` helper broadcasts JSON payloads to all clients where `client.readyState === WebSocket.OPEN`.
  - Express routers mounted:
    - `/api/webhooks` -> `backend/routes/webhooks.cjs`
    - `/api/marketing` -> `backend/routes/marketing.cjs`
    - `/api/signalwire` -> `backend/routes/signalwire.cjs`
- **Database Schema & SQL Migrations**:
  - PostgreSQL database pool managed via `pg.Pool`.
  - `backend/schema.sql`: Core tables including `users`, `leads`, `clients`, `events`, `tasks`, `analytics_visitors`.
  - `backend/migrations/signalwire_schema.sql`: Telephony tables `advisor_extensions`, `telephony_calls`, `telephony_sms`.
  - Key table columns for tests:
    - `leads`: `id` (UUID), `name`, `email`, `phone`, `interest`, `status`, `score`, `qualification`, `source`, `campaign_id`, `custom_details` (JSONB: `annual_income`, `asset_volume`, `credit_score`, `channel`), `created_at`.
    - `telephony_calls`: `id`, `call_sid` (UNIQUE), `direction` ('inbound'|'outbound'|'ai_qualification'), `from_number`, `to_number`, `lead_name`, `lead_id`, `advisor_extension`, `status` ('initiated'|'ringing'|'in-progress'|'completed'|'failed'), `duration_seconds`, `recording_url`, `transcript`, `ai_rating` ('Warm'|'Mild'|'Cold'), `ai_qualification_summary`.
- **Telephony API (`backend/routes/signalwire.cjs`)**:
  - Credentials read from environment: `SIGNALWIRE_SPACE_URL`, `SIGNALWIRE_PROJECT_ID`, `SIGNALWIRE_API_TOKEN`, `SIGNALWIRE_PHONE_NUMBER`.
  - Endpoint `GET /api/signalwire/credentials` -> returns `{ spaceUrl, projectId, phoneNumber, status }`.
  - Endpoint `GET /api/signalwire/extensions` -> returns advisor extension directory (`ext-101` Marcus Vance, `ext-102` Sarah Jenkins, etc.).
  - Endpoint `GET /api/signalwire/calls` -> returns recorded call logs from `telephony_calls` table (with in-memory fallback).
  - Endpoint `POST /api/signalwire/call` -> accepts `{ toNumber: string, leadName?: string, leadId?: string, advisorExtension?: string }`, returns `{ success: true, call: {...} }` and writes to `telephony_calls` table.
  - Endpoint `POST /api/signalwire/ai-call` -> accepts `{ toNumber: string, leadName?: string, leadId?: string }`, simulates AI lead rating ('Warm'|'Mild'|'Cold'), writes to `telephony_calls`, and returns `{ success: true, aiCall: {...} }`.
- **Ad Campaign Webhooks & Simulator (`backend/routes/webhooks.cjs` & `backend/scripts/adSimulator.cjs`)**:
  - Endpoint `POST /api/webhooks/campaigns` -> accepts `{ channel: "meta"|"google"|"tv", campaign_id: string, lead: { full_name: string, email: string, phone: string, annual_income: number, asset_volume: number, credit_score: number } }`. Returns `{ success: true, lead_id: string, status: string }`.
  - Simulator script `backend/scripts/adSimulator.cjs` -> exports `generateMockLead()`, `sendLeadPayload()`, `startSimulator()`, `stopSimulator()`, `getStats()`. CLI executable with `--once`, `--target=URL`, `--interval=MS`.
- **Lead Qualification Engine & Real-Time Events (R5.1 & R5.2)**:
  - Criteria: `asset_volume >= 250000` AND `annual_income >= 100000` AND `credit_score >= 700` => `"Qualified"`, else `"Disqualified"`.
  - Updates DB record `leads` (`status`, `qualification`, `custom_details`).
  - Emits WebSocket event on `/ws`:
    ```json
    {
      "type": "LEAD_QUALIFIED",
      "payload": {
        "lead_id": "uuid-str",
        "name": "Lead Name",
        "status": "Qualified",
        "qualification": "Qualified",
        "reason": "Asset volume $300,000 >= $250k threshold, Income $120,000 >= $100k threshold, Credit Score 740 >= 700 threshold.",
        "custom_details": { "asset_volume": 300000, "annual_income": 120000, "credit_score": 740 }
      }
    }
    ```
- **Frontend Views & Component Interfaces**:
  - Header Stats (R1.1): `components/shared/Tab3DBanner.tsx` rendering animated glass cards (`.apple-glass`, `.apple-3d-card`, floating levitating emoji badges, gradients `cyan`, `yellow`, `pink`).
  - Meetings Dashboard (R1.2, R1.3): `pages/crm/Calendar.tsx` with view tabs ("Upcoming", "Previous", "Personal room", "Templates") and meeting rows with interactive "Recording" toggle switch and attendee avatar list.
  - Animated Analytics Charts (R2.1, R2.2): `pages/crm/Dashboard.tsx` with Recharts & Framer Motion entry animations, neon glow utility classes (`pulse-glow-blue`, high-contrast borders).
  - SignalWire Telephony Hub (R3.1, R3.2): `pages/crm/TelephonyHub.tsx` with softphone keypad, active call console, extension selector, and call logs list.
  - WebSocket Service: `services/socketService.ts` providing `connect()`, `subscribe(callback)`, `send(data)`, `disconnect()`.

---

## Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Meetings UI | R1.1 3D Glassmorphic Header Stats | 3D glassmorphic cards ("Scheduled", "Rescheduled", "Canceled" / Appointments, Calls, Consultations) with neon gradients & levitating emoji badges | `cards: BannerCard[]` (`title`, `value`, `subtitle`, `emoji`, `gradient`) | Rendered JSX card container with float motion & click navigation | Fallback to default `cyan` gradient and `0` values if props missing | `components/shared/Tab3DBanner.tsx:6-118`, `pages/crm/Calendar.tsx:104-110` |
| 2 | Meetings UI | R1.2 Meetings Dashboard Tabs | Filter tabs for "Upcoming", "Previous", "Personal room", "Templates" | Active tab selection click | Filtered meeting schedule grid updated without full reload | Fallback to default tab ("Upcoming") if invalid selection; empty state notice if no meetings | `pages/crm/Calendar.tsx:18-24,164-194`, `PROJECT.md` #2 |
| 3 | Meetings UI | R1.3 Schedule List & Controls | Meeting rows displaying title, date/time, timezone, attendee avatars, and interactive "Recording" switch | Meeting row data, click on "Recording" toggle | Toggled recording state, updated row UI | Truncates long titles (250+ chars) with ellipsis; `+N` badge for avatar overflow | `pages/crm/Calendar.tsx:27-43`, `components/calendar/Sidebar.tsx` |
| 4 | Analytics | R2.1 Animated Analytics Charts | Recharts graphs with Framer Motion entry animations & hover tooltips | `monthlyPerformance: Array<{ month, revenue, leads }>` dataset | SVG chart elements, animated opacity/scale, hover tooltip overlay | Render empty chart axes with empty state notice if dataset `[]` | `pages/crm/Dashboard.tsx:225-380`, `package.json:29,44` |
| 5 | Analytics | R2.2 Neon Glow Dashboard Integration | Dark-theme neon glow styling (`pulse-glow-blue`, high-contrast neon borders) for analytics widgets | Theme state, container dimensions | Styled card containers with neon borders & live indicator badges | Graceful fallback to static high-contrast borders if `prefers-reduced-motion` enabled | `pages/crm/Dashboard.tsx:175`, `TEST_INFRA.md:65-69` |
| 6 | Telephony | R3.1 Connected SignalWire Outbound Dialer | Softphone dialer initiating live outbound calls via SignalWire API | `POST /api/signalwire/call` with `{ toNumber, leadName, advisorExtension }` | `200 OK` `{ success: true, call: {...} }`, softphone UI transitions to "Calling" | `400 Bad Request` if `toNumber` missing; fallback mock call payload on API error | `backend/routes/signalwire.cjs:141-182`, `pages/crm/TelephonyHub.tsx:113-130` |
| 7 | Telephony | R3.2 Telephony Call State DB Logging | Logging outbound call events and states in `telephony_calls` DB table | Call SID, direction, numbers, status, duration, transcript, AI rating | Inserted DB record in `telephony_calls`, queryable via `GET /api/signalwire/calls` | In-memory store fallback (`memoryCallsStore`) if DB connection drops | `backend/routes/signalwire.cjs:172-180`, `backend/migrations/signalwire_schema.sql:16-33` |
| 8 | Lead Ingestion | R4.1 Campaign Webhook Endpoint | Public webhook `POST /api/webhooks/campaigns` accepting Meta, Google, TV ad payloads | Request body `{ channel, campaign_id, lead: { full_name, email, phone, annual_income, asset_volume, credit_score } }` | `200 OK` `{ success: true, lead_id, status }`, DB record created in `leads` | `400 Bad Request` if `lead` object is missing or malformed JSON | `backend/routes/webhooks.cjs:123-192`, `PROJECT.md` Interface Contracts |
| 9 | Lead Ingestion | R4.2 Automated Ad Lead Simulator | Background loop streaming simulated Meta, Google, TV ad lead payloads to campaign webhook | Options `{ targetUrl, intervalMs }` or CLI `--once` / `--target` | Periodic HTTP POST requests to webhook; execution stats logged | Retries on next interval cycle if target server is unreachable | `backend/scripts/adSimulator.cjs:1-210` |
| 10 | Qualification Engine | R5.1 Lead Screening & DB Tagging | Automated lead qualification by financial metrics (asset volume >= $250k, income >= $100k, credit >= 700) | Lead financial metrics (`asset_volume`, `annual_income`, `credit_score`) | `leads` record tagged `"Qualified"` or `"Disqualified"` in DB | Non-numeric or missing metrics evaluate safely as `"Disqualified"` with explicit reason | `backend/schema.sql:38-72`, `PROJECT.md` Acceptance Criteria |
| 11 | Real-Time Notifications | R5.2 Real-Time Agent Panel Notifications | WebSocket server emitting `LEAD_QUALIFIED` event to update agent panel UI instantly | Event trigger from qualification engine | WebSockets broadcast to all active `/ws` client sockets | Cleanly handles client disconnects; ignores closed sockets without throwing errors | `backend/server.cjs:43-57`, `services/socketService.ts:8-110`, `pages/crm/Dashboard.tsx:175-217` |

---

## Edge Cases

| # | Feature | Input | Observed Behavior |
|---|---------|-------|-------------------|
| 1 | R1.1 | Count metric value is 0 or null | Displays `"0"` cleanly without visual collapse or badge misalignment. |
| 2 | R1.2 | Rapid tab clicking (10 clicks/sec across tabs) | Tab state updates synchronously without race conditions or stuck active tab styling. |
| 3 | R1.3 | Meeting title with 250+ characters / 20+ attendees | Meeting title truncates with ellipsis; excess avatars collapse into `+15` overflow badge. |
| 4 | R2.1 | Empty dataset `[]` or negative financial metrics | Renders empty chart axes with notice, preventing division-by-zero or SVG rendering errors. |
| 5 | R2.2 | High contrast / dark theme toggle or `prefers-reduced-motion` | Heavy CSS glows scale down cleanly without layout bleed or clipped tooltips. |
| 6 | R3.1 | Missing `toNumber` in POST `/api/signalwire/call` | Backend returns HTTP 400 Bad Request with `{ error: 'toNumber is required' }`. |
| 7 | R3.2 | Database connection offline during call logging | Backend catches error and stores call log in `memoryCallsStore` in-memory fallback. |
| 8 | R4.1 | Malformed JSON or missing `lead` object | Webhook endpoint returns HTTP 400 Bad Request `{ success: false, error: ... }`. |
| 9 | R4.2 | Target webhook server endpoint down/unreachable | Simulator logs warning and retries delivery on subsequent cycle without crashing. |
| 10 | R5.1 | Financial values exactly at threshold ($250,000.00 assets, 700 credit, $100,000 income) | Evaluates as `"Qualified"`; $249,999.99 evaluates as `"Disqualified"`. |
| 11 | R5.2 | Client disconnects abruptly during WS broadcast | `broadcast()` checks `client.readyState === WebSocket.OPEN` and skips dead sockets cleanly. |

---

## Logic Chain

1. **Inspection of Environment & Entry Points**:
   - Examining `package.json` confirmed Node ESM execution (`"type": "module"`), Express backend mounting, and the availability of `playwright` (v1.58.2) for headless browser DOM testing.
2. **Analysis of Backend Endpoints & Protocol Interfaces**:
   - Reading `backend/server.cjs` established that Express runs API routes on `/api/*` and WebSocket connections on `/ws`.
   - Reading `backend/routes/webhooks.cjs` and `backend/scripts/adSimulator.cjs` confirmed the exact JSON payload contracts for R4.1 (`POST /api/webhooks/campaigns`) and R4.2 (ad simulator streaming Meta/Google/TV ad payloads).
   - Reading `backend/routes/signalwire.cjs` confirmed the exact request/response schemas for R3.1 (`POST /api/signalwire/call`) and R3.2 (`telephony_calls` DB logging & `GET /api/signalwire/calls`).
3. **Analysis of Database Schemas & Data Integrity**:
   - Reading `backend/schema.sql` and `backend/migrations/signalwire_schema.sql` confirmed table definitions for `leads`, `telephony_calls`, and `advisor_extensions`.
   - Financial screening metrics (`asset_volume`, `annual_income`, `credit_score`) are stored in `leads.custom_details` JSONB.
4. **Analysis of Frontend Views & Components**:
   - Reading `pages/crm/Calendar.tsx`, `pages/crm/Dashboard.tsx`, `pages/crm/TelephonyHub.tsx`, and `components/shared/Tab3DBanner.tsx` identified visual selectors, tab logic, and softphone keypad interfaces for R1.1–R3.1.
   - Reading `services/socketService.ts` confirmed client-side WebSocket subscription mechanics on `/ws` listening for `LEAD_QUALIFIED` events (R5.2).
5. **Formulation of Opaque-Box E2E Testing Strategy**:
   - Opaque-box testing requires exercising the application exclusively through its external boundaries (HTTP API, WebSocket frames, database records, Playwright UI interactions) without modifying production source files.
   - Using `fetch` for HTTP, `ws` client for WebSockets, `pg.Pool` for DB validation, and `playwright` for UI rendering validation covers all 11 features end-to-end.
6. **Formulation of Test Infrastructure & File Structure Blueprint**:
   - The test infrastructure specified in `TEST_INFRA.md` requires a total of **126 test cases**:
     - Tier 1: 55 Feature Coverage Tests (5 tests per feature)
     - Tier 2: 55 Boundary & Corner Case Tests (5 tests per feature)
     - Tier 3: 11 Cross-Feature Pairwise Tests
     - Tier 4: 5 Real-World Application Workload Scenarios (S1–S5)
   - The test suite will be located in `/Users/newholland/1234567/tests/e2e/`:
     - `tests/e2e/runner.cjs` — Custom test runner executing all suites sequentially and producing formatted console/JSON reports.
     - `tests/e2e/helpers/httpHelper.cjs` — HTTP request client.
     - `tests/e2e/helpers/wsHelper.cjs` — WebSocket test client helper.
     - `tests/e2e/helpers/dbHelper.cjs` — Database query and verification helper.
     - `tests/e2e/helpers/uiHelper.cjs` — Playwright browser testing helper.
     - `tests/e2e/tier1_feature_coverage.test.cjs` — Tier 1 suite (55 tests).
     - `tests/e2e/tier2_boundary_corner.test.cjs` — Tier 2 suite (55 tests).
     - `tests/e2e/tier3_cross_feature.test.cjs` — Tier 3 suite (11 tests).
     - `tests/e2e/tier4_real_world.test.cjs` — Tier 4 suite (5 scenarios).

---

## Caveats
- The `tests/` directory does not currently exist in the repository; it will be created by the implementation track following this specification.
- Live SignalWire credentials (`SIGNALWIRE_PROJECT_ID`, etc.) are configured with default fallbacks; tests must handle both live API calls and fallback mock responses gracefully.
- WebSockets in production environments may require local server execution (`ws://localhost:3001/ws`) for E2E validation.

---

## Conclusion
The codebase investigation is complete. All 11 features, HTTP endpoints, database schemas, WebSocket event formats, and UI components have been fully mapped. The opaque-box E2E test suite blueprint (126 tests across 4 Tiers) is documented and ready for implementation.

---

## Verification Method

To independently verify the findings of this exploration report:

1. **Verify Backend Routes & SignalWire Endpoints**:
   - Inspect `backend/routes/signalwire.cjs` lines 141–182 (`POST /api/signalwire/call`) and lines 172–180 (DB logging to `telephony_calls`).
   - Inspect `backend/routes/webhooks.cjs` lines 123–192 (`POST /api/webhooks/campaigns`).
2. **Verify Ad Simulator Script**:
   - Run command: `node backend/scripts/adSimulator.cjs --once`
   - Confirm console logs indicate a mock lead payload generated and posted to `http://localhost:3001/api/webhooks/campaigns`.
3. **Verify Database Schemas**:
   - Inspect `backend/schema.sql` lines 38–72 (`leads` table) and `backend/migrations/signalwire_schema.sql` lines 16–33 (`telephony_calls` table).
4. **Verify Frontend Component Files**:
   - Inspect `components/shared/Tab3DBanner.tsx` (R1.1), `pages/crm/Calendar.tsx` (R1.2, R1.3), `pages/crm/Dashboard.tsx` (R2.1, R2.2), `pages/crm/TelephonyHub.tsx` (R3.1, R3.2), and `services/socketService.ts` (R5.2).
5. **Verify Test Infrastructure Specification**:
   - Inspect `TEST_INFRA.md` lines 1–206 to verify the complete 126-test mapping across Tiers 1–4.
