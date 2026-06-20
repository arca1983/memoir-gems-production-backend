import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, product, size, qty, price, notes, payment_method } = body;

    if (!name || !email || !product) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const orderNumber = `MG-${Date.now().toString().slice(-8)}`;

    // Save order request to Supabase
    // Note: table uses customer_name, product_id, product_name, quantity, total_price
    const { error } = await supabase.from("order_requests").insert([{
      order_number: orderNumber,
      customer_name: name,
      email,
      phone: phone || null,
      product_id: product,
      product_name: size || product,
      quantity: qty || 1,
      total_price: price,
      special_notes: notes || null,
      payment_method,
      status: "pending",
    }]);

    if (error) console.error("Order DB error:", error);

    // Email notification via Resend
    if (process.env.RESEND_API_KEY) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Memoir Gems <noreply@memoirgems.com>",
          to: ["contact@memoirgems.com"],
          reply_to: email,
          subject: `New Order Request ${orderNumber} — ${product}`,
          html: `
            <h2>New Order Request: ${orderNumber}</h2>
            <p><strong>Customer:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone || "Not provided"}</p>
            <hr/>
            <p><strong>Product:</strong> ${product}</p>
            <p><strong>Size:</strong> ${size}</p>
            <p><strong>Qty:</strong> ${qty}</p>
            <p><strong>Price:</strong> $${price}</p>
            <p><strong>Payment preference:</strong> ${payment_method}</p>
            <p><strong>Notes:</strong> ${notes || "None"}</p>
          `,
        }),
      });

      // Confirmation email to customer
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Memoir Gems <contact@memoirgems.com>",
          to: [email],
          subject: `Order Request Received — ${orderNumber}`,
          html: `
            <h2>We received your order request!</h2>
            <p>Hi ${name},</p>
            <p>Your order request <strong>${orderNumber}</strong> for <strong>${product}</strong> has been received.</p>
            <p>We'll reach out within a few hours to confirm details and send you a payment link.</p>
            <p>Questions? Reply to this email or write to <a href="mailto:contact@memoirgems.com">contact@memoirgems.com</a>.</p>
            <br/>
            <p>— The Memoir Gems Team</p>
          `,
        }),
      });
    }

    return NextResponse.json({ success: true, orderNumber });
  } catch (err) {
    console.error("Order API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
