"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Script from "next/script";
import Link from "next/link";

const STRIPE_PK = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";
const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";

const PRODUCTS = [
  { id: "shell-2x2",      name: "Classic Shell 2×2\"",     price: 48, qty: 9 },
  { id: "shell-2-5x2-5",  name: "Standard Shell 2.5×2.5\"",price: 58, qty: 9 },
  { id: "shell-2x3",      name: "Portrait Shell 2×3\"",     price: 52, qty: 6 },
  { id: "shell-2-5x3-5",  name: "Story Shell 2.5×3.5\"",   price: 64, qty: 6 },
  { id: "shell-3x3",      name: "Grand Shell 3×3\"",        price: 74, qty: 4 },
  { id: "wedding-pack",   name: "Wedding Story Pack",       price: 89, qty: 9 },
  { id: "puzzle-shells",  name: "Puzzle Shell Set",         price: 79, qty: 9 },
];

// ── Stripe card form (vanilla Stripe.js via CDN) ────────────────────────────
function StripeForm({ amount, orderNumber, email, onSuccess }: {
  amount: number; orderNumber: string; email: string; onSuccess: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const stripeRef = useRef<any>(null);
  const cardElementRef = useRef<any>(null);

  useEffect(() => {
    if (!(window as any).Stripe || !cardRef.current) return;
    const stripe = (window as any).Stripe(STRIPE_PK);
    stripeRef.current = stripe;
    const elements = stripe.elements();
    const card = elements.create("card", {
      style: {
        base: {
          fontFamily: "'Georgia', serif",
          fontSize: "16px",
          color: "#0D1B2A",
          "::placeholder": { color: "#999" },
        },
      },
    });
    card.mount(cardRef.current);
    cardElementRef.current = card;
    card.on("ready", () => setReady(true));
    return () => card.destroy();
  }, []);

  async function handlePay() {
    if (!stripeRef.current || !cardElementRef.current) return;
    setPaying(true);
    setError("");
    try {
      // Create payment intent
      const res = await fetch("/api/stripe/create-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, orderNumber, customerEmail: email }),
      });
      const { clientSecret, error: apiErr } = await res.json();
      if (apiErr) { setError(apiErr); setPaying(false); return; }

      const { error: stripeErr } = await stripeRef.current.confirmCardPayment(clientSecret, {
        payment_method: { card: cardElementRef.current, billing_details: { email } },
      });

      if (stripeErr) {
        setError(stripeErr.message || "Payment failed");
      } else {
        onSuccess();
      }
    } catch {
      setError("Payment failed. Please try again.");
    } finally {
      setPaying(false);
    }
  }

  return (
    <div>
      <div
        ref={cardRef}
        style={{
          padding: "0.85rem 1rem",
          border: "1px solid var(--taupe)",
          background: "white",
          borderRadius: 2,
          minHeight: 44,
          marginBottom: "1rem",
        }}
      />
      {error && (
        <p style={{ color: "#c0392b", fontSize: "0.8rem", marginBottom: "0.8rem" }}>{error}</p>
      )}
      <button
        onClick={handlePay}
        disabled={!ready || paying}
        className="btn-primary"
        style={{ width: "100%", opacity: paying ? 0.7 : 1, cursor: paying ? "wait" : "pointer" }}
      >
        {paying ? "Processing…" : `Pay $${amount}.00 with Card →`}
      </button>
      <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", textAlign: "center", marginTop: "0.5rem" }}>
        🔒 Secured by Stripe · All major cards accepted
      </p>
    </div>
  );
}

// ── PayPal button ────────────────────────────────────────────────────────────
function PayPalButton({ amount, orderNumber, onSuccess }: {
  amount: number; orderNumber: string; onSuccess: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendered = useRef(false);

  useEffect(() => {
    if (rendered.current || !(window as any).paypal || !containerRef.current) return;
    rendered.current = true;

    (window as any).paypal.Buttons({
      style: { layout: "vertical", color: "gold", shape: "rect", label: "pay" },
      createOrder: (_: any, actions: any) => {
        return actions.order.create({
          purchase_units: [{
            amount: { value: String(amount.toFixed(2)) },
            description: `Memoir Gems ${orderNumber}`,
          }],
        });
      },
      onApprove: async (_: any, actions: any) => {
        await actions.order.capture();
        onSuccess();
      },
      onError: (err: any) => {
        console.error("PayPal error:", err);
        alert("PayPal payment failed. Please try again or use a card.");
      },
    }).render(containerRef.current);
  }, [amount, orderNumber, onSuccess]);

  return <div ref={containerRef} style={{ marginTop: "0.5rem" }} />;
}

// ── Main Order Form ──────────────────────────────────────────────────────────
function OrderForm() {
  const params = useSearchParams();
  const preselected = params.get("product") || "";
  const defaultProduct = PRODUCTS.find((p) => p.id === preselected) || PRODUCTS[0];

  const [step, setStep] = useState<"details" | "payment">("details");
  const [form, setForm] = useState({
    name: "", email: "", phone: "",
    product: defaultProduct.id,
    qty: 1,
    notes: "",
    paymentMethod: STRIPE_PK ? "card" : PAYPAL_CLIENT_ID ? "paypal" : "request",
  });
  const [orderNumber, setOrderNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [stripeLoaded, setStripeLoaded] = useState(false);
  const [paypalLoaded, setPaypalLoaded] = useState(false);

  const selectedProduct = PRODUCTS.find((p) => p.id === form.product) || defaultProduct;
  const total = selectedProduct.price * form.qty;

  // Save order to Supabase, get order number, then move to payment
  async function handleDetailsSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          product: form.product,
          size: selectedProduct.name,
          qty: form.qty,
          price: total,
          notes: form.notes,
          payment_method: form.paymentMethod,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOrderNumber(data.orderNumber);
        // If no payment gateway, show success immediately
        if (form.paymentMethod === "request") {
          setSubmitted(true);
        } else {
          setStep("payment");
        }
      }
    } catch {
      alert("Something went wrong. Please email contact@memoirgems.com directly.");
    } finally {
      setSubmitting(false);
    }
  }

  // Success screen
  if (submitted) {
    return (
      <div style={{ maxWidth: 560, margin: "4rem auto", padding: "3rem 2rem", background: "white", border: "1px solid var(--taupe)", textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>◆</div>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", color: "var(--navy)", marginBottom: "1rem" }}>
          {step === "payment" ? "Payment Confirmed!" : "Order Request Received!"}
        </h2>
        <div style={{ background: "var(--cream)", padding: "1rem", marginBottom: "1.5rem", fontSize: "0.85rem", color: "var(--navy)", fontWeight: 600 }}>
          Order #{orderNumber}
        </div>
        <p style={{ fontSize: "0.88rem", color: "var(--text-mid)", lineHeight: 1.8, marginBottom: "2rem" }}>
          {step === "payment"
            ? "Payment received! You'll get an email confirmation shortly. We'll send your secure photo upload link within a few hours."
            : "Thank you! We'll email you within a few hours with payment instructions and your secure photo upload link."}
        </p>
        <Link href="/en/products">
          <span className="btn-primary" style={{ fontSize: "0.82rem" }}>Browse More Products</span>
        </Link>
      </div>
    );
  }

  // Payment step
  if (step === "payment") {
    return (
      <div style={{ maxWidth: 540, margin: "0 auto", padding: "2rem" }}>
        {/* Summary */}
        <div style={{ background: "var(--cream)", padding: "1.2rem 1.5rem", marginBottom: "2rem", border: "1px solid var(--taupe)", fontSize: "0.85rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
            <span style={{ color: "var(--text-mid)" }}>{selectedProduct.name}</span>
            <span style={{ color: "var(--navy)", fontWeight: 600 }}>${selectedProduct.price} × {form.qty}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--taupe)", paddingTop: "0.6rem", marginTop: "0.6rem" }}>
            <span style={{ fontWeight: 700, color: "var(--navy)" }}>Total</span>
            <span style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", color: "var(--gold)" }}>${total}.00</span>
          </div>
          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.4rem" }}>
            Order #{orderNumber} · Free U.S. shipping · 7-day production
          </div>
        </div>

        {/* Payment method tabs */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
          {STRIPE_PK && (
            <button
              onClick={() => setForm({ ...form, paymentMethod: "card" })}
              style={{
                flex: 1, padding: "0.7rem", fontSize: "0.82rem", fontWeight: 600,
                background: form.paymentMethod === "card" ? "var(--navy)" : "white",
                color: form.paymentMethod === "card" ? "white" : "var(--navy)",
                border: "1px solid var(--navy)", cursor: "pointer",
              }}
            >
              💳 Card
            </button>
          )}
          {PAYPAL_CLIENT_ID && (
            <button
              onClick={() => setForm({ ...form, paymentMethod: "paypal" })}
              style={{
                flex: 1, padding: "0.7rem", fontSize: "0.82rem", fontWeight: 600,
                background: form.paymentMethod === "paypal" ? "var(--navy)" : "white",
                color: form.paymentMethod === "paypal" ? "white" : "var(--navy)",
                border: "1px solid var(--navy)", cursor: "pointer",
              }}
            >
              🅿 PayPal
            </button>
          )}
        </div>

        {form.paymentMethod === "card" && STRIPE_PK && (
          <>
            {!stripeLoaded && (
              <Script
                src="https://js.stripe.com/v3/"
                onLoad={() => setStripeLoaded(true)}
              />
            )}
            {stripeLoaded && (
              <StripeForm
                amount={total}
                orderNumber={orderNumber}
                email={form.email}
                onSuccess={() => setSubmitted(true)}
              />
            )}
            {!stripeLoaded && (
              <p style={{ textAlign: "center", color: "var(--text-muted)", padding: "1rem" }}>
                Loading payment form…
              </p>
            )}
          </>
        )}

        {form.paymentMethod === "paypal" && PAYPAL_CLIENT_ID && (
          <>
            {!paypalLoaded && (
              <Script
                src={`https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD`}
                onLoad={() => setPaypalLoaded(true)}
              />
            )}
            {paypalLoaded && (
              <PayPalButton
                amount={total}
                orderNumber={orderNumber}
                onSuccess={() => setSubmitted(true)}
              />
            )}
            {!paypalLoaded && (
              <p style={{ textAlign: "center", color: "var(--text-muted)", padding: "1rem" }}>
                Loading PayPal…
              </p>
            )}
          </>
        )}

        <button
          onClick={() => setStep("details")}
          style={{ marginTop: "1.5rem", background: "none", border: "none", color: "var(--text-muted)", fontSize: "0.8rem", cursor: "pointer", textDecoration: "underline", display: "block", margin: "1.5rem auto 0" }}
        >
          ← Go back
        </button>
      </div>
    );
  }

  // Details step (default)
  return (
    <form onSubmit={handleDetailsSubmit} style={{ maxWidth: 640, margin: "0 auto", padding: "2rem" }}>

      {/* Progress indicator */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "2rem", fontSize: "0.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontWeight: 700, color: "var(--navy)" }}>
          <div style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--navy)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 700 }}>1</div>
          Order Details
        </div>
        <div style={{ flex: 1, height: 1, background: "var(--taupe)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", color: "var(--text-muted)" }}>
          <div style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--taupe)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 700 }}>2</div>
          Payment
        </div>
      </div>

      {/* Product */}
      <div style={{ background: "var(--cream)", padding: "1.5rem", marginBottom: "2rem", border: "1px solid var(--taupe)" }}>
        <div className="section-label" style={{ marginBottom: "1rem" }}>◆ Your Order</div>
        <div style={{ marginBottom: "1rem" }}>
          <label style={labelStyle}>Product</label>
          <select
            value={form.product}
            onChange={(e) => setForm({ ...form, product: e.target.value })}
            style={inputStyle}
          >
            {PRODUCTS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — ${p.price} ({p.qty} pieces per set)
              </option>
            ))}
          </select>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Quantity (sets)</label>
            <input
              type="number" min={1} max={50}
              value={form.qty}
              onChange={(e) => setForm({ ...form, qty: parseInt(e.target.value) || 1 })}
              style={{ ...inputStyle, width: 90 }}
            />
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", color: "var(--gold)", fontWeight: 600, paddingTop: "1rem" }}>
            ${total}.00
          </div>
        </div>
        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.8rem" }}>
          Free U.S. shipping · 7-day production · NFC + QR included · Gift Pouch included
        </div>
      </div>

      {/* Contact */}
      <div className="section-label" style={{ marginBottom: "1rem" }}>◆ Your Information</div>
      {[
        { name: "name",  label: "Full Name",        type: "text",  placeholder: "Jane Smith",           required: true },
        { name: "email", label: "Email Address",     type: "email", placeholder: "jane@example.com",     required: true },
        { name: "phone", label: "Phone (optional)",  type: "tel",   placeholder: "+1 (555) 000-0000",    required: false },
      ].map((f) => (
        <div key={f.name} style={{ marginBottom: "1.2rem" }}>
          <label style={labelStyle}>{f.label}</label>
          <input
            type={f.type}
            required={f.required}
            placeholder={f.placeholder}
            value={(form as any)[f.name]}
            onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
            style={{ ...inputStyle, width: "100%" }}
          />
        </div>
      ))}

      {/* Payment preference (if no gateway keys, show legacy options) */}
      {!STRIPE_PK && !PAYPAL_CLIENT_ID && (
        <div style={{ marginBottom: "1.5rem" }}>
          <div className="section-label" style={{ marginBottom: "1rem" }}>◆ Payment Preference</div>
          <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "0.8rem" }}>
            We'll send you a payment link via email:
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
            {[
              { id: "paypal", label: "PayPal", icon: "🅿" },
              { id: "card",   label: "Credit / Debit", icon: "💳" },
              { id: "venmo",  label: "Venmo", icon: "V" },
              { id: "zelle",  label: "Zelle", icon: "Z" },
            ].map((m) => (
              <label key={m.id} style={{
                display: "flex", alignItems: "center", gap: "0.6rem",
                padding: "0.8rem 1rem",
                border: `1px solid ${form.paymentMethod === m.id ? "var(--navy)" : "var(--taupe)"}`,
                background: form.paymentMethod === m.id ? "var(--cream)" : "white",
                cursor: "pointer", fontSize: "0.85rem", color: "var(--navy)",
              }}>
                <input
                  type="radio" name="payment" value={m.id}
                  checked={form.paymentMethod === m.id}
                  onChange={() => setForm({ ...form, paymentMethod: m.id })}
                  style={{ accentColor: "var(--navy)" }}
                />
                <span style={{ fontSize: "1rem" }}>{m.icon}</span>
                {m.label}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      <div style={{ marginBottom: "1.5rem" }}>
        <label style={labelStyle}>Notes (optional)</label>
        <textarea
          rows={3}
          placeholder="Gift message, rush order, special instructions…"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          style={{ ...inputStyle, width: "100%", resize: "vertical" }}
        />
      </div>

      <button
        type="submit" disabled={submitting} className="btn-primary"
        style={{ width: "100%", fontSize: "0.88rem", cursor: submitting ? "wait" : "pointer", opacity: submitting ? 0.7 : 1 }}
      >
        {submitting
          ? "Saving…"
          : STRIPE_PK || PAYPAL_CLIENT_ID
            ? `Continue to Payment — $${total}.00 →`
            : `Place Order Request — $${total}.00 →`}
      </button>

      <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", textAlign: "center", marginTop: "1rem", lineHeight: 1.6 }}>
        {STRIPE_PK || PAYPAL_CLIENT_ID
          ? "Your order is saved. Next step: secure payment via Stripe or PayPal."
          : "No payment now. We'll email you a secure payment link within a few hours."}
        <br />
        After payment, you'll receive a photo upload link. Production: 7 business days.
      </p>
    </form>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "0.68rem", fontWeight: 600,
  letterSpacing: "0.12em", textTransform: "uppercase",
  color: "var(--navy)", marginBottom: "0.4rem",
};
const inputStyle: React.CSSProperties = {
  padding: "0.75rem 1rem", border: "1px solid var(--taupe)",
  background: "white", fontSize: "0.88rem", color: "var(--text-dark)",
  fontFamily: "var(--font-body)", boxSizing: "border-box",
};

export default function OrderPage() {
  return (
    <div style={{ background: "var(--ivory)", minHeight: "100vh", paddingBottom: "5rem" }}>
      <div style={{ background: "var(--navy)", padding: "4rem 2rem", textAlign: "center" }}>
        <div className="section-label" style={{ color: "var(--gold-light)", marginBottom: "0.8rem" }}>◆ Order</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem, 3vw, 2.8rem)", fontWeight: 400, color: "var(--ivory)", marginBottom: "0.8rem" }}>
          Place Your Order
        </h1>
        <p style={{ color: "var(--taupe)", fontSize: "0.88rem" }}>
          Premium photo magnets · Free U.S. shipping · 7-day production
        </p>
      </div>

      <Suspense fallback={<div style={{ textAlign: "center", padding: "4rem" }}>Loading…</div>}>
        <OrderForm />
      </Suspense>
    </div>
  );
}
