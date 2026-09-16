# Add Carrier API Integrations

## 1. Create Data Model / Backend
- We need a table to store carrier API credentials. We can use `DB` to store `carrier_api_keys` (or similar).

## 2. Create `pages/admin/CarrierIntegrations.tsx`
- A UI where the Super Admin can:
  - Add a new Carrier API connection
  - Select Carrier (e.g., Transamerica, Protective, Ethos, Root)
  - Input `Client ID`, `Client Secret`, `API Key`, `Endpoint URL`
  - See Connection Status and Last Sync time for policy activities
  - Toggle between Sandbox and Production modes

## 3. Register the Route in `src/App.tsx`
- Path: `/crm/admin/carrier-apis`
- Label it "Carrier API Connections" in the Admin sidebar (probably `components/crm/Sidebar.tsx` or similar).

## 4. Policy Activity Tracking Context
- When a webhook or sync hits, it's meant to update policies. We can just add a mock sync button on the UI that updates "Last Sync" and simulates fetching policy activities (e.g., Application Pending, Policy Issued, Commission Paid) into a log.
