// Import the Stripe SDK for server-side payment processing and API interactions
import Stripe from "stripe";
// Import validated environment variables to securely access the Stripe secret key
import { env } from "~/env";

// Create and export a configured Stripe client instance using the secret key and the latest API version
export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  // Pin the API version to ensure consistent behaviour across deployments (2026-05-27.dahlia)
  apiVersion: "2026-05-27.dahlia",
  // Enable TypeScript strict typing for all Stripe API responses
  typescript: true,
});
