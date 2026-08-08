# 02 — Target Restaurant Leads Core Management & Pipeline Table

**What to build:**
End-to-end Lead CRM management page at `/admin/leads`. Admins can view target client/restaurant leads in a responsive table with status badges (`Call Needed`, `Follow Up`, `Visit Scheduled`, `Visited`, `Closed Won`, `Closed Lost`), search leads by restaurant name or city, filter leads by pipeline status, click phone numbers to initiate calls (`tel:` links), and click Google Maps icons to open direct navigation links.

**Blocked by:** 01 — Admin TOTP Authentication & Route Protection

**Status:** completed

## Acceptance criteria

- [x] Database migration creates `admin_leads` table with necessary columns.
- [x] Backend provides GET `/v1/admin/leads` API with support for search query and status filter.
- [x] Frontend displays Lead Management dashboard table with real-time stats cards (Total Leads, Follow-ups Pending, Visits Scheduled, Closed Won).
- [x] Status filter tabs accurately isolate leads in specific sales stages.
- [x] Search input dynamically filters leads by name or location.
- [x] Phone numbers render as clickable `tel:` links for immediate dialing.
- [x] Google Maps URLs render as icon buttons opening Google Maps in a new browser tab.
