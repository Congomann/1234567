# CRM Frontend & Real-Time / WebRTC Technical Audit Report

- **Date**: 2026-08-15
- **Working Directory**: `/Users/newholland/1234567/.agents/teamwork_preview_explorer_frontend_1`
- **Scope**: Technical audit of Frontend Framework, Build Tools, Package Manager, Folder Structure, Component Hierarchy, State Management, Audio/Media Capabilities, Real-Time / WebSocket / WebRTC Infrastructure, and Lead / Contact UI Views.
- **Policy**: STRICT READ-ONLY. Zero source code modifications made.

---

## Executive Summary

The CRM frontend is a Single Page Application (SPA) built with **React 18.2.0**, **TypeScript ~5.8.2**, **React Router DOM 6.22.3**, and bundled with **Vite ^6.2.0**. The UI uses **Tailwind CSS** (loaded via CDN script) with custom glassmorphism styles, animated floating cards, **Framer Motion 12.35.0**, and **Lucide React 0.344.0**.

State management relies entirely on **React Context API** (`DataContext.tsx`, `AccountingContext.tsx`, `ThemeProvider.tsx`) and custom service modules without any external store libraries (no Redux, no Zustand, no TanStack Query).

For real-time and telephony capabilities:
1. **Real-time**: A custom WebSocket client (`services/socketService.ts`) connects to `/ws` (proxied by Vite to `ws://localhost:3001`) and broadcasts events (e.g. `NEW_LEAD`, `NEW_ADVISOR_APPLICATION`) into `DataContext.tsx`.
2. **Audio/Media**: The frontend supports microphone capture via `navigator.mediaDevices.getUserMedia` and `MediaRecorder` in `components/chat/AudioRecorder.tsx` for voice notes, and playback of call recordings via HTML5 `<audio controls>` in `pages/crm/TelephonyHub.tsx`.
3. **WebRTC / Softphone**: There are **no** WebRTC or SIP libraries installed (no `@signalwire/js`, `sip.js`, `jssip`, `simple-peer`). The existing softphone UI (`pages/crm/TelephonyHub.tsx`) operates by issuing REST API calls (`POST /api/signalwire/call`, `POST /api/signalwire/hangup`) to the backend, which controls telephony via SignalWire's REST API and logs calls to PostgreSQL.

---

## 1. Frontend Framework, Build Tools, Package Manager & Folder Structure

### 1.1 Core Specifications
- **Framework**: React `18.2.0`, React DOM `18.2.0` (`package.json:44-45`)
- **Routing**: React Router DOM `6.22.3` (`package.json:47`)
- **Language**: TypeScript `~5.8.2` (`package.json:63`)
- **Build Tool**: Vite `^6.2.0` with `@vitejs/plugin-react` `^5.0.0` (`package.json:62,64`, `vite.config.ts:3,32`)
- **Package Manager**: `npm` (managed via `package.json` and `package-lock.json`)
- **UI & Motion**:
  - `framer-motion`: `^12.35.0` (`package.json:32`)
  - `lucide-react`: `0.344.0` (`package.json:37`)
  - `recharts`: `2.12.2` (`package.json:48`)
  - `clsx`: `^2.1.0` (`package.json:26`)
  - `tailwind-merge`: `^2.2.1` (`package.json:52`)
  - Tailwind CSS: Loaded via CDN `<script src="https://cdn.tailwindcss.com"></script>` (`index.html:58`)
- **Document & Media Libraries**:
  - `jspdf`: `2.5.1` & `jspdf-autotable`: `3.8.2` (`package.json:35,36`)
  - `html-to-image`: `1.11.11` (`package.json:33`)
  - `date-fns`: `^4.1.0` (`package.json:29`)
- **Cloud & Financial SDKs**:
  - `@supabase/supabase-js`: `^2.110.8` (`package.json:24`)
  - `react-plaid-link`: `^4.1.1` (`package.json:46`)
- **SignalWire & WebRTC**: **Not installed** in `package.json` (no `@signalwire/js`, `@signalwire/realtime-api`, `sip.js`, or WebRTC wrappers).

### 1.2 Build Configuration (`vite.config.ts`)
```ts
// /Users/newholland/1234567/vite.config.ts:10-28
server: {
  port: Number(process.env.PORT) || 3020,
  host: '127.0.0.1',
  fs: {
    strict: true,
    allow: [path.resolve(__dirname)],
  },
  proxy: {
    '/api': {
      target: `http://127.0.0.1:3001`,
      changeOrigin: true,
      secure: false,
    },
    '/ws': {
      target: 'ws://localhost:3001',
      ws: true,
    }
  }
}
```

### 1.3 Folder Structure
```
/Users/newholland/1234567/
├── index.html                   # HTML entry point, Tailwind CDN, SF Pro font, custom glassmorphism styles
├── index.tsx                    # ReactDOM bootstrap, ErrorBoundary wrapper
├── App.tsx                      # Main routing gateway (Public routes vs Protected CRM routes)
├── types.ts                     # Master TypeScript definitions (User, Lead, Client, Telephony, etc.)
├── vite.config.ts               # Vite configuration with /api and /ws proxy
├── tsconfig.json                # TypeScript compiler configuration
├── components/                  # Reusable UI components
│   ├── CRMData.tsx              # CRMLayout (macOS window controls, sidebar, tour, command palette)
│   ├── Navbar.tsx / Footer.tsx  # Public website navigation and footer
│   ├── CommandPalette.tsx       # ⌘K quick action bar
│   ├── CRMCommandPalette.tsx    # CRM command palette modal
│   ├── WorkspaceTemplateModal.tsx # Module template activator
│   ├── ErrorBoundary.tsx        # React Error Boundary
│   ├── SystemStatus.tsx         # Real-time backend status indicator
│   ├── ThemeProvider.tsx        # Theme state provider
│   ├── chat/                    # Internal team and underwriting messaging
│   │   ├── AudioRecorder.tsx    # Web Audio / Mic recording component
│   │   ├── CaseChat.tsx         # Underwriting case-specific chat
│   │   ├── ChatSidebar.tsx      # Chat channels and direct messaging sidebar
│   │   ├── ChatWindow.tsx       # Main conversation view and file preview modal
│   │   └── FilePreview.tsx      # File and audio attachment preview widget
│   ├── calendar/                # Calendar views, modals, cards
│   ├── analytics/               # CRMAnalyticsCharts.tsx
│   ├── shared/                  # Tab3DBanner.tsx, ConfirmModal.tsx
│   └── plaid/                   # PlaidConfigPanel.tsx
├── context/                     # Global React Context providers
│   ├── DataContext.tsx          # Master CRM data provider (leads, clients, auth, sockets, tasks)
│   └── AccountingContext.tsx    # General ledger, chart of accounts, bank feed reconciliation
├── pages/                       # Screen views
│   ├── Login.tsx / Signup.tsx / ForgotPassword.tsx  # Authentication pages
│   ├── crm/                     # Advisor Terminal (CRM) pages
│   │   ├── Dashboard.tsx        # Main CRM dashboard, live event stream, KPIs, strategic tasks
│   │   ├── Leads.tsx            # Leads DB table, multi-tab lead detail modal, action triggers
│   │   ├── LeadIntake.tsx       # Manual lead intake form with multi-vertical customization
│   │   ├── Clients.tsx          # Client policy portfolio, renewal monitoring, PDF export
│   │   ├── Inbox.tsx            # Inquiries inbox (New, In Progress, Archived), click-to-call
│   │   ├── TelephonyHub.tsx     # Softphone, IVR extensions, 2-way SMS, AI lead qualifier, call logs
│   │   ├── BankVerification.tsx # Plaid bank ACH verification panel
│   │   ├── Calendar.tsx         # Calendar scheduling and event management
│   │   ├── Commissions.tsx      # Commission accounting and performance
│   │   ├── ProfileSettings.tsx  # Advisor profile and public microsite settings
│   │   ├── LegalCompliance.tsx  # Legal agreements and compliance vault
│   │   ├── SecuritiesWealth.tsx # Securities, series licensing, wealth management
│   │   ├── MarketingCampaigns.tsx # Marketing campaign manager
│   │   ├── AutomationStudio.tsx # Workflow automations
│   │   ├── insurance/           # Policies & Apps, Auto Quotes, Commercial Hub, Fleet, Claims
│   │   ├── real-estate/         # Property Pipeline, Transactions & Escrow
│   │   ├── mortgage/            # Loan Applications, Rate Tools, Refi Calc
│   │   ├── securities/          # Portfolio Mgmt, Compliance Docs, Advisory Fees
│   │   ├── logistics/           # Logistics Hub, Load Posting Terminal
│   │   └── accounting/          # General Ledger, Reports, Tax Center, Bank Feeds
│   ├── website/                 # Public website pages (Home, Services, LifeInsurance, RealEstate, etc.)
│   ├── admin/                   # Admin pages (AdminUsers, WebsiteSettings, CarrierAssignment, etc.)
│   ├── public/                  # Public funnels (BookingPage, LoadTracking, Quote Funnels)
│   ├── client/                  # ClientPortal.tsx
│   ├── onboarding/              # AdvisorApplication.tsx, ActivateAccount.tsx
│   └── verify/                  # ClientVerify.tsx (Public bank verification page)
└── services/                    # Frontend service layer
    ├── apiBackend.ts            # REST client with auth token management and DB fallbacks
    ├── socketService.ts         # WebSocket client wrapper for /ws
    ├── supabaseClient.ts        # Supabase client instantiation
    ├── bankingService.ts        # Plaid Link banking integration service
    ├── pdfBrandingService.ts    # jsPDF branding header/footer utility
    ├── analyticsService.ts      # Visitor page analytics tracking
    ├── marketingBackend.ts      # Marketing lead transformer & ingestion engine
    └── database.ts              # Local database abstraction
```

---

## 2. Component Hierarchy, Layout Structure, and State Management

### 2.1 Component Tree & Routing Architecture
The top-level hierarchy starts in `index.tsx` and delegates to `App.tsx`:

```tsx
// /Users/newholland/1234567/index.tsx:17-24
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
```

In `App.tsx`:
```tsx
// /Users/newholland/1234567/App.tsx:177-185
<DataProvider>
  <ThemeProvider>
    <SystemStatus />
    <Router>
      <SEO />
      <AnalyticsTracker />
      <Routes>
        {/* PUBLIC WEBSITE ROUTES */}
        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
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

### 2.2 Layout Wrappers
1. **Public Website Layout (`PublicLayout` in `App.tsx:169-175`)**:
   - Renders `<Navbar />`, `<main className="flex-grow">{children}</main>`, and `<Footer />`.
2. **CRM Layout (`ProtectedCRMRoute` & `CRMLayout` in `App.tsx:118-149` and `components/CRMData.tsx:93-467`)**:
   - Enforces authentication (`user != null`) and role verification (`Admin`, `Manager`, `Sub-Admin`, `Advisor`).
   - Renders macOS window controls (traffic lights).
   - Renders a multi-section sidebar:
     - `Core`: Dashboard, Campaigns, Leads DB, Calendar, Lead Intake.
     - `Verticals`: Dynamic items based on `user.category` and `user.productsSold` (e.g. Life Insurance, Auto Quotes, Commercial Hub, Property Pipeline, Mortgage Loans, Securities Portfolio, Logistics Hub).
     - `Shared`: Securities & Wealth, Telephony & AI Suite (`/crm/telephony`), Legal & Compliance, Bank Verification, Profile.
     - `Administration`: User Terminal, Advisor Applications, Real Estate CMS, Site Config, Transparency, Carrier Setup, Analytics, Commission Recon, Landing Pages.
   - Includes interactive features:
     - ⌘K Quick Action Command Palette (`CommandPalette.tsx` & `CRMCommandPalette.tsx`).
     - Guided Onboarding / System Walkthrough Tour (`ADMIN_TOUR_STEPS` with 16 module steps).
     - Framer Motion page transitions with `<AnimatePresence mode="wait">` (`CRMData.tsx:452-463`).

### 2.3 State Management Architecture
- **Pure React Context API**:
  - `DataContext.tsx`: Holds master application state including `user`, `allUsers`, `leads`, `clients`, `tasks`, `events`, `testimonials`, `jobApplications`, `companySettings`, `notifications`, `chatMessages`, `documents`, `interactions`, and `userPreferences`.
  - `AccountingContext.tsx`: Manages Double-Entry General Ledger, Chart of Accounts, Bank Feed Transactions, and Tax Configurations.
  - `ThemeProvider.tsx`: Manages light/dark/system theme states and custom branding colors.
- **Data Fetching and Synchronization**:
  - On mount, `DataProvider` calls `Backend.getCurrentUser()` and `refreshActiveData()` which issues parallel `Promise.all` requests (`Backend.getLeads()`, `Backend.getClients()`, `Backend.getUsers()`, etc.).
  - Mutation methods (`addLead`, `updateLeadStatus`, `updateClient`, `addTask`, etc.) update local React state optimistically and persist changes asynchronously via `Backend` methods in `services/apiBackend.ts`.
  - There is **no Redux store, no Zustand slice, no TanStack Query cache, no MobX observable**.

---

## 3. Audio / Media Capabilities

### 3.1 Microphone Capture & Permissions
- **File**: `/Users/newholland/1234567/components/chat/AudioRecorder.tsx`
- **Implementation**:
  ```tsx
  // components/chat/AudioRecorder.tsx:25-44
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.start();
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Mic Error", err);
      onCancel();
    }
  };
  ```
- **Capabilities**: Captures user microphone audio via the standard Web MediaDevices API, encodes audio chunks as `Blob({ type: 'audio/webm' })`, renders animated visualizer bars, and passes the recorded Blob to chat message attachments.

### 3.2 Audio Playback
- **Call Recordings Playback**:
  - Located in `pages/crm/TelephonyHub.tsx:746-750` under the "Call Recordings & AI Ratings Log" tab.
  - Plays MP3 recordings using native HTML5 audio:
    ```tsx
    // pages/crm/TelephonyHub.tsx:746-748
    <audio controls className="h-10 rounded-xl max-w-[240px]">
      <source src={log.recording_url} type="audio/mp3" />
    </audio>
    ```
- **Chat Voice Notes Playback**:
  - Located in `components/chat/FilePreview.tsx:53` which embeds `<audio src={attachment.url} className="hidden" />` alongside a custom voice note waveform UI.

### 3.3 Notifications & Sound Effects
- **In-App Notifications**: Handled via `pushNotification(title, message, type, ...)` in `context/DataContext.tsx:262-265`. Displays toast alerts and populates notifications in state.
- **Browser Push Notifications**: The Web Notifications API (`Notification.requestPermission`) is **not** currently requested or used.
- **Sound Effects & DTMF Audio**: There are **no sound effects** (e.g. ringtones, dialing tones, call connection chimes, or Web Audio API `AudioContext` synthesizers) currently implemented.

---

## 4. Real-Time / WebSocket / WebRTC Infrastructure

### 4.1 WebSocket Infrastructure (`services/socketService.ts`)
- **Connection Mechanics**:
  ```ts
  // services/socketService.ts:8-22
  class SocketService {
    private socket: WebSocket | null = null;
    private listeners: ((data: any) => void)[] = [];
    private reconnectInterval: number = 3000;
    
    private get url(): string {
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      if (isLocal) {
          return `${protocol}//localhost:3001/ws`;
      }
      return `${protocol}//${window.location.host}/ws`;
    }
  ```
- **Vite Proxy (`vite.config.ts:23-26`)**:
  ```ts
  '/ws': {
    target: 'ws://localhost:3001',
    ws: true,
  }
  ```
- **Frontend Subscriptions**:
  1. `context/DataContext.tsx:370-381`:
     ```tsx
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
  2. `pages/crm/BankVerification.tsx:993-1002`:
     ```tsx
     const unsubscribe = socketService.subscribe((data) => {
       if (data.type === 'BANK_VERIFIED' || data.type === 'PLAID_VERIFICATION_COMPLETE') {
         fetchVerifications();
       }
     });
     ```
- **Serverless Production Limitation**: In non-local production (e.g. Vercel serverless), `socketService.ts:38-43` suppresses reconnection loops after the first attempt to prevent constant console error noise.

### 4.2 Socket.io, SSE & Supabase Realtime
- **Socket.io**: Not used.
- **Server-Sent Events (`EventSource`)**: Not used.
- **Supabase Realtime**: `services/supabaseClient.ts` creates a `@supabase/supabase-js` client instance for storage uploads and table queries (`pages/crm/ClientRiskDashboard.tsx:39-60`), but **no** Supabase Realtime channels (`supabase.channel(...)` or Postgres CDC subscriptions) are active in the frontend.

### 4.3 WebRTC, SIP, and Softphone Infrastructure
- **WebRTC & SIP Code**:
  - There is **no** WebRTC peer connection logic (`RTCPeerConnection`, `createOffer`, `setRemoteDescription`, STUN/TURN servers).
  - There is **no** SIP.js or JsSIP signaling client.
  - The SignalWire client SDK (`@signalwire/js`) is **not installed**.
- **Existing Softphone UI (`pages/crm/TelephonyHub.tsx`)**:
  - The app already contains a comprehensive telephony interface with 5 functional tabs:
    1. `Corporate Softphone`: Keypad (`0-9`, `*`, `#`), target phone number input, Clear/Backspace buttons, extension selector dropdown, Start Call button, End Call button, active call duration timer, call status state machine (`idle` | `connecting` | `in-progress` | `ended` | `failed`), mute button toggle, recording button toggle, and recent call logs feed.
    2. `Advisor Extensions`: Corporate Advisor Extension Directory with extension badges (`Ext 101`, `Ext 102`, etc.), status indicators, and "Call Extension" quick-dial buttons.
    3. `2-Way SMS Inbox`: Conversation thread list, message history bubble feed, SMS text input, and "Send SMS" action.
    4. `AI Lead Qualifier Bot`: Lead name and phone input, "Launch Outbound AI Call" button, and 3-tier lead temperature rating cards (Warm 🔥, Mild 🌤️, Cold ❄️).
    5. `Call Recordings & AI Ratings Log`: List of historical calls with transcript, AI qualification summary, AI rating badge, and HTML5 `<audio controls>` player.
  - **Operational Mechanism**: When the user clicks "Start Call", the frontend executes a REST `POST` request to `/api/signalwire/call` (`pages/crm/TelephonyHub.tsx:144-154`). The backend then uses SignalWire LAML REST API (`Calls.json`) and inserts a row into `telephony_calls`. This is an outbound REST-triggered call, not a browser-based WebRTC audio stream.

---

## 5. Lead / Contact UI Views & Action Buttons

### 5.1 Where Leads and Contacts are Displayed

| View / Page | File Path | Description & Features |
|---|---|---|
| **Leads Database** | `pages/crm/Leads.tsx` | Main lead intake table, search, source filter, advisor assignment filter, status filter, circular score meter (`score > 75` = Hot/Warm), priority badge (`High`, `Medium`, `Low`), bulk status update toolbar, and multi-tab lead detail modal (`profile`, `history`, `timeline`, `underwriting`, `vault`). |
| **New Lead Intake** | `pages/crm/LeadIntake.tsx` | Multi-vertical intake form with product vertical selector (Life, Annuity, Real Estate, Mortgage, Securities, Auto, Commercial, Logistics, DSM Property Solutions), personal information, residential address, vertical-specific fields (SSN, income, health, vehicles, property specs), advisor assignment dropdown. |
| **Client Management** | `pages/crm/Clients.tsx` | Client portfolio table with product category filter, search, master policy numbers, annual premium, renewal countdown status (`Active`, `Renewing Soon`, `Expired`), carrier column, and PDF portfolio export. |
| **Requests & Inquiries Inbox** | `pages/crm/Inbox.tsx` | Folder-based inbox (`New Requests`, `In Progress`, `Archived`), inquiry message preview, product interest badge, lead score, and split detail pane. |
| **CRM Dashboard** | `pages/crm/Dashboard.tsx` | Live CRM Event Feed (`liveEvents`) showing real-time SignalWire AI qualification completions (e.g. "Jonathan Miller rated Warm 🔥"), Plaid bank verifications, and strategic priority task items. |
| **Telephony Suite** | `pages/crm/TelephonyHub.tsx` | Softphone console, corporate advisor extensions directory, 2-way SMS inbox, and call recordings list. |

### 5.2 Existing Action Buttons, Click-to-Call, and Dialers

1. **Leads Table Action Buttons (`pages/crm/Leads.tsx:484-495`)**:
   ```tsx
   <div className="flex items-center gap-2">
     {/* 1. Open Lead Profile Modal */}
     <button onClick={() => handleOpenView(lead)} className="inline-flex items-center px-4 py-2 border border-slate-200 bg-white text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm">
       <Eye className="h-3.5 w-3.5 mr-1.5" /> Profile
     </button>
     
     {/* 2. Direct Link to SignalWire Telephony Hub */}
     <Link to="/crm/telephony" className="p-2.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all border border-blue-200" title="SignalWire Call & AI Qualify">
       <Phone className="h-3.5 w-3.5" />
     </Link>
     
     {/* 3. Direct Link to Plaid Bank Verification */}
     <Link to="/crm/bank-verification" className="p-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-xl transition-all border border-emerald-200" title="Plaid Instant ACH Verification">
       <Landmark className="h-3.5 w-3.5" />
     </Link>
   </div>
   ```

2. **Client Portfolio Action Buttons (`pages/crm/Clients.tsx:197-207`)**:
   - Click-to-Email: `<a href="mailto:${client.email}"><Mail className="h-4 w-4" /></a>`
   - Click-to-Call (OS Native): `<a href="tel:${client.phone}"><Phone className="h-4 w-4" /></a>`

3. **Inquiries Inbox Action Buttons (`pages/crm/Inbox.tsx:207-213`)**:
   - Click-to-Call (OS Native):
     ```tsx
     <a href={`tel:${selectedLead.phone}`} className="flex-1 px-4 py-3.5 bg-[#0B2240] text-white rounded-2xl text-sm font-bold shadow-lg shadow-blue-900/20 hover:scale-105 transition-all flex items-center justify-center gap-2">
       <Phone className="h-4 w-4" /> Call Client
     </a>
     ```
   - Click-to-Email:
     ```tsx
     <a href={`mailto:${selectedLead.email}`} className="flex-1 px-4 py-3.5 bg-white border border-slate-200 text-slate-700 rounded-2xl text-sm font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
       <Mail className="h-4 w-4" /> Send Email
     </a>
     ```

4. **Main Dashboard Quick Action Bar (`pages/crm/Dashboard.tsx:138-158`)**:
   - Button: `<button onClick={() => navigate('/crm/telephony')}><Phone className="w-4 h-4" /> SignalWire Telephony</button>`

5. **Softphone Dialer Controls (`pages/crm/TelephonyHub.tsx:325-433`)**:
   - Keypad buttons `1` to `9`, `*`, `0`, `#` (`handleKeypadPress`)
   - `Clear` button (`handleClearKeypad`) & `Backspace` button (`handleBackspace`)
   - `Start Call` button (`handleStartCall` -> `POST /api/signalwire/call`)
   - `End Call` button (`handleEndCall` -> `POST /api/signalwire/hangup`)
   - `Mute` toggle button (`isMuted`)
   - `Recording Active` toggle button (`isRecording`)

---

## 6. Synthesis & Key Architecture Takeaways for SignalWire Standalone Implementation

1. **Clean Integration Surface**:
   - The UI already has a dedicated route `/crm/telephony` rendered by `pages/crm/TelephonyHub.tsx` and linked from the CRM sidebar (`components/CRMData.tsx:235`), Leads table (`pages/crm/Leads.tsx:488`), and Dashboard (`pages/crm/Dashboard.tsx:142`).
   - The softphone UI components and state machines are already designed and styled according to the application's design system (Apple glassmorphism).

2. **WebRTC Softphone Upgrade Path**:
   - To make the softphone genuinely browser-native (WebRTC) without relying solely on backend REST-triggered calls, the SignalWire WebRTC Client SDK (`@signalwire/js`) or a SIP softphone library can be incorporated on the frontend.
   - The microphone permission flow is already proven in `components/chat/AudioRecorder.tsx:27`.
   - Audio elements for call recordings and audio streaming already exist in `pages/crm/TelephonyHub.tsx:746`.

3. **Real-time Event Integration**:
   - The frontend's `services/socketService.ts` and `DataContext.tsx` already listen on `/ws` for events like `NEW_LEAD`. Expanding this to receive `CALL_INCOMING`, `CALL_CONNECTED`, and `CALL_ENDED` real-time WebSocket events will allow an inbound call popup/banner to appear across all CRM screens seamlessly.

4. **Zero CRM Core Disruption**:
   - All lead and contact tables (`Lead`, `Client`, `Interaction`, `Task`) in `types.ts` and `context/DataContext.tsx` are cleanly isolated.
   - Telephony call logs can attach to `lead_id` and `clientId` via foreign keys without altering the core CRM schema.
