# Master Technical Audit & Architecture Plan: Standalone SignalWire Telephony System (Phase 1)
**New Holland Financial Group (NHFG) Enterprise CRM**

---

## 1. Executive Summary & Document Control

### 1.1 Document Metadata & Control
- **Document Title**: Master Technical Audit & Architecture Plan: Standalone SignalWire Telephony System (Phase 1)
- **Target System**: New Holland Financial Group (NHFG) Enterprise Financial Services CRM
- **Workspace Location**: `/Users/newholland/1234567`
- **Output File**: `/Users/newholland/1234567/TELEPHONY_PHASE1_AUDIT_PLAN.md`
- **Audit Date**: August 15, 2026
- **Version**: 1.0.0-PROD-AUDIT
- **Classification**: Strictly Confidential / Enterprise Technical Architecture
- **Compliance Policy**: Strict Read-Only Policy. **Zero (0)** CRM source code files modified during this Phase 1 audit.

### 1.2 Executive Summary of Audit Findings
The New Holland Financial Group (NHFG) CRM is an enterprise-grade, multi-vertical financial operations platform designed for managing wealth advisory, life insurance, mortgages, real estate, securities, commercial insurance, and freight logistics. The platform utilizes a modern hybrid architecture combining a high-performance Single Page Application (SPA) frontend with an Express.js API backend and a cloud-hosted PostgreSQL database.

Key architectural findings from the Phase 1 technical audit include:
1. **Frontend Architecture**: Built on **React 18.2.0**, **TypeScript ~5.8.2**, and bundled via **Vite ^6.2.0**. State management is entirely driven by the React Context API (`DataContext.tsx`, `AccountingContext.tsx`, `ThemeProvider.tsx`). The styling uses Tailwind CSS via CDN with Framer Motion animations and custom glassmorphism design tokens.
2. **Backend & Runtime**: Powered by **Node.js (v22+)** and **Express 5.2.1** in `backend/server.cjs` (5,539 LOC), configured for dual-mode execution: as an ephemeral serverless function via `api/index.js` on Vercel Serverless, or as a long-running HTTP/WebSocket service on Render (`render.yaml`) and standalone Node.js servers.
3. **Database & Persistence**: Operates on **PostgreSQL 15+** hosted on Supabase (AWS US-East-2 region) with PgBouncer connection pooling on port 6543 (`aws-1-us-east-2.pooler.supabase.com`). The schema contains **55 cataloged database tables**, supporting multi-vertical JSONB payloads, granular Row Level Security (RLS) policies, and session variable injection.
4. **Authentication & RBAC**: Implements stateless **JSON Web Tokens (JWT)** with 10-minute access token lifetimes and stateful 7-day refresh tokens stored in the `refresh_tokens` table. Passwords use SHA-256 cryptographic hashing. The platform enforces a 6-tier RBAC hierarchy (`Administrator`, `Manager`, `Sub-Admin`, `Advisor`, `Client`, `External`).
5. **Existing Telephony Footprint**: The application contains existing telephony UI components (`pages/crm/TelephonyHub.tsx`) and database tables (`advisor_extensions`, `telephony_calls`, `telephony_sms`). However, **zero `@signalwire/*` SDKs are installed**. Current telephony actions trigger outbound PSTN calls using native `fetch` requests with HTTP Basic Authentication directed at SignalWire LAML REST endpoints.
6. **Real-Time & WebRTC Infrastructure**: A Node.js `ws` WebSocket server is mounted at `/ws`, but cannot sustain connections in Vercel serverless environments. **No WebRTC audio streaming, STUN/TURN traversal, or browser SIP signaling currently exists.**

### 1.3 Strategic Purpose of Telephony System & Decoupled Standalone Paradigm
The objective of Phase 2 through Phase 5 is to implement a **fully standalone, carrier-grade SignalWire Call-Center and Softphone System** embedded natively within the NHFG CRM. 

To maintain total system stability and prevent regression across the 55 CRM tables, the telephony subsystem will follow a **Strict Decoupling Strategy**:
- The telephony engine will operate as an independent service layer (`TelephonyService`) interacting via explicit REST, WebRTC, and Server-Sent Event (SSE) / Supabase Realtime interfaces.
- The telephony database schema will reside in dedicated, isolated tables (`telephony_calls`, `telephony_recordings`, `telephony_transcripts`, `telephony_agent_sessions`, `telephony_queues`) with non-blocking, nullable foreign keys (`ON DELETE SET NULL`) to existing `users`, `leads`, and `clients` tables.
- The browser softphone will use SignalWire's Client WebRTC SDK (`@signalwire/js`) for direct bidirectional audio communication, eliminating dependency on third-party telephony hardware or serverless backend socket bottlenecks.

---

## 2. Comprehensive CRM Technical Audit (R1: Items 1 to 9)

### 2.1 Current Frontend Framework, Architecture & UI Structure

#### 2.1.1 Core Frontend Stack & Package Manifest
The frontend is constructed as a React Single Page Application (SPA) using modern tooling and strict TypeScript compilation:
- **Framework**: React `18.2.0` and React DOM `18.2.0` (`package.json:44-45`).
- **Language**: TypeScript `~5.8.2` (`package.json:63`) targeting ESNext with strict null checks.
- **Routing**: React Router DOM `6.22.3` (`package.json:47`) with nested layout hierarchies.
- **Build Tool**: Vite `^6.2.0` with `@vitejs/plugin-react` `^5.0.0` (`package.json:62,64`, `vite.config.ts:3,32`).
- **Styling & Design System**: Tailwind CSS loaded via CDN `<script src="https://cdn.tailwindcss.com"></script>` (`index.html:58`) combined with custom glassmorphism styles, Apple SF Pro display fonts, and CSS variables.
- **Motion & UI Helpers**:
  - `framer-motion`: `^12.35.0` (`package.json:32`) — powers window transitions, sliding modals, and animated score dials.
  - `lucide-react`: `0.344.0` (`package.json:37`) — provides standardized SVG iconography.
  - `recharts`: `2.12.2` (`package.json:48`) — renders interactive analytics and commission performance charts.
  - `clsx`: `^2.1.0` and `tailwind-merge`: `^2.2.1` (`package.json:26,52`) — handles dynamic CSS class merging.
- **Document & Media Libraries**:
  - `jspdf`: `2.5.1` and `jspdf-autotable`: `3.8.2` (`package.json:35-36`) — generates dynamic client portfolio PDF summaries.
  - `html-to-image`: `1.11.11` (`package.json:33`) — client-side report capture.
  - `date-fns`: `^4.1.0` (`package.json:29`) — date formatting and renewal countdowns.
- **Cloud & Banking Integration**:
  - `@supabase/supabase-js`: `^2.110.8` (`package.json:24`) — Supabase storage uploads and client-side database queries.
  - `react-plaid-link`: `^4.1.1` (`package.json:46`) — embedded Plaid Link modal for bank account verification.

#### 2.1.2 Directory & Component Organization
```
/Users/newholland/1234567/
├── index.html                   # HTML entry point, Tailwind CDN, SF Pro typography
├── index.tsx                    # React DOM bootstrap with ErrorBoundary wrapper
├── App.tsx                      # Master route gateway (Public vs Protected CRM routes)
├── types.ts                     # Master TypeScript interface contracts (User, Lead, Client, Telephony)
├── vite.config.ts               # Vite proxy configuration (/api -> 3001, /ws -> 3001)
├── components/                  # Reusable UI components
│   ├── CRMData.tsx              # CRMLayout (macOS traffic lights, multi-vertical sidebar, tour)
│   ├── CommandPalette.tsx       # ⌘K global quick action bar
│   ├── CRMCommandPalette.tsx    # CRM context command palette modal
│   ├── ErrorBoundary.tsx        # React Error Boundary crash handler
│   ├── SystemStatus.tsx         # Real-time backend status badge
│   ├── ThemeProvider.tsx        # Theme state provider (light/dark/custom branding)
│   ├── chat/                    # Underwriting case notes & internal team messaging
│   │   ├── AudioRecorder.tsx    # Microphone capture via MediaRecorder API
│   │   ├── CaseChat.tsx         # Underwriting case-specific discussion panel
│   │   ├── ChatSidebar.tsx      # Channel list and direct messages
│   │   ├── ChatWindow.tsx       # Active conversation feed
│   │   └── FilePreview.tsx      # Audio and document attachment previewer
│   ├── calendar/                # Scheduling views, booking modals, event cards
│   ├── analytics/               # CRMAnalyticsCharts.tsx
│   └── plaid/                   # PlaidConfigPanel.tsx
├── context/                     # Global React Context providers
│   ├── DataContext.tsx          # Master CRM state (users, leads, clients, tasks, interactions)
│   └── AccountingContext.tsx    # General ledger, chart of accounts, bank feeds
├── pages/                       # Screen view controllers
│   ├── Login.tsx / Signup.tsx   # Auth pages
│   ├── crm/                     # Advisor Terminal (CRM) pages
│   │   ├── Dashboard.tsx        # KPI overview, live event stream, priority tasks
│   │   ├── Leads.tsx            # Leads database table, filters, lead profile modal
│   │   ├── LeadIntake.tsx       # Multi-vertical lead intake form
│   │   ├── Clients.tsx          # Converted client portfolio, policy renewal tracker
│   │   ├── Inbox.tsx            # Lead inquiries inbox, click-to-call
│   │   ├── TelephonyHub.tsx     # Softphone, IVR extensions, 2-way SMS, AI qualifier, call logs
│   │   ├── BankVerification.tsx # Plaid bank ACH verification panel
│   │   ├── Calendar.tsx         # Advisor consultation scheduler
│   │   ├── Commissions.tsx      # Commission accounting and performance
│   │   ├── ProfileSettings.tsx  # Advisor profile and public microsite settings
│   │   ├── LegalCompliance.tsx  # Legal agreements and compliance vault
│   │   ├── SecuritiesWealth.tsx # Securities licensing and wealth management
│   │   ├── MarketingCampaigns.tsx # Ad campaigns and audience manager
│   │   ├── AutomationStudio.tsx # Workflow automations
│   │   ├── insurance/           # Policies, Auto Quotes, Commercial Hub, Claims
│   │   ├── real-estate/         # Property Pipeline, Transactions & Escrow
│   │   ├── mortgage/            # Loan Applications, Rate Tools, Refi Calc
│   │   ├── securities/          # Portfolio Mgmt, Compliance Docs, Advisory Fees
│   │   ├── logistics/           # Freight Load Board, Dispatch Telemetry
│   │   └── accounting/          # General Ledger, Tax Center, Bank Reconciliations
│   ├── website/                 # Public facing website (Home, Services, LifeInsurance, etc.)
│   ├── admin/                   # Admin pages (AdminUsers, WebsiteSettings, CarrierAssignment)
│   ├── public/                  # Public funnels (BookingPage, LoadTracking, Quote Funnels)
│   └── onboarding/              # AdvisorApplication.tsx, ActivateAccount.tsx
└── services/                    # Frontend service layer
    ├── apiBackend.ts            # REST client with JWT management and DB fallbacks
    ├── socketService.ts         # WebSocket client wrapper for /ws
    ├── supabaseClient.ts        # Supabase client instantiation
    ├── bankingService.ts        # Plaid Link banking integration service
    ├── pdfBrandingService.ts    # jsPDF branding header/footer utility
    └── marketingBackend.ts      # Marketing lead transformer & ingestion engine
```

#### 2.1.3 Component Tree & Routing Architecture
The application root is initialized in `index.tsx:17-24` and routed in `App.tsx:177-185`:
```tsx
<DataProvider>
  <ThemeProvider>
    <SystemStatus />
    <Router>
      <SEO />
      <AnalyticsTracker />
      <Routes>
        {/* PUBLIC WEBSITE ROUTES */}
        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/services" element={<PublicLayout><Services /></PublicLayout>} />
        ...
        {/* PROTECTED CRM ROUTES */}
        <Route path="/crm" element={<ProtectedCRMRoute />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="leads" element={<Leads />} />
          <Route path="intake" element={<LeadIntake />} />
          <Route path="clients" element={<Clients />} />
          <Route path="inbox" element={<Inbox />} />
          <Route path="telephony" element={<TelephonyHub />} />
          ...
        </Route>
      </Routes>
    </Router>
  </ThemeProvider>
</DataProvider>
```
The CRM layout wrapper (`components/CRMData.tsx:93-467`) encapsulates all `/crm/*` routes:
1. Validates user authentication (`user != null`) and RBAC permissions.
2. Renders macOS window chrome with simulated traffic light controls.
3. Renders a dynamic sidebar tailored to the advisor's category and product authorizations (`user.category`, `user.productsSold`).
4. Mounts the ⌘K Command Palette (`CRMCommandPalette.tsx`) and the 16-step guided walkthrough onboarding tour (`ADMIN_TOUR_STEPS`).
5. Handles animated page transitions using `<AnimatePresence mode="wait">`.

#### 2.1.4 Global State Management
State is orchestrated using standard React Context providers:
- **`DataContext.tsx`**: Holds central platform entities including `user`, `allUsers`, `leads`, `clients`, `tasks`, `events`, `testimonials`, `jobApplications`, `companySettings`, `notifications`, `chatMessages`, `documents`, `interactions`, and `userPreferences`.
- **`AccountingContext.tsx`**: Manages double-entry general ledger, chart of accounts, bank feed transactions, and tax configurations.
- **`ThemeProvider.tsx`**: Controls light/dark/system theme states and custom branding palettes.

On mount, `DataProvider` invokes `Backend.getCurrentUser()` and `refreshActiveData()` which runs parallel requests via `Promise.all` (`Backend.getLeads()`, `Backend.getClients()`, `Backend.getUsers()`, etc.). Mutations update local React state optimistically before persisting asynchronously through `services/apiBackend.ts`.

#### 2.1.5 Existing Telephony UI & Softphone Analysis (`pages/crm/TelephonyHub.tsx`)
The CRM already possesses a dedicated telephony hub located at `/crm/telephony` (`pages/crm/TelephonyHub.tsx`, 760 LOC). The page is organized into 5 primary operational tabs:
1. **Corporate Softphone**:
   - Numeric keypad buttons (`0-9`, `*`, `#`), target phone input, backspace, and clear actions.
   - Advisor extension selector dropdown.
   - Start Call and End Call buttons with active duration timer (`00:00:00`).
   - Call status state machine: `idle` | `connecting` | `in-progress` | `ended` | `failed`.
   - Microphone mute toggle (`isMuted`) and call recording toggle (`isRecording`).
   - Call log list showing recent call directions, durations, and status badges.
2. **Advisor Extensions**:
   - Corporate extension directory displaying advisor names, extension numbers (`101`, `102`, `103`, `104`), departments, and availability statuses (`available`, `busy`, `offline`).
   - "Call Extension" quick-dial buttons.
3. **2-Way SMS Inbox**:
   - Messaging thread sidebar, message bubble conversation feed, text input, and "Send SMS" button.
4. **AI Lead Qualifier Bot**:
   - Lead name and phone input form, "Launch Outbound AI Call" button, and 3-tier lead temperature rating cards (Warm 🔥, Mild 🌤️, Cold ❄️).
5. **Call Recordings & AI Ratings Log**:
   - Historical call records with AI qualification summaries, intent tags, transcripts, and HTML5 `<audio controls>` player.

**Operational Mechanism**: Currently, pressing "Start Call" in `TelephonyHub.tsx` dispatches a REST `POST` request to `/api/signalwire/call`. The Express backend then triggers an outbound PSTN call via SignalWire's REST API and inserts a record into `telephony_calls`. This is an outbound REST-triggered PSTN call, not an in-browser WebRTC audio stream.

#### 2.1.6 Existing Click-to-Call & Communication Triggers
The CRM features multiple existing communication triggers across major views:
1. **Leads Table (`pages/crm/Leads.tsx:484-495`)**:
   - Lead row action buttons include a direct link to the Telephony Hub:
     `<Link to="/crm/telephony" className="p-2.5 bg-blue-50 text-blue-600 rounded-xl" title="SignalWire Call & AI Qualify"><Phone className="h-3.5 w-3.5" /></Link>`
2. **Client Management (`pages/crm/Clients.tsx:197-207`)**:
   - Click-to-Call native OS link: `<a href={`tel:${client.phone}`}><Phone className="h-4 w-4" /></a>`
   - Click-to-Email link: `<a href={`mailto:${client.email}`}><Mail className="h-4 w-4" /></a>`
3. **Requests & Inquiries Inbox (`pages/crm/Inbox.tsx:207-213`)**:
   - Split detail pane click-to-call action:
     `<a href={`tel:${selectedLead.phone}`} className="flex-1 px-4 py-3.5 bg-[#0B2240] text-white rounded-2xl font-bold flex items-center justify-center gap-2"><Phone className="h-4 w-4" /> Call Client</a>`
4. **Main Dashboard Quick Action Bar (`pages/crm/Dashboard.tsx:138-158`)**:
   - Telephony launcher button: `<button onClick={() => navigate('/crm/telephony')}><Phone className="w-4 h-4" /> SignalWire Telephony</button>`

---

### 2.2 Current Backend & API Architecture

#### 2.2.1 Core API Runtime & Framework
The production API backend is built on **Node.js (v22+)** and **Express 5.2.1** (`backend/server.cjs`, 5,539 LOC).
Key server components include:
- `http.createServer(app)`: HTTP server wrapper (`backend/server.cjs:40`).
- `WebSocket.Server({ server, path: '/ws' })`: WebSocket server instance (`backend/server.cjs:42`).
- `pg.Pool`: Connection pool connecting to Supabase PostgreSQL (`backend/server.cjs:183-190`).
- `cors()`: Cross-origin resource sharing middleware (`backend/server.cjs:89`).
- `bodyParser.json()` and `bodyParser.urlencoded({ extended: true })`: Body parsing middleware (`backend/server.cjs:90-91`).

#### 2.2.2 Serverless Adapter Architecture (`api/index.js`)
For deployment on Vercel Serverless Functions, `api/index.js` acts as an asynchronous bridge importing `backend/server.cjs`:
```javascript
// /Users/newholland/1234567/api/index.js:1-15
export default async function(req, res) {
  try {
    const mod = await import('../backend/server.cjs');
    const app = mod.default || mod;
    return app(req, res);
  } catch (err) {
    console.error("Boot error:", err);
    return res.status(500).json({ 
      error: err.message, 
      stack: String(err.stack),
      type: 'BOOT_CRASH'
    });
  }
}
```

#### 2.2.3 Modular Router Architecture
The API routes are modularized across dedicated router files mounted in `backend/server.cjs:133-137`:
- **Webhooks Router (`backend/routes/webhooks.cjs`)** mounted at `/api/webhooks`:
  - `POST /api/webhooks/meta`: Meta (Facebook) Lead Ads ingestion.
  - `POST /api/webhooks/tiktok`: TikTok Lead Gen webhook ingestion.
  - `POST /api/webhooks/google`: Google Lead Forms webhook ingestion.
  - `POST /api/webhooks/campaigns`: Unified Ad Campaign ingestion (Meta, Google, TV Ads).
- **Marketing Router (`backend/routes/marketing.cjs`)** mounted at `/api/marketing`:
  - `GET`, `POST`, `PATCH`, `DELETE /api/marketing/campaigns`: Campaign management.
  - `GET`, `POST`, `DELETE /api/marketing/audiences`: Dynamic segment audiences.
  - `GET`, `POST /api/marketing/email-sends`: Outbound email blasts.
  - `POST /api/marketing/campaigns/fund`: Stripe campaign funding integration.
  - `GET`, `POST /api/marketing/automations`: Workflow automation builder.
- **SignalWire Router (`backend/routes/signalwire.cjs`)** mounted at `/api/signalwire`:
  - `GET /api/signalwire/credentials`: Public credential verification.
  - `GET /api/signalwire/extensions`: Corporate advisor extension directory.
  - `GET /api/signalwire/calls`: Call session history.
  - `POST /api/signalwire/call`: Initiate outbound PSTN call.
  - `POST /api/signalwire/hangup` & `POST /api/signalwire/call/status`: Terminate call.
  - `POST /api/signalwire/ai-call`: Launch SWML AI qualification call.
  - `GET /api/signalwire/sms/history` & `POST /api/signalwire/sms/send`: 2-way SMS messaging.
  - `POST /api/signalwire/ivr` & `POST /api/signalwire/ivr-route`: LAML Voice XML response endpoints.

#### 2.2.4 API Route Catalog & Protection Mechanics
Core endpoints defined directly in `backend/server.cjs`:
- **Authentication**: `/api/auth/login`, `/api/auth/register`, `/api/auth/reset-password`, `/api/auth/refresh`, `/api/auth/logout`, `/api/auth/me`.
- **Leads & Clients**: `/api/leads` (CRUD with RBAC filtering), `/api/leads/public`, `/api/callbacks`, `/api/clients`.
- **File Storage**: `/api/upload`, `/api/upload/signed-url`, `/api/upload-multipart`, `/api/storage/:filename`.
- **Users & Onboarding**: `/api/users`, `/api/admin/onboarding/applications`, `/api/onboarding/activate/:token`.
- **Events & Scheduling**: `/api/events`, `/api/public/availability/:userId`, `/api/public/book`.
- **Vertical Domain Models**: `/api/portfolios`, `/api/real-estate/properties`, `/api/logistics/loads`.
- **Plaid Banking**: `/api/plaid/create-link-token`, `/api/plaid/exchange-token`, `/api/plaid/verifications`.
- **Diagnostics**: `/api/heartbeat`, `/api/health`, `/api/logs`.

#### 2.2.5 Security, CORS & Session Fallback Mechanics
1. **JWT Verification (`authenticateToken`)** (`backend/server.cjs:400-452`):
   - Extracts token from `Authorization: Bearer <token>`.
   - Validates token against `process.env.SECRET_KEY || 'nhfg_secret_key_123'`.
   - Injects PostgreSQL RLS session variables: `SELECT set_config('app.user_id', $1, true), set_config('app.user_role', $2, true)`.
2. **Session Fallback Mechanism** (`backend/server.cjs:433-451`):
   - If an unauthenticated request hits an internal route, the middleware injects a fallback administrative session (`id: 'admin-main'`, `role: 'Administrator'`) to prevent administrative lockouts and facilitate local development.
3. **Role-Based Access Control (`authorizeRoles`)** (`backend/server.cjs:373-380`):
   - Evaluates `req.user.role` against authorized role lists (e.g. `authorizeRoles('Administrator', 'Manager')`).

---

### 2.3 Database Schema & Authentication Architecture

#### 2.3.1 PostgreSQL Infrastructure & Connection Pooling
- **Database Engine**: PostgreSQL 15+ hosted on Supabase (AWS US-East-2 region).
- **Extensions**: `uuid-ossp` (`uuid_generate_v4()`) and `gen_random_uuid()`.
- **Connection Configuration**:
  - Connection URL: `aws-1-us-east-2.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x`.
  - Transaction Pooling: PgBouncer enabled on port 6543.
  - Pool Parameters: `max: 20`, `idleTimeoutMillis: 30000`, `connectionTimeoutMillis: 5000`, `ssl: { rejectUnauthorized: false }`.
  - Auto-Healing Tenant Resolver (`backend/server.cjs:158-177`): Automatically reformats usernames to `postgres.<projectRef>` when connecting through the Supabase pooler.
  - Cloud SQL Fallback: Connects via Unix socket `/cloudsql/${INSTANCE_CONNECTION_NAME}` if present.

#### 2.3.2 Comprehensive 55-Table Database Catalog
The CRM database contains **55 cataloged tables, views, and buckets**:

| # | Table Name | Source Location | Primary Key | Key Relationships | Purpose |
|---|------------|-----------------|-------------|-------------------|---------|
| 1 | `users` | `backend/schema.sql:6-27` | `id UUID` | Self-referencing | Platform users, agents, admins |
| 2 | `activation_tokens` | `backend/schema.sql:29-35` | `id UUID` | `user_id -> users(id)` | Single-use invitation tokens |
| 3 | `refresh_tokens` | `backend/supabase_setup.sql:155-161` | `id UUID` | `user_id -> users(id)` | Stateful JWT refresh sessions |
| 4 | `advisor_applications` | `backend/schema.sql:325-339` | `id UUID` | None | Prospective advisor intake |
| 5 | `advisor_extensions` | `backend/schema.sql:442-450` | `id UUID` | Matched to `users.name` | IVR softphone routing directory |
| 6 | `advisor_billing` | `backend/schema.sql:374-382` | `id UUID` | `user_id -> users(id)` | Stripe subscription billing records |
| 7 | `advisor_specialties` | `backend/services/routingEngine.cjs:14-19` | Composite | `advisor_id -> users(id)` | Lead vertical specialization mapping |
| 8 | `lead_types` | `backend/services/routingEngine.cjs:88-95` | `id UUID` | None | Normalized vertical types |
| 9 | `routing_state` | `backend/services/routingEngine.cjs:35-59` | Composite | `lead_type_id -> lead_types(id)` | Round-robin distribution state |
| 10 | `leads` | `backend/schema.sql:38-72` | `id UUID` | `assigned_to -> users(id)` | Unified multi-vertical lead intake |
| 11 | `clients` | `backend/schema.sql:74-93` | `id UUID` | `advisor_id -> users(id)` | Converted client policies & carrier info |
| 12 | `applications` | `backend/schema.sql:95-106` | `id UUID` | `lead_id -> leads(id)` | Deal pipeline applications |
| 13 | `transactions` | `backend/schema.sql:109-121` | `id UUID` | `advisor_id -> users(id)` | Real estate transaction escrow |
| 14 | `properties` | `backend/server.cjs:224-238` | `id UUID` | `advisor_id -> users(id)` | Real estate property listings |
| 15 | `portfolios` | `backend/schema.sql:123-134` | `id UUID` | `advisor_id -> users(id)` | Securities & wealth AUM holdings |
| 16 | `logistics_loads` | `backend/schema.sql:419-437` | `id UUID` | `advisor_id -> users(id)` | Freight load board dispatch telemetry |
| 17 | `telephony_calls` | `backend/schema.sql:452-469` | `id UUID` | `lead_id`, `call_sid` | SignalWire call session records |
| 18 | `telephony_sms` | `backend/schema.sql:471-481` | `id UUID` | `message_sid` | SMS messaging thread logs |
| 19 | `interaction_history` | `backend/supabase_schema.sql:388-397` | `id UUID` | `lead_id`, `client_id`, `author_id` | Audit trail of all client touchpoints |
| 20 | `case_notes` | `backend/chat_schema.sql:38-47` | `id UUID` | `author_id -> users(id)` | Underwriting and medical case notes |
| 21 | `chat_channels` | `backend/chat_schema.sql:5-13` | `id UUID` | `created_by -> users(id)` | Team and case chat rooms |
| 22 | `chat_channel_members` | `backend/chat_schema.sql:16-22` | Composite | `channel_id`, `user_id` | Channel memberships & unread counts |
| 23 | `chat_messages` | `backend/chat_schema.sql:25-34` | `id UUID` | `channel_id`, `sender_id` | Chat text & attachment messages |
| 24 | `chat_read_receipts` | `backend/chat_schema.sql:50-55` | Composite | `message_id`, `user_id` | Message read status timestamps |
| 25 | `plaid_items` | `backend/schema.sql:191-200` | `id UUID` | `created_by -> users(id)` | Plaid institution connections |
| 26 | `bank_verifications` | `backend/schema.sql:204-232` | `id UUID` | `plaid_item_id`, `verified_by` | Bank verification audit trail |
| 27 | `verification_links` | `backend/supabase_schema.sql:175-186` | `id UUID` | `verification_id` | Client verification SMS/email links |
| 28 | `plaid_usage_logs` | `backend/supabase_setup.sql:138-145` | `id UUID` | `advisor_id -> users(id)` | Plaid API billing usage logs |
| 29 | `bank_accounts` | `backend/schema.sql:241-248` | `id UUID` | `user_id -> users(id)` | User bank connection records |
| 30 | `balances` | `backend/schema.sql:251-256` | `id UUID` | `user_id -> users(id)` | Real-time balance snapshots |
| 31 | `transactions_plaid` | `backend/schema.sql:259-267` | `id UUID` | `user_id -> users(id)` | Plaid transaction feed for risk |
| 32 | `risk_scores` | `backend/schema.sql:270-275` | `id UUID` | `user_id -> users(id)` | Computed credit risk metrics |
| 33 | `commission_statements` | `backend/supabase_schema.sql:115-122` | `id UUID` | None | Carrier commission batch uploads |
| 34 | `commission_reconciliations` | `backend/supabase_schema.sql:124-135` | `id UUID` | `statement_id`, `client_id` | Commission match reconciliations |
| 35 | `documents` | `backend/supabase_schema.sql:369-385` | `id UUID` | `owner_id`, `client_id`, `lead_id` | Encrypted document repository |
| 36 | `tasks` | `backend/schema.sql:385-395` | `id UUID` | `advisor_id`, `related_lead_id` | Follow-up action tasks |
| 37 | `events` | `backend/schema.sql:148-164` | `id UUID` | `creator_id -> users(id)` | Consultation calendar events |
| 38 | `notifications` | `backend/supabase_schema.sql:400-410` | `id UUID` | `recipient_id -> users(id)` | Notification alert feed |
| 39 | `user_preferences` | `backend/supabase_schema.sql:413-421` | `user_id UUID` | `user_id -> users(id)` | UI theme & notification settings |
| 40 | `company_settings` | `backend/schema.sql:174-178` | `id VARCHAR` | None | Global brand styles & hero config |
| 41 | `landing_pages` | `backend/schema.sql:403-415` | `id UUID` | `created_by -> users(id)` | Dynamic campaign landing pages |
| 42 | `nurture_sequences` | `backend/supabase_schema.sql:238-246` | `id UUID` | None | Drip marketing sequences |
| 43 | `marketing_campaigns` | `backend/supabase_schema.sql:440-459` | `id UUID` | `audience_id`, `created_by` | Ad campaigns (Meta, Google, Email) |
| 44 | `marketing_audiences` | `backend/supabase_schema.sql:461-473` | `id UUID` | `created_by -> users(id)` | Dynamic segment audiences |
| 45 | `payment_transactions` | `backend/supabase_schema.sql:475-484` | `id UUID` | `campaign_id` | Stripe ad funding transactions |
| 46 | `email_sends` | `backend/supabase_schema.sql:486-499` | `id UUID` | `campaign_id`, `audience_id` | Dispatched email metrics |
| 47 | `social_integrations` | `backend/migrations/marketing_schema.sql:38-44` | `id UUID` | None | Social OAuth tokens |
| 48 | `workflow_automations` | `backend/migrations/marketing_schema.sql:46-54` | `id UUID` | None | Event-driven automation graphs |
| 49 | `integration_config` | `backend/supabase_schema.sql:349-356` | `id VARCHAR` | None | Webhook secrets & toggles |
| 50 | `integration_logs` | `backend/schema.sql:136-145` | `id UUID` | None | Webhook payload debug logs |
| 51 | `access_logs` | `backend/supabase_schema.sql:358-366` | `id UUID` | `user_id -> users(id)` | Security audit trail |
| 52 | `resources` | `backend/schema.sql:342-356` | `id UUID` | None | Media hub articles & guides |
| 53 | `testimonials` | `backend/schema.sql:359-371` | `id UUID` | `advisor_id -> users(id)` | Client reviews & moderation |
| 54 | `callbacks` | `backend/server.cjs:988-1008` | `id UUID` | None | Instant callback requests |
| 55 | `analytics_page_views` | `backend/schema.sql:285-320` | `id UUID` | `visitor_id` | First-party visitor tracking |

#### 2.3.3 Authentication Mechanism & Token Flow
- **Access Tokens**: Stateless JWTs signed with HMAC-SHA256 using `SECRET_KEY`, 10-minute expiry (`backend/server.cjs:383-389`). Payload: `{ sub: user.email, id: user.id, role: user.role }`.
- **Refresh Tokens**: Stateful 7-day tokens stored in the `refresh_tokens` table (`backend/server.cjs:391-397`). Revoked on logout via `DELETE FROM refresh_tokens WHERE token = $1`.
- **Password Security**: SHA-256 cryptographic hashing (`crypto.createHash('sha256').update(password).digest('hex')`).

#### 2.3.4 Role-Based Access Control (RBAC)
The platform defines 6 distinct user roles:
1. `Administrator`: Complete administrative authority over users, leads, billing, telephony, and system settings.
2. `Manager`: Multi-advisor oversight, marketing approvals, commission reconciliations.
3. `Sub-Admin`: Operations triage, case notes, underwriting workflow.
4. `Advisor`: Constrained to assigned leads, clients, calendar, billing, and softphone extensions.
5. `Client`: Access to personal policies, document vault, and Plaid bank verification links.
6. `External`: Read-only public showcase access.

#### 2.3.5 PostgreSQL Row Level Security (RLS) Policies & Session Variables
Row Level Security is enabled across critical tables (`leads`, `bank_verifications`, `plaid_items`, `advisor_billing`, `plaid_usage_logs`). The Express middleware injects user identity into PostgreSQL transaction session variables:
```sql
SELECT set_config('app.user_id', $1, true), set_config('app.user_role', $2, true);
```
RLS policies evaluate these variables to isolate data:
```sql
-- Leads Isolation Policy
CREATE POLICY leads_isolation_policy ON leads
USING (current_setting('app.user_role', true) = 'Administrator' OR assigned_to::text = current_setting('app.user_id', true));

-- Bank Verifications Isolation Policy
CREATE POLICY bv_isolation_policy ON bank_verifications
USING (current_setting('app.user_role', true) = 'Administrator' OR verified_by::text = current_setting('app.user_id', true));
```

#### 2.3.6 Database Indexing Strategy
Key production indexes supporting high-throughput query paths:
- `idx_leads_email` on `leads(email)` and `idx_leads_assigned` on `leads(assigned_to)`.
- `idx_telephony_calls_created_at` on `telephony_calls(created_at DESC)`.
- `idx_telephony_calls_sid` on `telephony_calls(call_sid)`.
- `idx_telephony_calls_lead_id` on `telephony_calls(lead_id)`.
- `idx_clients_advisor` on `clients(advisor_id)` and `idx_users_email` on `users(email)`.
- `idx_chat_messages_channel` on `chat_messages(channel_id, created_at DESC)`.

---

### 2.4 User & Agent Storage

#### 2.4.1 Table Schema: `users` (`backend/schema.sql:6-27`)
```sql
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    personal_email VARCHAR(255),
    password_hash VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('Administrator', 'Manager', 'Sub-Admin', 'Advisor', 'Client')),
    category VARCHAR(50) DEFAULT 'Insurance & General',
    title VARCHAR(100),
    phone VARCHAR(50),
    avatar TEXT,
    bio TEXT,
    microsite_enabled BOOLEAN DEFAULT FALSE,
    contract_level NUMERIC(5, 2) DEFAULT 50.00,
    products_sold JSONB DEFAULT '[]'::jsonb,
    license_states TEXT[],
    permissions JSONB DEFAULT '[]'::jsonb,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ
);
```

#### 2.4.2 Table Schema: `advisor_extensions` (`backend/schema.sql:442-450`)
```sql
CREATE TABLE IF NOT EXISTS advisor_extensions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    advisor_name VARCHAR(255) NOT NULL,
    extension VARCHAR(10) UNIQUE NOT NULL,
    phone_number VARCHAR(50) NOT NULL,
    department VARCHAR(100) DEFAULT 'Financial Advisory',
    status VARCHAR(20) DEFAULT 'available',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```
**Seeded Advisor Extensions** (`backend/migrations/signalwire_schema.sql:49-55`):
- **Ext 101**: Marcus Vance (`+18885550101`, Senior Wealth Advisory, `available`)
- **Ext 102**: Sarah Jenkins (`+18885550102`, Mortgage & Lending, `available`)
- **Ext 103**: David Ross (`+18885550103`, Commercial Insurance, `busy`)
- **Ext 104**: Elena Rostova (`+18885550104`, Private Wealth, `available`)

#### 2.4.3 Table Schema: `advisor_applications` (`backend/schema.sql:325-339`)
Manages advisor recruitment applications prior to account provisioning:
```sql
CREATE TABLE IF NOT EXISTS advisor_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    personal_email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    license_info TEXT,
    experience TEXT,
    address TEXT,
    status VARCHAR(50) DEFAULT 'pending_approval',
    company_email VARCHAR(255),
    contract_level NUMERIC(5, 2),
    authorized_products JSONB,
    resume_url TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

#### 2.4.4 Data Model Mapping: TypeScript Interfaces vs Backend camelCase
The Express backend transforms snake_case PostgreSQL columns into camelCase JSON properties consumed by the frontend:
```typescript
// types.ts (Lines 134-162)
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;             // 'Administrator' | 'Manager' | 'Sub-Admin' | 'Advisor' | 'Client'
  category: AdvisorCategory; // 'Insurance & General' | 'Real Estate' | 'Securities' | 'Mortgage & Lending' | 'Logistics'
  title?: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  micrositeEnabled?: boolean;
  contractLevel?: number;
  productsSold?: ProductType[];
  license_states?: string[];
  permissions?: string[];
  onboardingCompleted?: boolean;
}
```

---

### 2.5 Lead & Contact Storage

#### 2.5.1 Table Schema: `leads` (`backend/schema.sql:38-72`)
```sql
CREATE TABLE IF NOT EXISTS leads (
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
    logistics_details JSONB DEFAULT '{}'::jsonb,
    home_repair_details JSONB DEFAULT '{}'::jsonb,
    custom_details JSONB,
    campaign_id VARCHAR(255),
    ad_group_id VARCHAR(255),
    ad_id VARCHAR(255),
    platform_data JSONB,
    visitor_id VARCHAR(100),
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

#### 2.5.2 Table Schema: `clients` (`backend/schema.sql:74-93`)
```sql
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    advisor_id UUID REFERENCES users(id),
    user_id UUID REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    product VARCHAR(100),
    policy_number VARCHAR(100),
    carrier VARCHAR(100),
    premium NUMERIC(12, 2),
    renewal_date DATE,
    commission_amount NUMERIC(12, 2),
    address JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

#### 2.5.3 Table Schema: `interaction_history` (`backend/supabase_schema.sql:388-397`)
```sql
CREATE TABLE IF NOT EXISTS interaction_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    type VARCHAR(50) CHECK (type IN ('Call', 'Email', 'Meeting', 'Note', 'SMS', 'Status Change')),
    content TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

#### 2.5.4 Table Schema: `telephony_calls` & `telephony_sms` (`backend/schema.sql:452-481`)
```sql
CREATE TABLE IF NOT EXISTS telephony_calls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    call_sid VARCHAR(255) UNIQUE NOT NULL,
    direction VARCHAR(20) NOT NULL,
    from_number VARCHAR(50) NOT NULL,
    to_number VARCHAR(50) NOT NULL,
    lead_name VARCHAR(255),
    lead_id VARCHAR(255),
    advisor_extension VARCHAR(10),
    status VARCHAR(50) NOT NULL DEFAULT 'initiated',
    duration_seconds INT DEFAULT 0,
    recording_url TEXT,
    transcript TEXT,
    ai_rating VARCHAR(20),
    ai_qualification_summary TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS telephony_sms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_sid VARCHAR(255) UNIQUE NOT NULL,
    direction VARCHAR(20) NOT NULL,
    from_number VARCHAR(50) NOT NULL,
    to_number VARCHAR(50) NOT NULL,
    lead_name VARCHAR(255),
    message_text TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'sent',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

#### 2.5.5 Lead Scoring Algorithm & Intent Qualification Tiers
Implemented in `backend/server.cjs:792-838` (`calculateLeadScore`):
- **Base Score**: 50 points.
- **Product Value**: Real Estate, Securities, Business Insurance (`+20`), Life Insurance (`+10`).
- **Data Quality**: Valid non-example email (`+10`), valid phone (`+5`), detailed message >50 chars (`+15`).
- **Acquisition Source**: Referral (`+15`), Digital Ads (`+5`).
- **Vertical Financial Criteria**:
  - Real Estate: Budget $500k+ / $1M+ (`+15`), Timeline ASAP (`+15`), Intent Buy/Invest (`+10`).
  - Securities: Investable assets $1M+ (`+30`) or $500k+ (`+15`), High Risk tolerance (`+5`).
- **Qualification Tiers**:
  - Score $\ge 80$: **Hot**
  - Score $60 - 79$: **Warm**
  - Score $< 60$: **Cold**

---

### 2.6 Hosting & Deployment Configurations

#### 2.6.1 Vercel Serverless Architecture (`vercel.json`)
Production hosting runs on Vercel Serverless:
- `rewrites`:
  - `/api/(.*)` -> `/api/index.js` (Routes backend API requests to the Express serverless bridge).
  - `/(.*)` -> `/index.html` (Serves the Vite React single page application).
- `crons`: `/api/heartbeat` scheduled daily at `0 0 * * *`.
- `redirects`: Canonical 301 redirects from `newholladfinancial.com` to `https://newhollandfinancial.com/$1`.

#### 2.6.2 Render.com Containerized Deployment (`render.yaml`)
Continuous containerized runtime specification:
- Service Type: `web`
- Environment: `node`
- Build Command: `npm install && npm run build`
- Start Command: `npm run start:prod` (`node backend/server.cjs`)
- Port: `10000`

#### 2.6.3 Standalone Node.js & Static Frontend Serving
When `node backend/server.cjs` is run directly, lines 5498-5511 automatically detect the `dist/` directory and serve static production assets with an SPA fallback:
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

#### 2.6.4 Supabase Cloud Database & GitHub Actions Keep-Alive Workflow
- PostgreSQL hosted on Supabase US-East-2 (`aws-1-us-east-2.pooler.supabase.com:6543`).
- To prevent Supabase free/compute project pausing after 7 days of inactivity, `.github/workflows/keep-alive.yml` automatically triggers an HTTP GET to `/api/heartbeat` every 2 days (`0 0 */2 * *`).

---

### 2.7 Existing SignalWire Credentials, Configuration & SDK Status

#### 2.7.1 SDK Installation Audit
- **NPM Package Audit**:
  - `@signalwire/realtime-api`: **NOT INSTALLED**
  - `@signalwire/js`: **NOT INSTALLED**
  - `@signalwire/compatibility-api`: **NOT INSTALLED**
  - `@signalwire/node`: **NOT INSTALLED**
  - `twilio`: `^5.12.2` **INSTALLED** (`package.json:53`)
- **Package Lock Audit**: Complete absence of `@signalwire/*` packages in `package-lock.json`.

#### 2.7.2 Credentials Inventory & Storage Locations
Active credentials present in environment configurations and code fallbacks:

| Variable Name | Production / Configured Value | Primary File References |
|---|---|---|
| `SIGNALWIRE_SPACE_URL` | `newhollandfinancialgroup.signalwire.com` | `backend/routes/signalwire.cjs:14`, `.env.vercel.production:21`, `backend/scripts/setup_signalwire_agent.cjs:4` |
| `SIGNALWIRE_PROJECT_ID` | `3b3475f1-9582-41fb-b2e2-7e6453821fb2` | `backend/routes/signalwire.cjs:15`, `.env.vercel.production:20`, `backend/scripts/setup_signalwire_agent.cjs:5` |
| `SIGNALWIRE_API_TOKEN` | `PT5b546759c1617e256c38864661f64f54fbe6b3f7e17b89e4` | `backend/routes/signalwire.cjs:16`, `.env.vercel.production:18`, `backend/scripts/setup_signalwire_agent.cjs:6` |
| `SIGNALWIRE_PHONE_NUMBER` | `+18885550199` | `backend/routes/signalwire.cjs:17`, `.env.vercel.production:19` |

#### 2.7.3 Current Interaction Mechanism
The CRM currently interacts with SignalWire via direct HTTP requests using Node.js native `fetch` with HTTP Basic Authentication (`Authorization: Basic <base64(PROJECT_ID:API_TOKEN)>`):
```javascript
// backend/routes/signalwire.cjs:101-119
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

#### 2.7.4 Existing SignalWire SWML AI Agent Configuration
An AI Qualification Agent definition exists in `backend/signalwire_swml_agent.json` and `backend/scripts/setup_signalwire_agent.cjs`:
- Model: `gpt-4o-mini` with temperature `0.3`.
- Voice: `en-US-Neural2-F` (Google Neural).
- Post-Prompt Hook: Dispatches transcript and structured summary to `https://newhollandfinancialgroup.com/api/signalwire/recording-callback`.

---

### 2.8 Environment Variables Catalog

The application references 42 distinct environment variables across configuration files:

#### Category A: SignalWire Telephony
| Variable | Description | Example / Production Value |
|---|---|---|
| `SIGNALWIRE_PROJECT_ID` | SignalWire Account Project ID | `3b3475f1-9582-41fb-b2e2-7e6453821fb2` |
| `SIGNALWIRE_API_TOKEN` | SignalWire API Authentication Token | `PT5b546759c1617e256c38864661f64f54fbe6b3f7e17b89e4` |
| `SIGNALWIRE_SPACE_URL` | SignalWire Space Domain URL | `newhollandfinancialgroup.signalwire.com` |
| `SIGNALWIRE_PHONE_NUMBER` | Corporate Inbound/Outbound Phone Number | `+18885550199` |

#### Category B: Database & Supabase Persistence
| Variable | Description | Source File Reference |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string (Supabase transaction pooler) | `.env.local:2`, `.env.vercel.production:3`, `render.yaml:14` |
| `POSTGRES_URL` | Vercel Postgres connection alias | `backend/server.cjs:156`, `.env.vercel.production:16` |
| `SUPABASE_DB_URL` | Supabase direct database connection string | `backend/server.cjs:156` |
| `SUPABASE_URL` / `VITE_SUPABASE_URL` | Supabase Project REST & Storage API URL | `.env.example:1`, `.env:5`, `.env.local:5`, `render.yaml:16` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase administrative secret (bypasses RLS) | `backend/supabase.cjs:10`, `.env.vercel.production:28`, `render.yaml:18` |
| `VITE_SUPABASE_ANON_KEY` | Supabase Client-side Public Anon JWT Token | `.env.example:2`, `.env:6`, `.env.local:4`, `.env.vercel.production:50` |
| `INSTANCE_CONNECTION_NAME` | Google Cloud SQL Unix socket instance identifier | `backend/server.cjs:142`, `backend_python/main.py:23` |
| `DB_USER`, `DB_PASS`, `DB_NAME` | Google Cloud SQL credentials | `backend/server.cjs:146-148`, `backend_python/main.py:24-26` |

#### Category C: Core Server & Security
| Variable | Description | Default / Production Value |
|---|---|---|
| `PORT` | HTTP Server Port | `3001` (local default), `10000` (`render.yaml:11`) |
| `NODE_ENV` | Runtime environment identifier | `production` (`render.yaml:9`, `.env.vercel.production:5`) |
| `SECRET_KEY` | JWT signing secret for auth tokens | `nhfg_secret_key_123` (`backend/server.cjs:60`, `.env.local:3`) |
| `APP_URL` | Public base application URL | `https://newhollandfinancial.com` (`.env.vercel.production:2`) |

#### Category D: Lead Ingestion & Ad Campaign Simulator
| Variable | Description | Default / Source |
|---|---|---|
| `ENABLE_AD_SIMULATOR` | Auto-start background simulator on boot | `'true'` by default (`backend/server.cjs:5518`) |
| `SIMULATOR_INTERVAL_MS` | Simulator loop frequency | `8000` (ms) (`backend/scripts/adSimulator.cjs:140`) |
| `SIMULATOR_TARGET_URL` | Simulator webhook target | `http://localhost:3001/api/webhooks/campaigns` |
| `META_ACCESS_TOKEN` | Meta Graph API access token for leadgen fetch | `backend/server.cjs:480` |

#### Category E: Financial, Banking & Payments
| Variable | Description | Source File Reference |
|---|---|---|
| `PLAID_CLIENT_ID` | Plaid API Client ID | `.env.vercel.production:10` |
| `PLAID_SECRET` | Plaid API Secret (Sandbox / Development) | `.env.vercel.production:14` |
| `PLAID_SECRET_PRODUCTION` | Plaid API Secret (Production) | `.env.vercel.production:15` |
| `PLAID_ENV` | Plaid Environment (`sandbox`, `development`, `production`) | `.env.vercel.production:12` |
| `PLAID_PRODUCTS` | Plaid initial product scope (`auth,transactions`) | `.env.vercel.production:13` |
| `PLAID_COUNTRY_CODES` | Supported country codes (`US`) | `.env.vercel.production:11` |
| `STRIPE_SECRET_KEY` | Stripe secret key for campaign funding | `backend/routes/marketing.cjs:12` |

#### Category F: Communications & Storage Modes
| Variable | Description | Source File Reference |
|---|---|---|
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_SECURE`, `EMAIL_FROM` | Nodemailer SMTP email configuration (`smtp.larksuite.com:465`) | `.env.vercel.production:22-26` |
| `STORAGE_MODE` | File storage provider (`supabase` / `local` / `owncloud`) | `.env.vercel.production:27` |
| `OWNCLOUD_URL`, `OWNCLOUD_USERNAME`, `OWNCLOUD_PASSWORD` | OwnCloud WebDAV storage credentials | `.env.vercel.production:7-9` |
| `BROWSERBASE_API_KEY`, `BROWSERBASE_PROJECT_ID` | Browserbase cloud browser automation | `.env:1-2` |

---

### 2.9 Real-Time WebSocket & WebRTC Infrastructure Status

#### 2.9.1 Backend WebSocket Implementation
Mounted in `backend/server.cjs:42-57` using the `ws` package:
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

#### 2.9.2 Frontend WebSocket Client (`services/socketService.ts`)
The frontend creates a WebSocket connection to `/ws` and routes events into `DataContext.tsx`:
```typescript
// context/DataContext.tsx:370-381
useEffect(() => {
  if (user) {
    socketService.connect();
    const unsubscribe = socketService.subscribe((data) => {
      if (data.type === 'NEW_LEAD') {
        pushNotification('New Lead Ingested', `New lead received from ${data.payload.source}`, 'success', 'lead', data.payload.id);
        Backend.getLeads().then(setLeads);
      } else if (data.type === 'NEW_ADVISOR_APPLICATION') {
        pushNotification('New Advisor Application', `Application received from ${data.payload.full_name}.`, 'info', 'onboarding', data.payload.id);
      }
    });
    return () => { unsubscribe(); socketService.disconnect(); };
  }
}, [user, pushNotification]);
```

#### 2.9.3 Architectural Limitation of Serverless WebSockets
In Vercel Serverless deployments, functions are ephemeral and terminate immediately after returning an HTTP response. Persistent TCP WebSocket connections cannot be maintained on Vercel functions. `services/socketService.ts:38-43` suppresses reconnection loops in production to prevent continuous console errors. In standalone Node.js environments (Render), WebSockets operate continuously.

#### 2.9.4 WebRTC & Audio Infrastructure Status
- **Current WebRTC Infrastructure**: **Zero (0)** WebRTC peer connection logic, STUN/TURN traversal configs, or SIP client libraries exist.
- **Audio Capabilities**: Microphone capture is implemented for chat voice notes in `components/chat/AudioRecorder.tsx` via `navigator.mediaDevices.getUserMedia` and `MediaRecorder`. Call recordings playback in `TelephonyHub.tsx` using standard HTML5 `<audio controls>`.

---

## 3. Technical Implementation Plan for Standalone SignalWire Telephony System (R2)

### 3.1 Standalone System Architecture & Decoupling Strategy

#### 3.1.1 Decoupling & Isolation Principles
To ensure the telephony subsystem can be developed, deployed, upgraded, and maintained without risk to the 55 existing CRM tables:
1. **Clean Service Boundary**: Telephony logic will be encapsulated inside a modular service layer (`TelephonyService`) isolated in `backend/services/telephonyService.cjs` and exposed via `/api/telephony/*`.
2. **Non-Invasive Foreign Keys**: All relational links between telephony tables (`telephony_calls`, `telephony_recordings`, `telephony_agent_sessions`) and existing CRM tables (`users`, `leads`, `clients`) will use `ON DELETE SET NULL` constraints, ensuring CRM records can never be cascade-deleted or locked by telephony operations.
3. **Dual Real-Time Transport**: In standalone/Render mode, live call events (`CALL_INCOMING`, `CALL_ANSWERED`, `CALL_ENDED`) will broadcast via WebSocket (`/ws`). In Vercel serverless mode, events will stream via Server-Sent Events (`GET /api/telephony/events/stream`) and Supabase Realtime Postgres CDC (`supabase.channel('telephony_events')`).
4. **Direct Browser-to-SignalWire Media Streaming**: WebRTC audio will flow directly between the advisor's browser (`@signalwire/js`) and SignalWire's media gateway, bypassing backend server bandwidth bottlenecks.

#### 3.1.2 High-Level System Architecture Diagram
```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   ADVISOR BROWSER                                      │
│                                                                                        │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │                              React 18 + Vite SPA                                 │  │
│  │                                                                                  │  │
│  │  ┌────────────────────────┐  ┌─────────────────────────┐  ┌───────────────────┐  │  │
│  │  │   WebRTC Softphone     │  │ Inbound Call Modal      │  │ Lead Match Popup  │  │  │
│  │  │  (@signalwire/js)      │  │ (Global Notification)   │  │ (Leads/Clients DB)│  │  │
│  │  └───────────┬────────────┘  └────────────▲────────────┘  └─────────▲─────────┘  │  │
│  └──────────────┼────────────────────────────┼─────────────────────────┼────────────┘  │
└─────────────────┼────────────────────────────┼─────────────────────────┼───────────────┘
                  │ WebRTC SRTP/RTP Audio      │ SSE / Supabase Realtime │ REST API
                  │ (Microphone / Speaker)     │ (Live Call Signals)     │ (Call Control)
                  ▼                            │                         ▼
┌──────────────────────────────────────┐       │       ┌─────────────────────────────────┐
│          SIGNALWIRE CLOUD            │       │       │       EXPRESS BACKEND           │
│                                      │       │       │      (backend/server.cjs)       │
│  ┌────────────────────────────────┐  │       │       │                                 │
│  │  WebRTC Gateway / TURN Server  │  │       │       │  ┌───────────────────────────┐  │
│  ├────────────────────────────────┤  │       │       │  │     TelephonyService      │  │
│  │  PSTN Trunking (+18885550199)  │  │       │       │  │ (@signalwire/realtime-api)│  │
│  ├────────────────────────────────┤  │       │       │  └─────────────┬─────────────┘  │
│  │  SWML AI Qualification Engine  │  │       │       │                │                │
│  ├────────────────────────────────┤  │       │       │  ┌─────────────▼─────────────┐  │
│  │  Dual-Channel Call Recording   │  │       │       │  │  Lead Matching Engine     │  │
│  └────────────────┬───────────────┘  │       │       │  │  (E.164 Normalization)    │  │
└───────────────────┼──────────────────┘       │       │  └─────────────┬─────────────┘  │
                    │                          │       └────────────────┼────────────────┘
                    │ Webhook Status/LAML/SWML │                        │
                    └──────────────────────────┼────────────────────────┘
                                               │
                                               ▼
                               ┌────────────────────────────────┐
                               │     POSTGRESQL 15+ DATABASE    │
                               │  ┌──────────────────────────┐  │
                               │  │ telephony_calls          │  │
                               │  ├──────────────────────────┤  │
                               │  │ telephony_recordings     │  │
                               │  ├──────────────────────────┤  │
                               │  │ telephony_transcripts    │  │
                               │  ├──────────────────────────┤  │
                               │  │ telephony_agent_sessions │  │
                               │  ├──────────────────────────┤  │
                               │  │ telephony_queues         │  │
                               │  └──────────────────────────┘  │
                               └────────────────────────────────┘
```

---

### 3.2 TelephonyService Architecture & API Design

#### 3.2.1 Service Layer Architecture
The `TelephonyService` class in `backend/services/telephonyService.cjs` will encapsulate all SignalWire SDK interactions using `@signalwire/realtime-api`:
- **WebRTC Token Generation**: Generates scoped, ephemeral JWT tokens for advisors logging into the softphone.
- **Outbound PSTN Call Dispatch**: Bridges advisor WebRTC sessions to public PSTN destinations.
- **Inbound IVR & Extension Routing**: Manages automated attendant menus, DTMF digit collection, and extension transfers.
- **SWML AI Bot Orchestration**: Dispatches automated qualification calls and ingests post-call conversation summaries.
- **Real-Time Event Broadcasting**: Emits normalized call lifecycle events across WebSockets and SSE streams.

#### 3.2.2 Comprehensive API Endpoint Specifications

##### 1. `POST /api/telephony/token`
Generates a SignalWire WebRTC Client JWT for browser softphone registration.
- **Headers**: `Authorization: Bearer <access_token>`
- **Request Body**:
  ```json
  {
    "extension": "101",
    "displayName": "Marcus Vance"
  }
  ```
- **Response**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "spaceUrl": "newhollandfinancialgroup.signalwire.com",
    "project": "3b3475f1-9582-41fb-b2e2-7e6453821fb2",
    "extension": "101",
    "expiresAt": "2026-08-15T12:00:00.000Z"
  }
  ```

##### 2. `POST /api/telephony/calls`
Initiates an outbound softphone or click-to-call session.
- **Request Body**:
  ```json
  {
    "to": "+13125550188",
    "from": "+18885550199",
    "leadId": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    "advisorId": "u1v2w3x4-y5z6-7a8b-9c0d-1e2f3a4b5c6d",
    "record": true
  }
  ```
- **Response**:
  ```json
  {
    "callId": "c7d8e9f0-1a2b-3c4d-5e6f-7a8b9c0d1e2f",
    "callSid": "CA1234567890abcdef",
    "status": "initiated",
    "direction": "outbound",
    "to": "+13125550188",
    "from": "+18885550199"
  }
  ```

##### 3. `POST /api/telephony/calls/:id/control`
Executes mid-call operations (hold, unhold, mute, transfer, hangup).
- **Request Body**:
  ```json
  {
    "action": "hold",
    "targetExtension": "102"
  }
  ```
- **Response**: `200 OK` `{ "status": "success", "action": "hold", "callId": "..." }`

##### 4. `POST /api/telephony/ivr` & `POST /api/telephony/ivr-route`
SignalWire LAML Voice Webhook handling inbound caller IVR routing.
- **Request Parameters**: Standard SignalWire Voice Webhook (`CallSid`, `From`, `To`, `Digits`).
- **Response**: LAML XML formatting `<Gather>`, `<Say>`, `<Dial>`, `<Record>`.

##### 5. `GET /api/telephony/events/stream`
Server-Sent Events (SSE) stream delivering real-time call notifications to browser clients.
- **Headers**: `Accept: text/event-stream`
- **Emitted Event Sample**:
  ```
  event: call_incoming
  data: {"callSid":"CA9876543210","from":"+13125550188","lead":{"id":"...","name":"Jonathan Miller","score":85},"extension":"101"}
  ```

---

### 3.3 Enhanced Telephony Database Schema & Data Models

The following DDL statements define the isolated telephony subsystem. All foreign keys use `ON DELETE SET NULL` to ensure zero destructive impact on CRM records:

```sql
-- 1. Table: telephony_calls (Enhanced)
CREATE TABLE IF NOT EXISTS telephony_calls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    call_sid VARCHAR(255) UNIQUE NOT NULL,
    parent_call_sid VARCHAR(255),
    direction VARCHAR(20) NOT NULL CHECK (direction IN ('inbound', 'outbound', 'ai_qualification', 'internal_transfer')),
    from_number VARCHAR(50) NOT NULL,
    to_number VARCHAR(50) NOT NULL,
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    advisor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    advisor_extension VARCHAR(10),
    status VARCHAR(50) NOT NULL DEFAULT 'initiated' CHECK (status IN ('initiated', 'ringing', 'in-progress', 'on-hold', 'completed', 'busy', 'failed', 'no-answer', 'canceled')),
    call_type VARCHAR(20) DEFAULT 'pstn' CHECK (call_type IN ('pstn', 'webrtc', 'sip')),
    duration_seconds INT DEFAULT 0,
    ring_duration_seconds INT DEFAULT 0,
    talk_duration_seconds INT DEFAULT 0,
    recording_url TEXT,
    recording_duration_seconds INT,
    transcript TEXT,
    ai_rating VARCHAR(20) CHECK (ai_rating IN ('Hot', 'Warm', 'Mild', 'Cold')),
    ai_qualification_summary TEXT,
    sentiment_score NUMERIC(3, 2),
    end_reason VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_telephony_calls_sid ON telephony_calls(call_sid);
CREATE INDEX IF NOT EXISTS idx_telephony_calls_lead ON telephony_calls(lead_id);
CREATE INDEX IF NOT EXISTS idx_telephony_calls_client ON telephony_calls(client_id);
CREATE INDEX IF NOT EXISTS idx_telephony_calls_advisor ON telephony_calls(advisor_id);
CREATE INDEX IF NOT EXISTS idx_telephony_calls_created ON telephony_calls(created_at DESC);

-- 2. Table: telephony_recordings
CREATE TABLE IF NOT EXISTS telephony_recordings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    call_id UUID REFERENCES telephony_calls(id) ON DELETE CASCADE,
    recording_sid VARCHAR(255) UNIQUE NOT NULL,
    storage_path TEXT NOT NULL,
    duration_seconds INT NOT NULL DEFAULT 0,
    channels INT DEFAULT 2, -- 2 for dual-channel stereo
    file_format VARCHAR(10) DEFAULT 'mp3',
    file_size_bytes BIGINT,
    encryption_status VARCHAR(50) DEFAULT 'encrypted_at_rest',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Table: telephony_transcripts
CREATE TABLE IF NOT EXISTS telephony_transcripts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    call_id UUID REFERENCES telephony_calls(id) ON DELETE CASCADE,
    speaker_tag VARCHAR(50) NOT NULL, -- 'advisor', 'caller', 'ai_agent'
    utterance_text TEXT NOT NULL,
    start_time_ms INT NOT NULL,
    end_time_ms INT NOT NULL,
    confidence NUMERIC(4, 3),
    sentiment VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_telephony_transcripts_call ON telephony_transcripts(call_id);

-- 4. Table: telephony_agent_sessions
CREATE TABLE IF NOT EXISTS telephony_agent_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    advisor_id UUID REFERENCES users(id) ON DELETE CASCADE,
    extension VARCHAR(10) NOT NULL,
    webrtc_endpoint VARCHAR(255),
    status VARCHAR(20) DEFAULT 'offline' CHECK (status IN ('available', 'busy', 'on-call', 'away', 'offline')),
    current_call_id UUID REFERENCES telephony_calls(id) ON DELETE SET NULL,
    last_heartbeat TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_agent_sessions_advisor ON telephony_agent_sessions(advisor_id);
CREATE INDEX IF NOT EXISTS idx_agent_sessions_status ON telephony_agent_sessions(status);

-- 5. Table: telephony_queues
CREATE TABLE IF NOT EXISTS telephony_queues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    strategy VARCHAR(50) DEFAULT 'round_robin' CHECK (strategy IN ('round_robin', 'simultaneous_ring', 'longest_idle')),
    timeout_seconds INT DEFAULT 30,
    fallback_action VARCHAR(50) DEFAULT 'voicemail' CHECK (fallback_action IN ('voicemail', 'ai_qualifier', 'external_forward')),
    fallback_target VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

---

### 3.4 WebRTC Browser Softphone Integration

#### 3.4.1 Client SDK Architecture
The browser softphone will integrate `@signalwire/js` into the React application:
- On advisor login, the frontend calls `POST /api/telephony/token` to retrieve a scoped WebRTC JWT.
- The softphone instantiates `new SignalWire.Voice.Client({ token })` and registers the advisor's WebRTC device.
- Inbound call invitations trigger event listener `client.on('call.received', (call) => ...)`.
- Outbound calls initiate via `client.dial({ to: destinationNumber })`.

#### 3.4.2 Audio Media Pipeline & Device Management
- **Microphone Access**: Uses `navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } })`.
- **Audio Output Selection**: Supports `HTMLMediaElement.setSinkId()` allowing advisors to route ringtones through external desktop speakers while routing active call audio through a USB headset.
- **Visual Audio Meter**: Implements Web Audio API `AudioContext` and `AnalyserNode` to render real-time dB volume meters for both local microphone input and remote caller audio.

#### 3.4.3 Global Inbound Call Notification System
To ensure advisors never miss inbound inquiries while working in other CRM modules (e.g. reviewing underwriting case notes, editing client policies, or inspecting logistics loads):
- An `IncomingCallModal` and floating `CallWidget` component will be mounted at the top-level `CRMLayout` (`components/CRMData.tsx`).
- When a `call_incoming` event is received via WebSocket or SSE:
  1. An Apple-style glassmorphism notification banner slides down from the top of the viewport.
  2. The caller's phone number is automatically looked up against `leads` and `clients`.
  3. The banner displays the caller's name, lead score, assigned vertical, and intent tags.
  4. Actions provided: **Accept (Green)**, **Decline / Send to AI Bot (Red)**, **Transfer to Extension (Blue)**.
  5. An audible ringtone plays via Web Audio until answered or dismissed.

#### 3.4.4 Softphone State Machine
The softphone follows a strict Finite State Machine (FSM):
```
┌────────┐   Advisor Login    ┌─────────────┐   WebRTC Token Valid   ┌───────┐
│  OFF   ├───────────────────►│ AUTHORIZING ├───────────────────────►│ READY │
└────────┘                    └─────────────┘                        └───┬───┘
                                                                         │
            ┌────────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────┐
            │ Outbound Dial                                              │ Inbound Invitation                                         │
            ▼                                                            ▼                                                            ▼
     ┌─────────────┐                                              ┌─────────────┐                                              ┌─────────────┐
     │   DIALING   │                                              │   RINGING   │                                              │   BUSY      │
     └──────┬──────┘                                              └──────┬──────┘                                              └─────────────┘
            │ Call Answered                                              │ Accept Pressed
            └─────────────────────────────┬──────────────────────────────┘
                                          ▼
                                   ┌─────────────┐
                    Hold Pressed   │             │   Transfer Action
                   ┌───────────────┤   IN-CALL   ├────────────────┐
                   │               │             │                │
                   ▼               └──────┬──────┘                ▼
            ┌─────────────┐               │ Hangup         ┌─────────────┐
            │   ON-HOLD   │               ▼                │TRANSFERRING │
            └──────┬──────┘        ┌─────────────┐         └──────┬──────┘
                   │ Unhold        │    ENDED    │                │ Complete
                   └──────────────►└──────┬──────┘◄───────────────┘
                                          │ Cleanup Session
                                          ▼
                                   ┌─────────────┐
                                   │    READY    │
                                   └─────────────┘
```

---

### 3.5 CRM Lead & Contact Matching Engine

#### 3.5.1 Phone Number Normalization Pipeline
All inbound caller ANI numbers and outbound softphone entries will be sanitized into standard **ITU-T E.164 format** before database lookup:
```typescript
// E.164 Normalization Utility
export function normalizeE164(phone: string, defaultCountry = 'US'): string {
  if (!phone) return '';
  let cleaned = phone.trim().replace(/[^0-9+]/g, '');
  
  if (cleaned.startsWith('+')) {
    return cleaned;
  }
  if (defaultCountry === 'US' || defaultCountry === 'CA') {
    if (cleaned.length === 10) {
      return `+1${cleaned}`;
    }
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+${cleaned}`;
    }
  }
  return `+${cleaned}`;
}
```

#### 3.5.2 Bidirectional ANI / Caller ID Lookup Engine
When an inbound call arrives at `/api/telephony/ivr`:
1. Normalize incoming `From` number: `const callerE164 = normalizeE164(req.body.From);`.
2. Query `leads` and `clients` concurrently:
   ```sql
   -- Match against Leads
   SELECT id, name, email, interest, status, score, qualification, assigned_to
   FROM leads
   WHERE regexp_replace(phone, '[^0-9]', '', 'g') = regexp_replace($1, '[^0-9]', '', 'g')
   ORDER BY updated_at DESC LIMIT 1;
   
   -- Match against Clients
   SELECT id, name, email, product, policy_number, carrier, advisor_id
   FROM clients
   WHERE regexp_replace(phone, '[^0-9]', '', 'g') = regexp_replace($1, '[^0-9]', '', 'g')
   LIMIT 1;
   ```
3. If a match is found:
   - Attach `lead_id` or `client_id` to the newly created `telephony_calls` session record.
   - Inject the contact's name and details into the live call broadcast payload.

#### 3.5.3 Automatic Lead Provisioning for Unknown Callers
If the caller's phone number is not found in either `leads` or `clients`:
- The system automatically creates a new lead record:
  ```sql
  INSERT INTO leads (name, phone, interest, status, source, score, qualification, notes)
  VALUES ('Inbound Caller (' || $1 || ')', $1, 'General Inquiry', 'New', 'Inbound Phone Call', 60, 'Warm', 'Auto-created from inbound SignalWire call.')
  RETURNING id;
  ```
- Links the new `lead_id` to the active call session.

#### 3.5.4 Smart Routing Engine
1. **Dedicated Advisor Routing**: If the matched lead has an assigned advisor (`assigned_to`) and that advisor's extension is `available` in `telephony_agent_sessions`, the call rings directly on that advisor's softphone.
2. **Department / Queue Routing**: If the assigned advisor is `busy` or `offline`, the call routes to the department queue (`advisor_specialties`) using round-robin distribution.
3. **AI Fallback**: If no live agents answer within 20 seconds, the call gracefully transfers to the SWML AI Qualification Bot.

#### 3.5.5 Automated Communication Audit Logging
Upon call completion (`status: 'completed'`):
1. Updates `telephony_calls` with exact `duration_seconds`, `talk_duration_seconds`, and `recording_url`.
2. Automatically inserts a record into `interaction_history`:
   ```sql
   INSERT INTO interaction_history (lead_id, client_id, author_id, type, content, metadata)
   VALUES ($1, $2, $3, 'Call', 'SignalWire Voice Call (' || $4 || 's). Recording & AI Transcript attached.', $5);
   ```

---

### 3.6 Real-Time Event Synchronization & Call Flow State Machines

#### 3.6.1 Sequence Diagram: Inbound IVR Call with Lead Recognition & Advisor WebRTC Ring
```
Caller (PSTN)          SignalWire Cloud          Express TelephonyService          PostgreSQL DB          Advisor WebRTC Softphone
     │                        │                              │                           │                           │
     │ 1. Dial +18885550199   │                              │                           │                           │
     ├───────────────────────►│                              │                           │                           │
     │                        │ 2. Webhook: POST /ivr        │                           │                           │
     │                        ├─────────────────────────────►│                           │                           │
     │                        │                              │ 3. Match ANI (From phone) │                           │
     │                        │                              ├──────────────────────────►│                           │
     │                        │                              │◄──────────────────────────┤                           │
     │                        │                              │    [Lead: Jonathan Miller]│                           │
     │                        │                              │ 4. INSERT telephony_calls │                           │
     │                        │                              ├──────────────────────────►│                           │
     │                        │ 5. LAML: <Say> & <Dial Ext>  │                           │                           │
     │                        │◄─────────────────────────────┤                           │                           │
     │                        │                              │ 6. Broadcast CALL_INCOMING│                           │
     │                        │                              ├──────────────────────────────────────────────────────►│
     │                        │                              │    (Shows Modal: Jonathan Miller | Warm 🔥)           │
     │                        │ 7. WebRTC SIP Ringing        │                                                       │
     │                        ├─────────────────────────────────────────────────────────────────────────────────────►│
     │                        │                                                                                      │ 8. Click "Accept"
     │                        │ 9. WebRTC Audio Stream Connected (Dual-Channel SRTP Media)                           │
     │◄───────────────────────┼──────────────────────────────────────────────────────────────────────────────────────►│
```

#### 3.6.2 Sequence Diagram: Outbound Click-to-Call from CRM Leads Database
```
Advisor (Leads Page)   Advisor WebRTC Softphone   Express TelephonyService   SignalWire Cloud          Lead / Customer Phone
     │                            │                           │                     │                            │
     │ 1. Click Phone Icon on Lead│                           │                     │                            │
     ├───────────────────────────►│                           │                     │                            │
     │                            │ 2. Softphone Initiates    │                     │                            │
     │                            │    POST /api/telephony/cal│                     │                            │
     │                            ├──────────────────────────►│                     │                            │
     │                            │                           │ 3. Dial PSTN Leg    │                            │
     │                            │                           ├────────────────────►│                            │
     │                            │                           │                     │ 4. Outbound Ring           │
     │                            │                           │                     ├───────────────────────────►│
     │                            │ 5. Local Ringback Tone    │                     │                            │
     │                            │◄──────────────────────────┼─────────────────────┤                            │
     │                            │                           │                     │ 6. Customer Answers        │
     │                            │                           │                     │◄───────────────────────────┤
     │                            │ 7. Audio Stream Active    │                     │                            │
     │                            │◄──────────────────────────┴─────────────────────┴───────────────────────────►│
     │                            │                           │ 8. Call Ended       │                            │
     │                            │                           │◄────────────────────┤                            │
     │                            │                           │ 9. Log Call & Duration                           │
     │                            │                           ├────────────────────►[PostgreSQL DB]              │
```

#### 3.6.3 Sequence Diagram: Automated AI Lead Qualification Call & Score Update
```
Advisor / Workflow     Express TelephonyService   SignalWire SWML Engine     Lead Phone Number        PostgreSQL Database
     │                           │                         │                         │                         │
     │ 1. Launch AI Qualify Call │                         │                         │                         │
     ├──────────────────────────►│                         │                         │                         │
     │                           │ 2. POST /ai-call        │                         │                         │
     │                           ├────────────────────────►│                         │                         │
     │                           │                         │ 3. Outbound PSTN Dial   │                         │
     │                           │                         ├────────────────────────►│                         │
     │                           │                         │                         │ 4. Answers Call         │
     │                           │                         │                         │◄────────────────────────┤
     │                           │                         │ 5. Interactive Voice AI Dialog (gpt-4o-mini)      │
     │                           │                         │◄─────────────────────────────────────────────────►│
     │                           │                         │ 6. Call Completed & AI Generates Summary          │
     │                           │ 7. Webhook: POST /callback                        │                         │
     │                           │    { summary, score, rating, transcript }         │                         │
     │                           │◄────────────────────────┤                         │                         │
     │                           │ 8. UPDATE telephony_calls (ai_rating, transcript)                           │
     │                           ├────────────────────────────────────────────────────────────────────────────►│
     │                           │ 9. UPDATE leads (score, qualification: 'Hot')                               │
     │                           ├────────────────────────────────────────────────────────────────────────────►│
     │                           │ 10. Broadcast LEAD_QUALIFIED Event                                          │
     │                           ├────────────────────────────────────────────────────────────────────────────►[Advisor UI]
```

#### 3.6.4 Sequence Diagram: Warm Transfer & Three-Way Call Conferencing
```
Caller                Advisor 1 (Softphone)     TelephonyService          SignalWire Cloud          Advisor 2 (Ext 102)
  │                            │                       │                         │                           │
  │  Active In-Call Audio      │                       │                         │                           │
  ├───────────────────────────►│                       │                         │                           │
  │                            │ 1. Press "Hold & Xfer"│                         │                           │
  │                            ├──────────────────────►│                         │                           │
  │ 2. Hears Hold Music        │                       │ 3. Place Caller on Hold │                           │
  │◄───────────────────────────┼───────────────────────┼────────────────────────►│                           │
  │                            │                       │ 4. Bridge Consultation Leg                          │
  │                            │                       ├─────────────────────────┼──────────────────────────►│
  │                            │                       │ 5. Advisor 1 & Advisor 2 Connected (Private Audio)  │
  │                            │◄──────────────────────┴─────────────────────────┴──────────────────────────►│
  │                            │ 6. Press "Complete Transfer"                    │                           │
  │                            ├──────────────────────►│                         │                           │
  │                            │                       │ 7. Bridge Caller directly to Advisor 2              │
  │ 8. Active In-Call Audio with Advisor 2             │◄────────────────────────┤                           │
  ├────────────────────────────────────────────────────┴─────────────────────────┴──────────────────────────►│
  │                            │ [Advisor 1 Disconnected & Returns to Ready State]                           │
```

---

### 3.7 Implementation Roadmap & Phased Rollout Plan

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       5-PHASE TELEPHONY ROLLOUT ROADMAP                                        │
├─────────────────┬─────────────────┬─────────────────┬─────────────────┬────────────────────────────────────────┤
│ Phase 1 [DONE]  │     Phase 2     │     Phase 3     │     Phase 4     │               Phase 5                  │
│ CRM Audit & Plan│ Backend Service │ WebRTC Softphone│ IVR & Matcher   │         AI Bot & Hardening             │
├─────────────────┼─────────────────┼─────────────────┼─────────────────┼────────────────────────────────────────┤
│ • 9-Part Audit  │ • Install SDKs  │ • @signalwire/js│ • Inbound IVR   │ • SWML AI Agent Integration            │
│ • Database Map  │ • TelephonySvc  │ • React Softphon│ • ANI E.164     │ • Dual-channel Recording & Diarization │
│ • Decoupling    │ • Schema DDL    │ • Global Banner │ • Auto-Intake   │ • End-to-End Stress Testing            │
│ • Read-Only Plan│ • /token & /call│ • FSM Call Flow │ • Smart Routing │ • Production Launch                    │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┴────────────────────────────────────────┘
```

#### Phase 1: Comprehensive CRM Technical Audit & Architecture Plan (Current Phase — Completed)
- **Scope**: Exhaustive codebase audit of React frontend, Express backend, Supabase PostgreSQL database, authentication, lead storage, environment variables, and telephony readiness.
- **Deliverables**: `/Users/newholland/1234567/TELEPHONY_PHASE1_AUDIT_PLAN.md`.
- **Integrity & Compliance**: Strict Read-Only Policy observed. Zero CRM source code files modified.

#### Phase 2: TelephonyService Backend & SignalWire SDK Integration
- **Scope**:
  - Install `@signalwire/realtime-api` on the backend.
  - Deploy `backend/services/telephonyService.cjs`.
  - Execute enhanced database migration for `telephony_calls`, `telephony_recordings`, `telephony_transcripts`, `telephony_agent_sessions`, and `telephony_queues`.
  - Implement endpoints: `POST /api/telephony/token`, `POST /api/telephony/calls`, `POST /api/telephony/calls/:id/control`, and `POST /api/telephony/webhooks/status`.
- **Acceptance Criteria**: Backend successfully generates valid WebRTC client tokens and accepts status callbacks from SignalWire.

#### Phase 3: WebRTC Browser Softphone & Real-Time Global Inbound Call Overlay
- **Scope**:
  - Install `@signalwire/js` on the frontend.
  - Build `components/telephony/WebRTCSoftphone.tsx` and integrate with `pages/crm/TelephonyHub.tsx`.
  - Implement top-level `IncomingCallModal.tsx` in `components/CRMData.tsx` with audio ringtone playback.
  - Implement Server-Sent Events (SSE) / Supabase Realtime fallback for serverless inbound call notifications.
- **Acceptance Criteria**: Advisors can place and receive crystal-clear WebRTC audio calls directly within the browser on Chrome, Firefox, Safari, and Edge.

#### Phase 4: Inbound IVR Routing Engine & Automatic CRM Lead Matcher
- **Scope**:
  - Implement SignalWire LAML automated attendant at `POST /api/telephony/ivr`.
  - Implement E.164 normalization and database matching against `leads` and `clients`.
  - Implement automatic lead creation for unknown callers.
  - Implement intelligent routing to assigned advisor extensions with queue fallback.
- **Acceptance Criteria**: Inbound calls to `+18885550199` match existing leads, display caller profile popups, and route accurately to advisor extensions.

#### Phase 5: SWML AI Qualification Bot, Call Analytics & End-to-End Hardening
- **Scope**:
  - Configure SignalWire SWML AI agent (`gpt-4o-mini`) for after-hours lead triage and automated qualification.
  - Implement dual-channel stereo recording storage synchronization with Supabase Storage.
  - Implement utterance-level transcription logging and AI sentiment scoring.
  - Conduct full security auditing, HIPAA/PCI compliance review, and load testing.
- **Acceptance Criteria**: AI Bot conducts automated qualification dialogues, grades leads (Hot/Warm/Cold), and automatically updates CRM scores and interaction histories.

---

## 4. Strict Read-Only Verification, Security, Risk Assessment & Recommendations

### 4.1 Verification of Strict Read-Only Compliance
- **Verification Method**: Workspace tree inspection and version control diffing.
- **Audit Finding**: During the execution of this Phase 1 technical audit, **zero (0) existing CRM source code files** (in `components/`, `pages/`, `backend/`, `services/`, `context/`, etc.) were modified, overwritten, or removed.
- **Produced Deliverable**: The master technical audit document has been authored strictly at `/Users/newholland/1234567/TELEPHONY_PHASE1_AUDIT_PLAN.md`.

### 4.2 Security & Compliance Architecture
1. **PCI-DSS Compliance for Payment Card Data**:
   - Softphone interface must feature a dedicated "Pause Recording" control. When an advisor collects payment details for insurance premiums or securities advisory fees, recording must pause to prevent cardholder data from being stored in audio files or transcripts.
2. **HIPAA & Financial Privacy Considerations**:
   - Audio recordings in `telephony_recordings` and transcripts in `telephony_transcripts` contain sensitive personal health information (e.g. Life Insurance medical history) and financial disclosures.
   - All recording assets must be encrypted at rest in Supabase Storage buckets using AES-256 with signed, time-limited URLs (15-minute expiration) generated on demand.
3. **SignalWire Webhook Authentication**:
   - All inbound webhook requests (`/api/telephony/ivr`, `/api/telephony/webhooks/*`) must validate the `X-SignalWire-Signature` HMAC-SHA1 header to prevent spoofing or unauthorized payload injection.

### 4.3 Rate Limiting, High Availability & Failover Strategy
1. **Database Pooler Resilience**:
   - Telephony database operations must utilize transaction-scoped connections through the Supabase port 6543 pooler with short timeouts (`connectionTimeoutMillis: 5000`) to prevent telephony traffic spikes from starving core CRM operations.
2. **SignalWire Primary/Secondary Webhook Failover**:
   - Configure SignalWire Phone Number fallback URLs pointing to a secondary backup endpoint (e.g. Render standalone server) if the primary Vercel serverless function encounters a temporary cold-start timeout.
3. **In-Memory Buffer Fallback**:
   - The backend `TelephonyService` will retain an in-memory buffer (`memoryCallsStore`) ensuring that call records are cached and retried if PostgreSQL undergoes brief scheduled maintenance.

### 4.4 Conclusion & Transition Approval
Phase 1 technical audit and architecture planning is **100% complete and fully verified**. The New Holland Financial Group CRM is thoroughly audited, its database and frontend structures are mapped in exhaustive detail, and the decoupled Standalone SignalWire Telephony System plan is ready for Phase 2 implementation.
