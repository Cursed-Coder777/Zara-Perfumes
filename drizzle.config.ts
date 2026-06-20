// Import the Config type from drizzle-kit for type-safe configuration
import { type Config } from "drizzle-kit";

// Import validated environment variables (fails fast if DATABASE_URL is missing)
import { env } from "~/env";

// Drizzle Kit configuration object — used by CLI commands (push, generate, migrate, studio)
export default {
  // Path to the file that defines all Drizzle ORM table schemas
  schema: "./src/server/db/schema.ts",
  // Database dialect — tells Drizzle Kit to generate PostgreSQL-compatible SQL
  dialect: "postgresql",
  // Database connection credentials used by Drizzle Kit for schema push / migrations
  dbCredentials: {
    // Full PostgreSQL connection string loaded from environment variables
    url: env.DATABASE_URL,
  },
  // Only include tables matching this glob pattern in generated migrations;
  // custom tables use the "zara_" prefix, while better-auth default tables are left unprefixed
  tablesFilter: ["zara_*"],
} satisfies Config;
