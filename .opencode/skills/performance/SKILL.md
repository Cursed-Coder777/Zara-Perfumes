---
name: performance
description: Use when the user asks about performance optimization, bundle size, Core Web Vitals, profiling, Lighthouse scores, or rendering performance.
---

# Performance

## Key metrics (Core Web Vitals)
- **LCP** (Largest Contentful Paint): < 2.5s — hero image/text, product images
- **FID/INP** (Interaction to Next Paint): < 200ms — checkout, cart, filter interactions
- **CLS** (Cumulative Layout Shift): < 0.1 — images need explicit dimensions, no layout shifts on load

## Next.js 15 specific optimizations

### Images
- Use `next/image` with `width` and `height` (prevents CLS)
- Use `priority` on above-the-fold images (hero, first product grid)
- Lazy load below-the-fold images (default)
- Serve WebP/AVIF via remote image optimization

### Fonts
- Geist Sans (variable) — subset to Latin if possible
- Playfair Display — subset and `display=swap`
- Preload critical fonts via `next/font/google` with `preload: true`

### JavaScript
- Prefer server components for data fetching
- Minimize `"use client"` boundaries — push interactivity to isolated leaf components
- Lazy load non-critical client components with `next/dynamic`
- Avoid large libraries on the client (moment → date-fns, lodash → native)

### Rendering
- Use React Suspense boundaries for streaming
- Static pages (product listing, about): use `force-static` or ISR
- Dynamic pages (product detail, cart): use SSR or `force-dynamic`

## Bundle analysis
```bash
pnpm dlx @next/bundle-analyzer  # Set ANALYZE=true before build
pnpm build
```

## Profiling
- React DevTools Profiler for component re-renders
- Chrome DevTools Performance tab for runtime
- `server-only` / `client-only` imports to prevent server code leaking to client

## Database performance
- Add indexes on frequently queried columns (product name, category, price)
- Use `pagination` (offset/limit) on product listing queries
- Avoid N+1 queries — use Drizzle `with` (eager relations)
- Consider Redis caching for product catalog if traffic grows

## Build performance
- `pnpm build` with Turbopack dev (fast refresh), Webpack production
- Cache `node_modules` and `.next/cache` in CI
- Monitor bundle size regressions with CI checks
