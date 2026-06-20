/**
 * POST /api/admin/rebuild-batch
 * ─────────────────────────────────────────────────────────────────────────────
 * Memoir Gems — Rebuild batch items with corrected slot assignments.
 *
 * Existing items are deleted, photos are unlinked, then assignBatchItems()
 * re-runs with the fixed cursorPos logic (reserves 1 gap slot per order
 * for the label card). Photos and items are then re-inserted.
 *
 * Body: { batchId: string }
 * Returns: { success: true, itemCount: number } | { error: string }
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  OrderRow,
  PhotoRow,
  assignBatchItems,
} from "@/lib/productionBackend";

// Use publishable key — RLS on these internal tables allows full CRUD.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export async function POST(req: NextRequest) {
  let batchId: string;
  try {
    ({ batchId } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!batchId) {
    return NextResponse.json({ error: "batchId is required" }, { status: 400 });
  }

  // ── 1. Fetch existing batch items ─────────────────────────────────────────
  const { data: existingItems, error: fetchErr } = await supabase
    .from("production_batch_items")
    .select("order_id, photo_id")
    .eq("batch_id", batchId);

  if (fetchErr) {
    return NextResponse.json({ error: fetchErr.message }, { status: 500 });
  }

  if (!existingItems || existingItems.length === 0) {
    return NextResponse.json({ error: "No items found for this batch" }, { status: 404 });
  }

  const orderIds = [...new Set(existingItems.map((i: { order_id: string }) => i.order_id))];
  const photoIds = existingItems.map((i: { photo_id: string }) => i.photo_id);

  // ── 2. Fetch orders ───────────────────────────────────────────────────────
  const { data: orders, error: ordersErr } = await supabase
    .from("orders")
    .select("*")
    .in("id", orderIds)
    .order("created_at", { ascending: true });

  if (ordersErr) {
    return NextResponse.json({ error: ordersErr.message }, { status: 500 });
  }

  // ── 3. Delete existing batch items ────────────────────────────────────────
  const { error: deleteItemsErr } = await supabase
    .from("production_batch_items")
    .delete()
    .eq("batch_id", batchId);

  if (deleteItemsErr) {
    return NextResponse.json({ error: `Delete items failed: ${deleteItemsErr.message}` }, { status: 500 });
  }

  // ── 4. Clear batch_id from photos so assignBatchItems picks them up ───────
  const { error: clearPhotosErr } = await supabase
    .from("order_photos")
    .update({ batch_id: null, photo_status: "approved" })
    .in("id", photoIds);

  if (clearPhotosErr) {
    return NextResponse.json({ error: `Clear photos failed: ${clearPhotosErr.message}` }, { status: 500 });
  }

  // ── 5. Fetch photos (now unbatched, will pass !photo.batch_id filter) ─────
  const { data: photos, error: photosErr } = await supabase
    .from("order_photos")
    .select("*")
    .in("id", photoIds);

  if (photosErr) {
    return NextResponse.json({ error: photosErr.message }, { status: 500 });
  }

  // ── 6. Run assignBatchItems with corrected cursorPos logic ────────────────
  const photosByOrder = (photos || []).reduce<Record<string, PhotoRow[]>>((acc, photo: PhotoRow) => {
    const key = photo.order_number;
    if (!acc[key]) acc[key] = [];
    acc[key].push(photo);
    return acc;
  }, {});

  const newItems = assignBatchItems(orders as OrderRow[], photosByOrder);

  if (newItems.length === 0) {
    return NextResponse.json({ error: "assignBatchItems returned 0 items — check order/photo data" }, { status: 500 });
  }

  const itemRows = newItems.map((item) => ({ ...item, batch_id: batchId }));

  // ── 7. Insert rebuilt batch items ─────────────────────────────────────────
  const { error: insertErr } = await supabase
    .from("production_batch_items")
    .insert(itemRows);

  if (insertErr) {
    return NextResponse.json({ error: `Insert failed: ${insertErr.message}` }, { status: 500 });
  }

  // ── 8. Re-link photos to this batch ──────────────────────────────────────
  const { error: relinkErr } = await supabase
    .from("order_photos")
    .update({ batch_id: batchId, photo_status: "batched" })
    .in("id", photoIds);

  if (relinkErr) {
    // Non-fatal — items are correct, just photo_status didn't update
    console.warn("Relink photos warning:", relinkErr.message);
  }

  return NextResponse.json({ success: true, itemCount: itemRows.length });
}
