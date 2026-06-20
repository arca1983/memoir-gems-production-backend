"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import NavBar from "@/components/NavBar";

const SHEET_CAPACITY = 12;

type Order = {
  id: string;
  order_id: string;
  customer_name: string;
  email: string;
  photo_count: number;
  priority?: string;
  traffic_light_status: string;
  production_status: string;
  shipping_status: string;
  created_at: string;
};

type Photo = {
  id: string;
  order_id: string;
  order_number: string;
  photo_url: string;
  photo_name: string | null;
  photo_number: number;
  photo_status: string;
};

type BatchItem = Photo & {
  customer_name: string;
  priority?: string;
  slot_number: number;
  sheet_number: number;
};

function groupSheets(items: BatchItem[]) {
  const sheets: BatchItem[][] = [];
  for (let i = 0; i < items.length; i += SHEET_CAPACITY) {
    sheets.push(items.slice(i, i + SHEET_CAPACITY));
  }
  return sheets;
}

function summarizeSheet(sheet: BatchItem[]) {
  const grouped: Record<string, number[]> = {};
  sheet.forEach((item) => {
    grouped[item.order_number] ||= [];
    grouped[item.order_number].push(item.slot_number);
  });

  return Object.entries(grouped)
    .map(([order, slots]) => `${order}: slots ${slots.join(", ")}`)
    .join(" | ");
}

function shortOrder(orderNumber: string) {
  return orderNumber.replace("MG-TEST-", "T-").replace("MG-", "MG-");
}

function PrintSlot({ item }: { item: BatchItem }) {
  return (
    <div className="production-photo-slot">
      <img src={item.photo_url} alt={item.photo_name || item.order_number} />
      <span className="cut-mark tl-h" />
      <span className="cut-mark tl-v" />
      <span className="cut-mark tr-h" />
      <span className="cut-mark tr-v" />
      <span className="cut-mark bl-h" />
      <span className="cut-mark bl-v" />
      <span className="cut-mark br-h" />
      <span className="cut-mark br-v" />
    </div>
  );
}

function OperatorProofSlot({ item }: { item: BatchItem }) {
  return (
    <div className="operator-proof-slot">
      <img src={item.photo_url} alt={item.photo_name || item.order_number} />
      <div className="operator-proof-label">
        S{item.sheet_number} / Slot {item.slot_number}<br />
        {shortOrder(item.order_number)}<br />
        {item.customer_name}
      </div>
      <div className="operator-proof-watermark">#{item.slot_number}</div>
    </div>
  );
}

export default function ProductionPreview() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [mode, setMode] = useState<"fullOnly" | "includePartial">("fullOnly");
  const [printMode, setPrintMode] = useState<"sheets" | "proof" | "map" | "both">("sheets");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadData() {
    setLoading(true);
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: true });

    const { data: photoData, error: photoError } = await supabase
      .from("order_photos")
      .select("*")
      .order("created_at", { ascending: true });

    if (orderError || photoError) {
      setMessage(orderError?.message || photoError?.message || "Could not load production data.");
    } else {
      const o = (orderData || []) as Order[];
      setOrders(o);
      setPhotos((photoData || []) as Photo[]);
      setSelected(Object.fromEntries(o.map((order) => [order.id, true])));
      setMessage("");
    }

    setLoading(false);
  }

  useEffect(() => { loadData(); }, []);

  const photosByOrder = useMemo(() => {
    return photos.reduce<Record<string, Photo[]>>((acc, photo) => {
      acc[photo.order_number] ||= [];
      acc[photo.order_number].push(photo);
      return acc;
    }, {});
  }, [photos]);

  const selectedOrders = useMemo(() => orders.filter((order) => selected[order.id]), [orders, selected]);

  const allSelectedItems = useMemo(() => {
    const items: BatchItem[] = [];
    selectedOrders.forEach((order) => {
      const orderPhotos = photosByOrder[order.order_id] || [];
      orderPhotos.forEach((photo) => {
        items.push({
          ...photo,
          customer_name: order.customer_name,
          priority: order.priority,
          sheet_number: 0,
          slot_number: 0,
        });
      });
    });

    return items.map((item, index) => ({
      ...item,
      sheet_number: Math.floor(index / SHEET_CAPACITY) + 1,
      slot_number: (index % SHEET_CAPACITY) + 1,
    }));
  }, [selectedOrders, photosByOrder]);

  const printableCount = mode === "fullOnly"
    ? Math.floor(allSelectedItems.length / SHEET_CAPACITY) * SHEET_CAPACITY
    : allSelectedItems.length;

  const printableItems = allSelectedItems.slice(0, printableCount).map((item, index) => ({
    ...item,
    sheet_number: Math.floor(index / SHEET_CAPACITY) + 1,
    slot_number: (index % SHEET_CAPACITY) + 1,
  }));

  const heldItems = allSelectedItems.slice(printableCount);
  const sheets = groupSheets(printableItems);

  const totalOrders = selectedOrders.length;
  const totalPhotos = allSelectedItems.length;
  const fullSheets = Math.floor(totalPhotos / SHEET_CAPACITY);
  const remaining = totalPhotos % SHEET_CAPACITY;

  function handlePrint(target: "sheets" | "proof" | "map" | "both") {
    setPrintMode(target);
    setTimeout(() => window.print(), 120);
  }

  return (
    <main className="container">
      <section className="hero no-print">
        <h1>Memoir Gems Production Preview</h1>
        <p>
          Clean 2x2 production sheets remain label-free. Use the Operator Proof Sheet or Production Map
          to identify orders without marking the final printed photos.
        </p>
      </section>

      <NavBar />

      <div className="card no-print">
        <h2>1. Select orders for this test batch</h2>
        {loading && <p>Loading...</p>}
        {message && <div className="status red">{message}</div>}

        <div className="production-toolbar">
          <button onClick={loadData}>Refresh Orders</button>
          <button className="secondary" onClick={() => setSelected(Object.fromEntries(orders.map((order) => [order.id, true])))}>Select All</button>
          <button className="secondary" onClick={() => setSelected(Object.fromEntries(orders.map((order) => [order.id, false])))}>Clear</button>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Select</th>
              <th>Order</th>
              <th>Customer</th>
              <th>Photos</th>
              <th>Priority</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const count = (photosByOrder[order.order_id] || []).length;
              return (
                <tr key={order.id}>
                  <td>
                    <label className="checkbox-row">
                      <input type="checkbox" checked={!!selected[order.id]} onChange={(e) => setSelected((prev) => ({ ...prev, [order.id]: e.target.checked }))} />
                      include
                    </label>
                  </td>
                  <td><b>{order.order_id}</b></td>
                  <td>{order.customer_name}</td>
                  <td>{count}</td>
                  <td>{order.priority || "standard"}</td>
                  <td><span className={`badge ${order.traffic_light_status || "yellow"}`}>{order.traffic_light_status || "yellow"}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="card no-print">
        <h2>2. Batch summary</h2>
        <div className="grid">
          <div className="status yellow">Selected orders: {totalOrders}</div>
          <div className="status yellow">Total photos: {totalPhotos}</div>
          <div className="status green">Full sheets available: {fullSheets}</div>
          <div className={remaining === 0 ? "status green" : "status yellow"}>
            Remaining / held photos: {mode === "fullOnly" ? heldItems.length : 0}
          </div>
        </div>

        <div className="production-toolbar">
          <button className={mode === "fullOnly" ? "" : "secondary"} onClick={() => setMode("fullOnly")}>Human-Safe: Full Sheets Only</button>
          <button className={mode === "includePartial" ? "" : "secondary"} onClick={() => setMode("includePartial")}>Include Partial Sheet</button>
        </div>

        {mode === "fullOnly" && heldItems.length > 0 && (
          <div className="status yellow">Human-Safe Mode: {heldItems.length} photo(s) will stay in held queue until another order completes a full sheet.</div>
        )}

        {mode === "includePartial" && remaining > 0 && (
          <div className="status red">Warning: partial sheet mode may waste material. Use only for rush orders or manual approval.</div>
        )}

        <div className="print-warning">
          For production: print <b>Production Sheets Only</b>. For identification: print <b>Operator Proof Sheet</b> or <b>Production Map</b>. Never use the proof sheet as the final product.
        </div>

        <div className="print-controls">
          <button onClick={() => handlePrint("sheets")}>Print Production Sheets Only</button>
          <button className="secondary" onClick={() => handlePrint("proof")}>Print Operator Proof Sheet</button>
          <button className="secondary" onClick={() => handlePrint("map")}>Print Production Map Only</button>
          <button className="secondary" onClick={() => handlePrint("both")}>Print Sheets + Map</button>
        </div>
      </div>

      <div className="card no-print">
        <h2>3. Screen proof — identify orders quickly</h2>
        <p className="small">
          This view is only for the operator. It shows order/customer labels on top of the photo.
          The clean production sheet below does not print these labels.
        </p>

        {sheets.slice(0, 1).map((sheet, index) => (
          <div key={`screen-proof-${index}`}>
            <b>Sheet {index + 1} quick proof</b>
            <div className="screen-proof-grid">
              {sheet.map((item) => (
                <div className="screen-proof-card" key={`screen-${item.id}-${item.slot_number}`}>
                  <img src={item.photo_url} alt={item.photo_name || item.order_number} />
                  <div className="proof-info">
                    S{item.sheet_number} / Slot {item.slot_number}<br />
                    {item.order_number}<br />
                    {item.customer_name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="card no-print">
        <h2>4. On-screen production map</h2>
        {sheets.map((sheet, index) => (
          <div className="map-card" key={index}>
            <b>Sheet {index + 1}</b>
            <p className="small">{summarizeSheet(sheet)}</p>
            <table className="table">
              <thead>
                <tr><th>Slot</th><th>Order</th><th>Customer</th><th>Priority</th><th>Photo</th></tr>
              </thead>
              <tbody>
                {sheet.map((item) => (
                  <tr key={`${item.id}-${item.sheet_number}-${item.slot_number}`}>
                    <td>{item.slot_number}</td>
                    <td>{item.order_number}</td>
                    <td>{item.customer_name}</td>
                    <td>{item.priority || "standard"}</td>
                    <td>{item.photo_name || `Photo ${item.photo_number}`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

        {heldItems.length > 0 && (
          <div className="map-card">
            <b>Held Queue / Not Printed Yet</b>
            <table className="table">
              <thead><tr><th>Order</th><th>Customer</th><th>Photo</th></tr></thead>
              <tbody>
                {heldItems.map((item) => (
                  <tr key={item.id}>
                    <td>{item.order_number}</td>
                    <td>{item.customer_name}</td>
                    <td>{item.photo_name || `Photo ${item.photo_number}`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {(printMode === "sheets" || printMode === "both") && (
        <section className="print-only">
          {sheets.map((sheet, index) => (
            <div className="production-sheet-page" key={index}>
              <div className="production-sheet-grid">
                {sheet.map((item) => (
                  <PrintSlot item={item} key={`${item.id}-${item.slot_number}`} />
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      {printMode === "proof" && (
        <section className="print-only">
          {sheets.map((sheet, index) => (
            <div className="operator-proof-page" key={`proof-${index}`}>
              <div className="operator-proof-header">
                <div>
                  <h2>Memoir Gems Operator Proof Sheet</h2>
                  <b>Sheet {index + 1}</b><br />
                  <span>Use for sorting only. Do not use as final product print.</span>
                </div>
                <div>
                  <b>{sheet.length}/12 slots</b><br />
                  <span>{new Date().toLocaleString()}</span>
                </div>
              </div>
              <div className="operator-proof-grid">
                {sheet.map((item) => (
                  <OperatorProofSlot item={item} key={`proof-slot-${item.id}-${item.slot_number}`} />
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      {(printMode === "map" || printMode === "both") && (
        <section className="print-only">
          {sheets.map((sheet, index) => (
            <div className="production-map-page" key={`map-${index}`}>
              <div className="production-map-header">
                <div>
                  <h2>Memoir Gems Production Map</h2>
                  <b>Sheet {index + 1}</b>
                </div>
                <div>
                  <b>{sheet.length}/12 slots</b><br />
                  <span>{new Date().toLocaleString()}</span>
                </div>
              </div>
              <p><b>Summary:</b> {summarizeSheet(sheet)}</p>
              <table className="table">
                <thead>
                  <tr>
                    <th>Sheet</th>
                    <th>Slot</th>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Priority</th>
                    <th>Photo</th>
                  </tr>
                </thead>
                <tbody>
                  {sheet.map((item) => (
                    <tr key={`map-${item.id}-${item.slot_number}`}>
                      <td>{item.sheet_number}</td>
                      <td>{item.slot_number}</td>
                      <td>{item.order_number}</td>
                      <td>{item.customer_name}</td>
                      <td>{item.priority || "standard"}</td>
                      <td>{item.photo_name || `Photo ${item.photo_number}`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

          {heldItems.length > 0 && (
            <div className="production-map-page">
              <div className="production-map-header">
                <div>
                  <h2>Memoir Gems Held Queue</h2>
                  <b>Not printed yet</b>
                </div>
                <div>
                  <b>{heldItems.length} held photo(s)</b><br />
                  <span>{new Date().toLocaleString()}</span>
                </div>
              </div>
              <table className="table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Priority</th>
                    <th>Photo</th>
                  </tr>
                </thead>
                <tbody>
                  {heldItems.map((item) => (
                    <tr key={`held-${item.id}`}>
                      <td>{item.order_number}</td>
                      <td>{item.customer_name}</td>
                      <td>{item.priority || "standard"}</td>
                      <td>{item.photo_name || `Photo ${item.photo_number}`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
