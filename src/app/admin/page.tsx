// Mark this component as a Client Component so it can use hooks (useState, useMutation, useSession)
"use client";

// Import useState for managing the active tab (products vs orders)
import { useState } from "react";
// Import the tRPC React client for making type-safe API queries and mutations
import { api } from "~/trpc/react";
// Import the useSession hook to get the current user's session and check admin role
import { useSession } from "~/lib/use-session";
// Import Link for client-side navigation back to the auth page
import Link from "next/link";

// AdminPage is the admin dashboard — a client component that checks auth/role then shows a tabbed interface for managing products and orders
export default function AdminPage() {
  // Fetch the current session to determine if the user is authenticated and has admin role
  const { data: session } = useSession();
  // State variable to toggle between the "products" and "orders" admin tabs
  const [tab, setTab] = useState<"products" | "orders">("products");

  // Derive isAdmin from the session user role — used to gate admin functionality
  const isAdmin = session?.user?.role === "admin";

  // If the user is not signed in at all, show a prompt with a link to the sign-in page
  if (!session) {
    return (
      <div className="pt-32 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm uppercase tracking-widest text-neutral-400 mb-4">
            Sign in to access admin
          </p>
          <Link href="/auth" className="inline-flex items-center justify-center px-8 py-3 text-sm font-medium uppercase tracking-widest transition-all duration-300 bg-neutral-950 text-neutral-50 hover:bg-neutral-800 dark:bg-neutral-50 dark:text-neutral-950 dark:hover:bg-neutral-200 text-xs">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  // If the user is signed in but does NOT have the admin role, show an unauthorized message
  if (!isAdmin) {
    return (
      <div className="pt-32 min-h-screen flex items-center justify-center">
        <p className="text-sm uppercase tracking-widest text-neutral-400">
          Unauthorized
        </p>
      </div>
    );
  }

  // Authenticated admin — render the dashboard with a tab switcher and the active tab's component
  return (
    <div className="pt-32 pb-16 md:pb-24 min-h-screen">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        {/* Dashboard header with "Dashboard" label and "Admin Panel" title */}
        <div className="mb-12">
          <p className="text-xs uppercase tracking-[0.3em] mb-3 text-neutral-400">
            Dashboard
          </p>
          <h1 className="font-serif text-3xl md:text-5xl tracking-tight leading-tight">Admin Panel</h1>
        </div>

        {/* Tab buttons to switch between Products view and Orders view */}
        <div className="flex gap-4 mb-12">
          <button
            onClick={() => setTab("products")}
            className={`px-4 py-2 text-xs uppercase tracking-widest border transition-colors ${
              tab === "products"
                ? "bg-neutral-950 text-neutral-50 dark:bg-neutral-50 dark:text-neutral-950"
                : "border-neutral-200 dark:border-neutral-800"
            }`}
          >
            Products
          </button>
          <button
            onClick={() => setTab("orders")}
            className={`px-4 py-2 text-xs uppercase tracking-widest border transition-colors ${
              tab === "orders"
                ? "bg-neutral-950 text-neutral-50 dark:bg-neutral-50 dark:text-neutral-950"
                : "border-neutral-200 dark:border-neutral-800"
            }`}
          >
            Orders
          </button>
        </div>

        {/* Conditionally render the AdminProducts or AdminOrders component based on the selected tab */}
        {tab === "products" ? <AdminProducts /> : <AdminOrders />}
      </div>
    </div>
  );
}

// AdminProducts sub-component — fetches all products via tRPC and renders a list with name, price, stock, and featured status
function AdminProducts() {
  // Query all products from the admin-only tRPC endpoint
  const { data: products, isLoading } = api.admin.products.list.useQuery();

  // Show a loading indicator while the products query is fetching
  if (isLoading) {
    return <div className="text-sm text-neutral-400">Loading...</div>;
  }

  // Render each product as a bordered card showing name, price in dollars, stock count, and featured badge
  return (
    <div>
      <div className="space-y-4">
        {products?.map((p) => (
          <div
            key={p.id}
            className="border border-neutral-200 dark:border-neutral-800 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-serif text-lg">{p.name}</p>
                <p className="text-xs text-neutral-400 mt-1">
                  ${(p.price / 100).toFixed(2)} — Stock: {p.stock}
                </p>
              </div>
              <div className="flex gap-2">
                <span className={`text-xs uppercase tracking-wider ${p.isFeatured ? "text-green-600" : "text-neutral-400"}`}>
                  {p.isFeatured ? "Featured" : "Standard"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// AdminOrders sub-component — fetches all orders with user info and items, and provides a status dropdown to update order state
function AdminOrders() {
  // Query all orders from the admin-only tRPC endpoint, including associated user and order items
  const { data: orders, isLoading } = api.admin.orders.list.useQuery();
  // Get the tRPC utility object for cache invalidation after mutations
  const utils = api.useUtils();
  // Mutation to update an order's status; invalidates the orders list cache on success so the UI refreshes
  const updateStatus = api.admin.orders.updateStatus.useMutation({
    onSuccess: () => utils.admin.orders.list.invalidate(),
  });

  // Show a loading indicator while the orders query is fetching
  if (isLoading) {
    return <div className="text-sm text-neutral-400">Loading...</div>;
  }

  // Render each order as a bordered card with order ID, customer name/email, date, item list, total, and a status dropdown
  return (
    <div className="space-y-4">
      {orders?.map((o) => (
        <div
          key={o.id}
          className="border border-neutral-200 dark:border-neutral-800 p-6"
        >
          {/* Top row: order ID and customer info on the left, status dropdown on the right */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium">Order #{o.id}</p>
              <p className="text-xs text-neutral-400">
                {o.user?.name ?? o.user?.email} —{" "}
                {new Date(o.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Status dropdown that triggers updateStatus mutation on change */}
              <select
                value={o.status}
                onChange={(e) =>
                  updateStatus.mutate({
                    id: o.id,
                    status: e.target.value as "pending" | "paid" | "shipped" | "delivered" | "cancelled",
                  })
                }
                className="bg-transparent border border-neutral-200 dark:border-neutral-800 px-3 py-1 text-xs uppercase tracking-wider"
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          {/* Product line items summary — lists product name, size, and quantity for each item */}
          <div className="text-xs text-neutral-500">
            {o.items.map((i) => `${i.productName} (${i.size}ml) × ${i.quantity}`).join(", ")}
          </div>
          {/* Order total displayed in bold */}
          <div className="mt-2 text-sm font-medium">
            ${(o.totalAmount / 100).toFixed(2)}
          </div>
        </div>
      ))}
    </div>
  );
}
