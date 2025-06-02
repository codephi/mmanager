import { create } from 'zustand';
import { useSpacesStore } from './spacesStore';
import { arrangeWindowsInternal } from './arrangeUtils';
import type { WindowConfig, SpaceConfig } from './types';

interface DiscoveryState {
    discoveryOffset: number;
    discoveryLimit: number;
    isLoadingDiscovery: boolean;
    setDiscoveryLimit: (limit: number) => void;
    loadDiscovery: () => Promise<void>;
    loadNextDiscovery: () => Promise<void>;
    loadPrevDiscovery: () => Promise<void>;
}

export const useDiscoveryStore = create<DiscoveryState>((set, get) => ({
    discoveryOffset: 0,
    discoveryLimit: 6,
    isLoadingDiscovery: false,

    setDiscoveryLimit: (limit) => {
        set({ discoveryLimit: limit, discoveryOffset: 0 });
        get().loadDiscovery();
    },

    loadDiscovery: async () => {
        const { discoveryOffset, discoveryLimit } = get();
        const spaces = useSpacesStore.getState().spaces;
        const discovery = spaces.find(s => s.id === 'discovery');
        if (!discovery || get().isLoadingDiscovery) return;

        set({ isLoadingDiscovery: true });

        const response = await fetch(`https://pt.chaturbate.com/api/ts/roomlist/room-list/?limit=${discoveryLimit}&offset=${discoveryOffset}`);
        const data = await response.json();

        const existingIds = new Set(discovery.windows.map(w => w.id));

        const newWindows: WindowConfig[] = data.rooms
            .filter((room: any) => !existingIds.has(room.username))
            .map((room: any) => ({
                id: room.username,
                room: room.username,
                x: 50,
                y: 50,
                width: 800,
                height: 600,
            }));

        const updatedDiscovery: SpaceConfig = {
            ...discovery,
            windows: [...discovery.windows, ...newWindows],
            zIndexes: {
                ...discovery.zIndexes,
                ...Object.fromEntries(newWindows.map((w, idx) => [w.id, Object.keys(discovery.zIndexes).length + idx + 1]))
            }
        };

        const finalDiscovery = arrangeWindowsInternal(updatedDiscovery);

        useSpacesStore.setState({
            spaces: spaces.map(s => s.id === 'discovery' ? finalDiscovery : s)
        });

        set({
            discoveryOffset: discoveryOffset + discoveryLimit,
            isLoadingDiscovery: false
        });
    },

    loadNextDiscovery: async () => {
        const { discoveryOffset, discoveryLimit } = get();
        set({ discoveryOffset: discoveryOffset + discoveryLimit });
        await get().loadDiscovery();
    },

    loadPrevDiscovery: async () => {
        const { discoveryOffset, discoveryLimit } = get();
        const newOffset = Math.max(0, discoveryOffset - discoveryLimit);
        set({ discoveryOffset: newOffset });
        await get().loadDiscovery();
    },
}));
