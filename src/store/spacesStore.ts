import { create } from 'zustand';
import { type SpaceConfig } from './types';
import { generateId } from './utils';

interface SpacesState {
    spaces: SpaceConfig[];
    addSpace: (name: string) => void;
    removeSpace: (id: string) => void;
    renameSpace: (id: string, name: string) => void;
    toggleAutoArrange: (spaceId: string) => void;
}

export const useSpacesStore = create<SpacesState>((set, get) => ({
    spaces: [{
        id: 'discovery',
        name: 'Discovery',
        windows: [],
        zIndexes: {},
        autoArrange: true,
    }],

    addSpace: (name) => {
        const id = generateId();
        const totalSpaces = get().spaces.length;
        const finalName = name.trim() !== '' ? name : `Space ${totalSpaces + 1}`;
        set(state => ({
            spaces: [...state.spaces, { id, name: finalName, windows: [], zIndexes: {}, autoArrange: true }],
        }));
    },

    removeSpace: (id) => {
        if (id === 'discovery') return;
        set(state => {
            const newSpaces = state.spaces.filter(s => s.id !== id);
            return { spaces: newSpaces.length ? newSpaces : [{ id: 'default', name: 'Space 1', windows: [], zIndexes: {}, autoArrange: true }] };
        });
    },

    renameSpace: (id, name) => {
        set(state => ({
            spaces: state.spaces.map(s => s.id === id ? { ...s, name } : s),
        }));
    },

    toggleAutoArrange: (spaceId) => {
        set(state => ({
            spaces: state.spaces.map(s => s.id === spaceId ? { ...s, autoArrange: !s.autoArrange } : s),
        }));
    }
}));
