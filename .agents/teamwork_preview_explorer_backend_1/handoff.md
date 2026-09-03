# Handoff Report: Backend, Hosting, Environment & SignalWire Audit

## 1. Observation
- **API Runtime & Framework**:
  - `package.json:31`: `"express": "^5.2.1"`.
  - `backend/server.cjs:1-21, 39-40`: Main Node.js Express 5.2 server initializing HTTP server and mounting `/api/webhooks`, `/api/marketing`, and `/api/signalwire`.
  - `api/index.js:1-15`: Serverless function wrapper for Vercel importing `../backend/server.cjs`.
- **Hosting & Deployment**:
  - `vercel.json:1-43`: Configures `/api/(.*)` rewrite to `/api/index.js`, `/(.*)` rewrite to `/index.html`, and daily heartbeat cron `/api/heartbeat`.
  - `render.yaml:1-20`: Node web service `newholland-crm` with build `npm install && npm run build` and start `npm run start:prod`.
  - `.env.local:2`: Supabase Postgres connection string on AWS US-East-1 (`aws-1-us-east-1.pooler.supabase.com:6543`).
  - `.github/workflows/keep-alive.yml:1-16`: Workflow pinging `https://www.newhollandfinancial.com/api/heartbeat` every 2 days.
- **SignalWire SDK & Credentials**:
  - `package.json:18-66`: Zero `@signalwire/*` packages installed. `twilio: ^5.12.2` is present at line 53.
  - `package-lock.json`: Grep search for `signalwire` returned 0 matches.
  - `backend/routes/signalwire.cjs:14-17`: Reads `process.env.SIGNALWIRE_SPACE_URL` (default `'newhollandfinancialgroup.signalwire.com'`), `process.env.SIGNALWIRE_PROJECT_ID` (default `'3b3475f1-9582-41fb-b2e2-7e6453821fb2'`), `process.env.SIGNALWIRE_API_TOKEN` (default `'PT5b546759c1617e256c38864661f64f54fbe6b3f7e17b89e4'`), `process.env.SIGNALWIRE_PHONE_NUMBER` (default `'+18885550199'`).
  - `backend/routes/signalwire.cjs:101-119`: `signalwireFetch` dispatches direct HTTP Basic Auth calls to `https://${SIGNALWIRE_SPACE_URL}/api/laml/2010-04-01/Accounts/${SIGNALWIRE_PROJECT_ID}/...`.
  - `backend/schema.sql:442-485` and `backend/migrations/signalwire_schema.sql:1-56`: Telephony tables `advisor_extensions`, `telephony_calls`, `telephony_sms`.
- **Environment Variables**:
  - `.env.vercel.production:1-52`, `.env.local:1-6`, `.env:1-7`: Categorized across SignalWire, Database, Auth, Plaid, Stripe, SMTP, and Ad Simulator.
- **WebSocket & WebRTC Infrastructure**:
  - `backend/server.cjs:42-57`: `WebSocket.Server({ server, path: '/ws' })` with `broadcast(data)`.
  - `services/socketService.ts:38-43`: Notes that WebSockets are disabled in Vercel production serverless environments to prevent reconnect loops.
  - Zero WebRTC signaling servers, STUN/TURN configs, or WebRTC client SDKs exist in the repository.

## 2. Logic Chain
1. **API & Runtime**: Because `package.json` specifies `"express": "^5.2.1"` and scripts point to `backend/server.cjs`, and `api/index.js` exports `backend/server.cjs` for Vercel, the application backend is a Node.js Express 5.2 system adaptable to both serverless and containerized runtimes.
2. **Hosting Environment**: The existence of `vercel.json` with API rewrites and `.vercel/repo.json` confirms Vercel is the primary production host, while `render.yaml` and static serving logic in `backend/server.cjs:5498` confirm alternate standalone hosting capabilities.
3. **SignalWire Integration**: Because `@signalwire/realtime-api` and `@signalwire/js` are missing from `package.json` and `package-lock.json`, all SignalWire operations in `backend/routes/signalwire.cjs` rely entirely on direct HTTP REST requests to SignalWire's LAML compatibility endpoints.
4. **Real-Time & Telephony Limitations**: Because Vercel serverless functions terminate per request, persistent WebSockets in `backend/server.cjs` only operate when hosted continuously (Render / local Node). Because no WebRTC SDK is loaded in the browser or backend, the softphone UI operates via REST call dispatch rather than real-time browser audio streaming.

## 3. Caveats
- No caveats regarding backend file locations or dependency analysis; all package files, routes, schemas, and env templates were directly inspected and verified.
- The Python FastAPI (`backend_python/main.py`) and Rust (`backend_rust/`) directories exist as experimental codebases; they are not invoked by Vercel or `package.json` production scripts.

## 4. Conclusion
- The CRM backend is a Node.js Express 5.2 REST API with PostgreSQL persistence via Supabase.
- SignalWire is integrated via direct REST API and LAML XML webhooks with existing credentials (`SIGNALWIRE_PROJECT_ID`, `SIGNALWIRE_API_TOKEN`, `SIGNALWIRE_SPACE_URL`, `SIGNALWIRE_PHONE_NUMBER`), but lacks the official `@signalwire/*` SDKs and WebRTC softphone streaming capabilities.
- Future standalone telephony implementation requires adding `@signalwire/realtime-api` on the backend, `@signalwire/js` on the frontend for WebRTC calling, and leveraging Supabase Realtime or SignalWire webhooks for serverless-compatible event propagation.

## 5. Verification Method
1. **Dependency Verification**:
   - Run `grep -i signalwire package.json package-lock.json` -> Confirms 0 SignalWire NPM packages installed.
2. **SignalWire Route & Endpoint Inspection**:
   - Inspect `backend/routes/signalwire.cjs` lines 14–18, 101–119, 153–231.
   - Run standalone test: `node tests/test_signalwire_m3.cjs` -> Verifies local Express server initializes and responds on `/api/signalwire/*`.
3. **Hosting & Route Rewrites**:
   - Inspect `vercel.json` lines 32–41 and `api/index.js` lines 1–15 -> Confirms Vercel serverless routing to `backend/server.cjs`.
4. **WebSocket & Client Fallback**:
   - Inspect `backend/server.cjs` lines 42–57 and `services/socketService.ts` lines 38–43.
