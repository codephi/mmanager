import type { SpaceConfig } from "./types";

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export const arrangeWindowsInternal = (space: SpaceConfig): SpaceConfig => {
  const total = space.windows.length;
  if (total === 0) return space;

  const padding = { top: 10, bottom: 60, left: 10, right: 10 };
  const screenWidth = window.innerWidth - padding.left - padding.right;
  const screenHeight = window.innerHeight - padding.top - padding.bottom;
  const cols = Math.ceil(Math.sqrt(total));
  const rows = Math.ceil(total / cols);
  const cellSize = Math.floor(
    Math.min(screenWidth / cols, screenHeight / rows)
  );

  const newWindows = space.windows.map((win, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    return {
      ...win,
      x: padding.left + col * cellSize,
      y: padding.top + row * cellSize,
      width: cellSize,
      height: cellSize,
      w: 1,
      h: 1,
    };
  });

  return { ...space, windows: newWindows };
};
