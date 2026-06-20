import Link from "next/link";

export default function AboutPage() {
  return (
    <div style={{ background: "var(--ivory)" }}>
      {/* Hero */}
      <div style={{ background: "var(--navy)", padding: "6rem 2rem", textAlign: "center" }}>
        <div className="section-label" style={{ color: "var(--gold-light)", marginBottom: "0.8rem" }}>◆ Our Story</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 4vw, 3.5rem)", fontWeight: 400, color: "var(--ivory)", marginBottom: "1.2rem" }}>
          Turning Photographs Into<br />Living Keepsakes
        </h1>
        <p style={{ color: "var(--taupe)", fontSize: "0.95rem", maxWidth: 540, margin: "0 auto", lineHeight: 1.8 }}>
          Memoir Gems was born from a simple belief: your most important photos deserve to live somewhere better than a phone screen.
        </p>
      </div>

      {/* Story */}
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "5rem 2rem" }}>
        <div className="section-label" style={{ marginBottom: "1.5rem" }}>◆ Why We Started</div>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.6rem, 2.5vw, 2.2rem)", fontWeight: 400, color: "var(--navy)", marginBottom: "1.5rem" }}>
          A Memory You Can Hold — and Tap
        </h2>
        <div style={{ fontSize: "0.9rem", color: "var(--text-mid)", lineHeight: 1.9 }}>
          <p style={{ marginBottom: "1.2rem" }}>
            We started Memoir Gems in Texas with a question we couldn't stop asking: what if a photo magnet could do more than just hang on a fridge? What if it could open a whole world of memory with a single tap?
          </p>
          <p style={{ marginBottom: "1.2rem" }}>
            The Shell was our answer. A rigid, UV-printed photo magnet with an embedded NFC chip and dynamic QR code — so the photo on the front leads somewhere meaningful on the back. A video of the wedding. A shared album. A virtual memorial. A restaurant menu that updates without reprinting.
          </p>
          <p style={{ marginBottom: "1.2rem" }}>
            Every Shell ships gift-ready in our signature Gather Pouch — tissue paper, bronze satin ribbon, and a keepsake that truly does more than any magnet before it.
          </p>
          <p>
            We're based in Texas and ship across the U.S. Every set is made one order at a time, with your photos, your moments, your story.
          </p>
        </div>
      </div>

      {/* Values */}
      <div style={{ background: "var(--cream)", padding: "5rem 2rem" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div className="section-label" style={{ textAlign: "center", marginBottom: "3rem" }}>◆ What We Stand For</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "2rem" }} className="values-grid">
            {[
              { icon: "◆", title: "Custom, Always", desc: "Every set is made with your photos. No templates, no stock images — your memory, exactly as you lived it." },
              { icon: "◎", title: "Technology That Adds Meaning", desc: "NFC + QR isn't a gimmick. It's a bridge between the physical and digital — the photo and the story behind it." },
              { icon: "✦", title: "Gift-Ready, Always", desc: "Every Shell ships in the Gather Pouch. You never need to wrap or prep — it's ready the moment it arrives." },
            ].map((v) => (
              <div key={v.title} style={{ textAlign: "center", padding: "2rem" }}>
                <div style={{ fontSize: "1.5rem", color: "var(--gold)", marginBottom: "1rem" }}>{v.icon}</div>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", color: "var(--navy)", marginBottom: "0.7rem" }}>{v.title}</h3>
                <p style={{ fontSize: "0.83rem", color: "var(--text-mid)", lineHeight: 1.7 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ background: "var(--navy)", padding: "5rem 2rem", textAlign: "center" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 400, color: "var(--ivory)", marginBottom: "1rem" }}>
          Ready to Start Your Collection?
        </h2>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/en/products"><span className="btn-gold" style={{ fontSize: "0.85rem" }}>Browse Products →</span></Link>
          <Link href="/en/contact"><span className="btn-outline" style={{ fontSize: "0.85rem", borderColor: "var(--taupe)", color: "var(--ivory)" }}>Contact Us</span></Link>
        </div>
      </div>

      <style>{`
        .values-grid { grid-template-columns: repeat(3,1fr); }
        @media (max-width: 700px) { .values-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
