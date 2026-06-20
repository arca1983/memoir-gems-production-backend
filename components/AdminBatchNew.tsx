"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
  OrderRow,
  PhotoRow,
  assignBatchItems,
  createBatchNumber,
  groupByOrder,
  isApprovedForPrint,
  SHEET_CAPACITY,
} from "@/lib/productionBackend";

export default function AdminBatchNew() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [photos, setPhotos] = useState<PhotoRow[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function loadData() {
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("production_status", "ready_for_batch")
      .order("created_at", { ascending: true });

    const { data: photoData, error: photoError } = await supabase
      .from("order_photos")
      .select("*")
      .order("created_at", { ascending: true });

    if (orderError || photoError) {
      setMessage(orderError?.message || photoError?.message || "Could not load ready orders.");
      return;
    }

    setOrders((orderData || []) as OrderRow[]);
    setPhotos((photoData || []) as PhotoRow[]);
    setMessage("");
  }

  useEffect(() => { loadData(); }, []);

  const photosByOrder = useMemo(() => {
    return photos.reduce<Record<string, PhotoRow[]>>((acc, photo) => {
      acc[photo.order_number] ||= [];
      acc[photo.order_number].push(photo);
      return acc;
    }, {});
  }, [photos]);

  const candidateItems = useMemo(() => assignBatchItems(orders, photosByOrder), [orders, photosByOrder]);
  const groupedCandidates = groupByOrder(candidateItems);
  const totalSheets = Math.ceil(candidateItems.length / SHEET_CAPACITY);
  const partialCount = candidateItems.length % SHEET_CAPACITY;

  async function createBatch() {
    if (candidateItems.length === 0) {
      setMessage("No approved ready-for-batch photos are available.");
      return;
    }

    setBusy(true);
    setMessage("");
    const batchNumber = createBatchNumber();

    const { data: batch, error: batchError } = await supabase
      .from("production_batches")
      .insert({
        batch_number: batchNumber,
        batch_status: "created",
        total_orders: Object.keys(groupedCandidates).length,
        total_photos: candidateItems.length,
        total_sheets: totalSheets,
        photo_paper_needed: totalSheets,
        held_photos: 0,
        notes: partialCount ? `Partial final sheet: ${partialCount}/12 slots filled.` : null,
      })
      .select()
      .single();

    if (batchError) {
      setMessage(`${batchError.message}. Create production_batches from the SQL migration if this table is missing.`);
      setBusy(false);
      return;
    }

    const batchId = batch.id as string;
    const itemRows = candidateItems.map((item) => ({ ...item, batch_id: batchId }));
    const { error: itemError } = await supabase.from("production_batch_items").insert(itemRows);

    if (itemError) {
      setMessage(`${itemError.message}. Create production_batch_items from the SQL migration if this table is missing.`);
      setBusy(false);
      return;
    }

    await supabase
      .from("orders")
      .update({ production_status: "batched", public_status: "in_production", customer_visible_status: "in_production" })
      .in("id", orders.map((order) => order.id));

    await supabase
      .from("order_photos")
      .update({ batch_id: batchId, photo_status: "batched" })
      .in("id", candidateItems.map((item) => item.photo_id));

    router.push(`/admin/batches/${batchId}`);
  }

  return (
    <>
      <div className="admin-header-row no-print">
        <div>
          <h1>Create Production Batch</h1>
          <p>Only `ready_for_batch` orders and approved photos are eligible.</p>
        </div>
        <Link className="button secondary" href="/admin/batches">Back to Batches</Link>
      </div>

      {message && <div className="status yellow">{message}</div>}

      <div className="card">
        <h2>Ready Queue</h2>
        <div className="stat-grid">
          <div className="stat-card"><b>{orders.length}</b><span>ready orders</span></div>
          <div className="stat-card"><b>{candidateItems.length}</b><span>approved photos</span></div>
          <div className="stat-card"><b>{totalSheets}</b><span>sheets</span></div>
          <div className="stat-card"><b>{partialCount || 12}</b><span>final sheet slots used</span></div>
        </div>
        {partialCount > 0 && <div className="status yellow">Partial sheet warning: final sheet has {partialCount}/12 slots filled.</div>}
        <button disabled={busy || candidateItems.length === 0} onClick={createBatch}>Create New Batch</button>
      </div>

      <div className="card">
        <h2>Included Orders</h2>
        <table className="table">
          <thead><tr><th>Order</th><th>Customer</th><th>Priority</th><th>Approved Photos</th><th>Reason</th></tr></thead>
          <tbody>
            {orders.map((order) => {
              const approved = (photosByOrder[order.order_id] || []).filter((photo) => isApprovedForPrint(photo) && !photo.batch_id);
              return (
                <tr key={order.id}>
                  <td><b>{order.order_id}</b></td>
                  <td>{order.customer_name}</td>
                  <td>{order.priority || "standard"}</td>
                  <td>{approved.length}</td>
                  <td>{approved.length ? "ready" : "no unbatched approved photos"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

