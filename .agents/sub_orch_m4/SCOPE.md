# Scope: Milestone M4 (Ad Campaign Ingestion & Simulator)

## Architecture & Responsibilities
- **Backend Route**: `backend/routes/webhooks.cjs`
  - Express router exposed at `/api/webhooks/campaigns`.
  - Accepts `POST` requests for ad lead payloads from Meta, Google, and TV channels.
  - Validates payload structure and fields (`channel`, `campaign_id`, `lead` with `full_name`, `email`, `phone`, `annual_income`, `asset_volume`, `credit_score`).
  - Stores lead in database/in-memory store, generates `lead_id`, and returns JSON `{ "success": true, "lead_id": string, "status": "received" }`.
- **Ad Lead Simulator**: `backend/scripts/adSimulator.cjs`
  - Background script/module streaming simulated Meta, Google, and TV ad payloads to the campaign webhook.
  - Can be run as a CLI background runner or programmatically started/stopped.
  - Generates realistic financial lead payloads with varying asset volumes, incomes, and credit scores.

## Features Assigned
| # | Feature | Description | Status |
|---|---------|-------------|--------|
| 8 | R4.1 Campaign Webhook Endpoint | Expose POST `/api/webhooks/campaigns` accepting Meta, Google, and TV ad lead payloads | IN_PROGRESS |
| 9 | R4.2 Automated Ad Lead Simulator | Background loop streaming simulated Meta, Google, TV ad payloads to campaign webhook | IN_PROGRESS |

## Interface Contract
### Webhook Payload Contract (M4 ↔ M5)
- Endpoint: `POST /api/webhooks/campaigns`
- Request Headers: `Content-Type: application/json`
- Request Body: `{ "channel": "meta" | "google" | "tv", "campaign_id": string, "lead": { "full_name": string, "email": string, "phone": string, "annual_income": number, "asset_volume": number, "credit_score": number } }`
- Response: `{ "success": boolean, "lead_id": string, "status": string }`
