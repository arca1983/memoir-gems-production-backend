import Link from "next/link";
import Image from "next/image";

const HERO_PHOTOS = [
  "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80",
  "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=600&q=80",
  "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&q=80",
  "https://images.unsplash.com/photo-1529636562405-8bb4b3e9b01f?w=600&q=80",
  "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=600&q=80",
  "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=600&q=80",
];

const SHELL_SIZES = [
  { size: "2×2\"", label: "Classic", desc: "Best-selling square", img: "https://images.unsplash.com/photo-1529636562405-8bb4b3e9b01f?w=400&q=75" },
  { size: "2.5×2.5\"", label: "Standard", desc: "Panoramic & groups", img: "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&q=75" },
  { size: "2×3\"", label: "Portrait", desc: "Weddings & memorials", img: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=400&q=75" },
  { size: "2.5×3.5\"", label: "Story", desc: "Centerpiece size", img: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&q=75" },
  { size: "3×3\"", label: "Grand", desc: "Clusters & desk sets", img: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=400&q=75" },
];

const HOW_IT_WORKS = [
  { num: "01", title: "Upload your photos", desc: "Choose up to 9 photos from your device. Our AI auto-crops for the best composition — or adjust manually." },
  { num: "02", title: "We print & pack", desc: "Each Shell magnet is precision-printed, polished, and wrapped in the Signature Gather Pouch." },
  { num: "03", title: "It arrives gift-ready", desc: "Delivered to your door in 5–7 business days. NFC and QR linked and ready to tap." },
];

const REVIEWS = [
  { name: "Jessica · Texas", text: "Ordered the Wedding Story Pack for my husband's 30th birthday. The photos came out absolutely stunning — the gold pouch had me in tears.", rating: 5 },
  { name: "Carlos M. · Houston", text: "We ordered 100 units for our B2B program. Delivered on time, perfect quality. Our clients loved them.", rating: 5 },
  { name: "Sofia K. · Austin", text: "The NFC chip is such a thoughtful touch — I linked ours to a private photo album. It's a conversation piece every time.", rating: 5 },
];

const FEATURES = [
  { icon: "◈", title: "Thin flexible vinyl", sub: "Rigid Shell — polished finish" },
  { icon: "◎", title: "Precision UV print", sub: "No fade, true color" },
  { icon: "⬡", title: "NFC chip + dynamic QR", sub: "Links to anything you want" },
  { icon: "◆", title: "Signature Gather Pouch", sub: "Arrives gift-ready" },
];

export default function HomePage() {
  return (
    <div style={{ background: "var(--ivory)" }}>

      {/* ── HERO ── */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          minHeight: "88vh",
          overflow: "hidden",
        }}
        className="hero-section"
      >
        {/* Left: copy */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "5rem 4rem 5rem 5rem",
            background: "var(--ivory)",
          }}
        >
          <div className="section-label" style={{ marginBottom: "1.5rem" }}>
            ◆ Index of Keepsakes — 001
          </div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(3.2rem, 5.5vw, 5rem)",
              fontWeight: 300,
              lineHeight: 1.05,
              color: "var(--navy)",
              marginBottom: "2rem",
            }}
          >
            Treasure<br />
            <em style={{ fontStyle: "italic", color: "var(--gold)" }}>what matters.</em>
          </h1>
          <p
            style={{
              fontSize: "0.95rem",
              color: "var(--text-mid)",
              lineHeight: 1.8,
              maxWidth: 380,
              marginBottom: "2.5rem",
              fontWeight: 300,
            }}
          >
            Premium Shell photo magnets with NFC and QR technology. Upload photos, choose a size, receive in our Signature Gather Pouch.
          </p>

          <div style={{ display: "flex", gap: "1.2rem", flexWrap: "wrap", marginBottom: "3rem" }}>
            <Link href="/en/products">
              <span className="btn-primary">Shop the Collection →</span>
            </Link>
            <Link href="/en/customize">
              <span className="btn-outline">↑ Upload Your Photos</span>
            </Link>
          </div>

          {/* Stats */}
          <div style={{ display: "flex", gap: "2.5rem" }}>
            {[
              { num: "5", label: "Shell Sizes" },
              { num: "7 days", label: "Production" },
              { num: "NFC+QR", label: "Smart Tech" },
            ].map((s) => (
              <div key={s.label}>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.4rem",
                    fontWeight: 600,
                    color: "var(--navy)",
                  }}
                >
                  {s.num}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.62rem",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "var(--text-muted)",
                    fontWeight: 500,
                  }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: photo grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gridTemplateRows: "1fr 1fr 1fr",
            gap: 0,
            overflow: "hidden",
          }}
        >
          {HERO_PHOTOS.map((src, i) => (
            <div key={i} style={{ position: "relative", overflow: "hidden" }}>
              <Image
                src={src}
                alt=""
                fill
                style={{ objectFit: "cover", transition: "transform 0.6s" }}
                sizes="33vw"
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(13,27,42,0.08)",
                }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ── TICKER ── */}
      <div
        style={{
          background: "var(--cream)",
          borderTop: "1px solid var(--taupe)",
          borderBottom: "1px solid var(--taupe)",
          padding: "0.85rem 0",
          overflow: "hidden",
        }}
      >
        <div className="ticker-track">
          {Array(2).fill(null).map((_, i) => (
            <span key={i} style={{ display: "flex", gap: 0 }}>
              {[
                "Jessica · Texas — Wedding Story Pack",
                "A Miami realtor — 250 NFC Shell magnets",
                "87 photos enhanced in the last hour",
                "Mariela R. — Memorial Collection",
                "Carlos M. · Houston — 100 B2B units",
                "Free U.S. shipping on every set",
                "Sofia K. · Austin — Anniversary Set",
              ].map((text) => (
                <span
                  key={text}
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.7rem",
                    fontWeight: 400,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "var(--text-mid)",
                    padding: "0 2.5rem",
                    whiteSpace: "nowrap",
                  }}
                >
                  ♦ {text}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ── SHELL SIZES ── */}
      <section style={{ padding: "5rem 2rem", maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
          <div className="section-label" style={{ marginBottom: "0.8rem" }}>◆ Our Collection</div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2rem, 3.5vw, 3rem)",
              fontWeight: 400,
              color: "var(--navy)",
            }}
          >
            Cinco tamaños Shell.<br />
            <em style={{ fontStyle: "italic", color: "var(--gold)" }}>Un ajuste perfecto.</em>
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: "1.5rem",
          }}
          className="sizes-grid"
        >
          {SHELL_SIZES.map((shell) => (
            <Link key={shell.size} href={`/en/products`}>
              <div
                style={{
                  cursor: "pointer",
                  background: "white",
                  border: "1px solid var(--taupe)",
                  overflow: "hidden",
                  transition: "border-color 0.2s, transform 0.2s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--navy)";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--taupe)";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                }}
              >
                <div style={{ position: "relative", paddingTop: "100%", overflow: "hidden" }}>
                  <Image
                    src={shell.img}
                    alt={shell.label}
                    fill
                    style={{ objectFit: "cover" }}
                    sizes="240px"
                  />
                </div>
                <div style={{ padding: "1rem" }}>
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1.1rem",
                      fontWeight: 600,
                      color: "var(--navy)",
                      marginBottom: "0.1rem",
                    }}
                  >
                    {shell.size}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.65rem",
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: "var(--gold)",
                      marginBottom: "0.3rem",
                    }}
                  >
                    {shell.label}
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{shell.desc}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
          <Link href="/en/products">
            <span className="btn-outline">View All Products</span>
          </Link>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ background: "var(--navy)", padding: "5rem 2rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <div
              className="section-label"
              style={{ marginBottom: "0.8rem", color: "var(--gold-light)" }}
            >
              01 — Process
            </div>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2rem, 3.5vw, 2.8rem)",
                fontWeight: 400,
                color: "var(--ivory)",
              }}
            >
              How it works.
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "2rem",
            }}
            className="how-grid"
          >
            {HOW_IT_WORKS.map((step) => (
              <div
                key={step.num}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  padding: "2rem",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.65rem",
                    letterSpacing: "0.2em",
                    color: "var(--gold-light)",
                    marginBottom: "1rem",
                  }}
                >
                  {step.num} ──────────────── ◆
                </div>
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.4rem",
                    fontWeight: 400,
                    color: "var(--ivory)",
                    marginBottom: "0.8rem",
                    lineHeight: 1.3,
                  }}
                >
                  {step.title}
                </h3>
                <p style={{ fontSize: "0.85rem", color: "var(--taupe)", lineHeight: 1.7 }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
            <Link href="/en/how-it-works">
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  border: "1px solid var(--gold-light)",
                  color: "var(--gold-light)",
                  background: "transparent",
                  padding: "0.85rem 2rem",
                  fontFamily: "var(--font-body)",
                  fontSize: "0.72rem",
                  fontWeight: 500,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                Learn More →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── PRODUCT FEATURES ── */}
      <section style={{ background: "var(--ivory-soft)", padding: "5rem 2rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
          <div className="section-label" style={{ marginBottom: "0.8rem" }}>◆ What makes a Shell</div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
              fontWeight: 400,
              color: "var(--navy)",
              marginBottom: "0.5rem",
            }}
          >
            No es un imán de heladera común.
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "3rem" }}>
            Memoir Gems Shell ◆ — every detail is intentional.
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "1.5rem",
            }}
            className="features-grid"
          >
            {FEATURES.map((f) => (
              <div
                key={f.title}
                style={{
                  background: "white",
                  border: "1px solid var(--taupe)",
                  padding: "2rem 1.5rem",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "2rem",
                    color: "var(--gold)",
                    marginBottom: "0.8rem",
                  }}
                >
                  {f.icon}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                    color: "var(--navy)",
                    marginBottom: "0.3rem",
                  }}
                >
                  {f.title}
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{f.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PACKAGING CTA ── */}
      <section
        style={{
          background: "var(--cream)",
          borderTop: "1px solid var(--taupe)",
          borderBottom: "1px solid var(--taupe)",
          padding: "4rem 2rem",
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "3rem",
            alignItems: "center",
          }}
          className="packaging-grid"
        >
          <div>
            <div className="section-label" style={{ marginBottom: "0.8rem" }}>◆ The Unboxing Experience</div>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
                fontWeight: 400,
                color: "var(--navy)",
                marginBottom: "1rem",
              }}
            >
              El unboxing también es parte del regalo.
            </h2>
            <p style={{ fontSize: "0.9rem", color: "var(--text-mid)", lineHeight: 1.8, marginBottom: "1.5rem" }}>
              Premium microfiber leather drawstring bag, gold foil stamped. Arrives gift-ready. Tissue wrap & bronze satin ribbon included.
            </p>
            <Link href="/en/products">
              <span className="btn-primary">Shop Now →</span>
            </Link>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0.8rem",
            }}
          >
            {[
              "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=400&q=75",
              "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=400&q=75",
              "https://images.unsplash.com/photo-1525438160292-a4a860951216?w=400&q=75",
              "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400&q=75",
            ].map((src, i) => (
              <div
                key={i}
                style={{ position: "relative", paddingTop: "80%", overflow: "hidden" }}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  style={{ objectFit: "cover" }}
                  sizes="300px"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REVIEWS ── */}
      <section style={{ padding: "5rem 2rem", background: "var(--ivory)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <div className="section-label" style={{ marginBottom: "0.8rem" }}>◆ Stories</div>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
                fontWeight: 400,
                color: "var(--navy)",
              }}
            >
              Regalos que trascienden el momento.
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "1.5rem",
            }}
            className="reviews-grid"
          >
            {REVIEWS.map((r) => (
              <div
                key={r.name}
                style={{
                  background: "white",
                  border: "1px solid var(--taupe)",
                  padding: "2rem",
                }}
              >
                <div style={{ color: "var(--gold)", marginBottom: "1rem", fontSize: "0.9rem" }}>
                  {"★".repeat(r.rating)}
                </div>
                <p
                  style={{
                    fontSize: "0.88rem",
                    color: "var(--text-mid)",
                    lineHeight: 1.75,
                    fontStyle: "italic",
                    marginBottom: "1.2rem",
                  }}
                >
                  "{r.text}"
                </p>
                <div
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.7rem",
                    fontWeight: 500,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "var(--navy)",
                  }}
                >
                  — {r.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── B2B CTA ── */}
      <section
        style={{
          background: "var(--navy)",
          padding: "4rem 2rem",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <div
            className="section-label"
            style={{ marginBottom: "0.8rem", color: "var(--gold-light)" }}
          >
            ◆ B2B Programs
          </div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
              fontWeight: 400,
              color: "var(--ivory)",
              marginBottom: "1rem",
            }}
          >
            Need branded packaging for your business?
          </h2>
          <p style={{ fontSize: "0.88rem", color: "var(--taupe)", marginBottom: "2rem", lineHeight: 1.7 }}>
            Custom Gather Pouches with your logo. Bulk NFC Shell magnets. Perfect for realtors, event venues, hotels, and photographers. Min. 50 units.
          </p>
          <Link href="/en/b2b">
            <span className="btn-gold">View B2B Programs →</span>
          </Link>
        </div>
      </section>

      {/* ── SUBSCRIPTION ── */}
      <section style={{ padding: "4rem 2rem", background: "var(--ivory-soft)", textAlign: "center" }}>
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <div className="section-label" style={{ marginBottom: "0.8rem" }}>◆ Monthly Plans</div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.6rem, 2.5vw, 2rem)",
              fontWeight: 400,
              color: "var(--navy)",
              marginBottom: "0.8rem",
            }}
          >
            Un nuevo recuerdo, cada mes.
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "2rem" }}>
            Subscribe and receive a curated set of Shell magnets every month. Cancel anytime.
          </p>
          <Link href="/en/products">
            <span className="btn-outline">Choose Your Plan →</span>
          </Link>
        </div>
      </section>

      {/* Responsive styles */}
      <style>{`
        .hero-section { grid-template-columns: 1fr 1fr; }
        .sizes-grid { grid-template-columns: repeat(5,1fr); }
        .how-grid { grid-template-columns: repeat(3,1fr); }
        .features-grid { grid-template-columns: repeat(4,1fr); }
        .reviews-grid { grid-template-columns: repeat(3,1fr); }
        .packaging-grid { grid-template-columns: 1fr 1fr; }

        @media (max-width: 1000px) {
          .sizes-grid { grid-template-columns: repeat(3,1fr) !important; }
          .features-grid { grid-template-columns: repeat(2,1fr) !important; }
        }
        @media (max-width: 768px) {
          .hero-section { grid-template-columns: 1fr !important; }
          .how-grid { grid-template-columns: 1fr !important; }
          .reviews-grid { grid-template-columns: 1fr !important; }
          .packaging-grid { grid-template-columns: 1fr !important; }
          .sizes-grid { grid-template-columns: repeat(2,1fr) !important; }
        }
        @media (max-width: 480px) {
          .sizes-grid { grid-template-columns: 1fr !important; }
          .features-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
