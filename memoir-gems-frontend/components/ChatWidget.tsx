"use client";
import { useState, useRef, useEffect } from "react";

type Message = { role: "user" | "assistant"; content: string };

// Instant FAQ matching — no API call needed
const FAQ_PATTERNS: { patterns: string[]; answer: string }[] = [
  {
    patterns: ["precio", "price", "cost", "costo", "cuanto", "cuánto", "how much", "vale"],
    answer: "Our Shell sets range from $48 to $89:\n• Classic 2×2\" — $48 (9 pieces)\n• Standard 2.5×2.5\" — $58 (9 pieces)\n• Portrait 2×3\" — $52 (6 pieces)\n• Story 2.5×3.5\" — $64 (6 pieces)\n• Grand 3×3\" — $74 (4 pieces)\n• Wedding Story Pack — $89\n• Puzzle Shell Set — $79\n\nAll include NFC + QR and free U.S. shipping!",
  },
  {
    patterns: ["shipping", "envio", "envío", "ship", "deliver", "entrega", "how long", "cuanto tiempo"],
    answer: "Free U.S. shipping on all orders! Production takes 7 business days from photo approval, then 2–5 days transit. For rush orders (3-day production), contact us before ordering at contact@memoirgems.com.",
  },
  {
    patterns: ["nfc", "qr", "tap", "link", "url", "how does it work", "como funciona", "cómo funciona"],
    answer: "Every Shell has an embedded NFC chip and printed QR code on the back. Tap any NFC-enabled phone (iPhone 7+ or most Android) and it opens whatever URL you set — a photo album, video, website, anything. You can change the link anytime from your Memoir Gems account. No reprinting needed!",
  },
  {
    patterns: ["return", "refund", "devolucion", "devolución", "reembolso", "money back"],
    answer: "Since every set is custom-made with your photos, we don't accept returns for change of mind. However, if your Shells arrive damaged or with print defects, we'll reprint at no charge. Contact us within 5 days of delivery at contact@memoirgems.com.",
  },
  {
    patterns: ["photo", "foto", "upload", "subir", "imagen", "image", "resolution", "resolución"],
    answer: "After checkout you'll get a secure upload link by email. Any recent phone photo works great — we recommend at least 1500×1500 pixels for square sizes. We review every photo before printing and will let you know if anything needs to be replaced.",
  },
  {
    patterns: ["puzzle", "rompecabezas", "mosaic", "mosaico"],
    answer: "Our Puzzle Shell Set ($79) splits one photo across 9 Shell magnets in a 3×3 grid. When you place them together on your fridge, they form one large 6×6\" image. Each piece still has its own NFC chip so anyone can tap to see the full story!",
  },
  {
    patterns: ["wedding", "boda", "event", "evento", "favor", "gift", "regalo", "occasion"],
    answer: "Our Wedding Story Pack ($89) is our most popular gift — 9 Shells each linked to a different moment from the day. We also make sets for baby showers, graduations, birthdays, memorials, and corporate events. Need 10+ sets? Ask about our event pricing at contact@memoirgems.com.",
  },
  {
    patterns: ["b2b", "business", "negocio", "bulk", "wholesale", "restaurant", "realtor", "hotel", "photographer"],
    answer: "We love working with businesses! Volume discounts:\n• Partner (5+ sets/mo): 10% off\n• Studio (15+ sets/mo): 18% off\n• Enterprise (30+ sets/mo): custom pricing\n\nIdeal for restaurants, realtors, hotels, wedding planners, photographers. Email us at contact@memoirgems.com for a proposal!",
  },
  {
    patterns: ["pay", "pago", "paypal", "credit card", "tarjeta", "visa", "mastercard", "amex"],
    answer: "We accept PayPal, Visa, Mastercard, American Express, and Discover. All payments are processed securely. After your order request, we'll send you a payment link within a few hours.",
  },
  {
    patterns: ["cancel", "cancelar", "change", "cambiar", "modificar", "modify"],
    answer: "You can cancel or change your order within 24 hours of placing it, before photos are approved. After production starts, changes aren't possible. Email contact@memoirgems.com with your order number right away.",
  },
  {
    patterns: ["hola", "hello", "hi", "hey", "buenos", "good morning", "good afternoon", "buenos dias", "buenas"],
    answer: "Hi there! 👋 I'm the Memoir Gems assistant. I can help with questions about our products, shipping, NFC technology, payments, or anything else. What can I help you with?",
  },
  {
    patterns: ["gracias", "thank", "thanks", "perfect", "perfecto", "great", "awesome", "genial"],
    answer: "Of course! Is there anything else I can help you with? If you need to talk to our team directly, we're at contact@memoirgems.com — we respond within a few hours.",
  },
];

function matchFAQ(input: string): string | null {
  const lower = input.toLowerCase();
  for (const item of FAQ_PATTERNS) {
    if (item.patterns.some((p) => lower.includes(p))) {
      return item.answer;
    }
  }
  return null;
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm the Memoir Gems assistant 💎 Ask me anything about our products, shipping, NFC technology, or pricing. I'm here 24/7!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    // Try instant FAQ match first
    const faqAnswer = matchFAQ(text);
    if (faqAnswer) {
      await new Promise((r) => setTimeout(r, 400)); // small delay feels natural
      setMessages((prev) => [...prev, { role: "assistant", content: faqAnswer }]);
      setLoading(false);
      return;
    }

    // Fall back to Claude AI
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.content }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong. Email us at contact@memoirgems.com and we'll respond quickly!" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Chat with Memoir Gems"
        style={{
          position: "fixed",
          bottom: "1.5rem",
          right: "1.5rem",
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "var(--navy)",
          border: "2px solid var(--gold)",
          color: "var(--gold-light)",
          fontSize: "1.4rem",
          cursor: "pointer",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 20px rgba(13,27,42,0.35)",
          transition: "transform 0.2s",
        }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.transform = "scale(1.08)")}
        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.transform = "scale(1)")}
      >
        {open ? "✕" : "💎"}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: "5rem",
            right: "1.5rem",
            width: "min(360px, calc(100vw - 2rem))",
            background: "white",
            border: "1px solid var(--taupe)",
            boxShadow: "0 8px 40px rgba(13,27,42,0.2)",
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
            maxHeight: "70vh",
          }}
        >
          {/* Header */}
          <div
            style={{
              background: "var(--navy)",
              padding: "1rem 1.2rem",
              display: "flex",
              alignItems: "center",
              gap: "0.8rem",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "var(--gold)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1rem",
                flexShrink: 0,
              }}
            >
              💎
            </div>
            <div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "0.95rem",
                  color: "var(--ivory)",
                  fontWeight: 500,
                }}
              >
                Memoir Gems
              </div>
              <div style={{ fontSize: "0.65rem", color: "var(--gold-light)", letterSpacing: "0.08em" }}>
                ● Online 24/7
              </div>
            </div>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "1rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.8rem",
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    maxWidth: "82%",
                    padding: "0.65rem 0.9rem",
                    background: msg.role === "user" ? "var(--navy)" : "var(--cream)",
                    color: msg.role === "user" ? "var(--ivory)" : "var(--text-dark)",
                    fontSize: "0.82rem",
                    lineHeight: 1.6,
                    whiteSpace: "pre-line",
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div
                  style={{
                    background: "var(--cream)",
                    padding: "0.65rem 1rem",
                    fontSize: "0.82rem",
                    color: "var(--text-muted)",
                    fontStyle: "italic",
                  }}
                >
                  Thinking…
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick suggestions */}
          <div
            style={{
              padding: "0.5rem 1rem",
              display: "flex",
              gap: "0.4rem",
              flexWrap: "wrap",
              borderTop: "1px solid var(--cream)",
            }}
          >
            {["Pricing", "Shipping", "NFC?", "Puzzle set"].map((s) => (
              <button
                key={s}
                onClick={() => { setInput(s); }}
                style={{
                  fontSize: "0.65rem",
                  padding: "0.3rem 0.6rem",
                  background: "var(--cream)",
                  border: "1px solid var(--taupe)",
                  color: "var(--navy)",
                  cursor: "pointer",
                  letterSpacing: "0.05em",
                }}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input */}
          <div
            style={{
              display: "flex",
              borderTop: "1px solid var(--taupe)",
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask anything…"
              style={{
                flex: 1,
                padding: "0.75rem 1rem",
                border: "none",
                outline: "none",
                fontSize: "0.85rem",
                fontFamily: "var(--font-body)",
                color: "var(--text-dark)",
              }}
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              style={{
                background: loading || !input.trim() ? "var(--taupe)" : "var(--navy)",
                color: "var(--ivory)",
                border: "none",
                padding: "0 1rem",
                cursor: loading || !input.trim() ? "default" : "pointer",
                fontSize: "1rem",
                transition: "background 0.2s",
              }}
            >
              →
            </button>
          </div>

          {/* Footer */}
          <div
            style={{
              padding: "0.4rem 1rem",
              fontSize: "0.6rem",
              color: "var(--text-muted)",
              textAlign: "center",
              background: "var(--cream)",
              letterSpacing: "0.06em",
            }}
          >
            Powered by Memoir Gems AI · contact@memoirgems.com
          </div>
        </div>
      )}
    </>
  );
}
