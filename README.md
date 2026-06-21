# ZARA Perfumes

A premium e-commerce platform for Zara Perfumes — a full-stack Next.js 15 application with tRPC, Drizzle ORM, PostgreSQL, better-auth, and Stripe payments.

## Tech Stack

| Layer         | Technology                                      |
| ------------- | ----------------------------------------------- |
| Framework     | Next.js 15 (App Router, Turbopack)              |
| Language      | TypeScript (strict mode)                        |
| Styling       | Tailwind CSS v4 + Geist Sans + Playfair Display |
| Backend API   | tRPC v11 (server & client)                      |
| Database      | PostgreSQL + Drizzle ORM                        |
| Auth          | better-auth (email, Google, GitHub)             |
| Payments      | Stripe Checkout (webhook)                       |
| Animations    | GSAP + Framer Motion + OGL (WebGL)              |
| Data Fetching | TanStack React Query + tRPC                     |

## Project Structure

```
src/
├── app/
│   ├── (shop)/           # Route group — product, cart, checkout, orders
│   │   ├── about/        # About page with 3D InfiniteMenu
│   │   ├── admin/        # Admin dashboard (product & order CRUD)
│   │   ├── auth/         # Sign-in / sign-up
│   │   ├── cart/         # Shopping cart
│   │   ├── checkout/     # Checkout with Stripe
│   │   ├── contact/      # Contact form
│   │   ├── order/[id]/   # Single order detail
│   │   ├── orders/       # Order history
│   │   └── products/     # Product listing + [slug] detail
│   ├── api/stripe/webhook/ # Stripe webhook endpoint
│   ├── fonts.ts          # Google Fonts configuration
│   ├── layout.tsx        # Root layout (providers, nav, footer)
│   └── not-found.tsx     # 404 page
├── components/
│   ├── nav.tsx           # Navigation + mobile menu + cart badge
│   ├── footer.tsx        # Site footer
│   ├── hero.tsx          # Homepage hero with 3D Ferrofluid + search
│   ├── product-card.tsx  # Product card component
│   └── ui/               # Reusable UI primitives
│       ├── Ferrofluid.tsx    # WebGL fluid simulation (OGL)
│       ├── InfiniteMenu.tsx  # 3D sphere image grid (WebGL2)
│       ├── Stack.tsx         # Stack card component (Framer Motion)
│       ├── Stairs.tsx        # GSAP page transition overlay
│       └── TransitionLink.tsx # Animated link wrapper
├── lib/                  # Client utilities
│   ├── stripe.ts         # Stripe instance
│   ├── use-session.ts    # Session hook
│   ├── lenis.ts          # Smooth scroll
│   └── theme.ts          # Theme toggling
├── server/               # Server-only code
│   ├── api/              # tRPC setup + routers
│   │   ├── trpc.ts       # Context, publicProcedure, protectedProcedure
│   │   └── routers/      # product, cart, order, checkout, admin
│   ├── better-auth/      # Auth instance config
│   │   ├── config.ts     # better-auth initialization
│   │   ├── index.ts      # Barrel export
│   │   └── server.ts     # Server-side helpers
│   └── db/               # Database layer
│       ├── index.ts      # Drizzle connection
│       └── schema.ts     # All table definitions
├── styles/
│   └── globals.css       # Global styles + Tailwind v4 @import
├── trpc/                 # tRPC client & server helpers
│   ├── query-client.ts   # TanStack Query client
│   ├── react.tsx         # tRPC React provider + hooks
│   └── server.ts         # Server-side caller
└── env.js                # Environment validation (Zod)
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL database (or Neon connection string)

### Setup

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local

# Edit .env.local with your database URL, Stripe keys, OAuth secrets, etc.
# For development without env validation:
SKIP_ENV_VALIDATION=true pnpm dev

# Push database schema
pnpm db:push

# Start development server
pnpm dev
```

### Scripts

| Command              | Description                                |
| -------------------- | ------------------------------------------ |
| `pnpm dev`           | Start dev server with Turbopack            |
| `pnpm build`         | Production build (lint + typecheck)        |
| `pnpm lint`          | ESLint check                               |
| `pnpm typecheck`     | TypeScript check                           |
| `pnpm db:push`       | Push Drizzle schema to database            |
| `pnpm db:studio`     | Open Drizzle Studio GUI                    |
| `pnpm db:generate`   | Generate SQL migration                     |
| `pnpm db:migrate`    | Run pending migrations                     |

### Authentication

- Email/password, Google OAuth, GitHub OAuth via better-auth
- Sessions are enriched with a `role` field (`customer` | `admin`)
- Routes use `publicProcedure` (no auth) or `protectedProcedure` (auth required)

### Payments

- Stripe Checkout Sessions created via tRPC `checkout.create`
- Webhook at `/api/stripe/webhook` listens for `checkout.session.completed`
- Order status transitions: `pending` → `paid` → `shipped` → `delivered` → `cancelled`

## Environment Variables

See `.env.example` for the full list. Key variables:
- `DATABASE_URL` — PostgreSQL connection string
- `BETTER_AUTH_URL` — App base URL (e.g. `http://localhost:3000`)
- `BETTER_AUTH_SECRET` — Auth secret
- `BETTER_AUTH_GITHUB_*` / `BETTER_AUTH_GOOGLE_*` — OAuth credentials
- `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` — Stripe keys
