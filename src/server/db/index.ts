// Import the Drizzle ORM wrapper for postgres.js (the PostgreSQL client used at runtime)
import { drizzle } from "drizzle-orm/postgres-js";
// Import the lightweight PostgreSQL driver that powers the database connection
import postgres from "postgres";

// Import validated environment variables (DATABASE_URL for the connection string)
import { env } from "~/env";
// Import the entire schema object so Drizzle knows all tables, relations, and types
import * as schema from "./schema";

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
// Declare a module-level cache on globalThis to persist the postgres connection across hot reloads
const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

// Reuse an existing connection from the cache or create a new one using the DATABASE_URL environment variable
const conn = globalForDb.conn ?? postgres(env.DATABASE_URL);
// In non-production environments, stash the connection on globalThis so HMR doesn't exhaust database connections
if (env.NODE_ENV !== "production") globalForDb.conn = conn;

// Build the Drizzle ORM instance using the postgres connection and the full schema for typed queries
export const db = drizzle(conn, { schema });
