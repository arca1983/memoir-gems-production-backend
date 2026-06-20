import Link from "next/link";

const EVENT_TYPES = [
  {
    icon: "💍",
    title: "Weddings",
    desc: "Shell magnets as guest favors, escort card holders, or a signature gift for the couple. Each Shell links to your wedding gallery so guests can relive the day.",
    popular: "Wedding Story Pack — $89",
  },
  {
    icon: "👶",
    title: "Baby Showers & Births",
    desc: "Announce the arrival with a set of Shell magnets. Family and friends get a keepsake — tap to see the newborn's first album.",
    popular: "Classic 2×2 Set — $48",
  },
  {
    icon: "🎓",
    title: "Graduations",
    desc: "Celebrate the milestone. Shell magnets featuring graduation portraits, each linked to a digital memory book or video tribute.",
    popular: "Portrait 2×3 Set — $52",
  },
  {
    icon: "🎂",
    title: "Milestone Birthdays",
    desc: "The perfect gift for 40th, 50th, 60th birthdays. A curated set of memory photos linked to a video message from friends and family.",
    popular: "Story 2.5×3.5 Set — $64",
  },
  {
    icon: "🕊️",
    title: "Memorials & Tributes",
    desc: "Honor a life well lived. Memorial Shell sets with portrait photos, each linking to a digital tribute page family can access forever.",
    popular: "Grand 3×3 Set — $74",
  },
  {
    icon: "🥂",
    title: "Corporate Events",
    desc: "Branded Shell magnets for team events, client gifts, and product launches. Link to your brand page, campaign, or team gallery.",
    popular: "B2B Programs available",
  },
];

export default function EventsPage() {
  return (
    <div style={{ background: "var(--ivory)" }}>
      {/* Header */}
      <div style={{ background: "var(--navy)", padding: "5rem 2rem", textAlign: "center" }}>
        <div className="section-label" style={{ color: "var(--gold-light)", marginBottom: "0.8rem" }}>
          ◆ Events & Occasions
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
          Shells for Every Milestone
        </h1>
        <p style={{ color: "var(--taupe)", fontSize: "0.9rem", maxWidth: 480, margin: "0 auto" }}>
          From weddings to memorials — Memoir Gems transforms any occasion into a lasting keepsake.
        </p>
      </div>

      {/* Event grid */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "5rem 2rem" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1.8rem",
          }}
          className="events-grid"
        >
          {EVENT_TYPES.map((ev) => (
            <div
              key={ev.title}
              style={{
                background: "white",
                border: "1px solid var(--taupe)",
                padding: "2rem",
              }}
            >
              <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>{ev.icon}</div>
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.3rem",
                  fontWeight: 500,
                  color: "var(--navy)",
                  marginBottom: "0.7rem",
                }}
              >
                {ev.title}
              </h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-mid)", lineHeight: 1.7, marginBottom: "1rem" }}>
                {ev.desc}
              </p>
              <div
                style={{
                  fontSize: "0.68rem",
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--gold)",
                  borderTop: "1px solid var(--cream)",
                  paddingTop: "0.8rem",
                }}
              >
                ◆ {ev.popular}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bulk / event orders */}
      <div style={{ background: "var(--cream)", padding: "5rem 2rem", textAlign: "center" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <div className="section-label" style={{ marginBottom: "1rem" }}>
            ◆ Event & Bulk Orders
          </div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.8rem, 3vw, 2.5rem)",
              fontWeight: 400,
              color: "var(--navy)",
              marginBottom: "1.2rem",
            }}
          >
            Planning a Large Event?
          </h2>
          <p style={{ fontSize: "0.9rem", color: "var(--text-mid)", lineHeight: 1.8, marginBottom: "2rem" }}>
            We work with event planners, wedding coordinators, and corporate teams on bulk Shell
            orders. Custom packaging, priority production, and dedicated coordination available
            for orders of 10+ sets. Contact us to discuss your event.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/en/contact">
              <span className="btn-primary" style={{ fontSize: "0.85rem" }}>
                Get Event Quote →
              </span>
            </Link>
            <Link href="/en/b2b">
              <span className="btn-outline" style={{ fontSize: "0.85rem" }}>
                B2B Programs
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ background: "var(--navy)", padding: "4rem 2rem", textAlign: "center" }}>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "2rem",
            fontWeight: 400,
            color: "var(--ivory)",
            marginBottom: "1.5rem",
          }}
        >
          Create Your Event Shells
        </h2>
        <Link href="/en/customize">
          <span className="btn-gold" style={{ fontSize: "0.85rem" }}>
            Start Customizing →
          </span>
        </Link>
      </div>

      <style>{`
        .events-grid { grid-template-columns: repeat(3, 1fr); }
        @media (max-width: 900px) { .events-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 600px) { .events-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
