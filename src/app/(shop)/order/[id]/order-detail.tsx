// Mark this component as a Client Component so it can use client-side routing via Link
"use client";

// Import TransitionLink for animated page transitions
import { TransitionLink } from "~/components/ui/TransitionLink";

// Type definition for an order item — each item has an id, product name, optional image, price, size, and quantity
type OrderItem = {
  id: number;
  productName: string;
  productImage: string | null;
  price: number;
  size: number;
  quantity: number;
};

// Type definition for the full order data (or null if not found) — includes id, status, total, shipping details, creation date, and items array
type OrderData = {
  id: number;
  status: string;
  totalAmount: number;
  shippingName: string | null;
  shippingAddress: string | null;
  shippingCity: string | null;
  shippingPostalCode: string | null;
  shippingCountry: string | null;
  createdAt: Date;
  items: OrderItem[];
} | null;

// OrderDetail is a client component that receives order data as props and renders the order confirmation, item list, shipping info, and a "Continue Shopping" button
export function OrderDetail({ order }: { order: OrderData }) {
  // If the order is null (not found), show a "not found" state with a link back to products
  if (!order) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-32">
        <div className="text-center">
          <p className="mb-4 text-sm tracking-widest text-neutral-400 uppercase">Order not found</p>
          <TransitionLink
            href="/products"
            className="inline-flex items-center justify-center border border-neutral-950 px-8 py-3 text-sm text-xs font-medium tracking-widest text-neutral-950 uppercase transition-all duration-300 hover:bg-neutral-950 hover:text-neutral-50 dark:border-neutral-50 dark:text-neutral-50 dark:hover:bg-neutral-50 dark:hover:text-neutral-950"
          >
            Continue Shopping
          </TransitionLink>
        </div>
      </div>
    );
  }

  // Map from order status to a Tailwind color class for the status badge text
  const statusColors: Record<string, string> = {
    pending: "text-yellow-600 dark:text-yellow-400",
    paid: "text-green-600 dark:text-green-400",
    shipped: "text-blue-600 dark:text-blue-400",
    delivered: "text-neutral-950 dark:text-neutral-50",
    cancelled: "text-red-600 dark:text-red-400",
  };

  return (
    <div className="min-h-screen pt-32 pb-16 md:pb-24">
      <div className="mx-auto max-w-3xl max-w-7xl px-6 md:px-12">
        {/* Thank you header — shows confirmation label, "Thank You" title, and order number */}
        <div className="mb-12">
          <p className="mb-3 text-xs tracking-[0.3em] text-neutral-400 uppercase">Confirmation</p>
          <h1 className="mb-2 font-serif text-3xl leading-tight tracking-tight md:text-5xl">
            Thank You
          </h1>
          <p className="text-sm text-neutral-500">
            Your order has been confirmed. Order #{order.id}
          </p>
        </div>

        {/* Order details card — lists items with prices and shows the total */}
        <div className="mb-8 border border-neutral-200 p-8 dark:border-neutral-800">
          {/* Header row with "Order Details" title and the current status badge */}
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-sm tracking-widest uppercase">Order Details</h2>
            <span
              className={`text-sm font-medium tracking-wider uppercase ${statusColors[order.status] ?? ""}`}
            >
              {order.status}
            </span>
          </div>

          {/* List of order items — each showing product name, size, quantity, and line total */}
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-neutral-500">
                  {item.productName} ({item.size}ml) × {item.quantity}
                </span>
                <span>${((item.price * item.quantity) / 100).toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Divider and total row */}
          <div className="my-6 h-px w-full bg-neutral-200 dark:bg-neutral-800" />

          <div className="flex justify-between text-sm font-medium">
            <span>Total</span>
            <span>${(order.totalAmount / 100).toFixed(2)}</span>
          </div>
        </div>

        {/* Shipping details card — conditionally shown if shippingName is present, displays name, address, city, postal code, and country */}
        {order.shippingName && (
          <div className="mb-8 border border-neutral-200 p-8 dark:border-neutral-800">
            <h2 className="mb-4 text-sm tracking-widest uppercase">Shipping To</h2>
            <p className="text-sm leading-relaxed text-neutral-500">
              {order.shippingName}
              <br />
              {order.shippingAddress}
              <br />
              {order.shippingCity}, {order.shippingPostalCode}
              <br />
              {order.shippingCountry}
            </p>
          </div>
        )}

        {/* "Continue Shopping" button centered at the bottom of the page */}
        <div className="text-center">
          <TransitionLink
            href="/products"
            className="inline-flex items-center justify-center bg-neutral-950 px-8 py-3 text-sm text-xs font-medium tracking-widest text-neutral-50 uppercase transition-all duration-300 hover:bg-neutral-800 dark:bg-neutral-50 dark:text-neutral-950 dark:hover:bg-neutral-200"
          >
            Continue Shopping
          </TransitionLink>
        </div>
      </div>
    </div>
  );
}
