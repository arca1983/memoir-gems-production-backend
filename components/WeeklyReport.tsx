"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type OrderLine = {
  id: string;
  order_id: string;
  customer_name: string;
  total_price: number | null;
  total_cost: number | null;
  photo_count: number | null;
  created_at: string;
};

type MaterialAlert = {
  material_label: string;
  quantity_on_hand: number;
  reorder_threshold: number | null;
  unit: string;
};

type BatchLine = {
  id: string;
  batch_number: string;
  total_sheets: number | null;
  photo_paper_needed: number | null;
  total_photos: number | null;
  created_at: string;
};

function statusOf(onHand: number, threshold: number) {
  if (onHand <= 0) return { badge: "badge red", label: "Out of Stock" };
  if (onHand < threshold) return { badge: "badge red", label: "Low Stock" };
  return { badge: "badge green", label: "In Stock" };
}

export default function WeeklyReport() {
  const [orders, setOrders] = useState<OrderLine[]>([]);
  const [batches, setBatches] = useState<BatchLine[]>([]);
  const [alerts, setAlerts] = useState<MaterialAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const since = new Date();
  since.setDate(since.getDate() - 7);
  const sinceIso = since.toISOString();

  async function loadData() {
    setLoading(true);

    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .select("id, order_id, customer_name, total_price, total_cost, photo_count, created_at")
      .gte("created_at", sinceIso)
      .order("created_at", { ascending: false });

    if (orderError) setMessage(orderError.message);
    else setOrders((orderData || []) as OrderLine[]);

    const { data: batchData } = await supabase
      .from("production_batches")
      .select("id, batch_number, total_sheets, photo_paper_needed, total_photos, created_at")
      .gte("created_at", sinceIso)
      .order("created_at", { ascending: false });
    setBatches((batchData || []) as BatchLine[]);

    const { data: materialData } = await supabase
      .from("material_inventory")
      .select("material_label, quantity_on_hand, reorder_threshold, unit");
    const flagged = ((materialData || []) as MaterialAlert[]).filter(
      (m) => m.quantity_on_hand <= (m.reorder_threshold ?? 0)
    );
    setAlerts(flagged);

    setLoading(false);
  }

  useEffect(() => { loadData(); }, []);

  const priced = orders.filter((o) => o.total_price != null);
  const unpriced = orders.filter((o) => o.total_price == null);
  const revenue = priced.reduce((sum, o) => sum + (o.total_price || 0), 0);
  const cost = priced.reduce((sum, o) => sum + (o.total_cost || 0), 0);
  const profit = revenue - cost;
  const sheetsThisWeek = batches.reduce((sum, b) => sum + (b.photo_paper_needed || b.total_sheets || 0), 0);
  const photosThisWeek = batches.reduce((sum, b) => sum + (b.total_photos || 0), 0);

  return (
    <>
      <div className="admin-header-row no-print">
        <div>
          <h1>Weekly Report</h1>
          <p>Last 7 days — {since.toLocaleDateString()} to {new Date().toLocaleDateString()}.</p>
        </div>
        <button className="secondary" onClick={loadData}>↻ Refresh</button>
      </div>

      {message && <div className="status yellow">{message}</div>}
      {loading && <p className="small" style={{ color: "#888" }}>Loading…</p>}

      <div className="card">
        <h2>Sales</h2>
        <div className="stat-grid">
          <div className="stat-card"><b>{orders.length}</b><span>orders this week</span></div>
          <div className="stat-card" style={{ background: "var(--green-bg)", color: "var(--green-text)", borderColor: "#86efac" }}>
            <b>${revenue.toFixed(2)}</b><span>revenue</span>
          </div>
          <div className="stat-card"><b>${cost.toFixed(2)}</b><span>cost</span></div>
          <div
            className="stat-card"
            style={profit >= 0
              ? { background: "var(--green-bg)", color: "var(--green-text)", borderColor: "#86efac" }
              : { background: "var(--red-bg)", color: "var(--red-text)", borderColor: "#fca5a5" }}
          >
            <b>${profit.toFixed(2)}</b><span>profit</span>
          </div>
        </div>
        {unpriced.length > 0 && (
          <div className="status yellow" style={{ marginTop: 12 }}>
            {unpriced.length} order{unpriced.length > 1 ? "s" : ""} this week still missing a price — revenue above excludes them.
          </div>
        )}
        {unpriced.length > 0 && (
          <table className="table" style={{ marginTop: 8 }}>
            <thead><tr><th>Order</th><th>Customer</th><th>Date</th><th></th></tr></thead>
            <tbody>
              {unpriced.map((o) => (
                <tr key={o.id}>
                  <td><b>{o.order_id}</b></td>
                  <td>{o.customer_name}</td>
                  <td>{new Date(o.created_at).toLocaleDateString()}</td>
                  <td><Link className="button secondary" href={`/admin/orders/${encodeURIComponent(o.order_id)}`}>Add Price</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card">
        <h2>Inventory — Needs Attention</h2>
        {alerts.length === 0 ? (
          <p className="small" style={{ color: "#888" }}>Everything is above its reorder threshold.</p>
        ) : (
          <table className="table">
            <thead><tr><th>Material</th><th>On Hand</th><th>Threshold</th><th>Status</th></tr></thead>
            <tbody>
              {alerts.map((a) => {
                const { badge, label } = statusOf(a.quantity_on_hand, a.reorder_threshold ?? 0);
                return (
                  <tr key={a.material_label}>
                    <td><b>{a.material_label}</b></td>
                    <td>{a.quantity_on_hand} {a.unit}</td>
                    <td>{a.reorder_threshold ?? "—"}</td>
                    <td><span className={badge}>{label}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        <div className="actions" style={{ marginTop: 12 }}>
          <Link className="button secondary" href="/admin/inventory">Open Full Inventory →</Link>
        </div>
      </div>

      <div className="card">
        <h2>Production</h2>
        <div className="stat-grid">
          <div className="stat-card"><b>{batches.length}</b><span>batches this week</span></div>
          <div className="stat-card"><b>{photosThisWeek}</b><span>photos printed</span></div>
          <div className="stat-card"><b>{sheetsThisWeek}</b><span>sheets used</span></div>
        </div>
        <div className="actions" style={{ marginTop: 12 }}>
          <Link className="button secondary" href="/admin/batches">Open Batches →</Link>
        </div>
      </div>
    </>
  );
}
