import { create } from "zustand";
import { useSpacesStore } from "./windowsMainStore";
import type { WindowConfig } from "./types";
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
}

const getQueryParam = (param: string): string | null => {
  if (typeof window === 'undefined') return null; // SSR fallback
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

const setQueryParam = (param: string, value: string) => {
  if (typeof window === 'undefined') return; // SSR fallback
  const urlParams = new URLSearchParams(window.location.search);
  urlParams.set(param, value);
  window.history.replaceState({}, '', `${window.location.pathname}?${urlParams.toString()}`);
};

// Função para detectar mobile no início
const getInitialDiscoveryLimit = () => {
  if (typeof window === 'undefined') return 12; // SSR fallback
  const isMobile = window.innerWidth < 768;

  const paramLimit = getQueryParam('limit');
  if (paramLimit) {
    const limit = parseInt(paramLimit, 10);
    if (!isNaN(limit) && limit > 0) {
      return isMobile ? Math.min(limit, 6) : Math.min(limit, 25);
    }
  }

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

    try {
      await get().loadDiscoveryPage(discoveryOffset, true);
    } catch (error) {
      console.error('[DiscoveryStore] Error in loadDiscovery:', error);
      set({ isLoadingDiscovery: false });
    }
  },

  loadDiscoveryPage: async (newOffset: number, force = false) => {
    const state = get();
    const windowsState = useSpacesStore.getState();

    if (!force && state.isLoadingDiscovery) return;
    set({ isLoadingDiscovery: true });

    const availableSlots = state.discoveryLimit <= 0 ? 0 : state.discoveryLimit;

    if (availableSlots === 0) {
      windowsState.setWindows([]);
      set({ discoveryOffset: 0, isLoadingDiscovery: false });
      return;
    }

    try {
      const response = await fetch(
        `https://api.winturbate.com/roomlist?limit=${availableSlots}&offset=${newOffset}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Valida se a resposta tem a estrutura esperada
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response format');
      }
      
      // Garante que rooms seja um array
      const rooms = Array.isArray(data.rooms) ? data.rooms : [];
      const fetchedRooms = rooms.slice(0, availableSlots);

      const newWindows: WindowConfig[] = fetchedRooms.map((room: string) => ({
        id: room,
        room,
        x: 50,
        y: 50,
        w: 1,
        h: 1,
        width: 800,
        height: 600,
        volume: 0.5,
        isMuted: true,
        isOnline: true,
      }));

      const updatedWindows = arrangeWindowsInternal({
        id: "main",
        name: "Main",
        windows: newWindows,
        zIndexes: Object.fromEntries(
          newWindows.map((w, idx) => [w.id, idx + 1])
        ),
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
    } catch (error) {
      console.error('[DiscoveryStore] Error loading discovery page:', error);
      
      // Em caso de erro, define valores seguros e limpa as janelas
      set({
        discoveryOffset: newOffset,
        isLoadingDiscovery: false,
        totalRooms: 0,
        totalPages: 1,
      });
      
      windowsState.setWindows([]);
    }
  },

  setDiscoveryLimit: (limit) => {
    set({ discoveryLimit: limit, discoveryOffset: 0 });
    setQueryParam('limit', limit.toString());
    get().loadDiscoveryPage(0).catch(error => {
      console.error('[DiscoveryStore] Error in setDiscoveryLimit:', error);
    });
  },

  goToDiscoveryPage: async (page: number) => {
    const state = get();
    const newOffset = (page - 1) * state.discoveryLimit;
    set({ currentPage: page });
    
    try {
      await get().loadDiscoveryPage(newOffset, true);
    } catch (error) {
      console.error('[DiscoveryStore] Error in goToDiscoveryPage:', error);
    }
  },

  setCurrentPage: (page: number) => {
    const state = get();
    if (page < 1 || page > state.totalPages) return;
    set({ currentPage: page });
  },
}));
