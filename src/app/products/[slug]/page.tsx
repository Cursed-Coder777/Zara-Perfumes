// Mark this component as a Client Component for interactivity — size selection, add-to-cart mutation, and session-aware UI
"use client";

// Import useState for managing the selected size state
import { useState } from "react";
// Import useParams to read the product slug from the URL and useRouter for navigation after add-to-cart
import { useParams, useRouter } from "next/navigation";
// Import the tRPC React client for fetching product details by slug and adding items to cart
import { api } from "~/trpc/react";
// Import useSession to check if the user is authenticated before showing the add-to-cart button
import { useSession } from "~/lib/use-session";
// Import Link for client-side navigation to the auth page and products listing
import Link from "next/link";

// ProductDetailPage is the product detail view — fetches a single product by URL slug, shows image/info/sizes, and allows adding to cart
export default function ProductDetailPage() {
  // Extract the slug parameter from the dynamic route segment [slug]
  const params = useParams<{ slug: string }>();
  // Initialize the Next.js router for navigation after cart mutations
  const router = useRouter();
  // Fetch the product by slug via tRPC; shows loading state while fetching
  const { data: product, isLoading } = api.product.getBySlug.useQuery({
    slug: params.slug,
  });
  // Fetch the current session to conditionally show "Add to Cart" vs "Sign In to Purchase"
  const { data: session } = useSession();
  // State for the currently selected size (in ml); null means the user hasn't explicitly chosen
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  // Mutation to add a product to the cart; refreshes the page on success to update the cart badge
  const addToCart = api.cart.add.useMutation({
    onSuccess: () => router.refresh(),
  });

  // Show a centered loading spinner while the product query is in flight
  if (isLoading) {
    return (
      <div className="pt-32 min-h-screen flex items-center justify-center">
        <div className="text-sm uppercase tracking-widest text-neutral-400">Loading...</div>
      </div>
    );
  }

  // If the product was not found (null/undefined), show a "not found" state with a link back to the collection
  if (!product) {
    return (
      <div className="pt-32 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm uppercase tracking-widest text-neutral-400 mb-4">
            Product not found
          </p>
          <Link href="/products" className="inline-flex items-center justify-center px-8 py-3 text-sm font-medium uppercase tracking-widest transition-all duration-300 border border-neutral-950 text-neutral-950 hover:bg-neutral-950 hover:text-neutral-50 dark:border-neutral-50 dark:text-neutral-50 dark:hover:bg-neutral-50 dark:hover:text-neutral-950 text-xs">
            Back to Collection
          </Link>
        </div>
      </div>
    );
  }

  // Determine the default size: user-selected size, or the first available size in the product's sizes array, or 0
  const defaultSize = selectedSize ?? product.sizes[0]?.ml ?? 0;
  // Find the full size data object for the default size to get its specific price
  const selectedSizeData = product.sizes.find((s) => s.ml === defaultSize);
  // Display price: either the size-specific price or the base product price
  const displayPrice = selectedSizeData?.price ?? product.price;

  // Render the full product detail page with image, info, size selector, and add-to-cart button
  return (
    <div className="pt-32 pb-16 md:pb-24 min-h-screen">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        {/* Two-column layout: product image on the left, details on the right */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24">
          {/* Product image placeholder or actual image with a 3:4 aspect ratio */}
          <div className="aspect-[3/4] bg-neutral-100 dark:bg-neutral-900 overflow-hidden">
            {product.images[0] ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <span className="font-serif text-8xl text-neutral-300 dark:text-neutral-700">
                  Z
                </span>
              </div>
            )}
          </div>

          {/* Product details section — category name, product name, scent notes, description, size options, price, and add-to-cart */}
          <div className="flex flex-col justify-center">
            {/* Category label above the product name */}
            <p className="text-xs uppercase tracking-[0.3em] mb-3 text-neutral-400">
              {product.category?.name ?? "Fragrance"}
            </p>
            {/* Product name in the serif font */}
            <h1 className="font-serif text-3xl md:text-5xl tracking-tight leading-tight mb-4">{product.name}</h1>

            {/* Scent notes (if available) — displayed as muted descriptive text */}
            {product.scentNotes && (
              <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed mb-8">
                {product.scentNotes}
              </p>
            )}

            {/* Full description (if available) — displayed below scent notes */}
            {product.description && (
              <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed mb-8">
                {product.description}
              </p>
            )}

            {/* Size selector — renders a button for each available size showing ml and price */}
            <div className="mb-8">
              <p className="text-xs uppercase tracking-widest mb-3 text-neutral-500">
                Size
              </p>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map((size) => (
                  <button
                    key={size.ml}
                    onClick={() => setSelectedSize(size.ml)}
                    className={`px-5 py-3 text-xs uppercase tracking-widest border transition-all duration-200 ${
                      defaultSize === size.ml
                        ? "bg-neutral-950 text-neutral-50 dark:bg-neutral-50 dark:text-neutral-950 border-neutral-950 dark:border-neutral-50"
                        : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-950 dark:hover:border-neutral-50"
                    }`}
                  >
                    {size.ml}ml — ${(size.price / 100).toFixed(2)}
                  </button>
                ))}
              </div>
            </div>

            {/* Price display and stock indicator */}
            <div className="flex items-center gap-4 mb-8">
              <span className="font-serif text-3xl">
                ${(displayPrice / 100).toFixed(2)}
              </span>
              <span className="text-xs text-neutral-400 uppercase tracking-wider">
                {product.stock > 0 ? "In Stock" : "Out of Stock"}
              </span>
            </div>

            {/* If the user is authenticated, show "Add to Cart" button; otherwise, show "Sign In to Purchase" link */}
            {session ? (
              <button
                onClick={() =>
                  addToCart.mutate({
                    productId: product.id,
                    size: defaultSize,
                    quantity: 1,
                  })
                }
                disabled={addToCart.isPending || product.stock === 0}
                className="inline-flex items-center justify-center px-8 py-3 text-sm font-medium uppercase tracking-widest transition-all duration-300 bg-neutral-950 text-neutral-50 hover:bg-neutral-800 dark:bg-neutral-50 dark:text-neutral-950 dark:hover:bg-neutral-200 w-full md:w-auto"
              >
                {addToCart.isPending ? "Adding..." : "Add to Cart"}
              </button>
            ) : (
              <Link href="/auth" className="inline-flex items-center justify-center px-8 py-3 text-sm font-medium uppercase tracking-widest transition-all duration-300 bg-neutral-950 text-neutral-50 hover:bg-neutral-800 dark:bg-neutral-50 dark:text-neutral-950 dark:hover:bg-neutral-200 w-full md:w-auto text-center">
                Sign In to Purchase
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
