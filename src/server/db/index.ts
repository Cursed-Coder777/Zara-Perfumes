import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "~/env";

import * as schema from "./schema";

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
  globalForDb.conn ??= postgres(env.DATABASE_URL);
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
