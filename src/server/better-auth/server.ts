// Import the better-auth instance to call the getSession API on the server
import { auth } from ".";
// Import Next.js headers() helper to access the incoming request's headers in a server component or route handler
import { headers } from "next/headers";
// Import React's cache() function to deduplicate async function calls within a single render pass
import { cache } from "react";

// Create a cached server-side session getter: deduplicates calls during a single request and fetches the session using request headers
export const getSession = cache(async () =>
  auth.api.getSession({ headers: await headers() }),
);
