import { create } from 'zustand';
import type { SpaceConfig, WindowConfig } from './types';
import { generateId } from './utils';
import { arrangeWindowsInternal } from './arrangeUtils';
import { useSpacesStore } from './spacesStore';

interface WindowsState {
    addWindow: (room: string) => void;
    removeWindow: (id: string) => void;
    updateWindow: (id: string, pos: Partial<WindowConfig>) => void;
}

export const useWindowsStore = create<WindowsState>((set, get) => ({

    addWindow: (room) => {
        const spacesState = useSpacesStore.getState();
        const activeSpaceId = spacesState.getActiveSpaceId();
        const space = spacesState.getSpace(activeSpaceId);
        if (!space) return;

        const alreadyExists = space.windows.some(w => w.room === room);
        if (alreadyExists) return;

        const id = generateId();
        const maxZ = Math.max(0, ...Object.values(space.zIndexes));

        const newWindow: WindowConfig = {
            id,
            room,
            x: 50,
            y: 50,
            width: 800,
            height: 600,
        };

        const updatedSpace: SpaceConfig = {
            ...space,
            windows: [...space.windows, newWindow],
            zIndexes: { ...space.zIndexes, [id]: maxZ + 1 }
        };

        const finalSpace = updatedSpace.autoArrange
            ? arrangeWindowsInternal(updatedSpace)
            : updatedSpace;

        spacesState.updateSpace(space.id, finalSpace);
    },

    removeWindow: (id) => {
        const spacesState = useSpacesStore.getState();
        const activeSpaceId = spacesState.getActiveSpaceId();
        const space = spacesState.getSpace(activeSpaceId);
        if (!space) return;

        const { [id]: _, ...newZIndexes } = space.zIndexes;

        const updatedSpace: SpaceConfig = {
            ...space,
            windows: space.windows.filter(w => w.id !== id),
            zIndexes: newZIndexes
        };

        const finalSpace = updatedSpace.autoArrange
            ? arrangeWindowsInternal(updatedSpace)
            : updatedSpace;

        spacesState.updateSpace(space.id, finalSpace);
    },

    updateWindow: (id, pos) => {
        const spacesState = useSpacesStore.getState();
        const activeSpaceId = spacesState.getActiveSpaceId();
        const space = spacesState.getSpace(activeSpaceId);
        if (!space) return;

        const updatedWindows = space.windows.map(w =>
            w.id === id ? { ...w, ...pos } : w
        );

        const updatedSpace: SpaceConfig = {
            ...space,
            windows: updatedWindows
        };

        spacesState.updateSpace(space.id, updatedSpace);
    },

}));
