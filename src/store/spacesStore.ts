import { create } from 'zustand';
import type { SpaceConfig, WindowConfig } from './types';

interface SpacesState {
    spaces: SpaceConfig[];
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
    activeSpaceId: string;
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
        const state = get();
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

        set({
            spaces: [...state.spaces, newSpace],
            activeSpaceId: id,
        });
    },

    removeSpace: (id) => {
        const state = get();
        if (id === 'discovery') return; // nunca remove discovery

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

        set({
            spaces: newSpaces,
            activeSpaceId: newSpaces[0].id,
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
        const state = get();
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

        set({
            spaces: [...state.spaces, newSpace],
            activeSpaceId: id,
        });
    },
}));
