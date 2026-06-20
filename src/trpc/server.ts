// Enforce that this module is only imported on the server — never bundled into client code
import "server-only";

// Import createHydrationHelpers to generate the server-side `api` caller and HydrateClient component
import { createHydrationHelpers } from "@trpc/react-query/rsc";
// Import the headers function from next/headers to read request headers for context creation
import { headers } from "next/headers";
// Import React's cache function to deduplicate context creation and query client creation within the same request
import { cache } from "react";

// Import createCaller (to create a server-side tRPC caller) and the AppRouter type
import { createCaller, type AppRouter } from "~/server/api/root";
// Import createTRPCContext to build the request context (headers, session, etc.) for each tRPC call
import { createTRPCContext } from "~/server/api/trpc";
// Import the createQueryClient factory for SSR-compatible query client creation
import { createQueryClient } from "./query-client";

// createContext is a cached function that builds the tRPC context for server components — adds a "rsc" header to identify server-component calls
const createContext = cache(async () => {
  const heads = new Headers(await headers());
  heads.set("x-trpc-source", "rsc");

  return createTRPCContext({
    headers: heads,
  });
});

// Create a cached query client factory so it's reused per-request during server rendering
const getQueryClient = cache(createQueryClient);
// Create a server-side tRPC caller that automatically creates context via the createContext function
const caller = createCaller(createContext);

// Export the typed tRPC api object (for server-side data fetching) and HydrateClient (to dehydrate/rehydrate data to client)
export const { trpc: api, HydrateClient } = createHydrationHelpers<AppRouter>(
  caller,
  getQueryClient,
);
