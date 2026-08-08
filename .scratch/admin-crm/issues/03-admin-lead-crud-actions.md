# 03 — Create, Edit, & Delete Target Client Lead Profiles

**What to build:**
Full CRUD modal and forms for target restaurant leads. Admins can open a "Create Lead" modal to enter restaurant name, address, location, Google Maps URL, phone number, initial status, and initial notes. Admins can also open an "Edit Lead" modal to modify existing lead details or change pipeline status (e.g. from `Visit Scheduled` to `Closed Won`), as well as delete inactive/cancelled leads.

**Blocked by:** 02 — Target Restaurant Leads Core Management & Pipeline Table

**Status:** ready-for-agent

## Acceptance criteria

- [ ] Backend provides POST `/v1/admin/leads`, PUT `/v1/admin/leads/:leadId`, and DELETE `/v1/admin/leads/:leadId` endpoints with express-validator validation.
- [ ] Clicking "Add Lead" opens a form dialog validating name, phone number, and location fields.
- [ ] Submitting a new lead creates a database record, closes modal, shows a success toast, and refreshes the table via TanStack Query invalidation.
- [ ] Clicking "Edit" on a lead populates the form dialog with existing lead details for editing.
- [ ] Updating status instantly updates table status badge and summary statistics.
- [ ] Delete lead button prompts for confirmation before removing lead.
