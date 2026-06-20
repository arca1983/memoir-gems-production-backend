import Link from "next/link";

const PROGRAMS = [
  {
    title: "Restaurant & Café Magnets",
    desc: "Replace static menu cards with Shell magnets. Tap to see today's specials, full menu, or reservation link. Update the URL instantly — no reprinting.",
    icon: "🍽️",
  },
  {
    title: "Real Estate Closing Gifts",
    desc: "Give clients a Shell magnet set featuring their new home. Each Shell links to a video walkthrough or a personalized welcome message.",
    icon: "🏠",
  },
  {
    title: "Hotel & Hospitality",
    desc: "Custom Shell magnets in rooms and suites that link to hotel services, local guides, or concierge pages. A premium branded touch.",
    icon: "🏨",
  },
  {
    title: "Wedding Planners",
    desc: "Offer Shell magnets as a premium add-on for your couples — guest favors, seating cards, or a signature keepsake for the couple.",
    icon: "💍",
  },
  {
    title: "Photographers",
    desc: "Upsell Shell magnet packages to every client. We handle printing and production — you deliver a premium physical product with your gallery built in.",
    icon: "📷",
  },
  {
    title: "Corporate & Team",
    desc: "Employee recognition, client gifts, product launches, trade shows. Custom Shell sets with your brand photography and links.",
    icon: "🏢",
  },
];

const TIERS = [
  { name: "Partner", min: "5 sets/mo", discount: "10% off", perks: "Priority production, account manager" },
  { name: "Studio", min: "15 sets/mo", discount: "18% off", perks: "Custom packaging option, net-30 billing" },
  { name: "Enterprise", min: "30+ sets/mo", discount: "Custom", perks: "White-label option, dedicated account team" },
];

export default function B2BPage() {
  return (
    <div style={{ background: "var(--ivory)" }}>
      {/* Header */}
      <div style={{ background: "var(--navy)", padding: "5rem 2rem", textAlign: "center" }}>
        <div className="section-label" style={{ color: "var(--gold-light)", marginBottom: "0.8rem" }}>
          ◆ B2B Programs
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
          Memoir Gems for Business
        </h1>
        <p style={{ color: "var(--taupe)", fontSize: "0.9rem", maxWidth: 520, margin: "0 auto" }}>
          Premium branded Shell magnets for restaurants, realtors, photographers, hotels,
          and corporate teams. Volume pricing and dedicated support.
        </p>
      </div>

      {/* Programs grid */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "5rem 2rem" }}>
        <div className="section-label" style={{ textAlign: "center", marginBottom: "3rem" }}>
          ◆ Who We Work With
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1.8rem",
          }}
          className="b2b-grid"
        >
          {PROGRAMS.map((p) => (
            <div
              key={p.title}
              style={{
                background: "white",
                border: "1px solid var(--taupe)",
                padding: "2rem",
              }}
            >
              <div style={{ fontSize: "1.8rem", marginBottom: "1rem" }}>{p.icon}</div>
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.2rem",
                  fontWeight: 500,
                  color: "var(--navy)",
                  marginBottom: "0.6rem",
                }}
              >
                {p.title}
              </h3>
              <p style={{ fontSize: "0.84rem", color: "var(--text-mid)", lineHeight: 1.7 }}>
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing tiers */}
      <div style={{ background: "var(--cream)", padding: "5rem 2rem" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div className="section-label" style={{ textAlign: "center", marginBottom: "3rem" }}>
            ◆ Volume Pricing
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "1.5rem",
            }}
            className="tiers-grid"
          >
            {TIERS.map((tier) => (
              <div
                key={tier.name}
                style={{
                  background: "var(--navy)",
                  padding: "2.5rem 2rem",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.6rem",
                    color: "var(--gold-light)",
                    marginBottom: "0.3rem",
                  }}
                >
                  {tier.name}
                </div>
                <div
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--taupe)",
                    marginBottom: "1.5rem",
                  }}
                >
                  From {tier.min}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "2rem",
                    color: "var(--gold)",
                    fontWeight: 600,
                    marginBottom: "1rem",
                  }}
                >
                  {tier.discount}
                </div>
                <div style={{ fontSize: "0.78rem", color: "var(--taupe)", lineHeight: 1.6 }}>
                  {tier.perks}
                </div>
              </div>
            ))}
          </div>
          <p
            style={{
              textAlign: "center",
              fontSize: "0.8rem",
              color: "var(--text-muted)",
              marginTop: "1.5rem",
            }}
          >
            All tiers include NFC + QR on every Shell and Gather Pouch packaging.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div style={{ background: "var(--navy)", padding: "5rem 2rem", textAlign: "center" }}>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "2rem",
            fontWeight: 400,
            color: "var(--ivory)",
            marginBottom: "1rem",
          }}
        >
          Let's Build Your B2B Program
        </h2>
        <p style={{ color: "var(--taupe)", fontSize: "0.9rem", maxWidth: 460, margin: "0 auto 2rem" }}>
          Tell us about your business and we'll put together a custom proposal within 24 hours.
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/en/contact">
            <span className="btn-gold" style={{ fontSize: "0.85rem" }}>
              Request B2B Proposal →
            </span>
          </Link>
          <Link href="/en/products">
            <span className="btn-outline" style={{ fontSize: "0.85rem", borderColor: "var(--taupe)", color: "var(--ivory)" }}>
              Browse Products
            </span>
          </Link>
        </div>
      </div>

      <style>{`
        .b2b-grid { grid-template-columns: repeat(3, 1fr); }
        .tiers-grid { grid-template-columns: repeat(3, 1fr); }
        @media (max-width: 900px) {
          .b2b-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .tiers-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 600px) {
          .b2b-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
