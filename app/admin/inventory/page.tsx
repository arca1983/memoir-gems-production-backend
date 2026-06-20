"use client";

import { useEffect, useState } from "react";
import NavBar from "@/components/NavBar";
import { supabase } from "@/lib/supabaseClient";
import { ProductionBatch, computeInventorySummary, BatchInventorySummary } from "@/lib/productionBackend";
import { ALL_FORMATS, formatById } from "@/lib/formats";

const SHEETS_PER_REAM = 500;

type MaterialRow = {
  id: string;
  material_key: string;
  material_label: string;
  category: "paper" | "component" | "ink";
  unit: string;
  quantity_on_hand: number;
  reorder_threshold: number | null;
};

/**
 * Number input that only saves on blur / Enter, not on every keystroke.
 * Typing into a field that re-renders and round-trips to Supabase on each
 * digit feels janky — this keeps a local draft and commits once you're done.
 */
function QuantityInput({
  value,
  onCommit,
  width = 90,
}: {
  value: number;
  onCommit: (next: number) => void;
  width?: number;
}) {
  const [draft, setDraft] = useState(String(value));

  useEffect(() => { setDraft(String(value)); }, [value]);

  function commit() {
    const parsed = Number(draft);
    onCommit(Number.isFinite(parsed) && parsed >= 0 ? parsed : value);
  }

  return (
    <input
      type="number"
      value={draft}
      min={0}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
      style={{
        width,
        padding: "0.35rem 0.5rem",
        fontSize: "0.95rem",
        borderRadius: 4,
        border: "1px solid #444",
        background: "#1a1a1a",
        color: "white",
      }}
    />
  );
}

function statusFor(remaining: number, threshold: number): { badge: string; label: string } {
  if (remaining <= 0) return { badge: "badge red", label: "Out of Stock" };
  if (remaining < threshold) return { badge: "badge red", label: "Low Stock" };
  return { badge: "badge green", label: "In Stock" };
}

export default function InventoryPage() {
  const [batches, setBatches] = useState<ProductionBatch[]>([]);
  const [summary, setSummary] = useState<BatchInventorySummary[]>([]);
  const [materials, setMaterials] = useState<MaterialRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadData() {
    setLoading(true);

    const { data: batchData } = await supabase
      .from("production_batches")
      .select("id, batch_number, batch_status, format_id, total_orders, total_photos, total_sheets, photo_paper_needed, created_at, updated_at, held_photos, notes")
      .order("created_at", { ascending: false })
      .limit(200);

    const loaded = (batchData || []) as ProductionBatch[];
    setBatches(loaded);
    setSummary(computeInventorySummary(loaded));

    const { data: materialData, error: materialError } = await supabase
      .from("material_inventory")
      .select("*")
      .order("category", { ascending: true })
      .order("material_label", { ascending: true });

    if (materialError) {
      setMessage(`${materialError.message}. Run sql/material_inventory.sql in the Supabase SQL Editor, then refresh.`);
    } else {
      setMaterials((materialData || []) as MaterialRow[]);
      setMessage("");
    }

    setLoading(false);
  }

  useEffect(() => { loadData(); }, []);

  async function updateQuantity(row: MaterialRow, quantity: number) {
    setMaterials((rows) => rows.map((r) => (r.id === row.id ? { ...r, quantity_on_hand: quantity } : r)));
    const { error } = await supabase
      .from("material_inventory")
      .update({ quantity_on_hand: quantity, updated_at: new Date().toISOString() })
      .eq("id", row.id);
    if (error) setMessage(error.message);
  }

  // Sheets consumed from completed/active batches, by format
  const sheetsUsedByFormat = batches.reduce<Record<string, number>>((acc, b) => {
    const fid = b.format_id || "2x2";
    acc[fid] = (acc[fid] || 0) + (b.photo_paper_needed || b.total_sheets || 0);
    return acc;
  }, {});

  const totalSheetsUsed = Object.values(sheetsUsedByFormat).reduce((sum, n) => sum + n, 0);

  const paperRows = materials.filter((m) => m.category === "paper");
  const componentRows = materials.filter((m) => m.category === "component");
  const inkRows = materials.filter((m) => m.category === "ink");

  return (
    <main className="container">
      <section className="hero">
        <h1>Inventory & Material Stock</h1>
        <p>Real on-hand quantities for paper, shells, mylar, and magnet backing — persisted in Supabase, not just in-memory.</p>
      </section>

      <NavBar />

      {message && <div className="status yellow">{message}</div>}

      {/* Paper Stock — ONE shared pool. Every format prints on the same
          8.5x11 photo paper; only the die-cut template differs. */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h2 style={{ margin: 0 }}>Paper Stock</h2>
          <button className="secondary" onClick={loadData}>↻ Refresh</button>
        </div>
        <p className="small" style={{ color: "#888", marginBottom: "1rem" }}>
          All formats print on the same 8.5x11 photo paper — one shared pool, not one per format.
          1 ream = {SHEETS_PER_REAM} sheets. Turns red once fewer than 10 reams remain.
        </p>

        {loading && <p className="small" style={{ color: "#888" }}>Loading…</p>}

        {(() => {
          const paperRow = paperRows.find((m) => m.material_key === "paper_8.5x11");
          const reamsOnHand = paperRow?.quantity_on_hand ?? 0;
          const sheetsOnHand = reamsOnHand * SHEETS_PER_REAM;
          const sheetsRemaining = Math.max(0, sheetsOnHand - totalSheetsUsed);
          const reamsRemaining = sheetsRemaining / SHEETS_PER_REAM;
          const threshold = paperRow?.reorder_threshold ?? 10;
          const { badge, label } = statusFor(reamsRemaining, threshold);

          return (
            <>
              <table className="table">
                <thead>
                  <tr>
                    <th>Reams on Hand</th>
                    <th>Sheets on Hand</th>
                    <th>Sheets Printed (all formats)</th>
                    <th>Sheets Remaining</th>
                    <th>Reams Remaining</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      {paperRow ? (
                        <QuantityInput value={reamsOnHand} onCommit={(next) => updateQuantity(paperRow, next)} />
                      ) : (
                        <span className="small" style={{ color: "#888" }}>not in DB</span>
                      )}
                    </td>
                    <td className="small" style={{ color: "#aaa" }}>{sheetsOnHand.toLocaleString()}</td>
                    <td className="small" style={{ color: "#aaa" }}>{totalSheetsUsed.toLocaleString()}</td>
                    <td>{sheetsRemaining.toLocaleString()}</td>
                    <td>
                      <b style={{ color: reamsRemaining < threshold ? "#cc4444" : "#88cc88" }}>
                        {reamsRemaining.toFixed(1)}
                      </b>
                    </td>
                    <td><span className={badge}>{label}</span></td>
                  </tr>
                </tbody>
              </table>

              <h3 style={{ marginTop: "1.5rem", fontSize: "1rem" }}>Sheets Printed by Format</h3>
              <table className="table">
                <thead>
                  <tr>
                    <th>Format</th>
                    <th>Size</th>
                    <th>Sheets Printed</th>
                  </tr>
                </thead>
                <tbody>
                  {ALL_FORMATS.map((fmt) => (
                    <tr key={fmt.id} style={{ opacity: fmt.isActive ? 1 : 0.5 }}>
                      <td><b>{fmt.label}</b></td>
                      <td>{fmt.widthIn}″ × {fmt.heightIn}″</td>
                      <td>{(sheetsUsedByFormat[fmt.id] ?? 0).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          );
        })()}

        <p className="small" style={{ marginTop: "1rem", color: "#888" }}>
          * Enter the number of reams you have on the shelf — sheets, usage, and remaining reams are calculated automatically. Saves on blur/Enter, not on every keystroke.
        </p>
      </div>

      {/* Shared Components: shell, mylar, magnet backing */}
      <div className="card">
        <h2>Components (Shell / Mylar / Magnets)</h2>
        <p className="small" style={{ color: "#888", marginBottom: "1rem" }}>
          Shared across all formats — not tied to a single magnet size. Turns red once fewer than 300 units remain.
        </p>
        <table className="table">
          <thead>
            <tr>
              <th>Material</th>
              <th>Unit</th>
              <th>On Hand</th>
              <th>Reorder Threshold</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {componentRows.map((row) => {
              const onHand = row.quantity_on_hand;
              const threshold = row.reorder_threshold ?? 300;
              const { badge, label } = statusFor(onHand, threshold);
              return (
                <tr key={row.id}>
                  <td><b>{row.material_label}</b></td>
                  <td>{row.unit}</td>
                  <td>
                    <QuantityInput value={onHand} onCommit={(next) => updateQuantity(row, next)} />
                  </td>
                  <td>{threshold}</td>
                  <td><span className={badge}>{label}</span></td>
                </tr>
              );
            })}
            {componentRows.length === 0 && !loading && (
              <tr><td colSpan={5}>No component rows yet — run sql/material_inventory.sql in Supabase.</td></tr>
            )}
          </tbody>
        </table>
        <p className="small" style={{ marginTop: "1rem", color: "#888" }}>
          * These track total units on hand only. Per-magnet consumption isn&apos;t auto-deducted yet — update counts manually as stock moves.
        </p>
      </div>

      {/* Ink Cartridges */}
      <div className="card">
        <h2>Ink Cartridges</h2>
        <p className="small" style={{ color: "#888", marginBottom: "1rem" }}>
          How many cartridges you have on the shelf — whole numbers (1, 2, 3…), not volume. Turns red once you're down to your last spare.
        </p>
        <table className="table">
          <thead>
            <tr>
              <th>Ink</th>
              <th>Unit</th>
              <th>On Hand</th>
              <th>Reorder Threshold</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {inkRows.map((row) => {
              const onHand = row.quantity_on_hand;
              const threshold = row.reorder_threshold ?? 2;
              const { badge, label } = statusFor(onHand, threshold);
              return (
                <tr key={row.id}>
                  <td><b>{row.material_label}</b></td>
                  <td>{row.unit}</td>
                  <td>
                    <QuantityInput value={onHand} onCommit={(next) => updateQuantity(row, next)} />
                  </td>
                  <td>{threshold}</td>
                  <td><span className={badge}>{label}</span></td>
                </tr>
              );
            })}
            {inkRows.length === 0 && !loading && (
              <tr><td colSpan={5}>No ink rows yet — run sql/material_inventory.sql in Supabase.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Usage Summary by Format */}
      {summary.length > 0 && (
        <div className="card">
          <h2>Batch History by Format</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Format</th>
                <th>Total Batches</th>
                <th>Total Photos Printed</th>
                <th>Total Sheets Used</th>
                <th>Avg Photos / Batch</th>
                <th>Last Batch</th>
              </tr>
            </thead>
            <tbody>
              {summary.map((s) => (
                <tr key={s.format_id}>
                  <td><b>{formatById(s.format_id).label}</b></td>
                  <td>{s.total_batches}</td>
                  <td>{s.total_photos}</td>
                  <td>{s.total_sheets}</td>
                  <td>{s.average_photos_per_batch}</td>
                  <td>{s.last_batch_date ? new Date(s.last_batch_date).toLocaleDateString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="small" style={{ marginTop: "0.5rem", color: "#888" }}>
            Total sheets printed across all formats so far: <b>{totalSheetsUsed.toLocaleString()}</b>
          </p>
        </div>
      )}

      {/* Recent Batches */}
      <div className="card">
        <h2>Recent Batches</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Batch</th>
              <th>Format</th>
              <th>Orders</th>
              <th>Photos</th>
              <th>Sheets Used</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {batches.slice(0, 20).map((b) => {
              const fmt = formatById(b.format_id);
              return (
                <tr key={b.id}>
                  <td><b>{b.batch_number}</b></td>
                  <td>
                    <span className="badge yellow">{fmt.widthIn}×{fmt.heightIn}</span>
                  </td>
                  <td>{b.total_orders}</td>
                  <td>{b.total_photos}</td>
                  <td>{b.photo_paper_needed || b.total_sheets}</td>
                  <td><span className="badge yellow">{b.batch_status}</span></td>
                  <td>{new Date(b.created_at).toLocaleDateString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!loading && batches.length === 0 && <p>No batches yet.</p>}
      </div>
    </main>
  );
}
