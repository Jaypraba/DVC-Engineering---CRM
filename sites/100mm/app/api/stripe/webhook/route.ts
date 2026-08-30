import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Confirms a paid site visit. The signed event is the only trustworthy record
 * that money moved — the success page is just a redirect and can be forged.
 */
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!isStripeConfigured() || !secret) {
    return NextResponse.json({ error: "Webhook not configured." }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  const body = await request.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, secret);
  } catch (error) {
    console.error("[stripe] signature verification failed", error);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const meta = session.metadata ?? {};

    // TODO(integration): push this into the DVC CRM and send the confirmation
    // email. Logged for now so the payload is visible in Vercel logs from day one.
    console.info("[stripe] site visit booked", {
      sessionId: session.id,
      email: session.customer_details?.email ?? session.customer_email,
      amountTotal: session.amount_total,
      name: meta.name,
      phone: meta.phone,
      address: meta.address,
      postcode: meta.postcode,
      projectType: meta.projectType,
      valueBand: meta.valueBand,
      timing: meta.timing,
    });
  }

  return NextResponse.json({ received: true });
}
