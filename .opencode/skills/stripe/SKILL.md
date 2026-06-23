---
name: stripe
description: Use when the user asks about Stripe integration, payment processing, Checkout, webhooks, or subscription management.
---

# Stripe

## Project integration
- Stripe Checkout for payment processing
- `src/lib/stripe.ts` initializes Stripe with secret key
- Webhook at `/api/stripe/webhook` updates order status on payment success
- Webhook secret stored in `STRIPE_WEBHOOK_SECRET` env var

## Key patterns

### Creating a Checkout session
```ts
const session = await stripe.checkout.sessions.create({
  mode: "payment",
  line_items: items.map((item) => ({
    price_data: {
      currency: "usd",
      product_data: { name: item.name, images: [item.image] },
      unit_amount: Math.round(item.price * 100), // cents
    },
    quantity: item.quantity,
  })),
  metadata: { orderId: order.id },
  success_url: `${domain}/order/${order.id}?success=true`,
  cancel_url: `${domain}/cart?cancelled=true`,
})
```

### Webhook handler
```ts
const sig = headers.get("stripe-signature")
const event = stripe.webhooks.constructEvent(
  payload,
  sig!,
  process.env.STRIPE_WEBHOOK_SECRET!
)

if (event.type === "checkout.session.completed") {
  const session = event.data.object
  const orderId = session.metadata?.orderId
  // Update order status to "paid"
}
```

## Order lifecycle
pending → paid (webhook) → shipped (admin) → delivered (admin) → cancelled

## Best practices
- Always verify webhook signatures with `stripe.webhooks.constructEvent`
- Store Stripe customer/session IDs in order records for reconciliation
- Use idempotency keys for API calls that could be retried
- Handle `checkout.session.expired` webhook to cancel unpaid orders
- Never log Stripe secrets or raw card data
- Use Stripe test mode (`sk_test_...`) in development

## Development
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
stripe trigger checkout.session.completed
```
Use `pnpm dlx stripe` if the Stripe CLI is not installed globally.
