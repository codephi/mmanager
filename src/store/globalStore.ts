import { create } from 'zustand';

interface GlobalState {
    activeSpaceId: string;
    globalMuted: boolean;
    filterMode: 'all' | 'online' | 'offline';
    setActiveSpaceId: (id: string) => void;
    toggleGlobalMuted: () => void;
    setFilterMode: (mode: 'all' | 'online' | 'offline') => void;
}

export const useGlobalStore = create<GlobalState>((set, get) => ({
    activeSpaceId: 'discovery',
    globalMuted: false,
    filterMode: 'all',

    setActiveSpaceId: (id) => set({ activeSpaceId: id }),

    toggleGlobalMuted: () => set((state) => ({ globalMuted: !state.globalMuted })),

    setFilterMode: (mode) => set({ filterMode: mode }),
}));
