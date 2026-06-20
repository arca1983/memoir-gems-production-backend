// Dynamic product page — server-rendered on demand (no SSG = no 500 errors at build time)
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

const PRODUCTS: Record<string, {
  id: string; name: string; size: string; desc: string; longDesc: string;
  price: number; qty: number; img: string; tag: string; features: string[];
  isPuzzle?: boolean;
}> = {
  "shell-2x2": {
    id: "shell-2x2", name: "Classic Shell — 2×2\"", size: "2×2", tag: "Best Seller",
    desc: "Best-selling square. 9 photos per set.",
    longDesc: "Our most popular size. Nine 2×2 Shell magnets, each printed with precision UV ink for vivid, fade-resistant color. Every Shell includes an embedded NFC chip and dynamic QR code you can link to a photo album, video, or any URL.",
    price: 48, qty: 9,
    img: "https://images.unsplash.com/photo-1529636562405-8bb4b3e9b01f?w=800&q=85",
    features: ["9 Shell magnets per set", "2×2 inch rigid Shell", "NFC chip + dynamic QR on every piece", "Signature Gather Pouch included", "Free U.S. shipping"],
  },
  "shell-2-5x2-5": {
    id: "shell-2-5x2-5", name: "Standard Shell — 2.5×2.5\"", size: "2.5×2.5", tag: "Popular",
    desc: "Panoramic & group shots. 9 photos per set.",
    longDesc: "More canvas for your most important moments. The 2.5×2.5 Shell is perfect for panoramic photos and group shots. Nine per set, each linked to its own digital destination.",
    price: 58, qty: 9,
    img: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=85",
    features: ["9 Shell magnets per set", "2.5×2.5 inch rigid Shell", "NFC chip + dynamic QR on every piece", "Signature Gather Pouch included", "Free U.S. shipping"],
  },
  "shell-2x3": {
    id: "shell-2x3", name: "Portrait Shell — 2×3\"", size: "2×3", tag: "New",
    desc: "Weddings & memorials. 6 photos per set.",
    longDesc: "The portrait orientation makes it ideal for wedding photos, individual portraits, and memorial collections. Six 2×3 Shells per set, delivered gift-ready.",
    price: 52, qty: 6,
    img: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800&q=85",
    features: ["6 Shell magnets per set", "2×3 inch portrait Shell", "NFC chip + dynamic QR on every piece", "Signature Gather Pouch included", "Free U.S. shipping"],
  },
  "shell-2-5x3-5": {
    id: "shell-2-5x3-5", name: "Story Shell — 2.5×3.5\"", size: "2.5×3.5", tag: "Gift Favorite",
    desc: "Centerpiece size. 6 photos per set.",
    longDesc: "Our centerpiece Shell. Larger format for statement pieces — perfect for memorial collections, anniversary gifts, and special event favors. Six per set.",
    price: 64, qty: 6,
    img: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=85",
    features: ["6 Shell magnets per set", "2.5×3.5 inch portrait Shell", "NFC chip + dynamic QR on every piece", "Signature Gather Pouch included", "Free U.S. shipping"],
  },
  "shell-3x3": {
    id: "shell-3x3", name: "Grand Shell — 3×3\"", size: "3×3", tag: "Premium",
    desc: "Maximum impact. 4 photos per set.",
    longDesc: "The Grand Shell is our largest format — a true statement piece. Four magnets per set, each commanding attention on any surface. Premium presentation.",
    price: 74, qty: 4,
    img: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=800&q=85",
    features: ["4 Shell magnets per set", "3×3 inch grand Shell", "NFC chip + dynamic QR on every piece", "Signature Gather Pouch included", "Free U.S. shipping"],
  },
  "wedding-pack": {
    id: "wedding-pack", name: "Wedding Story Pack", size: "2.5×2.5", tag: "Collection",
    desc: "Nine 2.5×2.5 Portrait Shells. Link to video moments.",
    longDesc: "Our most beloved wedding gift. Nine 2.5×2.5 Shells, each linked to a different moment from the day — the ceremony, first dance, reception, toasts. Delivered in a premium Gather Pouch with tissue and bronze satin ribbon.",
    price: 89, qty: 9,
    img: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800&q=85",
    features: ["9 Shell magnets per set", "2.5×2.5 inch Shell", "NFC chip + dynamic QR on every piece", "Signature Gather Pouch + bronze ribbon", "Free U.S. shipping"],
  },
  "puzzle-shells": {
    id: "puzzle-shells", name: "Puzzle Shell Set", size: "2×2", tag: "Exclusive",
    desc: "One photo split across 9 interlocking Shell magnets. Assemble on your fridge.",
    longDesc: "A single photo printed across nine 2×2 Shell magnets in a 3×3 grid — when you place them side by side on your fridge, they form one stunning image. Each piece is a rigid UV-printed Shell with its own NFC chip, so your guests can tap any piece to see the full story behind the photo.",
    price: 79, qty: 9,
    img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=85",
    isPuzzle: true,
    features: [
      "9 Shell magnets — one image split across all 9",
      "Assembles into a 6×6\" mosaic on any surface",
      "Each piece has its own NFC chip + dynamic QR",
      "Send one photo — we do the split automatically",
      "Signature Gather Pouch included",
      "Free U.S. shipping",
    ],
  },
};

type Props = { params: { locale: string; id: string } };

export default function ProductDetailPage({ params }: Props) {
  const product = PRODUCTS[params.id];
  if (!product) notFound();

  return (
    <div style={{ background: "var(--ivory)", minHeight: "100vh" }}>
      {/* Breadcrumb */}
      <div
        style={{
          padding: "1rem 2rem",
          maxWidth: 1200,
          margin: "0 auto",
          fontSize: "0.72rem",
          color: "var(--text-muted)",
          letterSpacing: "0.08em",
        }}
      >
        <Link href="/en">Home</Link>
        {" / "}
        <Link href="/en/products">Products</Link>
        {" / "}
        <span style={{ color: "var(--navy)" }}>{product.name}</span>
      </div>

      {/* Main content */}
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "2rem 2rem 5rem",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "4rem",
          alignItems: "start",
        }}
        className="product-layout"
      >
        {/* Image */}
        <div>
          <div
            style={{
              position: "relative",
              paddingTop: "90%",
              overflow: "hidden",
              background: "var(--cream)",
            }}
          >
            <Image
              src={product.img}
              alt={product.name}
              fill
              style={{ objectFit: "cover" }}
              sizes="600px"
              priority
            />
          </div>
          <div
            style={{
              display: "inline-block",
              background: product.tag === "Exclusive" ? "var(--gold)" : "var(--navy)",
              color: "white",
              fontSize: "0.62rem",
              fontWeight: 600,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              padding: "0.4rem 1rem",
              marginTop: "1rem",
            }}
          >
            {product.tag}
          </div>

          {/* Puzzle explainer visual */}
          {product.isPuzzle && (
            <div
              style={{
                marginTop: "1.5rem",
                padding: "1.2rem",
                background: "var(--cream)",
                border: "1px solid var(--taupe)",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "3px",
                  width: 120,
                  margin: "0 auto 0.8rem",
                }}
              >
                {[...Array(9)].map((_, i) => (
                  <div
                    key={i}
                    style={{
                      background: `hsl(${200 + i * 15}, 35%, ${50 + i * 3}%)`,
                      aspectRatio: "1",
                      opacity: 0.85,
                    }}
                  />
                ))}
              </div>
              <p
                style={{
                  fontSize: "0.72rem",
                  color: "var(--text-mid)",
                  textAlign: "center",
                  lineHeight: 1.5,
                }}
              >
                9 pieces · one image · assembles into a 6×6″ mosaic
              </p>
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <div className="section-label" style={{ marginBottom: "0.8rem" }}>
            ◆ {product.isPuzzle ? "Puzzle Set — 9 pieces, 1 photo" : `${product.size}" Shell · ${product.qty} photos per set`}
          </div>

          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.8rem, 3vw, 2.5rem)",
              fontWeight: 400,
              color: "var(--navy)",
              marginBottom: "0.5rem",
              lineHeight: 1.2,
            }}
          >
            {product.name}
          </h1>

          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.8rem",
              fontWeight: 600,
              color: "var(--gold)",
              marginBottom: "1.5rem",
            }}
          >
            ${product.price}.00
          </div>

          <p
            style={{
              fontSize: "0.9rem",
              color: "var(--text-mid)",
              lineHeight: 1.8,
              marginBottom: "2rem",
            }}
          >
            {product.longDesc}
          </p>

          {/* Features */}
          <ul style={{ listStyle: "none", marginBottom: "2.5rem" }}>
            {product.features.map((f) => (
              <li
                key={f}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.7rem",
                  padding: "0.55rem 0",
                  borderBottom: "1px solid var(--cream)",
                  fontSize: "0.85rem",
                  color: "var(--text-mid)",
                }}
              >
                <span style={{ color: "var(--gold)", fontWeight: 600 }}>◆</span>
                {f}
              </li>
            ))}
          </ul>

          {/* CTA */}
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <Link href={`/en/order?product=${product.id}`}>
              <span className="btn-primary" style={{ fontSize: "0.8rem" }}>
                Order Now →
              </span>
            </Link>
            <Link href="/en/contact">
              <span className="btn-outline" style={{ fontSize: "0.8rem" }}>
                Ask a Question
              </span>
            </Link>
          </div>

          {/* Trust badges */}
          <div
            style={{
              display: "flex",
              gap: "1.5rem",
              marginTop: "2rem",
              paddingTop: "1.5rem",
              borderTop: "1px solid var(--taupe)",
              flexWrap: "wrap",
            }}
          >
            {["Free U.S. Shipping", "7-Day Production", "Gift-Ready Packaging", "NFC + QR Included"].map((b) => (
              <div
                key={b}
                style={{
                  fontSize: "0.65rem",
                  fontWeight: 500,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--text-muted)",
                }}
              >
                ◆ {b}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .product-layout { grid-template-columns: 1fr 1fr; }
        @media (max-width: 768px) {
          .product-layout { grid-template-columns: 1fr !important; gap: 2rem !important; }
        }
      `}</style>
    </div>
  );
}
