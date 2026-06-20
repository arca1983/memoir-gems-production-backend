"use client";

import NavBar from "@/components/NavBar";
import { ALL_FORMATS, ACTIVE_FORMATS } from "@/lib/formats";

/**
 * /admin/formats
 * ─────────────────────────────────────────────────────────────────────────────
 * Reference page showing all registered product formats.
 * Logistics/production staff use this to understand sheet layouts,
 * slot counts, and paper requirements before starting a print job.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export default function FormatsPage() {
  return (
    <main className="container">
      <section className="hero">
        <h1>Product Formats</h1>
        <p>
          All registered magnet and product sizes. Each format determines sheet layout,
          slot count, paper type, and material cost. Active formats can receive orders.
        </p>
      </section>

      <NavBar />

      {/* Active Formats */}
      <div className="card">
        <h2>Active Formats</h2>
        <p className="small" style={{ color: "#888", marginBottom: "1rem" }}>
          These formats are live and accepting orders.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
          {ACTIVE_FORMATS.map((fmt) => (
            <div key={fmt.id} className="card" style={{ margin: 0, border: "1px solid #B08D57" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <h3 style={{ margin: 0 }}>{fmt.label}</h3>
                <span className="badge green">Active</span>
              </div>
              <p className="small" style={{ color: "#aaa", margin: "0.4rem 0 0.8rem" }}>{fmt.description}</p>

              {/* Visual grid diagram */}
              <div style={{ marginBottom: "0.8rem" }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${fmt.gridCols}, 1fr)`,
                    gap: 4,
                    maxWidth: 200,
                  }}
                >
                  {Array.from({ length: fmt.slotsPerSheet }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        background: i === 0 ? "#B08D57" : "#2a2a2a",
                        border: "1px solid #444",
                        borderRadius: 3,
                        aspectRatio: `${fmt.widthIn}/${fmt.heightIn}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.55rem",
                        color: "#888",
                      }}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
                <span className="small" style={{ color: "#888", marginTop: 4, display: "block" }}>
                  {fmt.gridCols} col × {fmt.gridRows} row = {fmt.slotsPerSheet} slots/sheet
                </span>
              </div>

              <table style={{ width: "100%", fontSize: "0.8rem", borderCollapse: "collapse" }}>
                <tbody>
                  {[
                    ["Size",        `${fmt.widthIn}″ × ${fmt.heightIn}″`],
                    ["Paper",       fmt.paperType],
                    ["Sheet size",  `${fmt.paperWidthIn}″ × ${fmt.paperHeightIn}″`],
                    ["Bleed",       `${fmt.bleedIn}″ per side`],
                    ["Unit cost",   `$${fmt.unitCostUsd.toFixed(2)}`],
                    ["Carrier",     fmt.defaultCarrierClass],
                  ].map(([label, value]) => (
                    <tr key={label}>
                      <td style={{ color: "#888", paddingRight: 8, paddingBottom: 2 }}>{label}</td>
                      <td style={{ fontWeight: 500 }}>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>

      {/* Coming Soon */}
      <div className="card">
        <h2>Coming Soon</h2>
        <p className="small" style={{ color: "#888", marginBottom: "1rem" }}>
          These formats are registered in the system but not yet active. Set <code>isActive: true</code> in <code>lib/formats.ts</code> to enable.
        </p>
        <table className="table">
          <thead>
            <tr>
              <th>Format</th>
              <th>Description</th>
              <th>Size</th>
              <th>Slots / Sheet</th>
              <th>Paper Type</th>
              <th>Unit Cost</th>
            </tr>
          </thead>
          <tbody>
            {ALL_FORMATS.filter((f) => !f.isActive).map((fmt) => (
              <tr key={fmt.id} style={{ opacity: 0.6 }}>
                <td><b>{fmt.label}</b></td>
                <td>{fmt.description}</td>
                <td>{fmt.widthIn}″ × {fmt.heightIn}″</td>
                <td>{fmt.slotsPerSheet} ({fmt.gridCols}×{fmt.gridRows})</td>
                <td>{fmt.paperType}</td>
                <td>${fmt.unitCostUsd.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* How Formats Work */}
      <div className="card">
        <h2>How Formats Work</h2>
        <p style={{ color: "#ccc", lineHeight: 1.7 }}>
          Each order has a <b>product_type</b> field that stores the format ID (e.g. <code>"2x2"</code>).
          When a production batch is created, all photos are assigned to sheet slots based on that format&apos;s
          <b> slotsPerSheet</b>. The print map template uses the same format data to render the correct
          grid layout. Changing a format&apos;s grid here automatically updates the print map for any new batch
          — no other code changes needed.
        </p>
        <p style={{ color: "#ccc", lineHeight: 1.7 }}>
          To add a new format: open <code>lib/formats.ts</code>, add an entry to the <code>FORMATS</code> object,
          set <code>isActive: true</code>, and redeploy. The system will route orders to the correct sheet layout automatically.
        </p>
      </div>
    </main>
  );
}
