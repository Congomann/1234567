# Milestone M5: Real-Time Qualification Engine & Panel — End-to-End Integration & Test Strategy Report

**Agent Identity**: `m5_explorer_3`  
**Working Directory**: `/Users/newholland/1234567/.agents/m5_explorer_3`  
**Workspace Root**: `/Users/newholland/1234567`  
**Date**: 2026-08-13  

---

## 1. Observation

### 1.1 Specification Contracts & Requirements (`PROJECT.md`)
- **Feature Inventory (#10 & #11)**:
  - **R5.1 Lead Screening & DB Tagging**: Screen incoming leads by financial criteria (asset volume, income, credit score), tag `"Qualified"` or `"Disqualified"` in database (`backend/services/qualificationEngine.cjs`, `backend/routes/marketing.cjs`, `backend/routes/webhooks.cjs`).
  - **R5.2 Real-Time Agent Panel Notifications**: Emit WebSocket events (`LEAD_QUALIFIED`) to update agent panel UI instantly upon qualification completion (`backend/server.cjs`, `services/socketService.ts`).
- **Webhook Ingestion Payload Contract (M4 ↔ M5)** (`PROJECT.md:45-49`):
  - Endpoint: `POST /api/webhooks/campaigns`
  - Request Body:
    ```json
    {
      "channel": "meta" | "google" | "tv",
      "campaign_id": "string",
      "lead": {
        "full_name": "string",
        "email": "string",
        "phone": "string",
        "annual_income": 120000,
        "asset_volume": 350000,
        "credit_score": 740
      }
    }
    ```
  - Initial Ingestion Response: `{ "success": true, "lead_id": "string", "status": "received" }`
- **Qualification Event Contract (M5 ↔ Agent Panel UI)** (`PROJECT.md:51-53`):
  - WebSocket Channel: `/ws`
  - Broadcast Event Payload:
    ```json
    {
      "type": "LEAD_QUALIFIED",
      "payload": {
        "lead_id": "string",
        "name": "string",
        "status": "Qualified" | "Disqualified",
        "qualification": "Qualified" | "Disqualified",
        "reason": "string",
        "custom_details": {
          "asset_volume": 350000,
          "annual_income": 120000,
          "credit_score": 740
        }
      }
    }
    ```

### 1.2 Campaign Webhook Route (`backend/routes/webhooks.cjs:120-192`)
- `POST /api/webhooks/campaigns` extracts `channel`, `campaign_id`, and `lead` object from `req.body`.
- `customDetails` object is created with normalized numbers:
  ```javascript
  const customDetails = {
    channel: channel || 'unknown',
    annual_income: Number(lead.annual_income) || 0,
    asset_volume: Number(lead.asset_volume) || 0,
    credit_score: Number(lead.credit_score) || 0,
    ...lead
  };
  ```
- Lead record is inserted into Supabase/PostgreSQL `leads` table with `status: 'received'`.
- **Gap Identified**: `webhooks.cjs` does not currently import or invoke `qualificationEngine.cjs` post-insertion to evaluate qualification rules and broadcast the result.

### 1.3 Qualification Engine Service Status (`backend/services/qualificationEngine.cjs`)
- Inspection of `backend/services/` confirmed `routingEngine.cjs` and `plaidSyncService.cjs` exist, but `qualificationEngine.cjs` does **not yet exist** on disk.
- Need to implement `backend/services/qualificationEngine.cjs` exporting a screening function, e.g. `screenLead(leadRecord)` or `processQualification(leadId, customDetails)`.

### 1.4 Financial Screening Rules & Thresholds
Based on spec criteria (`PROJECT.md` & `.agents/e2e_explorer_1/handoff.md:74`):
- **Asset Volume Threshold**: `asset_volume >= 250000` ($250,000)
- **Annual Income Threshold**: `annual_income >= 100000` ($100,000)
- **Credit Score Threshold**: `credit_score >= 700` (700 credit score)
- **Evaluation Rule**:
  - `IS_QUALIFIED` = `(asset_volume >= 250000) && (annual_income >= 100000) && (credit_score >= 700)`
  - If `IS_QUALIFIED` is `true`: status & qualification tag set to `"Qualified"`.
  - If any threshold fails (or if data is non-numeric/missing): status & qualification tag set to `"Disqualified"`.
  - Informative reason generated (e.g., `"Qualified: Asset $350k (>=250k), Income $120k (>=100k), Credit 740 (>=700)"` or `"Disqualified: Credit score 640 below 700 threshold"`).

### 1.5 Real-Time WebSocket Infrastructure (`backend/server.cjs` & `services/socketService.ts`)
- `backend/server.cjs:43-57`:
  - Express HTTP server mounts `ws.Server` on path `/ws`:
    ```javascript
    const wss = new WebSocket.Server({ server, path: '/ws' });
    const broadcast = (data) => {
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(data));
        }
      });
    };
    ```
- `services/socketService.ts:8-110`:
  - Client-side TypeScript class connecting to `ws://localhost:3001/ws` (in dev mode).
  - Provides `subscribe(callback)` mechanism for React components (e.g. `DataContext.tsx`, `pages/crm/Dashboard.tsx`) to handle incoming events.

### 1.6 Database Schema (`backend/schema.sql:38-72` & `backend/supabase_schema.sql:58-83`)
- `leads` table columns:
  - `id` (UUID)
  - `name` (VARCHAR)
  - `status` (VARCHAR DEFAULT 'New')
  - `qualification` (VARCHAR CHECK IN ('Hot', 'Warm', 'Cold', 'Qualified', 'Disqualified'))
  - `custom_details` (JSONB)
  - `updated_at` (TIMESTAMPTZ)

### 1.7 Existing Testing Infrastructure (`package.json`)
- `package.json` contains no default test runner (no `jest` or `vitest`).
- Standalone execution via `node` / Node.js scripts exists in `backend/scripts/`.

---

## 2. Logic Chain

1. **Triggering Qualification**:
   - When a campaign lead payload arrives at `POST /api/webhooks/campaigns`, `webhooks.cjs` ingests the payload, builds `customDetails`, and saves the lead with initial status `'received'`.
   - Immediately after DB insertion (or inside the webhook endpoint handler), `webhooks.cjs` should pass the newly inserted lead record to `qualificationEngine.processLead(leadRecord)`.
2. **Financial Evaluation & DB Tagging**:
   - `qualificationEngine.cjs` inspects `custom_details.asset_volume`, `custom_details.annual_income`, and `custom_details.credit_score`.
   - It performs safe type conversion (`Number(val) || 0`) and evaluates against thresholds (`assets >= 250,000`, `income >= 100,000`, `credit >= 700`).
   - `qualificationEngine.cjs` updates the lead in PostgreSQL/Supabase:
     - `status` = `'Qualified'` or `'Disqualified'`
     - `qualification` = `'Qualified'` or `'Disqualified'`
     - `custom_details` enriched with `qualification_reason` and `evaluated_at`.
3. **WS Event Emission**:
   - Upon completing the DB update, `qualificationEngine.cjs` invokes `broadcast({ type: 'LEAD_QUALIFIED', payload: ... })` using the exported `broadcast` helper from `server.cjs` (or via callback/event emitter).
   - `wss.clients` broadcasts the event over `/ws`.
4. **UI Notification**:
   - The frontend CRM panel (`socketService.ts` subscriber in `DataContext.tsx` and `Dashboard.tsx`) receives `{ type: "LEAD_QUALIFIED", payload: ... }` and immediately updates live feeds/toast notifications without requiring full page reloads.

---

## 3. Caveats

- **DB Schema Constraint on `qualification` Column**: `schema.sql` line 46 has `CHECK (qualification IN ('Hot', 'Warm', 'Cold'))`. To support `'Qualified'` / `'Disqualified'`, `qualificationEngine.cjs` should update both `status` (which has no strict check) and/or extend the check constraint/store qualification state cleanly in `custom_details` and `status`.
- **Serverless Production WS Limitations**: `services/socketService.ts:38-43` notes that persistent WebSockets are disabled in Vercel production to prevent reconnection loops. E2E verification must run against the active Node.js server (`backend/server.cjs`).
- **Concurrency & Resilience**: DB operations should use `try/catch` fallbacks (matching existing code patterns in `webhooks.cjs`) to ensure qualification failures do not crash the HTTP webhook endpoint response.

---

## 4. Conclusion

Milestone M5 requires building `backend/services/qualificationEngine.cjs`, hooking it into `backend/routes/webhooks.cjs` (and `backend/routes/marketing.cjs`), executing DB status tagging (`"Qualified"` / `"Disqualified"`), and triggering real-time WebSocket events (`LEAD_QUALIFIED`) over `/ws`.

---

## 5. Verification Method

### 5.1 Automated E2E Test Runner Script Strategy
Create a dedicated test script `backend/scripts/test_qualification_e2e.cjs` that can be run with:
```bash
node backend/scripts/test_qualification_e2e.cjs
```

#### Test Steps executed by the runner:
1. **Server Liveness Verification**: Perform HTTP GET `http://localhost:3001/api/heartbeat` to ensure backend server is operational.
2. **WebSocket Client Connection**: Connect client socket to `ws://localhost:3001/ws`. Wait for `onopen`.
3. **Test Case 1: Qualified Lead Flow**:
   - Send `POST /api/webhooks/campaigns` with payload:
     ```json
     {
       "channel": "meta",
       "campaign_id": "cmp_qual_test_01",
       "lead": {
         "full_name": "Eleanor Vance",
         "email": "eleanor@example.com",
         "phone": "+15550192834",
         "annual_income": 150000,
         "asset_volume": 500000,
         "credit_score": 760
       }
     }
     ```
   - Expect HTTP status `200` with `{ success: true, lead_id: "...", status: "received" }`.
   - Assert WebSocket receives event `LEAD_QUALIFIED` with `payload.status === "Qualified"`.
   - Query DB `leads` table for `id = lead_id` and assert `status = 'Qualified'`.
4. **Test Case 2: Disqualified Lead Flow**:
   - Send `POST /api/webhooks/campaigns` with payload:
     ```json
     {
       "channel": "google",
       "campaign_id": "cmp_disqual_test_02",
       "lead": {
         "full_name": "John LowIncome",
         "email": "john@example.com",
         "phone": "+15550199999",
         "annual_income": 45000,
         "asset_volume": 20000,
         "credit_score": 620
       }
     }
     ```
   - Expect HTTP status `200`.
   - Assert WebSocket receives event `LEAD_QUALIFIED` with `payload.status === "Disqualified"`.
   - Query DB `leads` table and assert `status = 'Disqualified'`.
5. **Test Case 3: Edge Case / Missing Financial Metrics**:
   - Send lead with missing financial metrics (`annual_income: null`, etc.).
   - Assert safely evaluates to `"Disqualified"` without throwing 500 server errors.

### 5.2 Manual Verification Steps
- Start local backend server: `npm run server:local` (port 3001).
- In a separate shell, run `node backend/scripts/adSimulator.cjs` to stream simulated ad leads.
- Observe terminal logs for `[QualificationEngine] Lead <id> evaluated: Qualified` and `[WebSocket] Broadcast LEAD_QUALIFIED`.
- Inspect CRM UI Dashboard live activity feed to confirm real-time updates.

### 5.3 Invalidation Conditions
- WS broadcast fails or payload does not match `LEAD_QUALIFIED` contract.
- Lead status in DB remains `'received'` or `'New'` instead of updating to `'Qualified'` / `'Disqualified'`.
- Missing/invalid financial inputs trigger unhandled server exceptions (500 internal error).
