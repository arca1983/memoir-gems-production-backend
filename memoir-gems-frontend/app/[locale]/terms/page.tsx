import Link from "next/link";

const SECTIONS = [
  {
    num: "1",
    title: "Acceptance of Terms",
    body: `By accessing memoirgems.com or placing an order, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use our site or services.

These terms apply to all visitors, customers, and users of Memoir Gems LLC ("Memoir Gems," "we," "our," or "us").`,
  },
  {
    num: "2",
    title: "Products & Custom Orders",
    body: `Memoir Gems produces custom photo Shell magnets. Each set is made to order using photos you provide.

By placing an order, you confirm:
• You own the rights to all photos you submit, or have permission to use them for this purpose
• You are not submitting copyrighted images belonging to third parties without authorization
• You understand that custom orders cannot be returned for change of mind once production begins

We reserve the right to refuse any order containing images that are offensive, illegal, or that violate third-party rights.`,
  },
  {
    num: "3",
    title: "Photo Submission",
    body: `After checkout, you will receive a secure upload link by email. You are responsible for submitting your photos within 7 days of receiving this link. Orders not completed within 30 days of purchase may be subject to cancellation.

We review all photos before printing. If a photo does not meet our minimum quality standards, we will contact you to request a replacement. We will not begin production without your confirmation.`,
  },
  {
    num: "4",
    title: "Pricing & Payment",
    body: `All prices are listed in U.S. dollars. Memoir Gems reserves the right to change prices at any time without notice. Prices at the time of your order are final.

Payment is processed securely through our payment provider at checkout. Memoir Gems does not store your payment card information.

Sales tax may be applied based on your location and applicable law.`,
  },
  {
    num: "5",
    title: "Intellectual Property",
    body: `All content on memoirgems.com — including the Memoir Gems name, logo, product photography, copy, and design — is the property of Memoir Gems LLC and protected by applicable copyright and trademark law.

You may not reproduce, distribute, or use any content from this website without prior written permission.

By submitting photos to us, you grant Memoir Gems a limited license to use those photos solely for the purpose of producing your order. We will not use your photos for any other purpose, including marketing, without your explicit written consent.`,
  },
  {
    num: "6",
    title: "NFC & QR Technology",
    body: `Each Shell includes an embedded NFC chip and printed QR code. The URL associated with each chip is initially unassigned. You may configure and update your Shell's URL at any time through your Memoir Gems account.

Memoir Gems is not responsible for the content of any third-party URLs you link to your Shells. You are responsible for ensuring that any URL you assign complies with applicable law and does not link to offensive, harmful, or illegal content.

NFC chip functionality depends on the user's device compatibility. Not all devices support NFC reading. The QR code on the reverse of each Shell provides a universal fallback.`,
  },
  {
    num: "7",
    title: "Limitation of Liability",
    body: `To the maximum extent permitted by law, Memoir Gems LLC shall not be liable for any indirect, incidental, special, or consequential damages arising from the use of our products or website.

Our liability for any direct damages shall not exceed the purchase price of the specific order giving rise to the claim.

We do not warrant that our website will be uninterrupted or error-free. We reserve the right to suspend or discontinue any part of our service at any time.`,
  },
  {
    num: "8",
    title: "Privacy",
    body: `We collect and use your personal information (name, email, shipping address, photos) only to fulfill your order and communicate with you about it. We do not sell or share your personal data with third parties for marketing purposes.

Photos submitted for production are stored only as long as needed to complete and verify your order.

For questions about your data, contact contact@memoirgems.com.`,
  },
  {
    num: "9",
    title: "Governing Law",
    body: `These Terms and Conditions are governed by the laws of the State of Texas, United States. Any disputes shall be resolved in the courts of Texas.

If any provision of these terms is found to be unenforceable, the remaining provisions continue in full force.`,
  },
  {
    num: "10",
    title: "Changes to These Terms",
    body: `We may update these Terms and Conditions at any time. Changes take effect when posted to this page. Continued use of memoirgems.com after changes are posted constitutes acceptance of the updated terms.

Last updated: June 2026`,
  },
  {
    num: "11",
    title: "Contact",
    body: `Memoir Gems LLC
contact@memoirgems.com
memoirgems.com`,
  },
];

export default function TermsPage() {
  return (
    <div style={{ background: "var(--ivory)" }}>
      <div style={{ background: "var(--navy)", padding: "4rem 2rem", textAlign: "center" }}>
        <div className="section-label" style={{ color: "var(--gold-light)", marginBottom: "0.8rem" }}>
          ◆ Legal
        </div>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.8rem, 3vw, 2.8rem)",
            fontWeight: 400,
            color: "var(--ivory)",
          }}
        >
          Terms & Conditions
        </h1>
        <p style={{ color: "var(--taupe)", fontSize: "0.82rem", marginTop: "0.6rem" }}>
          Last Updated: June 2026 · Memoir Gems LLC · memoirgems.com
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
            <span className="btn-outline" style={{ fontSize: "0.8rem" }}>
              Contact Us
            </span>
          </Link>
          <Link href="/en/shipping-returns">
            <span className="btn-outline" style={{ fontSize: "0.8rem" }}>
              Shipping & Returns
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
