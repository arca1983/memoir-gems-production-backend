"use client";
import { useState } from "react";
import Link from "next/link";

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, type: "contact" }),
      });
      const data = await res.json();
      if (data.success) setSent(true);
    } catch {
      alert("Something went wrong. Please email contact@memoirgems.com directly.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ background: "var(--ivory)" }}>
      <div style={{ background: "var(--navy)", padding: "5rem 2rem", textAlign: "center" }}>
        <div className="section-label" style={{ color: "var(--gold-light)", marginBottom: "0.8rem" }}>◆ Get in Touch</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 400, color: "var(--ivory)" }}>
          Contact Memoir Gems
        </h1>
        <p style={{ color: "var(--taupe)", fontSize: "0.9rem", marginTop: "0.8rem" }}>
          We respond within a few hours during business hours (Mon–Fri, 9am–6pm CST).
        </p>
      </div>

      <div
        style={{ maxWidth: 1000, margin: "0 auto", padding: "5rem 2rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "start" }}
        className="contact-layout"
      >
        {/* Info column */}
        <div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", fontWeight: 400, color: "var(--navy)", marginBottom: "1.5rem" }}>
            How Can We Help?
          </h2>
          {[
            { label: "General Questions", icon: "✉️", val: "contact@memoirgems.com" },
            { label: "Order Support", icon: "📦", val: "contact@memoirgems.com" },
            { label: "B2B & Bulk Orders", icon: "🏢", val: "contact@memoirgems.com" },
            { label: "Production Hours", icon: "🕐", val: "Mon–Fri, 9am–6pm CST" },
          ].map((item) => (
            <div key={item.label} style={{ display: "flex", gap: "1rem", alignItems: "flex-start", padding: "1.2rem 0", borderBottom: "1px solid var(--cream)" }}>
              <span style={{ fontSize: "1.2rem", flexShrink: 0 }}>{item.icon}</span>
              <div>
                <div style={{ fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--gold)", marginBottom: "0.2rem" }}>{item.label}</div>
                <div style={{ fontSize: "0.88rem", color: "var(--text-mid)" }}>{item.val}</div>
              </div>
            </div>
          ))}

          <div style={{ background: "var(--cream)", padding: "1.5rem", marginTop: "2rem", fontSize: "0.82rem", color: "var(--text-mid)", lineHeight: 1.7 }}>
            <strong style={{ color: "var(--navy)" }}>Rush & Event Orders:</strong> Need your Shells in less than 7 days? Contact us before ordering and we'll confirm if rush production is available.
          </div>

          <div style={{ marginTop: "1.5rem" }}>
            <Link href="/en/order">
              <span className="btn-primary" style={{ fontSize: "0.8rem" }}>Place an Order →</span>
            </Link>
          </div>
        </div>

        {/* Form column */}
        <div>
          {sent ? (
            <div style={{ background: "white", border: "1px solid var(--taupe)", padding: "3rem", textAlign: "center" }}>
              <div style={{ fontSize: "2rem", marginBottom: "1rem", color: "var(--gold)" }}>◆</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", color: "var(--navy)", marginBottom: "0.8rem" }}>Message received</div>
              <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>We'll reply to {form.email} within a few hours.</div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
              {[
                { name: "name", label: "Your Name", type: "text", placeholder: "Jane Smith" },
                { name: "email", label: "Email Address", type: "email", placeholder: "jane@example.com" },
                { name: "subject", label: "Subject", type: "text", placeholder: "Order question, B2B inquiry, etc." },
              ].map((field) => (
                <div key={field.name}>
                  <label style={{ display: "block", fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--navy)", marginBottom: "0.4rem" }}>{field.label}</label>
                  <input
                    type={field.type}
                    required
                    placeholder={field.placeholder}
                    value={form[field.name as keyof typeof form]}
                    onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
                    style={{ width: "100%", padding: "0.75rem 1rem", border: "1px solid var(--taupe)", background: "white", fontSize: "0.88rem", color: "var(--text-dark)", outline: "none", fontFamily: "var(--font-body)", boxSizing: "border-box" }}
                  />
                </div>
              ))}
              <div>
                <label style={{ display: "block", fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--navy)", marginBottom: "0.4rem" }}>Message</label>
                <textarea
                  required
                  rows={5}
                  placeholder="Tell us how we can help..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  style={{ width: "100%", padding: "0.75rem 1rem", border: "1px solid var(--taupe)", background: "white", fontSize: "0.88rem", color: "var(--text-dark)", outline: "none", fontFamily: "var(--font-body)", resize: "vertical", boxSizing: "border-box" }}
                />
              </div>
              <button type="submit" disabled={submitting} className="btn-primary" style={{ fontSize: "0.85rem", cursor: submitting ? "wait" : "pointer", opacity: submitting ? 0.7 : 1 }}>
                {submitting ? "Sending…" : "Send Message →"}
              </button>
            </form>
          )}
        </div>
      </div>

      <style>{`
        .contact-layout { grid-template-columns: 1fr 1fr; }
        @media (max-width: 768px) { .contact-layout { grid-template-columns: 1fr !important; gap: 2rem !important; } }
      `}</style>
    </div>
  );
}
