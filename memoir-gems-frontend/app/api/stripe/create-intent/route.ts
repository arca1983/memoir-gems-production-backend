import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

  if (!STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  try {
    const { amount, currency = "usd", orderNumber, customerEmail } = await req.json();

    if (!amount || amount < 50) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // Create a Payment Intent via Stripe REST API (no SDK needed server-side)
    const res = await fetch("https://api.stripe.com/v1/payment_intents", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        amount: String(Math.round(amount * 100)), // cents
        currency,
        "metadata[order_number]": orderNumber || "",
        "metadata[customer_email]": customerEmail || "",
        "automatic_payment_methods[enabled]": "true",
        description: `Memoir Gems order ${orderNumber}`,
        receipt_email: customerEmail || "",
      }),
    });

    const intent = await res.json();

    if (!res.ok) {
      console.error("Stripe error:", intent);
      return NextResponse.json({ error: intent.error?.message || "Stripe error" }, { status: 400 });
    }

    return NextResponse.json({ clientSecret: intent.client_secret });
  } catch (err) {
    console.error("Stripe intent error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
