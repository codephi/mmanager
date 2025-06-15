import { create } from "zustand";
import type { SpaceConfig, WindowConfig } from "./types";
import { arrangeWindowsInternal, generateId } from "./utils";
import { useSpacesStore } from "./spacesStore";

interface WindowsState {
  addWindow: (room: string) => void;
  removeWindow: (id: string) => void;
  updateWindow: (id: string, pos: Partial<WindowConfig>) => void;
  setMaximized: (id: string, maximized: boolean) => void;
}

export const useWindowsStore = create<WindowsState>((set, _get) => ({
  addWindow: (room) => {
    const spacesState = useSpacesStore.getState();
    const activeSpaceId = spacesState.getActiveSpaceId();

    if (!activeSpaceId) return;

    const space = spacesState.getSpace(activeSpaceId);
    if (!space) return;

    const alreadyExists = space.windows.some((w) => w.room === room);
    if (alreadyExists) return;

    const id = generateId();
    const maxZ = Math.max(0, ...Object.values(space.zIndexes));

    const newWindow: WindowConfig = {
      id,
      room,
      x: 50,
      y: 50,
      w: 1,
      h: 1,
      width: 800,
      height: 600,
      pinnedX: 250,
      pinnedY: 250,
      pinnedWidth: 1,
      pinnedHeight: 1,
    };

    const updatedSpace: SpaceConfig = {
      ...space,
      windows: [...space.windows, newWindow],
      zIndexes: { ...space.zIndexes, [id]: maxZ + 1 },
    };

    const finalSpace = updatedSpace.autoArrange
      ? arrangeWindowsInternal(updatedSpace)
      : updatedSpace;

    spacesState.updateSpace(space.id, finalSpace);
  },

  removeWindow: (id) => {
    const spacesState = useSpacesStore.getState();
    const activeSpaceId = spacesState.getActiveSpaceId();

    if (!activeSpaceId) return;

    const space = spacesState.getSpace(activeSpaceId);
    if (!space) return;

    // Remover o ID também dos pinnedWindows, se existir
    const isPinned = spacesState.pinnedWindows.some((w) => w.id === id);
    if (isPinned) {
      spacesState.togglePin(id);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [id]: _, ...newZIndexes } = space.zIndexes;

    const updatedSpace: SpaceConfig = {
      ...space,
      windows: space.windows.filter((w) => w.id !== id),
      zIndexes: newZIndexes,
    };

    const finalSpace = updatedSpace;

    spacesState.updateSpace(space.id, finalSpace);
  },

  updateWindow: (id, pos) => {
    const spacesState = useSpacesStore.getState();
    const activeSpaceId = spacesState.getActiveSpaceId();

    if (!activeSpaceId) return;

    const space = spacesState.getSpace(activeSpaceId);
    if (!space) return;

    const updatedWindows = space.windows.map((w) =>
      w.id === id ? { ...w, ...pos } : w
    );

    const updatedSpace: SpaceConfig = {
      ...space,
      windows: updatedWindows,
    };

    spacesState.updateSpace(space.id, updatedSpace);

    // Agora também atualizamos o pinnedWindows se existir
    const pinnedWindow = spacesState.pinnedWindows.find((w) => w.id === id);
    if (pinnedWindow) {
      spacesState.updatePinnedWindow(id, pos);
    }
  },

  setMaximized: (id, maximized) => {
    useWindowsStore.getState().updateWindow(id, { maximized });
  },
}));
