/**
 * lib/productionBackend.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Memoir Gems — Production Backend Core Library
 *
 * Contains:
 *  - Status enums and type definitions for orders, photos, batches
 *  - Inventory and logistics types
 *  - Format-aware batch assignment (reads slot capacity from lib/formats.ts)
 *  - Utility functions used across all admin components
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { ProductFormat, FORMATS } from "./formats";

// ── Legacy constant — kept for backward compatibility with existing components ─────────────────
// New code should use format.slotsPerSheet from lib/formats.ts
export const SHEET_CAPACITY = 12;

// ── Status Enums ───────────────────────────────────────────────────────────────────────────────

/**
 * Internal production statuses — full granular lifecycle.
 * Only visible to staff, never shown to customers.
 */
export const PRODUCTION_STATUSES = [
  "not_started",
  "photos_uploaded",
  "photos_approved",
  "ready_for_batch",
  "batched",
  "printing",
  "printed",
  "cutting",
  "assembly",
  "quality_check",
  "packing",
  "shipped",
  "delivered",
  "issue_review",
] as const;

export const PUBLIC_STATUSES = [
  "order_received",
  "photos_received",
  "in_production",
  "assembly",
  "packing",
  "shipped",
  "delivered",
  "issue_review",
] as const;

export type ProductionStatus = typeof PRODUCTION_STATUSES[number];
export type PublicStatus = typeof PUBLIC_STATUSES[number];

export const INTERNAL_TO_PUBLIC: Record<ProductionStatus, PublicStatus> = {
  not_started:      "order_received",
  photos_uploaded:  "order_received",
  photos_approved:  "photos_received",
  ready_for_batch:  "photos_received",
  batched:          "in_production",
  printing:         "in_production",
  printed:          "in_production",
  cutting:          "in_production",
  assembly:         "assembly",
  quality_check:    "in_production",
  packing:          "packing",
  shipped:          "shipped",
  delivered:        "delivered",
  issue_review:     "issue_review",
};

export const PRIORITY_LABELS: Record<string, string> = {
  standard:         "Standard",
  rush:             "Rush",
  event:            "Event",
  event_deadline:   "Event Deadline",
  b2b:              "B2B",
  business:         "Business",
};

// ── Data Types ────────────────────────────────────────────────────────────────────────────────

export type OrderRow = {
  id: string;
  order_id: string;
  customer_name: string;
  email: string;
  phone: string | null;
  address: string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  city: string | null;
  state?: string | null;
  state_region?: string | null;
  zip?: string | null;
  postal_code?: string | null;
  country?: string | null;
  carrier_preference?: string | null;
  tracking_number?: string | null;
  /** product_type holds the format ID: "2x2" | "4x4" | "2x3" etc. */
  product_type?: string | null;
  photo_count?: number | null;
  order_status?: string | null;
  payment_status?: string | null;
  production_status?: string | null;
  shipping_status?: string | null;
  customer_visible_status?: string | null;
  public_status?: string | null;
  internal_status?: string | null;
  /** priority: standard | rush | event | event_deadline | b2b | business */
  priority?: string | null;
  deadline_date?: string | null;
  rush_reason?: string | null;
  notes?: string | null;
  production_notes?: string | null;
  created_at: string;
};

export type PhotoRow = {
  id: string;
  order_id: string;
  order_number: string;
  photo_url: string;
  photo_name: string | null;
  photo_number?: number | null;
  photo_status?: string | null;
  approved_for_print?: boolean | null;
  batch_id?: string | null;
  created_at?: string;
};

// ── Batch Types ───────────────────────────────────────────────────────────────────────────────

export type ProductionBatch = {
  id: string;
  batch_number: string;
  batch_status: string;
  /** format_id links to lib/formats.ts FORMATS registry */
  format_id?: string | null;
  total_orders: number;
  total_photos: number;
  total_sheets: number;
  photo_paper_needed: number;
  held_photos?: number | null;
  notes?: string | null;
  created_at: string;
  updated_at?: string | null;
};

export type ProductionBatchItem = {
  id: string;
  batch_id: string;
  order_id: string;
  order_number: string;
  order_code: string;
  customer_name: string;
  photo_id: string;
  photo_url: string;
  photo_name: string | null;
  sheet_number: number;
  slot_number: number;
  priority: string | null;
  symbol: string;
  group_color: string;
  item_status?: string | null;
  created_at?: string;
};

// ── Inventory Types ───────────────────────────────────────────────────────────────────────────

export type InventoryStock = {
  format_id: string;
  sheets_on_hand: number;
  sheets_reserved: number;
  sheets_available: number;
  low_stock_threshold: number;
  last_restocked_at?: string | null;
  notes?: string | null;
};

export type MaterialUsage = {
  batch_id: string;
  batch_number: string;
  format_id: string;
  sheets_used: number;
  photos_printed: number;
  waste_sheets: number;
  completed_at: string;
};

export type BatchInventorySummary = {
  format_id: string;
  total_batches: number;
  total_photos: number;
  total_sheets: number;
  average_photos_per_batch: number;
  last_batch_date: string | null;
};

// ── Order / Status Helpers ─────────────────────────────────────────────────────────────────────

/** Human-readable label for a production status */
export function statusLabel(status: string | null | undefined): string {
  const labels: Record<string, string> = {
    not_started:      "Not Started",
    photos_uploaded:  "Photos Uploaded",
    photos_approved:  "Photos Approved",
    ready_for_batch:  "Ready for Batch",
    batched:          "Batched",
    printing:         "Printing",
    printed:          "Printed",
    cutting:          "Cutting",
    assembly:         "Assembly",
    quality_check:    "Quality Check",
    packing:          "Packing",
    shipped:          "Shipped",
    delivered:        "Delivered",
    issue_review:     "Issue Review",
  };
  return labels[status || ""] || (status || "Unknown");
}

/** CSS class name for a status badge */
export function statusBadgeClass(status: string | null | undefined): string {
  const s = status || "";
  if (["shipped", "delivered"].includes(s))       return "badge green";
  if (["batched", "printing", "printed",
       "cutting", "assembly", "quality_check",
       "packing"].includes(s))                    return "badge blue";
  if (s === "issue_review")                       return "badge red";
  if (["photos_approved", "ready_for_batch"].includes(s)) return "badge yellow";
  return "badge gray";
}

/** Derive the public (customer-facing) status string */
export function publicStatusOf(order: OrderRow): string {
  return order.public_status || order.customer_visible_status || "order_received";
}

/** Extract state/region from an order, handling multiple field names */
export function stateOf(order: OrderRow): string | null {
  return order.state_region || order.state || null;
}

/** Extract postal code from an order, handling multiple field names */
export function postalCodeOf(order: OrderRow): string | null {
  return order.postal_code || order.zip || null;
}

/** Determine if an order is shipping internationally */
export function isInternational(order: OrderRow): boolean {
  const country = (order.country || "").toUpperCase().trim();
  return country !== "" && country !== "US" && country !== "USA" && country !== "UNITED STATES";
}

/** Suggest a carrier based on priority and destination */
export function carrierOf(order: OrderRow): string {
  if (isInternational(order)) return "USPS Priority International";
  const p = order.priority || "standard";
  if (p === "rush" || p === "event_deadline") return "USPS Priority";
  return "USPS First Class";
}

// ── Batch Assignment Helpers ───────────────────────────────────────────────────────────────────

const ORDER_CODES = "ABCDEFGHJKLMNPQRSTUVWXYZ";

export function codeForIndex(i: number): string {
  const base = ORDER_CODES.length;
  if (i < base) return ORDER_CODES[i];
  return codeForIndex(Math.floor(i / base) - 1) + ORDER_CODES[i % base];
}

const GROUP_COLORS = [
  "#fef3c7", "#dbeafe", "#dcfce7", "#fce7f3",
  "#ede9fe", "#fee2e2", "#d1fae5", "#fef9c3",
  "#e0f2fe", "#fdf4ff",
];

export function colorForIndex(i: number): string {
  return GROUP_COLORS[i % GROUP_COLORS.length];
}

const SYMBOL_MAP: Record<string, string> = {
  standard:       "\u25cf",
  rush:           "\u26a1",
  event:          "\u2605",
  event_deadline: "\u2605",
  b2b:            "\u25a0",
  business:       "\u25a0",
};

export function symbolForPriority(priority?: string | null): string {
  return SYMBOL_MAP[(priority || "standard").toLowerCase()] || "\u25cf";
}

/** Return true if a photo should be included in the print batch */
export function isApprovedForPrint(photo: PhotoRow): boolean {
  return (
    photo.photo_status === "approved" ||
    photo.photo_status === "approved_for_print" ||
    photo.approved_for_print === true
  );
}

/** Generate a unique batch number based on current timestamp */
export function createBatchNumber(): string {
  const now = new Date();
  const yy  = String(now.getFullYear()).slice(-2);
  const mm  = String(now.getMonth() + 1).padStart(2, "0");
  const dd  = String(now.getDate()).padStart(2, "0");
  const hhmm = String(now.getHours()).padStart(2, "0") + String(now.getMinutes()).padStart(2, "0");
  return `B${yy}${mm}${dd}-${hhmm}`;
}

/** Group batch items by order_code for display */
export function groupByOrder(
  items: Omit<ProductionBatchItem, "id" | "batch_id" | "created_at">[]
): Record<string, typeof items> {
  return items.reduce<Record<string, typeof items>>((acc, item) => {
    if (!acc[item.order_code]) acc[item.order_code] = [];
    acc[item.order_code].push(item);
    return acc;
  }, {});
}

/** Group batch items by sheet_number for the print map */
export function groupBySheet(
  items: ProductionBatchItem[]
): Record<number, ProductionBatchItem[]> {
  return items.reduce<Record<number, ProductionBatchItem[]>>((acc, item) => {
    if (!acc[item.sheet_number]) acc[item.sheet_number] = [];
    acc[item.sheet_number].push(item);
    return acc;
  }, {});
}

/** Sheet numbers that mix 6+ distinct orders — flagged so production can double-check grouping before printing. */
export function highMixWarning(items: ProductionBatchItem[]): number[] {
  const bySheet = groupBySheet(items);
  return Object.entries(bySheet)
    .filter(([, sheetItems]) => new Set(sheetItems.map((i) => i.order_code)).size >= 6)
    .map(([sheetNumber]) => Number(sheetNumber))
    .sort((a, b) => a - b);
}

/** Sheet numbers with fewer than SHEET_CAPACITY slots filled — flagged so production knows not to expect a full sheet. */
export function partialSheetWarning(items: ProductionBatchItem[]): number[] {
  const bySheet = groupBySheet(items);
  return Object.entries(bySheet)
    .filter(([, sheetItems]) => sheetItems.length < SHEET_CAPACITY)
    .map(([sheetNumber]) => Number(sheetNumber))
    .sort((a, b) => a - b);
}

// ── Batch Assignment (format-aware) ───────────────────────────────────────────────────────────────────

/**
 * Assign photos to sheet/slot positions using a sequential cursor.
 *
 * Layout rule:
 *   Each order occupies N photo slots + 1 reserved label card slot.
 *   The label card slot is NOT stored in the DB — it is a gap that the
 *   print map renderer fills with the order info / barcode card.
 *
 * Example (2x2, 12 slots/sheet):
 *   Order A  3 photos  → slots 1,2,3   | label card at slot 4
 *   Order B  5 photos  → slots 5,6,7,8,9 | label card at slot 10
 *   Order C  3 photos  → slots 11,12,13 (sheet 2, slot 1) | label at slot 2
 */
export function assignBatchItems(
  orders: OrderRow[],
  photosByOrder: Record<string, PhotoRow[]>,
  format: ProductFormat = FORMATS["2x2"]
): Omit<ProductionBatchItem, "id" | "batch_id" | "created_at">[] {
  const slotsPerSheet = format.slotsPerSheet;
  const items: Omit<ProductionBatchItem, "id" | "batch_id" | "created_at">[] = [];

  /**
   * cursorPos: 0-based position in the TOTAL slot sequence (across all sheets).
   * Increments once per photo AND once per order (label card gap).
   */
  let cursorPos = 0;

  orders.forEach((order, orderIndex) => {
    const code   = codeForIndex(orderIndex);
    const color  = colorForIndex(orderIndex);
    const symbol = symbolForPriority(order.priority);

    const photos = (photosByOrder[order.order_id] || [])
      .filter(isApprovedForPrint)
      .filter((photo) => !photo.batch_id)
      .sort((a, b) => (a.photo_number ?? 0) - (b.photo_number ?? 0));

    photos.forEach((photo) => {
      items.push({
        order_id:      order.id,
        order_number:  order.order_id,
        order_code:    code,
        customer_name: order.customer_name,
        photo_id:      photo.id,
        photo_url:     photo.photo_url,
        photo_name:    photo.photo_name,
        sheet_number:  Math.floor(cursorPos / slotsPerSheet) + 1,
        slot_number:   (cursorPos % slotsPerSheet) + 1,
        priority:      order.priority || "standard",
        symbol,
        group_color:   color,
        item_status:   "batched",
      });
      cursorPos++;
    });

    // Reserve 1 slot for the label card — skip without storing.
    cursorPos++;
  });

  return items;
}

/** Count photos for an order by order_id string */
export function photoCountFor(orderNumber: string, photosByOrder: Record<string, PhotoRow[]>): number {
  return (photosByOrder[orderNumber] || []).length;
}

/**
 * Summarise open batches by format for the inventory dashboard.
 * Groups active (non-completed) batches by format_id.
 */
export function computeInventorySummary(batches: ProductionBatch[]): BatchInventorySummary[] {
  const byFormat: Record<string, BatchInventorySummary> = {};

  batches.forEach((b) => {
    const fid = b.format_id || "2x2";
    if (!byFormat[fid]) {
      byFormat[fid] = {
        format_id: fid,
        total_batches: 0,
        total_photos: 0,
        total_sheets: 0,
        average_photos_per_batch: 0,
        last_batch_date: null,
      };
    }
    const entry = byFormat[fid];
    entry.total_batches++;
    entry.total_photos += b.total_photos || 0;
    entry.total_sheets += b.photo_paper_needed || b.total_sheets || 0;
    if (b.created_at && (!entry.last_batch_date || b.created_at > entry.last_batch_date)) {
      entry.last_batch_date = b.created_at;
    }
  });

  return Object.values(byFormat).map((entry) => ({
    ...entry,
    average_photos_per_batch: entry.total_batches > 0
      ? Math.round(entry.total_photos / entry.total_batches)
      : 0,
  }));
}
