# Project: New Holland Financial CRM System Upgrade

## Architecture
- **Frontend**: Vite 6 + React 18 SPA (`react-router-dom` v6). Uses Tailwind CSS CDN with custom glassmorphic/3D/neon utility classes (`apple-glass`, `apple-glass-dark`, `apple-3d-card`, `pulse-glow-blue`, etc.).
- **Libraries**: Recharts 2.12.2, Framer Motion 12.35.0, Lucide React 0.344.0, clsx, tailwind-merge.
- **Backend**: Node.js Express 5.2 server (`backend/server.cjs` on port 3001).
- **Database**: PostgreSQL (`backend/schema.sql`, `backend/supabase_schema.sql`, `backend/migrations/signalwire_schema.sql`) with resilient in-memory store fallbacks.
- **Telephony Integration**: SignalWire REST API (`/api/laml/2010-04-01/Accounts/.../Calls.json`) mounted at `/api/signalwire` (`backend/routes/signalwire.cjs`), with environment variables (`SIGNALWIRE_PROJECT_ID`, `SIGNALWIRE_API_TOKEN`, `SIGNALWIRE_SPACE_URL`, `SIGNALWIRE_PHONE_NUMBER`).
- **Lead Ingestion & Webhooks**: Express router `/api/webhooks/campaigns` (`backend/routes/webhooks.cjs`), background ad simulator loop (`backend/scripts/adSimulator.cjs` / background runner) streaming Meta, Google, TV ad payloads.
- **Lead Qualification & Real-Time**: Financial criteria screening service (`backend/services/qualificationEngine.cjs`), DB status/qualification updates ("Qualified"/"Disqualified"), WebSocket server at `/ws` broadcasting updates to agent panel (`services/socketService.ts`).

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | R1.1 3D Glassmorphic Header Stats | Header cards ("Scheduled", "Rescheduled", "Canceled") with 3D glassmorphic/neon styling | M1 | survey_explorer_1 |
| 2 | R1.2 Meetings Dashboard Tabs | Functional tabs for "Upcoming", "Previous", "Personal room", "Templates" with filter logic | M1 | survey_explorer_1 |
| 3 | R1.3 Schedule List & Controls | Schedule list with meeting title, date/time, timezone, attendee avatars, interactive "Recording" toggle switch | M1 | survey_explorer_1 |
| 4 | R2.1 Animated Analytics Charts | Recharts graphs with Framer Motion entry animations and hover tooltips | M2 | survey_explorer_1 |
| 5 | R2.2 Neon Glow Dashboard Integration | Neon glow accents matching dark theme integrated into main CRM Dashboard | M2 | survey_explorer_1 |
| 6 | R3.1 Connected SignalWire Outbound Dialer | Softphone dialer making live API calls to SignalWire using env credentials | M3 | survey_explorer_2 |
| 7 | R3.2 Telephony Call State DB Logging | Insert and update call logs/states in DB (`telephony_calls` table) on call operations | M3 | survey_explorer_2 |
| 8 | R4.1 Campaign Webhook Endpoint | Expose POST `/api/webhooks/campaigns` accepting Meta, Google, and TV ad lead payloads | M4 | survey_explorer_3 |
| 9 | R4.2 Automated Ad Lead Simulator | Background loop streaming simulated Meta, Google, TV ad payloads to campaign webhook | M4 | survey_explorer_3 |
| 10| R5.1 Lead Screening & DB Tagging | Screen incoming leads by financial criteria (asset volume, income, credit score), tag "Qualified"/"Disqualified" in DB | M5 | survey_explorer_3 |
| 11| R5.2 Real-Time Agent Panel Notifications | Emit WebSocket events (`LEAD_QUALIFIED`) to update agent panel UI instantly upon qualification | M5 | survey_explorer_3 |

## Code Layout
- `pages/crm/Calendar.tsx` & `components/calendar/MeetingsDashboard.tsx`: Meetings UI and schedule controls
- `components/analytics/CRMAnalyticsCharts.tsx` & `pages/crm/Dashboard.tsx`: Analytics charts with Framer Motion & Recharts
- `pages/crm/TelephonyHub.tsx` & `backend/routes/signalwire.cjs`: SignalWire dialer UI and backend API routes
- `backend/routes/webhooks.cjs` & `backend/scripts/adSimulator.cjs`: Ad campaign webhook endpoint and background simulator process
- `backend/routes/marketing.cjs` & `backend/services/qualificationEngine.cjs`: Lead qualification logic and DB state management
- `backend/server.cjs` & `services/socketService.ts`: Express backend server and real-time WebSocket connection

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | 3D Glassmorphic Meetings Dashboard | R1: Header stats cards, 4 functional tabs, schedule list with Recording toggle | none | DONE |
| M2 | Animated Analytics Charts | R2: Recharts + Framer Motion animations & neon glow hover tooltips on Dashboard | none | DONE |
| M3 | Connected SignalWire Dialer & Call Logging | R3: SignalWire live API integration & DB call state logging | none | DONE |
| M4 | Ad Campaign Ingestion & Simulator | R4: POST `/api/webhooks/campaigns` & background streaming ad simulator | none | DONE |
| M5 | Real-Time Qualification Engine & Panel | R5: Financial criteria screening, DB "Qualified"/"Disqualified" tagging, WS notifications | M4 | PLANNED |

## Interface Contracts
### Webhook Payload Contract (M4 ↔ M5)
- Endpoint: `POST /api/webhooks/campaigns`
- Request Headers: `Content-Type: application/json`
- Request Body: `{ "channel": "meta" | "google" | "tv", "campaign_id": string, "lead": { "full_name": string, "email": string, "phone": string, "annual_income": number, "asset_volume": number, "credit_score": number } }`
- Response: `{ "success": boolean, "lead_id": string, "status": string }`

### Qualification Event Contract (M5 ↔ Agent Panel UI)
- WebSocket Channel: `/ws`
- Event Payload: `{ "type": "LEAD_QUALIFIED", "payload": { "lead_id": string, "name": string, "status": "Qualified" | "Disqualified", "qualification": "Qualified" | "Disqualified", "reason": string, "custom_details": { "asset_volume": number, "annual_income": number, "credit_score": number } } }`

### Telephony API Contract (M3 Frontend ↔ M3 Backend)
- Endpoint: `POST /api/signalwire/call`
- Request Body: `{ "to": string, "from"?: string, "extension"?: string }`
- Response: `{ "success": boolean, "callId": string, "status": string, "sid"?: string }`
