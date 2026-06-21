// Import Zod for validating shipping-address inputs
import { z } from "zod";
// Import tRPC's error class to throw structured HTTP-like errors (e.g. BAD_REQUEST)
import { TRPCError } from "@trpc/server";
// Import tRPC utilities: router factory and protected procedure (user must be logged in)
import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";
// Import Drizzle schemas for the cartItem, order, and orderItem tables
import { cartItem, order, orderItem } from "~/server/db/schema";
// Import the Drizzle eq helper for building WHERE clauses
import { eq } from "drizzle-orm";
// Import the Stripe lazy initializer (avoids crash during build when env vars aren't available)
import { getStripe } from "~/lib/stripe";

// Create and export the tRPC router for the checkout flow — creates an order then a Stripe session
export const checkoutRouter = createTRPCRouter({
  // Protected procedure: create an order from the user's cart and initiate a Stripe Checkout Session
  createSession: protectedProcedure
    // Accept shipping details required for order fulfillment
    .input(
      z.object({
        shippingName: z.string().min(1),
        shippingAddress: z.string().min(1),
        shippingCity: z.string().min(1),
        shippingPostalCode: z.string().min(1),
        shippingCountry: z.string().min(1),
      }),
    )
    // Mutation: creates database records and calls Stripe's API
    .mutation(async ({ ctx, input }) => {
      // Fetch all cart items for the current user, including nested product data
      const items = await ctx.db.query.cartItem.findMany({
        where: eq(cartItem.userId, ctx.session.user.id),
        with: { product: true },
      });

      // Guard: if the cart is empty, reject the checkout with a BAD_REQUEST error
      if (!items.length) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Cart is empty" });
      }

      // Use a database transaction so the entire order creation is atomic
      const createdOrder = await ctx.db.transaction(async (tx) => {
        // Insert the order row with pending status and computed total
        const [newOrder] = await tx
          .insert(order)
          .values({
            // Link the order to the authenticated user
            userId: ctx.session.user.id,
            // Initial status is "pending" — changes to "paid" after Stripe confirms
            status: "pending",
            // Compute the total by finding the correct size price for each item
            totalAmount: items.reduce((sum, item) => {
              // Find the price for the specific size (ml) chosen by the user
              const size = item.product.sizes.find((s) => s.ml === item.size);
              // Use the size-specific price, or fall back to the base price
              return sum + (size?.price ?? item.product.price) * item.quantity;
            }, 0),
            // Persist the shipping details from the input
            shippingName: input.shippingName,
            shippingAddress: input.shippingAddress,
            shippingCity: input.shippingCity,
            shippingPostalCode: input.shippingPostalCode,
            shippingCountry: input.shippingCountry,
          })
          // Use .returning() to get back the inserted row (including the new ID)
          .returning();

        // Guard: if the insert didn't return a row, throw an internal error
        if (!newOrder) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create order" });

        // Insert one orderItem row per cart item, snapshotting product details at purchase time
        await tx.insert(orderItem).values(
          items.map((item) => {
            // Re-derive the size-specific price for the order-line snapshot
            const size = item.product.sizes.find((s) => s.ml === item.size);
            return {
              // Foreign key linking back to the newly created order
              orderId: newOrder.id,
              // FK to the product (still references the current product row)
              productId: item.product.id,
              // Snapshot the product name so it persists even if the product is later renamed
              productName: item.product.name,
              // Snapshot the first product image for the order receipt
              productImage: item.product.images[0] ?? null,
              // Snapshot the unit price at the time of purchase
              price: size?.price ?? item.product.price,
              // Store the chosen size (ml)
              size: item.size,
              // Store the quantity purchased
              quantity: item.quantity,
            };
          }),
        );

        // Clear the user's cart now that the order has been created from it
        await tx
          .delete(cartItem)
          .where(eq(cartItem.userId, ctx.session.user.id));

        // Return the newly created order so the outer scope can use its ID
        return newOrder;
      });

      // Safety check: if the transaction somehow returned undefined, throw an error
      if (!createdOrder) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create order" });

      // Create a Stripe Checkout Session for payment collection
      const stripeSession = await getStripe().checkout.sessions.create({
        // One-time payment mode (not subscription)
        mode: "payment",
        // Map each cart item to a Stripe line item with price_data
        line_items: items.map((item) => {
          // Find the size-specific price for this item
          const size = item.product.sizes.find((s) => s.ml === item.size);
          const unitPrice = size?.price ?? item.product.price;
          return {
            // Define inline price data (no Stripe Price object needed)
            price_data: {
              // Currency set to USD
              currency: "usd",
              // Product metadata for display on Stripe's checkout page
              product_data: {
                // Show the product name and chosen size in the line-item description
                name: `${item.product.name} (${item.size}ml)`,
                // Pass the first product image if available
                images: item.product.images.length ? [item.product.images[0]!] : [],
              },
              // Price in cents (Stripe's smallest currency unit)
              unit_amount: unitPrice,
            },
            // Quantity of this line item
            quantity: item.quantity,
          };
        }),
        // Attach the order ID as metadata so the Stripe webhook can reconcile payment
        metadata: {
          orderId: String(createdOrder.id),
        },
        // Redirect the user here after successful payment
        success_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/order/${createdOrder.id}?success=true`,
        // Redirect the user here if they cancel the checkout
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/cart`,
      });

      // Persist the Stripe session ID on the order so the webhook can look it up
      await ctx.db
        .update(order)
        .set({ stripeSessionId: stripeSession.id })
        .where(eq(order.id, createdOrder.id));

      // Return the Stripe Checkout URL so the client can redirect the browser
      return { url: stripeSession.url };
    }),
});
