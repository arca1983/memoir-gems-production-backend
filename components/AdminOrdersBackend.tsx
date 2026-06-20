"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  OrderRow,
  PhotoRow,
  photoCountFor,
  publicStatusOf,
  statusBadgeClass,
  statusLabel,
  isInternational,
  carrierOf,
  PRIORITY_LABELS,
} from "@/lib/productionBackend";
import { formatById, resolveFormatId } from "@/lib/formats";

const FILTER_STATUSES = [
  { value: "",                label: "All Statuses" },
  { value: "not_started",     label: "Not Started" },
  { value: "photos_uploaded", label: "Photos Uploaded" },
  { value: "photos_approved", label: "Photos Approved" },
  { value: "ready_for_batch", label: "Ready for Batch" },
  { value: "batched",         label: "Batched" },
  { value: "printing",        label: "Printing" },
  { value: "packing",         label: "Packing" },
  { value: "shipped",         label: "Shipped" },
  { value: "delivered",       label: "Delivered" },
  { value: "issue_review",    label: "Issue / Review" },
];

const FILTER_PRIORITIES = [
  { value: "",         label: "All Types" },
  { value: "standard", label: "\u25cf Standard" },
  { value: "rush",     label: "\u26a1 Rush" },
  { value: "event",    label: "\u2605 Event" },
  { value: "b2b",      label: "\u25a0 B2B" },
];

export default function AdminOrdersBackend() {
  const [orders,  setOrders]  = useState<OrderRow[]>([]);
  const [photos,  setPhotos]  = useState<PhotoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [search,         setSearch]         = useState("");
  const [filterStatus,   setFilterStatus]   = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [selectedIds,    setSelectedIds]    = useState<Set<string>>(new Set());

  async function loadData() {
    setLoading(true);
    const { data: ordersData, error: ordersError } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);

    if (ordersError) { setMessage(ordersError.message); setLoading(false); return; }

    const loadedOrders = (ordersData || []) as OrderRow[];
    setOrders(loadedOrders);

    const orderIds = loadedOrders.map((o) => o.order_id);
    if (orderIds.length === 0) { setPhotos([]); setLoading(false); return; }

    const { data: photosData, error: photosError } = await supabase
      .from("order_photos")
      .select("id, order_id, order_number, photo_url, photo_name, photo_number, photo_status, approved_for_print, batch_id")
      .in("order_number", orderIds)
      .order("created_at", { ascending: true });

    if (photosError) setMessage(photosError.message);
    else { setPhotos((photosData || []) as PhotoRow[]); setMessage(""); }
    setLoading(false);
  }

  async function updateOrder(order: OrderRow, values: Partial<OrderRow>, eventLabel: string) {
    const { error } = await supabase.from("orders").update(values).eq("id", order.id);
    if (!error) {
      supabase.from("order_status_events").insert({
        order_id: order.id, order_number: order.order_id,
        status_key: Object.values(values)[0] || eventLabel,
        status_label: eventLabel, visible_to_customer: false,
        internal_note: `Admin: ${eventLabel}`,
      }).then(() => {});
      await loadData();
    } else setMessage(error.message);
  }

  async function approvePhotos(order: OrderRow) {
    const { error } = await supabase
      .from("order_photos")
      .update({ approved_for_print: true, photo_status: "approved_for_print" })
      .eq("order_id", order.id);
    if (error) { setMessage(error.message); return; }
    await updateOrder(order, {
      production_status: "photos_approved",
      customer_visible_status: "photos_received",
      public_status: "photos_received",
    }, "Photos approved for print");
  }

  async function bulkMarkReady() {
    if (selectedIds.size === 0) return;
    const targets = orders.filter((o) => selectedIds.has(o.id));
    for (const order of targets) {
      await supabase.from("orders").update({
        production_status: "ready_for_batch",
        customer_visible_status: "photos_received",
        public_status: "photos_received",
      }).eq("id", order.id);
    }
    setSelectedIds(new Set());
    await loadData();
  }

  useEffect(() => { loadData(); }, []);

  const photosByOrder = useMemo(() =>
    photos.reduce<Record<string, PhotoRow[]>>((acc, p) => {
      (acc[p.order_number] ||= []).push(p);
      return acc;
    }, {}),
  [photos]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (q && ![o.order_id, o.customer_name, o.email, o.phone || ""].some((v) => v.toLowerCase().includes(q))) return false;
      if (filterStatus && o.production_status !== filterStatus) return false;
      if (filterPriority) {
        const p = (o.priority || "standard").toLowerCase();
        if (filterPriority === "event" && !["event","event_deadline"].includes(p)) return false;
        if (filterPriority !== "event" && p !== filterPriority) return false;
      }
      return true;
    });
  }, [orders, search, filterStatus, filterPriority]);

  const readyCount = orders.filter((o) => o.production_status === "ready_for_batch").length;

  return (
    <>
      <div className="admin-header-row no-print">
        <div>
          <h1>Internal Orders</h1>
          <p>
            Showing {filtered.length} of {orders.length} orders.
            {readyCount > 0 && (
              <b style={{ color: "#44aa44", marginLeft: 8 }}>{readyCount} ready for batch</b>
            )}
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {selectedIds.size > 0 && (
            <button className="button primary" onClick={bulkMarkReady}>
              Mark {selectedIds.size} Ready for Batch
            </button>
          )}
          <Link className="button secondary" href="/admin/batches/new">New Batch</Link>
        </div>
      </div>

      {message && <div className="status yellow">{message}</div>}

      {/* Filters */}
      <div className="card no-print" style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", padding: "0.75rem" }}>
        <input
          className="input"
          placeholder="Search order, customer, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: "1 1 220px" }}
        />
        <select className="input" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ flex: "1 1 160px" }}>
          {FILTER_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <select className="input" value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} style={{ flex: "1 1 130px" }}>
          {FILTER_PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
        <button className="button secondary" onClick={() => { setSearch(""); setFilterStatus(""); setFilterPriority(""); }}>
          Clear
        </button>
      </div>

      {loading ? (
        <div className="card">Loading orders...</div>
      ) : (
        <div className="card" style={{ overflowX: "auto", padding: 0 }}>
          <table className="table" style={{ minWidth: "900px" }}>
            <thead>
              <tr>
                <th style={{ width: 32 }}>
                  <input
                    type="checkbox"
                    checked={selectedIds.size === filtered.length && filtered.length > 0}
                    onChange={(e) => setSelectedIds(e.target.checked ? new Set(filtered.map((o) => o.id)) : new Set())}
                  />
                </th>
                <th>Order</th>
                <th>Customer</th>
                <th>Format</th>
                <th>Photos</th>
                <th>Priority</th>
                <th>Production Status</th>
                <th>Carrier</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={9} style={{ textAlign: "center", color: "#888", padding: "2rem" }}>No orders found.</td></tr>
              )}
              {filtered.map((order) => {
                const count   = photoCountFor(order.order_id, photosByOrder);
                const fmt     = formatById(resolveFormatId(order.product_type));
                const intl    = isInternational(order);
                const carrier = carrierOf(order);
                const pLabel  = PRIORITY_LABELS[order.priority || "standard"] || order.priority || "Standard";
                return (
                  <tr key={order.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(order.id)}
                        onChange={(e) => {
                          const next = new Set(selectedIds);
                          if (e.target.checked) next.add(order.id); else next.delete(order.id);
                          setSelectedIds(next);
                        }}
                      />
                    </td>
                    <td>
                      <Link href={`/admin/orders/${order.order_id}`} style={{ fontWeight: 700 }}>
                        {order.order_id}
                      </Link>
                    </td>
                    <td>
                      <div>{order.customer_name}</div>
                      <div style={{ fontSize: "0.78rem", color: "#aaa" }}>{order.email}</div>
                      {intl && <div style={{ fontSize: "0.75rem", color: "#f59e0b" }}>International</div>}
                    </td>
                    <td style={{ fontSize: "0.85rem" }}>{fmt.label}</td>
                    <td style={{ textAlign: "center" }}>{count}</td>
                    <td style={{ fontSize: "0.85rem" }}>{pLabel}</td>
                    <td>
                      <span className={statusBadgeClass(order.production_status)} style={{ fontSize: "0.75rem" }}>
                        {statusLabel(order.production_status)}
                      </span>
                    </td>
                    <td style={{ fontSize: "0.8rem", color: "#aaa" }}>{carrier}</td>
                    <td>
                      <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap" }}>
                        <Link className="button secondary" style={{ fontSize: "0.75rem", padding: "0.2rem 0.5rem" }}
                          href={`/admin/orders/${order.order_id}`}>View</Link>
                        {order.production_status === "photos_uploaded" && (
                          <button className="button primary" style={{ fontSize: "0.75rem", padding: "0.2rem 0.5rem" }}
                            onClick={() => approvePhotos(order)}>Approve Photos</button>
                        )}
                        {order.production_status === "photos_approved" && (
                          <button className="button primary" style={{ fontSize: "0.75rem", padding: "0.2rem 0.5rem" }}
                            onClick={() => updateOrder(order, { production_status: "ready_for_batch", public_status: "photos_received", customer_visible_status: "photos_received" }, "Marked ready for batch")}>
                            Ready
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
