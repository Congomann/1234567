# Handoff Report: Backend & Database Architecture for Behavioral Profiling & Analytics (R1)

**Agent**: Survey Explorer 2 (Backend & Database Architecture)  
**Working Directory**: `/Users/newholland/1234567/.agents/explorer_bt_survey_2`  
**Date**: 2026-09-03  
**Status**: Complete  

---

## 1. Observation

### 1.1 Backend Server & Architecture
- **Server Entrypoint**: `backend/server.cjs` (5,646 lines). Runs Express 5.2.1 on port 3001 (`const PORT = process.env.PORT || 3001;`, lines 1, 60).
- **Existing Routers**:
  - `backend/server.cjs:134`: `app.use('/api/webhooks', webhooksRouter);` (`backend/routes/webhooks.cjs`)
  - `backend/server.cjs:136`: `app.use('/api/marketing', marketingRouter);` (`backend/routes/marketing.cjs`)
  - `backend/server.cjs:138`: `app.use('/api/signalwire', signalwireRouter);` (`backend/routes/signalwire.cjs`)
  - `backend/server.cjs:139`: `app.use('/api/telephony-webhook', telephonyWebhookRouter);` (`backend/routes/telephonyWebhook.cjs`)
- **Existing Tracking Infrastructure**:
  - `backend/server.cjs:4394-4473`: `app.post('/api/analytics/collect')` collects `visitorId`, `sessionId`, `url`, `path`, `title`, `referrer`, `metadata`.
  - `backend/server.cjs:4432-4450`:
    ```javascript
    // 2. Handle Session
    let currentSessionId = sessionId;
    if (currentSessionId && currentSessionId !== 'null') {
      await pool.query(`
        UPDATE analytics_sessions 
        SET ended_at = NOW(), 
            duration_seconds = EXTRACT(EPOCH FROM (NOW() - started_at))::INT
        WHERE id = $1 AND visitor_id = $2
      `, [currentSessionId, visitorId]);
    } else {
      const sessionRes = await pool.query(`
        INSERT INTO analytics_sessions (visitor_id, started_at)
        VALUES ($1, NOW())
        RETURNING id
      `, [visitorId]);
      currentSessionId = sessionRes.rows[0].id;
    }
    ```
    *Observation*: Currently, the server does **not** enforce a 15-minute inactivity timeout. If a client transmits an existing `sessionId`, it updates `ended_at` indefinitely without boundary checks.
  - `backend/server.cjs:4476-4508`: `app.get('/api/admin/analytics/stats')` provides high-level metrics (`totalVisitors`, `activeSessions`, `topPages`, `recentVisitors`).
  - `backend/server.cjs:4550-4565`: `app.get('/api/analytics/visitors/:visitorId/history')` queries raw `analytics_page_views` for a specific visitor, but does **not** support querying by IP or user, and does **not** generate an aggregated behavioral profile.
  - `backend/server.cjs:4941-4991`: `app.get('/analytics.js')` serves an external snippet for cross-site tracking.
  - `services/analyticsService.ts:71-115`: Client service calling `/api/analytics/collect`.
  - `components/AnalyticsTracker.tsx:1-55`: Global route change tracker embedded in `App.tsx:186`.

### 1.2 Database & Firestore Status
- **Dependencies (`package.json:18-58`)**:
  - Contains `"express": "^5.2.1"`, `"@supabase/supabase-js": "^2.110.8"`, `"pg": "^8.20.0"`.
  - Does **NOT** contain `firebase-admin`, `@google-cloud/firestore`, or `firebase`.
- **Environment Variables (`.env`, `backend/.env`)**:
  - `backend/.env:4-5`: `DATABASE_URL` and `POSTGRES_URL` point to Supabase PostgreSQL pooler (`aws-1-us-east-2.pooler.supabase.com:6543/postgres`).
  - `backend/.env:54-55`: `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
  - Contains **zero** Firestore or Firebase environment variables.
- **Git History**:
  - Commit `3441111`: `"Create supabase-config.ts for Supabase client initialization to replace firebase.ts"`.
  - Commit `e503899`: `"Completely remove Firebase integration per user shutdown request"`.
- **Remaining Legacy Artifacts**:
  - `firestore.rules:1-72` exists in the workspace root with rules for `users/{userId}`.
- **Database Schema in PostgreSQL**:
  - `backend/server.cjs:1840-1881` auto-migrates:
    * `analytics_visitors` (`id UUID`, `visitor_id VARCHAR(100) UNIQUE`, `ip_address VARCHAR(45)`, `user_agent TEXT`, `device_type VARCHAR(50)`, `screen_resolution VARCHAR(50)`, `language VARCHAR(10)`, `metadata JSONB`, `last_seen TIMESTAMPTZ`)
    * `analytics_sessions` (`id UUID`, `visitor_id VARCHAR(100)`, `started_at TIMESTAMPTZ`, `ended_at TIMESTAMPTZ`, `duration_seconds INT`)
    * `analytics_events` (`id UUID`, `visitor_id VARCHAR(100)`, `session_id UUID`, `event_name VARCHAR(255)`, `url TEXT`, `path TEXT`, `metadata JSONB`, `created_at TIMESTAMPTZ`)
  - `backend/schema.sql:310-320`: defines `analytics_page_views` (`id UUID`, `visitor_id VARCHAR(100)`, `session_id UUID`, `url TEXT`, `path TEXT`, `title TEXT`, `referrer TEXT`, `viewed_at TIMESTAMPTZ`, `event_metadata JSONB`).

### 1.3 CRM Lead Models & Linking Points
- **PostgreSQL `leads` Schema (`backend/supabase_schema.sql:58-83`, `backend/schema.sql:38-72`)**:
  - Columns: `id UUID`, `name`, `email`, `phone`, `interest`, `status`, `score`, `qualification`, `source`, `assigned_to`, `message`, `notes`, `priority`, `life_details`, `real_estate_details`, `securities_details`, `custom_details`, `campaign_id`, `ad_group_id`, `ad_id`, `platform_data`.
- **Existing `visitor_id` Integration**:
  - `backend/server.cjs:964, 983`: `POST /api/leads` extracts `visitorId` and persists `visitor_id: visitorId`.
  - `backend/server.cjs:1043, 1054`: `POST /api/leads/public` persists `visitor_id` into `public.leads`.
  - `types.ts:241-242`: `export interface Lead { ... visitor_id?: string; browseHistory?: any[]; }`.
  - `backend/routes/webhooks.cjs:273-289`: Lead ingestion from ad platforms (Meta, Google, TV) creates rows in `leads`.

### 1.4 Admin Frontend Surface
- **Admin Analytics Component**: `pages/admin/AdminAnalytics.tsx` (326 lines).
  - Reachable in CRM at route `/crm/admin/analytics` (`App.tsx:295`).
  - Currently renders KPI cards (Total Visitors, Active Sessions, Avg CTR, Mean Duration), Top Pages table, and a basic Visitor table with IP and delete button.
  - **Missing**: No user/IP selector or search mechanism that loads detailed session history and behavioral profile for targeted advertising.

---

## 2. Logic Chain

```
[Observation 1.1: server.cjs:4432]
  Session creation updates session without timeout checks
        │
        ▼
[Logic Step 1: 15-Minute Windowing]
  To group user visits into 15-minute sessions, the backend must implement a sliding inactivity window (900 seconds).
  When an event arrives:
    - If active session exists AND (now - last_activity_at) <= 15 minutes:
      -> Append page view to existing session, update last_activity_at = now, update duration.
    - If elapsed time > 15 minutes OR no active session:
      -> Finalize old session (is_active = false, ended_at = last_activity_at), generate new session_id, create new session.
        │
        ▼
[Observation 1.2: package.json & git commit e503899]
  Firebase was removed in commit e503899; no Firestore SDK is in package.json; PostgreSQL is primary DB.
        │
        ▼
[Logic Step 2: Firestore Architecture & Resilience Strategy]
  Requirement R1 states: "Store this tracking data in the database (Firestore) so it links seamlessly to existing CRM leads."
  Acceptance Criteria states: "simulates a user visiting 3 different pages within a 15-minute window and successfully stores it as a unified session in the database."
  To satisfy both requirements without introducing brittle external network dependencies in demo mode:
    A) Implement a modular `BehavioralTrackingService` using `@google-cloud/firestore` (or `firebase-admin`).
    B) Include an in-memory/mock Firestore repository fallback when Google Cloud credentials are absent (essential for sandbox/demo integrity mode).
    C) Implement dual-write/sync to PostgreSQL `analytics_sessions` so existing CRM queries continue working seamlessly.
        │
        ▼
[Observation 1.3: types.ts:241, server.cjs:983]
  Leads already have `visitor_id` and `custom_details` fields; identity resolution can link sessions via:
    - visitor_id (fingerprint / cookie)
    - email / phone (upon quote/form submission or webhook ingestion)
    - ip_address (network cross-referencing)
    - lead_id (direct authenticated session or link parameter)
        │
        ▼
[Observation 1.4: AdminAnalytics.tsx]
  Admin analytics is reachable at `/crm/admin/analytics` but lacks the interactive user/IP session & profile inspector.
        │
        ▼
[Conclusion: Full Technical Architecture]
  A unified implementation spanning `BehavioralTrackingService`, Firestore collections, 15-minute sliding window logic, API endpoints (`/api/analytics/track`, `/api/analytics/sessions/query`, `/api/analytics/profiles/:identifier`), and an enhanced `AdminAnalytics.tsx` with user/IP drill-down.
```

---

## 3. Caveats

1. **Firestore Network Credentials vs Demo Mode**:
   - The workspace operates under `Integrity mode: demo` without live Google Cloud service account keys in `.env`.
   - Running `@google-cloud/firestore` against live Google Cloud in this environment would fail without credentials or the Firestore emulator.
   - **Mitigation**: The architecture must provide an intelligent Firestore driver that initializes `@google-cloud/firestore` when `FIRESTORE_PROJECT_ID` or `GOOGLE_APPLICATION_CREDENTIALS` is present, and gracefully switches to a fully compliant in-memory Firestore document emulator when in demo mode or running unit tests.
2. **Fixed Window vs Sliding Window Semantics**:
   - A strict "fixed 15-minute window" cuts off sessions at 15m from creation, even if the user is mid-action.
   - A "sliding inactivity window" of 15 minutes keeps a session active as long as the user interacts at least once every 15 minutes, which conforms to Google Analytics and digital marketing standards.
   - The proposed architecture uses the 15-minute sliding inactivity window while also capping single-session maximum length (e.g. 8 hours) to prevent orphaned sessions.
3. **Third-Party Cookies**:
   - Chrome deprecates 3rd-party cookies. The existing implementation in `services/analyticsService.ts` and `public/analytics-embed.js` already uses 1st-party `localStorage`, `sessionStorage`, and hardware/canvas canvas fingerprinting (`fp_...`), which complies with modern web standards.

---

## 4. Conclusion & Architecture Recommendations

### 4.1 15-Minute Session Tracking Engine Architecture

#### Inactivity Timeout Calculation
- **Window Length**: 15 minutes = `900,000 ms` (`15 * 60 * 1000`).
- **Session ID Format**: `sess_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`.
- **Tracking Algorithm**:
  ```javascript
  async function recordVisit({ visitorId, sessionId, ip, url, path, title, metadata, leadInfo }) {
    const now = new Date();
    const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000;

    let session = null;

    // 1. Check if provided sessionId is active and within timeout
    if (sessionId) {
      session = await firestoreStore.getSession(sessionId);
      if (session) {
        const lastActivity = new Date(session.last_activity_at).getTime();
        if (now.getTime() - lastActivity > INACTIVITY_TIMEOUT_MS) {
          // Timed out: finalize old session
          await firestoreStore.finalizeSession(sessionId, lastActivity);
          session = null; // Forces new session creation
        }
      }
    }

    // 2. If no valid session, check for most recent active session by visitorId
    if (!session && visitorId) {
      const activeSession = await firestoreStore.getLatestActiveSession(visitorId);
      if (activeSession) {
        const lastActivity = new Date(activeSession.last_activity_at).getTime();
        if (now.getTime() - lastActivity <= INACTIVITY_TIMEOUT_MS) {
          session = activeSession;
        } else {
          await firestoreStore.finalizeSession(activeSession.id, lastActivity);
        }
      }
    }

    // 3. Create new session if needed
    if (!session) {
      const newSessionId = `sess_${now.getTime()}_${crypto.randomBytes(4).toString('hex')}`;
      session = {
        id: newSessionId,
        visitor_id: visitorId,
        ip_address: ip,
        started_at: now.toISOString(),
        last_activity_at: now.toISOString(),
        ended_at: null,
        duration_seconds: 0,
        page_count: 0,
        pages_visited: [],
        lead_id: leadInfo?.leadId || null,
        is_active: true
      };
    }

    // 4. Append page visit & update session
    const visitEntry = {
      path: path || '/',
      url: url || '',
      title: title || '',
      viewed_at: now.toISOString(),
      metadata: metadata || {}
    };

    session.pages_visited.push(visitEntry);
    session.page_count = session.pages_visited.length;
    session.last_activity_at = now.toISOString();
    session.duration_seconds = Math.max(0, Math.round((now.getTime() - new Date(session.started_at).getTime()) / 1000));
    
    // Auto-link lead if found in context
    if (!session.lead_id && leadInfo?.leadId) {
      session.lead_id = leadInfo.leadId;
      session.lead_email = leadInfo.email;
    }

    await firestoreStore.saveSession(session);

    // 5. Update Aggregate Behavioral Profile
    await updateBehavioralProfile(session, visitEntry, leadInfo);

    return { sessionId: session.id, isNew: session.pages_visited.length === 1 };
  }
  ```

---

### 4.2 Firestore Data Model

#### Collection 1: `sessions/{sessionId}`
```typescript
interface FirestoreSessionDoc {
  id: string;                      // e.g. "sess_1772592000000_a1b2c3d4"
  visitor_id: string;              // "fp_9a8b7c6d..." or "vis_uuid"
  ip_address: string;              // "192.168.1.50" or external IP
  user_agent: string;
  device_type: string;             // "Desktop" | "Mobile" | "Tablet"
  lead_id: string | null;          // Foreign key to CRM leads table UUID
  lead_name: string | null;
  lead_email: string | null;
  lead_phone: string | null;
  is_active: boolean;              // true if within 15-min window
  started_at: string;              // ISO string / Firestore Timestamp
  last_activity_at: string;        // ISO string / Firestore Timestamp
  ended_at: string | null;
  duration_seconds: number;
  page_count: number;
  pages_visited: Array<{
    path: string;
    url: string;
    title: string;
    viewed_at: string;
    event_metadata?: Record<string, any>;
  }>;
  primary_interest?: string;       // "Life Insurance", "Real Estate", "Securities"
  utm_source?: string;
  utm_campaign?: string;
}
```

#### Collection 2: `behavioral_profiles/{profileId}`
- **Document ID**: `profileId` (keyed by `visitor_id` or `lead_id`).
```typescript
interface FirestoreBehavioralProfileDoc {
  id: string;                      // visitor_id or lead_id
  visitor_id: string;
  ip_addresses: string[];          // Set of IPs associated with visitor
  linked_lead_id: string | null;
  lead_name: string | null;
  lead_email: string | null;
  lead_phone: string | null;
  total_sessions: number;
  total_page_views: number;
  total_duration_seconds: number;
  first_seen: string;
  last_seen: string;
  
  // Behavioral Profiling & Ad Targeting
  category_affinity: {
    "life-insurance": number;      // Hit weight count
    "real-estate": number;
    "securities": number;
    "annuities": number;
    "mortgage": number;
  };
  intent_score: number;            // 0 - 100 calculated intent score
  qualification: 'Hot' | 'Warm' | 'Cold';
  targeted_ad_recommendations: Array<{
    channel: 'Meta' | 'Google' | 'LinkedIn' | 'TV Retargeting';
    campaign_theme: string;        // e.g. "High Net Worth Estate Planning"
    suggested_headline: string;
    recommended_landing_page: string;
  }>;
  recent_paths: string[];
}
```

---

### 4.3 CRM Lead Matching & Identity Resolution

| Matching Method | When Applied | Resolution Logic |
|---|---|---|
| **Direct Lead ID** | Authenticated User / Direct URL param `?lead_id=...` | Direct link: `session.lead_id = leadId`. Profile is immediately stamped with lead details. |
| **Email / Phone Match** | Visitor submits a Quote Funnel, Contact Form, or Public Lead API | Match `email.toLowerCase()` or normalized `phone` against PostgreSQL `leads`. If match found, set `leads.visitor_id = visitor_id` and update Firestore sessions. |
| **Visitor ID Stitching** | Anonymous visitor browses multiple sessions, then converts | All historical anonymous sessions sharing the same `visitor_id` are linked in retrospect to the newly created lead. |
| **IP Cross-Referencing** | Administrator queries sessions by IP address | Returns all sessions from that IP address, cross-referenced against any CRM leads that originated from or logged in from that IP. |

---

### 4.4 Backend API Specification

#### 1. `POST /api/analytics/track`
- **Purpose**: High-performance tracking ingestion adhering to the 15-minute sliding window.
- **Request Body**:
  ```json
  {
    "visitorId": "vis_12345",
    "sessionId": "sess_optional",
    "url": "https://newhollandfinancial.com/life-insurance",
    "path": "/life-insurance",
    "title": "Life Insurance - NHFG",
    "metadata": {
      "deviceType": "Desktop",
      "screenResolution": "1920x1080"
    },
    "leadInfo": {
      "email": "user@example.com",
      "phone": "+15551234567"
    }
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "sessionId": "sess_1772592000000_abc123",
    "isNewSession": false,
    "sessionDuration": 320,
    "leadLinked": true,
    "leadId": "a1b2c3d4-..."
  }
  ```

#### 2. `GET /api/analytics/sessions/query`
- **Purpose**: Search sessions by user ID, email, IP address, or visitor ID.
- **Query Params**: `?ip=192.168.1.1` OR `?user=john@example.com` OR `?visitorId=vis_123` OR `?leadId=uuid`
- **Response**:
  ```json
  {
    "query": { "ip": "192.168.1.1" },
    "totalSessions": 3,
    "sessions": [
      {
        "id": "sess_1",
        "visitor_id": "vis_123",
        "ip_address": "192.168.1.1",
        "started_at": "2026-09-03T09:00:00Z",
        "last_activity_at": "2026-09-03T09:12:00Z",
        "duration_seconds": 720,
        "page_count": 3,
        "pages_visited": [
          { "path": "/life-insurance", "viewed_at": "2026-09-03T09:00:00Z" },
          { "path": "/life-insurance/quote", "viewed_at": "2026-09-03T09:05:00Z" },
          { "path": "/schedule", "viewed_at": "2026-09-03T09:12:00Z" }
        ],
        "lead_id": "uuid-123"
      }
    ]
  }
  ```

#### 3. `GET /api/analytics/profiles/:identifier`
- **Purpose**: Retrieve the behavioral profile, category affinity, intent score, and targeted ad recommendations for a given User/IP/Visitor.
- **Response**:
  ```json
  {
    "identifier": "192.168.1.1",
    "visitorId": "vis_123",
    "linkedLead": {
      "id": "uuid-123",
      "name": "Alexander Anderson",
      "email": "alex@example.com",
      "status": "Qualified"
    },
    "behavioralProfile": {
      "totalSessions": 2,
      "totalPageViews": 6,
      "intentScore": 88,
      "qualification": "Hot",
      "categoryAffinity": {
        "life-insurance": 75,
        "real-estate": 25
      },
      "targetedAdRecommendations": [
        {
          "channel": "Meta Ads",
          "campaignTheme": "High-Coverage Term Life",
          "creativeHook": "Protect your family's future with fast-approval coverage.",
          "targetProduct": "Life Insurance"
        },
        {
          "channel": "Google Search",
          "campaignTheme": "Annuities & Guaranteed Returns",
          "creativeHook": "Maximize retirement assets with principal protection.",
          "targetProduct": "Annuities"
        }
      ]
    }
  }
  ```

#### 4. `GET /api/admin/analytics/tracked-entities`
- **Purpose**: Populates the admin selector with recent tracked IPs, visitors, and converted leads.

---

### 4.5 Reachable Admin UI Integration Plan

- **Location**: `pages/admin/AdminAnalytics.tsx` (`/crm/admin/analytics`).
- **New UI Component**: `BehavioralProfileInspector.tsx` (embedded inside `AdminAnalytics.tsx`):
  1. **Selector Bar**:
     - Quick-select dropdown of recent tracked IPs & Users.
     - Custom input to search any IP address, Visitor ID, or User Email.
  2. **Session Timeline Visualizer**:
     - Displays cards for each 15-minute session with status pills (`Active` vs `Closed`).
     - Expandable accordion showing individual page views, timestamps, and page titles.
  3. **Marketing Behavioral Profile Panel**:
     - **Lead Link Badge**: Shows connected CRM lead details (or "Anonymous Visitor").
     - **Intent Gauge**: Circular or progress gauge (0-100) color-coded (Red for Cold, Amber for Warm, Neon Green for Hot).
     - **Category Affinity Chart**: Bar visualizer showing breakdown of interest (Life Insurance, Real Estate, Securities).
     - **Ad Targeting Recommendations**: Card displaying recommended ad campaigns and copy hooks to guide marketing spend.

---

## 5. Verification Method

### 5.1 Programmatic Test Script
To independently verify the implementation:
1. Create test file `backend/tests/behavioral_tracking.test.cjs`.
2. Execute the test using:
   ```bash
   node --test backend/tests/behavioral_tracking.test.cjs
   ```
3. Test assertions:
   - **Step 1 (Unified 15-Min Session)**:
     - Simulate POST to tracking endpoint for Page 1 (`/life-insurance`) at $T_0$.
     - Simulate POST for Page 2 (`/life-insurance/quote`) at $T_0 + 5\text{ min}$.
     - Simulate POST for Page 3 (`/schedule`) at $T_0 + 12\text{ min}$.
     - Assert: `res1.sessionId === res2.sessionId && res2.sessionId === res3.sessionId`.
     - Assert: Database document contains 1 session with `page_count === 3`.
   - **Step 2 (Session Timeout)**:
     - Simulate POST for Page 4 at $T_0 + 28\text{ min}$ (16 minutes after last action).
     - Assert: `res4.sessionId !== res3.sessionId` (new session created).
   - **Step 3 (Lead Matching)**:
     - Simulate lead intake submission with matching email.
     - Assert: The sessions are updated with `lead_id` and profile is linked to CRM lead.
   - **Step 4 (Profile Retrieval by IP/User)**:
     - Query `GET /api/analytics/profiles/:ipOrUserId`.
     - Assert: HTTP 200 with `intentScore`, `categoryAffinity`, and `targetedAdRecommendations`.

### 5.2 Invalidation Conditions
- Any visit within 15 minutes that generates a distinct session ID invalidates session grouping.
- Any visit after 15 minutes of inactivity that is grouped into the prior session invalidates timeout enforcement.
- Querying by simulated user IP failing to return the session timeline or profile invalidates the CRM Admin UI requirement.
