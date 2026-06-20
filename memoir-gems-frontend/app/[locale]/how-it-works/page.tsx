import Link from "next/link";

const STEPS = [
  {
    num: "01",
    title: "Choose Your Shell Size",
    desc: "Pick from five Shell sizes — from the pocket-sized 2×2 Classic to the bold 3×3 Grand. Each size comes as a set, linked together through NFC + QR technology.",
  },
  {
    num: "02",
    title: "Send Us Your Photos",
    desc: "After your order, you'll receive a secure upload link. Send us your favorite photos — originals from your phone or camera work best. We review every photo before printing.",
  },
  {
    num: "03",
    title: "We Print & Embed",
    desc: "Your photos are UV-printed directly onto rigid Shell magnets using museum-quality archival inks. Each Shell is then programmed with a unique NFC chip and QR code.",
  },
  {
    num: "04",
    title: "Link Your Digital Moments",
    desc: "Your NFC chip and QR code can be linked to anything — a shared photo album, a video message, a wedding gallery, a memorial page. Update the link any time from your account.",
  },
  {
    num: "05",
    title: "Delivered Gift-Ready",
    desc: "Every set arrives in our signature Gather Pouch with tissue paper and bronze satin ribbon. No gift wrapping needed — it's ready to give the moment it arrives.",
  },
];

const FAQS = [
  {
    q: "How long does production take?",
    a: "7 business days from the time we receive your photos. Rush orders available — contact us.",
  },
  {
    q: "What if my photos are low resolution?",
    a: "We'll flag any photos that may not print well and ask for higher-resolution replacements before starting production.",
  },
  {
    q: "Can I change the NFC link after I receive the magnets?",
    a: "Yes. Log in to your account at memoirgems.com and update your Shell links any time — no limit.",
  },
  {
    q: "Do the magnets work on all surfaces?",
    a: "Shell magnets work on any ferromagnetic surface — refrigerators, metal filing cabinets, whiteboards, and display panels.",
  },
  {
    q: "What is the Gather Pouch?",
    a: "Our signature packaging — a premium linen-feel pouch with tissue paper and bronze ribbon. Your set ships inside it, gift-ready.",
  },
];

export default function HowItWorksPage() {
  return (
    <div style={{ background: "var(--ivory)" }}>
      {/* Header */}
      <div style={{ background: "var(--navy)", padding: "5rem 2rem", textAlign: "center" }}>
        <div className="section-label" style={{ color: "var(--gold-light)", marginBottom: "0.8rem" }}>
          ◆ The Process
        </div>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2rem, 4vw, 3.2rem)",
            fontWeight: 400,
            color: "var(--ivory)",
            marginBottom: "1rem",
          }}
        >
          How Memoir Gems Works
        </h1>
        <p style={{ color: "var(--taupe)", fontSize: "0.9rem", maxWidth: 480, margin: "0 auto" }}>
          From photo to gift-ready Shell in 7 days. Here's exactly what happens.
        </p>
      </div>

      {/* Steps */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "5rem 2rem" }}>
        {STEPS.map((step, i) => (
          <div
            key={step.num}
            style={{
              display: "grid",
              gridTemplateColumns: "80px 1fr",
              gap: "2rem",
              marginBottom: "3rem",
              paddingBottom: "3rem",
              borderBottom: i < STEPS.length - 1 ? "1px solid var(--cream)" : "none",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "3rem",
                fontWeight: 700,
                color: "var(--gold)",
                opacity: 0.35,
                lineHeight: 1,
                paddingTop: "0.2rem",
              }}
            >
              {step.num}
            </div>
            <div>
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.5rem",
                  fontWeight: 500,
                  color: "var(--navy)",
                  marginBottom: "0.6rem",
                }}
              >
                {step.title}
              </h3>
              <p style={{ fontSize: "0.9rem", color: "var(--text-mid)", lineHeight: 1.8 }}>
                {step.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* NFC explainer */}
      <div style={{ background: "var(--cream)", padding: "5rem 2rem" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <div className="section-label" style={{ marginBottom: "1rem" }}>
            ◆ NFC + QR Technology
          </div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.8rem, 3vw, 2.5rem)",
              fontWeight: 400,
              color: "var(--navy)",
              marginBottom: "1.5rem",
            }}
          >
            A Magnet That Connects to the Digital World
          </h2>
          <p style={{ fontSize: "0.9rem", color: "var(--text-mid)", lineHeight: 1.9, marginBottom: "1.5rem" }}>
            Every Shell magnet contains an embedded NFC chip — the same technology used in
            contactless payment. Tap the magnet with any modern smartphone and it instantly
            opens whatever URL you've assigned: a shared album, a video, a memorial page, a menu.
          </p>
          <p style={{ fontSize: "0.9rem", color: "var(--text-mid)", lineHeight: 1.9 }}>
            Each Shell also has a printed QR code on the back — so it works for every phone,
            even older models without NFC. One tap or one scan, your memory comes alive.
          </p>
        </div>
      </div>

      {/* FAQs */}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "5rem 2rem" }}>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "2rem",
            fontWeight: 400,
            color: "var(--navy)",
            marginBottom: "2.5rem",
            textAlign: "center",
          }}
        >
          Common Questions
        </h2>
        {FAQS.map((faq) => (
          <div
            key={faq.q}
            style={{
              borderBottom: "1px solid var(--cream)",
              padding: "1.5rem 0",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.1rem",
                fontWeight: 500,
                color: "var(--navy)",
                marginBottom: "0.5rem",
              }}
            >
              {faq.q}
            </div>
            <div style={{ fontSize: "0.88rem", color: "var(--text-mid)", lineHeight: 1.7 }}>
              {faq.a}
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div
        style={{
          background: "var(--navy)",
          padding: "4rem 2rem",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "2rem",
            fontWeight: 400,
            color: "var(--ivory)",
            marginBottom: "1.5rem",
          }}
        >
          Ready to Create Your Set?
        </h2>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/en/customize">
            <span className="btn-gold" style={{ fontSize: "0.85rem" }}>
              Start Customizing →
            </span>
          </Link>
          <Link href="/en/products">
            <span className="btn-outline" style={{ fontSize: "0.85rem", borderColor: "var(--taupe)", color: "var(--ivory)" }}>
              Browse Products
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
