import { useSpacesStore } from "../store/windowsMainStore";
import { calculateGridSize } from "./gridUtils";
import type { Layout } from "react-grid-layout";

export function rearrangeWindows(force: boolean = false) {
  try {
    const windowsState = useSpacesStore.getState();
    const windows = windowsState.windows;

    if (!windows || !Array.isArray(windows)) return;

    const windowCount = windows.length;
    if (windowCount === 0) return;

    const { cols } = calculateGridSize(windowCount);
    if (cols <= 0) return;

    const grid: boolean[][] = [];
    const sortedWindows = [...windows].sort((a, b) => a.id.localeCompare(b.id));

    function ensureGridRows(rows: number) {
      while (grid.length < rows) {
        grid.push(new Array(cols).fill(false));
      }
    }

    function fitsAt(row: number, col: number, w: number, h: number): boolean {
      ensureGridRows(row + h);
      for (let y = row; y < row + h; y++) {
        for (let x = col; x < col + w; x++) {
          if (x >= cols || grid[y][x]) {
            return false;
          }
        }
      }
      return true;
    }

    function occupy(row: number, col: number, w: number, h: number) {
      for (let y = row; y < row + h; y++) {
        for (let x = col; x < col + w; x++) {
          grid[y][x] = true;
        }
      }
    }

    for (const win of sortedWindows) {
      const w = force ? 1 : win.w ?? 1;
      const h = force ? 1 : win.h ?? 1;

      let placed = false;
      for (let row = 0; !placed; row++) {
        ensureGridRows(row + h);
        for (let col = 0; col <= cols - w; col++) {
          if (fitsAt(row, col, w, h)) {
            occupy(row, col, w, h);
            windowsState.updateWindow(win.id, {
              x: col,
              y: row,
              w,
              h,
              maximized: force ? false : (win.maximized || false),
            });
            placed = true;
            break;
          }
        }
      }
    }
  } catch (error) {
    console.error("[rearrangeWindows] Error rearranging windows:", error);
  }
}

export function rearrangeWindowsFromLayout(
  layout: Layout[],
  force: boolean = false
) {
  try {
    const windowsState = useSpacesStore.getState();
    const windows = windowsState.windows;

    if (!layout || !Array.isArray(layout)) return;
    if (!windows || !Array.isArray(windows)) return;

    const windowCount = layout.length;
    if (windowCount === 0) return;

    const { cols } = calculateGridSize(windowCount);
    if (cols <= 0) return;

    const grid: boolean[][] = [];

    function ensureGridRows(rows: number) {
      while (grid && grid.length < rows) {
        grid.push(new Array(cols).fill(false));
      }
    }

    function fitsAt(row: number, col: number, w: number, h: number): boolean {
      ensureGridRows(row + h);
      for (let y = row; y < row + h; y++) {
        for (let x = col; x < col + w; x++) {
          if (x >= cols || grid[y][x]) {
            return false;
          }
        }
      }
      return true;
    }

    function occupy(row: number, col: number, w: number, h: number) {
      for (let y = row; y < row + h; y++) {
        for (let x = col; x < col + w; x++) {
          grid[y][x] = true;
        }
      }
    }

    const sortedLayout = [...layout].sort((a, b) => {
      if ((a.y ?? 0) !== (b.y ?? 0)) return (a.y ?? 0) - (b.y ?? 0);
      if ((a.x ?? 0) !== (b.x ?? 0)) return (a.x ?? 0) - (b.x ?? 0);
      return a.i.localeCompare(b.i);
    });

    for (const item of sortedLayout) {
      const win = windows.find((w) => w.id === item.i);
      if (!win) continue;

      const w = force ? 1 : item.w ?? 1;
      const h = force ? 1 : item.h ?? 1;

      let placed = false;
      for (let row = 0; !placed; row++) {
        ensureGridRows(row + h);
        for (let col = 0; col <= cols - w; col++) {
          if (fitsAt(row, col, w, h)) {
            occupy(row, col, w, h);
            windowsState.updateWindow(win.id, {
              x: col,
              y: row,
              w,
              h,
              maximized: force ? false : (win.maximized || false),
            });
            placed = true;
            break;
          }
        }
      }
    }
  } catch (error) {
    console.error("[rearrangeWindowsFromLayout] Error rearranging windows from layout:", error);
  }
}
