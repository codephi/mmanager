import { create } from "zustand";
import type { SpaceConfig, WindowConfig } from "./types";
import { useSpacesStore } from "./spacesStore";

interface WindowsState {
  removeWindow: (id: string) => void;
  updateWindow: (id: string, pos: Partial<WindowConfig>) => void;
}

export const useWindowsStore = create<WindowsState>((_set, _get) => ({
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

    console.log("Updating window:", id, pos);
    spacesState.updateSpace(space.id, updatedSpace);

    // Agora também atualizamos o pinnedWindows se existir
    const pinnedWindow = spacesState.pinnedWindows.find((w) => w.id === id);
    if (pinnedWindow) {
      spacesState.updatePinnedWindow(id, pos);
    }
  },
}));
