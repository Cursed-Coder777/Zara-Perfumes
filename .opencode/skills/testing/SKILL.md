---
name: testing
description: Use when the user asks about testing, writing tests, running tests, test conventions, or test-related configuration.
---

# Testing

## Project setup
- Next.js with Turbopack dev server
- TypeScript with strict mode
- Drizzle ORM for database

## Test approach
- Prefer unit tests for utility functions and hooks
- Use integration tests for tRPC procedures and API routes
- Use component tests for UI components (React Testing Library)
- Use E2E tests for critical user flows (checkout, auth, admin)

## Running tests
```bash
pnpm test          # Run all tests
pnpm test:watch    # Watch mode
pnpm test:coverage # With coverage report
```
*(Adjust script names to match what is defined in package.json.)*

## Conventions
- Test files live next to the source file with `.test.ts` or `.test.tsx` extension
- Use `describe`/`it` blocks, follow AAA (Arrange-Act-Assert)
- Mock external services (Stripe, better-auth) at the boundary
- Do not test Drizzle schema — test queries via `db.run()` in integration tests
- Name tests descriptively: `"returns 404 when product id does not exist"`

## Drizzle testing
- Use a separate test database or in-memory SQLite via `drizzle-orm/sqlite`
- Run `pnpm db:push` before test suite if using real PG
- Roll back transactions after each test to isolate state

## Common patterns
- tRPC procedure tests: use the server caller factory with mocked session
- Component tests: wrap in necessary providers (TRPCProvider, ThemeProvider, AuthProvider)
- Stripe webhook tests: construct and sign test events with `stripe.webhooks.generateTestHeaderString`
