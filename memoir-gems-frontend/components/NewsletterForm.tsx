"use client";
import { useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || status === "loading") return;
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setStatus(data.success ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div style={{ padding: "0.8rem 1rem", background: "rgba(164,136,70,0.15)", border: "1px solid var(--gold)", fontSize: "0.78rem", color: "var(--gold-light)" }}>
        ◆ You're subscribed. Thank you!
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: 0 }}>
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email address"
        style={{
          flex: 1,
          padding: "0.7rem 0.9rem",
          background: "rgba(255,255,255,0.07)",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRight: "none",
          color: "var(--ivory)",
          fontSize: "0.78rem",
          outline: "none",
        }}
      />
      <button
        type="submit"
        disabled={status === "loading"}
        style={{
          background: status === "loading" ? "var(--taupe)" : "var(--gold)",
          color: "#fff",
          border: "none",
          padding: "0.7rem 1rem",
          fontSize: "0.65rem",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          fontWeight: 600,
          cursor: status === "loading" ? "wait" : "pointer",
          whiteSpace: "nowrap",
        }}
      >
        {status === "loading" ? "…" : "Subscribe"}
      </button>
    </form>
  );
}
