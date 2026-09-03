# Backend Architecture, Hosting, Environment & SignalWire Audit Report

**Audit Date**: 2026-08-15  
**Auditor**: Explorer Subagent (Backend & Infrastructure Specialist)  
**Target Repository**: `/Users/newholland/1234567`  
**Authoritative Reference**: `ORIGINAL_REQUEST.md`, `PROJECT.md`  

---

## Executive Summary

This report delivers a comprehensive technical audit of the New Holland Financial CRM backend, API architecture, deployment topologies, environment variables, SignalWire telephony integration, and real-time WebSocket/WebRTC infrastructure.

### Summary of Key Findings:
1. **API Framework & Runtime**: The active production backend is built on **Node.js (v22+)** and **Express 5.2.1** (`backend/server.cjs`), exported as a serverless function handler via `api/index.js` for Vercel, and runnable as a standalone HTTP server.
2. **Hosting & Deployment**: Primary production hosting is configured for **Vercel Serverless** (`vercel.json`), with containerized/standalone deployment support for **Render** (`render.yaml`) and self-hosted Node.js. Database persistence is managed via **Supabase PostgreSQL** (`aws-1-us-east-1.pooler.supabase.com:6543`) with Google Cloud SQL fallback.
3. **SignalWire SDK & Credentials**: **Zero `@signalwire/*` NPM packages are installed** in `package.json` or `package-lock.json`. SignalWire integration is currently implemented using direct HTTP REST / LAML requests via native `fetch` in `backend/routes/signalwire.cjs`. Space URL, Project ID, API Token, and Phone Number credentials exist in environment configs and fallback defaults.
4. **Environment Variables**: Over 40 distinct environment variables manage Database connections, JWT Auth, SignalWire, Plaid, Stripe, SMTP, and Ad Simulator services.
5. **WebSocket / WebRTC Status**: A Node.js `ws` WebSocket server is mounted at `/ws` in `backend/server.cjs`, but **cannot function over Vercel serverless functions**. **Zero WebRTC signaling, STUN/TURN, or WebRTC client SDKs exist**; current telephony is purely REST/LAML PSTN call dispatch.

---

## 1. Backend & API Structure

### 1.1 API Framework and Runtime
- **Primary Framework**: Express.js version `^5.2.1` (`package.json:31`).
- **Primary Runtime File**: `backend/server.cjs` (5,539 lines, CommonJS format).
- **Serverless Adapter**: `api/index.js` dynamically imports `backend/server.cjs` for Vercel Serverless Function invocations.
- **Alternative Prototypes in Repo**:
  - `backend_python/main.py`: FastAPI + `asyncpg` + `uvicorn` (492 lines).
  - `backend_rust/src/main.rs`: Rust crate prototype (`Cargo.toml`).
  - *Note*: Operational CRM routes and production deployments strictly use `backend/server.cjs`.

#### Code Citation — Server Entrypoint (`backend/server.cjs:1-21, 39-41`):
```javascript
1: const express = require('express');
2: const fs = require('fs');
3: const cors = require('cors');
4: const bodyParser = require('body-parser');
5: const { Pool } = require('pg');
6: const crypto = require('crypto');
7: const jwt = require('jsonwebtoken');
8: const swaggerUi = require('swagger-ui-express');
9: const swaggerJsdoc = require('swagger-jsdoc');
10: const http = require('http');
11: const WebSocket = require('ws');
...
18: const supabase = require('./supabaseClient.cjs');
19: const webhooksRouter = require('./routes/webhooks.cjs');
20: const marketingRouter = require('./routes/marketing.cjs');
21: const signalwireRouter = require('./routes/signalwire.cjs');
...
39: const app = express();
40: const server = http.createServer(app);
```

#### Code Citation — Serverless Bridge (`api/index.js:1-15`):
```javascript
1: export default async function(req, res) {
2:   try {
3:     const mod = await import('../backend/server.cjs');
4:     const app = mod.default || mod;
5:     return app(req, res);
6:   } catch (err) {
7:     console.error("Boot error:", err);
8:     return res.status(500).json({ 
9:       error: err.message, 
10:       stack: String(err.stack),
11:       type: 'BOOT_CRASH'
12:     });
13:   }
14: }
```

### 1.2 Route Organization & Mounted Routers
The API endpoints are organized modularly:
- **Webhooks Router (`/api/webhooks`)**: Mounted at `backend/server.cjs:133` from `backend/routes/webhooks.cjs`.
  - `POST /api/webhooks/meta` (Facebook Lead Ads)
  - `POST /api/webhooks/tiktok` (TikTok Lead Gen)
  - `POST /api/webhooks/google` (Google Lead Forms)
  - `POST /api/webhooks/campaigns` (Unified Ad Ingestion for Meta, Google, TV Ads)
- **Marketing Router (`/api/marketing`)**: Mounted at `backend/server.cjs:135` from `backend/routes/marketing.cjs`.
  - `GET`, `POST`, `PATCH`, `DELETE /api/marketing/campaigns`
  - `GET`, `POST`, `DELETE /api/marketing/audiences`
  - `GET`, `POST /api/marketing/email-sends`
  - `GET /api/marketing/payments`, `POST /api/marketing/campaigns/fund` (Stripe integration)
  - `GET`, `POST /api/marketing/automations`
- **SignalWire Telephony Router (`/api/signalwire`)**: Mounted at `backend/server.cjs:137` from `backend/routes/signalwire.cjs`.
  - `GET /api/signalwire/credentials`
  - `GET /api/signalwire/extensions`
  - `GET /api/signalwire/calls`
  - `POST /api/signalwire/call` (Outbound Call Initiation)
  - `POST /api/signalwire/hangup` & `POST /api/signalwire/call/status` (Call Termination)
  - `POST /api/signalwire/ai-call` (SWML AI Qualification Bot Call)
  - `GET /api/signalwire/sms/history`, `POST /api/signalwire/sms/send`
  - `POST /api/signalwire/ivr`, `POST /api/signalwire/ivr-route` (LAML Voice XML)
- **Core Endpoints in `backend/server.cjs`**:
  - Authentication: `/api/auth/login`, `/api/auth/register`, `/api/auth/reset-password`, `/api/auth/refresh`, `/api/auth/logout`, `/api/auth/me`
  - Leads & Clients: `/api/leads`, `/api/leads/public`, `/api/callbacks`, `/api/clients`
  - Uploads & Files: `/api/upload`, `/api/upload/signed-url`, `/api/upload-multipart`, `/api/storage/:filename`
  - Users & Onboarding: `/api/users`, `/api/admin/onboarding/applications`, `/api/onboarding/activate/:token`
  - Events & Calendar: `/api/events`, `/api/public/availability/:userId`, `/api/public/book`
  - Vertical Domain Models: `/api/portfolios`, `/api/real-estate/properties`, `/api/logistics/loads`
  - Plaid Banking: `/api/plaid/create-link-token`, `/api/plaid/exchange-token`, `/api/plaid/verifications`
  - Partner Integration: `/api/v1/partners/leads` (Protected via API keys)
  - Heartbeat & Diagnostics: `/api/heartbeat`, `/api/health`, `/api/logs`

### 1.3 Route Protection, Middleware & Security
1. **CORS Configuration**:
   - `app.use(cors())` enabled globally at `backend/server.cjs:89`.
2. **JWT Authentication (`authenticateToken`)**:
   - Implemented at `backend/server.cjs:400-452`.
   - Reads `Authorization: Bearer <token>`.
   - Verifies JWT with `jwt.verify(token, SECRET_KEY)`.
   - Generates access tokens (`10m` expiry) and refresh tokens (`7d` expiry) via `jsonwebtoken`.
   - **Session Fallback**: If no valid token is provided, injects a fallback session (`mockUserId` or `'admin-main'` with role `'Administrator'`) to ensure admin operations and CMS settings do not lock out administrators (`backend/server.cjs:433-451`).
3. **Role-Based Access Control (RBAC)**:
   - Middleware `authorizeRoles(...allowedRoles)` in `backend/server.cjs:373-380` validates `req.user.role` (e.g. `'Administrator'`, `'Manager'`).
4. **PostgreSQL RLS Session Variable Injection**:
   - Middleware sets connection session config variables:
     `SELECT set_config('app.user_id', $1, true), set_config('app.user_role', $2, true)` (`backend/server.cjs:418, 443`).

---

## 2. Hosting & Deployment Configuration

### 2.1 Primary Hosting: Vercel (Serverless & Static Edge)
- **Configuration File**: `vercel.json` (`/Users/newholland/1234567/vercel.json:1-43`).
- **Rewrite Rules**:
  - `/api/(.*)` -> `/api/index.js` (Routes all backend requests to the serverless function).
  - `/(.*)` -> `/index.html` (Serves the Vite React single page application).
- **Scheduled Cron Jobs**:
  - `/api/heartbeat` triggered daily at `0 0 * * *` (`vercel.json:2-6`).
- **Domain Redirects**:
  - Enforces canonical domain redirects from `newholladfinancial.com` and `www.newholladfinancial.com` to `https://newhollandfinancial.com/$1` (`vercel.json:8-31`).
- **Vercel Project Metadata**:
  - `.vercel/repo.json`: Project ID `prj_ocKmYWZR4hO1oCy3TvAuVPdBUASz`, Org ID `team_JlCfgqXlJCQMSoUFdOh6DCjD`.
  - Deployment environments: `.env.vercel.production`, `.env.vercel.pull`.

#### Code Citation — `vercel.json` (`/Users/newholland/1234567/vercel.json:1-43`):
```json
{
  "crons": [
    {
      "path": "/api/heartbeat",
      "schedule": "0 0 * * *"
    }
  ],
  "redirects": [
    {
      "source": "/(.*)",
      "destination": "https://newhollandfinancial.com/$1",
      "permanent": true,
      "has": [{ "type": "host", "value": "newholladfinancial.com" }]
    },
    {
      "source": "/(.*)",
      "destination": "https://newhollandfinancial.com/$1",
      "permanent": true,
      "has": [{ "type": "host", "value": "www.newholladfinancial.com" }]
    }
  ],
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/index.js"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### 2.2 Secondary / Containerized Hosting: Render.com
- **Configuration File**: `render.yaml` (`/Users/newholland/1234567/render.yaml:1-20`).
- **Service Specs**:
  - Service type: `web`
  - Name: `newholland-crm`
  - Environment: `node`
  - Build command: `npm install && npm run build`
  - Start command: `npm run start:prod` (`node backend/server.cjs`)
  - Port: `10000`

### 2.3 Standalone Node.js & Static Frontend Serving
- When running `node backend/server.cjs` directly, `backend/server.cjs:5498-5511` inspects `dist/` and serves the static production frontend:
```javascript
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('/*splat', (req, res) => {
    if (!req.url.startsWith('/api')) {
      res.sendFile(path.join(distPath, 'index.html'));
    } else {
      res.status(404).json({ error: 'API route not found' });
    }
  });
}
```

### 2.4 Database Infrastructure: Supabase Cloud PostgreSQL
- **Primary Database**: Supabase PostgreSQL located at `aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true`.
- **Cloud SQL Unix Socket**: Also supports Google Cloud SQL via `/cloudsql/${INSTANCE_CONNECTION_NAME}` (`backend/server.cjs:142-152`).
- **Keep-Alive Heartbeat**: GitHub Actions workflow `.github/workflows/keep-alive.yml` pings the heartbeat endpoint every 2 days (`0 0 */2 * *`) to prevent Supabase inactivity pausing.

---

## 3. Existing SignalWire Credentials, Configuration & SDKs

### 3.1 SDK Installation Audit
- **`package.json` Check**:
  - `@signalwire/realtime-api`: **NOT INSTALLED** (0 references)
  - `@signalwire/js`: **NOT INSTALLED** (0 references)
  - `@signalwire/compatibility-api`: **NOT INSTALLED** (0 references)
  - `@signalwire/node`: **NOT INSTALLED** (0 references)
  - `twilio`: **`^5.12.2` INSTALLED** (`package.json:53`)
- **`package-lock.json` Check**: Zero `@signalwire/*` dependencies present in lockfile.

### 3.2 SignalWire Credentials & Configuration in Codebase
SignalWire credentials are read from environment variables with built-in development fallbacks across multiple backend files:

| Credential Variable | Configured Value / Fallback | Code References |
|---|---|---|
| `SIGNALWIRE_SPACE_URL` | `newhollandfinancialgroup.signalwire.com` | `backend/routes/signalwire.cjs:14`, `.env.vercel.production:21`, `backend/scripts/setup_signalwire_agent.cjs:4` |
| `SIGNALWIRE_PROJECT_ID` | `3b3475f1-9582-41fb-b2e2-7e6453821fb2` | `backend/routes/signalwire.cjs:15`, `.env.vercel.production:20`, `backend/scripts/setup_signalwire_agent.cjs:5` |
| `SIGNALWIRE_API_TOKEN` | `PT5b546759c1617e256c38864661f64f54fbe6b3f7e17b89e4` | `backend/routes/signalwire.cjs:16`, `.env.vercel.production:18`, `backend/scripts/setup_signalwire_agent.cjs:6` |
| `SIGNALWIRE_PHONE_NUMBER` | `+18885550199` | `backend/routes/signalwire.cjs:17`, `.env.vercel.production:19` |

### 3.3 SignalWire Interaction Implementation
Instead of the official SignalWire Node/Realtime SDK, the CRM utilizes native `fetch` with HTTP Basic Authentication targeting the SignalWire Compatibility / LAML REST API:

#### Code Citation — `signalwireFetch` Helper (`backend/routes/signalwire.cjs:101-119`):
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

### 3.4 Webhook & Callback Endpoints
- **LAML IVR Greeting**: `POST /api/signalwire/ivr` (`backend/routes/signalwire.cjs:428-440`).
- **LAML Extension Routing**: `POST /api/signalwire/ivr-route` (`backend/routes/signalwire.cjs:441-450`).
- **SWML AI Agent Callback**: `https://newhollandfinancialgroup.com/api/signalwire/recording-callback` (`backend/signalwire_swml_agent.json:22`, `backend/scripts/setup_signalwire_agent.cjs:69`).

### 3.5 Database Schema for Telephony
Tables defined in `backend/schema.sql:442-485` and `backend/migrations/signalwire_schema.sql:1-56`:
1. `advisor_extensions`:
   - Columns: `id` (UUID), `advisor_name` (VARCHAR), `extension` (VARCHAR UNIQUE), `phone_number` (VARCHAR), `department` (VARCHAR), `status` (VARCHAR).
   - Seeded Extensions: `101` (Marcus Vance), `102` (Sarah Jenkins), `103` (David Ross), `104` (Elena Rostova).
2. `telephony_calls`:
   - Columns: `id` (UUID), `call_sid` (VARCHAR UNIQUE), `direction` (VARCHAR), `from_number` (VARCHAR), `to_number` (VARCHAR), `lead_name` (VARCHAR), `lead_id` (VARCHAR), `advisor_extension` (VARCHAR), `status` (VARCHAR: `initiated`, `connecting`, `in-progress`, `completed`, `failed`), `duration_seconds` (INT), `recording_url` (TEXT), `transcript` (TEXT), `ai_rating` (VARCHAR: `Warm`, `Mild`, `Cold`), `ai_qualification_summary` (TEXT), `created_at`, `updated_at`.
3. `telephony_sms`:
   - Columns: `id` (UUID), `message_sid` (VARCHAR UNIQUE), `direction` (VARCHAR), `from_number` (VARCHAR), `to_number` (VARCHAR), `lead_name` (VARCHAR), `message_text` (TEXT), `status` (VARCHAR), `created_at`.

---

## 4. Existing Environment Variables

Below is the complete categorization of all environment variables present in `.env.example`, `.env.local`, `.env.vercel.production`, `.env`, and backend configuration files:

### Category A: SignalWire Telephony
| Variable Name | Purpose | Example / Production Value |
|---|---|---|
| `SIGNALWIRE_PROJECT_ID` | SignalWire Account Project ID | `3b3475f1-9582-41fb-b2e2-7e6453821fb2` |
| `SIGNALWIRE_API_TOKEN` | SignalWire API Authentication Token | `PT5b546759c1617e256c38864661f64f54fbe6b3f7e17b89e4` |
| `SIGNALWIRE_SPACE_URL` | SignalWire Space Domain URL | `newhollandfinancialgroup.signalwire.com` |
| `SIGNALWIRE_PHONE_NUMBER` | Corporate Inbound/Outbound Phone Number | `+18885550199` |

### Category B: Database & Supabase Persistence
| Variable Name | Purpose | Template / Example File |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string (Supabase transaction pooler) | `.env.local:2`, `.env.vercel.production:3`, `render.yaml:14` |
| `POSTGRES_URL` | Vercel Postgres connection alias | `backend/server.cjs:156`, `.env.vercel.production:16` |
| `SUPABASE_DB_URL` | Alternative Supabase direct DB connection string | `backend/server.cjs:156` |
| `SUPABASE_URL` / `VITE_SUPABASE_URL` | Supabase Project REST & Storage API URL | `.env.example:1`, `.env:5`, `.env.local:5`, `render.yaml:16` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role administrative secret (bypasses RLS) | `backend/supabase.cjs:10`, `.env.vercel.production:28`, `render.yaml:18` |
| `VITE_SUPABASE_ANON_KEY` | Supabase Client-side Public Anon JWT Token | `.env.example:2`, `.env:6`, `.env.local:4`, `.env.vercel.production:50` |
| `INSTANCE_CONNECTION_NAME` | Google Cloud SQL Unix socket instance identifier | `backend/server.cjs:142`, `backend_python/main.py:23` |
| `DB_USER`, `DB_PASS`, `DB_NAME` | Google Cloud SQL credentials | `backend/server.cjs:146-148`, `backend_python/main.py:24-26` |

### Category C: Core Server & Security
| Variable Name | Purpose | Default / Description |
|---|---|---|
| `PORT` | HTTP Server port | `3001` (local default), `10000` (`render.yaml:11`) |
| `NODE_ENV` | Environment identifier (`development` / `production`) | `production` (`render.yaml:9`, `.env.vercel.production:5`) |
| `SECRET_KEY` | JWT signing secret for auth tokens | `nhfg_secret_key_123` (`backend/server.cjs:60`, `.env.local:3`) |
| `APP_URL` | Public application URL | `https://newhollandfinancial.com` (`.env.vercel.production:2`) |

### Category D: Lead Ingestion & Ad Campaign Simulator
| Variable Name | Purpose | Default / Notes |
|---|---|---|
| `ENABLE_AD_SIMULATOR` | Auto-start background simulator on boot | `'true'` by default (`backend/server.cjs:5518`) |
| `SIMULATOR_INTERVAL_MS` | Simulator loop frequency | `8000` (ms) (`backend/scripts/adSimulator.cjs:140`) |
| `SIMULATOR_TARGET_URL` | Simulator webhook target | `http://localhost:3001/api/webhooks/campaigns` |
| `META_ACCESS_TOKEN` | Meta Graph API access token for leadgen fetch | `backend/server.cjs:480` |

### Category E: Financial, Banking & Payments
| Variable Name | Purpose | File References |
|---|---|---|
| `PLAID_CLIENT_ID` | Plaid API Client ID | `.env.vercel.production:10` |
| `PLAID_SECRET` | Plaid API Secret (Sandbox / Development) | `.env.vercel.production:14` |
| `PLAID_SECRET_PRODUCTION` | Plaid API Secret (Production) | `.env.vercel.production:15` |
| `PLAID_ENV` | Plaid Environment (`sandbox`, `development`, `production`) | `.env.vercel.production:12` |
| `PLAID_PRODUCTS` | Plaid initial product scope (`auth,transactions`) | `.env.vercel.production:13` |
| `PLAID_COUNTRY_CODES` | Supported country codes (`US`) | `.env.vercel.production:11` |
| `STRIPE_SECRET_KEY` | Stripe secret key for campaign funding | `backend/routes/marketing.cjs:12` |

### Category F: Communications & Storage Modes
| Variable Name | Purpose | File References |
|---|---|---|
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_SECURE`, `EMAIL_FROM` | Nodemailer SMTP email configuration | `.env.vercel.production:22-26` |
| `STORAGE_MODE` | File storage provider (`supabase` / `local` / `owncloud`) | `.env.vercel.production:27` |
| `OWNCLOUD_URL`, `OWNCLOUD_USERNAME`, `OWNCLOUD_PASSWORD` | OwnCloud WebDAV storage credentials | `.env.vercel.production:7-9` |
| `BROWSERBASE_API_KEY`, `BROWSERBASE_PROJECT_ID` | Browserbase cloud browser automation | `.env:1-2` |

---

## 5. WebSocket & WebRTC Infrastructure

### 5.1 Backend WebSocket Implementation
- **Node.js Server**: Mounted in `backend/server.cjs:42-57` using the `ws` package:
  ```javascript
  const wss = new WebSocket.Server({ server, path: '/ws' });
  wss.on('connection', (ws) => {
    console.log('[WebSocket] Client connected');
    ws.on('close', () => console.log('[WebSocket] Client disconnected'));
  });
  const broadcast = (data) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) client.send(JSON.stringify(data));
    });
  };
  ```
- **FastAPI Prototype**: Mounted in `backend_python/main.py:216-227` with a `ConnectionManager` broadcasting `NEW_LEAD` payloads.

### 5.2 Serverless Architectural Constraint on WebSockets
- **Critical Finding**: Vercel Serverless Functions (`api/index.js`) are stateless and ephemeral; they terminate after each HTTP response and cannot maintain persistent TCP WebSocket connections.
- **Frontend Fallback**: `services/socketService.ts:38-43` explicitly detects non-local environments and disables continuous reconnection attempts to prevent serverless noise:
  ```typescript
  // In production (Vercel), persistent WebSockets are not supported.
  // We fail silently after the first attempt to prevent constant reconnection loops and console noise.
  if (!isLocal && this.hasAttempted) {
      console.log('SocketService: Production environment detected. WebSockets disabled to prevent serverless reconnection noise.');
      return;
  }
  ```
- **Standalone Mode**: When running as a continuous Node.js server (e.g. Render `render.yaml` or local `node backend/server.cjs`), WebSockets operate continuously on port 3001 / 10000.

### 5.3 WebRTC Status
- **Current WebRTC Infrastructure**: **NONE**.
  - There are **no STUN/TURN configurations**, no SDP signaling channels, and no WebRTC peer connection managers.
  - The softphone UI in `pages/crm/TelephonyHub.tsx` is an HTTP REST client that commands SignalWire via `POST /api/signalwire/call` and plays pre-recorded MP3 audio from `recording_url` rather than transmitting live bi-directional WebRTC media streams in the browser.

---

## 6. Recommendations for Standalone Call-Center Architecture

To cleanly transition to a full standalone SignalWire call-center/telephony system without impacting existing CRM tables:
1. **Install SignalWire SDKs**: Add `@signalwire/realtime-api` for backend call orchestration and `@signalwire/js` for client-side WebRTC softphone voice streaming.
2. **WebRTC Token Issuer**: Create a secure endpoint (e.g., `POST /api/telephony/token`) that generates ephemeral SignalWire WebRTC tokens (`generateToken`) for advisors.
3. **Database Isolation**: Maintain telephony data in dedicated schemas/tables (`telephony_calls`, `telephony_recordings`, `telephony_agent_sessions`) that link to existing CRM tables (`users.id`, `leads.id`) via loose foreign keys (`ON DELETE SET NULL`).
4. **Real-time Event Bridge**: Utilize Supabase Realtime (PostgreSQL CDC) or SignalWire Webhook relay to broadcast live incoming call rings and status updates to agent panels in serverless production.
