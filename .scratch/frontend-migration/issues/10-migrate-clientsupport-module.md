# 10 — Migrate ClientSupport module

**What to build:** The ClinetSupport module is renamed to ClientSupport, all typos in filenames are fixed, the 5-useState modal pattern is consolidated, and the 95%-identical FeedbackStatusSelector/TypeSelector are merged into a generic InlineSelector.

**Blocked by:** 01 — Fix critical runtime bugs, 02 — Remove redundant dependencies

**Status:** ready-for-agent

- [ ] Rename directory from ClinetSupport/ to ClientSupport/
- [ ] Rename DashboardINdex.jsx to DashboardIndex.jsx (fix INdex typo)
- [ ] Rename FeedBackAttchment.jsx to FeedbackAttachment.jsx (fix Attchment typo)
- [ ] Rename FeedBackCommonet.jsx to FeedbackComment.jsx (fix Commonet typo)
- [ ] Standardize FeedBack prefix to Feedback across all files (FeedBackDetails -> FeedbackDetails, FeedBackForm -> FeedbackForm, etc.)
- [ ] Fix pagenation prop typo to pagination in FeedBackIndex.jsx
- [ ] Fix clinetInfo to clientInfo throughout the module
- [ ] Consolidate 5 separate useState calls in FeedBackIndex.jsx into single modal state object { open, mode, data }
- [ ] Merge FeedBackStatusSelector.jsx and FeedBackTypeSelector.jsx into one generic InlineSelector component at common/InlineSelector.jsx (~270 lines -> ~140 lines)
- [ ] Consolidate 3 copies of formatFileSize into single utility at utils/file.utils.js
- [ ] Remove useEffect-based error toasting pattern (DashboardIndex.jsx:25, FeedBackIndex.jsx:36, FeedBackDetails.jsx:28)
- [ ] Create hooks/ — useClientSupportData.js, useFeedbackForm.js, useFeedbackFilter.js
- [ ] Create constants/clientSupport.constants.js — extract from utils.js files
- [ ] Create validation/feedback.schema.js — extract validation from utils.js
- [ ] Update all imports across the codebase that reference the old ClinetSupport path
- [ ] Update route paths in FeedbackRoutes.jsx
- [ ] Verify feedback dashboard renders correctly
- [ ] Verify feedback CRUD (create, view details, edit, delete) works end-to-end
- [ ] Verify comments and attachments work correctly
