# ZARA — Fragrance E-Commerce

A premium perfume e-commerce platform built with Next.js 15, tRPC, Drizzle ORM, PostgreSQL, better-auth, Stripe, and Tailwind CSS v4.

## Tech Stack

- **Framework:** Next.js 15 (App Router, React 19)
- **API Layer:** tRPC v11 (end-to-end typesafe APIs)
- **Database:** PostgreSQL with Drizzle ORM
- **Authentication:** better-auth (email/password, Google OAuth, GitHub OAuth)
- **Payments:** Stripe Checkout
- **Styling:** Tailwind CSS v4 with dark/light theme
- **Fonts:** Geist (sans) + Playfair Display (serif) via next/font
- **Animations:** GSAP, Framer Motion, Lenis (installed, ready to use)
- **WebGL:** OGL (WebGL framework used by Ferrofluid component)
- **UI Registry:** React Bits via shadcn CLI (`@react-bits` namespace)

## Features

### Customer
- Animated hero section with Ferrofluid WebGL fluid-dynamics background (mouse-interactive)
- Browse products by category with filtering and search
- Product detail pages with size selection
- Shopping cart (add, update quantity, remove)
- Guest → Sign-in → Checkout flow
- Email/password authentication or Google/GitHub OAuth
- Order history with status tracking
- Dark/light theme toggle
- Fully responsive design

### Admin
- Admin dashboard with products/orders tabs
- Product management (list, create, update, delete)
- Order management with status updates (pending → paid → shipped → delivered → cancelled)
- Role-based access control

## Getting Started

### Prerequisites
- Node.js 20+
- pnpm 11+
- PostgreSQL 16+

### Environment Variables
Copy `.env.example` to `.env` and fill in the values:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | better-auth secret (generate with `openssl rand -hex 32`) |
| `BETTER_AUTH_GITHUB_CLIENT_ID` | GitHub OAuth App client ID |
| `BETTER_AUTH_GITHUB_CLIENT_SECRET` | GitHub OAuth App client secret |
| `BETTER_AUTH_GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `BETTER_AUTH_GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `SKIP_ENV_VALIDATION` | Set to `true` for dev without all env vars |

### Installation
```bash
pnpm install
```

### Database
```bash
# Push schema to database
pnpm db:push

# Seed with sample data
pnpm tsx scripts/seed.ts
```

### Development
```bash
pnpm dev
```

### Build
```bash
pnpm build
pnpm start
```

## Project Structure
```
├── scripts/              # Standalone scripts (seed)
├── src/
│   ├── app/              # Next.js App Router pages & API routes
│   │   ├── admin/        # Admin dashboard
│   │   ├── api/          # API routes (auth, tRPC, Stripe webhook)
│   │   ├── auth/         # Authentication page
│   │   ├── cart/         # Shopping cart
│   │   ├── checkout/     # Checkout flow
│   │   ├── order/        # Order detail
│   │   ├── orders/       # Order history
│   │   └── products/     # Product listing & detail
│   ├── components/       # Shared UI components
│   │   └── ui/           # React Bits / shadcn registry components (Ferrofluid, etc.)
│   ├── lib/              # Utilities (Stripe, theme, session)
│   ├── server/
│   │   ├── api/          # tRPC routers & config
│   │   ├── better-auth/  # Auth configuration
│   │   └── db/           # Database schema & connection
│   ├── styles/           # Global CSS with Tailwind
│   └── trpc/             # tRPC client & server setup
├── components.json       # shadcn registry configuration (incl. @react-bits)
├── drizzle.config.ts     # Drizzle Kit configuration
├── next.config.js        # Next.js configuration
└── tsconfig.json         # TypeScript configuration
```

## Architecture

### Data Flow
1. **Server Components** fetch data via `api.router.query()` (tRPC server caller)
2. **Client Components** use `api.router.query.useQuery()` (React Query + tRPC)
3. **tRPC routers** validate input with Zod, query Drizzle ORM, return typed responses
4. **better-auth** handles session management with PostgreSQL adapter
5. **Stripe Checkout** processes payments — webhook updates order status

### Authentication Flow
- better-auth manages user sessions with cookie-based auth
- Role field (`customer`/`admin`) stored on user record
- tRPC `protectedProcedure` middleware enriches session with DB role
- Admin routes check `ctx.session.user.role === "admin"`

### Cart & Checkout Flow
1. Add items to cart (authenticated users only)
2. Cart page shows items, quantities, total
3. Checkout collects shipping info, creates order (status: pending)
4. Redirects to Stripe Checkout for payment
5. Stripe webhook marks order as paid

## Scripts
| Command | Description |
|---|---|
| `pnpm dev` | Start development server with Turbopack |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | Run TypeScript check |
| `pnpm db:push` | Push Drizzle schema to database |
| `pnpm db:studio` | Open Drizzle Studio |
| `pnpm db:generate` | Generate Drizzle migrations |
| `pnpm db:migrate` | Run Drizzle migrations |
