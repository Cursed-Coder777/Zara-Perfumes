// Import Zod for validating inputs to cart mutations (productId, size, quantity)
import { z } from "zod";
// Import Drizzle helpers for building equality and compound AND conditions in SQL queries
import { eq, and } from "drizzle-orm";
// Import tRPC utilities: router factory and protected procedure (requires authentication)
import {
  createTRPCRouter,
  // protectedProcedure is the only procedure kind used here — cart is user-specific
  protectedProcedure,
} from "~/server/api/trpc";
// Import the Drizzle schema for the cartItem table, which links users to products with a chosen size
import { cartItem } from "~/server/db/schema";

// Create and export the tRPC router for all authenticated cart operations
export const cartRouter = createTRPCRouter({
  // Protected procedure: list all cart items for the currently authenticated user
  list: protectedProcedure.query(async ({ ctx }) => {
    // Fetch all rows from cartItem that belong to this user, including the related product data
    const items = await ctx.db.query.cartItem.findMany({
      // Filter by the authenticated user's ID from the session
      where: eq(cartItem.userId, ctx.session.user.id),
      // Eagerly load the full product record for each cart item (for display)
      with: { product: true },
      // Sort cart items so the most recently added appears first
      orderBy: (c, { desc }) => [desc(c.createdAt)],
    });
    // Return the full list of cart items with nested product data
    return items;
  }),

  // Protected procedure: add a product (with a specific size and quantity) to the user's cart
  add: protectedProcedure
    // Accept the product ID, the chosen size in ml, and the quantity (defaults to 1)
    .input(
      z.object({
        productId: z.number(),
        size: z.number(),
        quantity: z.number().min(1).default(1),
      }),
    )
    // Mutation: this changes the database by upserting the cartItem row
    .mutation(async ({ ctx, input }) => {
      // Check if the same user + product + size combination already exists in the cart
      const existing = await ctx.db.query.cartItem.findFirst({
        // All three conditions must match: same user, product, and size
        where: and(
          eq(cartItem.userId, ctx.session.user.id),
          eq(cartItem.productId, input.productId),
          eq(cartItem.size, input.size),
        ),
      });

      // If an existing cart item is found, increment its quantity instead of creating a duplicate
      if (existing) {
        // Update the existing row: set quantity to the sum of current and new quantities
        await ctx.db
          .update(cartItem)
          .set({ quantity: existing.quantity + input.quantity })
          // Target the specific cart item by its primary key
          .where(eq(cartItem.id, existing.id));
        // Return the existing item after updating (caller doesn't need the updated quantity yet)
        return existing;
      }

      // If no existing cart item matches, insert a brand new row for this user/product/size
      await ctx.db.insert(cartItem).values({
        // Associate the cart item with the currently authenticated user
        userId: ctx.session.user.id,
        // Reference the product being added
        productId: input.productId,
        // Store the selected size in milliliters
        size: input.size,
        // Store the requested quantity
        quantity: input.quantity,
      });
    }),

  // Protected procedure: update the quantity (or remove) a specific cart item by its ID
  updateQuantity: protectedProcedure
    // Accept the cart item's primary key ID and the new quantity (0 = remove)
    .input(
      z.object({
        id: z.number(),
        quantity: z.number().min(0),
      }),
    )
    // Mutation updates the quantity or deletes the row if quantity is zero
    .mutation(async ({ ctx, input }) => {
      // If the new quantity is zero, delete the cart item entirely
      if (input.quantity === 0) {
        // Delete the cart item row, scoped to both the item ID and the current user (ownership check)
        await ctx.db
          .delete(cartItem)
          .where(
            and(eq(cartItem.id, input.id), eq(cartItem.userId, ctx.session.user.id)),
          );
        // Early return — no update needed
        return;
      }
      // Otherwise, update the existing cart item's quantity to the new value
      await ctx.db
        .update(cartItem)
        .set({ quantity: input.quantity })
        // Scoped to the specific item ID and user ID to prevent cross-user tampering
        .where(
          and(eq(cartItem.id, input.id), eq(cartItem.userId, ctx.session.user.id)),
        );
    }),

  // Protected procedure: remove a single cart item by its primary key ID
  remove: protectedProcedure
    // Accept the cart item ID to delete
    .input(z.object({ id: z.number() }))
    // Mutation deletes the matching row from the database
    .mutation(async ({ ctx, input }) => {
      // Delete the cart item where the ID matches, ensuring it belongs to the current user
      await ctx.db
        .delete(cartItem)
        .where(
          and(eq(cartItem.id, input.id), eq(cartItem.userId, ctx.session.user.id)),
        );
    }),

  // Protected procedure: clear all cart items for the currently authenticated user
  clear: protectedProcedure.mutation(async ({ ctx }) => {
    // Delete every cartItem row associated with the current user's ID
    await ctx.db
      .delete(cartItem)
      .where(eq(cartItem.userId, ctx.session.user.id));
  }),
});
