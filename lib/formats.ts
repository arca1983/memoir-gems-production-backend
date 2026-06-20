/**
 * lib/formats.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Memoir Gems — Product Format Registry
 *
 * Every physical product format is registered here, matching the REAL Canva
 * print templates used by the production machines (public/templates/*.png).
 * Each template is a full 8.5"x11" sheet showing a die-cut octagon grid with
 * an inner rectangular photo area per cell.
 *
 * `inset` values are percentages (of each grid cell) describing where the
 * photo rectangle sits inside the octagon cell: top/right/bottom/left margin.
 *
 * How to add a new format:
 *   1. Drop the template PNG into public/templates/.
 *   2. Add an entry to FORMATS below with its grid + inset geometry.
 *   3. The print-map template will pick it up via formatById().
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type FormatId =
  | "2x2"       // 2" x 2" square magnet      — 3 cols x 4 rows = 12/sheet
  | "2.5x2.5"   // 2.5" x 2.5" square magnet  — 2 cols x 3 rows = 6/sheet
  | "3x3"       // 3" x 3" square magnet       — 2 cols x 2 rows = 4/sheet
  | "2.5x3.5"   // 2.5" x 3.5" rectangular magnet (portrait) — 2 cols x 3 rows = 6/sheet
  | "3x2";      // 3" x 2" landscape magnet   — 2 cols x 3 rows = 6/sheet

export interface FormatInset {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface ProductFormat {
  id: FormatId;
  label: string;
  description: string;
  widthIn: number;
  heightIn: number;
  gridCols: number;
  gridRows: number;
  slotsPerSheet: number;
  paperType: string;
  paperWidthIn: number;
  paperHeightIn: number;
  bleedIn: number;
  unitCostUsd: number;
  defaultCarrierClass: string;
  isActive: boolean;
  /** Path (under /public) to the real Canva print template for this format */
  templateImage: string;
  /** Photo placement inset within each grid cell, as % of cell width/height (fallback default) */
  inset: FormatInset;
  /** Margins of the grid overlay within the full template image, as % of image width/height */
  gridMargins: FormatInset;
  /**
   * Optional per-slot insets (1-indexed by slot number, slot 1 = top-left).
   * The Canva template's octagon cells drift slightly from a perfectly uniform
   * grid, so each cell's photo box can sit at a slightly different inset.
   * If present, overrides `inset` for that slot.
   */
  cellInsets?: FormatInset[];
}

// ── Registry ──────────────────────────────────────────────────────────────────

export const FORMATS: Record<FormatId, ProductFormat> = {

  "2x2": {
    id: "2x2",
    label: "2×2 Photo Magnet",
    description: 'Classic 2" square — our most popular product',
    widthIn: 2,
    heightIn: 2,
    gridCols: 3,
    gridRows: 4,
    slotsPerSheet: 12,
    paperType: "8.5x11 Photo Paper",
    paperWidthIn: 8.5,
    paperHeightIn: 11,
    bleedIn: 0.05,
    unitCostUsd: 0.42,
    defaultCarrierClass: "USPS First Class",
    isActive: true,
    templateImage: "/templates/2x2.png",
    inset: { top: 12, right: 12, bottom: 12, left: 12 },
    gridMargins: { top: 2.65, right: 4.1, bottom: 2.7, left: 4.0 },
    // Per-slot insets measured directly from public/templates/2x2.png.
    // The octagon cells drift slightly per column (left/right) and per row
    // (top/bottom) relative to the uniform CSS grid, so each of the 12 slots
    // gets its own photo-box inset. Slot 1 = row0/col0 (top-left).
    cellInsets: [
      { top: 10, right: 14, bottom: 14, left: 10 }, // slot 1  (row0, col0)
      { top: 10, right: 12, bottom: 14, left: 12 }, // slot 2  (row0, col1)
      { top: 10, right: 10, bottom: 14, left: 14 }, // slot 3  (row0, col2)
      { top: 11, right: 14, bottom: 13, left: 10 }, // slot 4  (row1, col0)
      { top: 11, right: 12, bottom: 13, left: 12 }, // slot 5  (row1, col1)
      { top: 11, right: 10, bottom: 13, left: 14 }, // slot 6  (row1, col2)
      { top: 13, right: 14, bottom: 11, left: 10 }, // slot 7  (row2, col0)
      { top: 13, right: 12, bottom: 11, left: 12 }, // slot 8  (row2, col1)
      { top: 13, right: 10, bottom: 11, left: 14 }, // slot 9  (row2, col2)
      { top: 14, right: 14, bottom: 10, left: 10 }, // slot 10 (row3, col0)
      { top: 14, right: 12, bottom: 10, left: 12 }, // slot 11 (row3, col1)
      { top: 14, right: 10, bottom: 10, left: 14 }, // slot 12 (row3, col2)
    ],
  },

  "2.5x2.5": {
    id: "2.5x2.5",
    label: "2.5×2.5 Photo Magnet",
    description: '2.5" square — mid-size photo magnet',
    widthIn: 2.5,
    heightIn: 2.5,
    gridCols: 2,
    gridRows: 3,
    slotsPerSheet: 6,
    paperType: "8.5x11 Photo Paper",
    paperWidthIn: 8.5,
    paperHeightIn: 11,
    bleedIn: 0.05,
    unitCostUsd: 0.55,
    defaultCarrierClass: "USPS First Class",
    isActive: true,
    templateImage: "/templates/2.5x2.5.png",
    inset: { top: 12, right: 13, bottom: 12, left: 13 },
    gridMargins: { top: 6.15, right: 10.42, bottom: 6.15, left: 10.42 },
    // Per-slot insets measured directly from public/templates/2.5x2.5.png
    cellInsets: [
      { top: 10, right: 17, bottom: 13, left: 10 }, // slot 1 (row0, col0)
      { top: 10, right: 10, bottom: 13, left: 17 }, // slot 2 (row0, col1)
      { top: 12, right: 17, bottom: 11, left: 10 }, // slot 3 (row1, col0)
      { top: 12, right: 10, bottom: 11, left: 17 }, // slot 4 (row1, col1)
      { top: 13, right: 17, bottom: 10, left: 10 }, // slot 5 (row2, col0)
      { top: 13, right: 10, bottom: 10, left: 17 }, // slot 6 (row2, col1)
    ],
  },

  "3x3": {
    id: "3x3",
    label: "3×3 Photo Magnet",
    description: '3" square — premium large format',
    widthIn: 3,
    heightIn: 3,
    gridCols: 2,
    gridRows: 2,
    slotsPerSheet: 4,
    paperType: "8.5x11 Photo Paper",
    paperWidthIn: 8.5,
    paperHeightIn: 11,
    bleedIn: 0.08,
    unitCostUsd: 0.90,
    defaultCarrierClass: "USPS Priority",
    isActive: true,
    templateImage: "/templates/3x3.png",
    inset: { top: 11, right: 11, bottom: 11, left: 11 },
    gridMargins: { top: 14.25, right: 3.7, bottom: 14.3, left: 3.6 },
    // Per-slot insets — calibrate on /admin/template-production?format=3x3
    cellInsets: [
      { top: 10, right: 12, bottom: 12, left: 11 }, // slot 1 (row0, col0)
      { top: 10, right: 10, bottom: 12, left: 12 }, // slot 2 (row0, col1)
      { top: 12, right: 12, bottom: 10, left: 11 }, // slot 3 (row1, col0)
      { top: 12, right: 10, bottom: 10, left: 12 }, // slot 4 (row1, col1)
    ],
  },

  "2.5x3.5": {
    id: "2.5x3.5",
    label: "2.5×3.5 Rectangle Magnet",
    description: '2.5"x3.5" rectangular magnet — portrait format',
    widthIn: 2.5,
    heightIn: 3.5,
    gridCols: 2,
    gridRows: 3,
    slotsPerSheet: 6,
    paperType: "8.5x11 Photo Paper",
    paperWidthIn: 8.5,
    paperHeightIn: 11,
    bleedIn: 0.05,
    unitCostUsd: 0.65,
    defaultCarrierClass: "USPS First Class",
    isActive: true,
    templateImage: "/templates/2.5x3.5.png",
    inset: { top: 9, right: 7, bottom: 10, left: 7 },
    gridMargins: { top: 6.75, right: 2.1, bottom: 6.8, left: 1.95 },
    // Per-slot insets carried over as a starting point — recalibrate on
    // /admin/template-production?format=2.5x3.5 once the real Canva
    // template image replaces the placeholder.
    cellInsets: [
      { top: 8,  right: 8,  bottom: 11, left: 6 }, // slot 1 (row0, col0)
      { top: 8,  right: 6,  bottom: 11, left: 8 }, // slot 2 (row0, col1)
      { top: 9,  right: 8,  bottom: 10, left: 6 }, // slot 3 (row1, col0)
      { top: 9,  right: 6,  bottom: 10, left: 8 }, // slot 4 (row1, col1)
      { top: 10, right: 8,  bottom: 9,  left: 6 }, // slot 5 (row2, col0)
      { top: 10, right: 6,  bottom: 9,  left: 8 }, // slot 6 (row2, col1)
    ],
  },

  "3x2": {
    id: "3x2",
    label: "3×2 Landscape Magnet",
    description: '3"x2" landscape magnet',
    widthIn: 3,
    heightIn: 2,
    gridCols: 2,
    gridRows: 3,
    slotsPerSheet: 6,
    paperType: "8.5x11 Photo Paper",
    paperWidthIn: 8.5,
    paperHeightIn: 11,
    bleedIn: 0.05,
    unitCostUsd: 0.55,
    defaultCarrierClass: "USPS First Class",
    isActive: true,
    templateImage: "/templates/3x2.png",
    inset: { top: 29, right: 20, bottom: 32, left: 23 },
    gridMargins: { top: 0, right: 0.16, bottom: 0.13, left: 0 },
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/** All active formats — use for UI dropdowns */
export const ACTIVE_FORMATS = Object.values(FORMATS).filter((f) => f.isActive);

/** All formats including inactive — use for inventory/admin */
export const ALL_FORMATS = Object.values(FORMATS);

/** Look up a format by its ID. Falls back to 2x2 if unknown. */
export function formatById(id?: string | null): ProductFormat {
  return FORMATS[(id as FormatId) || "2x2"] || FORMATS["2x2"];
}

/**
 * How many full sheets does a given number of photos need?
 * Includes label card slots (1 extra slot per order).
 */
export function sheetsForPhotos(photoCount: number, labelCardCount: number, format: ProductFormat): number {
  const totalSlots = photoCount + labelCardCount;
  return Math.ceil(totalSlots / format.slotsPerSheet);
}

/**
 * Total photo paper sheets needed for a batch (reads max sheet_number).
 */
export function paperSheetsForBatch(items: { slot_number: number; sheet_number: number }[], format: ProductFormat): number {
  if (items.length === 0) return 0;
  return Math.max(...items.map((i) => i.sheet_number));
}

/**
 * Estimated material cost for a batch in USD.
 */
export function estimatedCostForBatch(
  photoCount: number,
  format: ProductFormat
): { perUnit: number; total: number; sheets: number } {
  const sheets = Math.ceil(photoCount / format.slotsPerSheet);
  return {
    perUnit: format.unitCostUsd,
    total: parseFloat((photoCount * format.unitCostUsd).toFixed(2)),
    sheets,
  };
}

/** Human-readable dimensions string, e.g. "2″ × 2″" */
export function formatDimensions(format: ProductFormat): string {
  return `${format.widthIn}″ × ${format.heightIn}″`;
}

/**
 * Given a product_type or format string from an order, resolve to a FormatId.
 * Handles legacy values like "standard", "rush" etc (which default to 2x2).
 */
export function resolveFormatId(productType?: string | null): FormatId {
  if (!productType) return "2x2";
  const cleaned = productType.toLowerCase().trim().replace(/[^a-z0-9.x]/g, "");
  if (cleaned in FORMATS) return cleaned as FormatId;
  // Legacy priority strings default to 2x2
  if (["standard", "rush", "event", "eventdeadline", "b2b", "business"].includes(cleaned)) return "2x2";
  return "2x2";
}
