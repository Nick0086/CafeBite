# 04 — Migrate Dashboard module

**What to build:** The Dashboard module conforms to the cafebite-frontend standard folder structure. Hardcoded metrics are moved to constants, commented-out chart code is removed, and metrics data is fetched via TanStack Query instead of being hardcoded strings.

**Blocked by:** 01 — Fix critical runtime bugs, 02 — Remove redundant dependencies

**Status:** ready-for-agent

- [ ] Create DashboardIndex.jsx as the module entry point (rename from Dashboard.jsx)
- [ ] Create components/ subdirectory, move MetricCard.jsx into it
- [ ] Create hooks/useDashboardData.js for TanStack Query hooks (metrics data fetching)
- [ ] Create constants/dashboard.constants.js — move hardcoded metric definitions (titles, values, icons) out of the component
- [ ] Remove ~70 lines of commented-out chart/trend code from Dashboard.jsx
- [ ] Replace hardcoded metric values ('30', '20', '3000') with actual API data or clear placeholder pattern
- [ ] Verify Dashboard renders correctly with the new structure
- [ ] Verify no imports from other modules are broken by the rename/restructure
