import Link from "next/link";

const SECTIONS = [
  {
    num: "1",
    title: "Order Processing",
    body: `All Memoir Gems Shell sets are custom-produced with your photos. Production begins after we receive and approve your photo upload, which happens via a secure link sent to your email after checkout.

Standard production time is 7 business days from photo approval. Rush 3-day production may be available for select sizes — contact us before ordering at contact@memoirgems.com to confirm availability.

You will receive an email notification at each stage: order confirmed, photos received, production started, and shipped.`,
  },
  {
    num: "2",
    title: "Shipping",
    body: `Standard shipping within the United States is free on all orders.

Estimated U.S. transit times after production:
• Continental U.S.: 2–5 business days (USPS Priority)
• Alaska & Hawaii: 5–7 business days
• International: Contact us for a shipping quote before ordering

A tracking number will be emailed once your order ships. Memoir Gems ships from Texas, USA.

If you need to update your shipping address, contact us at contact@memoirgems.com within 24 hours of placing your order. Once an order enters production, the shipping address cannot be changed.`,
  },
  {
    num: "3",
    title: "Gift Shipping",
    body: `All Memoir Gems orders ship in our signature Gather Pouch with tissue paper and bronze satin ribbon — gift-ready from the moment it arrives. You may enter a recipient's address directly at checkout. Add a personal note in the order notes field and we will include it on a handwritten card.`,
  },
  {
    num: "4",
    title: "Photo Quality",
    body: `We review every photo before printing. If we determine a photo may not print at acceptable quality (low resolution, heavy compression, or too dark), we will contact you within 24 hours of photo upload and request a replacement.

We will not proceed to production without your approval. Photos that cannot be improved will be flagged, and we will offer a full credit or refund for any items we are unable to produce.`,
  },
  {
    num: "5",
    title: "Returns & Refunds",
    body: `Because every Memoir Gems Shell set is custom-produced with your photos, we do not accept returns for change of mind.

However, we stand fully behind our print quality. If your Shells arrive:
• Damaged in transit
• With print defects (color bands, blurring, misalignment)
• Missing from your order

Contact us within 5 business days of delivery at contact@memoirgems.com with a photo of the issue. We will reprint and reship at no cost to you, or issue a full refund — your choice.

Refunds are processed to the original payment method within 5–10 business days.`,
  },
  {
    num: "6",
    title: "Order Changes & Cancellations",
    body: `Changes and cancellations are accepted within 24 hours of placing your order, before photos are uploaded and approved. After production begins, orders cannot be modified or cancelled.

To request a change, email contact@memoirgems.com with your order number.`,
  },
  {
    num: "7",
    title: "Contact",
    body: `For any shipping or return questions, reach us at:

Email: contact@memoirgems.com
Website: memoirgems.com/contact
Hours: Monday–Friday, 9am–6pm CST

We respond within a few hours during business hours.`,
  },
];

export default function ShippingReturnsPage() {
  return (
    <div style={{ background: "var(--ivory)" }}>
      <div style={{ background: "var(--navy)", padding: "4rem 2rem", textAlign: "center" }}>
        <div className="section-label" style={{ color: "var(--gold-light)", marginBottom: "0.8rem" }}>
          ◆ Policies
        </div>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.8rem, 3vw, 2.8rem)",
            fontWeight: 400,
            color: "var(--ivory)",
          }}
        >
          Shipping & Returns Policy
        </h1>
        <p style={{ color: "var(--taupe)", fontSize: "0.82rem", marginTop: "0.6rem" }}>
          Last Updated: June 2026 · Memoir Gems LLC
        </p>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "4rem 2rem 6rem" }}>
        {SECTIONS.map((section) => (
          <div
            key={section.num}
            style={{ marginBottom: "2.5rem", paddingBottom: "2.5rem", borderBottom: "1px solid var(--cream)" }}
          >
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.3rem",
                fontWeight: 500,
                color: "var(--navy)",
                marginBottom: "1rem",
                display: "flex",
                gap: "0.7rem",
                alignItems: "baseline",
              }}
            >
              <span
                style={{
                  color: "var(--gold)",
                  fontSize: "0.85rem",
                  fontFamily: "var(--font-body)",
                  letterSpacing: "0.1em",
                }}
              >
                {section.num}.
              </span>
              {section.title}
            </h2>
            <div
              style={{
                fontSize: "0.88rem",
                color: "var(--text-mid)",
                lineHeight: 1.9,
                whiteSpace: "pre-line",
              }}
            >
              {section.body}
            </div>
          </div>
        ))}

        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginTop: "1rem" }}>
          <Link href="/en/contact">
            <span className="btn-primary" style={{ fontSize: "0.8rem" }}>
              Contact Us
            </span>
          </Link>
          <Link href="/en/faq">
            <span className="btn-outline" style={{ fontSize: "0.8rem" }}>
              View FAQ
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
