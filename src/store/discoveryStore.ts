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
  // Query string management methods
  initializeFromQueryParams: () => void;
  updateQueryParams: (page?: number, limit?: number) => void;
  setCurrentPage: (page: number) => void;
  setDiscoveryLimit: (limit: number) => void;
  goToDiscoveryPage: (page: number) => Promise<void>;
  loadDiscoveryPage: (offset: number, force?: boolean) => Promise<void>;
  loadDiscovery: () => Promise<void>;
}

const getQueryParam = (param: string): string | null => {
  if (typeof window === 'undefined') return null; // SSR fallback
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

const updateQueryParams = (page?: number, limit?: number, replace = true) => {
  if (typeof window === 'undefined') return; // SSR fallback
  
  const urlParams = new URLSearchParams(window.location.search);
  
  // Remove parâmetros se forem valores padrão
  if (page !== undefined) {
    if (page > 1) {
      urlParams.set('page', page.toString());
    } else {
      urlParams.delete('page');
    }
  }
  
  if (limit !== undefined) {
    const defaultLimit = getDefaultLimit();
    if (limit !== defaultLimit) {
      urlParams.set('limit', limit.toString());
    } else {
      urlParams.delete('limit');
    }
  }
  
  const newUrl = `${window.location.pathname}${urlParams.toString() ? '?' + urlParams.toString() : ''}`;
  
  if (replace) {
    window.history.replaceState({}, '', newUrl);
  } else {
    window.history.pushState({}, '', newUrl);
  }
};

// Detecta o contexto inicial uma única vez para manter consistência
const getInitialDefaultLimit = () => {
  if (typeof window === 'undefined') return 12; // SSR fallback
  const isMobile = window.innerWidth < 768;
  return isMobile ? 6 : 12;
};

// Armazena o padrão detectado inicialmente para manter consistência
// Isso garante que URLs sejam previsíveis independente de redimensionamentos
const INITIAL_DEFAULT_LIMIT = getInitialDefaultLimit();

// Função para retornar o limite padrão fixo (baseado no contexto inicial)
const getDefaultLimit = () => INITIAL_DEFAULT_LIMIT;

// Função auxiliar para detectar mobile dinamicamente (para validações de limite máximo)
const getCurrentDeviceType = () => {
  if (typeof window === 'undefined') return 'desktop';
  return window.innerWidth < 768 ? 'mobile' : 'desktop';
};

// Função para inicializar valores a partir da query string
const getInitialValues = () => {
  const defaultLimit = getDefaultLimit();
  const deviceType = getCurrentDeviceType();
  
  const paramPage = getQueryParam('page');
  const paramLimit = getQueryParam('limit');
  
  let currentPage = 1;
  if (paramPage) {
    const page = parseInt(paramPage, 10);
    if (!isNaN(page) && page > 0) {
      currentPage = page;
    }
  }
  
  let discoveryLimit = defaultLimit;
  if (paramLimit) {
    const limit = parseInt(paramLimit, 10);
    if (!isNaN(limit) && limit > 0) {
      // Aplica limites máximos baseados no tipo de dispositivo atual
      // Isso preserva responsividade para validações de segurança
      discoveryLimit = deviceType === 'mobile' ? Math.min(limit, 25) : Math.min(limit, 50);
    }
  }
  
  return {
    currentPage,
    discoveryLimit,
    discoveryOffset: (currentPage - 1) * discoveryLimit
  };
};


export const useDiscoveryStore = create<DiscoveryState>((set, get) => {
  // Initialize from query params
  const initialValues = getInitialValues();
  
  // Listen for browser navigation (back/forward)
  if (typeof window !== 'undefined') {
    const handlePopstate = () => {
      // Re-initialize from query params when user navigates
      const store = get();
      store.initializeFromQueryParams();
      
      // Reload data with new params
      const updatedState = get();
      store.loadDiscoveryPage(updatedState.discoveryOffset, true).catch(error => {
        console.error('[DiscoveryStore] Error in popstate handler:', error);
      });
    };
    
    window.addEventListener('popstate', handlePopstate);
    
    // Cleanup function would be called if we had a way to destroy the store
    // For now, this will persist for the application lifetime
  }
  
  return {
    discoveryOffset: initialValues.discoveryOffset,
    isLoadingDiscovery: false,
    discoveryLimit: initialValues.discoveryLimit,
    totalPages: 1,
    totalRooms: 0,
    currentPage: initialValues.currentPage,

    // Initialize state from query parameters
    initializeFromQueryParams: () => {
      const values = getInitialValues();
      set({
        currentPage: values.currentPage,
        discoveryLimit: values.discoveryLimit,
        discoveryOffset: values.discoveryOffset,
      });
    },

    // Update query parameters in URL
    updateQueryParams: (page?: number, limit?: number) => {
      const state = get();
      updateQueryParams(
        page !== undefined ? page : state.currentPage,
        limit !== undefined ? limit : state.discoveryLimit
      );
    },

    loadDiscovery: async () => {
      const { isLoadingDiscovery } = get();
      if (isLoadingDiscovery) return;

      // Initialize from query params before loading
      get().initializeFromQueryParams();
      const updatedState = get();

      set({ isLoadingDiscovery: true });

      try {
        await get().loadDiscoveryPage(updatedState.discoveryOffset, true);
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

  setDiscoveryLimit: async (limit) => {
    const state = get();
    
    // Primeiro, vamos estimar o total de páginas com o novo limite
    // Para isso, precisamos do total de rooms atual
    let estimatedTotalPages = 1;
    if (state.totalRooms > 0) {
      estimatedTotalPages = Math.ceil(state.totalRooms / limit);
    }
    
    // Tenta manter a página atual se ela for válida com o novo limite
    let targetPage = state.currentPage;
    
    // Se a página atual não for válida com o novo limite, vai para a página 1
    if (targetPage > estimatedTotalPages) {
      targetPage = 1;
    }
    
    const newOffset = (targetPage - 1) * limit;
    
    // Atualiza o estado temporariamente
    set({ 
      discoveryLimit: limit, 
      discoveryOffset: newOffset,
      currentPage: targetPage
    });
    
    // Update URL com merge inteligente - mantém a página se válida
    get().updateQueryParams(targetPage, limit);
    
    // Load new data - isso vai recalcular totalPages correto
    try {
      await get().loadDiscoveryPage(newOffset, true);
      
      // Após carregar, verifica se a página ainda é válida com os dados reais
      const updatedState = get();
      if (updatedState.currentPage > updatedState.totalPages && updatedState.totalPages > 0) {
        // Se a página atual não é mais válida, vai para a última página disponível
        const finalPage = updatedState.totalPages;
        const finalOffset = (finalPage - 1) * limit;
        
        set({ 
          currentPage: finalPage,
          discoveryOffset: finalOffset
        });
        
        // Atualiza URL novamente com a página final
        get().updateQueryParams(finalPage, limit);
        
        // Carrega dados da página final
        await get().loadDiscoveryPage(finalOffset, true);
      }
    } catch (error) {
      console.error('[DiscoveryStore] Error in setDiscoveryLimit:', error);
    }
  },

  goToDiscoveryPage: async (page: number) => {
    const state = get();
    
    // Validate page bounds
    if (page < 1 || (state.totalPages > 0 && page > state.totalPages)) {
      console.warn(`[DiscoveryStore] Invalid page ${page}, total pages: ${state.totalPages}`);
      return;
    }
    
    const newOffset = (page - 1) * state.discoveryLimit;
    
    set({ currentPage: page, discoveryOffset: newOffset });
    
    // Update URL
    get().updateQueryParams(page, undefined);
    
    try {
      await get().loadDiscoveryPage(newOffset, true);
    } catch (error) {
      console.error('[DiscoveryStore] Error in goToDiscoveryPage:', error);
    }
  },

  setCurrentPage: (page: number) => {
    const state = get();
    
    // Validate page bounds
    if (page < 1 || (state.totalPages > 0 && page > state.totalPages)) {
      console.warn(`[DiscoveryStore] Invalid page ${page}, total pages: ${state.totalPages}`);
      return;
    }
    
    const newOffset = (page - 1) * state.discoveryLimit;
    
    set({ 
      currentPage: page, 
      discoveryOffset: newOffset 
    });
    
    // Update URL
    get().updateQueryParams(page, undefined);
  },
  };
});
