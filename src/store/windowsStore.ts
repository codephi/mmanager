import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import { arrangeWindows } from '../utils/arrangeWindows';
import { useSpacesStore, type WindowConfig } from './spacesStore';

interface WindowsState {
    updateWindow: (id: string, pos: Partial<WindowConfig>) => void;
    removeWindow: (id: string) => void;
    bringToFront: (id: string) => void;
    addWindow: (room: string) => void;
    setWindowVolume: (id: string, volume: number) => void;
    toggleWindowMute: (id: string) => void;
}

export const useWindowsStore = create<WindowsState>()(
    persist(
        (set, get) => ({

            addWindow: (room) => {
                const spacesState = useSpacesStore.getState();
                const activeSpace = spacesState.spaces.find(t => t.id === spacesState.spaces[0].id);
                if (!activeSpace) return;

                const alreadyExists = activeSpace.windows.some(w => w.room === room);
                if (alreadyExists) return;

                const id = nanoid();
                const maxZ = Math.max(0, ...Object.values(activeSpace.zIndexes));

                let updatedSpace = {
                    ...activeSpace,
                    windows: [...activeSpace.windows, { id, room, x: 50, y: 50, width: 800, height: 600 }],
                    zIndexes: { ...activeSpace.zIndexes, [id]: maxZ + 1 }
                };

                if (updatedSpace.autoArrange) {
                    updatedSpace = arrangeWindows(updatedSpace);
                }

                useSpacesStore.setState({
                    spaces: spacesState.spaces.map(s => s.id === activeSpace.id ? updatedSpace : s)
                });
            },

            updateWindow: (id, pos) => {
                const spacesState = useSpacesStore.getState();
                const activeSpace = spacesState.spaces.find(t => t.id === spacesState.spaces[0].id);
                if (!activeSpace) return;

                const updatedWindows = activeSpace.windows.map(w => w.id === id ? { ...w, ...pos } : w);
                const updatedSpace = { ...activeSpace, windows: updatedWindows };

                useSpacesStore.setState({
                    spaces: spacesState.spaces.map(s => s.id === activeSpace.id ? updatedSpace : s)
                });
            },

            removeWindow: (id) => {
                const spacesState = useSpacesStore.getState();
                const activeSpace = spacesState.spaces.find(t => t.id === spacesState.spaces[0].id);
                if (!activeSpace) return;

                const { [id]: _, ...newZIndexes } = activeSpace.zIndexes;
                let updatedSpace = {
                    ...activeSpace,
                    windows: activeSpace.windows.filter(w => w.id !== id),
                    zIndexes: newZIndexes
                };

                if (updatedSpace.autoArrange) {
                    updatedSpace = arrangeWindows(updatedSpace);
                }

                useSpacesStore.setState({
                    spaces: spacesState.spaces.map(s => s.id === activeSpace.id ? updatedSpace : s)
                });
            },

            bringToFront: (id) => {
                const spacesState = useSpacesStore.getState();
                const activeSpace = spacesState.spaces.find(t => t.id === spacesState.spaces[0].id);
                if (!activeSpace) return;

                const maxZ = Math.max(0, ...Object.values(activeSpace.zIndexes));
                const updatedSpace = {
                    ...activeSpace,
                    zIndexes: { ...activeSpace.zIndexes, [id]: maxZ + 1 }
                };

                useSpacesStore.setState({
                    spaces: spacesState.spaces.map(s => s.id === activeSpace.id ? updatedSpace : s)
                });
            },

            setWindowVolume: (id, volume) => {
                const spacesState = useSpacesStore.getState();
                const activeSpace = spacesState.spaces.find(t => t.id === spacesState.spaces[0].id);
                if (!activeSpace) return;

                const updatedWindows = activeSpace.windows.map(win =>
                    win.id === id ? { ...win, volume, isMuted: volume === 0 } : win
                );
                const updatedSpace = { ...activeSpace, windows: updatedWindows };

                useSpacesStore.setState({
                    spaces: spacesState.spaces.map(s => s.id === activeSpace.id ? updatedSpace : s)
                });
            },

            toggleWindowMute: (id) => {
                const spacesState = useSpacesStore.getState();
                const activeSpace = spacesState.spaces.find(t => t.id === spacesState.spaces[0].id);
                if (!activeSpace) return;

                const updatedWindows = activeSpace.windows.map(win =>
                    win.id === id ? { ...win, isMuted: !win.isMuted } : win
                );
                const updatedSpace = { ...activeSpace, windows: updatedWindows };

                useSpacesStore.setState({
                    spaces: spacesState.spaces.map(s => s.id === activeSpace.id ? updatedSpace : s)
                });
            },

        }),
        { name: 'windows-storage' }
    )
);
