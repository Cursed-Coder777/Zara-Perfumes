import type { Metadata } from "next";
// Import redirect for sending unauthenticated users to the sign-in page
import { redirect } from "next/navigation";

// Import getSession for server-side authentication check — redirects unauthenticated users
import { getSession } from "~/server/better-auth/server";
// Import tRPC server helpers for server-side data fetching and hydration
import { api, HydrateClient } from "~/trpc/server";

// Import the client-side OrdersList component to render the order history
import { OrdersList } from "./orders-list";

export const metadata: Metadata = {
  title: "Order History",
};

// OrdersPage is an async server component that checks authentication, fetches the user's orders, then passes them to the client component
export default async function OrdersPage() {
  // Fetch the current session server-side; if no session, redirect to the auth page
  const session = await getSession();
  if (!session) redirect("/auth");

  // Server-fetch the current user's orders via the tRPC order router
  const orders = await api.order.list();

  return (
    // HydrateClient passes server-fetched orders into the client's tRPC query cache to avoid a refetch
    <HydrateClient>
      <OrdersList orders={orders} />
    </HydrateClient>
  );
}
