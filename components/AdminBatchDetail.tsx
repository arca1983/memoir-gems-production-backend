"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  ProductionBatch,
  ProductionBatchItem,
  groupByOrder,
  groupBySheet,
  highMixWarning,
  partialSheetWarning,
  statusBadgeClass,
  statusLabel,
} from "@/lib/productionBackend";

export default function AdminBatchDetail({ batchId }: { batchId: string }) {
  const [batch, setBatch] = useState<ProductionBatch | null>(null);
  const [items, setItems] = useState<ProductionBatchItem[]>([]);
  const [message, setMessage] = useState("");

  async function loadData() {
    const { data: batchData, error: batchError } = await supabase
      .from("production_batches")
      .select("*")
      .eq("id", batchId)
      .single();

    const { data: itemData, error: itemError } = await supabase
      .from("production_batch_items")
      .select("*")
      .eq("batch_id", batchId)
      .order("sheet_number", { ascending: true })
      .order("slot_number", { ascending: true });

    if (batchError || itemError) {
      setMessage(batchError?.message || itemError?.message || "Could not load batch.");
      return;
    }

    setBatch(batchData as ProductionBatch);
    setItems((itemData || []) as ProductionBatchItem[]);
    setMessage("");
  }

  async function updateBatchStatus(status: string) {
    if (!batch) return;
    const { error } = await supabase
      .from("production_batches")
      .update({ batch_status: status, updated_at: new Date().toISOString() })
      .eq("id", batch.id);

    if (error) { setMessage(error.message); return; }

    const orderIds = Array.from(new Set(items.map((item) => item.order_id)));
    const orderStatus =
      status === "printing" ? "printing" :
      status === "printed"  ? "printed"  :
      status === "assembly" ? "assembly" :
      status === "packing"  ? "packing"  : "batched";

    if (orderIds.length) {
      await supabase.from("orders").update({ production_status: orderStatus }).in("id", orderIds);
    }
    await loadData();
  }

  useEffect(() => { loadData(); }, [batchId]);

  const sheets         = useMemo(() => groupBySheet(items), [items]);
  const orders         = useMemo(() => groupByOrder(items), [items]);
  const highMixSheets  = highMixWarning(items);
  const partialSheets  = partialSheetWarning(items);

  if (!batch) {
    return <div className="card">{message || "Loading batch..."}</div>;
  }

  return (
    <>
      <div className="admin-header-row no-print">
        <div>
          <h1>{batch.batch_number}</h1>
          <p>Batch detail, sheet breakdown, and production print map.</p>
        </div>
        <Link className="button secondary" href="/admin/batches">Back to Batches</Link>
      </div>

      {message && <div className="status yellow">{message}</div>}

      {/* ── Summary ── */}
      <div className="card no-print">
        <h2>Batch Summary</h2>
        <div className="stat-grid">
          <div className="stat-card"><b>{Object.keys(orders).length}</b><span>orders</span></div>
          <div className="stat-card"><b>{items.length}</b><span>photos</span></div>
          <div className="stat-card"><b>{Object.keys(sheets).length}</b><span>sheets</span></div>
          <div className="stat-card"><b>{batch.photo_paper_needed}</b><span>photo paper needed</span></div>
        </div>
        <p><b>Status:</b> <span className={statusBadgeClass(batch.batch_status)}>{statusLabel(batch.batch_status)}</span></p>
        {highMixSheets.length > 0 && (
          <div className="status yellow">High mix: sheets {highMixSheets.join(", ")} have 6+ orders.</div>
        )}
        {partialSheets.length > 0 && (
          <div className="status yellow">Partial sheet: sheets {partialSheets.join(", ")} are not full.</div>
        )}
      </div>

      {/* ── Print + Status ── */}
      <div className="card no-print">
        <h2>Production Actions</h2>
        <div className="actions">
          <Link
            className="button"
            href={`/admin/template-production?batchId=${batch.id}`}
            target="_blank"
            rel="noopener"
          >
            Open Production Print Map ↗
          </Link>
        </div>
        <p className="small" style={{ marginTop: 8 }}>
          Opens the full-page print map in a new tab. Each order has a label card with barcode,
          customer name, shipping address, and carrier. Print directly from that page.
        </p>
        <div className="actions" style={{ marginTop: 16 }}>
          <button className="secondary" onClick={() => updateBatchStatus("printing")}>Mark Printing</button>
          <button className="secondary" onClick={() => updateBatchStatus("printed")}>Mark Printed</button>
          <button className="secondary" onClick={() => updateBatchStatus("assembly")}>Mark Assembly</button>
          <button className="secondary" onClick={() => updateBatchStatus("packing")}>Mark Packing</button>
        </div>
      </div>

      {/* ── Orders included ── */}
      <div className="card no-print">
        <h2>Orders Included</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Code</th><th>Symbol</th><th>Order</th>
              <th>Customer</th><th>Photos</th><th>Sheets / Slots</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(orders).map(([orderNumber, orderItems]) => (
              <tr key={orderNumber}>
                <td><b style={{ color: orderItems[0].group_color }}>{orderItems[0].order_code}</b></td>
                <td>{orderItems[0].symbol}</td>
                <td>
                  <Link className="button secondary" href={`/admin/orders/${encodeURIComponent(orderNumber)}`}>
                    {orderNumber}
                  </Link>
                </td>
                <td>{orderItems[0].customer_name}</td>
                <td>{orderItems.length}</td>
                <td>{orderItems.map((item) => `S${item.sheet_number}:${item.slot_number}`).join(", ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Sheet / slot grid ── */}
      <div className="card no-print">
        <h2>Sheets / Slots</h2>
        {Object.entries(sheets).map(([sheetNumber, sheetItems]) => (
          <div className="batch-sheet-card" key={sheetNumber}>
            <h3>Sheet {sheetNumber}</h3>
            <div className="batch-slot-grid">
              {Array.from({ length: 12 }).map((_, index) => {
                const slot = index + 1;
                const item = sheetItems.find((x) => x.slot_number === slot);
                return (
                  <div
                    className="batch-slot-card"
                    key={slot}
                    style={{ borderColor: item?.group_color || "#D6C2A1" }}
                  >
                    <b>Slot {slot}</b>
                    {item ? (
                      <>
                        <img src={item.photo_url} alt={item.photo_name || "Batch photo"} />
                        <span>{item.symbol} {item.order_code}</span>
                        <small>{item.order_number}</small>
                      </>
                    ) : (
                      <span className="small">empty</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
