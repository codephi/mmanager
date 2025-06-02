import { create } from 'zustand';
import type { SpaceConfig, WindowConfig } from './types';
import { generateId } from './utils';
import { arrangeWindowsInternal } from './arrangeUtils';
import { useRootStore } from './rootStore';

interface WindowsState {
    addWindow: (room: string) => void;
    removeWindow: (id: string) => void;
}

export const useWindowsStore = create<WindowsState>((set, get) => ({
    addWindow: (room) => {
        const { spaces } = useRootStore.getState();
        const { activeSpaceId } = useRootStore.getState();
        const space = spaces.find(s => s.id === activeSpaceId);
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

        const finalSpace = updatedSpace.autoArrange ? arrangeWindowsInternal(updatedSpace) : updatedSpace;

        useRootStore.setState({
            spaces: spaces.map(s => s.id === space.id ? finalSpace : s)
        });
    },

    removeWindow: (id) => {
        const { spaces } = useRootStore.getState();
        const { activeSpaceId } = useRootStore.getState();
        const space = spaces.find(s => s.id === activeSpaceId);
        if (!space) return;

        const { [id]: _, ...newZIndexes } = space.zIndexes;

        const updatedSpace: SpaceConfig = {
            ...space,
            windows: space.windows.filter(w => w.id !== id),
            zIndexes: newZIndexes
        };

        const finalSpace = updatedSpace.autoArrange ? arrangeWindowsInternal(updatedSpace) : updatedSpace;

        useRootStore.setState({
            spaces: spaces.map(s => s.id === space.id ? finalSpace : s)
        });
    },
}));
