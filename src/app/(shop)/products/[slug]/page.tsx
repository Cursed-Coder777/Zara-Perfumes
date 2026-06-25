// Mark this component as a Client Component for interactivity — size selection, add-to-cart mutation, and session-aware UI
"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import { TransitionLink } from "~/components/ui/TransitionLink";
import { usePageTitle } from "~/lib/use-page-title";
import { useSession } from "~/lib/use-session";
import { api } from "~/trpc/react";

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

  usePageTitle(product?.name ?? "Product");

  if (isLoading) {
    return (
      <div className="min-h-screen pt-32 pb-16 md:pb-24">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-24">
            <div className="aspect-[3/4] animate-pulse bg-neutral-200 dark:bg-neutral-800" />
            <div className="flex flex-col justify-center gap-6">
              <div className="h-3 w-24 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
              <div className="h-10 w-3/4 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
              <div className="space-y-2">
                <div className="h-3 w-full animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
                <div className="h-3 w-5/6 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
                <div className="h-3 w-4/6 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="h-10 w-28 animate-pulse rounded border border-neutral-200 bg-neutral-200 dark:border-neutral-800 dark:bg-neutral-800" />
                <div className="h-10 w-28 animate-pulse rounded border border-neutral-200 bg-neutral-200 dark:border-neutral-800 dark:bg-neutral-800" />
                <div className="h-10 w-28 animate-pulse rounded border border-neutral-200 bg-neutral-200 dark:border-neutral-800 dark:bg-neutral-800" />
              </div>
              <div className="h-8 w-32 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
              <div className="h-12 w-full animate-pulse rounded bg-neutral-200 dark:bg-neutral-800 md:w-64" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If the product was not found (null/undefined), show a "not found" state with a link back to the collection
  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-32">
        <div className="text-center">
          <p className="mb-4 text-sm tracking-widest text-neutral-400 uppercase">
            Product not found
          </p>
          <TransitionLink
            href="/products"
            className="inline-flex items-center justify-center border border-neutral-950 px-8 py-3 text-sm text-xs font-medium tracking-widest text-neutral-950 uppercase transition-all duration-300 hover:bg-neutral-950 hover:text-neutral-50 dark:border-neutral-50 dark:text-neutral-50 dark:hover:bg-neutral-50 dark:hover:text-neutral-950"
          >
            Back to Collection
          </TransitionLink>
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
    <div className="min-h-screen pt-32 pb-16 md:pb-24">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        {/* Two-column layout: product image on the left, details on the right */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-24">
          {/* Product image placeholder or actual image with a 3:4 aspect ratio */}
          <div className="aspect-[3/4] overflow-hidden bg-neutral-100 dark:bg-neutral-900">
            {product.images[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
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
            <p className="mb-3 text-xs tracking-[0.3em] text-neutral-400 uppercase">
              {product.category?.name ?? "Fragrance"}
            </p>
            {/* Product name in the serif font */}
            <h1 className="mb-4 font-serif text-3xl leading-tight tracking-tight md:text-5xl">
              {product.name}
            </h1>

            {/* Scent notes (if available) — displayed as muted descriptive text */}
            {product.scentNotes && (
              <p className="mb-8 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                {product.scentNotes}
              </p>
            )}

            {/* Full description (if available) — displayed below scent notes */}
            {product.description && (
              <p className="mb-8 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
                {product.description}
              </p>
            )}

            {/* Size selector — renders a button for each available size showing ml and price */}
            <div className="mb-8">
              <p className="mb-3 text-xs tracking-widest text-neutral-500 uppercase">Size</p>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map((size) => (
                  <button
                    key={size.ml}
                    onClick={() => setSelectedSize(size.ml)}
                    className={`border px-5 py-3 text-xs tracking-widest uppercase transition-all duration-200 ${
                      defaultSize === size.ml
                        ? "border-neutral-950 bg-neutral-950 text-neutral-50 dark:border-neutral-50 dark:bg-neutral-50 dark:text-neutral-950"
                        : "border-neutral-200 hover:border-neutral-950 dark:border-neutral-800 dark:hover:border-neutral-50"
                    }`}
                  >
                    {size.ml}ml — ${(size.price / 100).toFixed(2)}
                  </button>
                ))}
              </div>
            </div>

            {/* Price display and stock indicator */}
            <div className="mb-8 flex items-center gap-4">
              <span className="font-serif text-3xl">${(displayPrice / 100).toFixed(2)}</span>
              <span className="text-xs tracking-wider text-neutral-400 uppercase">
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
                className="inline-flex w-full items-center justify-center bg-neutral-950 px-8 py-3 text-sm font-medium tracking-widest text-neutral-50 uppercase transition-all duration-300 hover:bg-neutral-800 md:w-auto dark:bg-neutral-50 dark:text-neutral-950 dark:hover:bg-neutral-200"
              >
                {addToCart.isPending ? "Adding..." : "Add to Cart"}
              </button>
            ) : (
              <TransitionLink
                href="/auth"
                className="inline-flex w-full items-center justify-center bg-neutral-950 px-8 py-3 text-center text-sm font-medium tracking-widest text-neutral-50 uppercase transition-all duration-300 hover:bg-neutral-800 md:w-auto dark:bg-neutral-50 dark:text-neutral-950 dark:hover:bg-neutral-200"
              >
                Sign In to Purchase
              </TransitionLink>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
