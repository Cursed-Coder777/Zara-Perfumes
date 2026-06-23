---
name: deploy
description: Use when the user asks about deployment, CI/CD, build, release, rollback, or production infrastructure.
---

# Deploy

## Build
```bash
pnpm build   # Production build (runs ESLint + TypeScript checks)
pnpm lint    # ESLint only
pnpm typecheck  # TypeScript only
```

## Environment
- `.env` has placeholder values; use `SKIP_ENV_VALIDATION=true` for dev
- Required variables: `DATABASE_URL`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`

## Deployment checklist
1. Run `pnpm typecheck` and `pnpm lint` — both must pass
2. Run `pnpm build` — must succeed
3. Push Drizzle schema changes: `pnpm db:push` (or generate migration files first)
4. Set production env vars in hosting platform
5. Deploy build output

## Rollback steps
1. Identify the last known-good deploy (git tag or CI pipeline ID)
2. Revert DB migration if schema changed: use Drizzle Studio or manual SQL
3. Redeploy the previous build artefact or revert the git commit
4. Verify health endpoint and a critical user flow (login, product listing, checkout)

## Infrastructure
- Next.js 15 App Router — deploy as Node.js server or serverless functions
- PostgreSQL — managed DB (Neon, Railway, Supabase, or similar)
- Stripe — no additional infra needed for webhooks
- Assets: images hosted on CDN (Cloudinary, Vercel Blob, or similar)

## CI notes
- Use `SKIP_ENV_VALIDATION=true` in CI if env vars are not available at build time
- Cache `node_modules` and `.next/cache` between runs
- Run `pnpm db:push` only in deploy step, not in lint/typecheck steps
