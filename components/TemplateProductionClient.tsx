"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import NavBar from "@/components/NavBar";
import { supabase } from "@/lib/supabaseClient";
import {
  OrderRow,
  ProductionBatch,
  ProductionBatchItem,
  groupBySheet,
} from "@/lib/productionBackend";
import { formatById, ProductFormat } from "@/lib/formats";

const C39: Record<string, string> = {
  "0":"nnnwwnwnn","1":"wnnwnnnnw","2":"nnwwnnnnw","3":"wnwwnnnnn",
  "4":"nnnwwnnnw","5":"wnnwwnnnn","6":"nnwwwnnnn","7":"nnnwnnwnw",
  "8":"wnnwnnwnn","9":"nnwwnnwnn","A":"wnnnnwnnw","B":"nnwnnwnnw",
  "C":"wnwnnwnnn","D":"nnnnwwnnw","E":"wnnnwwnnn","F":"nnwnwwnnn",
  "G":"nnnnnwwnw","H":"wnnnnwwnn","I":"nnwnnwwnn","J":"nnnnwwwnn",
  "K":"wnnnnnnww","L":"nnwnnnnww","M":"wnwnnnnwn","N":"nnnnwnnww",
  "O":"wnnnwnnwn","P":"nnwnwnnwn","Q":"nnnnnnwww","R":"wnnnnnwwn",
  "S":"nnwnnnwwn","T":"nnnnwnwwn","U":"wwnnnnnnw","V":"nwwnnnnnw",
  "W":"wwwnnnnnn","X":"nwnnwnnnw","Y":"wwnnwnnnn","Z":"nwwnwnnnn",
  "-":"nwnnnnwnw",".":"wwnnnnwnn"," ":"nwwnnnwnn","*":"nwnnwnwnn",
};

function Code39Barcode({ value }: { value: string }) {
  const N = 1, W = 3;
  const chars = ["*", ...value.toUpperCase().replace(/[^A-Z0-9\-. ]/g, "").split(""), "*"];
  type Bar = { x: number; w: number };
  const bars: Bar[] = [];
  let x = 0;
  chars.forEach((ch, ci) => {
    const pat = C39[ch] ?? C39[" "];
    pat.split("").forEach((p, i) => {
      const w = p === "w" ? W : N;
      if (i % 2 === 0) bars.push({ x, w });
      x += w;
    });
    if (ci < chars.length - 1) x += N;
  });
  return (
    <svg viewBox={`0 0 ${x} 32`} preserveAspectRatio="none"
      style={{ width: "100%", height: "0.38in", display: "block" }}>
      {bars.map((b, i) => <rect key={i} x={b.x} y={0} width={b.w} height={32} fill="#000" />)}
    </svg>
  );
}

const CARRIER_BG:  Record<string, string> = { usps:"#004B97", ups:"#351C15", fedex:"#FF6200", dhl:"#FFCC00" };
const CARRIER_TXT: Record<string, string> = { usps:"white",   ups:"#F0A500", fedex:"white",   dhl:"#111" };
const CARRIER_LBL: Record<string, string> = { usps:"USPS",    ups:"UPS",     fedex:"FedEx",   dhl:"DHL" };

function carrierKey(pref?: string | null) {
  if (!pref) return null;
  const p = pref.toLowerCase();
  if (p.includes("usps") || p.includes("postal")) return "usps";
  if (p.includes("ups"))   return "ups";
  if (p.includes("fedex")) return "fedex";
  if (p.includes("dhl"))   return "dhl";
  return null;
}

const TYPE_BG: Record<string, string> = {
  "\u25cf": "#1d4ed8", "\u26a1": "#15803d", "\u2605": "#7c3aed", "\u25a0": "#111827",
};
const TYPE_LBL: Record<string, string> = {
  "\u25cf": "Standard", "\u26a1": "Rush", "\u2605": "Event", "\u25a0": "B2B",
};

type OrderGroup = {
  orderId: string;
  code:    string;
  num:     string;
  name:    string;
  symbol:  string;
  color:   string;
  slots:   number[];
};

type OrderAddress = {
  address_line1?:      string | null;
  city?:               string | null;
  state_region?:       string | null;
  postal_code?:        string | null;
  country?:            string | null;
  carrier_preference?: string | null;
  tracking_number?:    string | null;
};

function LabelCard({
  grp, addr, batchLabel, sheetNumber, totalSheets,
}: {
  grp: OrderGroup; addr?: OrderAddress;
  batchLabel: string; sheetNumber: number; totalSheets: number;
}) {
  const typeColor = TYPE_BG[grp.symbol]  ?? "#111827";
  const typeLabel = TYPE_LBL[grp.symbol] ?? grp.symbol;
  const sorted    = [...grp.slots].sort((a, b) => a - b);
  const slotStr   = sorted.length > 5
    ? `${sorted[0]}–${sorted[sorted.length - 1]}`
    : sorted.join(", ");
  const ck       = carrierKey(addr?.carrier_preference);
  const addrLine1 = addr?.address_line1 || "";
  const cityLine  = [addr?.city, addr?.state_region, addr?.postal_code].filter(Boolean).join(", ");
  const isIntl    = addr?.country && addr.country.toLowerCase() !== "united states";

  return (
    <div style={{
      width:"100%", height:"100%", background:"white", border:"1pt solid #334155",
      boxSizing:"border-box", overflow:"hidden", display:"flex", flexDirection:"column",
      printColorAdjust:"exact", WebkitPrintColorAdjust:"exact",
    } as React.CSSProperties}>
      <div style={{
        background:typeColor, color:"white", padding:"0.03in 0.05in", fontSize:"7pt",
        fontWeight:900, lineHeight:1.2, display:"flex", justifyContent:"space-between",
        alignItems:"center", flexShrink:0,
        printColorAdjust:"exact", WebkitPrintColorAdjust:"exact",
      } as React.CSSProperties}>
        <span>{grp.symbol} {typeLabel} · {grp.code}</span>
        {ck && (
          <span style={{
            background:CARRIER_BG[ck], color:CARRIER_TXT[ck],
            padding:"0.01in 0.04in", borderRadius:"3px", fontSize:"6pt", fontWeight:900,
            printColorAdjust:"exact", WebkitPrintColorAdjust:"exact",
          } as React.CSSProperties}>{CARRIER_LBL[ck]}</span>
        )}
      </div>
      <div style={{ padding:"0.02in 0.04in 0.01in", flexShrink:0 }}>
        <Code39Barcode value={grp.num || grp.code} />
        <div style={{ fontSize:"5pt", textAlign:"center", color:"#374151", fontFamily:"monospace" }}>{grp.num}</div>
      </div>
      <div style={{ padding:"0.05in 0.05in 0.02in", fontSize:"7.5pt", lineHeight:1.35, color:"#111827", flex:1, overflow:"hidden" }}>
        <div style={{ fontSize:"9pt", fontWeight:900, marginBottom:"0.02in" }}>{grp.name}</div>
        {addrLine1 && <div style={{ fontWeight:600 }}>{addrLine1}</div>}
        {cityLine  && <div>{cityLine}</div>}
        {isIntl && addr?.country && <div style={{ fontWeight:700, color:"#b91c1c" }}>{addr.country.toUpperCase()}</div>}
        {addr?.tracking_number && <div style={{ fontSize:"5.5pt", color:"#374151", marginTop:"0.01in" }}>TRK: {addr.tracking_number}</div>}
        <div style={{ fontSize:"5.5pt", color:"#6b7280", marginTop:"0.01in", borderTop:"0.3pt solid #e5e7eb", paddingTop:"0.01in" }}>
          Slots {slotStr} · {batchLabel} · S{sheetNumber}/{totalSheets}
        </div>
      </div>
    </div>
  );
}

function MemoirGemsPrintMap({
  items, format, batchLabel, sheetNumber, totalSheets, orderAddresses,
}: {
  items: ProductionBatchItem[];
  format: ProductFormat;
  batchLabel: string;
  sheetNumber: number;
  totalSheets: number;
  orderAddresses: Record<string, OrderAddress>;
}) {
  const { gridCols, gridRows, slotsPerSheet } = format;

  const orderGroups = useMemo(() => {
    const map = new Map<string, OrderGroup>();
    items.forEach((item) => {
      if (!map.has(item.order_code)) {
        map.set(item.order_code, {
          orderId: item.order_id,
          code:    item.order_code,
          num:     item.order_number,
          name:    item.customer_name,
          symbol:  item.symbol,
          color:   item.group_color,
          slots:   [],
        });
      }
      map.get(item.order_code)!.slots.push(item.slot_number);
    });
    return Array.from(map.values()).sort((a, b) => a.slots[0] - b.slots[0]);
  }, [items]);

  const itemsBySlot = useMemo(() => {
    const m = new Map<number, ProductionBatchItem>();
    items.forEach((i) => m.set(i.slot_number, i));
    return m;
  }, [items]);

  const labelCardsBySlot = useMemo(() => {
    // photoSlots on THIS sheet — used to avoid placing a label card on top of a photo
    const photoSlots = new Set(items.map((i) => i.slot_number));
    const m = new Map<number, OrderGroup>();
    orderGroups.forEach((grp) => {
      if (grp.slots.length === 0) return;
      const lastSlot = Math.max(...grp.slots);
      const labelSlot = lastSlot + 1;
      // Show label card only if it fits on this sheet and isn't occupied by a photo
      if (labelSlot <= slotsPerSheet && !photoSlots.has(labelSlot)) {
        m.set(labelSlot, grp);
      }
      // If labelSlot > slotsPerSheet the label card overflows to the next sheet —
      // it will appear there naturally (next sheet's grp.slots will have a photo
      // at its last slot, and labelSlot+1 will be within that sheet's range).
    });
    return m;
  }, [orderGroups, items, slotsPerSheet]);

  // Per-slot insets: each cell's photo box can sit at a slightly different
  // position within the octagon grid (see format.cellInsets). Falls back to
  // the format's default `inset` if no per-slot override is defined.
  const insetForSlot = (slotNum: number) => format.cellInsets?.[slotNum - 1] ?? format.inset;

  return (
    <div
      className="template-backend-page"
      style={{
        width: "8.5in", height: "11in", background: "white",
        boxSizing: "border-box", position: "relative", overflow: "hidden",
        printColorAdjust: "exact", WebkitPrintColorAdjust: "exact",
      } as React.CSSProperties}
    >
      <img
        src={format.templateImage}
        alt=""
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          objectFit: "fill",
          pointerEvents: "none",
        }}
      />

      <div style={{
        position: "absolute",
        top: `${format.gridMargins.top}%`, left: `${format.gridMargins.left}%`,
        right: `${format.gridMargins.right}%`, bottom: `${format.gridMargins.bottom}%`,
        display: "grid",
        gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
        gridTemplateRows: `repeat(${gridRows}, 1fr)`,
      }}>
        {Array.from({ length: slotsPerSheet }, (_, i) => i + 1).map((slotNum) => {
          const item     = itemsBySlot.get(slotNum);
          const labelGrp = labelCardsBySlot.get(slotNum);

          const { top, right, bottom, left } = insetForSlot(slotNum);
          const photoWidthPct  = 100 - left - right;
          const photoHeightPct = 100 - top - bottom;

          if (labelGrp) {
            return (
              <div key={slotNum} style={{ position: "relative" }}>
                <div style={{
                  position: "absolute",
                  top: `${top}%`, left: `${left}%`,
                  width: `${photoWidthPct}%`, height: `${photoHeightPct}%`,
                  overflow: "hidden",
                }}>
                  <LabelCard
                    grp={labelGrp}
                    addr={orderAddresses[labelGrp.orderId]}
                    batchLabel={batchLabel}
                    sheetNumber={sheetNumber}
                    totalSheets={totalSheets}
                  />
                </div>
              </div>
            );
          }

          if (item) {
            return (
              <div key={slotNum} style={{ position: "relative" }}>
                <img
                  src={item.photo_url} alt="" loading="lazy"
                  style={{
                    position: "absolute",
                    top: `${top}%`, left: `${left}%`,
                    width: `${photoWidthPct}%`, height: `${photoHeightPct}%`,
                    objectFit: "cover", display: "block",
                  }}
                />
              </div>
            );
          }

          // Empty slot — white fill to hide the template's printed cell outline
          return (
            <div key={slotNum} style={{ position: "relative" }}>
              <div style={{
                position: "absolute",
                top: `${top}%`, left: `${left}%`,
                width: `${photoWidthPct}%`, height: `${photoHeightPct}%`,
                background: "white",
                printColorAdjust: "exact", WebkitPrintColorAdjust: "exact",
              } as React.CSSProperties} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function TemplateProductionClient() {
  const searchParams = useSearchParams();
  const batchId      = searchParams.get("batchId");

  const [batch,          setBatch]          = useState<ProductionBatch | null>(null);
  const [items,          setItems]          = useState<ProductionBatchItem[]>([]);
  const [orderAddresses, setOrderAddresses] = useState<Record<string, OrderAddress>>({});
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState<string | null>(null);
  const [reloadKey,      setReloadKey]      = useState(0);
  const [rebuilding,     setRebuilding]     = useState(false);
  const [rebuildMsg,     setRebuildMsg]     = useState<string | null>(null);

  async function handleRebuild() {
    if (!batchId) return;
    setRebuilding(true);
    setRebuildMsg(null);
    try {
      const res = await fetch("/api/admin/rebuild-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batchId }),
      });
      const json = await res.json();
      if (!res.ok || json.error) {
        setRebuildMsg(`❌ ${json.error || "Rebuild failed"}`);
      } else {
        setRebuildMsg(`✅ Rebuilt — ${json.itemCount} items`);
        setReloadKey((k) => k + 1);
      }
    } catch (e) {
      setRebuildMsg(`❌ ${(e as Error).message}`);
    } finally {
      setRebuilding(false);
    }
  }

  useEffect(() => {
    if (!batchId) return;
    setLoading(true);
    setError(null);

    async function loadBatch() {
      const { data: batchData, error: batchError } = await supabase
        .from("production_batches")
        .select("*")
        .eq("id", batchId)
        .single();

      if (batchError) {
        setError(batchError.code === "PGRST116"
          ? `Batch not found: ${batchId}`
          : `Could not load batch: ${batchError.message}`);
        setLoading(false);
        return;
      }

      const { data: itemData, error: itemError } = await supabase
        .from("production_batch_items")
        .select("*")
        .eq("batch_id", batchId)
        .order("sheet_number", { ascending: true })
        .order("slot_number",  { ascending: true });

      if (itemError) {
        setError(`Could not load batch items: ${itemError.message}`);
        setLoading(false);
        return;
      }

      const loadedItems = (itemData || []) as ProductionBatchItem[];
      setBatch(batchData as ProductionBatch);
      setItems(loadedItems);

      const uniqueOrderIds = [...new Set(loadedItems.map((i) => i.order_id))];
      if (uniqueOrderIds.length > 0) {
        const { data: orderData } = await supabase
          .from("orders")
          .select("id, address_line1, city, state_region, postal_code, country, carrier_preference, tracking_number")
          .in("id", uniqueOrderIds);

        if (orderData) {
          const addrMap: Record<string, OrderAddress> = {};
          (orderData as OrderRow[]).forEach((o) => {
            addrMap[o.id] = {
              address_line1:      o.address_line1,
              city:               o.city,
              state_region:       o.state_region,
              postal_code:        o.postal_code,
              country:            o.country,
              carrier_preference: o.carrier_preference,
              tracking_number:    o.tracking_number,
            };
          });
          setOrderAddresses(addrMap);
        }
      }
      setLoading(false);
    }

    loadBatch();
  }, [batchId, reloadKey]);

  // production_batches has no format_id column yet — calibration/test batches
  // encode the format as a "[FORMAT:xxx]" tag at the start of `notes` until a
  // real format_id column is migrated in.
  const notesFormatMatch = batch?.notes?.match(/\[FORMAT:([^\]]+)\]/);
  const format      = formatById(batch?.format_id || notesFormatMatch?.[1]);
  const sheets      = useMemo(() => groupBySheet(items), [items]);
  const totalSheets = Object.keys(sheets).length || 1;
  const batchLabel  = batch?.batch_number || batchId || "Unknown Batch";

  const [currentSheet, setCurrentSheet] = useState(1);
  const [isPrinting,   setIsPrinting]   = useState(false);

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => { window.print(); setIsPrinting(false); }, 300);
  };

  if (!batchId) {
    return (
      <main className="container">
        <NavBar />
        <div className="card">
          <h2>No batch selected</h2>
          <p>Open the print map from a batch detail page.</p>
          <p><a href="/admin/batches">Go to Batches</a></p>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="container"><NavBar />
        <div className="card">Loading batch {batchId}...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container"><NavBar />
        <div className="status yellow">{error}</div>
        <div className="card">
          <p>Check that this batch ID exists in production_batches.</p>
          <p><a href="/admin/batches">Back to Batches</a></p>
        </div>
      </main>
    );
  }

  return (
    <main className="container">
      <div className="no-print" style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        gap:"0.5rem", padding:"0.5rem 0.75rem", marginBottom:"0.75rem",
        background:"#0f172a", borderRadius:"6px", flexWrap:"wrap",
      }}>
        <span style={{ color:"white", fontWeight:700, fontSize:"0.9rem" }}>
          Memoir Gems — Production Print Map — {batchLabel}
           · {format.label}
           · {totalSheets} sheet{totalSheets !== 1 ? "s" : ""}
           · {items.length} photos
        </span>
        <div style={{ display:"flex", gap:"0.4rem", alignItems:"center", flexShrink:0 }}>
          <button className="btn-secondary" disabled={currentSheet <= 1}
            onClick={() => setCurrentSheet((s) => Math.max(1, s - 1))}
            style={{ padding:"0.25rem 0.6rem" }}>‹ Prev</button>
          <span style={{ color:"white", fontSize:"0.85rem", minWidth:"6rem", textAlign:"center" }}>
            Sheet {currentSheet} / {totalSheets}
          </span>
          <button className="btn-secondary" disabled={currentSheet >= totalSheets}
            onClick={() => setCurrentSheet((s) => Math.min(totalSheets, s + 1))}
            style={{ padding:"0.25rem 0.6rem" }}>Next ›</button>
          <button
            className="btn-secondary"
            onClick={handleRebuild}
            disabled={rebuilding}
            style={{ padding:"0.25rem 0.6rem" }}>
            {rebuilding ? "Rebuilding…" : "Rebuild"}
          </button>
          <button className="btn-primary" onClick={handlePrint}
            style={{ padding:"0.25rem 0.6rem" }}>
            Print All ({totalSheets})
          </button>
        </div>
      </div>

      {rebuildMsg && <div className="status" style={{ marginBottom:"0.75rem" }}>{rebuildMsg}</div>}

      {Object.entries(sheets).map(([sheetNum, sheetItems]) => {
        const n = Number(sheetNum);
        if (!isPrinting && n !== currentSheet) return null;
        return (
          <MemoirGemsPrintMap
            key={n}
            items={sheetItems}
            format={format}
            batchLabel={batchLabel}
            sheetNumber={n}
            totalSheets={totalSheets}
            orderAddresses={orderAddresses}
          />
        );
      })}
    </main>
  );
}
     