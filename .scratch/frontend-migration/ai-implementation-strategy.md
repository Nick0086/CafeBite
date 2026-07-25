# AI Implementation Strategy: Frontend Migration

## Overall Implementation Roadmap

This strategy breaks the 18-ticket frontend migration into **7 implementation batches**, each designed to fit within a single AI conversation while maintaining context quality and implementation accuracy.

**Total estimated time:** 30-45 hours across 7 conversations
**Recommended tickets per conversation:** 2-4 tickets maximum
**Context preservation strategy:** Each batch ends with a structured handoff document

---

## Ticket Grouping Table

| Batch | Tickets | Scope | Est. Time | Dependencies | Risk Level |
|-------|---------|-------|-----------|--------------|------------|
| **1** | 01, 02 | Foundation: Bug fixes + dependency cleanup | 3-5 hrs | None | Medium |
| **2** | 03 | Design token architecture | 4-6 hrs | Batch 1 | Medium |
| **3** | 04, 05, 07 | Simple modules: Dashboard, Sidebar, QrCode | 4-6 hrs | Batch 1 | Low |
| **4** | 06, 08, 09 | Medium modules: Auth, Profile, CustomerMenu | 6-8 hrs | Batch 1 | High |
| **5** | 10, 11, 12, 13 | Complex modules: ClientSupport, Menu (all sub-modules) | 10-14 hrs | Batch 1 | High |
| **6** | 14, 15, 16 | Cross-cutting: Shared components, services, common | 5-7 hrs | Batches 3-5 | Medium |
| **7** | 17, 18 | Final: Routing + PWA | 2-3 hrs | Batch 6 | Low |

**Why this grouping?**

- **Batch 1** combines two small, independent foundation tickets
- **Batch 2** is isolated because design tokens require deep focus on CSS/config
- **Batch 3** groups three simple modules (minimal complexity, similar patterns)
- **Batch 4** groups three medium modules (Auth is complex but standalone)
- **Batch 5** is the largest batch — Menu sub-modules are tightly coupled, so they must be done together
- **Batch 6** consolidates all cross-cutting concerns after modules are stable
- **Batch 7** wraps up with routing and PWA (small, independent)

---

## Conversation Strategy

### When to Start a New Chat

Start a new conversation when:

1. **Context length warning** — If the conversation exceeds ~50 messages or the AI starts forgetting earlier context
2. **Batch completion** — After each batch is fully implemented and reviewed
3. **Architecture shift** — When moving from one module domain to another (e.g., Auth -> Menu)
4. **Error cascade** — If implementation errors compound and the AI is struggling to recover
5. **Natural checkpoint** — After a review checkpoint passes successfully

### Criteria for Continuing in Same Chat

Continue in the same conversation when:

1. **Tickets are tightly coupled** — e.g., Menu sub-modules (11, 12, 13) share the same shell
2. **Context is still fresh** — Less than 30 messages, AI is tracking well
3. **No major errors** — Implementation is proceeding smoothly
4. **Same domain** — Working within the same module or feature area

### Maximum Tickets Per Conversation

| Ticket Complexity | Max per Conversation |
|-------------------|---------------------|
| Small (bug fixes, renames) | 3-4 tickets |
| Medium (single module migration) | 2-3 tickets |
| Large (complex module, cross-cutting) | 1-2 tickets |

---

## Master Prompts

### Batch 1: Foundation (Tickets 01 + 02)

#### Implementation Prompt

```
You are implementing tickets 01 and 02 from the frontend migration plan.

**Goal:** Fix all critical runtime bugs and remove redundant dependencies to create a stable foundation for the migration.

**Before you start:**
1. Read `.scratch/frontend-migration/issues/01-fix-critical-runtime-bugs.md`
2. Read `.scratch/frontend-migration/issues/02-remove-redundant-dependencies.md`
3. Read `docs/guide/frontend/README.md` to understand project conventions
4. Load the `cafebite-frontend` skill for coding standards

**Files to inspect first:**
- `frontend/src/components/Sidebar/Sidebar.jsx` (hooks-after-return bug)
- `frontend/src/components/Table-QrCode/table-qrcodeForm.jsx` (undefined function)
- `frontend/src/utils/blobHealthCheck.js` (missing import)
- `frontend/src/components/Menu/MenuItems/MenuItemForm.jsx` (undefined variable)
- `frontend/src/components/Authentication/Registration/Contact.jsx` (duplicate field)
- `frontend/src/components/Menu/MenuIndex.jsx` (missing return)
- `frontend/package.json` (dependencies to remove)

**Implementation rules:**
- Fix ONLY the issues listed in the tickets — no additional refactoring
- Preserve backward compatibility — do not change APIs or component interfaces
- Follow existing code style and conventions
- Use `@/` path alias for all imports
- Test each fix individually before moving to the next
- For dependency removal: replace usage first, then remove from package.json

**Acceptance criteria:**
- All 10 items in ticket 01 are fixed and verified
- All 7 items in ticket 02 are completed
- App builds without errors
- No runtime crashes on any route
- Bundle size decreased after dependency removal

Start by reading the ticket files, then inspect the listed files, then implement fixes one by one.
```

#### Review Prompt (After Implementation)

```
Review the implementation of tickets 01 and 02.

**Check:**
1. All 10 bug fixes from ticket 01 are implemented correctly
2. All 7 dependency removals from ticket 02 are complete
3. No new bugs were introduced
4. Code follows cafebite-frontend conventions
5. All imports use `@/` alias correctly
6. No dead code or commented-out blocks remain
7. App builds successfully with `npm run build`
8. No lint errors with `npm run lint`

**Verify:**
- Sidebar: hooks are called before any conditional returns
- table-qrcodeForm: getFormSchema() is defined and returns a valid zod schema
- blobHealthCheck: imageCache is imported correctly
- MenuItemForm: categoryName is replaced with menuItemName
- Contact.jsx: socialTwitter field is bound correctly (not socialFacebook twice)
- MenuIndex: hideTabs conditional returns JSX correctly
- All process.env.NODE_ENV replaced with import.meta.env.DEV
- CSS variables are valid (no double %%, --container defined)
- moment, yup, motion, sonner removed from package.json
- services/ renamed to lib/ or utils/

Report any issues found. If all checks pass, confirm completion.
```

#### Testing Prompt

```
Generate a comprehensive test plan for tickets 01 and 02.

**Manual test cases:**
1. Navigate to every route — verify no crashes
2. Login with password — verify redirect works
3. Login with OTP — verify redirect works
4. Create a QR code — verify form doesn't crash
5. Update a menu item — verify success toast appears
6. Register a new user — verify all 4 steps work, Twitter handle is saved
7. Check browser console — verify no ReferenceErrors or undefined variable errors
8. Check bundle size — verify it decreased after dependency removal

**Edge cases:**
- What happens if localStorage is disabled?
- What happens if API returns 401?
- What happens if form validation fails?
- What happens if image cache is corrupted?

**Regression scenarios:**
- Verify auth flow still works (login, logout, session check)
- Verify all CRUD operations still work (categories, menu items, templates, QR codes, feedback)
- Verify dark mode still works (if implemented)
- Verify PWA service worker still registers

List all test cases with expected outcomes.
```

#### Completion Prompt

```
Tickets 01 and 02 are complete. Create a handoff document for the next conversation.

**Handoff document should include:**
1. Summary of what was fixed/removed
2. List of files modified
3. Any issues encountered and how they were resolved
4. Verification that all acceptance criteria are met
5. Notes for the next batch (ticket 03: design tokens)

Save this as `.scratch/frontend-migration/handoffs/batch-1-handoff.md`.

Then confirm: "Batch 1 complete. Ready to start Batch 2 (ticket 03: design tokens) in a new conversation."
```

---

### Batch 2: Design Tokens (Ticket 03)

#### New Chat Prompt (Start of Batch 2)

```
You are starting a new conversation to implement ticket 03 from the frontend migration plan.

**Context:**
- Batch 1 (tickets 01 + 02) is complete — all critical bugs fixed, redundant dependencies removed
- Read the handoff: `.scratch/frontend-migration/handoffs/batch-1-handoff.md`
- Read ticket 03: `.scratch/frontend-migration/issues/03-fix-design-token-architecture.md`

**Project knowledge to retain:**
- Tech stack: Vite 6, React 18, Tailwind CSS 3, shadcn/ui
- Path alias: `@/` maps to `./src/`
- Design system follows three-layer token architecture: primitive -> semantic -> component
- All tokens defined as CSS custom properties in `src/index.css`
- Tailwind config maps semantic tokens to utility classes

**What NOT to repeat:**
- Don't re-read the entire codebase — focus on design token files
- Don't refactor components — only fix token architecture

**Goal:** Fix the design token architecture so that:
- primary color collision is resolved
- all custom semantic tokens have dark mode overrides
- --container CSS variable is defined
- --sidebar-background double percent is fixed
- Tailwind config is the single source of truth

**Files to inspect:**
- `frontend/src/index.css` (CSS variables)
- `frontend/tailwind.config.js` (token mapping)
- `frontend/src/App.css` (--container reference)

**Implementation rules:**
- Follow design-system skill conventions
- Use HSL format for all color tokens
- Ensure dark mode overrides ALL custom semantic tokens
- Test dark mode visually after changes

Load the `design-system` skill for token architecture guidance.

Start by reading the handoff and ticket, then inspect the files, then implement.
```

#### Implementation Prompt (If continuing in same chat)

```
Implement ticket 03: Fix design token architecture.

**Goal:** Resolve the primary color collision, add dark mode overrides for all custom semantic tokens, fix CSS variable issues, and ensure Tailwind config is the single source of truth.

**Before you start:**
1. Read `.scratch/frontend-migration/issues/03-fix-design-token-architecture.md`
2. Load the `design-system` skill
3. Inspect `frontend/src/index.css`, `frontend/tailwind.config.js`, `frontend/src/App.css`

**Implementation rules:**
- Follow three-layer token architecture: primitive -> semantic -> component
- Use HSL format for all color tokens
- Ensure dark mode overrides ALL custom semantic tokens
- Test that Tailwind utility classes resolve correctly

**Acceptance criteria:**
- All 8 items in ticket 03 are completed
- Dark mode renders correctly with all custom tokens
- Tailwind utility classes (text-primary, bg-brand-primary, etc.) work
- No hardcoded HSL values in custom box shadows (use tokens where possible)

Start by reading the ticket, then inspect the files, then implement.
```

---

### Batch 3: Simple Modules (Tickets 04, 05, 07)

#### New Chat Prompt

```
You are starting a new conversation to implement tickets 04, 05, and 07 from the frontend migration plan.

**Context:**
- Batches 1-2 are complete — foundation is stable, design tokens are fixed
- Read handoffs: `.scratch/frontend-migration/handoffs/batch-1-handoff.md` and `batch-2-handoff.md`
- Read tickets: 04 (Dashboard), 05 (Sidebar), 07 (QrCode)

**Project knowledge to retain:**
- Module folder structure: Index.jsx, components/, hooks/, constants/, validation/
- State management: TanStack Query for server data, react-hook-form for forms, single object for modal state
- Service layer: one file per backend module in `src/service/`, all use `api` axios instance
- Validation: zod-only schemas in `validation/` directory
- File naming: PascalCase for components, camelCase for services/hooks/utils

**What NOT to repeat:**
- Don't re-implement design tokens or bug fixes from earlier batches
- Don't refactor unrelated modules

**Goal:** Migrate three simple modules to the cafebite-frontend standard:
- Dashboard: standard structure, constants for metrics, remove dead code
- Sidebar: standard structure, extract sub-components, fix hooks-after-return structurally
- QrCode: rename from Table-QrCode, fix file naming, standard structure

**Files to inspect first:**
- `frontend/src/components/Dashboard/` (current structure)
- `frontend/src/components/Sidebar/` (current structure)
- `frontend/src/components/Table-QrCode/` (current structure)

**Implementation rules:**
- Follow cafebite-frontend skill strictly
- Each module should be a vertical slice — complete and demoable
- Preserve backward compatibility — don't change component interfaces
- Update all imports across the codebase after renaming/moving files
- Test each module individually after migration

Load the `cafebite-frontend` skill for module structure guidance.

Start by reading the tickets, then inspect the current structures, then migrate one module at a time (Dashboard -> Sidebar -> QrCode).
```

---

### Batch 4: Medium Modules (Tickets 06, 08, 09)

#### New Chat Prompt

```
You are starting a new conversation to implement tickets 06, 08, and 09 from the frontend migration plan.

**Context:**
- Batches 1-3 are complete — foundation, tokens, and simple modules are done
- Read handoffs from batches 1-3
- Read tickets: 06 (Authentication), 08 (ProfileManagement), 09 (CustomerMenu)

**Project knowledge to retain:**
- Module folder structure: Index.jsx, components/, hooks/, constants/, validation/
- Auth flow: tokens via axios interceptor, route guards for protected routes, PermissionsContext for RBAC
- Forms: react-hook-form + zod resolver, ReusableFormField for all inputs
- State: single object for modal state { open, mode, data }
- Service layer: centralized localStorage access, no direct window.localStorage in components

**What NOT to repeat:**
- Don't re-migrate modules from batch 3
- Don't change design tokens or routing

**Goal:** Migrate three medium-complexity modules:
- Authentication: standard structure, yup->zod, centralized localStorage, route guards, shared schemas
- ProfileManagement: break 830-line god component into 6 section components, deduplicate schemas
- CustomerMenu: standard structure, consolidate StatusBadge, fix hardcoded currency

**Critical notes:**
- Authentication is HIGH RISK — it's the most critical flow. Test thoroughly.
- ProfileManagement has a lot of dead code — remove it all.
- CustomerMenu has an unused OptimizedMenuItem — decide: integrate or remove.

**Files to inspect first:**
- `frontend/src/components/Authentication/` (current structure, mixed yup+zod)
- `frontend/src/components/ProfileManagement/` (830-line god component)
- `frontend/src/components/CustomerMenu/` (current structure)

**Implementation rules:**
- Follow cafebite-frontend skill strictly
- For Authentication: extract shared schemas to common/validation/ for reuse by ProfileManagement
- For ProfileManagement: break into 6 section components, each <150 lines
- For CustomerMenu: consolidate StatusBadge to common/StatusBadge.jsx
- Test auth flow end-to-end after migration (login, registration, password reset)

Load the `cafebite-frontend` skill.

Start by reading the tickets, then inspect the current structures, then migrate one module at a time (Authentication -> ProfileManagement -> CustomerMenu).
```

---

### Batch 5: Complex Modules (Tickets 10, 11, 12, 13)

#### New Chat Prompt

```
You are starting a new conversation to implement tickets 10, 11, 12, and 13 from the frontend migration plan.

**Context:**
- Batches 1-4 are complete — foundation, tokens, simple/medium modules are done
- Read handoffs from batches 1-4
- Read tickets: 10 (ClientSupport), 11 (Menu + Categories), 12 (MenuItems), 13 (Templates)

**Project knowledge to retain:**
- Module folder structure: Index.jsx, components/, hooks/, constants/, validation/
- Tables: TanStack Table with columns in useMemo, CommonTable for rendering
- Forms: react-hook-form + zod, ReusableFormField
- Menu sub-modules are tightly coupled — they share the MenuIndex shell and tabs
- Template editor uses dnd-kit for drag-and-drop, TemplateContext for state

**What NOT to repeat:**
- Don't re-migrate modules from earlier batches
- Don't change design tokens, routing, or auth flow

**Goal:** Migrate the most complex modules:
- ClientSupport: rename from ClinetSupport, fix all typos, consolidate modal state, merge duplicate selectors
- Menu + Categories: standard structure, extract CommonTableToolbar to common/
- MenuItems: standard structure, fix isDireact/categoryName bugs, remove server-cache-in-useState
- Templates: fix tamplate typo in routes, standard structure, clean up TemplateContext

**Critical notes:**
- This is the LARGEST batch — 4 tickets, ~12-14 hours
- Menu sub-modules (11, 12, 13) are tightly coupled — migrate them together
- ClientSupport has many typos — fix them all in one pass
- Template editor is the most complex component — migrate it last and test thoroughly

**Files to inspect first:**
- `frontend/src/components/ClinetSupport/` (current structure, all typos)
- `frontend/src/components/Menu/` (MenuIndex, Categories, MenuItems, Templates)
- `frontend/src/routes/MenuRoutes.jsx` (tamplate typo)

**Implementation rules:**
- Follow cafebite-frontend skill strictly
- For ClientSupport: fix all typos in one pass (filenames, routes, query keys, variables)
- For Menu: extract CommonTableToolbar to common/ in ticket 11, reuse in 12 and 13
- For MenuItems: fix isDireact -> isDirect, categoryName -> menuItemName
- For Templates: fix tamplate -> template in ALL route paths
- Test each sub-module individually after migration
- Test MenuIndex with all tabs (templates, categories, menu items)

Load the `cafebite-frontend` skill.

Start by reading the tickets, then inspect the current structures, then migrate in order: ClientSupport -> Menu+Categories -> MenuItems -> Templates.
```

#### Continuation Prompt (If context gets too long)

```
Continue implementing tickets 10-13 from the frontend migration plan.

**Current progress:**
- [ ] Ticket 10: ClientSupport — [status: not started / in progress / complete]
- [ ] Ticket 11: Menu + Categories — [status: not started / in progress / complete]
- [ ] Ticket 12: MenuItems — [status: not started / in progress / complete]
- [ ] Ticket 13: Templates — [status: not started / in progress / complete]

**What was completed in the previous conversation:**
[Summarize what was done, any issues encountered, files modified]

**What remains:**
[List the remaining tickets and their acceptance criteria]

**Context to retain:**
- Module folder structure: Index.jsx, components/, hooks/, constants/, validation/
- Menu sub-modules share MenuIndex shell and tabs
- CommonTableToolbar was extracted to common/ in ticket 11
- Template editor uses dnd-kit, TemplateContext for state

**Next steps:**
[Specify which ticket to implement next and what files to inspect]

Continue with [ticket X]. Read the ticket file, inspect the current structure, then implement.
```

---

### Batch 6: Cross-Cutting (Tickets 14, 15, 16)

#### New Chat Prompt

```
You are starting a new conversation to implement tickets 14, 15, and 16 from the frontend migration plan.

**Context:**
- Batches 1-5 are complete — all modules are migrated to the standard
- Read handoffs from batches 1-5
- Read tickets: 14 (Consolidate shared components), 15 (Standardize service layer), 16 (Standardize common components)

**Project knowledge to retain:**
- Shared components go in `src/common/`
- Service files go in `src/service/`, one per backend module, camelCase naming
- Common components use PascalCase, named exports
- All imports use `@/` path alias

**What NOT to repeat:**
- Don't re-migrate modules — they're already done
- Don't change design tokens or routing

**Goal:** Consolidate and standardize cross-cutting concerns:
- Ticket 14: Consolidate StatusBadge, formatFileSize, InlineSelector, CommonTableToolbar into common/
- Ticket 15: Rename service files to camelCase, fix function name typos, ensure all use api instance
- Ticket 16: Rename common files to PascalCase, convert default exports to named exports

**Files to inspect first:**
- `frontend/src/common/` (current structure)
- `frontend/src/service/` (current file names)
- Search for duplicated components (StatusBadge, formatFileSize, etc.)

**Implementation rules:**
- Follow cafebite-frontend skill strictly
- For ticket 14: create single implementations in common/, update all module imports
- For ticket 15: rename service files, update all imports across codebase
- For ticket 16: rename common files, convert exports, update all imports
- Test that all modules still work after consolidation
- Verify no duplicate logic remains

Load the `cafebite-frontend` skill.

Start by reading the tickets, then inspect the current structures, then implement in order: 14 -> 15 -> 16.
```

---

### Batch 7: Final (Tickets 17, 18)

#### New Chat Prompt

```
You are starting the final conversation to implement tickets 17 and 18 from the frontend migration plan.

**Context:**
- Batches 1-6 are complete — all modules migrated, cross-cutting concerns standardized
- Read handoffs from batches 1-6
- Read tickets: 17 (Clean up routing), 18 (Fix PWA & service worker)

**Project knowledge to retain:**
- Routing: React Router v7, nested routes, protected routes via PrivateRoutes
- PWA: service worker registration in src/utils/serviceWorkerRegistration.js
- All imports use `@/` path alias

**What NOT to repeat:**
- Don't re-migrate modules or change design tokens
- Don't refactor unrelated code

**Goal:** Final cleanup:
- Ticket 17: Fix all route paths, use @/ alias consistently, simplify App.jsx route structure, replace "Hyy" placeholder
- Ticket 18: Fix PWA/service worker (Vite-compatible env checks, remove hardcoded URL, clean up artifacts)

**Files to inspect first:**
- `frontend/src/App.jsx` (route structure, URL-path-split approach)
- `frontend/src/routes/` (MenuRoutes, FeedbackRoutes)
- `frontend/src/utils/serviceWorkerRegistration.js`
- `frontend/src/hooks/use-mobile.jsx` (wrong extension)

**Implementation rules:**
- Follow cafebite-frontend skill strictly
- For ticket 17: replace URL-path-split with proper React Router layout routes
- For ticket 18: use import.meta.env.DEV instead of process.env.NODE_ENV
- Test all routes after restructuring
- Test PWA registration in dev and production

Load the `cafebite-frontend` skill.

Start by reading the tickets, then inspect the files, then implement in order: 17 -> 18.
```

---

## Ticket-Wise Prompts

### Implementation Prompt Template (For Any Ticket)

```
Implement ticket [NN] from the frontend migration plan.

**Goal:** [Copy from ticket file — what to build]

**Before you start:**
1. Read `.scratch/frontend-migration/issues/[NN]-[slug].md`
2. Load the `cafebite-frontend` skill
3. Inspect the current structure of the module/files to be migrated

**Implementation rules:**
- Follow cafebite-frontend skill strictly
- Preserve backward compatibility — don't change component interfaces
- Update all imports across the codebase after renaming/moving files
- Test the module after migration
- No additional refactoring beyond what the ticket specifies

**Acceptance criteria:**
[Copy all items from the ticket file]

Start by reading the ticket, then inspect the files, then implement.
```

### Review Prompt Template (After Any Ticket)

```
Review the implementation of ticket [NN].

**Check:**
1. All acceptance criteria from the ticket are met
2. Code follows cafebite-frontend conventions
3. All imports use `@/` alias correctly
4. No dead code or commented-out blocks remain
5. No duplicate logic exists
6. Proper error handling exists
7. Validation is complete (if forms are involved)
8. App builds successfully with `npm run build`
9. No lint errors with `npm run lint`

**Verify:**
[Copy specific verification items from the ticket]

Report any issues found. If all checks pass, confirm completion.
```

### Refactoring Prompt (If Code Quality Issues Found)

```
The implementation of ticket [NN] has code quality issues. Refactor the following:

**Issues found:**
[List specific issues — e.g., "StatusBadge is still duplicated in 2 places", "formatFileSize is not extracted to utils"]

**Refactoring rules:**
- Follow cafebite-frontend skill strictly
- Preserve backward compatibility
- Update all imports after moving code
- Test after refactoring

**Goal:** Fix the listed issues without changing functionality.

Start by inspecting the problematic files, then refactor.
```

### Bug Fix Prompt (If Implementation Fails)

```
The implementation of ticket [NN] has a bug. Fix the following:

**Bug description:**
[Describe the bug — e.g., "After migrating Authentication, login with OTP doesn't redirect correctly"]

**Steps to reproduce:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected behavior:**
[What should happen]

**Actual behavior:**
[What actually happens]

**Debugging steps:**
1. Check browser console for errors
2. Check network tab for API calls
3. Check React DevTools for component state
4. Trace the code flow from the entry point

**Fix rules:**
- Fix the root cause, not the symptom
- Preserve backward compatibility
- Test the fix thoroughly
- Don't introduce new bugs

Start by debugging the issue, then implement the fix.
```

### Completion Prompt (After Ticket is Done)

```
Ticket [NN] is complete. Verify and document:

**Verification:**
- [ ] All acceptance criteria met
- [ ] Code review passed
- [ ] Tests passed (if applicable)
- [ ] App builds without errors
- [ ] No lint errors

**Documentation:**
- List of files modified
- List of files created
- List of files deleted
- Any issues encountered and how they were resolved
- Notes for the next ticket

Save this as `.scratch/frontend-migration/completions/ticket-[NN]-completion.md`.

Then confirm: "Ticket [NN] complete. Ready to start ticket [NN+1]."
```

---

## Review Checkpoints

### After Each Batch

```
Review checkpoint after batch [N].

**Architecture verification:**
- [ ] Project architecture is unchanged (module structure, state management, service layer)
- [ ] Coding standards are followed (cafebite-frontend skill)
- [ ] No duplicate logic exists (search for duplicated components/utils)
- [ ] No dead code was introduced (no commented-out blocks, unused imports)
- [ ] Proper error handling exists (all API calls have try/catch, all forms have validation)
- [ ] Validation is complete (all forms use zod schemas)
- [ ] Performance has not degraded (no unnecessary re-renders, no large bundle size increase)
- [ ] JavaScript best practices are followed (const/let, async/await, destructuring)
- [ ] APIs remain backward compatible (no breaking changes to service functions)
- [ ] UI consistency is maintained (all components use design tokens, no hardcoded colors)

**Ticket verification:**
- [ ] All tickets in this batch are fully implemented
- [ ] No ticket was partially implemented
- [ ] All acceptance criteria for each ticket are met

**Code quality:**
- [ ] Maintainability: code is easy to understand and modify
- [ ] Readability: code is well-formatted, properly indented, clear naming
- [ ] Scalability: code can handle growth (no hardcoded limits, no N+1 queries)
- [ ] Security: no exposed secrets, no XSS vulnerabilities, no unsafe innerHTML
- [ ] Performance: no memory leaks, no unnecessary re-renders, optimized queries
- [ ] Edge cases: null/undefined handled, empty states handled, error states handled
- [ ] Race conditions: async operations handled correctly (loading states, cancellation)
- [ ] Unused code: no dead code, no commented-out blocks, no unused imports
- [ ] Duplicate logic: no duplicated components/utils (all consolidated)
- [ ] Possible regressions: no breaking changes to existing functionality

**Build verification:**
- [ ] `npm run build` succeeds
- [ ] `npm run lint` passes
- [ ] No TypeScript/JavaScript compilation errors
- [ ] All imports resolve correctly

If all checks pass, confirm: "Batch [N] review passed. Ready to start batch [N+1]."
If any checks fail, list the issues and fix them before proceeding.
```

---

## Code Quality Prompt

```
Perform a complete code review of the implementation, similar to a senior engineer.

**Review criteria:**

1. **Maintainability**
   - Is the code easy to understand?
   - Are functions small and focused (<50 lines)?
   - Are components composable and reusable?
   - Is the code well-documented (comments where needed)?

2. **Readability**
   - Is the code well-formatted and properly indented?
   - Are variable/function names clear and descriptive?
   - Is the code consistent with project conventions?
   - Are imports organized (external -> internal -> relative)?

3. **Scalability**
   - Can the code handle growth (more data, more users)?
   - Are there any hardcoded limits or magic numbers?
   - Are database queries optimized (no N+1 queries)?
   - Are API calls batched where possible?

4. **Security**
   - Are there any exposed secrets or API keys?
   - Are there any XSS vulnerabilities (unsafe innerHTML)?
   - Is user input validated and sanitized?
   - Are auth tokens stored securely?

5. **Performance**
   - Are there any memory leaks (unsubscribed event listeners, uncleared intervals)?
   - Are there any unnecessary re-renders (missing useMemo/useCallback)?
   - Are large lists virtualized (react-window)?
   - Are images lazy-loaded?

6. **Edge Cases**
   - Are null/undefined values handled?
   - Are empty states handled (no data, no results)?
   - Are error states handled (API errors, validation errors)?
   - Are loading states handled (spinners, skeletons)?

7. **Race Conditions**
   - Are async operations handled correctly (loading states, cancellation)?
   - Are form submissions debounced to prevent double-submits?
   - Are API calls cancelled on unmount?

8. **Unused Code**
   - Is there any dead code (unreachable branches, unused variables)?
   - Are there any commented-out blocks?
   - Are there any unused imports?
   - Are there any unused components or utilities?

9. **Duplicate Logic**
   - Are there any duplicated components (same UI in multiple places)?
   - Are there any duplicated utilities (same function in multiple files)?
   - Are there any duplicated schemas (same validation in multiple places)?
   - Should any code be consolidated into shared components/utils?

10. **Possible Regressions**
    - Are there any breaking changes to existing functionality?
    - Are all component interfaces backward compatible?
    - Are all service functions backward compatible?
    - Are all route paths backward compatible (redirects for old paths)?

**Output format:**
For each issue found, provide:
- **Location:** file path and line number
- **Issue:** description of the problem
- **Severity:** critical / high / medium / low
- **Fix:** suggested solution

If no issues found, confirm: "Code review passed. No issues found."
```

---

## Testing Prompt

```
Generate a comprehensive test plan for ticket [NN].

**Affected modules:**
[List all modules/files affected by this ticket]

**Manual test cases:**
1. [Test case 1 — what to do, what to expect]
2. [Test case 2 — what to do, what to expect]
3. [Test case 3 — what to do, what to expect]
...

**Edge cases:**
1. [Edge case 1 — what could go wrong, how to handle it]
2. [Edge case 2 — what could go wrong, how to handle it]
...

**Regression scenarios:**
1. [Scenario 1 — what existing functionality could break, how to verify it still works]
2. [Scenario 2 — what existing functionality could break, how to verify it still works]
...

**API compatibility:**
- [ ] All service functions have the same signature (no breaking changes)
- [ ] All API endpoints return the same data structure
- [ ] All error responses are handled correctly

**Database migrations:**
- [ ] No database schema changes (if applicable)
- [ ] All queries are optimized (if applicable)

**Existing functionality:**
- [ ] Verify [feature 1] still works
- [ ] Verify [feature 2] still works
- [ ] Verify [feature 3] still works

**Test execution:**
Run through all test cases manually and report results:
- Pass: [count]
- Fail: [count]
- Blocked: [count]

If any tests fail, debug and fix before proceeding.
```

---

## Final Verification Prompt

```
All 18 tickets are complete. Perform a final verification of the entire frontend migration.

**Ticket verification:**
- [ ] Ticket 01: All 10 bug fixes implemented
- [ ] Ticket 02: All 7 dependency removals complete
- [ ] Ticket 03: Design token architecture fixed
- [ ] Ticket 04: Dashboard module migrated
- [ ] Ticket 05: Sidebar module migrated
- [ ] Ticket 06: Authentication module migrated
- [ ] Ticket 07: QrCode module migrated
- [ ] Ticket 08: ProfileManagement module migrated
- [ ] Ticket 09: CustomerMenu module migrated
- [ ] Ticket 10: ClientSupport module migrated
- [ ] Ticket 11: Menu + Categories migrated
- [ ] Ticket 12: MenuItems migrated
- [ ] Ticket 13: Templates migrated
- [ ] Ticket 14: Shared components consolidated
- [ ] Ticket 15: Service layer standardized
- [ ] Ticket 16: Common components standardized
- [ ] Ticket 17: Routing cleaned up
- [ ] Ticket 18: PWA & service worker fixed

**Completeness check:**
- [ ] No ticket was partially implemented
- [ ] All acceptance criteria for every ticket are met
- [ ] All handoff documents are complete

**Coding standards:**
- [ ] All modules follow cafebite-frontend standard (Index.jsx, components/, hooks/, constants/, validation/)
- [ ] All imports use `@/` path alias
- [ ] All components use PascalCase naming
- [ ] All services use camelCase naming
- [ ] All hooks use camelCase with `use` prefix
- [ ] All validation schemas are zod-only (no yup)
- [ ] All forms use react-hook-form + zod resolver
- [ ] All tables use TanStack Table with columns in useMemo
- [ ] All modal state is a single object { open, mode, data }
- [ ] All server data uses TanStack Query (no useState + useEffect)

**Architecture:**
- [ ] Module structure is consistent across all modules
- [ ] State management follows Kent C. Dodds principles
- [ ] Service layer is consistent (one file per backend module)
- [ ] Design tokens follow three-layer architecture
- [ ] Routing uses React Router v7 with nested routes

**Code quality:**
- [ ] No TODOs left in the codebase
- [ ] No compilation errors
- [ ] No lint errors
- [ ] All imports resolve correctly
- [ ] No duplicate functionality
- [ ] No dead code or commented-out blocks
- [ ] No hardcoded colors (all use design tokens)
- [ ] No hardcoded currency symbols (all use dynamic currency)

**Build verification:**
- [ ] `npm run build` succeeds
- [ ] `npm run lint` passes
- [ ] Bundle size is optimized (no redundant dependencies)

**Functional verification:**
- [ ] Login (password + OTP) works
- [ ] Registration (4-step wizard) works
- [ ] Password reset works
- [ ] Dashboard renders correctly
- [ ] Categories CRUD works
- [ ] Menu items CRUD works (table + card views)
- [ ] Templates CRUD works (including editor)
- [ ] QR code generation/management works
- [ ] Profile management works
- [ ] Client support (feedback) CRUD works
- [ ] Customer menu (public-facing) works
- [ ] Sidebar navigation works
- [ ] All routes resolve correctly
- [ ] Protected routes redirect to login when unauthenticated
- [ ] PWA service worker registers correctly

If all checks pass, confirm: "Frontend migration complete. All 18 tickets fully implemented."
If any checks fail, list the issues and fix them.
```

---

## Recommended Workflow

### Before Each Batch

1. **Read the handoff** from the previous batch (if applicable)
2. **Read all tickets** in the current batch
3. **Load the relevant skills** (cafebite-frontend, design-system, codebase-design)
4. **Inspect the current state** of the files to be modified
5. **Understand the existing architecture** before making changes

### During Each Batch

1. **Implement one ticket at a time** — don't jump between tickets
2. **Test after each ticket** — verify it works before moving to the next
3. **Review after each ticket** — check code quality, conventions, no regressions
4. **Document after each ticket** — save completion notes
5. **Take breaks** — if context gets long, start a new conversation

### After Each Batch

1. **Run the review checkpoint** — verify architecture, standards, quality
2. **Create a handoff document** — summarize what was done, issues encountered, notes for next batch
3. **Test the entire app** — verify no regressions
4. **Commit changes** — one commit per ticket, clear commit messages
5. **Start a new conversation** for the next batch (if needed)

### Best Practices for AI Implementation

1. **Maximum tickets per conversation:** 2-4 tickets (depending on complexity)
2. **Ideal conversation length:** 30-50 messages (before context degrades)
3. **When to create a new chat:**
   - After each batch is complete
   - If context exceeds 50 messages
   - If AI starts forgetting earlier context
   - If errors compound and AI is struggling
4. **How to prevent context loss:**
   - Create handoff documents after each batch
   - Summarize progress in completion notes
   - Use continuation prompts if resuming in same chat
5. **How to minimize AI mistakes:**
   - Provide clear, specific instructions
   - Tell AI what files to inspect first
   - Tell AI what NOT to do (no unnecessary refactoring)
   - Review after each ticket, not just at the end
6. **How to maximize implementation quality:**
   - Load relevant skills before implementation
   - Follow project conventions strictly
   - Test after each ticket
   - Review code quality after each ticket
   - Don't rush — take time to understand the code before changing it

---

## Summary

**Total batches:** 7
**Total tickets:** 18
**Estimated time:** 30-45 hours
**Recommended tickets per conversation:** 2-4
**Context preservation:** Handoff documents after each batch

**Batch schedule:**
- Batch 1: Tickets 01, 02 (Foundation)
- Batch 2: Ticket 03 (Design tokens)
- Batch 3: Tickets 04, 05, 07 (Simple modules)
- Batch 4: Tickets 06, 08, 09 (Medium modules)
- Batch 5: Tickets 10, 11, 12, 13 (Complex modules)
- Batch 6: Tickets 14, 15, 16 (Cross-cutting)
- Batch 7: Tickets 17, 18 (Final)

**Ready to start?** Begin with Batch 1 using the implementation prompt above.
