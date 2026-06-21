"use client";

import { useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Row = { id: string; item: string; unitCost: string; unitsUsed: string; note: string };

let rowSeq = 0;
function newRow(item = "", unitCost = "", unitsUsed = "1", note = ""): Row {
  rowSeq += 1;
  return { id: `row-${rowSeq}`, item, unitCost, unitsUsed, note };
}

function rowTotal(row: Row): number {
  const cost = Number(row.unitCost) || 0;
  const used = Number(row.unitsUsed) || 0;
  return cost * used;
}

function MaterialsTable({
  title,
  rows,
  setRows,
}: {
  title: string;
  rows: Row[];
  setRows: (rows: Row[]) => void;
}) {
  function updateRow(id: string, patch: Partial<Row>) {
    setRows(rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  }
  function removeRow(id: string) {
    setRows(rows.filter((row) => row.id !== id));
  }
  const total = rows.reduce((sum, row) => sum + rowTotal(row), 0);

  return (
    <div className="card">
      <h2>{title}</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Unit Cost ($)</th>
            <th>Units Used</th>
            <th>Total</th>
            <th>Note</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td><input value={row.item} onChange={(e) => updateRow(row.id, { item: e.target.value })} /></td>
              <td><input type="number" step="0.01" value={row.unitCost} onChange={(e) => updateRow(row.id, { unitCost: e.target.value })} /></td>
              <td><input type="number" step="0.01" value={row.unitsUsed} onChange={(e) => updateRow(row.id, { unitsUsed: e.target.value })} /></td>
              <td><b>${rowTotal(row).toFixed(2)}</b></td>
              <td><input value={row.note} onChange={(e) => updateRow(row.id, { note: e.target.value })} /></td>
              <td><button className="secondary" onClick={() => removeRow(row.id)}>✕</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="actions" style={{ marginTop: 8 }}>
        <button className="secondary" onClick={() => setRows([...rows, newRow()])}>+ Add Item</button>
      </div>
      <p style={{ marginTop: 8 }}><b>Total {title}: ${total.toFixed(2)}</b></p>
    </div>
  );
}

export default function PricingCalculator() {
  const [directRows, setDirectRows] = useState<Row[]>([
    newRow("Consumables (Shell, Mylar, Backing, Magnet)", "0.50", "1"),
    newRow("Packaging", "0.10", "1"),
    newRow("Shipping Materials", "0.40", "1"),
    newRow("Photo Paper", "0.60", "1"),
  ]);
  const [indirectRows, setIndirectRows] = useState<Row[]>([
    newRow("Ink", "0.80", "1"),
    newRow("Labor", "1.00", "1"),
    newRow("Electricity", "0.50", "1"),
  ]);
  const [marginPct, setMarginPct] = useState("44");
  const [orderNumber, setOrderNumber] = useState("");
  const [applyMessage, setApplyMessage] = useState("");
  const [applying, setApplying] = useState(false);

  const directTotal = useMemo(() => directRows.reduce((sum, row) => sum + rowTotal(row), 0), [directRows]);
  const indirectTotal = useMemo(() => indirectRows.reduce((sum, row) => sum + rowTotal(row), 0), [indirectRows]);
  const totalCost = directTotal + indirectTotal;
  const margin = Math.min(Math.max(Number(marginPct) || 0, 0), 99);
  const sellingPrice = margin < 100 ? totalCost / (1 - margin / 100) : totalCost;
  const profitPerPiece = sellingPrice - totalCost;

  async function applyToOrder() {
    if (!orderNumber.trim()) { setApplyMessage("Enter an order number first."); return; }
    setApplying(true);
    const { data: order, error: findError } = await supabase
      .from("orders")
      .select("id, photo_count")
      .eq("order_id", orderNumber.trim())
      .single();

    if (findError || !order) {
      setApplyMessage(`Order "${orderNumber}" not found.`);
      setApplying(false);
      return;
    }

    const qty = order.photo_count || 1;
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        unit_cost: totalCost,
        unit_price: sellingPrice,
        total_cost: totalCost * qty,
        total_price: sellingPrice * qty,
      })
      .eq("id", order.id);

    setApplyMessage(updateError ? updateError.message : `Saved to order ${orderNumber}: $${sellingPrice.toFixed(2)}/piece.`);
    setApplying(false);
  }

  return (
    <>
      <div className="admin-header-row no-print">
        <div>
          <h1>Pricing Calculator</h1>
          <p>Find the recommended selling price from your real material and labor costs.</p>
        </div>
      </div>

      <MaterialsTable title="Direct Materials" rows={directRows} setRows={setDirectRows} />
      <MaterialsTable title="Indirect Materials (labor, ink, electricity)" rows={indirectRows} setRows={setIndirectRows} />

      <div className="card">
        <h2>Result</h2>
        <div className="stat-grid">
          <div className="stat-card"><b>${directTotal.toFixed(2)}</b><span>direct cost</span></div>
          <div className="stat-card"><b>${indirectTotal.toFixed(2)}</b><span>indirect cost</span></div>
          <div className="stat-card"><b>${totalCost.toFixed(2)}</b><span>total cost / piece</span></div>
          <div className="stat-card" style={{ background: "var(--green-bg)", color: "var(--green-text)", borderColor: "#86efac" }}>
            <b>${sellingPrice.toFixed(2)}</b><span>recommended price</span>
          </div>
        </div>

        <label style={{ marginTop: 12 }}>Profit Margin (%)</label>
        <input type="number" step="1" value={marginPct} onChange={(e) => setMarginPct(e.target.value)} style={{ maxWidth: 120 }} />
        <p className="small" style={{ marginTop: 8 }}>
          Selling Price = Total Cost ÷ (1 − Margin%). At {margin}% margin, profit per piece is ${profitPerPiece.toFixed(2)}.
        </p>
      </div>

      <div className="card">
        <h2>Apply to an Order</h2>
        <p className="small">Save this cost and price directly to an order — updates Unit Cost, Unit Price, Total Cost, and Total Price there.</p>
        <div className="actions">
          <input placeholder="Order number" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} style={{ maxWidth: 220 }} />
          <button disabled={applying} onClick={applyToOrder}>Save to Order</button>
        </div>
        {applyMessage && <p className="small" style={{ marginTop: 8 }}>{applyMessage}</p>}
      </div>
    </>
  );
}
