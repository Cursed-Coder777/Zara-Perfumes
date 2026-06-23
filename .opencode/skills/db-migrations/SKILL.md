---
name: db-migrations
description: Use when the user asks about database schema changes, Drizzle ORM migrations, table modifications, or data seeding.
---

# Database Migrations

## Setup
- PostgreSQL via `postgres` driver + Drizzle ORM
- Schema files in `src/server/db/`
- Custom tables use `zara_` prefix via `createTable` helper
- better-auth default tables (user, session, account, verification) are unprefixed

## Commands
```bash
pnpm db:push      # Push schema directly (dev only — no migration files)
pnpm db:studio    # Open Drizzle Studio GUI
pnpm db:generate  # Generate SQL migration files (for production)
pnpm db:migrate   # Apply generated migrations
```

## Workflow

### Quick dev changes
1. Edit schema file
2. Run `pnpm db:push` to sync
3. Verify in Drizzle Studio or psql

### Production changes
1. Edit schema file
2. Run `pnpm db:generate` to create migration SQL
3. Review generated SQL in `drizzle/` folder
4. Commit migration files to git
5. Run `pnpm db:migrate` on production

## Conventions
- Use `createTable` helper for all custom tables (adds `zara_` prefix)
- Always add `id: uuid().primaryKey().defaultRandom()` as primary key
- Use `timestamp({ withTimezone: true }).notNull().defaultNow()` for timestamps
- Foreign keys use `references(() => table.id)`
- Soft deletes: add `deletedAt: timestamp({ withTimezone: true })` column
- Index frequently queried columns

## Rollbacks
- Drizzle does not automatically generate down migrations
- To roll back: write a manual SQL script reversing the change, or restore from DB backup
- For dev: `pnpm db:push` with reverted schema

## Example schema
```ts
import { createTable } from "../create-table"
import { integer, text, timestamp, uuid, boolean } from "drizzle-orm/pg-core"

export const product = createTable("product", {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  price: integer().notNull(),
  image: text(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
})
```
