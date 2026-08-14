# Scope: Milestone M3 — Connected SignalWire Dialer & Call Logging

## Architecture
- **Frontend UI**: `pages/crm/TelephonyHub.tsx` - Softphone dialer component.
- **Backend API Router**: `backend/routes/signalwire.cjs` - SignalWire REST API Integration and Call Logging handlers.
- **Database Table**: `telephony_calls` table in PostgreSQL database (schema in `backend/schema.sql`, `backend/supabase_schema.sql`, `backend/migrations/signalwire_schema.sql`).
- **Environment Variables**: `SIGNALWIRE_PROJECT_ID`, `SIGNALWIRE_API_TOKEN`, `SIGNALWIRE_SPACE_URL`, `SIGNALWIRE_PHONE_NUMBER`.

## Features
- **R3.1 Connected SignalWire Outbound Dialer**: Softphone dialer making live API calls to SignalWire backend endpoints using configured environment credentials.
- **R3.2 Telephony Call State DB Logging**: Inserting and updating call records and call status in `telephony_calls` DB table upon initiating calls, status updates, and call termination.

## Interface Contracts
### Telephony API Contract (M3 Frontend ↔ M3 Backend)
- Endpoint: `POST /api/signalwire/call`
- Request Body: `{ "to": string, "from"?: string, "extension"?: string }`
- Response: `{ "success": boolean, "callId": string, "status": string, "sid"?: string }`
