import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WindowConfig {
  id: string;
  room: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface LayoutState {
  windows: WindowConfig[];
  zIndexes: Record<string, number>;
  addWindow: (room: string) => void;
  updateWindow: (id: string, pos: Partial<WindowConfig>) => void;
  removeWindow: (id: string) => void;
  arrangeWindows: () => void;
  bringToFront: (id: string) => void;
}

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set, get) => ({
      windows: [],
      zIndexes: {},
      addWindow: (room) => set((state) => {
        const id = Math.random().toString(36).substring(2, 9);
        const maxZ = Math.max(0, ...Object.values(state.zIndexes));
        return {
          windows: [
            ...state.windows,
            { id, room, x: 50, y: 50, width: 800, height: 600 }
          ],
          zIndexes: { ...state.zIndexes, [id]: maxZ + 1 }
        };
      }),
      updateWindow: (id, pos) => set((state) => ({
        windows: state.windows.map((w) => w.id === id ? { ...w, ...pos } : w)
      })),
      removeWindow: (id) => set((state) => {
        const newZ = { ...state.zIndexes };
        delete newZ[id];
        return {
          windows: state.windows.filter(w => w.id !== id),
          zIndexes: newZ
        };
      }),
      arrangeWindows: () => {
        const windows = get().windows;
        const total = windows.length;
        if (total === 0) return;

        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight - 50;

        const cols = Math.ceil(Math.sqrt(total));
        const rows = Math.ceil(total / cols);

        const cellWidth = Math.floor(screenWidth / cols);
        const cellHeight = Math.floor(screenHeight / rows);

        const newWindows = windows.map((win, index) => {
          const col = index % cols;
          const row = Math.floor(index / cols);
          return {
            ...win,
            x: col * cellWidth,
            y: row * cellHeight + 50,
            width: cellWidth,
            height: cellHeight
          };
        });

        set({ windows: newWindows });
      },
      bringToFront: (id) => {
        const state = get();
        const maxZ = Math.max(0, ...Object.values(state.zIndexes));
        set({
          zIndexes: { ...state.zIndexes, [id]: maxZ + 1 }
        });
      }
    }),
    { name: 'layout-storage' }
  )
);
