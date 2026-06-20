// Import Zod for validating the order ID input on the getById procedure
import { z } from "zod";
// Import Drizzle helpers for building WHERE clauses and DESC sorting
import { eq, desc } from "drizzle-orm";
// Import tRPC utilities: router factory and protected procedure (requires authentication)
import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";
// Import the Drizzle schema for the order table
import { order } from "~/server/db/schema";

// Create and export the tRPC router for authenticated order-related operations
export const orderRouter = createTRPCRouter({
  // Protected procedure: list all orders belonging to the current user, newest first
  list: protectedProcedure.query(async ({ ctx }) => {
    // Query all orders for this user, including their line items, sorted by creation date
    return await ctx.db.query.order.findMany({
      // Only return orders owned by the authenticated user
      where: eq(order.userId, ctx.session.user.id),
      // Eagerly load the associated orderItem records for each order
      with: { items: true },
      // Sort with the most recently created order first
      orderBy: desc(order.createdAt),
    });
  }),

  // Protected procedure: fetch a single order by its primary key ID
  getById: protectedProcedure
    // Accept the numeric order ID from the client
    .input(z.object({ id: z.number() }))
    // Query handler fetches the order by ID
    .query(async ({ ctx, input }) => {
      // Find the first order matching the given ID, including its line items
      const item = await ctx.db.query.order.findFirst({
        where: eq(order.id, input.id),
        // Include the nested orderItem records in the same query
        with: { items: true },
      });
      // Return the order or null if no order with that ID exists
      return item ?? null;
    }),
});
