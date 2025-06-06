import { useSpacesStore } from "../store/spacesStore";

export function rearrangeWindows(force: boolean = false) {
  const spacesState = useSpacesStore.getState();
  const activeSpaceId = spacesState.activeSpaceId;
  const space = spacesState.spaces.find((s) => s.id === activeSpaceId);
  if (!space) return;

  const windowCount = space.windows.length;
  const maxPerRow = 6;
  const cols =
    windowCount <= 6 ? windowCount : windowCount <= 12 ? 4 : maxPerRow;

  // Ordenamos as janelas para manter estabilidade
  const sortedWindows = [...space.windows].sort((a, b) =>
    a.id.localeCompare(b.id)
  );

  let currentX = 0;
  let currentY = 0;
  let rowMaxHeight = 1;

  const updatedWindows = [];

  for (const win of sortedWindows) {
    // Se for force, reseta tamanho
    const w = force ? 1 : win.w ?? 1;
    const h = force ? 1 : win.h ?? 1;

    if (currentX + w > cols) {
      currentX = 0;
      currentY += rowMaxHeight;
      rowMaxHeight = h;
    }

    updatedWindows.push({
      ...win,
      x: currentX,
      y: currentY,
      w,
      h,
    });

    currentX += w;
    rowMaxHeight = Math.max(rowMaxHeight, h);
  }

  spacesState.updateSpace(space.id, {
    ...space,
    windows: updatedWindows,
  });
}
