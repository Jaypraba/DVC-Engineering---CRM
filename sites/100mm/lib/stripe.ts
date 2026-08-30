import "server-only";

import Stripe from "stripe";

let client: Stripe | null = null;

/**
 * Lazily constructed so a missing key is a request-time error on the two routes
 * that need it, not a build-time failure for the whole statically rendered site.
 */
export function getStripe(): Stripe {
  if (!client) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    client = new Stripe(key);
  }
  return client;
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}
