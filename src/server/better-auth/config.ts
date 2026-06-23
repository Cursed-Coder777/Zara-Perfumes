// Import the main better-auth factory for creating the authentication instance
import { betterAuth } from "better-auth";
// Import the Drizzle ORM adapter so better-auth can read/write users, sessions, accounts, and verifications
import { drizzleAdapter } from "better-auth/adapters/drizzle";

// Import validated environment variables for OAuth client IDs/secrets and other settings
import { env } from "~/env";
// Import the Drizzle database instance so the adapter can perform queries
import { db } from "~/server/db";

// Lazy-initialized better-auth instance — avoids crashing during build when env vars aren't available
let _auth: ReturnType<typeof betterAuth> | null = null;

export function getAuth(): ReturnType<typeof betterAuth> {
  _auth ??= betterAuth({
    secret: env.BETTER_AUTH_SECRET ?? process.env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL ?? process.env.BETTER_AUTH_URL,
    database: drizzleAdapter(db, {
      provider: "pg",
    }),
    emailAndPassword: {
      enabled: true,
      autoSignIn: true,
    },
    username: {
      enabled: true,
    },
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "customer",
        required: false,
        input: false,
      },
    },
    session: {
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60,
      },
    },
    callbacks: {
      session: async (params: {
        session: { user: { id: string; email: string; name: string; image?: string | null } };
      }) => {
        const dbUser = await db.query.user.findFirst({
          where: (u, { eq }) => eq(u.id, params.session.user.id),
          columns: { role: true },
        });
        return {
          ...params.session,
          user: {
            ...params.session.user,
            role: dbUser?.role ?? "customer",
          },
        };
      },
    },
    socialProviders: {
      github: {
        clientId: env.BETTER_AUTH_GITHUB_CLIENT_ID,
        clientSecret: env.BETTER_AUTH_GITHUB_CLIENT_SECRET,
        redirectURI: `${env.BETTER_AUTH_URL}/api/auth/callback/github`,
      },
      google: {
        clientId: env.BETTER_AUTH_GOOGLE_CLIENT_ID,
        clientSecret: env.BETTER_AUTH_GOOGLE_CLIENT_SECRET,
        redirectURI: `${env.BETTER_AUTH_URL}/api/auth/callback/google`,
      },
    },
  }) as unknown as ReturnType<typeof betterAuth>;
  return _auth;
}

// Session type is available via `typeof authClient.$Infer.Session` from "./client"
