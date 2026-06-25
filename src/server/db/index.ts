// Import the Drizzle ORM wrapper for postgres.js (the PostgreSQL client used at runtime)
import { drizzle } from "drizzle-orm/postgres-js";
// Import the lightweight PostgreSQL driver that powers the database connection
import postgres from "postgres";

// Import validated environment variables (DATABASE_URL for the connection string)
import { env } from "~/env";

// Import the entire schema object so Drizzle knows all tables, relations, and types
import * as schema from "./schema";
// Import the PostgresJsDatabase type to properly type the lazy Proxy export
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

// Capture the concrete DB type with our schema, matching what `drizzle(conn, { schema })` would return
type Db = PostgresJsDatabase<typeof schema>;

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
// Declare a module-level cache on globalThis to persist the postgres connection across hot reloads
const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

// Lazy connection + db — defers postgres() call until first actual query.
// Prevents module-level crash when DATABASE_URL env var is not set at runtime
// (e.g., during Vercel cold start before the dashboard env vars are available).
function getConn(): postgres.Sql {
  if (!globalForDb.conn) {
    globalForDb.conn = postgres(env.DATABASE_URL);
  }
  return globalForDb.conn;
}

function getDbInstance() {
  return drizzle(getConn(), { schema });
}

// Proxy-based lazy export — db methods resolve on first access, not at import time.
// This allows modules that import `db` to evaluate without immediately connecting.
export const db = new Proxy({} as Db, {
  get(_, prop) {
    return getDbInstance()[prop as keyof Db];
  },
});
