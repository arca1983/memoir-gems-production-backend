/**
 * Memoir Gems — Test Data Seed Script
 * Run from the project root:  node scripts/seed-test-data.mjs
 *
 * Inserts the "comprehensive" scenario: 6 pre-approved orders, all carriers,
 * all order types, domestic + international.  Ready to batch immediately.
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// ── Load .env.local ──────────────────────────────────────────────────────────
const __dir = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dir, "../.env.local");
const envVars = Object.fromEntries(
  readFileSync(envPath, "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => [l.split("=")[0].trim(), l.split("=").slice(1).join("=").trim()])
);

const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

// ── Photo pool (Unsplash) ────────────────────────────────────────────────────
const PHOTOS = [
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=600&h=600&fit=crop",
];
const photo = (i) => PHOTOS[i % PHOTOS.length];

function orderNumber() {
  const d = new Date();
  const stamp = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}`;
  return `MG-TEST-${stamp}-${Math.floor(1000 + Math.random() * 9000)}`;
}

// ── Scenario ─────────────────────────────────────────────────────────────────
const ORDERS = [
  {
    name: "Sarah Mitchell",    qty: 2,   priority: "standard",       carrier: "USPS",
    country: "United States",  city: "Austin",       state: "TX", zip: "78701",
    address: "123 Congress Ave",
  },
  {
    name: "James Carter",     qty: 6,   priority: "standard",       carrier: "FedEx",
    country: "United States",  city: "Dallas",       state: "TX", zip: "75201",
    address: "456 Commerce St",
  },
  {
    name: "Elena Vasquez",    qty: 12,  priority: "rush",            carrier: "UPS",
    country: "United States",  city: "Houston",      state: "TX", zip: "77001",
    address: "789 Main St",
  },
  {
    name: "Rosewood Wedding", qty: 26,  priority: "event_deadline",  carrier: "FedEx",
    country: "United States",  city: "San Antonio",  state: "TX", zip: "78201",
    address: "101 Alamo Plaza",
  },
  {
    name: "RGMaster Print",   qty: 100, priority: "b2b",             carrier: "UPS",
    country: "United States",  city: "New York",     state: "NY", zip: "10001",
    address: "200 Fifth Ave",
  },
  {
    name: "Maria Fernandez",  qty: 4,   priority: "standard",        carrier: "DHL",
    country: "Mexico",         city: "Monterrey",    state: "Nuevo Leon", zip: "64000",
    address: "Av. Constitución 123, Centro",
  },
];

// ── Insert ────────────────────────────────────────────────────────────────────
async function seed() {
  console.log("Seeding comprehensive test scenario...\n");

  // First delete any existing MG-TEST orders to avoid duplicates
  const { data: existing } = await supabase
    .from("orders")
    .select("id")
    .like("order_id", "MG-TEST-%");

  if (existing?.length) {
    const ids = existing.map((o) => o.id);
    await supabase.from("order_photos").delete().in("order_id", ids);
    await supabase.from("order_status_events").delete().in("order_id", ids);
    await supabase.from("production_batch_items").delete().in("order_id", ids);
    await supabase.from("orders").delete().in("id", ids);
    console.log(`  Deleted ${ids.length} existing test order(s)\n`);
  }

  for (let i = 0; i < ORDERS.length; i++) {
    const o = ORDERS[i];
    const num = orderNumber();
    const isIntl = o.country.toLowerCase() !== "united states";

    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        order_id:                     num,
        customer_name:                o.name,
        email:                        `test-${Date.now()}-${i}@memoirgems.test`,
        phone:                        "555-000-0000",
        address:                      o.address,
        city:                         o.city,
        state:                        o.state,
        zip:                          o.zip,
        country:                      o.country,
        address_line1:                o.address,
        address_line2:                null,
        state_region:                 o.state,
        postal_code:                  o.zip,
        carrier_preference:           o.carrier,
        tracking_number:              null,
        product_type:                 "2x2 Photo Magnet",
        photo_count:                  o.qty,
        priority:                     o.priority,
        deadline_date:                o.priority === "event_deadline"
          ? new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10)
          : null,
        rush_reason:                  o.priority === "rush"
          ? "Generated rush test order"
          : o.priority === "event_deadline"
            ? "Generated event deadline test"
            : null,
        address_status:               isIntl ? "international_manual_review" : "customer_confirmed",
        address_confirmed_by_customer: true,
        address_validation_message:   isIntl
          ? "International test address — manual review required."
          : "Test address confirmed.",
        order_status:                 "new_order",
        production_status:            "ready_for_batch",
        shipping_status:              "not_ready",
        traffic_light_status:         "yellow",
        customer_visible_status:      "order_received",
        internal_status:              "new_order",
        notes:                        `[TEST] ${o.qty} photos | ${o.priority} | ${o.carrier}${isIntl ? " | INTL" : ""}`,
      })
      .select()
      .single();

    if (error) { console.error(`  ✗ ${o.name}:`, error.message); continue; }

    // Photos
    const photos = Array.from({ length: o.qty }, (_, idx) => ({
      order_id:           order.id,
      order_number:       num,
      photo_url:          photo(idx + i),
      photo_name:         `test-photo-${idx + 1}.jpg`,
      photo_number:       idx + 1,
      photo_status:       "approved_for_print",
      approved_for_print: true,
    }));

    const { error: pe } = await supabase.from("order_photos").insert(photos);
    if (pe) { console.error(`  ✗ photos for ${o.name}:`, pe.message); continue; }

    await supabase.from("order_status_events").insert({
      order_id:            order.id,
      order_number:        num,
      status_key:          "test_order_generated",
      status_label:        "Test order generated",
      visible_to_customer: false,
      internal_note:       `Generated ${o.qty} test photo(s). Status: ready_for_batch.`,
    });

    console.log(`  ✓ ${o.name.padEnd(22)} ${String(o.qty).padStart(3)} photos  ${o.priority.padEnd(14)}  ${o.carrier}${isIntl ? "  🌎" : ""}`);
  }

  console.log("\n✅ Done — go to /admin/batches and create a new batch.");
}

seed().catch(console.error);
