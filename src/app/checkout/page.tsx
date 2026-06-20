// Mark this component as a Client Component for interactivity (form state, mutations, Stripe redirect)
"use client";

// Import useState for managing shipping form fields
import { useState } from "react";
// Import useRouter for potential navigation after checkout
import { useRouter } from "next/navigation";
// Import the tRPC React client for querying cart data and creating a checkout session
import { api } from "~/trpc/react";
// Import useSession to verify the user is authenticated before showing checkout
import { useSession } from "~/lib/use-session";
// Import Link for client-side navigation to the auth page
import Link from "next/link";

// CheckoutPage renders a shipping form and order summary, then creates a Stripe Checkout session on submit
export default function CheckoutPage() {
  // Initialize the Next.js router for potential navigation
  const router = useRouter();
  // Fetch the current session — checkout requires authentication
  const { data: session } = useSession();
  // Query the user's cart items; only enabled when authenticated, used to display order summary
  const { data: cartItems } = api.cart.list.useQuery(undefined, {
    enabled: !!session,
  });
  // Mutation to create a Stripe Checkout session via the tRPC checkout router
  const checkout = api.checkout.createSession.useMutation();

  // State object holding all shipping form field values
  const [form, setForm] = useState({
    shippingName: "",
    shippingAddress: "",
    shippingCity: "",
    shippingPostalCode: "",
    shippingCountry: "",
  });

  // If the user is not signed in, show a prompt with a link to sign in
  if (!session) {
    return (
      <div className="pt-32 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm uppercase tracking-widest text-neutral-400 mb-4">
            Sign in to checkout
          </p>
          <Link href="/auth" className="inline-flex items-center justify-center px-8 py-3 text-sm font-medium uppercase tracking-widest transition-all duration-300 bg-neutral-950 text-neutral-50 hover:bg-neutral-800 dark:bg-neutral-50 dark:text-neutral-950 dark:hover:bg-neutral-200 text-xs">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  // Calculate the total price of all cart items by finding the matching size's price multiplied by quantity
  const total = (cartItems ?? []).reduce((sum, item) => {
    const size = item.product.sizes.find((s) => s.ml === item.size);
    return sum + (size?.price ?? item.product.price) * item.quantity;
  }, 0);

  // Handle form submission: create a Stripe Checkout session and redirect the user to the Stripe URL
  const handleSubmit = async (e: React.FormEvent) => {
    // Prevent the default browser form submission
    e.preventDefault();
    // Call the tRPC mutation to create a Stripe Checkout session with the shipping details
    const result = await checkout.mutateAsync(form);
    // If Stripe returns a URL, redirect the browser to the Stripe Checkout page
    if (result.url) {
      window.location.href = result.url;
    }
  };

  // Render the checkout page with a shipping form (2/3 width) and order summary sidebar (1/3 width)
  return (
    <div className="pt-32 pb-16 md:pb-24 min-h-screen">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        {/* Page header with "Secure Checkout" label and "Complete Your Order" title */}
        <div className="mb-12 md:mb-16">
          <p className="text-xs uppercase tracking-[0.3em] mb-3 text-neutral-400">
            Secure Checkout
          </p>
          <h1 className="font-serif text-3xl md:text-5xl tracking-tight leading-tight">Complete Your Order</h1>
        </div>

        {/* Two-column layout: shipping form on the left, order summary on the right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Shipping details form — submits to create a Stripe Checkout session */}
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
            <div className="border border-neutral-200 dark:border-neutral-800 p-8">
              <h2 className="text-sm uppercase tracking-widest mb-6">Shipping Details</h2>
              <div className="space-y-4">
                {/* Full name input field */}
                <div>
                  <label className="text-xs uppercase tracking-widest text-neutral-500 mb-2 block">
                    Full Name
                  </label>
                  <input
                    required
                    value={form.shippingName}
                    onChange={(e) => setForm({ ...form, shippingName: e.target.value })}
                    className="w-full border border-neutral-200 dark:border-neutral-800 bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-neutral-950 dark:focus:border-neutral-50 transition-colors"
                  />
                </div>
                {/* Street address input field */}
                <div>
                  <label className="text-xs uppercase tracking-widest text-neutral-500 mb-2 block">
                    Address
                  </label>
                  <input
                    required
                    value={form.shippingAddress}
                    onChange={(e) => setForm({ ...form, shippingAddress: e.target.value })}
                    className="w-full border border-neutral-200 dark:border-neutral-800 bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-neutral-950 dark:focus:border-neutral-50 transition-colors"
                  />
                </div>
                {/* City and postal code side-by-side inputs */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs uppercase tracking-widest text-neutral-500 mb-2 block">
                      City
                    </label>
                    <input
                      required
                      value={form.shippingCity}
                      onChange={(e) => setForm({ ...form, shippingCity: e.target.value })}
                      className="w-full border border-neutral-200 dark:border-neutral-800 bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-neutral-950 dark:focus:border-neutral-50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-widest text-neutral-500 mb-2 block">
                      Postal Code
                    </label>
                    <input
                      required
                      value={form.shippingPostalCode}
                      onChange={(e) => setForm({ ...form, shippingPostalCode: e.target.value })}
                      className="w-full border border-neutral-200 dark:border-neutral-800 bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-neutral-950 dark:focus:border-neutral-50 transition-colors"
                    />
                  </div>
                </div>
                {/* Country input field */}
                <div>
                  <label className="text-xs uppercase tracking-widest text-neutral-500 mb-2 block">
                    Country
                  </label>
                  <input
                    required
                    value={form.shippingCountry}
                    onChange={(e) => setForm({ ...form, shippingCountry: e.target.value })}
                    className="w-full border border-neutral-200 dark:border-neutral-800 bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-neutral-950 dark:focus:border-neutral-50 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Submit button — shows "Processing..." while the mutation is pending, otherwise displays the total to pay */}
            <button
              type="submit"
              disabled={checkout.isPending || !cartItems?.length}
              className="inline-flex items-center justify-center px-8 py-3 text-sm font-medium uppercase tracking-widest transition-all duration-300 bg-neutral-950 text-neutral-50 hover:bg-neutral-800 dark:bg-neutral-50 dark:text-neutral-950 dark:hover:bg-neutral-200 w-full"
            >
              {checkout.isPending ? "Processing..." : `Pay $${(total / 100).toFixed(2)}`}
            </button>
          </form>

          {/* Order summary sidebar — lists cart items with individual line totals and the overall total */}
          <div className="lg:col-span-1">
            <div className="border border-neutral-200 dark:border-neutral-800 p-8">
              <h2 className="text-sm uppercase tracking-widest mb-6">Order Summary</h2>
              <div className="space-y-4">
                {/* Map over each cart item showing product name, size, quantity, and line price */}
                {cartItems?.map((item) => {
                  const size = item.product.sizes.find((s) => s.ml === item.size);
                  const itemPrice = size?.price ?? item.product.price;
                  return (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-neutral-500 truncate mr-4">
                        {item.product.name} ({item.size}ml) × {item.quantity}
                      </span>
                      <span className="flex-shrink-0">
                        ${((itemPrice * item.quantity) / 100).toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>
              {/* Divider and total row */}
              <div className="h-px w-full bg-neutral-200 dark:bg-neutral-800 my-6" />
              <div className="flex justify-between text-sm font-medium">
                <span>Total</span>
                <span>${(total / 100).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
