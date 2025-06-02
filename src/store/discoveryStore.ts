import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useSpacesStore } from './spacesStore';
import type { WindowConfig, SpaceConfig } from './spacesStore';
import { arrangeWindows } from '../utils/arrangeWindows';

interface DiscoveryState {
    discoveryOffset: number;
    isLoadingDiscovery: boolean;
    discoveryLimit: number;
    loadDiscovery: () => Promise<void>;
    loadDiscoveryPage: (offset: number) => Promise<void>;
    loadNextDiscovery: () => Promise<void>;
    loadPrevDiscovery: () => Promise<void>;
    setDiscoveryLimit: (limit: number) => void;
    togglePin: (windowId: string) => void;
    addSpaceFromPinned: () => void;
}

export const useDiscoveryStore = create<DiscoveryState>()(
    persist(
        (set, get) => ({

            discoveryOffset: 0,
            isLoadingDiscovery: false,
            discoveryLimit: 6,

            loadDiscovery: async () => {
                const state = get();
                if (state.isLoadingDiscovery) return;
                set({ isLoadingDiscovery: true });

                const offset = state.discoveryOffset;

                try {
                    const response = await fetch(`https://pt.chaturbate.com/api/ts/roomlist/room-list/?limit=10&offset=${offset}`);
                    const data = await response.json();

                    const spaces = useSpacesStore.getState().spaces;
                    const discovery = spaces.find(s => s.id === 'discovery');
                    if (!discovery) return;

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

                    updatedDiscovery = arrangeWindows(updatedDiscovery);

                    useSpacesStore.setState({
                        spaces: spaces.map(s => s.id === 'discovery' ? updatedDiscovery : s)
                    });

                    set({ discoveryOffset: offset + 10 });
                } catch (err) {
                    console.error('Erro carregando discovery:', err);
                } finally {
                    set({ isLoadingDiscovery: false });
                }
            },

            loadDiscoveryPage: async (newOffset: number) => {
                const state = get();
                if (state.isLoadingDiscovery) return;

                set({ isLoadingDiscovery: true });

                const spaces = useSpacesStore.getState().spaces;
                const discovery = spaces.find(s => s.id === 'discovery');
                const pinned = discovery?.windows.filter(w => w.pinned) ?? [];
                const availableSlots = Math.max(0, state.discoveryLimit - pinned.length);
                if (availableSlots === 0) {
                    let updatedDiscovery = {
                        ...discovery!,
                        windows: [...pinned],
                        zIndexes: Object.fromEntries(pinned.map((w, idx) => [w.id, idx + 1]))
                    };
                    updatedDiscovery = arrangeWindows(updatedDiscovery);
                    useSpacesStore.setState({
                        spaces: spaces.map(s => s.id === 'discovery' ? updatedDiscovery : s)
                    });
                    set({ isLoadingDiscovery: false });
                    return;
                }

                try {
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
                        zIndexes: Object.fromEntries(
                            [...pinned, ...newWindows].map((w, idx) => [w.id, idx + 1])
                        )
                    };

                    updatedDiscovery = arrangeWindows(updatedDiscovery);

                    useSpacesStore.setState({
                        spaces: spaces.map(s => s.id === 'discovery' ? updatedDiscovery : s)
                    });

                    set({ discoveryOffset: newOffset });
                } catch (err) {
                    console.error('Erro discovery page:', err);
                } finally {
                    set({ isLoadingDiscovery: false });
                }
            },

            loadNextDiscovery: async () => {
                const state = get();
                await get().loadDiscoveryPage(state.discoveryOffset + 10);
            },

            loadPrevDiscovery: async () => {
                const state = get();
                const newOffset = Math.max(0, state.discoveryOffset - 10);
                await get().loadDiscoveryPage(newOffset);
            },

            setDiscoveryLimit: (limit) => {
                set({ discoveryLimit: limit, discoveryOffset: 0 });
                get().loadDiscoveryPage(0);
            },

            togglePin: (windowId: string) => {
                const spaces = useSpacesStore.getState().spaces;
                const discovery = spaces.find(s => s.id === 'discovery');
                if (!discovery) return;

                const updatedWindows = discovery.windows.map(w =>
                    w.id === windowId ? { ...w, pinned: !w.pinned } : w
                );

                useSpacesStore.setState({
                    spaces: spaces.map(s => s.id === 'discovery' ? { ...discovery, windows: updatedWindows } : s)
                });
            },

            addSpaceFromPinned: () => {
                const spaces = useSpacesStore.getState().spaces;
                const discovery = spaces.find(s => s.id === 'discovery');
                if (!discovery) return;

                const pinnedWindows = discovery.windows.filter(w => w.pinned);
                if (pinnedWindows.length === 0) return;

                const id = `space-${Date.now()}`;
                const finalName = `Space ${spaces.length + 1}`;

                const newSpace: SpaceConfig = {
                    id,
                    name: finalName,
                    windows: pinnedWindows.map(w => ({ ...w, pinned: undefined })),
                    zIndexes: Object.fromEntries(pinnedWindows.map((w, idx) => [w.id, idx + 1])),
                    autoArrange: true
                };

                useSpacesStore.setState({
                    spaces: [...spaces, newSpace]
                });
            },

        }),
        { name: 'discovery-storage' }
    )
);
