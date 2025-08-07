import { useSpacesStore } from "../store/spacesStore";
import { calculateGridSize } from "./gridUtils";
import type { Layout } from "react-grid-layout";

export function rearrangeWindows(force: boolean = false) {
  try {
    const spacesState = useSpacesStore.getState();
    const activeSpaceId = spacesState.activeSpaceId;
    const space = spacesState.spaces.find((s) => s.id === activeSpaceId);
    if (!space) return;

    // Proteção contra windows inválidos
    if (!space.windows || !Array.isArray(space.windows)) return;

    const windowCount = space.windows.length;
    if (windowCount === 0) return;

    const { cols } = calculateGridSize(windowCount);
    if (cols <= 0) return;

  const grid: boolean[][] = [];

  const sortedWindows = [...space.windows].sort((a, b) =>
    a.id.localeCompare(b.id)
  );

  const updatedWindows = [];

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
          updatedWindows.push({
            ...win,
            x: col,
            y: row,
            w,
            h,
          });
          placed = true;
          break;
        }
      }
    }
  }

    spacesState.updateSpace(space.id, {
      ...space,
      windows: updatedWindows,
    });
  } catch (error) {
    console.error("[rearrangeWindows] Error rearranging windows:", error);
  }
}

export function rearrangeWindowsFromLayout(
  layout: Layout[],
  force: boolean = false
) {
  try {
    const spacesState = useSpacesStore.getState();
    const activeSpaceId = spacesState.activeSpaceId;
    const space = spacesState.spaces.find((s) => s.id === activeSpaceId);
    
    console.log("[rearrangeWindowsFromLayout] Starting", { activeSpaceId, spaceFound: !!space });
    
    if (!space) {
      console.log("[rearrangeWindowsFromLayout] No space found");
      return;
    }

    // Proteção contra layout inválido
    if (!layout || !Array.isArray(layout)) {
      console.log("[rearrangeWindowsFromLayout] Invalid layout", { layout });
      return;
    }

    const windowCount = layout.length;
    if (windowCount === 0) {
      console.log("[rearrangeWindowsFromLayout] Empty layout");
      return;
    }

    // Proteção contra windows inválidos
    if (!space.windows || !Array.isArray(space.windows)) {
      console.log("[rearrangeWindowsFromLayout] Invalid space.windows", { windows: space.windows });
      return;
    }

    console.log("[rearrangeWindowsFromLayout] Processing", { 
      layoutCount: windowCount, 
      spaceWindowsCount: space.windows.length,
      spaceName: space.name
    });

    const { cols } = calculateGridSize(windowCount);
    if (cols <= 0) {
      console.log("[rearrangeWindowsFromLayout] Invalid cols", { cols });
      return;
    }

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

  const updatedWindows = [];

  const sortedLayout = [...layout].sort((a, b) => {
    if ((a.y ?? 0) !== (b.y ?? 0)) return (a.y ?? 0) - (b.y ?? 0);
    if ((a.x ?? 0) !== (b.x ?? 0)) return (a.x ?? 0) - (b.x ?? 0);
    return a.i.localeCompare(b.i);
  });

  for (const item of sortedLayout) {
    const w = force ? 1 : item.w ?? 1;
    const h = force ? 1 : item.h ?? 1;

    let placed = false;

    for (let row = 0; !placed; row++) {
      ensureGridRows(row + h);
      for (let col = 0; col <= cols - w; col++) {
        if (fitsAt(row, col, w, h)) {
          occupy(row, col, w, h);

          // Procuramos o objeto original para manter outras props
          const win = space.windows.find((w) => w.id === item.i);
          if (!win) continue;

          updatedWindows.push({
            ...win,
            x: col,
            y: row,
            w,
            h,
          });

          placed = true;
          break;
        }
      }
    }
  }

    spacesState.updateSpace(space.id, {
      ...space,
      windows: updatedWindows,
    });
  } catch (error) {
    console.error("[rearrangeWindowsFromLayout] Error rearranging windows from layout:", error);
  }
}
