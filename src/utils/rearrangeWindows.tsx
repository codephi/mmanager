import { useSpacesStore } from "../store/spacesStore";
import { calculateGridSize } from "./gridUtils";

export function rearrangeWindows(force: boolean = false) {
  const spacesState = useSpacesStore.getState();
  const activeSpaceId = spacesState.activeSpaceId;
  const space = spacesState.spaces.find((s) => s.id === activeSpaceId);
  if (!space) return;

  const windowCount = space.windows.length;
  const { rows, cols } = calculateGridSize(windowCount); // <- Agora usamos o novo algoritmo

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
}
