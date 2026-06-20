import Link from "next/link";

const SECTIONS = [
  { num: "1", title: "Information We Collect", body: `When you place an order or contact us, we collect:\n• Your name and email address\n• Shipping address\n• Photos you upload for your order\n• Payment information (processed securely by our payment provider — we never store card numbers)\n• Messages and communications you send us\n\nWe also collect standard technical data when you visit our site (IP address, browser type, pages visited) through our hosting provider.` },
  { num: "2", title: "How We Use Your Information", body: `We use your information solely to:\n• Process and fulfill your order\n• Send you order status updates and tracking information\n• Respond to your questions and support requests\n• Send our newsletter, if you opt in (you can unsubscribe any time)\n• Improve our website and services\n\nWe do not sell, rent, or share your personal data with third parties for marketing purposes.` },
  { num: "3", title: "Your Photos", body: `Photos you submit are used exclusively to print your order. We store them only as long as needed to complete production and verify your order quality.\n\nWe will never use your photos for marketing, advertising, or any purpose other than fulfilling your order without your explicit written consent.` },
  { num: "4", title: "Payment Security", body: `All payments are processed through our secure payment providers (PayPal, Stripe). We do not store credit card numbers or financial account information on our servers. Payment data is encrypted and handled entirely by our payment processors.` },
  { num: "5", title: "Cookies", body: `Our website uses essential cookies to function (session, preferences). We do not use tracking cookies for advertising. You can disable cookies in your browser settings, though some site features may not work properly.` },
  { num: "6", title: "Your Rights", body: `You have the right to:\n• Request a copy of the personal data we hold about you\n• Request correction of inaccurate data\n• Request deletion of your data (subject to legal obligations)\n• Unsubscribe from our newsletter at any time\n\nTo exercise any of these rights, email contact@memoirgems.com.` },
  { num: "7", title: "Data Retention", body: `We retain order information for 3 years for accounting and legal purposes. Newsletter subscription data is retained until you unsubscribe. Contact message data is retained for 1 year.` },
  { num: "8", title: "Contact", body: `For any privacy questions or requests:\n\nMemoir Gems LLC\ncontact@memoirgems.com\nmemoirgems.com\n\nLast Updated: June 2026` },
];

export default function PrivacyPage() {
  return (
    <div style={{ background: "var(--ivory)" }}>
      <div style={{ background: "var(--navy)", padding: "4rem 2rem", textAlign: "center" }}>
        <div className="section-label" style={{ color: "var(--gold-light)", marginBottom: "0.8rem" }}>◆ Legal</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem, 3vw, 2.8rem)", fontWeight: 400, color: "var(--ivory)" }}>
          Privacy Policy
        </h1>
        <p style={{ color: "var(--taupe)", fontSize: "0.82rem", marginTop: "0.6rem" }}>
          Last Updated: June 2026 · Memoir Gems LLC
        </p>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "4rem 2rem 6rem" }}>
        <p style={{ fontSize: "0.9rem", color: "var(--text-mid)", lineHeight: 1.8, marginBottom: "2.5rem", fontStyle: "italic" }}>
          Your privacy matters to us. We collect only what we need to fulfill your order and serve you well — and we never sell your data.
        </p>

        {SECTIONS.map((s) => (
          <div key={s.num} style={{ marginBottom: "2.5rem", paddingBottom: "2.5rem", borderBottom: "1px solid var(--cream)" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", fontWeight: 500, color: "var(--navy)", marginBottom: "1rem", display: "flex", gap: "0.7rem", alignItems: "baseline" }}>
              <span style={{ color: "var(--gold)", fontSize: "0.85rem", fontFamily: "var(--font-body)", letterSpacing: "0.1em" }}>{s.num}.</span>
              {s.title}
            </h2>
            <div style={{ fontSize: "0.88rem", color: "var(--text-mid)", lineHeight: 1.9, whiteSpace: "pre-line" }}>{s.body}</div>
          </div>
        ))}

        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginTop: "1rem" }}>
          <Link href="/en/contact"><span className="btn-outline" style={{ fontSize: "0.8rem" }}>Contact Us</span></Link>
          <Link href="/en/terms"><span className="btn-outline" style={{ fontSize: "0.8rem" }}>Terms & Conditions</span></Link>
        </div>
      </div>
    </div>
  );
}
