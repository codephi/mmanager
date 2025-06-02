import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useSpacesStore } from './spacesStore';

interface LayoutState {
    activeSpaceId: string;
    globalMuted: boolean;
    filterMode: 'all' | 'online' | 'offline';
    setActiveSpace: (id: string) => void;
    setGlobalMuted: (value: boolean) => void;
    toggleGlobalMuted: () => void;
    setFilterMode: (mode: 'all' | 'online' | 'offline') => void;
    arrangeFilteredWindows: () => void;
}

export const useLayoutStore = create<LayoutState>()(
    persist(
        (set, get) => ({

            activeSpaceId: 'discovery',
            globalMuted: false,
            filterMode: 'all',

            setActiveSpace: (id) => {
                set({ activeSpaceId: id });
                const spaces = useSpacesStore.getState().spaces;
                const active = spaces.find(s => s.id === id);
                if (active?.autoArrange) {
                    get().arrangeFilteredWindows();
                }
            },

            setGlobalMuted: (value) => {
                set({ globalMuted: value });
            },

            toggleGlobalMuted: () => {
                const state = get();
                set({ globalMuted: !state.globalMuted });
            },

            setFilterMode: (mode) => {
                set({ filterMode: mode });
                get().arrangeFilteredWindows();
            },

            arrangeFilteredWindows: () => {
                const { activeSpaceId, filterMode } = get();
                const spacesState = useSpacesStore.getState();
                const activeSpace = spacesState.spaces.find(s => s.id === activeSpaceId);
                if (!activeSpace) return;

                let filteredWindows = activeSpace.windows;

                if (filterMode === 'online') {
                    filteredWindows = filteredWindows.filter(w => w.isOnline === true);
                } else if (filterMode === 'offline') {
                    filteredWindows = filteredWindows.filter(w => w.isOnline === false);
                }

                const total = filteredWindows.length;
                if (total === 0) return;

                const screenWidth = window.innerWidth;
                const screenHeight = window.innerHeight - 50;
                const cols = Math.ceil(Math.sqrt(total));
                const rows = Math.ceil(total / cols);
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

                useSpacesStore.setState({
                    spaces: spacesState.spaces.map(s =>
                        s.id === activeSpace.id ? { ...activeSpace, windows: updatedWindows } : s
                    )
                });
            },

        }),
        { name: 'layout-storage' }
    )
);
