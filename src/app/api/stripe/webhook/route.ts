// Import NextRequest and NextResponse for handling HTTP requests and responses in the App Router
import { type NextRequest, NextResponse } from "next/server";
// Import the configured Stripe instance for verifying webhook signatures
import { stripe } from "~/lib/stripe";
// Import the validated environment variables to access the webhook secret
import { env } from "~/env";
// Import the database instance for updating order status after successful payment
import { db } from "~/server/db";
// Import the order table schema for running update queries
import { order } from "~/server/db/schema";
// Import eq from Drizzle ORM for constructing the WHERE clause
import { eq } from "drizzle-orm";

// POST handler for Stripe webhook events — receives JSON payload, verifies signature, and processes events (e.g., checkout.session.completed)
export async function POST(req: NextRequest) {
  // Read the raw request body as text — Stripe requires the raw body for signature verification
  const body = await req.text();
  // Extract the Stripe signature from the request headers for verification
  const signature = req.headers.get("stripe-signature");

  // If there's no signature header, return a 400 error immediately
  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  // Variable to hold the parsed Stripe event
  let event;
  try {
    // Verify the webhook signature using the raw body, signature, and the webhook secret from env
    event = stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch {
    // If signature verification fails, return a 400 error
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Handle the checkout.session.completed event — Stripe fires this when a payment succeeds
  if (event.type === "checkout.session.completed") {
    // Extract the session object from the event data
    const session = event.data.object;
    // Get the order ID that was stored in the session's metadata during checkout creation
    const orderId = session.metadata?.orderId;

    // If an order ID was attached to the session, update the order's status to "paid"
    if (orderId) {
      await db
        .update(order)
        .set({ status: "paid" })
        .where(eq(order.id, Number(orderId)));
    }
  }

  // Return a 200 response to acknowledge receipt of the webhook (Stripe expects a quick 200)
  return NextResponse.json({ received: true });
}
