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
    moveWindowToSpace: (windowId: string, targetSpaceId: string) => void;
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

    moveWindowToSpace: (windowId, targetSpaceId) => {
        set(state => {
            const activeSpaceId = state.activeSpaceId;
            const activeSpace = state.spaces.find(s => s.id === activeSpaceId);
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
                }),
            };
        });
    },
}));
