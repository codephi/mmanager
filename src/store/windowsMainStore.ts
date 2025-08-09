import { create } from "zustand";
import type { WindowConfig } from "./types";
import { arrangeWindowsInternal } from "./utils";
import { devtools } from "zustand/middleware";

export type FilterMode = "online" | "offline" | "all";

interface WindowsState {
  windows: WindowConfig[];
  globalMuted: boolean;
  filterMode: FilterMode;
  zIndexes: Record<string, number>;
  bringToFront: (id: string) => void;
  arrangeWindows: () => void;
  setWindowVolume: (windowId: string, volume: number) => void;
  arrangeFilteredWindows: () => void;
  setFilterMode: (mode: FilterMode) => void;
  toggleGlobalMuted: () => void;
  toggleWindowMute: (windowId: string) => void;
  setGlobalMuted: (muted: boolean) => void;
  setWindowMaximized: (id: string, maximized: boolean) => void;
  updateWindow: (windowId: string, updates: Partial<WindowConfig>) => void;
  setWindows: (windows: WindowConfig[]) => void;
}

export const useSpacesStore = create<WindowsState>()(devtools((set, get) => ({
  windows: [],
  globalMuted: false,
  filterMode: "online",
  zIndexes: {},

  bringToFront: (id) => {
    set((state) => {
      const maxZ = Math.max(0, ...Object.values(state.zIndexes));
      return {
        zIndexes: { ...state.zIndexes, [id]: maxZ + 1 },
      };
    });
  },

  arrangeWindows: () => {
    set((state) => {
      const tempSpace = {
        id: "main",
        name: "Main",
        windows: state.windows,
        zIndexes: state.zIndexes,
        autoArrange: true,
      };
      
      const arrangedSpace = arrangeWindowsInternal(tempSpace);
      return {
        windows: arrangedSpace.windows,
        zIndexes: arrangedSpace.zIndexes,
      };
    });
  },

  setWindowVolume: (id, volume) => {
    set((state) => ({
      windows: state.windows.map((win) =>
        win.id === id ? { ...win, volume, isMuted: volume === 0 } : win
      ),
    }));
  },

  arrangeFilteredWindows: () => {
    set((state) => {
      let filteredWindows = state.windows;
      const filterMode = state.filterMode;

      if (filterMode === "online") {
        filteredWindows = filteredWindows.filter((w) => w.isOnline === true);
      } else if (filterMode === "offline") {
        filteredWindows = filteredWindows.filter((w) => w.isOnline === false);
      }

      if (filteredWindows.length === 0) return state;

      const tempSpace = {
        id: "main",
        name: "Main",
        windows: filteredWindows,
        zIndexes: state.zIndexes,
        autoArrange: true,
      };

      const arrangedSpace = arrangeWindowsInternal(tempSpace);
      const arrangedWindows = arrangedSpace.windows;

      const updatedWindows = state.windows.map((win) => {
        const arranged = arrangedWindows.find((w) => w.id === win.id);
        return arranged ? arranged : win;
      });

      return {
        windows: updatedWindows,
        zIndexes: arrangedSpace.zIndexes,
      };
    });
  },

  setFilterMode: (mode) => {
    set({ filterMode: mode });
    get().arrangeFilteredWindows();
  },

  toggleWindowMute: (id) => {
    set((state) => ({
      windows: state.windows.map((win) =>
        win.id === id ? { ...win, isMuted: !win.isMuted } : win
      ),
    }));
  },

  toggleGlobalMuted: () => {
    set((state) => {
      const newMuted = !state.globalMuted;
      return {
        windows: state.windows.map((w) => ({ ...w, isMuted: newMuted })),
        globalMuted: newMuted,
      };
    });
  },

  setGlobalMuted: (muted) => {
    set((state) => ({
      windows: state.windows.map((w) => ({ ...w, isMuted: muted })),
      globalMuted: muted,
    }));
  },

  setWindowMaximized: (id, maximized) => {
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, maximized } : w
      ),
    }));
  },

  updateWindow: (windowId, updates) => {
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === windowId ? { ...w, ...updates } : w
      ),
    }));
  },

  setWindows: (windows) => {
    set({ windows });
  },
})));
