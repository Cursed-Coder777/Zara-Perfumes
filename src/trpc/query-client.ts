// Import the defaultShouldDehydrateQuery helper and the QueryClient class from TanStack React Query
import {
  defaultShouldDehydrateQuery,
  QueryClient,
} from "@tanstack/react-query";
// Import SuperJSON for custom serialization/deserialization of complex types (Date, Map, etc.)
import SuperJSON from "superjson";

// createQueryClient is a factory function that returns a new QueryClient with pre-configured options for SSR and SuperJSON serialization
export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000,
        refetchOnWindowFocus: false,
        gcTime: 5 * 60 * 1000,
      },
      dehydrate: {
        // Use SuperJSON to serialize query data before sending it from server to client
        serializeData: SuperJSON.serialize,
        // Dehydrate a query if the default heuristic says so, OR if the query is still pending (loading state)
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
      hydrate: {
        // Use SuperJSON to deserialize query data when rehydrating on the client
        deserializeData: SuperJSON.deserialize,
      },
    },
  });
