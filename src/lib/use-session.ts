// Mark this hook as a Client Component so it can use React Query's useQuery hook and browser-side auth client
"use client";

// Import the useQuery hook from TanStack React Query for caching and re-fetching the session
import { useQuery } from "@tanstack/react-query";

// Import the browser-side better-auth client to make session fetch requests from the client
import { authClient } from "~/server/better-auth/client";

// Define and export a React hook that fetches the current user session via better-auth and caches it with React Query
export function useSession() {
  return useQuery({
    // Use a static query key so React Query can deduplicate and cache the session across components
    queryKey: ["session"],
    // Async function that calls the better-auth client's getSession API
    queryFn: async () => {
      // Call the client method; the response contains a `data` property with the session or null
      const { data } = await authClient.getSession();
      // Cast the raw data to a strongly typed shape with the user fields that the app requires (including role)
      return data as unknown as {
        user: {
          id: string;
          name: string;
          email: string;
          image?: string | null;
          role: string;
        };
      } | null;
    },
  });
}
