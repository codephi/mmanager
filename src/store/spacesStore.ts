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
            spaces: [...state.spaces, {
                id,
                name: finalName,
                windows: [],
                zIndexes: {},
                autoArrange: true,
                spaceLimit: 12,  // default de paginação
                spaceOffset: 0
            }],
            activeSpaceId: id
        }));
    },

    removeSpace: (id) => {
        if (id === 'discovery') return;
        set(state => {
            let newSpaces = state.spaces.filter(s => s.id !== id);

            if (newSpaces.length === 0) {
                newSpaces = [{ id: 'default', name: 'Space 1', windows: [], zIndexes: {}, autoArrange: true }];
            }

            return {
                spaces: newSpaces,
                activeSpaceId: newSpaces[0].id
            };
        });
    },

    renameSpace: (id, name) => {
        set(state => ({
            spaces: state.spaces.map(t => t.id === id ? { ...t, name } : t)
        }));
    },

    toggleAutoArrange: (spaceId) => {
        set(state => ({
            spaces: state.spaces.map(space =>
                space.id === spaceId ? { ...space, autoArrange: !space.autoArrange } : space
            )
        }));
    }
}));
