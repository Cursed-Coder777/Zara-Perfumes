---
name: accessibility
description: Use when the user asks about accessibility, a11y, WCAG compliance, ARIA patterns, screen reader support, keyboard navigation, or inclusive design.
---

# Accessibility (A11Y)

## Standards
- Target **WCAG 2.2 AA** compliance
- Consider AAA for text contrast and critical user flows
- Follow WAI-ARIA 1.2 authoring practices

## Key areas in this project

### Forms and inputs
- Every input needs a visible `<label>` or `aria-label`
- Error messages must be associated via `aria-describedby`
- Required fields: `aria-required="true"` or `required` attribute
- Use `role="alert"` on dynamic error summaries

### Navigation
- Skip-to-content link at top of page
- Semantic HTML: `<header>`, `<nav>`, `<main>`, `<footer>`
- Breadcrumbs: `nav aria-label="Breadcrumb"` with `aria-current="page"`
- Mobile menu: manage focus trap, `aria-expanded`, `aria-controls`

### Images and media
- All decorative images: `alt=""` (empty alt)
- All informative images: descriptive `alt` text
- Ferrofluid WebGL hero: provide a static fallback description

### Color and contrast
- Text on background: minimum 4.5:1 (AA normal), 3:1 (AA large)
- Use `@theme` color tokens — verify contrast when adding new ones
- Dark mode: check both light and dark palettes
- Do not rely on color alone to convey information

### Interactive elements
- Buttons and links: visible focus ring (not `outline: none` without replacement)
- Hover/focus/active states for all clickable elements
- Custom components: implement keyboard interaction per WAI-ARIA patterns

## Testing tools
- Lighthouse Accessibility audit
- axe DevTools browser extension
- `@axe-core/react` for automated component testing
- Manual keyboard navigation (Tab, Shift+Tab, Enter, Escape)
- Screen reader testing: VoiceOver (macOS), NVDA (Windows)

## Common ARIA patterns used in this project
- Disclosure (mobile nav): `button[aria-expanded]` + region `[aria-hidden]`
- Dialog/modal: `role="dialog"`, `aria-modal="true"`, focus trap
- Alert messages: `role="alert"` or `aria-live="polite"`
- Progress indicators: `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
