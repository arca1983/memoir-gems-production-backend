import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, subject, message, type = "contact" } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Save to Supabase
    const { error } = await supabase.from("contact_messages").insert([
      { name, email, subject, message, type, created_at: new Date().toISOString() },
    ]);

    if (error) {
      console.error("Supabase error:", error);
      // Don't fail the user — still return success even if DB save fails
    }

    // If Resend API key is configured, send email notification
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
          subject: `New ${type === "order" ? "Order Request" : "Contact"} — ${subject || "No subject"}`,
          html: `
            <h2>New message from memoirgems.com</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject || "N/A"}</p>
            <p><strong>Type:</strong> ${type}</p>
            <hr/>
            <p>${message.replace(/\n/g, "<br/>")}</p>
          `,
        }),
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Contact API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
