// Mark this component as a Client Component so it can use client-side routing via Link
"use client";

// Import Link for client-side navigation back to the products page
import Link from "next/link";

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
      <div className="pt-32 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm uppercase tracking-widest text-neutral-400 mb-4">
            Order not found
          </p>
          <Link href="/products" className="inline-flex items-center justify-center px-8 py-3 text-sm font-medium uppercase tracking-widest transition-all duration-300 border border-neutral-950 text-neutral-950 hover:bg-neutral-950 hover:text-neutral-50 dark:border-neutral-50 dark:text-neutral-50 dark:hover:bg-neutral-50 dark:hover:text-neutral-950 text-xs">
            Continue Shopping
          </Link>
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
    <div className="pt-32 pb-16 md:pb-24 min-h-screen">
      <div className="mx-auto max-w-7xl px-6 md:px-12 max-w-3xl">
        {/* Thank you header — shows confirmation label, "Thank You" title, and order number */}
        <div className="mb-12">
          <p className="text-xs uppercase tracking-[0.3em] mb-3 text-neutral-400">
            Confirmation
          </p>
          <h1 className="font-serif text-3xl md:text-5xl tracking-tight leading-tight mb-2">Thank You</h1>
          <p className="text-neutral-500 text-sm">
            Your order has been confirmed. Order #{order.id}
          </p>
        </div>

        {/* Order details card — lists items with prices and shows the total */}
        <div className="border border-neutral-200 dark:border-neutral-800 p-8 mb-8">
          {/* Header row with "Order Details" title and the current status badge */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm uppercase tracking-widest">Order Details</h2>
            <span className={`text-sm font-medium uppercase tracking-wider ${statusColors[order.status] ?? ""}`}>
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
          <div className="h-px w-full bg-neutral-200 dark:bg-neutral-800 my-6" />

          <div className="flex justify-between text-sm font-medium">
            <span>Total</span>
            <span>${(order.totalAmount / 100).toFixed(2)}</span>
          </div>
        </div>

        {/* Shipping details card — conditionally shown if shippingName is present, displays name, address, city, postal code, and country */}
        {order.shippingName && (
          <div className="border border-neutral-200 dark:border-neutral-800 p-8 mb-8">
            <h2 className="text-sm uppercase tracking-widest mb-4">Shipping To</h2>
            <p className="text-sm text-neutral-500 leading-relaxed">
              {order.shippingName}<br />
              {order.shippingAddress}<br />
              {order.shippingCity}, {order.shippingPostalCode}<br />
              {order.shippingCountry}
            </p>
          </div>
        )}

        {/* "Continue Shopping" button centered at the bottom of the page */}
        <div className="text-center">
          <Link href="/products" className="inline-flex items-center justify-center px-8 py-3 text-sm font-medium uppercase tracking-widest transition-all duration-300 bg-neutral-950 text-neutral-50 hover:bg-neutral-800 dark:bg-neutral-50 dark:text-neutral-950 dark:hover:bg-neutral-200 text-xs">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
