import { create } from "zustand";
import { useSpacesStore } from "./spacesStore";
import type { WindowConfig, SpaceConfig, Room } from "./types";
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
  loadNextDiscovery: () => Promise<void>;
  loadPrevDiscovery: () => Promise<void>;
  setDiscoveryLimit: (limit: number) => void;
  togglePin: (windowId: string) => void;
  addSpaceFromPinned: () => void;
}

export const useDiscoveryStore = create<DiscoveryState>((set, get) => ({
  discoveryOffset: 0,
  isLoadingDiscovery: false,
  discoveryLimit: 12,
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
    const spacesState = useSpacesStore.getState();
    const discovery = spacesState.getSpace("discovery");
    if (!discovery) return;

    if (!force && state.isLoadingDiscovery) return;
    set({ isLoadingDiscovery: true });

    const pinned = spacesState.pinnedWindows; // 🔥 agora vem do global store
    const diffLimitPinned = state.discoveryLimit - pinned.length;
    const availableSlots = diffLimitPinned <= 0 ? 0 : diffLimitPinned;

    if (availableSlots === 0) {
      const updatedDiscovery = arrangeWindowsInternal({
        ...discovery,
        windows: pinned,
        zIndexes: Object.fromEntries(pinned.map((w, idx) => [w.id, idx + 1])),
      });

      spacesState.updateSpace("discovery", updatedDiscovery);

      set({ discoveryOffset: 0, isLoadingDiscovery: false });
      return;
    }

    const response = await fetch(
      `https://chaturbate.com/api/ts/roomlist/room-list/?limit=${availableSlots}&offset=${newOffset}`
    );
    const data = await response.json();

    const fetchedRooms = data.rooms
      .filter((room: Room) => !pinned.some((p) => p.id === room.username))
      .slice(0, availableSlots);

    const newWindows: WindowConfig[] = fetchedRooms.map((room: Room) => ({
      id: room.username,
      room: room.username,
      x: 50,
      y: 50,
      width: 800,
      height: 600,
      volume: 0.5,
      isMuted: true,
    }));

    const updatedDiscovery = arrangeWindowsInternal({
      ...discovery,
      windows: [...pinned, ...newWindows],
      zIndexes: Object.fromEntries([
        ...pinned.map((w) => [w.id, 9999]), // 🔥 aqui você preserva o zIndex do pinned
        ...newWindows.map((w, idx) => [w.id, idx + 1]), // 🔥 só aplica zIndex incremental nos novos
      ]),
    });

    spacesState.updateSpace("discovery", updatedDiscovery);

    const totalRooms = data.total_count || 0;
    const totalPages = Math.ceil(totalRooms / state.discoveryLimit);

    set({
      discoveryOffset: newOffset,
      isLoadingDiscovery: false,
      totalRooms,
      totalPages,
    });
  },

  loadNextDiscovery: async () => {
    const state = get();
    await get().loadDiscoveryPage(state.discoveryOffset + 10, true);
  },

  loadPrevDiscovery: async () => {
    const state = get();
    const newOffset = Math.max(0, state.discoveryOffset - 10);
    await get().loadDiscoveryPage(newOffset, true);
  },

  setDiscoveryLimit: (limit) => {
    set({ discoveryLimit: limit, discoveryOffset: 0 });
    get().loadDiscoveryPage(0);
  },

  togglePin: (windowId: string) => {
    const spacesState = useSpacesStore.getState();
    spacesState.togglePin(windowId); // 🔥 delega completamente pro spacesStore
  },

  addSpaceFromPinned: () => {
    const spacesState = useSpacesStore.getState();
    const pinnedWindows = spacesState.pinnedWindows;
    if (pinnedWindows.length === 0) return;

    const id = Math.random().toString(36).substring(2, 9);
    const totalSpaces = spacesState.getSpaces().length;
    const finalName = `Space ${totalSpaces + 1}`;

    const newSpace: SpaceConfig = {
      id,
      name: finalName,
      windows: pinnedWindows.map((w) => ({ ...w, pinned: undefined })),
      zIndexes: Object.fromEntries(
        pinnedWindows.map((w, idx) => [w.id, idx + 1])
      ),
      autoArrange: true,
    };

    spacesState.addSpace(finalName);
    spacesState.updateSpace(id, newSpace);
  },

  goToDiscoveryPage: async (page: number) => {
    const state = get();
    const newOffset = (page - 1) * state.discoveryLimit;
    await get().loadDiscoveryPage(newOffset, true);

    set({ currentPage: page });
  },

  setCurrentPage: (page: number) => {
    const state = get();
    if (page < 1 || page > state.totalPages) return;
    set({ currentPage: page });
  },
}));
