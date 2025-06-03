import { create } from 'zustand';
import { useSpacesStore } from './spacesStore';
import type { WindowConfig, SpaceConfig } from './types';
import { arrangeWindowsInternal } from './utils';

interface DiscoveryState {
    discoveryOffset: number;
    isLoadingDiscovery: boolean;
    discoveryLimit: number;
    loadDiscoveryPage: (offset: number, force?: boolean) => Promise<void>;
    loadDiscovery: () => Promise<void>;
    loadNextDiscovery: () => Promise<void>;
    loadPrevDiscovery: () => Promise<void>;
    setDiscoveryLimit: (limit: number) => void;
    togglePin: (windowId: string) => void;
    addSpaceFromPinned: () => void;
}

export const useDiscoveryStore = create<DiscoveryState>((set, get) => ({
    discoveryOffset: 0,
    isLoadingDiscovery: false,
    discoveryLimit: 6,

    loadDiscovery: async () => {
        const { discoveryOffset, isLoadingDiscovery } = get();
        if (isLoadingDiscovery) return;

        set({ isLoadingDiscovery: true });

        await get().loadDiscoveryPage(discoveryOffset, true);

        set({ isLoadingDiscovery: false });
    },

    loadDiscoveryPage: async (newOffset: number, force = false) => {
        const state = get();
        const spacesState = useSpacesStore.getState();
        const discovery = spacesState.getSpace('discovery');
        if (!discovery) return;

        if (!force && state.isLoadingDiscovery) return;
        set({ isLoadingDiscovery: true });

        const pinned = discovery.windows.filter(w => w.pinned);
        const diffLimitPinned = state.discoveryLimit - pinned.length;
        const availableSlots = diffLimitPinned <= 0 ? 0 : Math.max(0, diffLimitPinned);

        if (availableSlots === 0) {
            const updatedDiscovery = arrangeWindowsInternal({
                ...discovery,
                windows: pinned,
                zIndexes: Object.fromEntries(pinned.map((w, idx) => [w.id, idx + 1])),
            });

            spacesState.updateSpace('discovery', updatedDiscovery);

            set({ discoveryOffset: 0, isLoadingDiscovery: false });
            return;
        }

        const response = await fetch(
            `https://chaturbate.com/api/ts/roomlist/room-list/?limit=${availableSlots}&offset=${newOffset}`
        );
        const data = await response.json();

        const fetchedRooms = data.rooms
            .filter((room: any) => !pinned.some(p => p.id === room.username))
            .slice(0, availableSlots);

        const newWindows: WindowConfig[] = fetchedRooms.map((room: any) => ({
            id: room.username,
            room: room.username,
            x: 50,
            y: 50,
            width: 800,
            height: 600,
        }));

        const updatedDiscovery = arrangeWindowsInternal({
            ...discovery,
            windows: [...pinned, ...newWindows],
            zIndexes: Object.fromEntries([...pinned, ...newWindows].map((w, idx) => [w.id, idx + 1])),
        });

        spacesState.updateSpace('discovery', updatedDiscovery);
        set({ discoveryOffset: newOffset, isLoadingDiscovery: false });
    },

    loadNextDiscovery: async () => {
        const state = get();
        await get().loadDiscoveryPage(state.discoveryOffset + 10, true);
    },

    loadPrevDiscovery: async () => {
        const state = get();
        const newOffset = Math.max(0, state.discoveryOffset - 10);
        await get().loadDiscoveryPage(newOffset, true);
    },

    setDiscoveryLimit: (limit) => {
        set({ discoveryLimit: limit, discoveryOffset: 0 });
        get().loadDiscoveryPage(0);
    },

    togglePin: (windowId: string) => {
        const spacesState = useSpacesStore.getState();
        const discovery = spacesState.getSpace('discovery');
        if (!discovery) return;

        const updatedWindows = discovery.windows.map(w =>
            w.id === windowId ? { ...w, pinned: !w.pinned } : w
        );

        spacesState.updateSpace('discovery', { ...discovery, windows: updatedWindows });
    },

    addSpaceFromPinned: () => {
        const spacesState = useSpacesStore.getState();
        const discovery = spacesState.getSpace('discovery');
        if (!discovery) return;

        const pinnedWindows = discovery.windows.filter(w => w.pinned);
        if (pinnedWindows.length === 0) return;

        const id = Math.random().toString(36).substring(2, 9);
        const totalSpaces = spacesState.getSpaces().length;
        const finalName = `Space ${totalSpaces + 1}`;

        const newSpace: SpaceConfig = {
            id,
            name: finalName,
            windows: pinnedWindows.map(w => ({ ...w, pinned: undefined })),
            zIndexes: Object.fromEntries(pinnedWindows.map((w, idx) => [w.id, idx + 1])),
            autoArrange: true,
        };

        spacesState.addSpace(finalName); // já respeitando o novo spacesStore
        spacesState.updateSpace(id, newSpace);
    },
}));
