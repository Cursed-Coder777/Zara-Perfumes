/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */

// Import the tRPC server initialisation utilities and standard error type
import { initTRPC, TRPCError } from "@trpc/server";
// Import SuperJSON as the serialisation transformer (supports Date, Map, Set, BigInt, etc.)
import superjson from "superjson";
// Import ZodError for structured validation error formatting on the client side
import { ZodError } from "zod";

// Import the better-auth lazy initializer to extract session information from request headers
import { getAuth } from "~/server/better-auth";
// Import the Drizzle database instance for querying user roles in the auth middleware
import { db } from "~/server/db";
// Import the user table schema for role lookups during protected procedure validation
import { user } from "~/server/db/schema";
// Import the equality operator from Drizzle-ORM for constructing WHERE clauses
import { eq } from "drizzle-orm";

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and RSC clients each
 * wrap this and provides the required context.
 *
 * @see https://trpc.io/docs/server/context
 */
// Create the tRPC context factory: extracts the session from the incoming request headers and makes db + session available to all procedures
export const createTRPCContext = async (opts: { headers: Headers }) => {
  // Fetch the current user session from better-auth using the request headers (reads the session cookie)
  const session = await getAuth().api.getSession({
    headers: opts.headers,
  });
  // Return the database instance, the session (null if not logged in), and the raw opts (headers) for downstream use
  return {
    db,
    session,
    ...opts,
  };
};

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */
// Initialise the tRPC instance by binding the context type and configuring SuperJSON as the data transformer
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  // Custom error formatter that includes flattened Zod validation errors when a ZodError is thrown
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Create a server-side caller.
 *
 * @see https://trpc.io/docs/server/server-side-calls
 */
// Export the factory that creates a server-side caller for direct tRPC calls without HTTP
export const createCallerFactory = t.createCallerFactory;

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
// Export the router builder used to define namespaces of queries and mutations
export const createTRPCRouter = t.router;

/**
 * Middleware for timing procedure execution and adding an artificial delay in development.
 *
 * You can remove this if you don't like it, but it can help catch unwanted waterfalls by simulating
 * network latency that would occur in production but not in local development.
 */
// Define a middleware that logs execution time and adds artificial latency in dev to surface waterfall issues
const timingMiddleware = t.middleware(async ({ next, path }) => {
  // Record the start timestamp before executing the procedure
  const start = Date.now();

  // Execute the actual procedure (query or mutation) and capture its result
  const result = await next();

  // Calculate total elapsed time
  const end = Date.now();
  // Log the procedure path and its execution duration to the server console for performance monitoring
  console.log(`[TRPC] ${path} took ${end - start}ms to execute`);

  // Return the unmodified result from the inner procedure
  return result;
});

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
// Create a public procedure that applies only the timing middleware; accessible by anyone, even unauthenticated users
export const publicProcedure = t.procedure.use(timingMiddleware);

/**
 * Protected (authenticated) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use this. It verifies
 * the session is valid and guarantees `ctx.session.user` is not null.
 *
 * @see https://trpc.io/docs/procedures
 */
// Create a protected procedure that verifies authentication and injects the user's role into the context
export const protectedProcedure = t.procedure
  // First apply the generic timing middleware for performance logging
  .use(timingMiddleware)
  // Then apply an auth-checking middleware that rejects unauthenticated requests and enriches the session with the user's role
  .use(async ({ ctx, next }) => {
    // If no session or no user object exists in the context, throw an UNAUTHORIZED error to reject the request
    if (!ctx.session?.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    // Look up the user's role from the database to ensure it is current (avoid stale session claims)
    const dbUser = await db.query.user.findFirst({
      where: eq(user.id, ctx.session.user.id),
      columns: { role: true },
    });
    // Pass control to the next middleware/procedure with a session enriched by the live role from the database
    return next({
      ctx: {
        session: {
          ...ctx.session,
          user: { ...ctx.session.user, role: dbUser?.role ?? "customer" },
        },
      },
    });
  });
