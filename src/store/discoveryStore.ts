import { create } from "zustand";
import { useSpacesStore } from "./windowsMainStore";
import type { WindowConfig, Room } from "./types";
import { arrangeWindowsInternal } from "./utils";

interface DiscoveryState {
  discoveryOffset: number;
  totalRooms: number;
  totalPages: number;
  isLoadingDiscovery: boolean;
  discoveryLimit: number;
  currentPage: number;
  setCurrentPage?: (page: number) => void;
  goToDiscoveryPage: (page: number) => Promise<void>;
  loadDiscoveryPage: (offset: number, force?: boolean) => Promise<void>;
  loadDiscovery: () => Promise<void>;
  setDiscoveryLimit: (limit: number) => void;
  resetDiscoveryLimit: () => void;
  togglePin: (windowId: string) => void;
  addSpaceFromPinned: () => void;
}

// Função para detectar mobile no início
const getInitialDiscoveryLimit = () => {
  if (typeof window === 'undefined') return 12; // SSR fallback
  const isMobile = window.innerWidth < 768;
  return isMobile ? 6 : 12;
};

export const useDiscoveryStore = create<DiscoveryState>((set, get) => ({
  discoveryOffset: 0,
  isLoadingDiscovery: false,
  discoveryLimit: getInitialDiscoveryLimit(),
  totalPages: 1,
  totalRooms: 0,
  currentPage: 1,

  loadDiscovery: async () => {
    const { discoveryOffset, isLoadingDiscovery } = get();
    if (isLoadingDiscovery) return;

    set({ isLoadingDiscovery: true });

    await get().loadDiscoveryPage(discoveryOffset, true);

    set({ isLoadingDiscovery: false });
  },

  loadDiscoveryPage: async (newOffset: number, force = false) => {
    const state = get();
    const windowsState = useSpacesStore.getState();

    if (!force && state.isLoadingDiscovery) return;
    set({ isLoadingDiscovery: true });

    const pinned = windowsState.pinnedWindows;
    const availableSlots = state.discoveryLimit <= 0 ? 0 : state.discoveryLimit;

    if (availableSlots === 0) {
      const updatedWindows = arrangeWindowsInternal({
        id: "main",
        name: "Main",
        windows: pinned,
        zIndexes: Object.fromEntries(pinned.map((w, idx) => [w.id, idx + 1])),
        autoArrange: true,
      });

      windowsState.setWindows(updatedWindows.windows);

      set({ discoveryOffset: 0, isLoadingDiscovery: false });
      return;
    }

    const response = await fetch(
      `https://api.winturbate.com/roomlist?limit=${availableSlots}&offset=${newOffset}`
    );
    const data = await response.json();

    const fetchedRooms = data.rooms.slice(0, availableSlots);

    const newWindows: WindowConfig[] = fetchedRooms.map((room: Room) => ({
      id: room.username,
      room: room.username,
      x: 50,
      y: 50,
      w: 1,
      h: 1,
      width: 800,
      height: 600,
      volume: 0.5,
      isMuted: true,
      pinnedX: 50,
      pinnedY: 50,
      pinnedWidth: 350,
      pinnedHeight: 250,
      pinned: false,
      isOnline: true,
    }));

    const updatedWindows = arrangeWindowsInternal({
      id: "main",
      name: "Main",
      windows: newWindows,
      zIndexes: Object.fromEntries([
        ...pinned.map((w) => [w.id, 9999]),
        ...newWindows.map((w, idx) => [w.id, idx + 1]),
      ]),
      autoArrange: true,
    });

    windowsState.setWindows(updatedWindows.windows);

    const totalRooms = data.total_count || 0;
    const totalPages = Math.ceil(totalRooms / state.discoveryLimit);

    set({
      discoveryOffset: newOffset,
      isLoadingDiscovery: false,
      totalRooms,
      totalPages,
    });
  },

  setDiscoveryLimit: (limit) => {
    set({ discoveryLimit: limit, discoveryOffset: 0 });
    get().loadDiscoveryPage(0);
  },

  resetDiscoveryLimit: () => {
    const newLimit = getInitialDiscoveryLimit();
    set({ discoveryLimit: newLimit, discoveryOffset: 0 });
    get().loadDiscoveryPage(0);
  },

  togglePin: (windowId: string) => {
    const windowsState = useSpacesStore.getState();
    windowsState.togglePin(windowId);
  },

  addSpaceFromPinned: () => {
    // Esta funcionalidade não é mais necessária em um sistema sem múltiplos spaces
    console.log("addSpaceFromPinned não é mais suportado");
  },

  goToDiscoveryPage: async (page: number) => {
    const state = get();
    const newOffset = (page - 1) * state.discoveryLimit;
    set({ currentPage: page });
    await get().loadDiscoveryPage(newOffset, true);

  },

  setCurrentPage: (page: number) => {
    const state = get();
    if (page < 1 || page > state.totalPages) return;
    set({ currentPage: page });
  },
}));
