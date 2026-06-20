// Import the main better-auth factory for creating the authentication instance
import { betterAuth } from "better-auth";
// Import the Drizzle ORM adapter so better-auth can read/write users, sessions, accounts, and verifications
import { drizzleAdapter } from "better-auth/adapters/drizzle";

// Import validated environment variables for OAuth client IDs/secrets and other settings
import { env } from "~/env";
// Import the Drizzle database instance so the adapter can perform queries
import { db } from "~/server/db";

// Create and export the central better-auth instance that powers all authentication features
export const auth = betterAuth({
  // Use the BETTER_AUTH_URL env var so OAuth callbacks and redirects work in every deployment environment
  baseURL: env.BETTER_AUTH_URL,
  // Wire up the database using the Drizzle adapter with PostgreSQL as the database provider
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  // Enable email + password authentication with automatic sign-in after registration
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  // Enable username-based authentication so users can sign in with either email or username
  username: {
    enabled: true,
  },
  // Define a custom "role" field on the user table that defaults to "customer" and is not editable via the UI
  additionalFields: {
    role: {
      type: "string",
      defaultValue: "customer",
      required: false,
      input: false,
    },
  },
  // Configure session handling: enable a cookie cache with a 5-minute max age to reduce database lookups
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  // Define session callbacks that enrich the session object with the user's role from the database
  callbacks: {
    session: async (params: { session: { user: { id: string; email: string; name: string; image?: string | null } } }) => {
      // Query the database for the user's current role using the user ID from the session
      const dbUser = await db.query.user.findFirst({
        where: (u, { eq }) => eq(u.id, params.session.user.id),
        columns: { role: true },
      });
      // Return the session with the role attached so it's available everywhere without an extra query
      return {
        ...params.session,
        user: {
          ...params.session.user,
          role: dbUser?.role ?? "customer",
        },
      };
    },
  },
  // Configure OAuth social providers for one-click login
  socialProviders: {
    // GitHub OAuth app configuration with client ID, secret, and the dynamic callback URL
    github: {
      clientId: env.BETTER_AUTH_GITHUB_CLIENT_ID,
      clientSecret: env.BETTER_AUTH_GITHUB_CLIENT_SECRET,
      redirectURI: `${env.BETTER_AUTH_URL}/api/auth/callback/github`,
    },
    // Google OAuth app configuration with client ID, secret, and the dynamic callback URL
    google: {
      clientId: env.BETTER_AUTH_GOOGLE_CLIENT_ID,
      clientSecret: env.BETTER_AUTH_GOOGLE_CLIENT_SECRET,
      redirectURI: `${env.BETTER_AUTH_URL}/api/auth/callback/google`,
    },
  },
});

// Export the Session type inferred from the better-auth instance for use in other parts of the app
export type Session = typeof auth.$Infer.Session;
