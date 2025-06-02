import { create } from 'zustand';
import { useRootStore } from './rootStore';
import { arrangeWindowsInternal } from './utils';
import type { WindowConfig } from './types';

interface DiscoveryState {
    discoveryOffset: number;
    discoveryLimit: number;
    isLoadingDiscovery: boolean;
    loadDiscovery: () => Promise<void>;
    loadDiscoveryPage: (offset: number, force?: boolean) => Promise<void>;
    loadNextDiscovery: () => Promise<void>;
    loadPrevDiscovery: () => Promise<void>;
    togglePin: (windowId: string) => void;
    addSpaceFromPinned: () => void;
    setDiscoveryLimit: (limit: number) => void;
}

export const useDiscoveryStore = create<DiscoveryState>((set, get) => ({
    discoveryOffset: useRootStore.getState().discoveryOffset,
    discoveryLimit: useRootStore.getState().discoveryLimit,
    isLoadingDiscovery: useRootStore.getState().isLoadingDiscovery,

    loadDiscovery: async () => {
        const root = useRootStore.getState();
        if (root.isLoadingDiscovery) return;

        useRootStore.setState({ isLoadingDiscovery: true });

        const offset = root.discoveryOffset;
        const response = await fetch(`https://pt.chaturbate.com/api/ts/roomlist/room-list/?limit=10&offset=${offset}`);
        const data = await response.json();

        const discovery = root.spaces.find(s => s.id === 'discovery');
        if (!discovery) {
            useRootStore.setState({ isLoadingDiscovery: false });
            return;
        }

        const existingIds = new Set(discovery.windows.map(w => w.id));
        const newWindows: WindowConfig[] = data.rooms
            .filter((room: any) => !existingIds.has(room.username))
            .map((room: any) => ({
                id: room.username,
                room: room.username,
                x: 50, y: 50, width: 800, height: 600
            }));

        let updatedDiscovery = {
            ...discovery,
            windows: [...discovery.windows, ...newWindows],
            zIndexes: {
                ...discovery.zIndexes,
                ...Object.fromEntries(newWindows.map((w, idx) => [w.id, Object.keys(discovery.zIndexes).length + idx + 1]))
            }
        };
        updatedDiscovery = arrangeWindowsInternal(updatedDiscovery);

        useRootStore.setState({
            discoveryOffset: offset + 10,
            spaces: root.spaces.map(s => s.id === 'discovery' ? updatedDiscovery : s),
            isLoadingDiscovery: false
        });
    },

    loadDiscoveryPage: async (newOffset, force = false) => {
        const root = useRootStore.getState();
        if (!force && root.isLoadingDiscovery) return;

        useRootStore.setState({ isLoadingDiscovery: true });

        const discovery = root.spaces.find(s => s.id === 'discovery');
        const pinned = discovery?.windows.filter(w => w.pinned) ?? [];
        const diffLimitPinned = root.discoveryLimit - pinned.length;
        const availableSlots = diffLimitPinned <= 0 ? 0 : Math.max(0, diffLimitPinned);

        if (availableSlots === 0) {
            let updatedDiscovery = {
                ...discovery!,
                windows: [...pinned],
                zIndexes: Object.fromEntries(pinned.map((w, idx) => [w.id, idx + 1]))
            };
            updatedDiscovery = arrangeWindowsInternal(updatedDiscovery);
            useRootStore.setState({
                discoveryOffset: 0,
                spaces: root.spaces.map(s => s.id === 'discovery' ? updatedDiscovery : s),
                isLoadingDiscovery: false
            });
            return;
        }

        const response = await fetch(
            `https://pt.chaturbate.com/api/ts/roomlist/room-list/?limit=${availableSlots}&offset=${newOffset}`
        );
        const data = await response.json();

        const fetchedRooms = data.rooms
            .filter((room: any) => !pinned.some(p => p.id === room.username))
            .slice(0, availableSlots);

        const newWindows: WindowConfig[] = fetchedRooms.map((room: any) => ({
            id: room.username,
            room: room.username,
            x: 50, y: 50, width: 800, height: 600
        }));

        let updatedDiscovery = {
            ...discovery!,
            windows: [...pinned, ...newWindows],
            zIndexes: Object.fromEntries([...pinned, ...newWindows].map((w, idx) => [w.id, idx + 1]))
        };
        updatedDiscovery = arrangeWindowsInternal(updatedDiscovery);

        useRootStore.setState({
            discoveryOffset: newOffset,
            spaces: root.spaces.map(s => s.id === 'discovery' ? updatedDiscovery : s),
            isLoadingDiscovery: false
        });
    },

    loadNextDiscovery: async () => {
        const root = useRootStore.getState();
        await get().loadDiscoveryPage(root.discoveryOffset + 10, true);
    },

    loadPrevDiscovery: async () => {
        const root = useRootStore.getState();
        const newOffset = Math.max(0, root.discoveryOffset - 10);
        await get().loadDiscoveryPage(newOffset, true);
    },

    togglePin: (windowId: string) => {
        const root = useRootStore.getState();
        const discovery = root.spaces.find(s => s.id === 'discovery');
        if (!discovery) return;

        const updatedWindows = discovery.windows.map(w =>
            w.id === windowId ? { ...w, pinned: !w.pinned } : w
        );

        useRootStore.setState({
            spaces: root.spaces.map(s =>
                s.id === 'discovery' ? { ...discovery, windows: updatedWindows } : s
            )
        });
    },

    addSpaceFromPinned: () => {
        const root = useRootStore.getState();
        const discovery = root.spaces.find(s => s.id === 'discovery');
        if (!discovery) return;

        const pinnedWindows = discovery.windows.filter(w => w.pinned);
        if (pinnedWindows.length === 0) return;

        const id = Math.random().toString(36).substring(2, 9);
        const totalSpaces = root.spaces.length;
        const finalName = `Space ${totalSpaces + 1}`;

        const newSpace = {
            id,
            name: finalName,
            windows: pinnedWindows.map(w => ({ ...w, pinned: undefined })),
            zIndexes: Object.fromEntries(pinnedWindows.map((w, idx) => [w.id, idx + 1])),
            autoArrange: true
        };

        useRootStore.setState({
            spaces: [...root.spaces, newSpace],
            activeSpaceId: id
        });
    },

    setDiscoveryLimit: (limit) => {
        useRootStore.setState({ discoveryLimit: limit, discoveryOffset: 0 });
        get().loadDiscoveryPage(0);
    },
}));
