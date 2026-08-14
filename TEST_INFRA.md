# E2E Test Infra: New Holland Financial CRM System Upgrade

## Test Philosophy
- **Requirement-Driven & Opaque-Box**: Tests are derived strictly from `ORIGINAL_REQUEST.md` and `PROJECT.md` acceptance criteria. Tests interact with external API endpoints, HTTP webhooks, WebSocket streams, and UI component render contracts without relying on internal function implementations.
- **Methodology**: Multi-tier testing approach combining Category-Partition, Boundary Value Analysis (BVA), Pairwise Combinatorial Testing, and Real-World Application Workload Scenarios.

## Feature Inventory & Test Mapping
All 11 features from `PROJECT.md § Feature Inventory` are mapped across Tiers 1–4:

| # | Feature | Requirement Source | Tier 1 (Feature) | Tier 2 (Boundary) | Tier 3 (Pairwise) | Tier 4 (Scenario) |
|---|---------|-------------------|:----------------:|:-----------------:|:-----------------:|:-----------------:|
| 1 | R1.1 3D Glassmorphic Header Stats | ORIGINAL_REQUEST §R1 | 5 tests | 5 tests | ✓ (T3-1, T3-4) | ✓ (S3, S5) |
| 2 | R1.2 Meetings Dashboard Tabs | ORIGINAL_REQUEST §R1 | 5 tests | 5 tests | ✓ (T3-1, T3-5) | ✓ (S3, S5) |
| 3 | R1.3 Schedule List & Controls | ORIGINAL_REQUEST §R1 | 5 tests | 5 tests | ✓ (T3-1, T3-6) | ✓ (S3, S5) |
| 4 | R2.1 Animated Analytics Charts | ORIGINAL_REQUEST §R2 | 5 tests | 5 tests | ✓ (T3-2, T3-6) | ✓ (S4, S5) |
| 5 | R2.2 Neon Glow Dashboard Integration | ORIGINAL_REQUEST §R2 | 5 tests | 5 tests | ✓ (T3-2, T3-7) | ✓ (S4, S5) |
| 6 | R3.1 Connected SignalWire Outbound Dialer | ORIGINAL_REQUEST §R3 | 5 tests | 5 tests | ✓ (T3-3, T3-8) | ✓ (S2, S5) |
| 7 | R3.2 Telephony Call State DB Logging | ORIGINAL_REQUEST §R3 | 5 tests | 5 tests | ✓ (T3-3, T3-9) | ✓ (S2, S5) |
| 8 | R4.1 Campaign Webhook Endpoint | ORIGINAL_REQUEST §R4 | 5 tests | 5 tests | ✓ (T3-4, T3-10) | ✓ (S1, S5) |
| 9 | R4.2 Automated Ad Lead Simulator | ORIGINAL_REQUEST §R4 | 5 tests | 5 tests | ✓ (T3-4, T3-11) | ✓ (S1, S5) |
| 10| R5.1 Lead Screening & DB Tagging | ORIGINAL_REQUEST §R5 | 5 tests | 5 tests | ✓ (T3-5, T3-10) | ✓ (S1, S5) |
| 11| R5.2 Real-Time Agent Panel Notifications | ORIGINAL_REQUEST §R5 | 5 tests | 5 tests | ✓ (T3-5, T3-11) | ✓ (S1, S5) |

## Test Architecture
- **Directory Location**: `/Users/newholland/1234567/tests/e2e/`
- **Test Runner Command**: `node tests/e2e/runner.mjs`
- **Pass/Fail Semantics**: The runner executes all test modules in sequence, aggregates results into standard JSON/console summaries, exits with code `0` on 100% pass, and non-zero exit code on any failure.
- **Suite Layout**:
  - `tests/e2e/runner.mjs` — Main test execution framework and summary reporter
  - `tests/e2e/tier1_feature_coverage.test.mjs` — Tier 1 Feature Coverage Suite (55 test cases)
  - `tests/e2e/tier2_boundary_corner.test.mjs` — Tier 2 Boundary & Corner Case Suite (55 test cases)
  - `tests/e2e/tier3_cross_feature.test.mjs` — Tier 3 Cross-Feature Pairwise Suite (11 test cases)
  - `tests/e2e/tier4_real_world.test.mjs` — Tier 4 Real-World Application Suite (5 scenario test cases)

---

## Detailed Test Specifications

### Tier 1: Feature Coverage (55 Tests — 5 per feature)
- **R1.1 3D Glassmorphic Header Stats (T1-R1.1-1 .. 5)**:
  1. Render "Scheduled" card with count value and 3D glass container class (`apple-3d-card`/`apple-glass-dark`).
  2. Render "Rescheduled" card with metric styling and neon accent border.
  3. Render "Canceled" card with status count and glassmorphic styling.
  4. Verify header stats grid layout responsiveness under varying container widths.
  5. Verify numerical metric formatting in stats cards (e.g. integer counts, standard typography).
- **R1.2 Meetings Dashboard Tabs (T1-R1.2-1 .. 5)**:
  1. Click "Upcoming" tab and verify active selection state and filtered meeting list.
  2. Click "Previous" tab and verify display of past meetings.
  3. Click "Personal room" tab and verify personal meeting link/room view.
  4. Click "Templates" tab and verify rendering of meeting template items.
  5. Verify tab switching maintains selected state without page refresh.
- **R1.3 Schedule List & Controls (T1-R1.3-1 .. 5)**:
  1. Verify schedule list rows display meeting title, date/time, and timezone.
  2. Verify attendee avatars render correctly for each meeting row.
  3. Toggle interactive "Recording" switch ON for a meeting row and verify state change.
  4. Toggle "Recording" switch OFF and verify toggle state reverts.
  5. Verify meeting list action buttons (join, edit, cancel) are present and interactive.
- **R2.1 Animated Analytics Charts (T1-R2.1-1 .. 5)**:
  1. Verify Recharts component mounts and renders SVG chart paths.
  2. Verify Framer Motion container applies initial animation properties (opacity/transform).
  3. Trigger hover event on chart data point and verify tooltip element renders with correct values.
  4. Verify bar/line chart series update when dataset state changes.
  5. Verify multi-series charts display legend labels corresponding to data dimensions.
- **R2.2 Neon Glow Dashboard Integration (T1-R2.2-1 .. 5)**:
  1. Verify neon glow CSS classes (`pulse-glow-blue`, neon card borders) apply to analytics containers.
  2. Verify dark theme color variables match CRM design system (dark background, high-contrast neon accents).
  3. Verify chart grid lines and axes adhere to dark theme styling.
  4. Verify chart card headers feature glowing icon indicators.
  5. Verify responsive reflow of analytics chart widgets in dashboard grid.
- **R3.1 Connected SignalWire Outbound Dialer (T1-R3.1-1 .. 5)**:
  1. Submit dial request to `/api/signalwire/call` with valid target phone number.
  2. Verify backend reads SignalWire environment credentials (`SIGNALWIRE_PROJECT_ID`, `SIGNALWIRE_API_TOKEN`, `SIGNALWIRE_SPACE_URL`).
  3. Verify API response returns success status and generated call SID/id.
  4. Verify softphone UI transitions to "Calling" state upon initiating call.
  5. Verify softphone UI provides functional "Hangup" control during active call.
- **R3.2 Telephony Call State DB Logging (T1-R3.2-1 .. 5)**:
  1. Verify outbound call placement creates a new record in `telephony_calls` table/store.
  2. Verify call log entry captures phone number, timestamp, direction ('outbound'), and initial status ('initiated').
  3. Verify call state update ('in-progress', 'completed') updates existing DB record.
  4. Verify call duration is computed and recorded upon call termination.
  5. Verify GET `/api/signalwire/calls` (or call log endpoint) returns historical call records.
- **R4.1 Campaign Webhook Endpoint (T1-R4.1-1 .. 5)**:
  1. Send POST request to `/api/webhooks/campaigns` with Meta lead payload.
  2. Send POST request with Google ad lead payload.
  3. Send POST request with TV ad lead payload.
  4. Verify endpoint returns HTTP 200/201 with `{ success: true, lead_id: ... }`.
  5. Verify lead payload data (name, email, phone, financial metrics) is stored in DB/memory store.
- **R4.2 Automated Ad Lead Simulator (T1-R4.2-1 .. 5)**:
  1. Verify ad simulator process can be started/initialized.
  2. Verify simulator generates randomized valid payloads for Meta channel.
  3. Verify simulator generates randomized valid payloads for Google channel.
  4. Verify simulator generates randomized valid payloads for TV channel.
  5. Verify simulator posts payloads periodically to `/api/webhooks/campaigns`.
- **R5.1 Lead Screening & DB Tagging (T1-R5.1-1 .. 5)**:
  1. Submit lead meeting asset volume >= $250k, income >= $100k, credit >= 700 -> verify tagged "Qualified".
  2. Submit lead with asset volume < $250k -> verify tagged "Disqualified".
  3. Submit lead with income < $100k -> verify tagged "Disqualified".
  4. Submit lead with credit score < 700 -> verify tagged "Disqualified".
  5. Verify lead record in DB contains updated status and qualification reason string.
- **R5.2 Real-Time Agent Panel Notifications (T1-R5.2-1 .. 5)**:
  1. Connect WebSocket client to `/ws` endpoint.
  2. Ingest lead -> verify WebSocket server broadcasts `LEAD_QUALIFIED` event.
  3. Verify event payload contains `lead_id`, `name`, `status`, and `custom_details`.
  4. Verify agent panel UI handles incoming WebSocket event and updates live feed.
  5. Verify multiple connected WebSocket clients all receive qualification broadcast simultaneously.

### Tier 2: Boundary & Corner Cases (55 Tests — 5 per feature)
- **R1.1 Header Stats BVA (T2-R1.1-1 .. 5)**:
  1. Zero meetings scheduled/canceled -> verify "0" displays cleanly without layout collapse.
  2. 99,999+ meetings count -> verify text truncates/formats properly without overflow.
  3. Rapid stats update -> verify layout stability during rapid value changes.
  4. Null/missing stats payload -> fallback to 0 gracefully without crash.
  5. Extremely long label strings -> verify text wraps/clips cleanly.
- **R1.2 Dashboard Tabs BVA (T2-R1.2-1 .. 5)**:
  1. Empty list for "Previous" tab -> display empty state message ("No previous meetings").
  2. Rapid tab switching (10 clicks/sec) -> correct active tab state without race conditions.
  3. Keyboard navigation (Tab / Arrow keys) across meeting tabs.
  4. Direct URL hash/query navigation to tab (e.g. `?tab=templates`).
  5. Tab rendering under narrow mobile screen resolution (320px).
- **R1.3 Schedule List BVA (T2-R1.3-1 .. 5)**:
  1. Meeting title with 250+ characters -> verify title truncation with ellipsis.
  2. 20+ attendee avatars -> verify avatar overflow badge (`+15`).
  3. Meeting scheduled across midnight / timezone boundary (UTC vs EST).
  4. Rapid toggle of "Recording" switch -> debounce or consistent state persistence.
  5. Special characters in meeting title (`<script>`, quotes, unicode emojis).
- **R2.1 Analytics Charts BVA (T2-R2.1-1 .. 5)**:
  1. Empty dataset `[]` -> render chart axes with empty state notice, no JS errors.
  2. Single data point -> render single bar/point without mathematical division-by-zero errors.
  3. Negative financial metric values -> render negative Y-axis correctly.
  4. Extremely large numbers ($1B+) -> format Y-axis tick labels (e.g., "$1B").
  5. Window resize during Framer Motion entry animation -> chart redraws responsively.
- **R2.2 Neon Glow BVA (T2-R2.2-1 .. 5)**:
  1. High contrast / dark mode toggling -> neon styles adapt seamlessly.
  2. Low performance device (reduced motion setting `prefers-reduced-motion`) -> disable heavy CSS glows/animations.
  3. Overlapping chart card boundaries -> zero z-index bleed or clipped tooltips.
  4. Custom color theme override -> fallback to default neon blue/cyan palette.
  5. Browser zoom at 200% -> neon borders and chart containers scale without clipping.
- **R3.1 SignalWire Dialer BVA (T2-R3.1-1 .. 5)**:
  1. Invalid phone number format (`abc`, `123`) -> endpoint returns HTTP 400 with error message.
  2. Missing SignalWire environment variables -> API returns graceful HTTP 500 error ("SignalWire credentials missing").
  3. Network timeout to SignalWire API -> client displays error toast notification.
  4. Duplicate simultaneous call attempt on same extension -> reject second call cleanly.
  5. International phone number format (`+44 20 7946 0912`) -> format and process call correctly.
- **R3.2 Call Logging BVA (T2-R3.2-1 .. 5)**:
  1. Very long call duration (8+ hours / 28,800s) -> verify duration field handles large integers.
  2. Failed call attempt (status 'failed'/'busy'/'no-answer') -> log status accurately in DB.
  3. Database disconnection during call -> queue or log error cleanly without crashing API server.
  4. Special characters in client name / call notes -> sanitize before SQL insertion.
  5. Concurrent call logs (100 simultaneous calls) -> DB handles transaction locking without deadlocks.
- **R4.1 Webhook Endpoint BVA (T2-R4.1-1 .. 5)**:
  1. Malformed JSON payload -> return HTTP 400 Bad Request.
  2. Missing required field (`lead.email` or `annual_income`) -> return HTTP 422 Unprocessable Entity.
  3. Payload size > 1MB -> return HTTP 413 Payload Too Large.
  4. Unexpected extra fields in payload -> ignore unknown keys and process lead.
  5. Invalid channel type (`"channel": "tiktok"`) -> reject or handle unknown channel.
- **R4.2 Ad Simulator BVA (T2-R4.2-1 .. 5)**:
  1. Webhook endpoint down/unreachable -> simulator logs warning and retries without crashing process.
  2. High-frequency burst mode (50 payloads/sec) -> simulator maintains steady execution.
  3. Boundary financial values (income = $0, assets = $0, credit = 300) -> generate valid extreme payloads.
  4. Simulator start/stop signal handling -> clean graceful shutdown on SIGINT/SIGTERM.
  5. Memory usage over 1,000 simulated leads -> verify zero memory leaks in simulator loop.
- **R5.1 Lead Qualification BVA (T2-R5.1-1 .. 5)**:
  1. Asset volume exactly at threshold ($250,000.00) -> evaluate as Qualified.
  2. Credit score exactly at 700 -> evaluate as Qualified; 699 -> Disqualified.
  3. Annual income exactly $100,000 -> Qualified; $99,999 -> Disqualified.
  4. Negative asset volume / income -> Disqualified with clear reason message.
  5. Non-numeric financial values (`"income": "N/A"`) -> handle gracefully without NaN exceptions.
- **R5.2 WebSocket Notifications BVA (T2-R5.2-1 .. 5)**:
  1. Client disconnects abruptly during event emission -> server handles socket drop without unhandled rejection.
  2. 500 concurrent WebSocket subscriber clients -> event broadcast delivered to all active sockets within 100ms.
  3. Malformed WebSocket message from client -> server ignores or returns error frame.
  4. Client reconnect after network loss -> receive latest lead status snapshot.
  5. WebSocket payload serialization error -> fallback logging without dropping connection.

### Tier 3: Cross-Feature Combinations (11 Pairwise Tests)
- **T3-1 (R1.1 + R1.2)**: Header Stats update dynamically when switching between Meeting Dashboard Tabs.
- **T3-2 (R2.1 + R2.2)**: Animated Analytics Charts maintain neon glow hover tooltips during dark theme transitions.
- **T3-3 (R3.1 + R3.2)**: Placing an outbound call via SignalWire dialer immediately writes an initial call record to DB and updates status on disconnect.
- **T3-4 (R4.1 + R1.1)**: Campaign webhook receiving new leads updates CRM activity summary stats in header.
- **T3-5 (R5.1 + R5.2)**: Lead qualification engine screening a lead triggers real-time WebSocket `LEAD_QUALIFIED` event broadcast.
- **T3-6 (R1.3 + R2.1)**: Toggling "Recording" switch on schedule list correlates with meeting recording analytics chart data point.
- **T3-7 (R2.2 + R5.2)**: Incoming real-time WebSocket lead notification triggers a neon glow pulse animation on the Agent Panel widget.
- **T3-8 (R3.1 + R5.1)**: Outbound dialer pre-populates client financial qualification status when calling a lead.
- **T3-9 (R3.2 + R4.1)**: Lead ingested via campaign webhook links subsequent outbound call logs by `lead_id` in DB.
- **T3-10 (R4.1 + R5.1)**: Webhook payload ingestion synchronously invokes Qualification Engine to populate `status` ('Qualified'/'Disqualified') in API response.
- **T3-11 (R4.2 + R5.2)**: Automated Ad Lead Simulator streaming payloads continuously drives real-time WebSocket notification stream on connected agent panels.

### Tier 4: Real-World Application Scenarios (5 Scenarios)

| # | Scenario ID | Scenario Name | Features Exercised | Complexity | Description |
|---|-------------|---------------|--------------------|------------|-------------|
| 1 | S1 | Automated Campaign Lead Pipeline E2E | R4.1, R4.2, R5.1, R5.2 | High | Simulator streams ad payloads -> Webhook ingests -> Qualification engine screens -> DB updates status -> WebSocket notifies agent panel in real time. |
| 2 | S2 | Client Outbound Telephony & Call Logging Lifecycle | R3.1, R3.2, R5.1 | High | Agent views qualified lead -> Clicks dialer to place SignalWire call -> Call connects and logs state in DB -> Call ends and updates duration and logs. |
| 3 | S3 | CRM Meetings Scheduling & Recording Workspace | R1.1, R1.2, R1.3 | Medium | User views 3D header stats -> Filters upcoming meetings -> Toggles recording switch -> Navigates between Personal Room and Templates tabs. |
| 4 | S4 | Real-Time Neon Analytics Dashboard Monitoring | R2.1, R2.2, R5.2 | Medium | Dashboard displays animated neon Recharts -> Ingested lead events update chart metrics live -> Hover tooltips display detailed financial figures. |
| 5 | S5 | Full Financial CRM Multi-Channel Workflow | R1.1-R1.3, R2.1-R2.2, R3.1-R3.2, R4.1-R4.2, R5.1-R5.2 | Critical | Complete integration run: Ad simulator generates leads, real-time qualification triggers alerts, agent dials lead via SignalWire, schedules follow-up meeting, and views analytics. |

---

## Coverage Thresholds
- **Tier 1 (Feature Coverage)**: 55 tests (11 features × 5 test cases)
- **Tier 2 (Boundary & Corner)**: 55 tests (11 features × 5 test cases)
- **Tier 3 (Cross-Feature Pairwise)**: 11 tests (major feature interactions)
- **Tier 4 (Real-World Scenarios)**: 5 tests (end-to-end workflows)
- **Total Test Suite Count**: **126 test cases**
