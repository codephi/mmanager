import { create } from "zustand";
import type { WindowConfig } from "./types";
import { useSpacesStore } from "./windowsMainStore";

interface WindowsState {
  removeWindow: (id: string) => void;
  updateWindow: (id: string, pos: Partial<WindowConfig>) => void;
}

export const useWindowsStore = create<WindowsState>((_set, _get) => ({
  removeWindow: (id) => {
    const windowsState = useSpacesStore.getState();
    
    // Remove from pinned if it exists
    const isPinned = windowsState.pinnedWindows.some((w) => w.id === id);
    if (isPinned) {
      windowsState.togglePin(id);
    }

    // Remove from windows array
    const updatedWindows = windowsState.windows.filter((w) => w.id !== id);
    windowsState.setWindows(updatedWindows);
    
    // Remove from zIndexes
    const { [id]: _, ...newZIndexes } = windowsState.zIndexes;
    windowsState.zIndexes = newZIndexes;
  },

  updateWindow: (id, pos) => {
    const windowsState = useSpacesStore.getState();
    windowsState.updateWindow(id, pos);
    
    // Also update pinned window if it exists
    const pinnedWindow = windowsState.pinnedWindows.find((w) => w.id === id);
    if (pinnedWindow) {
      windowsState.updatePinnedWindow(id, pos);
    }
  },
}));
