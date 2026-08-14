# Milestone M3 Investigation Report: Frontend Dialer UI & SignalWire Integration

**Explorer**: Explorer 2 (Frontend Dialer UI & Integration)  
**Date**: 2026-08-13  
**Working Directory**: `/Users/newholland/1234567/.agents/explorer_m3_r1_2`  
**Target Files**: `pages/crm/TelephonyHub.tsx`, `backend/routes/signalwire.cjs`, `backend/migrations/signalwire_schema.sql`

---

## Executive Summary

An in-depth investigation of the frontend softphone dialer UI (`pages/crm/TelephonyHub.tsx`) and backend API integration (`backend/routes/signalwire.cjs`) was conducted. 

While `TelephonyHub.tsx` provides a visually polished 5-tab interface (Softphone, Advisor Extensions, 2-Way SMS, AI Lead Qualifier Bot, Call Recordings), there are **critical state management bugs, missing call state transitions (`Connecting`, `Ended`, `Failed`), API contract mismatches, and a complete absence of backend endpoints for call lifecycle termination and status logging**.

---

## Key Findings & Code Analysis

### 1. Softphone Dialer UI Components (`TelephonyHub.tsx`)

| Element | Current Implementation | Issues & Deficiencies |
| text | text | text |
| **Phone Keypad** | Grid of buttons (`1`-`9`, `*`, `0`, `#`) appending to `dialNumber`. | Missing **Backspace/Clear** button. No keypad input validation or phone number formatting helpers. |
| **Input Field** | Standard text input bound to `dialNumber`. | Lacks E.164 phone number sanitization before sending to API. |
| **Dial Button ("Start Call")** | `<button onClick={handleStartCall} disabled={!dialNumber}>` | Synchronously sets `isCalling(true)` *before* API response completes. |
| **Hangup Button ("End Call")** | `<button onClick={handleEndCall}>` | Sets local `isCalling(false)`. **No API call is made to notify backend or DB that call ended.** |
| **Call Status Display** | Single boolean state `isCalling` (`true` / `false`). | **Missing Call States**: No `Connecting`, `Ended`, or `Failed` status UI. On API fetch failure, `isCalling` remains `true`, freezing UI in "Call in Progress". |
| **Call Duration Timer** | `setInterval` increments `callDuration` every second when `isCalling` is true. | Starts ticking during connection setup. Continues ticking on API failure. Resets abruptly on hangup without capturing final call duration for DB. |
| **Call Log History List** | Tab 5 ("logs") renders `callLogs` array fetched via `GET /api/signalwire/calls`. | No inline recent call log widget in Tab 1 (Softphone). Does not auto-update on hangup without manual refetch. |

---

### 2. Backend Integration & Interface Contract Audit

#### A. Contract Mismatch on `POST /api/signalwire/call`
- **Specification Contract (`PROJECT.md` & `SCOPE.md`)**:
  - Request Body: `{ "to": string, "from"?: string, "extension"?: string }`
  - Response Body: `{ "success": boolean, "callId": string, "status": string, "sid"?: string }`
- **Actual Code Implementations**:
  - **Frontend (`TelephonyHub.tsx:117-125`)**:
    ```typescript
    body: JSON.stringify({
      toNumber: dialNumber,
      leadName: 'Direct Softphone Call',
      advisorExtension: selectedExtension
    })
    ```
  - **Backend (`backend/routes/signalwire.cjs:141`)**:
    ```javascript
    const { toNumber, leadName, leadId, advisorExtension } = req.body;
    ```
  - **Backend Response (`backend/routes/signalwire.cjs:181`)**:
    ```javascript
    res.json({ success: true, call: newCall });
    ```
- **Discrepancy**: 
  1. Frontend and backend use `toNumber` instead of contract key `to`.
  2. Backend returns `{ success: true, call: newCall }` without top-level `callId` or `sid` as mandated by contract.

#### B. Premature DB Logging & Missing Call Lifecycle Endpoints
- In `backend/routes/signalwire.cjs` lines 155-178, when `POST /api/signalwire/call` is invoked, it immediately inserts a call record into `telephony_calls` with:
  - `status: 'completed'` (hardcoded!)
  - `duration_seconds: 45` (hardcoded!)
- There is **no backend endpoint** (`POST /api/signalwire/call/status` or `POST /api/signalwire/call/end`) to:
  1. Track real-time status transitions (`initiated` -> `connecting` -> `in-progress` -> `completed` | `failed`).
  2. Record the actual elapsed call duration upon call hangup.
  3. Log call failure or cancellation events in PostgreSQL.

---

## Identified Defects & Vulnerabilities Summary

1. **Defect D1 (UI Frozen on Error)**: If `POST /api/signalwire/call` throws an error or returns a non-200 status, `handleStartCall` in `TelephonyHub.tsx` catches the error but leaves `isCalling(true)`. The UI remains permanently stuck in "Call in Progress" with timer running.
2. **Defect D2 (Missing State Machine)**: `isCalling` is boolean. There are no visual or state representations for `Connecting`, `Ended`, or `Failed`.
3. **Defect D3 (Missing Call Termination Endpoint & DB Update)**: Clicking "End Call" only toggles React state. The call status in PostgreSQL is never updated upon termination, and actual call duration is lost.
4. **Defect D4 (API Field Name Mismatch)**: Frontend sends `toNumber` while contract specifies `to`. Backend response lacks top-level `callId` and `sid`.
5. **Defect D5 (Keypad Usability)**: Keypad lacks a Backspace/Clear button to delete mistyped digits.

---

## Detailed Recommendations & UI/UX & State Flow Plan for Worker

### Part 1: Backend API Router Refactoring (`backend/routes/signalwire.cjs`)

1. **Normalize `POST /api/signalwire/call`**:
   - Accept both `to` and `toNumber` parameters for backwards compatibility and contract compliance:
     ```javascript
     const targetNumber = req.body.to || req.body.toNumber;
     ```
   - Set initial status to `'in-progress'` (or `'initiated'`) and `duration_seconds: 0`.
   - Return standard contract fields along with the `call` object:
     ```javascript
     res.json({
       success: true,
       callId: newCall.id,
       sid: newCall.call_sid,
       status: newCall.status,
       call: newCall
     });
     ```

2. **Add Call Lifecycle Update Endpoint `POST /api/signalwire/call/status`**:
   - Request Body: `{ "callId": string, "status": "completed" | "failed" | "canceled", "durationSeconds": number }`
   - SQL Query:
     ```sql
     UPDATE telephony_calls 
     SET status = $1, duration_seconds = $2, updated_at = NOW() 
     WHERE id = $3 OR call_sid = $3;
     ```
   - Update in-memory fallback store (`memoryCallsStore`) as well.
   - Return updated call record.

---

### Part 2: Frontend State Machine & UI/UX Plan (`pages/crm/TelephonyHub.tsx`)

#### A. State Machine Architecture
Replace `const [isCalling, setIsCalling] = useState(false)` with explicit status states:

```typescript
type CallState = 'idle' | 'connecting' | 'in-progress' | 'ended' | 'failed';

const [callState, setCallState] = useState<CallState>('idle');
const [currentCallId, setCurrentCallId] = useState<string | null>(null);
const [currentCallSid, setCurrentCallSid] = useState<string | null>(null);
const [callErrorMessage, setCallErrorMessage] = useState<string | null>(null);
```

#### B. Call Lifecycle Flow

```
[ IDLE ] ──(User clicks "Start Call")──> [ CONNECTING ]
                                                │
                 ┌──────────────────────────────┴──────────────────────────────┐
                 ▼ (API Success)                                               ▼ (API Error / 400 / 500)
         [ IN-PROGRESS ]                                                 [ FAILED ]
         (Timer ticking)                                        (Display error message)
                 │                                                             │
        (User clicks "End Call")                                      (Auto-reset 3s)
                 ▼                                                             ▼
     [ POST /call/status ] ──> [ ENDED ] ──(Auto-reset 2s)─────────────> [ IDLE ]
```

#### C. Component Method Implementations

1. **`handleStartCall()`**:
   ```typescript
   const handleStartCall = async () => {
     if (!dialNumber) return;
     setCallState('connecting');
     setCallErrorMessage(null);
     setCallDuration(0);

     try {
       const res = await fetch('/api/signalwire/call', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           to: dialNumber,
           toNumber: dialNumber,
           leadName: 'Direct Softphone Call',
           advisorExtension: selectedExtension
         })
       });

       const data = await res.json();
       if (res.ok && data.success) {
         setCurrentCallId(data.callId || data.call?.id);
         setCurrentCallSid(data.sid || data.call?.call_sid);
         setCallState('in-progress');
       } else {
         setCallState('failed');
         setCallErrorMessage(data.error || 'Failed to connect call');
         setTimeout(() => setCallState('idle'), 3500);
       }
     } catch (err: any) {
       setCallState('failed');
       setCallErrorMessage(err.message || 'Network error connecting call');
       setTimeout(() => setCallState('idle'), 3500);
     }
   };
   ```

2. **`handleEndCall()`**:
   ```typescript
   const handleEndCall = async () => {
     const durationToSave = callDuration;
     const callIdToSave = currentCallId;

     setCallState('ended');

     if (callIdToSave) {
       try {
         await fetch('/api/signalwire/call/status', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({
             callId: callIdToSave,
             status: 'completed',
             durationSeconds: durationToSave
           })
         });
       } catch (err) {
         console.error('Failed to log call end status:', err);
       }
     }

     fetchData(); // Refresh call logs list
     setTimeout(() => {
       setCallState('idle');
       setCurrentCallId(null);
       setCurrentCallSid(null);
     }, 2000);
   };
   ```

3. **Keypad Backspace & UI Enhancements**:
   - Add `<button onClick={() => setDialNumber(prev => prev.slice(0, -1))}>` (Backspace icon).
   - Render Active Call Console states clearly:
     - `connecting`: Yellow pulse icon + "Connecting to SignalWire line..."
     - `in-progress`: Blue animated pulse icon + ticking timer + Mute/Record controls.
     - `ended`: Green checkmark + "Call Ended • Duration XX:XX".
     - `failed`: Red warning icon + Error alert text.
   - Add a "Recent Calls" quick feed on Tab 1 for immediate call status feedback.

---

## Verification Strategy for Reviewer & Auditor

1. **UI State Transition Test**: Verify softphone transitions through `idle` -> `connecting` -> `in-progress` -> `ended` -> `idle` on successful call, and `connecting` -> `failed` -> `idle` on network/API failure.
2. **API Payload Alignment Test**: Verify POST to `/api/signalwire/call` includes both `to` and `toNumber`, and response contains `{ success: true, callId: ..., status: ... }`.
3. **DB Logging & Call Termination Test**: Verify placing a call inserts a record in `telephony_calls` with status `in-progress`, and hanging up issues a POST to `/api/signalwire/call/status` updating `status` to `completed` and saving exact `duration_seconds`.
4. **E2E Test Runner**: Run `node tests/e2e/runner.mjs` to ensure zero regressions across Tier 1 through Tier 4 tests.
