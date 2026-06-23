// Mark this component as a Client Component so it can use client-side routing and state for filtering
"use client";

// Import useMemo for filtering products
// Import useRouter and useSearchParams for reading URL query parameters and pushing filter updates
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

// Import the ProductCard component to render each product in the grid
import { ProductCard } from "~/components/product-card";

// Type definition for a product object as returned from the server — includes id, name, slug, price, images, scent notes, and category
type Product = {
  id: number;
  name: string;
  slug: string;
  price: number;
  images: string[];
  scentNotes: string | null;
  category: { name: string; slug: string } | null;
};

// Type definition for a category object with id, name, and slug
type Category = {
  id: number;
  name: string;
  slug: string;
};

// ProductsPage is a client component that receives server-fetched products and categories and renders a filterable product grid
export function ProductsPage({
  products,
  categories,
}: {
  products: Product[];
  categories: Category[];
}) {
  // Initialize the Next.js router for programmatic navigation when filter buttons are clicked
  const router = useRouter();
  // Read the current URL search params to get the active category filter
  const searchParams = useSearchParams();
  // Extract the "category" query parameter from the URL, defaulting to empty string for "All"
  const activeCategory = searchParams.get("category") ?? "";

  // Memoized filtered list: if a category is active, filter products by that category's slug; otherwise show all
  const filtered = useMemo(() => {
    if (!activeCategory) return products;
    return products.filter((p) => p.category?.slug === activeCategory);
  }, [products, activeCategory]);

  // Render the product listing page with category filter buttons and a grid of ProductCard components
  return (
    <div className="pt-32 pb-16 md:pb-24">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        {/* Page header with "Collection" label and "All Fragrances" title */}
        <div className="mb-12 md:mb-16">
          <p className="mb-3 text-xs tracking-[0.3em] text-neutral-400 uppercase">Collection</p>
          <h1 className="font-serif text-3xl leading-tight tracking-tight md:text-5xl">
            All Fragrances
          </h1>
        </div>

        {/* Category filter buttons — "All" button plus one button per category, updates the URL query parameter */}
        <div className="mb-12 flex flex-wrap gap-2">
          {/* "All" button — pushes to /products without any category filter */}
          <button
            onClick={() => router.push("/products")}
            className={`border px-4 py-2 text-xs tracking-widest uppercase transition-all duration-200 ${
              !activeCategory
                ? "border-neutral-950 bg-neutral-950 text-neutral-50 dark:border-neutral-50 dark:bg-neutral-50 dark:text-neutral-950"
                : "border-neutral-200 hover:border-neutral-950 dark:border-neutral-800 dark:hover:border-neutral-50"
            }`}
          >
            All
          </button>
          {/* One button per category — pushes to /products?category={slug} to filter */}
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => router.push(`/products?category=${cat.slug}`)}
              className={`border px-4 py-2 text-xs tracking-widest uppercase transition-all duration-200 ${
                activeCategory === cat.slug
                  ? "border-neutral-950 bg-neutral-950 text-neutral-50 dark:border-neutral-50 dark:bg-neutral-50 dark:text-neutral-950"
                  : "border-neutral-200 hover:border-neutral-950 dark:border-neutral-800 dark:hover:border-neutral-50"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* If no products match the filter, show an empty state message */}
        {filtered.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-sm tracking-widest text-neutral-400 uppercase">No products found</p>
          </div>
        ) : (
          // Product grid: 2 columns on mobile, 3 on tablet, 4 on desktop
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 md:gap-8 lg:grid-cols-4">
            {filtered.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
