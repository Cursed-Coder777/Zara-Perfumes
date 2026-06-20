// Import the Next.js handler adapter from better-auth to transform the auth handler into a Next.js route handler
import { toNextJsHandler } from "better-auth/next-js";

// Import the configured auth instance (with Drizzle adapter and providers) from the server-side config
import { auth } from "~/server/better-auth";

// Export GET and POST handlers for the catch-all [...all] route — better-auth handles all auth endpoints (login, signup, oauth, session, etc.) under this route
export const { GET, POST } = toNextJsHandler(auth.handler);
