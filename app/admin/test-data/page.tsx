"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import NavBar from "@/components/NavBar";

type TestAddress = {
  id: string;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  country: string | null;
  state_province_region: string | null;
  city: string | null;
  postal_code: string | null;
  street_address: string | null;
  order_service_level: string | null;
  delivery_notes: string | null;
  company: string | null;
};

// 8 different Unsplash photos to cycle through
const PLACEHOLDER_PHOTOS = [
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=600&h=600&fit=crop",
];

function createOrderNumber() {
  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const random = Math.floor(1000 + Math.random() * 9000);
  return `MG-TEST-${stamp}-${random}`;
}

function randomPhotoUrl(index: number) {
  return PLACEHOLDER_PHOTOS[index % PLACEHOLDER_PHOTOS.length];
}

// ─── Order plan types ───────────────────────────────────────────────────────

type TestOrderPlan = {
  qty: number;
  priority: string;            // standard | rush | event_deadline | b2b
  nameOverride?: string;
  carrier?: string;            // USPS | UPS | FedEx | DHL | null
  forceInternational?: {       // hard-code international address
    country: string;
    city: string;
    state: string;
    postal_code: string;
    address: string;
  };
  preApproved?: boolean;       // mark photos approved + order ready_for_batch
};

// ─── Scenario definitions ───────────────────────────────────────────────────

function orderPlan(type: string): TestOrderPlan[] {

  // Full production test:
  // Standard/Rush/Event/B2B, sizes 2/6/12/26/100, domestic+international,
  // all carriers, all pre-approved so they can go straight to batch.
  if (type === "comprehensive") {
    return [
      {
        qty: 2,
        priority: "standard",
        nameOverride: "Sarah Mitchell",
        carrier: "USPS",
        preApproved: true,
      },
      {
        qty: 6,
        priority: "standard",
        nameOverride: "James Carter",
        carrier: "FedEx",
        preApproved: true,
      },
      {
        qty: 12,
        priority: "rush",
        nameOverride: "Elena Vasquez",
        carrier: "UPS",
        preApproved: true,
      },
      {
        qty: 26,
        priority: "event_deadline",
        nameOverride: "Rosewood Wedding Co.",
        carrier: "FedEx",
        preApproved: true,
      },
      {
        qty: 100,
        priority: "b2b",
        nameOverride: "RGMaster Print Solutions",
        carrier: "UPS",
        preApproved: true,
      },
      {
        qty: 4,
        priority: "standard",
        nameOverride: "Maria Fernandez",
        carrier: "DHL",
        forceInternational: {
          country: "Mexico",
          city: "Monterrey",
          state: "Nuevo Leon",
          postal_code: "64000",
          address: "Av. Constitución 123, Centro",
        },
        preApproved: true,
      },
    ];
  }

  // Exactly 2 full sheets test:
  // 3 orders totaling 18 photos + 3 label cards = 21 slots = 2 sheets (sheet 2 partially filled)
  if (type === "two_sheets") {
    return [
      {
        qty: 6,
        priority: "standard",
        nameOverride: "Alice Thompson",
        carrier: "USPS",
        preApproved: true,
      },
      {
        qty: 8,
        priority: "rush",
        nameOverride: "Ben Rodriguez",
        carrier: "FedEx",
        preApproved: true,
      },
      {
        qty: 5,
        priority: "event_deadline",
        nameOverride: "Clara Park",
        carrier: "UPS",
        preApproved: true,
      },
    ];
  }

  // Annie's mixed scenario (existing)
  if (type === "mixed") {
    return [
      { qty: 26, priority: "standard",       nameOverride: "Annie Rossi" },
      { qty: 9,  priority: "standard",       nameOverride: "Thomas Paz" },
      { qty: 3,  priority: "event_deadline", nameOverride: "Carolina Gabriela" },
      { qty: 100, priority: "rush",          nameOverride: "RGMaster Business" },
    ];
  }

  // Small test (existing)
  if (type === "small") {
    return [
      { qty: 4,  priority: "standard" },
      { qty: 8,  priority: "standard" },
      { qty: 2,  priority: "event_deadline" },
      { qty: 14, priority: "rush" },
    ];
  }

  // Basic 2-order test (existing)
  return [
    { qty: 6, priority: "standard" },
    { qty: 6, priority: "standard" },
  ];
}

// ─── Page component ─────────────────────────────────────────────────────────

export default function TestDataPage() {
  const [count, setCount] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  // ── Delete all test orders ──────────────────────────────────────────────
  async function deleteAllTestOrders() {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      setMessage("Click Delete again to confirm — this will delete ALL test orders and their photos.");
      return;
    }
    setBusy(true);
    setMessage("");
    setDeleteConfirm(false);
    try {
      const { data: testOrders, error: fetchError } = await supabase
        .from("orders")
        .select("id, order_id")
        .like("order_id", "MG-TEST-%");

      if (fetchError) throw fetchError;
      if (!testOrders || testOrders.length === 0) {
        setMessage("No test orders found.");
        setBusy(false);
        return;
      }

      const ids = testOrders.map((o) => o.id);
      await supabase.from("order_photos").delete().in("order_id", ids);
      await supabase.from("order_status_events").delete().in("order_id", ids);
      // Also clean up any batches that only have test items
      await supabase.from("production_batch_items").delete().in("order_id", ids);
      const { error: deleteError } = await supabase.from("orders").delete().in("id", ids);
      if (deleteError) throw deleteError;

      setMessage(`Deleted ${testOrders.length} test orders and all related data.`);
    } catch (err: any) {
      setMessage(err?.message || "Could not delete test orders.");
    } finally {
      setBusy(false);
    }
  }

  // ── Address book count ──────────────────────────────────────────────────
  async function loadCount() {
    const { count, error } = await supabase
      .from("test_address_book")
      .select("*", { count: "exact", head: true });
    if (error) setMessage(error.message);
    else setCount(count || 0);
  }

  useEffect(() => { loadCount(); }, []);

  async function fetchRandomAddresses(limit: number) {
    const { data, error } = await supabase
      .from("test_address_book")
      .select("*")
      .limit(limit * 3);
    if (error) throw error;
    const shuffled = [...(data || [])].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, limit) as TestAddress[];
  }

  // ── Generate orders ──────────────────────────────────────────────────────
  async function generate(type: string) {
    setBusy(true);
    setMessage("");

    try {
      const plan = orderPlan(type);
      const addresses = await fetchRandomAddresses(plan.length);
      let created = 0;

      for (let i = 0; i < plan.length; i++) {
        const p = plan[i];
        const a = addresses[i];

        const orderNumber = createOrderNumber();
        const fullName = p.nameOverride
          || a.full_name
          || `${a.first_name || "Test"} ${a.last_name || "Customer"}`;

        // Use forced international address or address book entry
        const country   = p.forceInternational?.country   ?? a.country         ?? "United States";
        const city      = p.forceInternational?.city       ?? a.city            ?? "Houston";
        const state     = p.forceInternational?.state      ?? a.state_province_region ?? "TX";
        const zip       = p.forceInternational?.postal_code ?? a.postal_code    ?? "77001";
        const addr1     = p.forceInternational?.address    ?? a.street_address  ?? "123 Test St";

        const isIntl         = country.toLowerCase() !== "united states";
        const addressStatus  = isIntl ? "international_manual_review" : "customer_confirmed";
        const carrierPref    = p.carrier ?? "No preference";

        // Pre-approved orders go straight to ready_for_batch so you can
        // create a batch immediately without manual approval steps.
        const productionStatus = p.preApproved
          ? "ready_for_batch"
          : p.priority === "rush"
            ? "rush_review"
            : "waiting_for_batch";

        const { data: order, error: orderError } = await supabase
          .from("orders")
          .insert({
            order_id:                        orderNumber,
            customer_name:                   fullName,
            email:                           a.email || `test-${Date.now()}-${i}@memoirgems.test`,
            phone:                           a.phone || "555-000-0000",
            address:                         addr1,
            city,
            state,
            zip,
            country,
            address_line1:                   addr1,
            address_line2:                   null,
            state_region:                    state,
            postal_code:                     zip,
            carrier_preference:              carrierPref,
            tracking_number:                 null,
            product_type:                    "2x2 Photo Magnet",
            photo_count:                     p.qty,
            priority:                        p.priority,
            deadline_date:                   p.priority === "event_deadline"
              ? new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10)
              : null,
            rush_reason:                     p.priority === "rush"
              ? "Generated rush test order"
              : p.priority === "event_deadline"
                ? "Generated event deadline test"
                : null,
            address_status:                  addressStatus,
            address_confirmed_by_customer:   true,
            address_validation_message:      isIntl
              ? "International test address — manual review required."
              : "Test address confirmed.",
            order_status:                    "new_order",
            production_status:               productionStatus,
            shipping_status:                 "not_ready",
            traffic_light_status:            "yellow",
            customer_visible_status:         "order_received",
            internal_status:                 "new_order",
            notes:                           `[TEST] ${p.qty} photos | ${p.priority} | ${carrierPref}${isIntl ? " | INTL" : ""}`,
          })
          .select()
          .single();

        if (orderError) throw orderError;

        // Build photos — pre-approved ones get approved status immediately
        const photos = Array.from({ length: p.qty }).map((_, idx) => ({
          order_id:           order.id,
          order_number:       orderNumber,
          photo_url:          randomPhotoUrl(idx + i),
          photo_name:         `test-photo-${idx + 1}.jpg`,
          photo_number:       idx + 1,
          photo_status:       p.preApproved ? "approved_for_print" : "uploaded",
          approved_for_print: p.preApproved ? true : false,
        }));

        const { error: photoError } = await supabase.from("order_photos").insert(photos);
        if (photoError) throw photoError;

        await supabase.from("order_status_events").insert({
          order_id:         order.id,
          order_number:     orderNumber,
          status_key:       "test_order_generated",
          status_label:     "Test order generated",
          visible_to_customer: false,
          internal_note:    `Generated ${p.qty} test photo(s) for ${fullName}. Status: ${productionStatus}.`,
        });

        created++;
        setMessage(`Creating orders... ${created}/${plan.length}`);
      }

      const autoReadyCount = plan.filter((p) => p.preApproved).length;
      setMessage(
        `Created ${plan.length} test orders.` +
        (autoReadyCount > 0
          ? ` ${autoReadyCount} are pre-approved and ready to batch — go to Batches and create a new batch now.`
          : " Go to Orders to approve photos.")
      );
    } catch (err: any) {
      console.error(err);
      setMessage(err?.message || "Could not generate test orders.");
    } finally {
      setBusy(false);
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <main className="container">
      <section className="hero">
        <h1>Test Data Generator</h1>
        <p>Creates fake orders directly in Supabase for testing the production workflow end to end.</p>
      </section>

      <NavBar />

      <div className="card">
        <h2>Address book</h2>
        <p>Records available: <b>{count === null ? "Loading..." : count}</b></p>
        <p className="small">Internal use only. Not for real shipping or customer contact.</p>
      </div>

      {/* ── New scenarios ── */}
      <div className="card">
        <h2>Production test scenarios</h2>
        <p>These scenarios generate pre-approved orders that go straight to Batch creation — no manual approval needed.</p>

        <div className="actions" style={{ flexDirection: "column", alignItems: "flex-start", gap: "0.75rem" }}>

          <div>
            <button disabled={busy} onClick={() => generate("comprehensive")} style={{ marginRight: "0.5rem" }}>
              Full production test (6 orders)
            </button>
            <span className="small">
              2 Standard (2+6 photos) + 1 Rush (12) + 1 Event (26) + 1 B2B (100) + 1 International/DHL (4)
              — all carriers, all types, domestic + Mexico. Creates ~13 sheets.
            </span>
          </div>

          <div>
            <button disabled={busy} onClick={() => generate("two_sheets")} style={{ marginRight: "0.5rem" }}>
              2-sheet batch test (3 orders)
            </button>
            <span className="small">
              Standard 6 + Rush 8 + Event 5 = 19 photos + 3 label cards = 2 sheets. Good for verifying multi-sheet layout.
            </span>
          </div>

        </div>
      </div>

      {/* ── Legacy scenarios ── */}
      <div className="card">
        <h2>Legacy scenarios</h2>
        <p className="small">These use random address book entries. Photos are NOT pre-approved — you must approve them manually in Orders before batching.</p>
        <div className="actions">
          <button disabled={busy} onClick={() => generate("basic")}>2 simple orders (6+6)</button>
          <button disabled={busy} onClick={() => generate("small")}>Small mixed (4+8+2+14)</button>
          <button disabled={busy} onClick={() => generate("mixed")}>Annie / Thomas / Carolina / RGMaster</button>
        </div>
      </div>

      {/* ── Status ── */}
      {message && (
        <div className="card">
          <div className="status yellow">{message}</div>
        </div>
      )}

      {/* ── Delete ── */}
      <div className="card">
        <h2>Delete all test orders</h2>
        <p>
          Removes everything with order number <code>MG-TEST-*</code> — orders, photos, status events,
          and batch items. Use this to reset before a clean test run.
        </p>
        <div className="actions">
          <button
            disabled={busy}
            onClick={deleteAllTestOrders}
            style={{ background: deleteConfirm ? "#b91c1c" : undefined, color: deleteConfirm ? "white" : undefined }}
          >
            {deleteConfirm ? "Confirm — Delete All Test Orders" : "Delete All Test Orders"}
          </button>
          {deleteConfirm && (
            <button className="secondary" onClick={() => { setDeleteConfirm(false); setMessage(""); }}>
              Cancel
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
