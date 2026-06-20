"use client";

import { useState } from "react";
import NavBar from "@/components/NavBar";

const slots = Array.from({ length: 12 }, (_, i) => i + 1);

function CalibrationSlot({ number }: { number: number }) {
  return (
    <div className="calibration-slot">
      <div className="calibration-slot-inner" />
      <div className="calibration-slot-center-v" />
      <div className="calibration-slot-center-h" />
      <div className="calibration-label">
        2 x 2 inches<br />
        Slot {number}<br />
        Measure outer box
      </div>
      <div className="calibration-slot-number">#{number}</div>
    </div>
  );
}

export default function CalibrationPageClient() {
  const [showSheet, setShowSheet] = useState(true);

  function printCalibration() {
    setShowSheet(true);
    setTimeout(() => window.print(), 100);
  }

  return (
    <main className="container">
      <section className="hero no-print">
        <h1>Memoir Gems Calibration Sheet</h1>
        <p>
          Backend-only technical sheet. It uses the same physical 2x2 layout as the production sheets,
          but with measurement boxes instead of customer photos.
        </p>
      </section>

      <NavBar />

      <div className="card no-print">
        <h2>What this is for</h2>
        <p>
          This is not the client frontend and not a customer-facing page. Use this sheet before real production
          to confirm your printer/PDF settings are preserving exact size.
        </p>

        <div className="calibration-info">
          <b>Print settings:</b><br />
          Paper: Letter 8.5 x 11<br />
          Scale: 100% / Actual Size<br />
          Margins: None or Minimum<br />
          Background graphics: ON<br />
          Do not use Fit to Page or Shrink to Fit.
        </div>

        <div className="actions">
          <button onClick={printCalibration}>Print Calibration Sheet</button>
          <button className="secondary" onClick={() => setShowSheet(!showSheet)}>
            {showSheet ? "Hide on-screen sheet" : "Show on-screen sheet"}
          </button>
        </div>
      </div>

      <div className="card no-print">
        <h2>How to verify</h2>
        <p>
          Print this page or save as PDF first. Measure the outer border of any slot with a physical ruler.
          Each slot must measure exactly:
        </p>
        <div className="status green">2 inches wide x 2 inches tall</div>
        <p>
          If it does not measure 2 x 2 inches, the browser/printer is scaling the page.
          Change print settings to Actual Size / 100%.
        </p>
      </div>

      {showSheet && (
        <section className="print-only">
          <div className="calibration-page">
            <div className="calibration-grid">
              {slots.map((slot) => (
                <CalibrationSlot number={slot} key={slot} />
              ))}
            </div>
            <div className="calibration-ruler" />
          </div>
        </section>
      )}

      {showSheet && (
        <section className="no-print">
          <div className="calibration-page">
            <div className="calibration-grid">
              {slots.map((slot) => (
                <CalibrationSlot number={slot} key={`screen-${slot}`} />
              ))}
            </div>
            <div className="calibration-ruler" />
          </div>
        </section>
      )}
    </main>
  );
}
