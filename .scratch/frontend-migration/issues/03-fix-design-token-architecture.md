# 03 — Fix design token architecture

**What to build:** Design tokens follow the three-layer architecture (primitive -> semantic -> component). The primary color collision is resolved, all custom semantic tokens have dark mode overrides, and the Tailwind config is the single source of truth for the design system.

**Blocked by:** 02 — Remove redundant dependencies

**Status:** ready-for-agent

- [ ] Resolve primary color collision in tailwind.config.js (defined twice — second overwrites first, text-primary semantic token unreachable)
- [ ] Add dark mode overrides for all custom semantic tokens in .dark selector (--surface-background, --text-primary, --brand-primary, --brand-primary-foreground, --status-danger, --status-danger-foreground, --accent-indigo, --accent-indigo-foreground, --accent-indigo-light, --accent-indigo-dark, --neutral-white, --neutral-black)
- [ ] Define --container CSS variable or remove the broken reference in App.css
- [ ] Fix --sidebar-background double percent sign if not already fixed in ticket 01
- [ ] Replace hardcoded HSL values in custom box shadows with token references where possible
- [ ] Verify dark mode renders correctly with all custom tokens having appropriate dark values
- [ ] Verify Tailwind utility classes (text-primary, bg-brand-primary, etc.) resolve to correct values
- [ ] Document the three-layer token architecture in the design system reference
