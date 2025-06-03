import { create } from 'zustand';
import type { SpaceConfig, WindowConfig } from './types';
import { arrangeWindowsInternal } from './utils';

interface SpacesState {
    spaces: SpaceConfig[];
    activeSpaceId: string;
    getSpaces: () => SpaceConfig[];
    getActiveSpaceId: () => string;
    getSpace: (id: string) => SpaceConfig | undefined;
    updateSpace: (id: string, updated: SpaceConfig) => void;
    setActiveSpace: (id: string) => void;
    addSpace: (name: string) => void;
    removeSpace: (id: string) => void;
    renameSpace: (id: string, name: string) => void;
    toggleAutoArrange: (spaceId: string) => void;
    createSpaceFromPinned: (pinnedWindows: WindowConfig[]) => void;
    bringToFront: (id: string) => void;
    arrangeWindows: () => void;
    copyWindowToSpace: (windowId: string, targetSpaceId: string) => void;
    setWindowVolume: (windowId: string, volume: number) => void;
    arrangeFilteredWindows: () => void;
    globalMuted: boolean;
    filterMode: 'all' | 'online' | 'offline';
    setFilterMode: (mode: 'all' | 'online' | 'offline') => void;
    toggleGlobalMuted: () => void;
    toggleWindowMute: (windowId: string) => void;
    setGlobalMuted: (muted: boolean) => void;
}

export const useSpacesStore = create<SpacesState>((set, get) => ({
    spaces: [
        {
            id: 'discovery',
            name: 'Discovery',
            windows: [],
            zIndexes: {},
            autoArrange: true,
        }
    ],
    activeSpaceId: 'discovery',

    getSpaces: () => get().spaces,

    getActiveSpaceId: () => get().activeSpaceId,

    getSpace: (id) => {
        const spaces = get().spaces;
        return spaces.find(s => s.id === id);
    },

    updateSpace: (id, updated) => {
        set(state => ({
            spaces: state.spaces.map(s => (s.id === id ? updated : s)),
        }));
    },

    setActiveSpace: (id) => {
        set({ activeSpaceId: id });
    },

    addSpace: (name) => {
        set(state => {
            const id = Math.random().toString(36).substring(2, 9);
            const totalSpaces = state.spaces.length;
            const finalName = name.trim() !== '' ? name : `Space ${totalSpaces + 1}`;

            const newSpace: SpaceConfig = {
                id,
                name: finalName,
                windows: [],
                zIndexes: {},
                autoArrange: true,
            };

            return {
                spaces: [...state.spaces, newSpace],
                activeSpaceId: id,
            };
        });
    },

    removeSpace: (id) => {
        set(state => {
            if (id === 'discovery') return state; // nunca remove discovery

            let newSpaces = state.spaces.filter((s) => s.id !== id);
            if (newSpaces.length === 0) {
                newSpaces = [
                    {
                        id: 'default',
                        name: 'Space 1',
                        windows: [],
                        zIndexes: {},
                        autoArrange: true,
                    },
                ];
            }

            return {
                spaces: newSpaces,
                activeSpaceId: newSpaces[0].id,
            };
        });
    },

    renameSpace: (id, name) => {
        set(state => ({
            spaces: state.spaces.map((s) => (s.id === id ? { ...s, name } : s)),
        }));
    },

    toggleAutoArrange: (spaceId) => {
        set(state => ({
            spaces: state.spaces.map((space) =>
                space.id === spaceId
                    ? { ...space, autoArrange: !space.autoArrange }
                    : space
            ),
        }));
    },

    createSpaceFromPinned: (pinnedWindows) => {
        set(state => {
            const id = Math.random().toString(36).substring(2, 9);
            const totalSpaces = state.spaces.length;
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

            return {
                spaces: [...state.spaces, newSpace],
                activeSpaceId: id,
            };
        });
    },

    bringToFront: (id) => {
        set(state => {
            const activeSpaceId = state.activeSpaceId;
            const activeSpace = state.spaces.find(s => s.id === activeSpaceId);
            if (!activeSpace) return state;

            const maxZ = Math.max(0, ...Object.values(activeSpace.zIndexes));
            const zIndexes = { ...activeSpace.zIndexes, [id]: maxZ + 1 };
            return {
                spaces: state.spaces.map(s =>
                    s.id === activeSpaceId ? { ...activeSpace, zIndexes } : s
                ),
            };
        });
    },

    arrangeWindows: () => {
        set(state => {
            const activeSpaceId = state.activeSpaceId;
            const activeSpace = state.spaces.find(s => s.id === activeSpaceId);
            if (!activeSpace) return state;

            const updatedSpace = arrangeWindowsInternal(activeSpace);
            return {
                spaces: state.spaces.map(s =>
                    s.id === activeSpaceId ? updatedSpace : s
                ),
            };
        });
    },

    copyWindowToSpace: (windowId, targetSpaceId) => {
        set(state => {
            const activeSpaceId = state.activeSpaceId;
            const activeSpace = state.spaces.find(s => s.id === activeSpaceId);
            const targetSpace = state.spaces.find(s => s.id === targetSpaceId);
            if (!activeSpace || !targetSpace) return state;

            // Verifica se o window já existe no targetSpace
            if (targetSpace.windows.some(w => w.id === windowId)) {
                return state;
            }

            const windowToCopy = activeSpace.windows.find(w => w.id === windowId);
            if (!windowToCopy) return state;

            let newTargetSpace = {
                ...targetSpace,
                windows: [...targetSpace.windows, { ...windowToCopy }], // faz uma cópia para garantir imutabilidade
                zIndexes: { ...targetSpace.zIndexes, [windowId]: Math.max(0, ...Object.values(targetSpace.zIndexes)) + 1 }
            };

            if (newTargetSpace.autoArrange) {
                newTargetSpace = arrangeWindowsInternal(newTargetSpace);
            }

            return {
                spaces: state.spaces.map(s => {
                    if (s.id === newTargetSpace.id) return newTargetSpace;
                    return s;
                }),
            };
        });
    },

    setWindowVolume: (id, volume) => {
        set(state => {
            const activeSpaceId = state.activeSpaceId;
            const activeSpace = state.spaces.find(s => s.id === activeSpaceId);
            if (!activeSpace) return state;

            const windows = activeSpace.windows.map(win =>
                win.id === id ? { ...win, volume, isMuted: volume === 0 } : win
            );
            const updatedSpace = { ...activeSpace, windows };

            return {
                spaces: state.spaces.map(s =>
                    s.id === activeSpaceId ? updatedSpace : s
                ),
            };
        });
    },
    globalMuted: false,
    filterMode: 'all',

    setFilterMode: (mode) => {
        set(state => ({ ...state, filterMode: mode }));

        set(state => {
            const activeSpaceId = state.activeSpaceId;
            const activeSpace = state.spaces.find(s => s.id === activeSpaceId);
            if (activeSpace?.autoArrange) {
                state.arrangeFilteredWindows();
            }
            return {};
        });
    },

    arrangeFilteredWindows: () => {
        set(state => {
            const activeSpaceId = state.activeSpaceId;
            const activeSpace = state.spaces.find(s => s.id === activeSpaceId);
            if (!activeSpace) return state;

            let filteredWindows = activeSpace.windows;
            const filterMode = state.filterMode;

            if (filterMode === 'online') {
                filteredWindows = filteredWindows.filter(w => w.isOnline === true);
            } else if (filterMode === 'offline') {
                filteredWindows = filteredWindows.filter(w => w.isOnline === false);
            }

            if (filteredWindows.length === 0) return state;

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

            return {
                spaces: state.spaces.map(s =>
                    s.id === activeSpaceId ? { ...activeSpace, windows: updatedWindows } : s
                ),
            };
        });
    },

    toggleWindowMute: (id) => {
        set(state => {
            const activeSpaceId = state.activeSpaceId;
            const activeSpace = state.spaces.find(s => s.id === activeSpaceId);
            if (!activeSpace) return state;

            const windows = activeSpace.windows.map(win =>
                win.id === id ? { ...win, isMuted: !win.isMuted } : win
            );
            return {
                spaces: state.spaces.map(s =>
                    s.id === activeSpaceId ? { ...activeSpace, windows } : s
                ),
            };
        });
    },

    toggleGlobalMuted: () => {
        set(state => {
            const newMuted = !state.globalMuted;
            return {
                spaces: state.spaces.map(space => ({
                    ...space,
                    windows: space.windows.map(w => ({ ...w, isMuted: newMuted }))
                })),
                globalMuted: newMuted
            };
        });
    },

    setGlobalMuted: (muted) => set({
        globalMuted: muted, spaces: get().spaces.map(space => ({
            ...space,
            windows: space.windows.map(w => ({ ...w, isMuted: muted }))
        })),
    })

}));
