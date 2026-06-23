// Mark this module as a Client Component — it provides the tRPC client and React provider for browser usage
"use client";

// Import QueryClientProvider and the QueryClient type from TanStack React Query for managing server-state caching
import { type QueryClient,QueryClientProvider } from "@tanstack/react-query";
// Import httpBatchStreamLink (streaming batch HTTP link) and loggerLink (dev logging) from tRPC client
import { httpBatchStreamLink, loggerLink } from "@trpc/client";
// Import createTRPCReact to generate a type-safe tRPC React hooks object
import { createTRPCReact } from "@trpc/react-query";
// Import inference helpers for extracting input/output types from the router
import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server";
// Import useState to memoize the tRPC client creation
import { useState } from "react";
// Import SuperJSON for serialization — handles Date, Map, Set, and other types that JSON doesn't support
import SuperJSON from "superjson";

// Import the AppRouter type for full end-to-end type safety
import { type AppRouter } from "~/server/api/root";

// Import the createQueryClient factory that produces a properly configured QueryClient
import { createQueryClient } from "./query-client";

// Singleton reference to the query client — reused on the browser, always fresh on the server
let clientQueryClientSingleton: QueryClient | undefined = undefined;
// getQueryClient returns a QueryClient: on the server it creates a new one each time, on the browser it uses a singleton
const getQueryClient = () => {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return createQueryClient();
  }
  // Browser: use singleton pattern to keep the same query client
  clientQueryClientSingleton ??= createQueryClient();

  return clientQueryClientSingleton;
};

// Create the typed tRPC React object — this is what client components import as `api` for hooks like useQuery
export const api = createTRPCReact<AppRouter>();

// Inference helper for inputs — extracts input types from the AppRouter for type-safe procedure calls
export type RouterInputs = inferRouterInputs<AppRouter>;

// Inference helper for outputs — extracts output types from the AppRouter for type-safe response handling
export type RouterOutputs = inferRouterOutputs<AppRouter>;

// TRPCReactProvider is a client component that wraps children with both QueryClientProvider and tRPC api.Provider
export function TRPCReactProvider(props: { children: React.ReactNode }) {
  // Get or create the QueryClient (singleton in browser, fresh on server)
  const queryClient = getQueryClient();

  // Memoize the tRPC client creation with useState — only creates once per component mount
  const [trpcClient] = useState(() =>
    api.createClient({
      links: [
        // Logger link: in development mode, log all operations; also log errors in production
        loggerLink({
          enabled: (op) =>
            process.env.NODE_ENV === "development" ||
            (op.direction === "down" && op.result instanceof Error),
        }),
        // HTTP batch streaming link: sends requests to /api/trpc with SuperJSON transformer and a custom header
        httpBatchStreamLink({
          transformer: SuperJSON,
          url: getBaseUrl() + "/api/trpc",
          headers: () => {
            const headers = new Headers();
            headers.set("x-trpc-source", "nextjs-react");
            return headers;
          },
        }),
      ],
    }),
  );

  return (
    // React Query provider manages all query/mutation caching
    <QueryClientProvider client={queryClient}>
      {/* tRPC provider connects the tRPC client to React Query for seamless RPC calls */}
      <api.Provider client={trpcClient} queryClient={queryClient}>
        {props.children}
      </api.Provider>
    </QueryClientProvider>
  );
}

// Helper to determine the base URL for tRPC API calls — uses window origin in browser, VERCEL_URL on Vercel, or localhost in dev
function getBaseUrl() {
  if (typeof window !== "undefined") return window.location.origin;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
}
