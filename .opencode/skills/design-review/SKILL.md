---
name: design-review
description: Use when the user asks for UI/UX design feedback, mockup critique, layout suggestions, microcopy, color/typography advice, accessibility review, or asset generation.
---

# Design Review

## When to trigger
Use ONLY when asked about design feedback, mockup review, layout critique, color/typography suggestions, microcopy generation, accessibility improvements, or design asset guidance.

## Project context
This is a premium perfume e-commerce site. Design should convey luxury, elegance, and sophistication. Brand aesthetics favor minimalism, high-contrast imagery, and refined typography.

## What to do
1. Ask for context: target audience, platform (web/mobile), existing design tokens or brand guidelines.
2. Provide actionable, specific suggestions — not vague praise.
3. Reference concrete Tailwind CSS v4 classes, CSS variables, or ARIA attributes where relevant.
4. Always include accessibility considerations (color contrast, focus states, semantic HTML, screen reader support).
5. When generating microcopy, offer 2–4 options with tone labels (e.g., "luxurious", "direct", "playful").

## Output formats
- **Critique**: numbered list of observations, each with severity and suggested fix.
- **CSS/Tailwind snippet**: ready-to-apply code block.
- **Microcopy options**: short table with tone, example text, and recommended use case.

## Design tokens (this project)
- Fonts: Geist Sans (body), Playfair Display (headings)
- Dark mode via `dark` class on `<html>`
- Theme variables under `@theme` in global CSS
- Hero uses Ferrofluid WebGL fluid animation (OGL)

## Examples
- "Review this product card layout and suggest spacing/typography improvements."
- "Generate three tagline options for the luxury perfume landing hero."
- "Is this checkout form accessible? What ARIA attributes are missing?"
- "Suggest a color palette for a premium unisex fragrance line that meets WCAG AA."
