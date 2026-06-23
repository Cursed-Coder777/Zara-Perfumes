import type { Metadata } from "next";
// Import tRPC server helpers (api caller + HydrateClient) for server-side data fetching and hydration
import { api, HydrateClient } from "~/trpc/server";
// Import the client-side ProductsPage component to render the interactive product grid and filters
import { ProductsPage } from "./products-page";

export const metadata: Metadata = {
  title: "All Fragrances",
};

// Products is an async server component that fetches products and categories based on search params, then passes them to the client component
export default async function Products({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string; sort?: string }>;
}) {
  // Await the searchParams promise (Next.js 15 pattern where searchParams is async)
  const params = await searchParams;
  // Server-fetch products via tRPC with optional filters: category slug, search term, and sort order
  const products = await api.product.list({
    categorySlug: params.category,
    search: params.search,
    sort: (params.sort as "newest" | "price-asc" | "price-desc") ?? undefined,
  });
  // Server-fetch all product categories for the filter buttons
  const categories = await api.product.categories();

  return (
    // HydrateClient wraps the client component, passing server-fetched tRPC data into the client's query cache to avoid refetching
    <HydrateClient>
      <ProductsPage products={products} categories={categories} />
    </HydrateClient>
  );
}
