import type { Metadata } from "next";
// Import tRPC server helpers for server-side data fetching and hydration
import { api, HydrateClient } from "~/trpc/server";
// Import the lazy better-auth initializer for getting the session via headers
import { getAuth } from "~/server/better-auth/config";
// Import the headers function from next/headers to read the request headers for session retrieval
import { headers } from "next/headers";
// Import notFound to return a 404 when the order is not found or user is unauthorized
import { notFound } from "next/navigation";
// Import the client-side OrderDetail component to render the order details
import { OrderDetail } from "./order-detail";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: `Order #${id}` } satisfies Metadata;
}

// OrderPage is an async server component that verifies the session, fetches a single order by ID, and passes data to the client component
export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  // Await the params promise (Next.js 15 pattern) to get the order ID from the URL
  const { id } = await params;
  // Fetch the current session server-side using the request headers; if null, return 404
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session) return notFound();

  // Server-fetch the order by numeric ID via the tRPC order router
  const orderData = await api.order.getById({ id: Number(id) });

  return (
    // HydrateClient passes server-fetched order data into the client's tRPC query cache
    <HydrateClient>
      <OrderDetail order={orderData} />
    </HydrateClient>
  );
}
