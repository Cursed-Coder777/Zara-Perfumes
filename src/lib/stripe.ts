// Import the Stripe SDK for server-side payment processing and API interactions
import Stripe from "stripe";
// Import validated environment variables to securely access the Stripe secret key
import { env } from "~/env";

// Lazy-initialized Stripe client — avoids crashing during build when env vars aren't available
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  _stripe ??= new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-05-27.dahlia",
    typescript: true,
  });
  return _stripe;
}
