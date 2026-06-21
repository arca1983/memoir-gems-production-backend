"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  OrderRow,
  PhotoRow,
  PRODUCTION_STATUSES,
  PUBLIC_STATUSES,
  orderProfit,
  postalCodeOf,
  publicStatusOf,
  stateOf,
} from "@/lib/productionBackend";

export default function AdminOrderDetail({ orderNumber }: { orderNumber: string }) {
  const [order, setOrder] = useState<OrderRow | null>(null);
  const [photos, setPhotos] = useState<PhotoRow[]>([]);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [tracking, setTracking] = useState("");
  const [productionNotes, setProductionNotes] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const [totalPrice, setTotalPrice] = useState("");
  const [totalCost, setTotalCost] = useState("");

  async function loadData() {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("order_id", orderNumber)
      .single();

    if (error) {
      setMessage(error.message);
      return;
    }

    const loadedOrder = data as OrderRow;
    setOrder(loadedOrder);
    setTracking(loadedOrder.tracking_number || "");
    setProductionNotes(loadedOrder.production_notes || "");
    setUnitPrice(loadedOrder.unit_price != null ? String(loadedOrder.unit_price) : "");
    setUnitCost(loadedOrder.unit_cost != null ? String(loadedOrder.unit_cost) : "");
    setTotalPrice(loadedOrder.total_price != null ? String(loadedOrder.total_price) : "");
    setTotalCost(loadedOrder.total_cost != null ? String(loadedOrder.total_cost) : "");

    const { data: photoData, error: photoError } = await supabase
      .from("order_photos")
      .select("*")
      .eq("order_id", loadedOrder.id)
      .order("photo_number", { ascending: true });

    if (photoError) setMessage(photoError.message);
    else setPhotos((photoData || []) as PhotoRow[]);
  }

  async function updateOrder(values: Partial<OrderRow>, label: string) {
    if (!order) return;
    setSaving(true);
    const { error } = await supabase.from("orders").update(values).eq("id", order.id);
    if (!error) {
      await supabase.from("order_status_events").insert({
        order_id: order.id,
        order_number: order.order_id,
        status_key: Object.values(values)[0] || label,
        status_label: label,
        visible_to_customer: false,
        internal_note: `Admin detail action: ${label}`,
      });
      await loadData();
      setMessage(`${label} saved.`);
    } else {
      setMessage(error.message);
    }
    setSaving(false);
  }

  async function approveAllPhotos() {
    if (!order) return;
    setSaving(true);
    const { error } = await supabase
      .from("order_photos")
      .update({ approved_for_print: true, photo_status: "approved_for_print" })
      .eq("order_id", order.id);

    if (error) setMessage(`${error.message}. Add approved_for_print column from the SQL migration, then retry.`);
    else await updateOrder({
      production_status: "photos_approved",
      public_status: "photos_received",
      customer_visible_status: "photos_received",
    }, "Photos approved for print");
    setSaving(false);
  }

  useEffect(() => { loadData(); }, [orderNumber]);

  if (!order) {
    return (
      <div className="card">
        {message || "Loading order..."}
      </div>
    );
  }

  return (
    <>
      <div className="admin-header-row no-print">
        <div>
          <h1>{order.order_id}</h1>
          <p>Internal order detail, print approval, public status, and tracking.</p>
        </div>
        <Link className="button secondary" href="/admin/orders">Back to Orders</Link>
      </div>

      {message && <div className="status yellow">{message}</div>}

      <div className="grid">
        <div className="card">
          <h2>Customer</h2>
          <p>
            <b>{order.customer_name}</b><br />
            {order.email}<br />
            {order.phone || "No phone"}
          </p>
          <p className="small">
            {order.address_line1 || order.address}<br />
            {order.address_line2 || null}<br />
            {order.city}, {stateOf(order)} {postalCodeOf(order)}<br />
            {order.country || "United States"}
          </p>
        </div>

        <div className="card">
          <h2>Status</h2>
          <label>Production Status</label>
          <select
            value={order.production_status || "not_started"}
            onChange={(event) => updateOrder({ production_status: event.target.value }, "Production status updated")}
          >
            {PRODUCTION_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>

          <label>Public Customer Status</label>
          <select
            value={publicStatusOf(order)}
            onChange={(event) => updateOrder({ public_status: event.target.value, customer_visible_status: event.target.value }, "Public status updated")}
          >
            {PUBLIC_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>

          <label>Tracking Number</label>
          <input value={tracking} onChange={(event) => setTracking(event.target.value)} />
          <button disabled={saving} onClick={() => updateOrder({
            tracking_number: tracking,
            shipping_status: tracking ? "tracking_added" : "not_ready",
            public_status: tracking ? "shipped" : publicStatusOf(order),
            customer_visible_status: tracking ? "shipped" : publicStatusOf(order),
          }, "Tracking updated")}>Add Tracking Number</button>
        </div>
      </div>

      <div className="card">
        <h2>Pricing</h2>
        <p className="small">Edit Unit Price and Unit Cost — Total Price, Total Cost, and Profit calculate on their own.</p>
        <div className="grid">
          <div>
            <label>Unit Price ($/piece) — gold</label>
            <input
              type="number"
              step="0.01"
              value={unitPrice}
              onChange={(event) => {
                setUnitPrice(event.target.value);
                const qty = order.photo_count || 0;
                if (event.target.value && qty) setTotalPrice((Number(event.target.value) * qty).toFixed(2));
              }}
            />
          </div>
          <div>
            <label>Unit Cost ($/piece) — gold</label>
            <input
              type="number"
              step="0.01"
              value={unitCost}
              onChange={(event) => {
                setUnitCost(event.target.value);
                const qty = order.photo_count || 0;
                if (event.target.value && qty) setTotalCost((Number(event.target.value) * qty).toFixed(2));
              }}
            />
          </div>
          <div>
            <label>Total Price ($) — revenue</label>
            <input type="number" step="0.01" value={totalPrice} onChange={(event) => setTotalPrice(event.target.value)} />
          </div>
          <div>
            <label>Total Cost ($)</label>
            <input type="number" step="0.01" value={totalCost} onChange={(event) => setTotalCost(event.target.value)} />
          </div>
        </div>
        <p className="small" style={{ marginTop: 8 }}>
          {order.photo_count ? `${order.photo_count} pieces. ` : ""}
          Profit: {orderProfit({ ...order, total_price: totalPrice ? Number(totalPrice) : null, total_cost: totalCost ? Number(totalCost) : null }) != null
            ? `$${orderProfit({ ...order, total_price: totalPrice ? Number(totalPrice) : null, total_cost: totalCost ? Number(totalCost) : null })!.toFixed(2)}`
            : "— (enter price and cost)"}
        </p>
        <div className="actions">
          <button
            disabled={saving}
            onClick={() => updateOrder({
              unit_price: unitPrice ? Number(unitPrice) : null,
              unit_cost: unitCost ? Number(unitCost) : null,
              total_price: totalPrice ? Number(totalPrice) : null,
              total_cost: totalCost ? Number(totalCost) : null,
            }, "Pricing updated")}
          >
            Save Pricing
          </button>
          <Link className="button secondary" href="/admin/pricing">Open Pricing Calculator ↗</Link>
        </div>
      </div>

      <div className="card">
        <h2>Production Notes</h2>
        <textarea value={productionNotes} onChange={(event) => setProductionNotes(event.target.value)} />
        <div className="actions">
          <button disabled={saving} onClick={() => updateOrder({ production_notes: productionNotes }, "Production notes updated")}>Save Notes</button>
          <button disabled={saving} onClick={approveAllPhotos}>Approve Photos For Print</button>
          <button disabled={saving} onClick={() => updateOrder({ production_status: "ready_for_batch" }, "Ready for batch")}>Mark Ready For Batch</button>
        </div>
        <p className="small">Customer notes: {order.notes || "None"}</p>
      </div>

      <div className="card">
        <h2>Uploaded Photos</h2>
        <div className="photo-list">
          {photos.map((photo) => (
            <div className="photo-card" key={photo.id}>
              <img src={photo.photo_url} alt={photo.photo_name || "Uploaded photo"} />
              <div className="small">
                <b>{photo.photo_name || `Photo ${photo.photo_number || ""}`}</b><br />
                Status: {photo.photo_status || "uploaded"}<br />
                Approved: {photo.approved_for_print ? "yes" : "no"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
