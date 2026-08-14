# Investigation Report & Implementation Plan: Milestone M5 (Real-Time Qualification Engine & Panel)

## 1. Observation

Direct code inspection of the codebase at `/Users/newholland/1234567` revealed the following structural details:

### A. Contract Specifications (`PROJECT.md`)
- **Location**: `/Users/newholland/1234567/PROJECT.md`
- **Feature Inventory**:
  - `Line 24`: `R5.1 Lead Screening & DB Tagging`: Screen incoming leads by financial criteria (asset volume, income, credit score), tag "Qualified"/"Disqualified" in DB.
  - `Line 25`: `R5.2 Real-Time Agent Panel Notifications`: Emit WebSocket events (`LEAD_QUALIFIED`) to update agent panel UI instantly upon qualification.
- **Webhook Payload Contract (M4 ↔ M5)** (`Lines 45-49`):
  - Endpoint: `POST /api/webhooks/campaigns`
  - Headers: `Content-Type: application/json`
  - Request Body:
    ```json
    {
      "channel": "meta" | "google" | "tv",
      "campaign_id": "string",
      "lead": {
        "full_name": "string",
        "email": "string",
        "phone": "string",
        "annual_income": 150000,
        "asset_volume": 500000,
        "credit_score": 720
      }
    }
    ```
  - Response: `{ "success": boolean, "lead_id": string, "status": string }`
- **Qualification Event Contract (M5 ↔ Agent Panel UI)** (`Lines 51-53`):
  - WebSocket Channel: `/ws`
  - Event Payload:
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
          "asset_volume": 500000,
          "annual_income": 150000,
          "credit_score": 720
        }
      }
    }
    ```

### B. Current Webhook Route Ingestion (`backend/routes/webhooks.cjs`)
- `Lines 123-192`: Endpoint `POST /api/webhooks/campaigns` exists and currently accepts campaign lead payloads.
- `Line 157`: Current code inserts leads into PostgreSQL (`leads` table) with default `status: 'received'`.
- **Missing Integration**: `webhooks.cjs` does NOT currently invoke any qualification engine to screen financial criteria, nor does it emit WebSocket events to notify the agent panel UI upon ingestion.

### C. Missing Backend Qualification Service (`backend/services/qualificationEngine.cjs`)
- Direct search via `find_by_name` confirmed `backend/services/qualificationEngine.cjs` does **not exist** in the repository.
- File referenced in `PROJECT.md` line 32 (`backend/routes/marketing.cjs & backend/services/qualificationEngine.cjs: Lead qualification logic and DB state management`) needs to be created.

### D. WebSocket Server & Broadcasting (`backend/server.cjs`)
- `Lines 43-57`: WebSocket server is initialized on HTTP server path `/ws`:
  ```js
  const wss = new WebSocket.Server({ server, path: '/ws' });
  const broadcast = (data) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  };
  ```
- `Line 133`: `app.use('/api/webhooks', webhooksRouter);` mounts webhooks router.
- `broadcast` is defined in `server.cjs` scope, but is not currently attached to `app` or exported to Express routers.

### E. Frontend WebSocket Client Service (`services/socketService.ts`)
- `Lines 8-110`: Implements `SocketService` singleton connecting to `ws://localhost:3001/ws` (or `wss://<host>/ws`).
- Methods available: `connect()`, `subscribe(callback)`, `send(data)`, `disconnect()`.

### F. Frontend Agent Panel Event Listening (`context/DataContext.tsx`)
- `Lines 542-551`: `DataContext` subscribes to `socketService`:
  ```tsx
  socketService.subscribe((data) => {
    if (data.type === 'NEW_LEAD') { ... }
    else if (data.type === 'CHAT_MESSAGE') { ... }
    else if (data.type === 'NEW_ADVISOR_APPLICATION') { ... }
  });
  ```
- **Missing Handler**: `DataContext.tsx` lacks handling for `data.type === 'LEAD_QUALIFIED'`.

### G. Database Schema (`backend/schema.sql`)
- `Lines 38-72`: `leads` table schema:
  - `id`: UUID PRIMARY KEY DEFAULT uuid_generate_v4()
  - `name`: VARCHAR(255)
  - `email`: VARCHAR(255)
  - `phone`: VARCHAR(50)
  - `status`: VARCHAR(50) DEFAULT 'New' (stores "Qualified" or "Disqualified")
  - `score`: INT DEFAULT 50 (numeric lead score, e.g. 90 or 40)
  - `qualification`: VARCHAR(20) CHECK (qualification IN ('Hot', 'Warm', 'Cold')) -- status & qualification fields update to "Qualified" / "Disqualified"
  - `custom_details`: JSONB (stores `annual_income`, `asset_volume`, `credit_score`, `qualification_reason`)

### H. Background Ad Lead Simulator (`backend/scripts/adSimulator.cjs`)
- `Lines 28-91`: Simulator generates mock lead payloads with `annual_income`, `asset_volume`, and `credit_score` within realistic ranges across Meta, Google, and TV channels.
- `Lines 97-127`: Sends POST requests to `/api/webhooks/campaigns`.

---

## 2. Logic Chain

1. **Lead Ingestion Trigger**: When `adSimulator.cjs` (or external ad platforms) POSTs a payload to `/api/webhooks/campaigns`, `webhooks.cjs` receives `{ channel, campaign_id, lead: { full_name, email, phone, annual_income, asset_volume, credit_score } }`.
2. **Financial Qualification Logic**: `webhooks.cjs` must pass the lead's financial metrics to `qualificationEngine.evaluateLead(leadPayload)`.
   - Criteria threshold rules:
     - `Qualified` IF `asset_volume >= 250,000` OR (`annual_income >= 100,000` AND `credit_score >= 680`).
     - `Disqualified` otherwise.
   - Output includes `status: "Qualified" | "Disqualified"`, `qualification: "Qualified" | "Disqualified"`, `score` (90 for Qualified, 40 for Disqualified), and a human-readable `reason`.
3. **Database Tagging**: `webhooks.cjs` writes the evaluated lead into PostgreSQL `leads` table with `status`, `qualification`, `score`, and updated `custom_details`.
4. **Real-Time Notification Emission**: `webhooks.cjs` calls `broadcast(eventPayload)` via Express app setting `req.app.get('broadcast')`.
   - Payload matches the Qualification Event Contract:
     ```json
     {
       "type": "LEAD_QUALIFIED",
       "payload": {
         "lead_id": "<lead_id>",
         "name": "<full_name>",
         "status": "Qualified" | "Disqualified",
         "qualification": "Qualified" | "Disqualified",
         "reason": "<reason>",
         "custom_details": {
           "asset_volume": 500000,
           "annual_income": 150000,
           "credit_score": 720
         }
       }
     }
     ```
5. **Agent Panel UI Update**: `socketService.ts` receives the event over `/ws` and invokes listeners. `DataContext.tsx` handles `LEAD_QUALIFIED`, triggers a push notification toast (`pushNotification`), and re-fetches `leads`. `Dashboard.tsx` prepends the event to its real-time event stream (`liveEvents`).

---

## 3. Caveats

- **Existing Lead Records**: Existing database leads with `status = 'received'` or `'New'` created prior to M5 will remain as `'received'` until re-screened or updated.
- **Serverless Production Limitation**: In serverless production environments (Vercel), persistent WebSocket connections are disabled by design (`socketService.ts:38-43`). WebSocket broadcasting operates fully during local Node server execution (`backend/server.cjs` on port 3001).

---

## 4. Conclusion

Milestone M5 implementation requires:
1. Creating `backend/services/qualificationEngine.cjs` with `evaluateLead` financial screening logic.
2. Updating `backend/routes/webhooks.cjs` to evaluate incoming leads and broadcast `LEAD_QUALIFIED` over WebSocket.
3. Exposing `broadcast` helper in `backend/server.cjs` via `app.set('broadcast', broadcast)`.
4. Adding `LEAD_QUALIFIED` handling to `context/DataContext.tsx` and `pages/crm/Dashboard.tsx`.

### Proposed Code Specifications

#### 1. `backend/services/qualificationEngine.cjs` (NEW FILE)
```javascript
/**
 * Financial Lead Qualification Engine (M5 - R5.1)
 * Evaluates leads against financial criteria:
 * - Qualified: Asset Volume >= $250,000 OR (Annual Income >= $100,000 AND Credit Score >= 680)
 * - Disqualified: Does not meet criteria
 */

function evaluateLead(leadData) {
  const customDetails = leadData.custom_details || leadData.customDetails || {};
  const assetVolume = Number(leadData.asset_volume || customDetails.asset_volume || 0);
  const annualIncome = Number(leadData.annual_income || customDetails.annual_income || 0);
  const creditScore = Number(leadData.credit_score || customDetails.credit_score || 0);

  let isQualified = false;
  let reason = '';

  if (assetVolume >= 250000) {
    isQualified = true;
    reason = `Qualified: Asset volume ($${assetVolume.toLocaleString()}) meets $250,000 threshold.`;
  } else if (annualIncome >= 100000 && creditScore >= 680) {
    isQualified = true;
    reason = `Qualified: Annual income ($${annualIncome.toLocaleString()}) >= $100,000 and Credit score (${creditScore}) >= 680.`;
  } else {
    isQualified = false;
    reason = `Disqualified: Assets ($${assetVolume.toLocaleString()}), Income ($${annualIncome.toLocaleString()}), or Credit score (${creditScore}) below qualification threshold.`;
  }

  const status = isQualified ? 'Qualified' : 'Disqualified';
  const qualification = status;
  const score = isQualified ? 90 : 40;

  return {
    isQualified,
    status,
    qualification,
    score,
    reason,
    customDetails: {
      ...customDetails,
      asset_volume: assetVolume,
      annual_income: annualIncome,
      credit_score: creditScore,
      qualification_reason: reason
    }
  };
}

module.exports = { evaluateLead };
```

#### 2. `backend/routes/webhooks.cjs` (UPDATE)
```javascript
const { evaluateLead } = require('../services/qualificationEngine.cjs');

// Inside router.post('/campaigns', ...)
const evalResult = evaluateLead({
  ...lead,
  custom_details: customDetails
});

const newLeadRecord = {
  name: leadName,
  email: leadEmail,
  phone: leadPhone,
  source: sourceName,
  status: evalResult.status,
  qualification: evalResult.qualification,
  score: evalResult.score,
  campaign_id: campaign_id || 'unknown',
  interest: 'Ad Campaign',
  custom_details: evalResult.customDetails,
  platform_data: req.body
};

// After DB insertion & retrieving leadId:
const broadcast = req.app.get('broadcast');
if (typeof broadcast === 'function') {
  broadcast({
    type: 'LEAD_QUALIFIED',
    payload: {
      lead_id: leadId,
      name: leadName,
      status: evalResult.status,
      qualification: evalResult.qualification,
      reason: evalResult.reason,
      custom_details: {
        asset_volume: evalResult.customDetails.asset_volume,
        annual_income: evalResult.customDetails.annual_income,
        credit_score: evalResult.customDetails.credit_score
      }
    }
  });
}
```

#### 3. `backend/server.cjs` (UPDATE)
```javascript
// Line 57: Expose broadcast method to Express app
app.set('broadcast', broadcast);
```

#### 4. `context/DataContext.tsx` (UPDATE)
```typescript
// Inside socketService.subscribe callback (Line 542):
else if (data.type === 'LEAD_QUALIFIED') {
  const isQual = data.payload.status === 'Qualified';
  pushNotification(
    `Lead ${data.payload.status}`,
    `${data.payload.name} was tagged as ${data.payload.status} (${data.payload.reason})`,
    isQual ? 'success' : 'warning',
    'lead',
    data.payload.lead_id
  );
  Backend.getLeads().then(setLeads);
}
```

---

## 5. Verification Method

To independently verify the implementation of M5:

1. **Unit & Financial Logic Verification**:
   - Create a test script (e.g. `node -e "const { evaluateLead } = require('./backend/services/qualificationEngine.cjs'); console.log(evaluateLead({ asset_volume: 300000 }));"`)
   - Test criteria boundaries:
     - `asset_volume = 250000` -> Expect `"Qualified"`
     - `asset_volume = 249999`, `annual_income = 100000`, `credit_score = 680` -> Expect `"Qualified"`
     - `asset_volume = 100000`, `annual_income = 99999`, `credit_score = 750` -> Expect `"Disqualified"`

2. **Integration Verification via Webhook & WebSocket**:
   - Start local Express server: `npm run server:local`
   - Connect a WebSocket client to `ws://localhost:3001/ws`
   - Trigger simulator single payload: `node backend/scripts/adSimulator.cjs --once`
   - Verify DB table `leads` row updated with `status = 'Qualified'` or `'Disqualified'`.
   - Verify WebSocket client receives `{ type: "LEAD_QUALIFIED", payload: { ... } }` matching the exact schema in `PROJECT.md`.

3. **Frontend Agent Panel UI Verification**:
   - Run `npm run build` to verify frontend compilation.
