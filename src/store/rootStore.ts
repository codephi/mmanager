import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useSpacesStore } from './spacesStore';  // IMPORTANTE

interface WindowConfig {
  id: string;
  room: string;
  x: number;
  y: number;
  width: number;
  height: number;
  pinned?: boolean;
  isOnline?: boolean;
  isMuted?: boolean;
  volume?: number;
}


interface SpaceConfig {
  id: string;
  name: string;
  windows: WindowConfig[];
  zIndexes: Record<string, number>;
  autoArrange: boolean;
}

interface RootState {
  spaces: SpaceConfig[];
  activeSpaceId: string;
  discoveryOffset: number;
  isLoadingDiscovery: boolean;
  discoveryLimit: number;
  globalMuted: boolean;
  filterMode: 'all' | 'online' | 'offline';
  setFilterMode: (mode: 'all' | 'online' | 'offline') => void;
  arrangeFilteredWindows: () => void;
  toggleGlobalMuted: () => void;
  loadDiscovery: () => Promise<void>;
  bringToFront: (id: string) => void;
  arrangeWindows: () => void;
  moveWindowToSpace: (windowId: string, targetSpaceId: string) => void;
  loadNextDiscovery: () => Promise<void>;
  loadPrevDiscovery: () => Promise<void>;
  setDiscoveryLimit: (limit: number) => void;
  loadDiscoveryPage: (offset: number, force?: boolean) => Promise<void>;
  togglePin: (windowId: string) => void;
  addSpaceFromPinned: () => void;
  setWindowVolume: (windowId: string, volume: number) => void;
  toggleWindowMute: (windowId: string) => void;
}

const arrangeWindowsInternal = (space: SpaceConfig): SpaceConfig => {
  const total = space.windows.length;
  if (total === 0) return space;

  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight - 50;
  const cols = Math.ceil(Math.sqrt(total));
  const rows = Math.ceil(total / cols);
  const cellWidth = Math.floor(screenWidth / cols);
  const cellHeight = Math.floor(screenHeight / rows);

  const newWindows = space.windows.map((win, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    return {
      ...win,
      x: col * cellWidth,
      y: row * cellHeight + 50,
      width: cellWidth,
      height: cellHeight
    };
  });

  return { ...space, windows: newWindows };
};


export const useRootStore = create<RootState>()(
  persist(
    (set, get) => ({
      spaces: [
        {
          id: 'discovery',
          name: 'Discovery',
          windows: [],
          zIndexes: {},
          autoArrange: true,
        }
      ],
      globalMuted: false,
      activeSpaceId: 'discovery',
      discoveryOffset: 0,
      isLoadingDiscovery: false,
      discoveryLimit: 6,  // 👈 novo
      filterMode: 'all',



      setFilterMode: (mode) => {
        set({ filterMode: mode });

        const spacesState = useSpacesStore.getState();
        const activeSpaceId = spacesState.getActiveSpaceId();
        const activeSpace = spacesState.getSpace(activeSpaceId);
        if (activeSpace?.autoArrange) {
          get().arrangeFilteredWindows();
        }
      },

      arrangeFilteredWindows: () => {
        const spacesState = useSpacesStore.getState();
        const activeSpaceId = spacesState.getActiveSpaceId();
        const activeSpace = spacesState.getSpace(activeSpaceId);
        if (!activeSpace) return;

        let filteredWindows = activeSpace.windows;
        const filterMode = get().filterMode;

        if (filterMode === 'online') {
          filteredWindows = filteredWindows.filter(w => w.isOnline === true);
        } else if (filterMode === 'offline') {
          filteredWindows = filteredWindows.filter(w => w.isOnline === false);
        }

        if (filteredWindows.length === 0) return;

        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight - 50;
        const cols = Math.ceil(Math.sqrt(filteredWindows.length));
        const rows = Math.ceil(filteredWindows.length / cols);
        const cellWidth = Math.floor(screenWidth / cols);
        const cellHeight = Math.floor(screenHeight / rows);

        const updatedWindows = activeSpace.windows.map(win => {
          const index = filteredWindows.findIndex(w => w.id === win.id);
          if (index === -1) return win;
          const col = index % cols;
          const row = Math.floor(index / cols);
          return {
            ...win,
            x: col * cellWidth,
            y: row * cellHeight + 50,
            width: cellWidth,
            height: cellHeight
          };
        });

        spacesState.updateSpace(activeSpaceId, { ...activeSpace, windows: updatedWindows });
      },

      setWindowVolume: (id, volume) => set((state) => {
        const spaces = state.spaces.map(space => {
          if (space.id !== state.activeSpaceId) return space;
          const windows = space.windows.map(win =>
            win.id === id ? { ...win, volume, isMuted: volume === 0 } : win
          );
          return { ...space, windows };
        });
        return { spaces };
      }),

      toggleWindowMute: (id) => set((state) => {
        const spaces = state.spaces.map(space => {
          if (space.id !== state.activeSpaceId) return space;
          const windows = space.windows.map(win =>
            win.id === id ? { ...win, isMuted: !win.isMuted } : win
          );
          return { ...space, windows };
        });
        return { spaces };
      }),

      toggleGlobalMuted: () => {
        const spacesState = useSpacesStore.getState();
        const spaces = spacesState.getSpaces();
        const newMuted = !get().globalMuted;

        spaces.forEach(space => {
          const updatedWindows = space.windows.map(w => ({ ...w, isMuted: newMuted }));
          spacesState.updateSpace(space.id, { ...space, windows: updatedWindows });
        });

        set({ globalMuted: newMuted });
      },


      bringToFront: (id) => set((state) => {
        const space = state.spaces.find(t => t.id === state.activeSpaceId);
        if (!space) return state;

        const maxZ = Math.max(0, ...Object.values(space.zIndexes));
        const updatedSpace = {
          ...space,
          zIndexes: { ...space.zIndexes, [id]: maxZ + 1 }
        };

        return {
          spaces: state.spaces.map(t => t.id === space.id ? updatedSpace : t)
        };
      }),

      arrangeWindows: () => set((state) => {
        const space = state.spaces.find(t => t.id === state.activeSpaceId);
        if (!space) return state;

        const updatedSpace = arrangeWindowsInternal(space);
        return {
          spaces: state.spaces.map(t => t.id === space.id ? updatedSpace : t)
        };
      }),


      moveWindowToSpace: (windowId, targetSpaceId) => set((state) => {
        const activeSpace = state.spaces.find(s => s.id === state.activeSpaceId);
        const targetSpace = state.spaces.find(s => s.id === targetSpaceId);
        if (!activeSpace || !targetSpace) return state;

        const windowToMove = activeSpace.windows.find(w => w.id === windowId);
        if (!windowToMove) return state;

        let newTargetSpace = {
          ...targetSpace,
          windows: [...targetSpace.windows, windowToMove],
          zIndexes: { ...targetSpace.zIndexes, [windowId]: Math.max(0, ...Object.values(targetSpace.zIndexes)) + 1 }
        };

        if (newTargetSpace.autoArrange) {
          newTargetSpace = arrangeWindowsInternal(newTargetSpace);
        }

        const newActiveSpace = {
          ...activeSpace,
          windows: activeSpace.windows.filter(w => w.id !== windowId),
          zIndexes: Object.fromEntries(Object.entries(activeSpace.zIndexes).filter(([id]) => id !== windowId))
        };

        return {
          spaces: state.spaces.map(s => {
            if (s.id === newActiveSpace.id) return newActiveSpace;
            if (s.id === newTargetSpace.id) return newTargetSpace;
            return s;
          })
        };
      }),




      loadDiscovery: async () => {
        const state = get();
        if (state.isLoadingDiscovery) return;
        console.log('Loading discovery...');
        set({ isLoadingDiscovery: true });

        const offset = state.discoveryOffset;

        const response = await fetch(`https://pt.chaturbate.com/api/ts/roomlist/room-list/?limit=10&offset=${offset}`);
        const data = await response.json();

        const existingIds = new Set(
          state.spaces.find(s => s.id === 'discovery')?.windows.map(w => w.id) ?? []
        );

        const newWindows: WindowConfig[] = data.rooms
          .filter((room: any) => !existingIds.has(room.username))
          .map((room: any) => ({
            id: room.username,
            room: room.username,
            x: 50,
            y: 50,
            width: 800,
            height: 600
            // NÃO precisamos do isOnline aqui
          }));


        const discoverySpace = state.spaces.find(s => s.id === 'discovery');
        if (!discoverySpace) {
          set({ isLoadingDiscovery: false });
          return;
        }

        let updatedDiscovery = {
          ...discoverySpace,
          windows: [...discoverySpace.windows, ...newWindows],
          zIndexes: {
            ...discoverySpace.zIndexes,
            ...Object.fromEntries(newWindows.map((w, idx) => [w.id, Object.keys(discoverySpace.zIndexes).length + idx + 1]))
          }
        };

        updatedDiscovery = arrangeWindowsInternal(updatedDiscovery);

        set({
          discoveryOffset: offset + 10,
          spaces: state.spaces.map(s => s.id === 'discovery' ? updatedDiscovery : s),
          isLoadingDiscovery: false
        });
      },

      loadDiscoveryPage: async (newOffset: number, force = false) => {
        const state = get();
        if (!force && state.isLoadingDiscovery) return;

        set({ isLoadingDiscovery: true });

        const discovery = state.spaces.find(s => s.id === 'discovery');
        const pinned = discovery?.windows.filter(w => w.pinned) ?? [];
        const diffLimitPinned = state.discoveryLimit - pinned.length;
        const availableSlots = diffLimitPinned <= 0 ? 0 : Math.max(0, diffLimitPinned);

        // 🚩 Proteção aqui:
        if (availableSlots === 0) {
          let updatedDiscovery = {
            ...discovery!,
            windows: [...pinned],
            zIndexes: Object.fromEntries(
              pinned.map((w, idx) => [w.id, idx + 1])
            )
          };

          updatedDiscovery = arrangeWindowsInternal(updatedDiscovery);

          set({
            discoveryOffset: 0, // opcional: reset offset nesse caso
            spaces: state.spaces.map(s => s.id === 'discovery' ? updatedDiscovery : s),
            isLoadingDiscovery: false
          });

          return; // 👈 não faz fetch se não há slots
        }

        const response = await fetch(
          `https://pt.chaturbate.com/api/ts/roomlist/room-list/?limit=${availableSlots}&offset=${newOffset}`
        );

        const data = await response.json();

        const fetchedRooms = data.rooms
          .filter((room: any) => !pinned.some(p => p.id === room.username))
          .slice(0, availableSlots);

        const newWindows: WindowConfig[] = fetchedRooms.map((room: any) => ({
          id: room.username,
          room: room.username,
          x: 50,
          y: 50,
          width: 800,
          height: 600
        }));

        let updatedDiscovery = {
          ...discovery!,
          windows: [...pinned, ...newWindows],
          zIndexes: Object.fromEntries(
            [...pinned, ...newWindows].map((w, idx) => [w.id, idx + 1])
          )
        };

        updatedDiscovery = arrangeWindowsInternal(updatedDiscovery);

        set({
          discoveryOffset: newOffset,
          spaces: state.spaces.map(s => s.id === 'discovery' ? updatedDiscovery : s),
          isLoadingDiscovery: false
        });
      },

      loadNextDiscovery: async () => {
        const state = get();
        get().loadDiscoveryPage(state.discoveryOffset + 10, true);
      },

      loadPrevDiscovery: async () => {
        const state = get();
        const newOffset = Math.max(0, state.discoveryOffset - 10);
        get().loadDiscoveryPage(newOffset, true);
      },


      setDiscoveryLimit: (limit) => {
        set({ discoveryLimit: limit, discoveryOffset: 0 });
        get().loadDiscoveryPage(0); // carrega novamente do zero
      },

      togglePin: (windowId: string) => set((state) => {
        const discovery = state.spaces.find(s => s.id === 'discovery');
        if (!discovery) return state;

        const updatedWindows = discovery.windows.map(w =>
          w.id === windowId ? { ...w, pinned: !w.pinned } : w
        );

        return {
          spaces: state.spaces.map(s =>
            s.id === 'discovery' ? { ...discovery, windows: updatedWindows } : s
          )
        };
      }),

      addSpaceFromPinned: () => set((state) => {
        const discovery = state.spaces.find(s => s.id === 'discovery');
        if (!discovery) return state;

        const pinnedWindows = discovery.windows.filter(w => w.pinned);
        if (pinnedWindows.length === 0) return state; // nada a fazer

        const id = Math.random().toString(36).substring(2, 9);
        const totalSpaces = state.spaces.length;
        const finalName = `Space ${totalSpaces + 1}`;

        const newSpace: SpaceConfig = {
          id,
          name: finalName,
          windows: pinnedWindows.map(w => ({
            ...w,
            pinned: undefined // remover a flag pinned para o novo space
          })),
          zIndexes: Object.fromEntries(
            pinnedWindows.map((w, idx) => [w.id, idx + 1])
          ),
          autoArrange: true
        };

        return {
          spaces: [...state.spaces, newSpace],
          activeSpaceId: id
        };
      }),
    }),
    { name: 'root-storage' }
  )
);
