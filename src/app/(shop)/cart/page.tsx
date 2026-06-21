// Mark this component as a Client Component for interactivity (hooks, mutations, client-side state)
"use client";

// Import the tRPC React client for querying cart items and mutating quantities
import { api } from "~/trpc/react";
// Import useSession to check if the user is authenticated before showing cart
import { useSession } from "~/lib/use-session";
// Import Link for client-side navigation to auth and product pages
import Link from "next/link";

// CartPage displays the user's shopping cart with item list, quantity controls, order summary, and checkout link
export default function CartPage() {
  // Fetch the current session — cart data only loads when the user is authenticated
  const { data: session } = useSession();
  // Query the user's cart items via tRPC; only enabled when a session exists
  const { data: cartItems, isLoading } = api.cart.list.useQuery(undefined, {
    enabled: !!session,
  });
  // Get the tRPC utility object for cache invalidation after mutating cart items
  const utils = api.useUtils();
  // Mutation to update the quantity of a cart item; invalidates the cart list cache on success
  const updateQty = api.cart.updateQuantity.useMutation({
    onSuccess: () => utils.cart.list.invalidate(),
  });
  // Mutation to remove an item from the cart; invalidates the cart list cache on success
  const removeItem = api.cart.remove.useMutation({
    onSuccess: () => utils.cart.list.invalidate(),
  });

  // If the user is not signed in, show a prompt with a link to the sign-in page
  if (!session) {
    return (
      <div className="pt-32 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm uppercase tracking-widest text-neutral-400 mb-4">
            Sign in to view your cart
          </p>
          <Link href="/auth" className="inline-flex items-center justify-center px-8 py-3 text-sm font-medium uppercase tracking-widest transition-all duration-300 bg-neutral-950 text-neutral-50 hover:bg-neutral-800 dark:bg-neutral-50 dark:text-neutral-950 dark:hover:bg-neutral-200 text-xs">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  // Show a loading indicator while cart items are being fetched
  if (isLoading) {
    return (
      <div className="pt-32 min-h-screen flex items-center justify-center">
        <div className="text-sm uppercase tracking-widest text-neutral-400">Loading...</div>
      </div>
    );
  }

  // Calculate the total price of all cart items by finding the matching size's price (or fallback to base price) multiplied by quantity
  const total = (cartItems ?? []).reduce((sum, item) => {
    const size = item.product.sizes.find((s) => s.ml === item.size);
    return sum + (size?.price ?? item.product.price) * item.quantity;
  }, 0);

  // Render the cart page with item list, quantity controls, and order summary sidebar
  return (
    <div className="pt-32 pb-16 md:pb-24 min-h-screen">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        {/* Page header with "Your Selection" label and "Shopping Cart" title */}
        <div className="mb-12 md:mb-16">
          <p className="text-xs uppercase tracking-[0.3em] mb-3 text-neutral-400">
            Your Selection
          </p>
          <h1 className="font-serif text-3xl md:text-5xl tracking-tight leading-tight">Shopping Cart</h1>
        </div>

        {/* If the cart is empty, show an empty state with a link to browse products */}
        {!cartItems?.length ? (
          <div className="py-24 text-center">
            <p className="text-neutral-400 text-sm uppercase tracking-widest mb-4">
              Your cart is empty
            </p>
            <Link href="/products" className="inline-flex items-center justify-center px-8 py-3 text-sm font-medium uppercase tracking-widest transition-all duration-300 bg-neutral-950 text-neutral-50 hover:bg-neutral-800 dark:bg-neutral-50 dark:text-neutral-950 dark:hover:bg-neutral-200 text-xs">
              Browse Fragrances
            </Link>
          </div>
        ) : (
          // Cart content layout: 2/3 width for item list, 1/3 for order summary
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Cart items list — takes 2 of 3 columns on large screens */}
            <div className="lg:col-span-2 space-y-6">
              {cartItems.map((item) => {
                // Find the selected size's price for this item, or fall back to the base product price
                const size = item.product.sizes.find((s) => s.ml === item.size);
                const itemPrice = size?.price ?? item.product.price;

                return (
                  // Individual cart item row with product image, info, quantity controls, and remove button
                  <div
                    key={item.id}
                    className="flex gap-6 pb-6 border-b border-neutral-200 dark:border-neutral-800"
                  >
                    {/* Product thumbnail image or placeholder Z logo */}
                    <div className="w-24 h-32 bg-neutral-100 dark:bg-neutral-900 flex-shrink-0 overflow-hidden">
                      {item.product.images[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <span className="font-serif text-2xl text-neutral-300 dark:text-neutral-700">
                            Z
                          </span>
                        </div>
                      )}
                    </div>
                    {/* Product details: name, size, quantity controls, price, and remove */}
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        {/* Product name linking to the product detail page */}
                        <Link
                          href={`/products/${item.product.slug}`}
                          className="font-serif text-lg hover:opacity-60 transition-opacity"
                        >
                          {item.product.name}
                        </Link>
                        {/* Display the selected size in ml */}
                        <p className="text-xs text-neutral-400 mt-1">
                          {item.size}ml
                        </p>
                      </div>
                      {/* Bottom row: quantity controls (-/+) and price with remove button */}
                      <div className="flex items-center justify-between">
                        {/* Decrement/increment quantity buttons with current count displayed */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() =>
                              updateQty.mutate({
                                id: item.id,
                                quantity: Math.max(0, item.quantity - 1),
                              })
                            }
                            className="w-8 h-8 border border-neutral-200 dark:border-neutral-800 text-sm"
                          >
                            −
                          </button>
                          <span className="text-sm w-6 text-center">{item.quantity}</span>
                          <button
                            onClick={() =>
                              updateQty.mutate({ id: item.id, quantity: item.quantity + 1 })
                            }
                            className="w-8 h-8 border border-neutral-200 dark:border-neutral-800 text-sm"
                          >
                            +
                          </button>
                        </div>
                        {/* Price for the line item and a remove button */}
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-medium">
                            ${((itemPrice * item.quantity) / 100).toFixed(2)}
                          </span>
                          <button
                            onClick={() => removeItem.mutate({ id: item.id })}
                            className="text-xs text-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-50 uppercase tracking-widest transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order summary sidebar — subtotal, shipping note, and checkout button */}
            <div className="lg:col-span-1">
              <div className="border border-neutral-200 dark:border-neutral-800 p-8">
                <h2 className="text-sm uppercase tracking-widest mb-6">Order Summary</h2>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500">Subtotal</span>
                    <span>${(total / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500">Shipping</span>
                    <span>Calculated at checkout</span>
                  </div>
                </div>
                <div className="h-px w-full bg-neutral-200 dark:bg-neutral-800 mb-6" />
                {/* Checkout link navigates to the checkout page */}
                <Link href="/checkout" className="inline-flex items-center justify-center px-8 py-3 text-sm font-medium uppercase tracking-widest transition-all duration-300 bg-neutral-950 text-neutral-50 hover:bg-neutral-800 dark:bg-neutral-50 dark:text-neutral-950 dark:hover:bg-neutral-200 w-full text-center">
                  Checkout
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
