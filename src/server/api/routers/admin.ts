// Import Zod for runtime validation of procedure input schemas
import { z } from "zod";
// Import Drizzle ORM helpers for building SQL WHERE equality and sort clauses
import { eq, desc } from "drizzle-orm";
// Import tRPC utilities: router factory and public (unauthenticated) procedure builder
import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";
// Import Drizzle schema objects for the product, category, and order database tables
import { product, category, order } from "~/server/db/schema";

// Create and export the tRPC router that groups all admin-only endpoints for
// managing products, categories, and orders
export const adminRouter = createTRPCRouter({
  /** Admin procedures for full CRUD on the products table. */
  products: {
    /** Public procedure: fetch every product, eagerly loading the related category. */
    list: publicProcedure.query(async ({ ctx }) => {
      return await ctx.db.query.product.findMany({
        // Include the related category data for display (e.g. category name badge)
        with: { category: true },
        // Sort newest products first
        orderBy: desc(product.createdAt),
      });
    }),

    /** Public procedure: insert a new product with all required and optional fields. */
    create: publicProcedure
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
      .mutation(async ({ ctx, input }) => {
        // Insert the full input object (every field matches the product table DDL)
        await ctx.db.insert(product).values(input);
      }),

    /** Public procedure: partial update of an existing product, identified by its ID. */
    update: publicProcedure
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
      .mutation(async ({ ctx, input }) => {
        // Separate the ID (used in WHERE) from the rest of the fields (used as SET)
        const { id, ...data } = input;
        // Apply only the provided fields; undefined fields are ignored by Drizzle
        await ctx.db.update(product).set(data).where(eq(product.id, id));
      }),

    /** Public procedure: hard-delete a product by its primary-key ID. */
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        // Destroy the row matching the given product ID
        await ctx.db.delete(product).where(eq(product.id, input.id));
      }),
  },

  /** Admin procedures for reading and creating product categories. */
  categories: {
    /** Public procedure: fetch all categories, newest first. */
    list: publicProcedure.query(async ({ ctx }) => {
      return await ctx.db.query.category.findMany({ orderBy: desc(category.createdAt) });
    }),

    /** Public procedure: insert a new category with a name, slug, and optional fields. */
    create: publicProcedure
      .input(
        z.object({
          name: z.string().min(1),
          slug: z.string().min(1),
          description: z.string().optional(),
          image: z.string().optional(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        // Insert the full input object matching the category table columns
        await ctx.db.insert(category).values(input);
      }),
  },

  /** Admin procedures for reading and updating customer orders. */
  orders: {
    /** Public procedure: fetch all orders with their line items and the user who placed them. */
    list: publicProcedure.query(async ({ ctx }) => {
      return await ctx.db.query.order.findMany({
        // Eagerly load both the order items and the user record
        with: { items: true, user: true },
        // Newest orders first
        orderBy: desc(order.createdAt),
      });
    }),

    /** Public procedure: update the status of a single order (e.g. pending → shipped). */
    updateStatus: publicProcedure
      .input(
        z.object({
          id: z.number(),
          // Restrict valid transitions to the five allowed statuses
          status: z.enum(["pending", "paid", "shipped", "delivered", "cancelled"]),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        // Set only the status column on the matching order row
        await ctx.db
          .update(order)
          .set({ status: input.status })
          .where(eq(order.id, input.id));
      }),
  },
});
