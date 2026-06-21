# ZARA — Agent Guide

## Project Overview
Premium perfume e-commerce built with Next.js 15 App Router, tRPC v11, Drizzle ORM, PostgreSQL, better-auth, Stripe, and Tailwind CSS v4.

## Conventions

### Package Manager
- Always use `pnpm` (never `npm` or `yarn`)
- Use `pnpm dlx` instead of `npx`

### Code Style
- TypeScript with strict mode (`noUncheckedIndexedAccess`)
- Path aliases: `~/*` maps to `./src/*`
- ES Modules (`"type": "module"`)
- Prettier for formatting with Tailwind CSS plugin
- ESLint with `eslint-config-next` and `eslint-plugin-drizzle`

### Database
- PostgreSQL via `postgres` driver + Drizzle ORM
- Custom tables use `zara_` prefix via `createTable` helper
- better-auth default tables (user, session, account, verification) are unprefixed
- Run `pnpm db:push` to sync schema, `pnpm db:studio` for GUI

### Authentication
- better-auth with Drizzle adapter
- Providers: email/password, Google OAuth, GitHub OAuth
- Role field on user: `customer` (default) or `admin`
- Session enriched with DB role via tRPC `protectedProcedure` middleware

### API Layer
- tRPC v11 with SuperJSON transformer
- Routers in `src/server/api/routers/`
- Context creates session from headers via `better-auth`
- `publicProcedure` — no auth required
- `protectedProcedure` — auth required, session has `role`
- Admin routes check `session.user.role === "admin"` manually

### Frontend
- Tailwind CSS v4 with `@import "tailwindcss"`
- Theme variables under `@theme` (fonts, colors)
- Dark mode via `dark` class on `<html>`, toggled by `ThemeProvider`
- Fonts: Geist Sans (body) + Playfair Display (headings) via `next/font/google`
- Client components in `"use client"` files for interactivity
- Server components for data fetching with tRPC server caller
- Hero section uses Ferrofluid WebGL fluid animation (`src/components/ui/Ferrofluid.tsx`) with OGL
- React Bits components installed via shadcn CLI (`pnpm dlx shadcn@latest add @react-bits/ComponentName`)

### Page Transitions
- `Stairs` component wraps pages with a GSAP animated 5-panel overlay
- `TransitionLink` component intercepts `<a>` clicks to trigger the transition before navigation
- Use `TransitionLink` instead of `next/link` or regular `<a>` tags for animated page transitions
- The `useStairs()` hook exposes `startTransition(navigateCallback)` for manual triggers

### Admin Panel
- Located at `/admin` — simple password gate (`sessionStorage`) for local dev
- Hardcoded password `"password"` — replace with real auth for production
- Tab-based UI: Products (CRUD) and Orders (status management)
- Product form supports sizes in `ml:price` format, scent notes, featured toggle

### Payments
- Stripe Checkout for payment processing
- `src/lib/stripe.ts` initializes Stripe with secret key
- Webhook at `/api/stripe/webhook` updates order status on payment success

### Cart & Checkout
- Cart items stored in DB (`cart_item` table), linked to user
- Checkout creates an order, then redirects to Stripe
- Order statuses: pending → paid → shipped → delivered → cancelled

### Component Patterns
- Server components fetch data, pass props to client components
- Client components use `api.router.query.useQuery()` for data
- Mutations invalidate related queries via `utils.router.list.invalidate()`
- `.env` has placeholder values; use `SKIP_ENV_VALIDATION=true` for dev

### Build & Dev
```bash
pnpm dev          # Development with Turbopack
pnpm build        # Production build (runs ESLint + TypeScript)
pnpm lint         # ESLint only
pnpm typecheck    # TypeScript only
pnpm db:push      # Push schema to database
pnpm db:studio    # Open Drizzle Studio
```

### File Organization
```
src/
├── app/           # Next.js App Router pages + API routes
├── components/    # Shared UI components
├── lib/           # Client utilities (Stripe, theme, hooks)
├── server/        # Server-only code
│   ├── api/       # tRPC setup + routers
│   ├── better-auth/  # Auth config + client
│   └── db/        # Drizzle schema + connection
├── styles/        # Global CSS
└── trpc/          # tRPC React + server helpers
```
