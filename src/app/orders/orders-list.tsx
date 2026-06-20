// Mark this component as a Client Component so it can use client-side routing via Link
"use client";

// Import Link for client-side navigation to individual order detail pages
import Link from "next/link";

// Type definition for an order item — each item in an order has a product name, price, size, and quantity
type OrderItem = {
  id: number;
  productName: string;
  price: number;
  size: number;
  quantity: number;
};

// Type definition for an order — includes id, status, total, creation date, and an array of items
type Order = {
  id: number;
  status: string;
  totalAmount: number;
  createdAt: Date;
  items: OrderItem[];
};

// OrdersList is a client component that receives orders as props and renders a list of order cards with status colors
export function OrdersList({ orders }: { orders: Order[] }) {
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
        {/* Page header with "Your Orders" label and "Order History" title */}
        <div className="mb-12">
          <p className="text-xs uppercase tracking-[0.3em] mb-3 text-neutral-400">
            Your Orders
          </p>
          <h1 className="font-serif text-3xl md:text-5xl tracking-tight leading-tight">Order History</h1>
        </div>

        {/* If there are no orders, show an empty state with a link to start shopping */}
        {orders.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-neutral-400 text-sm uppercase tracking-widest mb-4">
              No orders yet
            </p>
            <Link href="/products" className="inline-flex items-center justify-center px-8 py-3 text-sm font-medium uppercase tracking-widest transition-all duration-300 bg-neutral-950 text-neutral-50 hover:bg-neutral-800 dark:bg-neutral-50 dark:text-neutral-950 dark:hover:bg-neutral-200 text-xs">
              Start Shopping
            </Link>
          </div>
        ) : (
          // List of order cards — each links to the order detail page
          <div className="space-y-6">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/order/${order.id}`}
                className="block border border-neutral-200 dark:border-neutral-800 p-6 hover:border-neutral-950 dark:hover:border-neutral-50 transition-colors"
              >
                {/* Top row: order ID and date on the left, status badge on the right */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium">Order #{order.id}</p>
                    <p className="text-xs text-neutral-400 mt-1">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  {/* Status badge with dynamic color based on the order status */}
                  <span
                    className={`text-xs font-medium uppercase tracking-wider ${statusColors[order.status] ?? ""}`}
                  >
                    {order.status}
                  </span>
                </div>
                {/* Product names summary — comma-separated list of item product names */}
                <div className="text-xs text-neutral-500">
                  {order.items.map((item) => item.productName).join(", ")}
                </div>
                {/* Order total displayed in bold */}
                <div className="mt-2 text-sm font-medium">
                  ${(order.totalAmount / 100).toFixed(2)}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
