// Import Zod for runtime validation of admin CRUD inputs
import { z } from "zod";
// Import tRPC error class for throwing structured errors (notably UNAUTHORIZED)
import { TRPCError } from "@trpc/server";
// Import Drizzle helpers for building WHERE and ORDER BY clauses
import { eq, desc } from "drizzle-orm";
// Import tRPC utilities: router factory and protected procedure (requires authentication)
import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";
// Import Drizzle schemas for the product, category, and order tables
import { product, category, order } from "~/server/db/schema";

// Create and export the tRPC router for all admin-only operations
export const adminRouter = createTRPCRouter({
  // Protected procedure: simple check to see if the current user has the admin role
  isAdmin: protectedProcedure.query(async ({ ctx }) => {
    // Return true if the user's role (from the session-enriched context) is "admin"
    return ctx.session.user.role === "admin";
  }),

  // Namespace containing all admin product sub-endpoints
  products: {
    // Protected procedure: list all products with their category (admin only)
    list: protectedProcedure.query(async ({ ctx }) => {
      // Gate check: reject non-admin users with an UNAUTHORIZED error
      if (ctx.session.user.role !== "admin") {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      // Fetch every product row, including the related category, newest first
      return await ctx.db.query.product.findMany({
        with: { category: true },
        orderBy: desc(product.createdAt),
      });
    }),

    // Protected procedure: create a new product (admin only)
    create: protectedProcedure
      // Validate all product fields required for insertion
      .input(
        z.object({
          name: z.string().min(1),
          slug: z.string().min(1),
          description: z.string().optional(),
          price: z.number().min(0),
          images: z.array(z.string()).default([]),
          sizes: z.array(z.object({ ml: z.number(), price: z.number() })).default([]),
          scentNotes: z.string().optional(),
          categoryId: z.number().optional(),
          stock: z.number().default(0),
          isFeatured: z.boolean().default(false),
        }),
      )
      // Mutation inserts a new product row
      .mutation(async ({ ctx, input }) => {
        // Gate check: only admin users can create products
        if (ctx.session.user.role !== "admin") {
          throw new TRPCError({ code: "UNAUTHORIZED" });
        }
        // Insert the validated product data directly as a new row
        await ctx.db.insert(product).values(input);
      }),

    // Protected procedure: update an existing product (admin only)
    update: protectedProcedure
      // Validate the product ID and optional fields to update
      .input(
        z.object({
          id: z.number(),
          name: z.string().min(1).optional(),
          slug: z.string().min(1).optional(),
          description: z.string().optional(),
          price: z.number().min(0).optional(),
          images: z.array(z.string()).optional(),
          sizes: z.array(z.object({ ml: z.number(), price: z.number() })).optional(),
          scentNotes: z.string().optional(),
          categoryId: z.number().optional(),
          stock: z.number().optional(),
          isFeatured: z.boolean().optional(),
        }),
      )
      // Mutation updates only the provided fields on the matching product
      .mutation(async ({ ctx, input }) => {
        // Gate check: only admin users can update products
        if (ctx.session.user.role !== "admin") {
          throw new TRPCError({ code: "UNAUTHORIZED" });
        }
        // Separate the ID from the rest of the data — ID is used in WHERE, not SET
        const { id, ...data } = input;
        // Update the product row with only the fields the client provided
        await ctx.db.update(product).set(data).where(eq(product.id, id));
      }),

    // Protected procedure: delete a product by ID (admin only)
    delete: protectedProcedure
      // Accept only the product ID to delete
      .input(z.object({ id: z.number() }))
      // Mutation removes the product row permanently
      .mutation(async ({ ctx, input }) => {
        // Gate check: only admin users can delete products
        if (ctx.session.user.role !== "admin") {
          throw new TRPCError({ code: "UNAUTHORIZED" });
        }
        // Delete the product row matching the given ID
        await ctx.db.delete(product).where(eq(product.id, input.id));
      }),
  },

  // Namespace containing all admin category sub-endpoints
  categories: {
    // Protected procedure: list all categories (admin only)
    list: protectedProcedure.query(async ({ ctx }) => {
      // Gate check: only admin users can view the category list
      if (ctx.session.user.role !== "admin") {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      // Fetch all category rows ordered by creation date descending
      return await ctx.db.query.category.findMany({ orderBy: desc(category.createdAt) });
    }),

    // Protected procedure: create a new category (admin only)
    create: protectedProcedure
      // Validate the name, slug, and optional description/image fields
      .input(
        z.object({
          name: z.string().min(1),
          slug: z.string().min(1),
          description: z.string().optional(),
          image: z.string().optional(),
        }),
      )
      // Mutation inserts a new category row
      .mutation(async ({ ctx, input }) => {
        // Gate check: only admin users can create categories
        if (ctx.session.user.role !== "admin") {
          throw new TRPCError({ code: "UNAUTHORIZED" });
        }
        // Insert the validated category data as a new row
        await ctx.db.insert(category).values(input);
      }),
  },

  // Namespace containing all admin order sub-endpoints
  orders: {
    // Protected procedure: list all orders across all users (admin only)
    list: protectedProcedure.query(async ({ ctx }) => {
      // Gate check: only admin users can view all orders
      if (ctx.session.user.role !== "admin") {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      // Fetch every order with its items and the user who placed it, newest first
      return await ctx.db.query.order.findMany({
        with: { items: true, user: true },
        orderBy: desc(order.createdAt),
      });
    }),

    // Protected procedure: update the status of a specific order (admin only)
    updateStatus: protectedProcedure
      // Accept the order ID and the new status from a fixed set of valid values
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["pending", "paid", "shipped", "delivered", "cancelled"]),
        }),
      )
      // Mutation updates just the status column on the order
      .mutation(async ({ ctx, input }) => {
        // Gate check: only admin users can update order status
        if (ctx.session.user.role !== "admin") {
          throw new TRPCError({ code: "UNAUTHORIZED" });
        }
        // Update the order's status to the new value, targeting the order by ID
        await ctx.db
          .update(order)
          .set({ status: input.status })
          .where(eq(order.id, input.id));
      }),
  },
});
