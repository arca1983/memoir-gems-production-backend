"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const NAV_LINKS = [
  { label: "Products", href: "/en/products" },
  { label: "Customize", href: "/en/customize" },
  { label: "Events", href: "/en/events" },
  { label: "How It Works", href: "/en/how-it-works" },
  { label: "B2B", href: "/en/b2b" },
  { label: "FAQ", href: "/en/faq" },
  { label: "Contact", href: "/en/contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Announcement bar */}
      <div className="announcement-bar">
        ♦ Free U.S. shipping on every set &nbsp;·&nbsp; Ships in 7 days &nbsp;·&nbsp; NFC + QR on all Shell sizes ♦
      </div>

      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: scrolled ? "rgba(247,242,231,0.97)" : "var(--ivory)",
          backdropFilter: scrolled ? "blur(8px)" : "none",
          borderBottom: scrolled ? "1px solid var(--taupe)" : "1px solid transparent",
          transition: "background 0.3s, border-color 0.3s, backdrop-filter 0.3s",
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "0 2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 68,
          }}
        >
          {/* Logo */}
          <Link href="/en" style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.4rem",
                fontWeight: 600,
                letterSpacing: "0.08em",
                color: "var(--navy)",
                textTransform: "uppercase",
              }}
            >
              Memoir Gems
            </span>
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.6rem",
                letterSpacing: "0.2em",
                color: "var(--gold)",
                textTransform: "uppercase",
                fontWeight: 500,
              }}
            >
              Treasure Your Story
            </span>
          </Link>

          {/* Desktop nav */}
          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.2rem",
            }}
            className="desktop-nav"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.7rem",
                  fontWeight: 500,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--navy)",
                  padding: "0.4rem 0.7rem",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) =>
                  ((e.target as HTMLElement).style.color = "var(--gold)")
                }
                onMouseLeave={(e) =>
                  ((e.target as HTMLElement).style.color = "var(--navy)")
                }
              >
                {link.label}
              </Link>
            ))}

            {/* Lang */}
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.68rem",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--navy)",
                padding: "0.4rem 0.5rem",
                borderLeft: "1px solid var(--taupe)",
                marginLeft: "0.3rem",
                cursor: "pointer",
              }}
            >
              EN
            </span>

            {/* Order CTA */}
            <Link
              href="/en/order"
              style={{
                display: "flex",
                alignItems: "center",
                padding: "0.5rem 1.1rem",
                background: "var(--gold)",
                color: "white",
                fontSize: "0.68rem",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginLeft: "0.5rem",
                whiteSpace: "nowrap",
              }}
            >
              Order Now
            </Link>
          </nav>

          {/* Mobile hamburger */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "none",
              flexDirection: "column",
              gap: 5,
              padding: 4,
            }}
            aria-label="Menu"
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                style={{
                  display: "block",
                  width: 24,
                  height: 1.5,
                  background: "var(--navy)",
                  transition: "transform 0.2s",
                }}
              />
            ))}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <nav
            style={{
              background: "var(--ivory)",
              borderTop: "1px solid var(--taupe)",
              padding: "1rem 2rem 1.5rem",
            }}
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                style={{
                  display: "block",
                  fontFamily: "var(--font-body)",
                  fontSize: "0.8rem",
                  fontWeight: 500,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--navy)",
                  padding: "0.7rem 0",
                  borderBottom: "1px solid var(--cream)",
                }}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/en/order"
              style={{
                display: "inline-flex",
                marginTop: "1rem",
              }}
            >
              <span className="btn-gold">Order Now</span>
            </Link>
          </nav>
        )}

        <style>{`
          @media (max-width: 900px) {
            .desktop-nav { display: none !important; }
            .mobile-menu-btn { display: flex !impor