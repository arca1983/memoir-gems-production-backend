"use client";
import { useState } from "react";
import Link from "next/link";

const FAQS = [
  {
    category: "Orders & Production",
    items: [
      {
        q: "How long does production take?",
        a: "7 business days from the time we receive and approve your photos. Rush 3-day production is available — contact us before ordering.",
      },
      {
        q: "How do I send my photos?",
        a: "After you complete your order, you'll receive a secure upload link by email. Upload your photos directly — no apps or accounts required.",
      },
      {
        q: "What photo resolution do I need?",
        a: "We recommend a minimum of 1500×1500 pixels for Square sizes and 1200×1800 pixels for Portrait sizes. Original phone photos work perfectly. We'll flag any that may not print well before starting production.",
      },
      {
        q: "Can I send different photos for each Shell?",
        a: "Yes — each Shell in your set can have a different photo. When uploading, just label each file with the Shell number (Shell 1, Shell 2, etc.).",
      },
      {
        q: "Can I make changes after placing my order?",
        a: "Contact us within 24 hours of ordering. Once photos are approved and production begins, changes are not possible.",
      },
    ],
  },
  {
    category: "NFC & QR Technology",
    items: [
      {
        q: "How does the NFC chip work?",
        a: "Hold any NFC-enabled smartphone within an inch of the Shell and it will automatically open the URL you've assigned. No app required — just tap and it opens in your browser.",
      },
      {
        q: "What phones are compatible with NFC?",
        a: "All iPhone models from iPhone 7 and newer. Most Android phones from 2015 onward. If your phone doesn't support NFC, the QR code on the back of each Shell works for everyone.",
      },
      {
        q: "Can I change the NFC link after receiving my magnets?",
        a: "Yes, any time. Log in at memoirgems.com, go to My Shells, and update the link. Changes are instant — no reprinting needed.",
      },
      {
        q: "What can I link my Shell to?",
        a: "Any URL that works in a browser: Google Photos albums, iCloud shared albums, YouTube videos, Vimeo, Google Drive folders, memorial pages, restaurant menus, wedding websites, and more.",
      },
    ],
  },
  {
    category: "Shipping & Packaging",
    items: [
      {
        q: "Do you offer free shipping?",
        a: "Yes — free standard shipping on all U.S. orders. International shipping is available; rates calculated at checkout.",
      },
      {
        q: "What is the Gather Pouch?",
        a: "Our signature packaging: a premium linen-feel drawstring pouch with tissue paper and bronze satin ribbon. Every set ships inside it. It's gift-ready the moment it arrives.",
      },
      {
        q: "Can I ship directly to a gift recipient?",
        a: "Yes. Enter the recipient's address at checkout. We'll include a handwritten gift note if you add one in the order notes.",
      },
    ],
  },
  {
    category: "Returns & Quality",
    items: [
      {
        q: "What if I'm not happy with the result?",
        a: "We stand behind our printing quality. If your Shells arrive damaged or the print quality is below standard, contact us within 5 days and we'll reprint at no charge.",
      },
      {
        q: "Do you offer refunds?",
        a: "Because each set is custom-produced with your photos, we don't offer refunds once production begins. If there's a quality issue on our end, we'll make it right.",
      },
      {
        q: "Are the magnets safe for kids?",
        a: "Shell magnets contain embedded NFC chips and neodymium magnets. They are not suitable for children under 3. Keep away from pacemakers and credit cards.",
      },
    ],
  },
];

export default function FAQPage() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div style={{ background: "var(--ivory)" }}>
      {/* Header */}
      <div style={{ background: "var(--navy)", padding: "5rem 2rem", textAlign: "center" }}>
        <div className="section-label" style={{ color: "var(--gold-light)", marginBottom: "0.8rem" }}>
          ◆ FAQ
        </div>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2rem, 4vw, 3rem)",
            fontWeight: 400,
            color: "var(--ivory)",
          }}
        >
          Frequently Asked Questions
        </h1>
      </div>

      {/* FAQ sections */}
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "5rem 2rem" }}>
        {FAQS.map((section) => (
          <div key={section.category} style={{ marginBottom: "3.5rem" }}>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.4rem",
                fontWeight: 500,
                color: "var(--navy)",
                marginBottom: "1.5rem",
                paddingBottom: "0.8rem",
                borderBottom: "2px solid var(--gold)",
                display: "inline-block",
              }}
            >
              {section.category}
            </h2>
            {section.items.map((item) => {
              const key = `${section.category}::${item.q}`;
              const isOpen = open === key;
              return (
                <div
                  key={item.q}
                  style={{ borderBottom: "1px solid var(--cream)" }}
                >
                  <button
                    onClick={() => setOpen(isOpen ? null : key)}
                    style={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "1.2rem 0",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left",
                      gap: "1rem",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.95rem",
                        fontWeight: 500,
                        color: "var(--navy)",
                        lineHeight: 1.4,
                      }}
                    >
                      {item.q}
                    </span>
                    <span
                      style={{
                        color: "var(--gold)",
                        fontSize: "1.1rem",
                        flexShrink: 0,
                        transform: isOpen ? "rotate(45deg)" : "rotate(0)",
                        transition: "transform 0.2s",
                        fontWeight: 300,
                      }}
                    >
                      +
                    </span>
                  </button>
                  {isOpen && (
                    <div
                      style={{
                        fontSize: "0.88rem",
                        color: "var(--text-mid)",
                        lineHeight: 1.8,
                        paddingBottom: "1.2rem",
                      }}
                    >
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}

        {/* Still have questions */}
        <div
          style={{
            background: "var(--cream)",
            padding: "2.5rem",
            textAlign: "center",
            marginTop: "2rem",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.4rem",
              color: "var(--navy)",
              marginBottom: "0.8rem",
            }}
          >
            Still have questions?
          </div>
          <p style={{ fontSize: "0.85rem", color: "var(--text-mid)", marginBottom: "1.5rem" }}>
            We respond within a few hours during business hours.
          </p>
          <Link href="/en/contact">
            <span className="btn-primary" style={{ fontSize: "0.82rem" }}>
              Contact Us →
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
