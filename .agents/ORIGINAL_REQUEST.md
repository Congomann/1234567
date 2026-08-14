# Original User Request

## Initial Request — 2026-08-12T23:32:11-05:00

<USER_REQUEST>
This project implements a major system upgrade for the New Holland Financial CRM. It introduces a 3D-inspired glassmorphic meetings dashboard, animated analytics widgets, a fully connected SignalWire outbound dialer, and an automated real-time ad lead ingestion and qualification pipeline.

Working directory: /Users/newholland/1234567
Integrity mode: demo

## Requirements

### R1. 3D Glassmorphic Meetings Dashboard
Implement a calendar and meetings panel inside the CRM based on the provided reference design.
- **Header Stats:** Render statistics cards ("Scheduled", "Rescheduled", "Canceled") styled with modern 3D glassmorphic styling, neon cards, and rounded layouts matching the screenshot.
- **Tabs & Timeline:** Add functional tabs for "Upcoming", "Previous", "Personal room", and "Templates".
- **Schedule list:** Display upcoming meeting rows showing the meeting title, date/time, timezone, attendee avatars, and an interactive "Recording" toggle switch.

### R2. Animated Analytics Charts
Add smooth entry animations and hover tooltips to all core charts on the CRM dashboard.
- Integrate charting libraries (e.g., Recharts) and motion libraries (e.g., Framer Motion) to animate dashboard graphs.
- Visual styles must feature neon glow accents matching the dark theme of the dashboard.

### R3. Fully Connected CRM SignalWire Dialer
Integrate and complete the softphone dialer in the CRM.
- Leverage the live SignalWire credentials (`SIGNALWIRE_PROJECT_ID`, `SIGNALWIRE_API_TOKEN`, `SIGNALWIRE_SPACE_URL`, `SIGNALWIRE_PHONE_NUMBER`) from the server environment.
- Outbound calling from the CRM softphone dialer must make a real API connection to SignalWire to place calls to the target client and record call state logs in the database.

### R4. Automated Ad Campaign Lead Ingestion
Create a real-time lead ingestion system for marketing campaigns.
- Expose webhook endpoints (`/api/webhooks/campaigns`) to receive lead generation payloads.
- Run a background simulator loop that periodically streams mock lead payloads from Meta, Google, and TV ads.

### R5. Real-Time CRM Lead Qualification Engine
Implement an automated lead qualification system inside the CRM.
- Assess incoming leads in real time based on custom financial criteria (e.g., asset volume, income thresholds, credit score).
- Automatically flag and tag leads as "Qualified" or "Disqualified" in the CRM database, notifying the agent panel.

## Acceptance Criteria

### Meetings UI & Charts
- [ ] The meetings scheduler UI renders with 3D glassmorphic cards and interactive tabs matching the reference screenshot.
- [ ] Dashboard charts animate smoothly on loading and display values on hover.

### Connected SignalWire Dialer
- [ ] Softphone dialer makes outbound API requests to SignalWire using environment credentials.
- [ ] Call logs and states are correctly inserted into the CRM database.

### Real-Time Campaign Ingestion
- [ ] Webhook `/api/webhooks/campaigns` accepts lead generation payloads.
- [ ] Background simulator automatically pings lead payloads simulating Meta, Google, and TV ad channels.
- [ ] Lead status in the CRM updates to "Qualified" or "Disqualified" in real time based on screening criteria.
</USER_REQUEST>
