import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useSpacesStore } from './spacesStore';
import { arrangeWindowsInternal } from './utils';

interface RootState {
  globalMuted: boolean;
  filterMode: 'all' | 'online' | 'offline';
  setFilterMode: (mode: 'all' | 'online' | 'offline') => void;
  arrangeFilteredWindows: () => void;
  toggleGlobalMuted: () => void;

  setWindowVolume: (windowId: string, volume: number) => void;
  toggleWindowMute: (windowId: string) => void;
}


export const useRootStore = create<RootState>()(
  persist(
    (set, get) => ({
      globalMuted: false,
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

      setWindowVolume: (id, volume) => {
        const spacesState = useSpacesStore.getState();
        const activeSpaceId = spacesState.getActiveSpaceId();
        const activeSpace = spacesState.getSpace(activeSpaceId);
        if (!activeSpace) return;

        const windows = activeSpace.windows.map(win =>
          win.id === id ? { ...win, volume, isMuted: volume === 0 } : win
        );
        spacesState.updateSpace(activeSpaceId, { ...activeSpace, windows });
      },

      toggleWindowMute: (id) => {
        const spacesState = useSpacesStore.getState();
        const activeSpaceId = spacesState.getActiveSpaceId();
        const activeSpace = spacesState.getSpace(activeSpaceId);
        if (!activeSpace) return;

        const windows = activeSpace.windows.map(win =>
          win.id === id ? { ...win, isMuted: !win.isMuted } : win
        );
        spacesState.updateSpace(activeSpaceId, { ...activeSpace, windows });
      },

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


    }),
    { name: 'root-storage' }
  )
);
