# Handoff Report — Lead Ingestion & Qualification Engine Specialist (Survey Explorer 3)

## 1. Observation

### API Routing & Framework Architecture
- **Framework Setup**: The project is a dual-tier application:
  - **Frontend**: Vite 6 SPA using React 18 and React Router DOM v6 (`package.json:40,43,60`).
  - **Backend**: Express 5.2 server (`package.json:28`) running on Node via `backend/server.cjs` on port `3001` (`backend/server.cjs:59`).
- **Express API Routers**:
  - `webhooksRouter` mounted at `/api/webhooks` (`backend/server.cjs:133`, defined in `backend/routes/webhooks.cjs`).
  - `marketingRouter` mounted at `/api/marketing` (`backend/server.cjs:134`, defined in `backend/routes/marketing.cjs`).
  - Generic Webhook Endpoint: `app.post('/api/webhooks/:platform', async (req, res) => ...)` (`backend/server.cjs:978`).
  - Meta Specific Webhooks: `app.get('/api/meta/webhook')` and `app.post('/api/meta/webhook')` (`backend/server.cjs:879, 974`).

### Database Schema for Leads & Financial Qualification
- **Master Schemas**: Defined in `backend/schema.sql` and `backend/supabase_schema.sql`.
- **`leads` Table Structure** (`backend/schema.sql:38-72`, `backend/supabase_schema.sql:58-84`):
  ```sql
  CREATE TABLE leads (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255),
      phone VARCHAR(50),
      interest VARCHAR(100),
      status VARCHAR(50) DEFAULT 'New',
      score INT DEFAULT 50,
      qualification VARCHAR(20) CHECK (qualification IN ('Hot', 'Warm', 'Cold')),
      source VARCHAR(100),
      assigned_to UUID REFERENCES users(id),
      message TEXT,
      notes TEXT,
      priority VARCHAR(20) DEFAULT 'Low',
      life_details JSONB, 
      real_estate_details JSONB, 
      securities_details JSONB,
      custom_details JSONB,
      campaign_id VARCHAR(255),
      ad_group_id VARCHAR(255),
      ad_id VARCHAR(255),
      platform_data JSONB,
      is_archived BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );
  ```
- **Financial Criteria Data Structures**:
  - `LifeDetails` (`types.ts:163-179`): `annualIncome: number`, `netWorth: number`, `monthlyPremiumTarget: number`, `ssn: string`.
  - `SecuritiesDetails` (`types.ts:196-200`): `investableAssets: string`, `riskTolerance: string`.
  - `RealEstateDetails` (`types.ts:189-194`): `budget: string`, `intent: string`, `timeline: string`.
  - `custom_details` JSONB column: Flexible store for custom payload attributes (such as `credit_score`, `asset_volume`, `annual_income`).
- **Schema Gaps vs. Requirements**:
  - Status enum (`types.ts:2-11`) currently contains: `'New'`, `'Contacted'`, `'Unavailable'`, `'Proposal'`, `'Approved'`, `'Closed'`, `'Lost'`, `'Assigned'`.
  - `qualification` check constraint (`backend/schema.sql:46`) allows `CHECK (qualification IN ('Hot', 'Warm', 'Cold'))`.
  - Explicit values `"Qualified"` and `"Disqualified"` as requested by R5 are missing from database check constraints and enum definitions.
  - Financial criteria fields (`asset_volume`, `annual_income`, `credit_score`) exist across scattered vertical JSONB blobs, but lack a standardized screening helper.

### Webhook Endpoint Structure (`/api/webhooks/campaigns`)
- Existing webhook endpoints in `backend/routes/webhooks.cjs`:
  - `POST /api/webhooks/meta` (`line 10`)
  - `POST /api/webhooks/tiktok` (`line 55`)
  - `POST /api/webhooks/google` (`line 88`)
- Normalization Logic: `WebhookNormalizer` object in `backend/server.cjs:383-455` normalizes payloads for `google`, `meta`, `tiktok`, `linkedin`.
- Gap: Endpoint `/api/webhooks/campaigns` specified by R4 does not yet exist as an explicit endpoint (currently endpoints are platform-segmented or generic `/api/webhooks/:platform`). TV ad payload normalization (`WebhookNormalizer.tv`) is missing.

### Background Process / Simulator Requirements
- Existing Simulator: UI-triggered function `simulateLiveWebhook()` in `pages/admin/MarketingIntegrations.tsx:51-77` sends a single test POST request when an admin clicks "Simulate Live Traffic".
- Gap: R4 requires an automated background simulator process/loop streaming payloads from Meta, Google, and TV ad channels continuously.

### Real-Time Notification Mechanism
- **Express WebSocket Server**: `const wss = new WebSocket.Server({ server, path: '/ws' });` in `backend/server.cjs:43`.
- **WebSocket Broadcast**: `broadcast(data)` helper in `backend/server.cjs:51-57` pushes messages to connected frontend clients (e.g. `broadcast({ type: 'NEW_LEAD', payload: data })` at `line 815`).
- **Client Socket Service**: `services/socketService.ts:8-108` connects to `ws://localhost:3001/ws` (or `wss://<host>/ws`) and manages subscriptions.
- **Supabase Realtime**: `services/supabaseClient.ts` provides Supabase JS SDK client supporting `postgres_changes` subscriptions on the `leads` table.

---

## 2. Logic Chain

1. **Routing Architecture**:
   - `backend/server.cjs:133` mounts `webhooksRouter` under `/api/webhooks`.
   - `backend/server.cjs:978` handles `POST /api/webhooks/:platform`.
   - Creating `/api/webhooks/campaigns` inside `backend/routes/webhooks.cjs` or `backend/server.cjs` fulfills R4 by accepting multi-channel campaign payloads (`meta_ads`, `google_ads`, `tv_ads`).

2. **Qualification Data Model & Database Statuses**:
   - R5 requires flagging and tagging incoming leads as `"Qualified"` or `"Disqualified"` based on financial thresholds (e.g. asset volume, income, credit score).
   - Currently, `leads.status` defaults to `'New'` and `leads.qualification` allows `'Hot'`, `'Warm'`, `'Cold'`.
   - Adding `"Qualified"` and `"Disqualified"` as valid values for `status` (or `qualification`) in `schema.sql`, `supabase_schema.sql`, and `types.ts` enables exact requirement compliance.
   - Parsing financial criteria (`asset_volume` >= $100k, `annual_income` >= $75k, `credit_score` >= 650) inside a dedicated qualification function (`evaluateLeadQualification`) provides determinism.

3. **Background Simulator Design**:
   - `pages/admin/MarketingIntegrations.tsx` proves the concept with manual button clicks.
   - Creating `backend/scripts/adSimulator.cjs` (or an Express background interval) that periodically generates realistic payload mock objects for Meta, Google, and TV ads and posts them to `/api/webhooks/campaigns` meets the R4 background simulator criteria.

4. **Real-Time Notification Stream**:
   - `backend/server.cjs:51` (`broadcast`) already streams `{ type: 'NEW_LEAD', payload }` over `/ws`.
   - Emitting `{ type: 'LEAD_QUALIFIED', payload: qualifiedLead }` whenever a lead is ingested and classified allows `services/socketService.ts` to notify the agent panel instantly without polling.

---

## 3. Caveats

No caveats. The codebase structure, API endpoints, database schemas, WebSocket implementation, and frontend components were directly read and inspected from disk.

---

## 4. Conclusion

The New Holland Financial CRM codebase has a solid foundation for lead ingestion and real-time WebSocket communication. Implementing R4 and R5 requires:

1. **Database Schema & Types Extension**:
   - Update `leads.status` and `leads.qualification` definitions in `backend/schema.sql`, `backend/supabase_schema.sql`, and `types.ts` to support `"Qualified"` and `"Disqualified"`.
   - Standardize financial criteria attributes (`asset_volume`, `annual_income`, `credit_score`) inside `custom_details` JSONB.

2. **Unified Webhook Endpoint (`/api/webhooks/campaigns`)**:
   - Expose `POST /api/webhooks/campaigns` in `backend/routes/webhooks.cjs`.
   - Extend `WebhookNormalizer` with `WebhookNormalizer.tv` to handle direct response TV ad campaign payloads.

3. **Real-Time Financial Qualification Engine**:
   - Create an automated screening engine `evaluateLeadQualification(leadData)` that evaluates:
     - Income threshold (e.g. >= $75,000/yr)
     - Asset volume / net worth (e.g. >= $100,000)
     - Credit score (e.g. >= 650)
   - Assign `status = 'Qualified'` (or `'Disqualified'`), save to PostgreSQL via Supabase / `pg` pool, and route assigned lead via `routingEngine.cjs`.

4. **Automated Background Simulator**:
   - Implement `backend/scripts/adSimulator.cjs` (or server interval process) that streams simulated Meta, Google, and TV ad lead payloads to `/api/webhooks/campaigns` every 15-30 seconds.

5. **Agent Panel Real-Time Notifications**:
   - Call `broadcast({ type: 'LEAD_QUALIFIED', payload: lead })` on WebSocket server (`backend/server.cjs:51`), received by `services/socketService.ts` in CRM components.

---

## 5. Verification Method

- **Code Inspection**:
  - `view_file /Users/newholland/1234567/backend/server.cjs`
  - `view_file /Users/newholland/1234567/backend/routes/webhooks.cjs`
  - `view_file /Users/newholland/1234567/types.ts`
- **Webhook API Test**:
  ```bash
  curl -X POST http://localhost:3001/api/webhooks/campaigns \
    -H "Content-Type: application/json" \
    -d '{
      "source": "tv_ads",
      "campaign_id": "TV-CNBC-Q3",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "phone": "555-0199",
      "annual_income": 120000,
      "asset_volume": 500000,
      "credit_score": 740,
      "interest": "Life Insurance"
    }'
  ```
- **Database Status Check**:
  Query PostgreSQL `leads` table to verify lead status is marked `"Qualified"` or `"Disqualified"`.
- **WebSocket Verification**:
  Connect to `ws://localhost:3001/ws` and listen for `LEAD_QUALIFIED` payload broadcast.
