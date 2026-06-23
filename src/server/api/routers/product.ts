// Import Zod for runtime validation of procedure input schemas
// Import Drizzle ORM helpers for building SQL WHERE, LIKE, sort, and compound conditions
import { and,asc, desc, eq, like } from "drizzle-orm";
import { z } from "zod";

// Import tRPC utilities: router factory, public (unauthenticated), and protected (authenticated) procedure builders
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
// Import Drizzle schema objects for the product and category database tables
import { category,product } from "~/server/db/schema";

// Create and export the tRPC router that groups all public product- and category-related endpoints
export const productRouter = createTRPCRouter({
  // Public procedure: list products with optional filtering, search, sorting, and pagination
  list: publicProcedure
    // Accept optional filter, search, and pagination parameters from the client
    .input(
      z.object({
        // Filter by the category URL slug (e.g. "floral") — resolves to a categoryId internally
        categorySlug: z.string().optional(),
        // Full-text search term matched against the product name using a SQL LIKE query
        search: z.string().optional(),
        // Sort order: newest first, ascending price, or descending price
        sort: z.enum(["newest", "price-asc", "price-desc"]).optional(),
        // When true, only return products where isFeatured is true
        featured: z.boolean().optional(),
        // Maximum number of products to return per page (pagination limit)
        limit: z.number().default(50),
        // Number of products to skip before returning results (pagination offset)
        offset: z.number().default(0),
      }),
    )
    // Handler receives the validated input and the request context (including DB session)
    .query(async ({ ctx, input }) => {
      // Accumulator array for Drizzle WHERE conditions, built conditionally below
      const conditions = [];
      // If the client specified a category slug, look up the corresponding category record
      if (input.categorySlug) {
        // Query the categories table for the first row whose slug matches
        const cat = await ctx.db.query.category.findFirst({
          where: eq(category.slug, input.categorySlug),
        });
        // If a matching category exists, add a condition filtering products by that category's ID
        if (cat) conditions.push(eq(product.categoryId, cat.id));
      }
      // If a search term is provided, add a LIKE condition on the product name
      if (input.search) {
        conditions.push(like(product.name, `%${input.search}%`));
      }
      // If the featured flag is set, add an equality condition on the isFeatured column
      if (input.featured) {
        conditions.push(eq(product.isFeatured, true));
      }

      // Determine the ORDER BY clause based on the sort input
      const orderBy =
        // Ascending price sort
        input.sort === "price-asc"
          ? asc(product.price)
          : // Descending price sort
            input.sort === "price-desc"
            ? desc(product.price)
            : // Default: newest products first
              desc(product.createdAt);

      // Execute the main products query with the accumulated filters, sort, and pagination
      const items = await ctx.db.query.product.findMany({
        // Combine all conditions with AND; if none, pass undefined to skip WHERE
        where: conditions.length ? and(...conditions) : undefined,
        // Apply the dynamically chosen sort order
        orderBy,
        // Limit the number of results to the requested page size
        limit: input.limit,
        // Skip the requested number of records for offset-pagination
        offset: input.offset,
        // Eagerly load the related category for each product in the same query
        with: { category: true },
      });

      // Return the filtered, sorted, and paginated list of products
      return items;
    }),

  // Public procedure: fetch a single product by its URL-friendly slug
  getBySlug: publicProcedure
    // Require a non-empty slug string from the client
    .input(z.object({ slug: z.string() }))
    // Handler uses the slug to look up a single product
    .query(async ({ ctx, input }) => {
      // Find the first product record whose slug equals the input value
      const item = await ctx.db.query.product.findFirst({
        where: eq(product.slug, input.slug),
        // Include the related category data for display on the product detail page
        with: { category: true },
      });
      // Return the product object, or null if no product with that slug exists
      return item ?? null;
    }),

  // Public procedure: fetch a single product by its primary-key database ID
  getById: publicProcedure
    // Require a numeric product ID from the client
    .input(z.object({ id: z.number() }))
    // Handler uses the ID to look up a single product
    .query(async ({ ctx, input }) => {
      // Find the first product record whose id equals the input value
      const item = await ctx.db.query.product.findFirst({
        where: eq(product.id, input.id),
        // Include the related category data
        with: { category: true },
      });
      // Return the product object, or null if not found
      return item ?? null;
    }),

  // Public procedure: fetch all product categories, sorted alphabetically by name
  categories: publicProcedure.query(async ({ ctx }) => {
    // Query all categories ordered by name ascending for a consistent listing
    return await ctx.db.query.category.findMany({
      orderBy: asc(category.name),
    });
  }),
});
