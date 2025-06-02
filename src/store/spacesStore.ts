import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';

export interface WindowConfig {
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

export interface SpaceConfig {
    id: string;
    name: string;
    windows: WindowConfig[];
    zIndexes: Record<string, number>;
    autoArrange: boolean;
}

interface SpacesState {
    spaces: SpaceConfig[];
    addSpace: (name: string) => void;
    removeSpace: (id: string) => void;
    renameSpace: (id: string, name: string) => void;
    switchSpace: (id: string) => void;
    toggleAutoArrange: (spaceId: string) => void;
}

export const useSpacesStore = create<SpacesState>()(
    persist(
        (set, get) => ({
            spaces: [{
                id: 'discovery',
                name: 'Discovery',
                windows: [],
                zIndexes: {},
                autoArrange: true
            }],

            addSpace: (name) => set((state) => {
                const id = nanoid();
                const finalName = name.trim() !== '' ? name : `Space ${state.spaces.length + 1}`;
                return { spaces: [...state.spaces, { id, name: finalName, windows: [], zIndexes: {}, autoArrange: true }] };
            }),

            removeSpace: (id) => set((state) => {
                if (id === 'discovery') return state;
                const remaining = state.spaces.filter(s => s.id !== id);
                return { spaces: remaining.length ? remaining : [{ id: 'default', name: 'Space 1', windows: [], zIndexes: {}, autoArrange: true }] };
            }),

            renameSpace: (id, name) => set((state) => ({
                spaces: state.spaces.map(s => s.id === id ? { ...s, name } : s)
            })),

            switchSpace: (id) => set(() => ({})), // será controlado no layoutStore

            toggleAutoArrange: (spaceId) => set((state) => ({
                spaces: state.spaces.map(space =>
                    space.id === spaceId ? { ...space, autoArrange: !space.autoArrange } : space
                )
            })),
        }),
        { name: 'spaces-storage' }
    )
);
