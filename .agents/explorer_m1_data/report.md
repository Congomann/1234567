# CRM Technical Audit: Database Schema, Authentication, Users & Leads Storage

**Author**: Explorer Subagent (`explorer_m1_data`)  
**Investigation Target**: Database Schema & Infrastructure, Authentication Mechanism, Users & Agents Storage, Leads & Contacts Storage  
**Workspace Root**: `/Users/newholland/1234567`  
**Date**: 2026-08-15  
**Policy Compliance**: Strict Read-Only (0 CRM source code files modified)

---

## Executive Summary

This report delivers a deep-dive technical audit of the New Holland Financial Group (NHFG) Enterprise CRM application. The CRM operates on a modern hybrid stack: a React 18 + Vite frontend interfacing with a Node.js Express 5.2 backend (`backend/server.cjs`), backed by PostgreSQL 15+ hosted on Supabase (with Cloud SQL compatibility) using connection pooling (Port 6543 Transaction Pooler). The application features multi-vertical support (Life Insurance, Real Estate, Mortgage, Securities, Logistics, Home Repair), automated webhook ingestion, financial criteria screening, and an integrated SignalWire corporate telephony & AI qualification subsystem.

---

## 1. Database Schema and Infrastructure

### 1.1 PostgreSQL Engine and Connection Infrastructure
- **Engine Version**: PostgreSQL 15+ / 16 (AWS US-East-2 Supabase cluster: `aws-1-us-east-2.pooler.supabase.com`).
- **Extensions**:
  - `uuid-ossp` (`backend/schema.sql:3`, `backend/supabase_schema.sql:6`, `backend/supabase_setup.sql:7`) enabling `uuid_generate_v4()`.
  - Built-in `gen_random_uuid()` fallback utilized in migrations (`backend/migrations/signalwire_schema.sql:5,17,37`).
- **Connection Configuration & Pooling**:
  - Configured in `backend/server.cjs:139-205` using the `pg` (`node-postgres`) `Pool` class.
  - **Supabase Transaction Pooler**: Connects via `DATABASE_URL` / `POSTGRES_URL` to `aws-1-us-east-2.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x` (`backend/.env:4-5`).
  - **Pool Tuning Parameters** (`backend/server.cjs:183-190`):
    - `max`: 20 connections.
    - `idleTimeoutMillis`: 30,000 ms (30s).
    - `connectionTimeoutMillis`: 5,000 ms (5s).
    - `ssl`: `{ rejectUnauthorized: false }`.
  - **Auto-Healing Tenancy & DNS Resolver** (`backend/server.cjs:158-177`):
    - Automatically parses connection string; if `pooler.supabase.com` is detected and the username lacks tenant project reference, it formats `dbUrl.username = postgres.<projectRef>` dynamically based on `SUPABASE_URL` (`backend/server.cjs:164-173`).
  - **Google Cloud SQL Support** (`backend/server.cjs:142-153`):
    - Detects `process.env.INSTANCE_CONNECTION_NAME` to connect via Unix domain socket `/cloudsql/${INSTANCE_CONNECTION_NAME}` (pool max: 10).
  - **Supabase JavaScript SDK Clients**:
    - `backend/supabaseClient.cjs:1-15`: Initialized with `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (or `VITE_SUPABASE_ANON_KEY`) for data access and storage bucket uploads.
    - `backend/supabase.cjs:1-24`: Configured with `{ auth: { autoRefreshToken: false, persistSession: false } }` for backend service operations bypassing RLS.
  - **Keep-Alive Heartbeat**: `GET /api/heartbeat` (`backend/server.cjs:118-130`) executes `SELECT NOW() as heartbeat` to prevent Supabase compute pausing.

---

### 1.2 Comprehensive Database Table Catalog

The CRM database encompasses **55 tables, views, and storage buckets** partitioned across core modules:

```
                               ┌─────────────────────────────┐
                               │       users (Identity)      │
                               └──────────────┬──────────────┘
                                              │ 1:N
               ┌──────────────────────────────┼──────────────────────────────┐
               ▼                              ▼                              ▼
      ┌─────────────────┐            ┌─────────────────┐            ┌─────────────────┐
      │      leads      │            │     clients     │            │advisor_extension│
      └────────┬────────┘            └────────┬────────┘            └────────┬────────┘
               │                              │                              │
        1:N    ▼                       1:N    ▼                       1:N    ▼
 ┌───────────────────────────┐ ┌───────────────────────────┐ ┌───────────────────────────┐
 │    interaction_history    │ │       applications        │ │      telephony_calls      │
 ├───────────────────────────┤ ├───────────────────────────┤ ├───────────────────────────┤
 │        case_notes         │ │ commission_reconciliations│ │       telephony_sms       │
 ├───────────────────────────┤ ├───────────────────────────┤ └───────────────────────────┘
 │           tasks           │ │         documents         │
 └───────────────────────────┘ └───────────────────────────┘
```

#### Detailed Table Specifications

| # | Table Name | Source Location | Primary Key | Key Foreign Keys & Relationships | Functional Purpose |
|---|------------|-----------------|-------------|----------------------------------|--------------------|
| 1 | `users` | `backend/schema.sql:6-27`<br>`backend/supabase_schema.sql:9-29` | `id UUID` | Self-referencing hierarchies | Core user accounts (Advisors, Admins, Managers, Sub-Admins, Clients). |
| 2 | `activation_tokens` | `backend/schema.sql:29-35`<br>`backend/supabase_schema.sql:49-55` | `id UUID` | `user_id -> users(id)` (CASCADE) | Single-use invitation tokens for newly approved advisor onboarding. |
| 3 | `refresh_tokens` | `backend/supabase_setup.sql:155-161` | `id UUID` | `user_id -> users(id)` (CASCADE) | Persistent session management for JWT auth refresh. |
| 4 | `advisor_applications` | `backend/schema.sql:325-339`<br>`backend/supabase_schema.sql:32-47` | `id UUID` | None (Pre-user stage) | Intake portal for prospective advisors applying to join NHFG. |
| 5 | `advisor_extensions` | `backend/schema.sql:442-450`<br>`backend/migrations/signalwire_schema.sql:4-13` | `id UUID` | Matched to `users.name` / extension | Corporate IVR softphone routing directory. |
| 6 | `advisor_billing` | `backend/schema.sql:374-382`<br>`backend/supabase_setup.sql:127-135` | `id UUID` | `user_id -> users(id)` (CASCADE) | Advisor Stripe subscription records for Plaid & portal billing. |
| 7 | `advisor_specialties` | `backend/services/routingEngine.cjs:14-19` | Composite | `advisor_id -> users(id)` | Maps advisors to specific lead vertical specializations. |
| 8 | `lead_types` | `backend/services/routingEngine.cjs:88-95` | `id UUID` | None | Normalized vertical types (e.g. Life, Mortgage, Freight). |
| 9 | `routing_state` | `backend/services/routingEngine.cjs:35-59` | Composite | `lead_type_id -> lead_types(id)` | State tracking for round-robin lead distribution across advisors. |
| 10 | `leads` | `backend/schema.sql:38-72`<br>`backend/supabase_schema.sql:58-83` | `id UUID` | `assigned_to -> users(id)` | Unified multi-vertical lead intake repository with JSONB specifics. |
| 11 | `clients` | `backend/schema.sql:74-93`<br>`backend/supabase_schema.sql:86-100` | `id UUID` | `advisor_id -> users(id)`, `user_id -> users(id)` | Converted client policies, carrier details, and premium tracking. |
| 12 | `applications` | `backend/schema.sql:95-106`<br>`backend/supabase_schema.sql:102-112` | `id UUID` | `lead_id -> leads(id)`, `advisor_id -> users(id)` | Deal pipeline (Pending, Underwriting, Approved, Issued, Declined). |
| 13 | `transactions` | `backend/schema.sql:109-121` | `id UUID` | `advisor_id -> users(id)` | Real Estate buyer/seller transaction tracking and earnest money. |
| 14 | `properties` | `backend/migrations/supabase_master_sync.sql:68-79`<br>`backend/server.cjs:224-238` | `id UUID` | `advisor_id -> users(id)` | Real estate property listings showcase. |
| 15 | `portfolios` | `backend/schema.sql:123-134`<br>`backend/supabase_master_sync.sql:56-65` | `id UUID` | `advisor_id -> users(id)` | Securities & wealth management AUM holdings, returns, and risk. |
| 16 | `logistics_loads` | `backend/schema.sql:419-437`<br>`backend/supabase_schema.sql:516-537` | `id UUID` | `advisor_id -> users(id)` (SET NULL) | Freight load board dispatch telemetry with GPS coordinates. |
| 17 | `telephony_calls` | `backend/schema.sql:452-469`<br>`backend/migrations/signalwire_schema.sql:16-33` | `id UUID` | `lead_id` (Logical), `call_sid` (Unique) | SignalWire call session records, AI ratings, transcripts, recordings. |
| 18 | `telephony_sms` | `backend/schema.sql:471-481`<br>`backend/migrations/signalwire_schema.sql:36-46` | `id UUID` | `message_sid` (Unique) | SMS messaging thread logs for inbound and outbound interactions. |
| 19 | `interaction_history` | `backend/supabase_schema.sql:388-397`<br>`backend/server.cjs:1618-1650` | `id UUID` | `lead_id -> leads(id)`, `client_id -> clients(id)`, `author_id -> users(id)` | Chronological audit log of all communications (Call, SMS, Note). |
| 20 | `case_notes` | `backend/chat_schema.sql:38-47`<br>`backend/supabase_schema.sql:216-224` | `id UUID` | `author_id -> users(id)` | Underwriting, medical history, and decline reason case notes. |
| 21 | `chat_channels` | `backend/chat_schema.sql:5-13`<br>`backend/supabase_schema.sql:189-197` | `id UUID` | `created_by -> users(id)`, `case_id` | Internal team chat rooms, direct messages, and case-linked channels. |
| 22 | `chat_channel_members`| `backend/chat_schema.sql:16-22`<br>`backend/supabase_schema.sql:199-205` | Composite `(channel_id, user_id)` | `channel_id -> chat_channels(id)`, `user_id -> users(id)` | User channel memberships and unread message counters. |
| 23 | `chat_messages` | `backend/chat_schema.sql:25-34`<br>`backend/supabase_schema.sql:207-214` | `id UUID` | `channel_id -> chat_channels(id)`, `sender_id -> users(id)` | Channel text messages, attachments, and carrier suggestion metadata. |
| 24 | `chat_read_receipts` | `backend/chat_schema.sql:50-55` | Composite `(message_id, user_id)` | `message_id -> chat_messages(id)`, `user_id -> users(id)` | Read receipts per message per participant. |
| 25 | `plaid_items` | `backend/schema.sql:191-200`<br>`backend/supabase_schema.sql:138-149` | `id UUID` | `created_by -> users(id)` | Plaid institution connections (encrypted `access_token` at rest). |
| 26 | `bank_verifications` | `backend/schema.sql:204-232`<br>`backend/supabase_schema.sql:151-173` | `id UUID` | `plaid_item_id -> plaid_items(id)`, `verified_by -> users(id)` | Bank account verification audit trail, routing numbers, risk scores. |
| 27 | `verification_links` | `backend/supabase_schema.sql:175-186` | `id UUID` | `verification_id -> bank_verifications(id)` | Secure client-facing verification tokens sent via SMS/Email. |
| 28 | `plaid_usage_logs` | `backend/supabase_setup.sql:138-145` | `id UUID` | `advisor_id -> users(id)` (SET NULL) | Billing usage tracking for Plaid API calls. |
| 29 | `bank_accounts` | `backend/schema.sql:241-248` | `id UUID` | `user_id -> users(id)` | User bank connection records. |
| 30 | `balances` | `backend/schema.sql:251-256` | `id UUID` | `user_id -> users(id)` | Real-time balance snapshots. |
| 31 | `transactions_plaid`| `backend/schema.sql:259-267` | `id UUID` | `user_id -> users(id)` | Plaid synced transactions for underwriting risk engine. |
| 32 | `risk_scores` | `backend/schema.sql:270-275` | `id UUID` | `user_id -> users(id)` | Computed draft risk and credit metrics. |
| 33 | `commission_statements` | `backend/supabase_schema.sql:115-122` | `id UUID` | None | Carrier commission statement batch uploads. |
| 34 | `commission_reconciliations` | `backend/supabase_schema.sql:124-135` | `id UUID` | `statement_id -> commission_statements(id)`, `client_id -> clients(id)`, `advisor_id -> users(id)` | Match engine comparing expected vs actual carrier commissions. |
| 35 | `documents` | `backend/supabase_schema.sql:369-385` | `id UUID` | `owner_id -> users(id)`, `client_id -> clients(id)`, `lead_id -> leads(id)` | Encrypted document repository with granular role/user ACLs. |
| 36 | `tasks` | `backend/schema.sql:385-395` | `id UUID` | `advisor_id -> users(id)`, `related_lead_id -> leads(id)` | Automated and manual follow-up tasks. |
| 37 | `events` | `backend/schema.sql:148-164`<br>`backend/server.cjs:281-298` | `id UUID` | `creator_id -> users(id)` | Consultation calendar events, Google Meet links, participants. |
| 38 | `notifications` | `backend/supabase_schema.sql:400-410` | `id UUID` | `recipient_id -> users(id)` (CASCADE) | Real-time notification feed for leads, status changes, and alerts. |
| 39 | `user_preferences` | `backend/supabase_schema.sql:413-421` | `user_id UUID` | `user_id -> users(id)` (CASCADE) | UI preferences, theme, timezone, notification channels. |
| 40 | `company_settings` | `backend/schema.sql:174-178`<br>`backend/supabase_schema.sql:249-253` | `id VARCHAR(50)` | None | Dynamic company content, hero video/image, contact info, brand styles. |
| 41 | `landing_pages` | `backend/schema.sql:403-415`<br>`backend/supabase_schema.sql:227-236` | `id UUID` / `slug` | `created_by -> users(id)` | Dynamic campaign landing pages with JSONB style configs. |
| 42 | `nurture_sequences`| `backend/supabase_schema.sql:238-246` | `id UUID` | None | Multi-step drip campaigns triggered by lead status transitions. |
| 43 | `marketing_campaigns`| `backend/supabase_schema.sql:440-459`<br>`backend/migrations/marketing_schema.sql:13-27` | `id UUID` | `audience_id -> marketing_audiences(id)`, `created_by -> users(id)` | Email, Google, Meta ad campaigns with ROI and conversion stats. |
| 44 | `marketing_audiences`| `backend/supabase_schema.sql:461-473`<br>`backend/migrations/marketing_schema.sql:5-11` | `id UUID` | `created_by -> users(id)` | Dynamic segment audiences with JSONB query criteria. |
| 45 | `payment_transactions`| `backend/supabase_schema.sql:475-484`<br>`backend/migrations/marketing_schema.sql:29-36` | `id UUID` | `campaign_id -> marketing_campaigns(id)` | Stripe payment charges funding ad campaign budgets. |
| 46 | `email_sends` | `backend/supabase_schema.sql:486-499` | `id UUID` | `campaign_id -> marketing_campaigns(id)`, `audience_id -> marketing_audiences(id)` | Dispatched email blasts, open rates, and click tracking. |
| 47 | `social_integrations`| `backend/migrations/marketing_schema.sql:38-44` | `id UUID` | None | OAuth tokens for connected social platforms (Meta, TikTok, Google). |
| 48 | `workflows` / `workflow_automations` | `backend/schema.sql:180-185`<br>`backend/migrations/marketing_schema.sql:46-54` | `id UUID` / `VARCHAR` | None | Event-driven automation workflows with JSONB action graphs. |
| 49 | `integration_config`| `backend/supabase_schema.sql:349-356` | `id VARCHAR(50)` | None | API webhook secrets and toggles for Meta, Google, TikTok Ads. |
| 50 | `integration_logs` | `backend/schema.sql:136-145` | `id UUID` | None | Webhook payload logs for external platform debugging. |
| 51 | `access_logs` | `backend/supabase_schema.sql:358-366`<br>`backend/server.cjs:321-335` | `id UUID` | `user_id -> users(id)` (SET NULL) | Security audit trail recording IP addresses, actions, user agents. |
| 52 | `resources` | `backend/schema.sql:342-356`<br>`backend/supabase_schema.sql:255-269` | `id UUID` | None | Media hub articles, PDF guides, videos, like/share counters. |
| 53 | `testimonials` | `backend/schema.sql:359-371`<br>`backend/supabase_schema.sql:271-284` | `id UUID` | `advisor_id -> users(id)` (CASCADE) | Client reviews and moderation workflow. |
| 54 | `callbacks` | `backend/server.cjs:988-1008` | `id UUID` | None | Instant callback requests from website visitors. |
| 55 | `analytics_page_views` / `analytics_visitors` / `analytics_sessions` | `backend/schema.sql:285-320`<br>`backend/supabase_schema.sql:297-303` | `id UUID` | `visitor_id -> analytics_visitors(visitor_id)` | First-party visitor journey and clickstream tracking. |

---

### 1.3 Database Indexing Strategy
The database contains dedicated indexes for high-throughput CRM query paths:
- **Lead Lookups**: `idx_leads_email` (`leads.email`), `idx_leads_assigned` (`leads.assigned_to`) (`backend/schema.sql:167-168`).
- **Telephony & Call Matching**:
  - `idx_telephony_calls_created_at` (`telephony_calls(created_at DESC)`) (`backend/schema.sql:483`).
  - `idx_telephony_calls_sid` (`telephony_calls(call_sid)`) (`backend/schema.sql:484`).
  - `idx_telephony_calls_lead_id` (`telephony_calls(lead_id)`) (`backend/schema.sql:485`).
- **Client & Advisor Lookups**: `idx_clients_advisor` (`clients.advisor_id`), `idx_users_email` (`users.email`) (`backend/supabase_schema.sql:306`).
- **Plaid & Bank Audit**: `idx_bank_verif_status` (`bank_verifications(status)`), `idx_bank_verifications_client` (`bank_verifications(client_name)`) (`backend/schema.sql:234`).
- **Chat Performance**: `idx_chat_messages_channel` (`chat_messages(channel_id, created_at DESC)`) (`backend/chat_schema.sql:58`).

---

## 2. Authentication Mechanism

### 2.1 Implementation Architecture
Authentication is implemented via a **stateless JSON Web Token (JWT) + Stateful Refresh Token** architecture in Node.js Express (`backend/server.cjs:382-450`, `1145-1415`).

```
┌──────────────┐                 ┌───────────────────────┐                 ┌──────────────────┐
│ Client App   │                 │ Express Backend       │                 │ PostgreSQL DB    │
└──────┬───────┘                 └───────────┬───────────┘                 └────────┬─────────┘
       │                                     │                                      │
       │ 1. POST /api/auth/login             │                                      │
       ├────────────────────────────────────►│                                      │
       │    { email, password }              │ 2. Query user & check password_hash  │
       │                                     ├─────────────────────────────────────►│
       │                                     │◄─────────────────────────────────────┤
       │                                     │ 3. Generate Access JWT (10m)         │
       │                                     │    Generate Refresh JWT (7d)         │
       │                                     │ 4. INSERT INTO refresh_tokens        │
       │                                     ├─────────────────────────────────────►│
       │ 5. { access_token, refresh_token }  │                                      │
       │◄────────────────────────────────────┤                                      │
       │                                     │                                      │
       │ 6. GET /api/leads                   │                                      │
       │    Header: Bearer <access_token>    │ 7. authenticateToken middleware      │
       ├────────────────────────────────────►│    - Verify JWT signature & expiry   │
       │                                     │    - Set PostgreSQL RLS context:     │
       │                                     │      SET app.user_id, app.user_role  │
       │                                     ├─────────────────────────────────────►│
       │ 8. Filtered lead dataset            │◄─────────────────────────────────────┤
       │◄────────────────────────────────────┤                                      │
```

- **Token Specifications**:
  - **Access Token** (`backend/server.cjs:383-389`):
    - Payload: `{ sub: user.email, id: user.id, role: user.role }`.
    - Signed with: `process.env.SECRET_KEY || 'nhfg_secret_key_123'`.
    - Expiration: `10m` (10 minutes).
  - **Refresh Token** (`backend/server.cjs:391-397`):
    - Payload: `{ sub: user.email, id: user.id, role: user.role }`.
    - Expiration: `7d` (7 days).
    - Persisted in PostgreSQL table `refresh_tokens` (`user_id`, `token`, `expires_at`).
- **Password Hashing**:
  - SHA-256 cryptographic hashing via `crypto.createHash('sha256').update(password).digest('hex')` (`backend/server.cjs:1190`, `1247`, `1477`).
  - Seed admin password hash: `b9e106daeb5faccfb28ffa5d7f7bb36ee622370c9197c386fcaedaa78507bb6f` (`backend/supabase_schema.sql:314`).

---

### 2.2 Auth Endpoints Inventory

| Route | Method | Middleware | Function & Security Logic | File Citation |
|---|---|---|---|---|
| `/api/auth/login` | `POST` | Public | Validates email/password against SHA-256 hash in `users`. Stores refresh token in DB. Emits access token (10m) & refresh token (7d). Includes emergency hardcoded backdoor for `info@newhollandfinancial.com`. Logs to `access_logs`. | `backend/server.cjs:1145-1237` |
| `/api/auth/register` | `POST` | Public | Checks email uniqueness in `users`, creates new account with SHA-256 password hash, assigns default role `'Client'`, issues tokens. | `backend/server.cjs:1239-1275` |
| `/api/auth/refresh` | `POST` | Public | Validates signature and active non-expired DB record in `refresh_tokens`. Retrieves latest user role from DB and emits fresh 10m access token. | `backend/server.cjs:1314-1368` |
| `/api/auth/logout` | `POST` | Public | Revokes session by executing `DELETE FROM refresh_tokens WHERE token = $1`. | `backend/server.cjs:1370-1380` |
| `/api/auth/reset-password` | `POST` | Public | Generates 20-byte random hex token, composes branded HTML reset template, and dispatches email via SMTP (`smtp.larksuite.com:465`). | `backend/server.cjs:1277-1312` |
| `/api/auth/me` | `GET` | `authenticateToken` | Returns authenticated user profile, roles, category, and authorized products from `users`. | `backend/server.cjs:1382-1415` |

---

### 2.3 Role-Based Access Control (RBAC)
- **Role Hierarchy**:
  1. `Administrator`: Complete platform visibility across all advisors, documents, leads, telephony records, settings, and billing.
  2. `Manager`: Multi-advisor supervision, marketing campaign approvals, commission reconciliations.
  3. `Sub-Admin`: Operations specialist handling underwriting, case notes, and lead triage.
  4. `Advisor`: Constrained to own leads, assigned clients, softphone extensions, calendar, and billing.
  5. `Client`: Access to personal policies, bank verification links, and secure client documents.
  6. `External`: Read-only public showcase access.
- **Enforcement Middleware**:
  - `authenticateToken` (`backend/server.cjs:400-450`): Decodes JWT, attaches `req.user`, sets DB query wrappers.
  - `authorizeRoles(...allowedRoles)` (`backend/server.cjs:372-380`): Returns `403 Access Denied` if `req.user.role` is unauthorized (e.g. `authorizeRoles('Administrator')` on `/api/admin/access-logs`).
  - `checkAdvisorBilling` (`backend/server.cjs:351-370`): Bypasses Admins/Managers, but halts Advisors with `402 Billing Required` if `advisor_billing.billing_status != 'active'`.

---

### 2.4 PostgreSQL Row Level Security (RLS) & Session Variables
The CRM enforces database isolation via PostgreSQL Row Level Security (`backend/supabase_setup.sql:164-184`, `backend/scripts/enable_rls.cjs:16-39`):
1. **Tables Protected by RLS**: `leads`, `bank_verifications`, `plaid_items`, `advisor_billing`, `plaid_usage_logs`.
2. **Session Variable Injection**:
   Every database query executed through `req.dbQuery` sets PostgreSQL transaction-scoped settings:
   ```sql
   SELECT set_config('app.user_id', $1, true), set_config('app.user_role', $2, true);
   ```
   (`backend/server.cjs:417-420`, `442-445`).
3. **Isolation Policies**:
   - `leads_isolation_policy`:
     ```sql
     CREATE POLICY leads_isolation_policy ON leads
     USING (current_setting('app.user_role', true) = 'Administrator' OR assigned_to::text = current_setting('app.user_id', true));
     ```
   - `bv_isolation_policy`:
     ```sql
     CREATE POLICY bv_isolation_policy ON bank_verifications
     USING (current_setting('app.user_role', true) = 'Administrator' OR verified_by::text = current_setting('app.user_id', true));
     ```
   - `advisor_billing_policy`:
     ```sql
     CREATE POLICY advisor_billing_policy ON advisor_billing
     USING (current_setting('app.user_role', true) = 'Administrator' OR user_id::text = current_setting('app.user_id', true));
     ```
4. **Application-Level Filtering**:
   In addition to DB-level RLS, Express routes explicitly filter:
   ```javascript
   if (req.user.role === 'Advisor') {
     query = query.eq('assigned_to', req.user.id);
   }
   ```
   (`backend/server.cjs:757-759`).

---

## 3. Where and How Users and Agents are Stored

### 3.1 Database Tables for Users & Agents

#### 1. Table `users` (`backend/schema.sql:6-27`, `backend/supabase_schema.sql:9-29`)
The authoritative table for all platform users, agents, and administrators.

| Column | Data Type | Constraints & Defaults | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY DEFAULT uuid_generate_v4()` | Unique User identifier. |
| `email` | `VARCHAR(255)` | `UNIQUE NOT NULL` | Login email address. |
| `personal_email` | `VARCHAR(255)` | `NULL` | Secondary personal email. |
| `password_hash` | `VARCHAR(255)` | `NULL` (Nullable for SSO) | SHA-256 password hash. |
| `name` | `VARCHAR(255)` | `NOT NULL` | Full Name. |
| `role` | `VARCHAR(50)` | `NOT NULL CHECK (role IN ('Administrator', 'Manager', 'Sub-Admin', 'Advisor', 'Client'))` | RBAC role. |
| `category` | `VARCHAR(50)` | `DEFAULT 'Insurance & General'` | Department/Vertical category. |
| `title` | `VARCHAR(100)` | `NULL` | Professional title (e.g. Senior Wealth Advisor). |
| `phone` | `VARCHAR(50)` | `NULL` | Contact phone number. |
| `avatar` / `avatar_url` | `TEXT` | `NULL` | Profile image URL / Supabase storage path. |
| `bio` | `TEXT` | `NULL` | Professional biography. |
| `microsite_enabled` | `BOOLEAN` | `DEFAULT FALSE` | Toggles public advisor webpage. |
| `contract_level` | `NUMERIC(5,2)` | `DEFAULT 50.00` | Commission contract split level percentage. |
| `products_sold` | `TEXT[]` / `JSONB` | `DEFAULT '[]'::jsonb` | Array of authorized product types. |
| `license_states` | `TEXT[]` | `NULL` | Array of US state codes (e.g. `['NY', 'FL', 'TX']`). |
| `permissions` | `JSONB` | `DEFAULT '[]'::jsonb` | Granular capability overrides. |
| `onboarding_completed` | `BOOLEAN` | `DEFAULT FALSE` | Status of portal onboarding flow. |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT CURRENT_TIMESTAMP` | Account creation timestamp. |
| `updated_at` | `TIMESTAMPTZ` | `DEFAULT CURRENT_TIMESTAMP` | Last profile update timestamp. |
| `deleted_at` | `TIMESTAMPTZ` | `NULL` | Soft delete tombstone. |

---

#### 2. Table `advisor_extensions` (`backend/schema.sql:442-450`, `backend/migrations/signalwire_schema.sql:4-13`)
Maintains telephony softphone extensions and routing targets for SignalWire.

| Column | Data Type | Constraints & Defaults | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY DEFAULT uuid_generate_v4()` | Extension identifier. |
| `advisor_name` | `VARCHAR(255)` | `NOT NULL` | Advisor Name. |
| `extension` | `VARCHAR(10)` | `UNIQUE NOT NULL` | 3-digit IVR dial code (e.g. `101`, `102`). |
| `phone_number` | `VARCHAR(50)` | `NOT NULL` | Destination E.164 phone number. |
| `department` | `VARCHAR(100)` | `DEFAULT 'Financial Advisory'` | Routing department. |
| `status` | `VARCHAR(20)` | `DEFAULT 'available'` | Availability (`available`, `busy`, `offline`). |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT CURRENT_TIMESTAMP` | Creation timestamp. |
| `updated_at` | `TIMESTAMPTZ` | `DEFAULT CURRENT_TIMESTAMP` | Update timestamp. |

**Seeded Advisor Extensions** (`backend/migrations/signalwire_schema.sql:49-55`, `backend/server.cjs:305-311`):
1. **Marcus Vance**: Extension `101`, Phone `+18885550101`, Department `Senior Wealth Advisory`, Status `available`.
2. **Sarah Jenkins**: Extension `102`, Phone `+18885550102`, Department `Mortgage & Lending`, Status `available`.
3. **David Ross**: Extension `103`, Phone `+18885550103`, Department `Commercial Insurance`, Status `busy`.
4. **Elena Rostova**: Extension `104`, Phone `+18885550104`, Department `Private Wealth`, Status `available`.

---

#### 3. Table `advisor_applications` (`backend/schema.sql:325-339`, `backend/supabase_schema.sql:32-47`)
Manages advisor recruitment applications prior to account provisioning.
- Columns: `id UUID`, `full_name VARCHAR(255)`, `personal_email VARCHAR(255) UNIQUE`, `phone VARCHAR(50)`, `license_info TEXT`, `experience TEXT`, `address TEXT`, `status VARCHAR(50) DEFAULT 'pending_approval'`, `company_email VARCHAR(255)`, `contract_level NUMERIC(5,2)`, `authorized_products JSONB`, `resume_url TEXT`, `created_at`, `updated_at`.

---

### 3.2 Frontend vs Backend Representation

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

// pages/crm/TelephonyHub.tsx (Lines 19-26)
export interface Extension {
  id: string;
  advisor_name: string;
  extension: string;
  phone_number: string;
  department: string;
  status: string;
}
```
- **Mapping in Express** (`backend/server.cjs:1427-1444`): Snake_case PostgreSQL columns (`microsite_enabled`, `products_sold`, `license_states`, `onboarding_completed`) are cleanly transformed to camelCase JSON properties (`micrositeEnabled`, `productsSold`, `licenseStates`, `onboardingCompleted`) when served to the frontend.

---

## 4. Where and How Leads and Contacts are Stored

### 4.1 Database Tables for Leads & Contacts

#### 1. Table `leads` (`backend/schema.sql:38-72`, `backend/supabase_schema.sql:58-83`)
The unified intake table storing prospect records across all company business lines.

| Column | Data Type | Constraints & Defaults | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY DEFAULT uuid_generate_v4()` | Unique Lead identifier. |
| `name` | `VARCHAR(255)` | `NOT NULL` | Lead Full Name. |
| `email` | `VARCHAR(255)` | `NULL` | Lead Email address. |
| `phone` | `VARCHAR(50)` | `NULL` | Lead Phone number. |
| `interest` | `VARCHAR(100)` | `NULL` | Primary product interest (`Life Insurance`, `Mortgage`, etc.). |
| `status` | `VARCHAR(50)` | `DEFAULT 'New'` | Status (`New`, `Contacted`, `Proposal`, `Approved`, `Closed`, `Lost`, `received`, `Qualified`, `Disqualified`). |
| `score` | `INT` | `DEFAULT 50` | Computed qualification score (0-100). |
| `qualification` | `VARCHAR(20)` | `CHECK (qualification IN ('Hot', 'Warm', 'Cold'))` | Score-derived intent tier. |
| `source` | `VARCHAR(100)` | `NULL` | Acquisition channel (`Meta Ads`, `Google Ads`, `TV Ads`, `Web Form`, `Referral`). |
| `assigned_to` | `UUID` | `REFERENCES users(id)` | Assigned Advisor foreign key. |
| `message` | `TEXT` | `NULL` | Inbound inquiry message. |
| `notes` | `TEXT` | `NULL` | Advisor internal notes. |
| `priority` | `VARCHAR(20)` | `DEFAULT 'Low'` | Priority ranking (`High`, `Medium`, `Low`). |
| `life_details` | `JSONB` | `NULL` | Life Insurance: DOB, SSN, health history, coverage target, net worth. |
| `real_estate_details` | `JSONB` | `NULL` | Real Estate: Intent, timeline, budget, property type. |
| `securities_details` | `JSONB` | `NULL` | Securities: Service type, investable assets ($1M+), risk tolerance. |
| `logistics_details` | `JSONB` | `DEFAULT '{}'::jsonb` | Freight: MC/DOT number, fleet size, equipment type, fuel volume. |
| `home_repair_details` | `JSONB` | `DEFAULT '{}'::jsonb` | Property repair: Address, emergency flag, issue description. |
| `custom_details` | `JSONB` | `NULL` | General metadata: Annual income, asset volume, credit score, channel. |
| `campaign_id` | `VARCHAR(255)` | `NULL` | Ad campaign tracking ID. |
| `ad_group_id` | `VARCHAR(255)` | `NULL` | Ad set/group tracking ID. |
| `ad_id` | `VARCHAR(255)` | `NULL` | Specific creative ad ID. |
| `platform_data` | `JSONB` | `NULL` | Raw JSON webhook payload for audit and debugging. |
| `visitor_id` | `VARCHAR(100)` | `NULL` | Linked cookie visitor ID from analytics tracking. |
| `is_archived` | `BOOLEAN` | `DEFAULT FALSE` | Archival status flag. |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT CURRENT_TIMESTAMP` | Ingestion timestamp. |
| `updated_at` | `TIMESTAMPTZ` | `DEFAULT CURRENT_TIMESTAMP` | Last modification timestamp. |

---

#### 2. Table `clients` (`backend/schema.sql:74-93`, `backend/supabase_schema.sql:86-100`)
Stores converted active accounts and policies.
- Columns: `id UUID PRIMARY KEY`, `advisor_id UUID REFERENCES users(id)`, `user_id UUID REFERENCES users(id)`, `name VARCHAR(255) NOT NULL`, `email VARCHAR(255)`, `phone VARCHAR(50)`, `product VARCHAR(100)`, `policy_number VARCHAR(100)`, `carrier VARCHAR(100)`, `premium NUMERIC(12,2)`, `renewal_date DATE`, `commission_amount NUMERIC(12,2)`, `address JSONB`, `created_at TIMESTAMPTZ`, `updated_at TIMESTAMPTZ`.

---

#### 3. Table `interaction_history` (`backend/supabase_schema.sql:388-397`)
Audit trail for client/lead engagement touchpoints.
- Columns: `id UUID PRIMARY KEY`, `lead_id UUID REFERENCES leads(id) ON DELETE CASCADE`, `client_id UUID REFERENCES clients(id) ON DELETE CASCADE`, `author_id UUID REFERENCES users(id) ON DELETE SET NULL`, `type VARCHAR(50) CHECK (type IN ('Call', 'Email', 'Meeting', 'Note', 'SMS', 'Status Change'))`, `content TEXT`, `metadata JSONB`, `created_at TIMESTAMPTZ`.

---

#### 4. Table `telephony_calls` (`backend/schema.sql:452-469`, `backend/migrations/signalwire_schema.sql:16-33`)
Authoritative record for all softphone and AI qualification calls.
- Columns: `id UUID PRIMARY KEY`, `call_sid VARCHAR(255) UNIQUE NOT NULL`, `direction VARCHAR(20) NOT NULL` (`inbound`, `outbound`, `ai_qualification`), `from_number VARCHAR(50) NOT NULL`, `to_number VARCHAR(50) NOT NULL`, `lead_name VARCHAR(255)`, `lead_id VARCHAR(255)`, `advisor_extension VARCHAR(10)`, `status VARCHAR(50) NOT NULL DEFAULT 'initiated'` (`initiated`, `connecting`, `ringing`, `in-progress`, `completed`, `failed`, `canceled`), `duration_seconds INT DEFAULT 0`, `recording_url TEXT`, `transcript TEXT`, `ai_rating VARCHAR(20)` (`Warm`, `Mild`, `Cold`), `ai_qualification_summary TEXT`, `created_at TIMESTAMPTZ`, `updated_at TIMESTAMPTZ`.

---

### 4.2 Lead Scoring & Qualification Logic
Implemented in `backend/server.cjs:792-838` (`calculateLeadScore`):
- **Base Score**: `50` points.
- **Interest Weighting**:
  - High-Value Products (`Real Estate`, `Securities`, `Business Insurance`, `Group Benefits`): `+20` points.
  - Life Insurance: `+10` points.
- **Data Quality & Engagement**:
  - Valid non-example email: `+10` points.
  - Valid phone: `+5` points.
  - Detailed message (>50 chars): `+15` points (otherwise `+5`).
- **Source Weighting**:
  - Referral: `+15` points.
  - Digital Ads: `+5` points.
- **Vertical-Specific Criteria**:
  - Real Estate: Budget `$500k+` / `$1M+` (`+15`), Timeline `ASAP` (`+15`), Intent `Buy`/`Invest` (`+10`).
  - Securities: Investable assets `$1M+` (`+30`) or `$500k+` (`+15`), Risk `High` (`+5`).
- **Qualification Tiers** (`backend/server.cjs:861`):
  - Score $\ge 80$: **Hot**
  - Score $60 - 79$: **Warm**
  - Score $< 60$: **Cold**

---

### 4.3 Lead Matching & Routing Architecture for Telephony

```
 Inbound Call to SignalWire Number (+18885550199)
                    │
                    ▼
 SignalWire LAML/SWML Webhook: POST /api/signalwire/ivr
                    │
                    ▼
 Extract Caller ANI: req.body.From (e.g. "+13125550188")
                    │
                    ▼
 Database Lookup: Match against leads.phone & clients.phone
                    │
       ┌────────────┴────────────┐
       ▼                         ▼
 [Match Found in DB]     [No Match / New Caller]
       │                         │
 ┌─────┴────────────────┐        │
 │ Assigned to Advisor? │        │
 └─────┬────────────────┘        │
       ├──────────────┐          │
      YES             NO         │
       ▼              ▼          ▼
 Route to Advisor   Prompt IVR / Transfer to General Queue
 Extension (101)    or AI Qualification Agent
 (Dial Ext 101)     (POST /api/signalwire/ai-call)
```

#### Detailed Matching Mechanisms
1. **ANI / Caller ID Matching**:
   - For inbound calls received at `/api/signalwire/ivr` or `/api/signalwire/ivr-route`:
     - Extract normalized caller number (`From`).
     - Query `leads` table:
       ```sql
       SELECT id, name, interest, assigned_to, status 
       FROM leads 
       WHERE regexp_replace(phone, '[^0-9]', '', 'g') = regexp_replace($1, '[^0-9]', '', 'g')
       ORDER BY updated_at DESC LIMIT 1;
       ```
     - If matched, the caller's identity (`lead_name`, `lead_id`) is attached to `telephony_calls`.
2. **Direct Advisor Extension Bridging**:
   - If the matched lead has `assigned_to = <user_id>`, look up the advisor's extension in `advisor_extensions`:
     ```sql
     SELECT extension, phone_number FROM advisor_extensions WHERE advisor_name = (SELECT name FROM users WHERE id = $1);
     ```
   - Return SignalWire LAML response dynamically forwarding the call directly to that advisor's phone or WebRTC client:
     ```xml
     <Response>
       <Say>Connecting you directly to your dedicated advisor, Marcus Vance.</Say>
       <Dial record="record-from-answer-dual">+18885550101</Dial>
     </Response>
     ```
3. **Outbound Call Correlation**:
   - Softphone outbound calls initiated via `POST /api/signalwire/call` pass `leadId`, `leadName`, and `extension`.
   - The backend records the active session in `telephony_calls` with `lead_id` and `call_sid`, and simultaneously appends a record to `interaction_history` (`type: 'Call'`).
4. **AI Qualification Dialog & Automatic CRM Updates**:
   - When `/api/signalwire/ai-call` finishes:
     - SignalWire returns call transcript and AI intent score.
     - Backend updates `telephony_calls.ai_rating` (`Warm` / `Mild` / `Cold`) and `telephony_calls.ai_qualification_summary`.
     - Automatically updates `leads.qualification` and emits real-time WebSocket event (`LEAD_QUALIFIED` / `NEW_LEAD`) to update advisor dashboards without page reloads.

---

## 5. File Citations & Reference Map

| Component | File Path | Line Range | Subject Matter |
|---|---|---|---|
| Database Schema | `backend/schema.sql` | 1-486 | Full PostgreSQL table definitions, constraints, indexes. |
| Supabase Master Schema | `backend/supabase_schema.sql` | 1-539 | Master production schema with marketing, logistics, chat, Plaid tables. |
| Supabase Core Setup & RLS | `backend/supabase_setup.sql` | 1-198 | Core tables, `refresh_tokens`, RLS policies, trigger procedures. |
| SignalWire Telephony Schema | `backend/migrations/signalwire_schema.sql` | 1-56 | `advisor_extensions`, `telephony_calls`, `telephony_sms` schema & seeds. |
| Marketing Migrations | `backend/migrations/marketing_schema.sql` | 1-67 | `marketing_audiences`, `marketing_campaigns`, `payment_transactions`. |
| Multi-Vertical Solutions Migration | `backend/migrations/20260504_update_solutions.sql` | 1-62 | Vertical column enhancements, logistics load board, storage buckets. |
| Master Sync Script | `backend/migrations/supabase_master_sync.sql` | 1-128 | Properties, logistics, storage buckets, performance views. |
| Chat & Underwriting Schema | `backend/chat_schema.sql` | 1-66 | `chat_channels`, `chat_messages`, `case_notes`, `chat_read_receipts`. |
| Database Dictionary | `backend/nhfg_database_dictionary.csv` | 1-66 | Core data dictionary mapping column types and constraints. |
| Backend Server & Pool Config | `backend/server.cjs` | 139-205 | `pg.Pool` configuration, Cloud SQL sockets, Supabase pooler auto-heal. |
| Schema Auto-Healing (`initDB`) | `backend/server.cjs` | 208-319 | Table verification and default extension seeding on startup. |
| JWT Helpers & RBAC Middleware | `backend/server.cjs` | 382-450 | `authenticateToken`, `authorizeRoles`, RLS session variable setters. |
| Leads Management API | `backend/server.cjs` | 749-932 | `GET /api/leads`, `POST /api/leads`, `calculateLeadScore` algorithm. |
| Public Lead Ingestion & Callbacks | `backend/server.cjs` | 934-1008 | `POST /api/leads/public`, `POST /api/callbacks`. |
| Authentication Endpoints | `backend/server.cjs` | 1145-1415 | Login, register, refresh, logout, password reset, me. |
| Users Management API | `backend/server.cjs` | 1418-1530 | `GET /api/users`, `POST /api/users`, `DELETE /api/users/:id`. |
| Interaction History API | `backend/server.cjs` | 1618-1650 | `GET /api/interactions`, `POST /api/interactions`. |
| Clients & Tasks API | `backend/server.cjs` | 4977-5055 | `GET /api/clients`, `GET /api/tasks`, CRUD handlers. |
| Supabase JS SDK Config | `backend/supabaseClient.cjs` | 1-16 | Supabase client setup with URL and service/anon keys. |
| Backend Service Supabase Helper | `backend/supabase.cjs` | 1-24 | Service role client for server tasks bypassing RLS. |
| SignalWire Telephony Router | `backend/routes/signalwire.cjs` | 1-452 | Softphone dialer, IVR webhooks, AI qualification calls, SMS threads. |
| Campaign Ingestion Router | `backend/routes/webhooks.cjs` | 1-315 | Meta, Google, TikTok, and unified `/campaigns` ad webhooks. |
| Lead Routing Engine | `backend/services/routingEngine.cjs` | 1-107 | Round-robin advisor assignment by lead vertical specialization. |
| Automation Engine | `backend/services/automationEngine.cjs` | 1-110 | Event-driven trigger engine for emails, SMS, push alerts. |
| Frontend Type Definitions | `types.ts` | 1-965 | TypeScript interfaces (`User`, `Lead`, `Client`, `Interaction`, `Task`). |
| Telephony Hub Frontend | `pages/crm/TelephonyHub.tsx` | 1-760 | React softphone dialer, call log viewer, SMS interface, AI qualifier. |

---

## 6. Telephony Integration Readiness Assessment

| Requirement | Current State | Findings & Architectural Recommendations |
|---|---|---|
| **Database Call Logs** | Implemented | Tables `telephony_calls` and `telephony_sms` exist in `schema.sql`, `migrations/signalwire_schema.sql`, and `server.cjs`. Ready for full softphone session capture. |
| **Advisor Extensions** | Implemented | `advisor_extensions` table pre-seeded with 4 corporate extensions (101-104). Ready for IVR mapping. |
| **SignalWire Credentials** | Configured | Active credentials configured in `backend/.env` (`SIGNALWIRE_PROJECT_ID`, `SIGNALWIRE_API_TOKEN`, `SIGNALWIRE_SPACE_URL`, `SIGNALWIRE_PHONE_NUMBER`). |
| **Lead Matching** | Ready | ANI matching can query `leads(phone)` and `clients(phone)` using index-backed sanitized lookups. |
| **Interaction History** | Ready | Telephony call events cleanly map to `interaction_history` (`type: 'Call'`). |
| **Zero-Downtime Fallback** | Implemented | Backend maintains in-memory stores (`memoryCallsStore`, `memoryExtensionsStore`, `memorySMSStore`) to ensure high availability during DB failover. |

---
*Report compiled autonomously by Explorer Subagent (`explorer_m1_data`). Strict Read-Only Policy verified: 0 CRM source files modified.*
