# 08 — Migrate ProfileManagement module

**What to build:** The 830-line god component ProfileManagement.jsx is broken into focused section components following the cafebite-frontend standard. The duplicated schema is consolidated with Authentication's schemas, and dead code is removed.

**Blocked by:** 01 — Fix critical runtime bugs, 02 — Remove redundant dependencies

**Status:** ready-for-agent

- [ ] Create ProfileManagementIndex.jsx as the module entry point
- [ ] Create components/PersonalInfoSection.jsx — extract personal info form section
- [ ] Create components/CafeInfoSection.jsx — extract cafe info form section
- [ ] Create components/LocationSection.jsx — extract location form section
- [ ] Create components/ContactSection.jsx — extract contact form section
- [ ] Create components/SocialMediaSection.jsx — extract social media form section
- [ ] Create components/SubscriptionSection.jsx — extract subscription status section
- [ ] Create hooks/useProfileData.js — TanStack Query hooks for profile data
- [ ] Create hooks/useProfileForm.js — RHF setup with zod resolver
- [ ] Create constants/profile.constants.js — extract options, labels, enums
- [ ] Create validation/profile.schema.js — zod-only schema, consolidated with shared schemas from Authentication (no duplication)
- [ ] Remove ~130 lines of commented-out code (Razorpay links, payment button, Quick Stats)
- [ ] Deduplicate form.reset() logic — onSubmit and handleCancel share identical 20-line reset blocks, extract to a single function
- [ ] Verify all profile sections render and submit correctly
- [ ] Verify profile update works end-to-end
