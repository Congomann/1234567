# Handoff Report: M5 R5.2 Real-Time Agent Panel Notifications & WebSocket Integration

## 1. Observation

### 1.1 Specification & Event Contract (`PROJECT.md`)
- **Location**: `/Users/newholland/1234567/PROJECT.md` (Lines 51–53)
- **Feature Requirement R5.2**: Emit WebSocket events (`LEAD_QUALIFIED`) to update agent panel UI instantly upon qualification.
- **Event Contract Definition**:
  - **WebSocket Endpoint**: `/ws`
  - **Payload Format**:
    ```json
    {
      "type": "LEAD_QUALIFIED",
      "payload": {
        "lead_id": "string",
        "name": "string",
        "status": "Qualified | Disqualified",
        "qualification": "Qualified | Disqualified",
        "reason": "string",
        "custom_details": {
          "asset_volume": 0,
          "annual_income": 0,
          "credit_score": 0
        }
      }
    }
    ```
  - **Key Details**: Both `status` and `qualification` fields are required in the payload contract.

### 1.2 Backend WebSocket Setup & Broadcast (`backend/server.cjs`)
- **Location**: `/Users/newholland/1234567/backend/server.cjs` (Lines 42–57)
- **Code Inspection**:
  ```js
  // WebSocket setup
  const wss = new WebSocket.Server({ server, path: '/ws' });

  wss.on('connection', (ws) => {
    console.log('[WebSocket] Client connected');
    ws.on('close', () => console.log('[WebSocket] Client disconnected'));
  });

  // Helper to broadcast to all connected clients
  const broadcast = (data) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  };
  ```
- **Observed Deficiencies**:
  1. `broadcast` is scoped locally inside `server.cjs` and is **not exported** or attached to the Express application object (`app.set('broadcast', broadcast)` or `app.set('wss', wss)`).
  2. External routers/services (such as `backend/routes/webhooks.cjs`, `backend/routes/marketing.cjs`, or `backend/services/qualificationEngine.cjs`) cannot access `broadcast` directly.
  3. No WebSocket heartbeat ping/pong mechanism exists to detect and prune stale/zombie socket connections.

### 1.3 Client WebSocket Service (`services/socketService.ts`)
- **Location**: `/Users/newholland/1234567/services/socketService.ts` (Lines 1–110)
- **Code Inspection**:
  ```typescript
  class SocketService {
    private socket: WebSocket | null = null;
    private listeners: ((data: any) => void)[] = [];
    private reconnectInterval: number = 3000;
    ...
    subscribe(callback: (data: any) => void) {
      this.listeners.push(callback);
      return () => {
        this.listeners = this.listeners.filter(cb => cb !== callback);
      };
    }
  }
  export const socketService = new SocketService();
  ```
- **Observed Deficiencies**:
  1. No event-type filtering or strongly typed subscription helpers (e.g. `on(eventType, callback)` or `onLeadQualified(callback)`).
  2. Connection state (connecting, open, closed) is not exposed via an observable state listener or getter, preventing UI components from displaying real-time WebSocket connection status indicators (e.g. live pulse indicator).
  3. In simulation mode (`USE_REAL_SOCKETS = false`), `subscribe` callbacks do not trigger simulated events.

### 1.4 Global State & Frontend Integration (`context/DataContext.tsx`)
- **Location**: `/Users/newholland/1234567/context/DataContext.tsx` (Lines 385–400)
- **Code Inspection**:
  ```typescript
  useEffect(() => {
    if (user) {
      socketService.connect();
      const unsubscribe = socketService.subscribe((data) => {
        if (data.type === 'NEW_LEAD') {
          pushNotification('New Lead Ingested', `New lead received from ${data.payload.source}`, 'success', 'lead', data.payload.id);
          Backend.getLeads().then(setLeads);
        } else if (data.type === 'CHAT_MESSAGE') {
          setChatMessages(prev => [...prev, data.payload]);
        } else if (data.type === 'NEW_ADVISOR_APPLICATION') {
          pushNotification('New Advisor Application', `Application received from ${data.payload.full_name}.`, 'info', 'onboarding', data.payload.id);
        }
      });
      return () => { unsubscribe(); socketService.disconnect(); };
    }
  }, [user, pushNotification]);
  ```
- **Observed Deficiencies**:
  1. `LEAD_QUALIFIED` event handling is **missing** from `DataContext.tsx`.
  2. When a `LEAD_QUALIFIED` event occurs, the local `leads` state is not updated in real-time, nor is a qualification toast notification pushed.

### 1.5 Agent Panel & Dashboard UI Components
- **Locations**:
  - `/Users/newholland/1234567/pages/crm/Leads.tsx` (Leads table, status badges, details view)
  - `/Users/newholland/1234567/pages/crm/Dashboard.tsx` (Live CRM Event Feed)
  - `/Users/newholland/1234567/components/agents/AgentManager.tsx` (Agent status panel)
- **Observed Deficiencies**:
  1. `Dashboard.tsx` polls `/api/signalwire/calls` every 15 seconds instead of listening directly to real-time `LEAD_QUALIFIED` WebSocket events.
  2. `Leads.tsx` relies on `leads` array from `DataContext`. Because `DataContext` does not listen for `LEAD_QUALIFIED`, leads table scores and status badges do not update without a page refresh.

---

## 2. Logic Chain

1. **Qualification Event Broadcast Requirement**:
   - R5.2 requires immediate emission of `LEAD_QUALIFIED` WebSocket events upon lead screening.
   - For `qualificationEngine.cjs` (or webhook endpoints) to broadcast, `broadcast` must be exported from `backend/server.cjs` or accessible via `req.app.get('broadcast')`. Currently, `broadcast` is an unexported local function in `server.cjs`.

2. **Contract Compliance**:
   - The contract in `PROJECT.md` mandates `type: "LEAD_QUALIFIED"` and a payload containing `lead_id`, `name`, `status`, `qualification`, `reason`, and `custom_details` (`asset_volume`, `annual_income`, `credit_score`).
   - Ensuring `status` and `qualification` are both populated guarantees backward and forward compatibility with frontend components expecting either field.

3. **Client Socket Stream Handling**:
   - `services/socketService.ts` receives all incoming WebSocket messages and forwards them to subscribers.
   - `DataContext.tsx` is the primary application subscriber for real-time updates.
   - Adding a `data.type === 'LEAD_QUALIFIED'` handler in `DataContext.tsx` enables two immediate actions:
     a. Triggering a notification (`pushNotification` with title "Lead Qualified!" or "Lead Disqualified", displaying name, score, and reason).
     b. Optimistically updating the specific lead in the state array (`setLeads(prev => ...)` or re-fetching via `Backend.getLeads()`).

4. **UI Instant Responsiveness**:
   - Since `Leads.tsx` renders directly from `DataContext.leads`, updating `DataContext.leads` on `LEAD_QUALIFIED` immediately updates the score ring, priority badge, and qualification tag in the UI without page reload.
   - `Dashboard.tsx` can append `LEAD_QUALIFIED` payloads to its `liveEvents` state array, creating an instant live feed item with zero latency.

5. **Connection Resilience**:
   - WebSockets can silently disconnect due to network drops. Adding a 30-second ping/pong heartbeat in `server.cjs` and connection status callback support in `socketService.ts` ensures stale connections are closed and UI connection badges accurately reflect real-time connectivity.

---

## 3. Caveats

1. **Serverless / Production Environment**:
   - `socketService.ts` currently disables WebSocket reconnect loops in non-local production environments (Vercel) due to serverless execution limits. Real-time WebSocket broadcasting functions fully in local development server environment (`node backend/server.cjs`).
2. **Implementation Scope**:
   - This report is a read-only investigation. Actual code edits to `server.cjs`, `qualificationEngine.cjs`, `socketService.ts`, `DataContext.tsx`, `Dashboard.tsx`, and `Leads.tsx` must be executed by the implementing agent (Explorer 3 / Implementer).
3. **Database Schema Fallbacks**:
   - Incoming webhooks or qualification requests may generate temporary lead UUIDs if DB persistence encounters temporary delays. Payload contract compliance must handle both persisted DB IDs and generated UUIDs gracefully.

---

## 4. Conclusion & Recommended Implementation Plan

### 4.1 Summary
The WebSocket infrastructure (`backend/server.cjs` and `services/socketService.ts`) provides the foundational plumbing for real-time communication. However, `LEAD_QUALIFIED` event broadcasting is not yet wired end-to-end. To fulfill R5.2, four key changes are required:
1. Export / expose the `broadcast` function in `backend/server.cjs` so `qualificationEngine.cjs` can emit `LEAD_QUALIFIED` events.
2. Ensure `qualificationEngine.cjs` emits payloads strictly adhering to the `PROJECT.md` Qualification Event Contract.
3. Enhance `services/socketService.ts` with connection state tracking and event helper methods (`onLeadQualified`).
4. Update `DataContext.tsx`, `Dashboard.tsx`, and `Leads.tsx` to handle `LEAD_QUALIFIED` events and update the UI instantly upon emission.

### 4.2 Step-by-Step Implementation Blueprint

#### Step 1: Expose Broadcast Helper in `backend/server.cjs`
- Attach `broadcast` to Express `app`:
  ```javascript
  app.set('broadcast', broadcast);
  app.set('wss', wss);
  module.exports = { app, server, broadcast };
  ```
- Add WebSocket heartbeat to prune dead sockets every 30s:
  ```javascript
  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) return ws.terminate();
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);
  ```

#### Step 2: Trigger Event Emission in `qualificationEngine.cjs`
- Inside `evaluateLeadQualification(lead, appOrBroadcast)`:
  ```javascript
  const eventPayload = {
    type: "LEAD_QUALIFIED",
    payload: {
      lead_id: lead.id,
      name: lead.name,
      status: isQualified ? "Qualified" : "Disqualified",
      qualification: isQualified ? "Qualified" : "Disqualified",
      reason: result.reason,
      custom_details: {
        asset_volume: result.financials.asset_volume,
        annual_income: result.financials.annual_income,
        credit_score: result.financials.credit_score
      }
    }
  };
  broadcast(eventPayload);
  ```

#### Step 3: Enhance `services/socketService.ts`
- Add connection status callback support and helper method:
  ```typescript
  public onLeadQualified(callback: (payload: any) => void) {
    return this.subscribe((data) => {
      if (data.type === 'LEAD_QUALIFIED') {
        callback(data.payload);
      }
    });
  }
  ```

#### Step 4: Handle Event in `context/DataContext.tsx`
- Add `LEAD_QUALIFIED` block to WebSocket listener:
  ```typescript
  else if (data.type === 'LEAD_QUALIFIED') {
    const { lead_id, name, qualification, reason } = data.payload;
    const isQual = qualification === 'Qualified';
    pushNotification(
      isQual ? '⚡ Lead Qualified!' : '⚠️ Lead Disqualified',
      `Prospect ${name} tagged ${qualification}. Reason: ${reason}`,
      isQual ? 'success' : 'warning',
      'lead',
      lead_id
    );
    // Optimistic update of local lead state
    setLeads(prev => prev.map(l => l.id === lead_id ? { ...l, status: qualification, qualification, score: isQual ? 90 : 30 } : l));
  }
  ```

#### Step 5: Update Agent Panel & Dashboard UI
- **`Dashboard.tsx`**: Add `socketService.subscribe` listener to push `LEAD_QUALIFIED` events directly into `liveEvents` state array so new qualified leads appear in real time in the Live CRM Event Feed.
- **`Leads.tsx`**: Add a visual highlight (e.g. pulse or flash border) when a lead's status changes via real-time WebSocket update.

---

## 5. Verification Method

To verify the integration independently:

1. **Verify Contract & Export in Server**:
   - Command: `grep -n "broadcast" backend/server.cjs`
   - Invalidation Condition: `broadcast` is not accessible to external modules or routes.

2. **Verify Client Event Subscription**:
   - Command: `grep -n "LEAD_QUALIFIED" context/DataContext.tsx`
   - Invalidation Condition: `DataContext.tsx` does not process `LEAD_QUALIFIED` messages.

3. **End-to-End Simulation Test**:
   - Run local backend: `node backend/server.cjs`
   - Trigger test payload via curl:
     ```bash
     curl -X POST http://localhost:3001/api/webhooks/campaigns \
       -H "Content-Type: application/json" \
       -d '{
         "channel": "meta",
         "campaign_id": "test_meta_001",
         "lead": {
           "full_name": "Test Realtime Lead",
           "email": "realtime@nhfg.com",
           "phone": "(555) 999-8888",
           "annual_income": 350000,
           "asset_volume": 1200000,
           "credit_score": 780
         }
       }'
     ```
   - Expectation: WebSocket broadcasts `LEAD_QUALIFIED` event, browser notification appears instantly, and Agent Panel / Leads table updates without refreshing.
