// Import the post router (example/generic content router from the T3 template)
import { postRouter } from "~/server/api/routers/post";
// Import the product router for browsing and searching perfumes
import { productRouter } from "~/server/api/routers/product";
// Import the cart router for managing the authenticated user's shopping cart
import { cartRouter } from "~/server/api/routers/cart";
// Import the order router for viewing order history and status
import { orderRouter } from "~/server/api/routers/order";
// Import the checkout router for initiating Stripe Checkout sessions
import { checkoutRouter } from "~/server/api/routers/checkout";
// Import the admin router for admin-only operations (manage products, orders, etc.)
import { adminRouter } from "~/server/api/routers/admin";
// Import the router builder and server-side caller factory from the tRPC initialisation module
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

// Assemble the top-level application router by merging all domain-specific sub-routers under their namespaces
export const appRouter = createTRPCRouter({
  post: postRouter,
  product: productRouter,
  cart: cartRouter,
  order: orderRouter,
  checkout: checkoutRouter,
  admin: adminRouter,
});

// Export the type of the app router for type-safe client-side usage (used by tRPC React Query)
export type AppRouter = typeof appRouter;

// Create a server-side caller factory bound to the full app router for direct (non-HTTP) calls
export const createCaller = createCallerFactory(appRouter);
