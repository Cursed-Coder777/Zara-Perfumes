// Import fetchRequestHandler from the tRPC server-side fetch adapter — transforms tRPC into a Next.js App Router route handler
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
// Import the NextRequest type for typing the request parameter
import { type NextRequest } from "next/server";

// Import the validated environment variables (for NODE_ENV check in error logging)
import { env } from "~/env";
// Import the appRouter — the merged root router containing all tRPC procedures
import { appRouter } from "~/server/api/root";
// Import createTRPCContext to build the request context (headers, session, database) for each tRPC call
import { createTRPCContext } from "~/server/api/trpc";

// createContext wraps createTRPCContext to provide request headers for HTTP-based tRPC calls from client components
const createContext = async (req: NextRequest) => {
  return createTRPCContext({
    headers: req.headers,
  });
};

// The main request handler that tRPC uses to process incoming API requests — supports both GET and POST
const handler = (req: NextRequest) =>
  fetchRequestHandler({
    // The endpoint prefix that matches the route file location
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    // Create the tRPC context for this request
    createContext: () => createContext(req),
    // In development mode, log errors with the procedure path and error message for debugging
    onError:
      env.NODE_ENV === "development"
        ? ({ path, error }) => {
            console.error(`❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`);
          }
        : undefined,
  });

// Export the handler for both GET and POST HTTP methods — tRPC uses POST for mutations/queries and GET for streaming
export { handler as GET, handler as POST };
