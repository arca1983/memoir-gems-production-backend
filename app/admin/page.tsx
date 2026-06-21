"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import NavBar from "@/components/NavBar";
import { ACTIVE_FORMATS } from "@/lib/formats";

type DashboardStats = {
  totalOrders: number;
  pendingPhotoApproval: number;
  readyForBatch: number;
  activeBatches: number;
  awaitingShipment: number;
  issueReview: number;
};

function StatCard({
  value,
  label,
  href,
  highlight,
}: {
  value: number | string;
  label: string;
  href?: string;
  highlight?: "red" | "green" | "yellow";
}) {
  // Reuse the same light-pastel badge colors used everywhere else in the app
  // (--green-bg/--green-text etc.) instead of a one-off dark palette, so
  // highlighted stat cards stay legible and visually consistent.
  const style =
    highlight === "red"    ? { background: "var(--red-bg)",    color: "var(--red-text)",    borderColor: "#fca5a5" } :
    highlight === "green"  ? { background: "var(--green-bg)",  color: "var(--green-text)",  borderColor: "#86efac" } :
    highlight === "yellow" ? { background: "var(--yellow-bg)", color: "var(--yellow-text)", borderColor: "#fde047" } :
    {};

  const inner = (
    <div className="stat-card" style={{ cursor: href ? "pointer" : "default", ...style }}>
      <b style={{ fontSize: "2rem" }}>{value}</b>
      <span>{label}</span>
    </div>
  );
  return href
    ? <Link href={href} style={{ textDecoration: "none" }}>{inner}</Link>
    : inner;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    pendingPhotoApproval: 0,
    readyForBatch: 0,
    activeBatches: 0,
    awaitingShipment: 0,
    issueReview: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      setLoading(true);
      const [ordersRes, batchesRes] = await Promise.all([
        supabase.from("orders").select("id, production_status"),
        supabase.from("production_batches").select("id, batch_status"),
      ]);

      const orders = (ordersRes.data || []) as { production_status: string | null }[];
      const batches = (batchesRes.data || []) as { batch_status: string | null }[];

      setStats({
        totalOrders:          orders.length,
        pendingPhotoApproval: orders.filter((o) => o.production_status === "photos_uploaded").length,
        readyForBatch:        orders.filter((o) => o.production_status === "ready_for_batch").length,
        activeBatches:        batches.filter((b) => ["created","printing","printed","cutting","assembly","quality_check","packing"].includes(b.batch_status || "")).length,
        awaitingShipment:     orders.filter((o) => o.production_status === "packing").length,
        issueReview:          orders.filter((o) => o.production_status === "issue_review").length,
      });
      setLoading(false);
    }
    loadStats();
  }, []);

  return (
    <main className="container">
      <NavBar />

      <div className="admin-header-row">
        <div>
          <h1>Company Admin</h1>
          <p>Memoir Gems — Internal Production System</p>
        </div>
      </div>

      {/* Stats */}
      <div className="card">
        <h2>Live Overview</h2>
        <div className="stat-grid">
          <StatCard value={loading ? "…" : stats.totalOrders}          label="Total Orders"          href="/admin/orders" />
          <StatCard value={loading ? "…" : stats.pendingPhotoApproval} label="Pending Photo Approval" href="/admin/orders" highlight={stats.pendingPhotoApproval > 0 ? "yellow" : undefined} />
          <StatCard value={loading ? "…" : stats.readyForBatch}        label="Ready for Batch"        href="/admin/batches/new" highlight={stats.readyForBatch > 0 ? "green" : undefined} />
          <StatCard value={loading ? "…" : stats.activeBatches}        label="Active Batches"         href="/admin/batches" />
          <StatCard value={loading ? "…" : stats.awaitingShipment}     label="Awaiting Shipment"      href="/admin/orders" />
          <StatCard value={loading ? "…" : stats.issueReview}          label="Issue Review"           href="/admin/orders" highlight={stats.issueReview > 0 ? "red" : undefined} />
        </div>
      </div>

      {/* Quick actions */}
      <div className="card">
        <h2>Production</h2>
        <div className="stat-grid">
          <Link href="/admin/orders" style={{ textDecoration: "none" }}>
            <div className="stat-card" style={{ cursor: "pointer" }}>
              <b>📦</b><span>Orders</span>
            </div>
          </Link>
          <Link href="/admin/batches" style={{ textDecoration: "none" }}>
            <div className="stat-card" style={{ cursor: "pointer" }}>
              <b>🗂</b><span>Batches</span>
            </div>
          </Link>
          <Link href="/admin/batches/new" style={{ textDecoration: "none" }}>
            <div className="stat-card" style={{ cursor: "pointer" }}>
              <b>+</b><span>New Batch</span>
            </div>
          </Link>
          <Link href="/admin/inventory" style={{ textDecoration: "none" }}>
            <div className="stat-card" style={{ cursor: "pointer" }}>
              <b>📋</b><span>Inventory</span>
            </div>
          </Link>
          <Link href="/admin/pricing" style={{ textDecoration: "none" }}>
            <div className="stat-card" style={{ cursor: "pointer" }}>
              <b>💲</b><span>Pricing</span>
            </div>
          </Link>
          <Link href="/admin/reports" style={{ textDecoration: "none" }}>
            <div className="stat-card" style={{ cursor: "pointer" }}>
              <b>📊</b><span>Reports</span>
            </div>
          </Link>
          <Link href="/admin/formats" style={{ textDecoration: "none" }}>
            <div className="stat-card" style={{ cursor: "pointer" }}>
              <b>📐</b><span>Formats</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Active formats — compact summary only; full detail lives on /admin/formats,
          no need to duplicate the whole card grid here. */}
      <Link href="/admin/formats" style={{ textDecoration: "none" }}>
        <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
          <div>
            <h2 style={{ margin: 0 }}>Active Product Formats</h2>
            <p className="small" style={{ margin: "0.25rem 0 0", color: "#888" }}>
              {ACTIVE_FORMATS.map((f) => f.label).join(" · ")}
            </p>
          </div>
          <span className="badge gray">{ACTIVE_FORMATS.length} active →</span>
        </div>
      </Link>

      {/* Developer / QA tools — kept separate from daily production tools so
          they don't get mistaken for part of the real workflow. */}
      <div className="card" style={{ opacity: 0.75 }}>
        <h2 style={{ fontSize: "1rem" }}>Developer Tools</h2>
        <div className="stat-grid">
          <Link href="/admin/test-data" style={{ textDecoration: "none" }}>
            <div className="stat-card" style={{ cursor: "pointer" }}>
              <b>🧪</b><span>Test Data</span>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
