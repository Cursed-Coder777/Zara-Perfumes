// Import the t3 environment variable creation utility, which validates and parses env vars at build time
import { createEnv } from "@t3-oss/env-nextjs";
// Import Zod for runtime schema validation of environment variables
import { z } from "zod";

// Define and export the validated environment object, ensuring all required env vars are present and correctly typed
export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  // Define the schema for server-only environment variables (never exposed to the client bundle)
  server: {
    // Auth secret for better-auth; optional in dev so new contributors don't need it immediately
    BETTER_AUTH_SECRET: process.env.NODE_ENV === "production" ? z.string() : z.string().optional(),
    // Base URL for better-auth (e.g., http://localhost:3000 or https://your-domain.vercel.app)
    BETTER_AUTH_URL: z.string().url(),
    // GitHub OAuth app client ID for social login
    BETTER_AUTH_GITHUB_CLIENT_ID: z.string(),
    // GitHub OAuth app client secret for social login
    BETTER_AUTH_GITHUB_CLIENT_SECRET: z.string(),
    // Google OAuth client ID for social login
    BETTER_AUTH_GOOGLE_CLIENT_ID: z.string(),
    // Google OAuth client secret for social login
    BETTER_AUTH_GOOGLE_CLIENT_SECRET: z.string(),
    // PostgreSQL connection string used by Drizzle ORM and the postgres driver
    DATABASE_URL: z.string().url(),
    // Stripe secret key for server-side payment API calls
    STRIPE_SECRET_KEY: z.string(),
    // Stripe webhook signing secret for verifying incoming webhook events
    STRIPE_WEBHOOK_SECRET: z.string(),
    // Current Node environment; defaults to "development" for safety
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  // Define the schema for client-exposed variables (must be prefixed with NEXT_PUBLIC_)
  client: {
    // Stripe publishable key used in the browser to initialise Stripe Elements and Checkout
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  // Manually map runtime environment variables because process.env can't be destructured in edge runtimes
  runtimeEnv: {
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    BETTER_AUTH_GITHUB_CLIENT_ID: process.env.BETTER_AUTH_GITHUB_CLIENT_ID,
    BETTER_AUTH_GITHUB_CLIENT_SECRET: process.env.BETTER_AUTH_GITHUB_CLIENT_SECRET,
    BETTER_AUTH_GOOGLE_CLIENT_ID: process.env.BETTER_AUTH_GOOGLE_CLIENT_ID,
    BETTER_AUTH_GOOGLE_CLIENT_SECRET: process.env.BETTER_AUTH_GOOGLE_CLIENT_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NODE_ENV: process.env.NODE_ENV,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  // Always skip module-level validation — runtime env errors are caught gracefully
  // by lazy initializers (getAuth, getStripe, getDb) and the layout try/catch.
  // Build-time validation still runs via `pnpm typecheck` and `pnpm build`.
  skipValidation: true,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  // Treat empty strings as undefined so they trigger Zod's "required" check instead of passing silently
  emptyStringAsUndefined: true,
});
