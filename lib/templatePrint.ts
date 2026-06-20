export const TEMPLATE_W = 1545;
export const TEMPLATE_H = 2000;
export const LETTER_W = 8.5;
export const LETTER_H = 11;

export const PHOTO_W_PX = 380;
export const PHOTO_H_PX = 390;

export const slotPx = [
  { x: 109, y: 100 }, { x: 593, y: 100 }, { x: 1076, y: 100 },
  { x: 109, y: 580 }, { x: 593, y: 580 }, { x: 1076, y: 580 },
  { x: 109, y: 1060 }, { x: 593, y: 1060 }, { x: 1076, y: 1060 },
  { x: 109, y: 1540 }, { x: 593, y: 1540 }, { x: 1076, y: 1540 },
];

export const pxToInX = (px: number) => `${((px / TEMPLATE_W) * LETTER_W).toFixed(4)}in`;
export const pxToInY = (px: number) => `${((px / TEMPLATE_H) * LETTER_H).toFixed(4)}in`;

export function slotToRowCol(slot: number) {
  return { row: Math.floor((slot - 1) / 3), col: (slot - 1) % 3 };
}

const GX = 44;
const GY = 34;

export type RowOutline = {
  leftPx: number;
  topPx: number;
  widthPx: number;
  heightPx: number;
  row: number;
  isFirstRow: boolean;
};

export function rowOutlinesForSlots(slots: number[]): RowOutline[] {
  const rowMap = new Map<number, number[]>();
  slots.forEach((slot) => {
    const { row } = slotToRowCol(slot);
    rowMap.set(row, [...(rowMap.get(row) || []), slot]);
  });

  const sortedRows = Array.from(rowMap.keys()).sort((a, b) => a - b);
  const firstRow = sortedRows[0];

  return sortedRows.map((row) => {
    const rowSlots = rowMap.get(row)!;
    const cols = rowSlots.map((slot) => slotToRowCol(slot).col);
    const minCol = Math.min(...cols);
    const maxCol = Math.max(...cols);
    const leftPhotoX = slotPx[minCol + row * 3].x;
    const rightPhotoX = slotPx[maxCol + row * 3].x + PHOTO_W_PX;
    const topPhotoY = slotPx[row * 3].y;
    const bottomPhotoY = topPhotoY + PHOTO_H_PX;
    const left = Math.max(2, leftPhotoX - GX);
    const top = Math.max(2, topPhotoY - GY);
    const right = Math.min(TEMPLATE_W - 2, rightPhotoX + GX);
    const bottom = Math.min(TEMPLATE_H - 2, bottomPhotoY + GY);

    return {
      leftPx: left,
      topPx: top,
      widthPx: right - left,
      heightPx: bottom - top,
      row,
      isFirstRow: row === firstRow,
    };
  });
}

