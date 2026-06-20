import Link from "next/link";
import Image from "next/image";

const PRODUCTS = [
  {
    id: "shell-2x2",
    name: "Classic Shell — 2×2\"",
    slug: "shell-2x2",
    size: "2×2",
    desc: "Best-selling square. 9 photos per set. Clusters & desk sets.",
    price: 48,
    qty: 9,
    img: "https://images.unsplash.com/photo-1529636562405-8bb4b3e9b01f?w=600&q=80",
    tag: "Best Seller",
  },
  {
    id: "shell-2.5x2.5",
    name: "Standard Shell — 2.5×2.5\"",
    slug: "shell-2-5x2-5",
    size: "2.5×2.5",
    desc: "Panoramic & groups. 9 photos per set. Links to a photo album.",
    price: 58,
    qty: 9,
    img: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80",
    tag: "Popular",
  },
  {
    id: "shell-2x3",
    name: "Portrait Shell — 2×3\"",
    slug: "shell-2x3",
    size: "2×3",
    desc: "Weddings & memorials. 6 photos per set. Portrait orientation.",
    price: 52,
    qty: 6,
    img: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=600&q=80",
    tag: "New",
  },
  {
    id: "shell-2.5x3.5",
    name: "Story Shell — 2.5×3.5\"",
    slug: "shell-2-5x3-5",
    size: "2.5×3.5",
    desc: "Centerpiece size. 6 photos per set. Perfect for memorials.",
    price: 64,
    qty: 6,
    img: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&q=80",
    tag: "Gift Favorite",
  },
  {
    id: "shell-3x3",
    name: "Grand Shell — 3×3\"",
    slug: "shell-3x3",
    size: "3×3",
    desc: "Statement piece. 4 photos per set. Maximum impact.",
    price: 74,
    qty: 4,
    img: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=600&q=80",
    tag: "Premium",
  },
  {
    id: "wedding-pack",
    name: "Wedding Story Pack",
    slug: "wedding-pack",
    size: "2.5×2.5",
    desc: "Nine 2.5×2.5 Shells. Link each one to a different video moment from the day.",
    price: 89,
    qty: 9,
    img: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=600&q=80",
    tag: "Collection",
  },
  {
    id: "puzzle-shells",
    name: "Puzzle Shell Set",
    slug: "puzzle-shells",
    size: "2×2",
    desc: "One photo split across 9 interlocking Shell magnets. Assemble on your fridge for the full picture.",
    price: 79,
    qty: 9,
    img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
    tag: "Exclusive",
  },
];

export default function ProductsPage() {
  return (
    <div style={{ background: "var(--ivory)", minHeight: "100vh" }}>
      <div style={{ background: "var(--navy)", padding: "4rem 2rem", textAlign: "center" }}>
        <div className="section-label" style={{ color: "var(--gold-light)", marginBottom: "0.8rem" }}>
          ◆ Our Collection
        </div>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2rem, 4vw, 3.2rem)",
            fontWeight: 400,
            color: "var(--ivory)",
            marginBottom: "0.8rem",
          }}
        >
          Memoir Gems Shell Products
        </h1>
        <p style={{ fontSize: "0.9rem", color: "var(--taupe)", maxWidth: 500, margin: "0 auto" }}>
          Five Shell sizes plus exclusive puzzle sets. NFC + QR on every piece. Ships gift-ready in 7 days.
        </p>
      </div>

      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "4rem 2rem",
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "1.8rem",
        }}
        className="products-grid"
      >
        {PRODUCTS.map((p) => (
          <Link key={p.id} href={`/en/products/${p.slug}`}>
            <div
              style={{
                background: "white",
                border: "1px solid var(--taupe)",
                overflow: "hidden",
                cursor: "pointer",
                transition: "border-color 0.2s, transform 0.2s, box-shadow 0.2s",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = "var(--navy)";
                el.style.transform = "translateY(-4px)";
                el.style.boxShadow = "0 12px 40px rgba(13,27,42,0.1)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = "var(--taupe)";
                el.style.transform = "translateY(0)";
                el.style.boxShadow = "none";
              }}
            >
              <div style={{ position: "relative", paddingTop: "75%", overflow: "hidden" }}>
                <Image
                  src={p.img}
                  alt={p.name}
                  fill
                  style={{ objectFit: "cover", transition: "transform 0.5s" }}
                  sizes="400px"
                />
                <div
                  style={{
                    position: "absolute",
                    top: "1rem",
                    left: "1rem",
                    background: p.tag === "Exclusive" ? "var(--gold)" : "var(--navy)",
                    color: p.tag === "Exclusive" ? "white" : "var(--gold-light)",
                    fontSize: "0.6rem",
                    fontWeight: 600,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    padding: "0.3rem 0.7rem",
                  }}
                >
                  {p.tag}
                </div>
              </div>

              <div style={{ padding: "1.5rem" }}>
                <div
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.62rem",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "var(--gold)",
                    marginBottom: "0.4rem",
                  }}
                >
                  {p.size}" · {p.qty} pieces
                </div>
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.25rem",
                    fontWeight: 500,
                    color: "var(--navy)",
                    marginBottom: "0.5rem",
                  }}
                >
                  {p.name}
                </h3>
                <p
                  style={{
                    fontSize: "0.82rem",
                    color: "var(--text-muted)",
                    lineHeight: 1.6,
                    marginBottom: "1.2rem",
                  }}
                >
                  {p.desc}
                </p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1.3rem",
                      fontWeight: 600,
                      color: "var(--navy)",
                    }}
                  >
                    ${p.price}.00
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.65rem",
                      fontWeight: 500,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: "var(--gold)",
                      borderBottom: "1px solid var(--gold)",
                      paddingBottom: "1px",
                    }}
                  >
                    View →
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <style>{`
        .products-grid { grid-template-columns: repeat(3,1fr); }
        @media (max-width: 900px) { .products-grid { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 600px) { .products-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
