import { NextResponse } from "next/server";
import { bookingSchema } from "@/lib/booking";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { site, siteVisit } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Payments are not configured. Please email us and we will book you in directly." },
      { status: 503 },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = bookingSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the form.", fieldErrors: z_fieldErrors(parsed.error) },
      { status: 422 },
    );
  }

  const booking = parsed.data;
  const origin = request.headers.get("origin") ?? site.url;

  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      customer_email: booking.email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: siteVisit.currency,
            unit_amount: siteVisit.pricePence,
            product_data: {
              name: `${site.name} — ${siteVisit.name}`,
              description:
                "Interior designer, structural engineer and contractor on site together, followed by a written report within five working days.",
            },
          },
        },
      ],
      // VAT is applied by Stripe Tax if enabled on the account; the displayed
      // price is quoted excluding VAT throughout the site.
      automatic_tax: { enabled: process.env.STRIPE_AUTOMATIC_TAX === "true" },
      success_url: `${origin}/book/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/book?cancelled=1`,
      metadata: {
        name: booking.name,
        phone: booking.phone,
        postcode: booking.postcode,
        address: booking.address,
        projectType: booking.projectType,
        valueBand: booking.valueBand,
        timing: booking.timing || "",
        notes: booking.notes?.slice(0, 480) || "",
      },
    });

    if (!session.url) {
      return NextResponse.json({ error: "Could not start checkout. Please try again." }, { status: 502 });
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[checkout] failed to create session", error);
    return NextResponse.json({ error: "Could not start checkout. Please try again." }, { status: 502 });
  }
}

function z_fieldErrors(error: { issues: Array<{ path: PropertyKey[]; message: string }> }) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "");
    if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}
