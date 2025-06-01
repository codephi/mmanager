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

interface TabConfig {
  id: string;
  name: string;
  windows: WindowConfig[];
  zIndexes: Record<string, number>;
}

interface LayoutState {
  tabs: TabConfig[];
  activeTabId: string;
  addTab: (name: string) => void;
  removeTab: (id: string) => void;
  renameTab: (id: string, name: string) => void;
  switchTab: (id: string) => void;
  addWindow: (room: string) => void;
  updateWindow: (id: string, pos: Partial<WindowConfig>) => void;
  removeWindow: (id: string) => void;
  bringToFront: (id: string) => void;
  arrangeWindows: () => void;
}

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set, get) => ({
      tabs: [
        {
          id: 'default',
          name: 'Workspace 1',
          windows: [],
          zIndexes: {},
        }
      ],
      activeTabId: 'default',

      addTab: (name) => set((state) => {
        const id = Math.random().toString(36).substring(2, 9);
        return {
          tabs: [...state.tabs, { id, name, windows: [], zIndexes: {} }],
          activeTabId: id
        };
      }),

      removeTab: (id) => set((state) => {
        let newTabs = state.tabs.filter(t => t.id !== id);
        if (newTabs.length === 0) {
          newTabs = [{ id: 'default', name: 'Workspace 1', windows: [], zIndexes: {} }];
        }
        return {
          tabs: newTabs,
          activeTabId: newTabs[0].id
        };
      }),

      renameTab: (id, name) => set((state) => ({
        tabs: state.tabs.map(t => t.id === id ? { ...t, name } : t)
      })),

      switchTab: (id) => set({ activeTabId: id }),

      addWindow: (room) => set((state) => {
        const tab = state.tabs.find(t => t.id === state.activeTabId);
        if (!tab) return state;

        const id = Math.random().toString(36).substring(2, 9);
        const maxZ = Math.max(0, ...Object.values(tab.zIndexes));

        const updatedTab = {
          ...tab,
          windows: [...tab.windows, { id, room, x: 50, y: 50, width: 800, height: 600 }],
          zIndexes: { ...tab.zIndexes, [id]: maxZ + 1 }
        };

        return {
          tabs: state.tabs.map(t => t.id === tab.id ? updatedTab : t)
        };
      }),

      updateWindow: (id, pos) => set((state) => {
        const tab = state.tabs.find(t => t.id === state.activeTabId);
        if (!tab) return state;

        const updatedWindows = tab.windows.map(w => w.id === id ? { ...w, ...pos } : w);
        const updatedTab = { ...tab, windows: updatedWindows };

        return {
          tabs: state.tabs.map(t => t.id === tab.id ? updatedTab : t)
        };
      }),

      removeWindow: (id) => set((state) => {
        const tab = state.tabs.find(t => t.id === state.activeTabId);
        if (!tab) return state;

        const { [id]: _, ...newZIndexes } = tab.zIndexes;
        const updatedTab = {
          ...tab,
          windows: tab.windows.filter(w => w.id !== id),
          zIndexes: newZIndexes
        };

        return {
          tabs: state.tabs.map(t => t.id === tab.id ? updatedTab : t)
        };
      }),

      bringToFront: (id) => set((state) => {
        const tab = state.tabs.find(t => t.id === state.activeTabId);
        if (!tab) return state;

        const maxZ = Math.max(0, ...Object.values(tab.zIndexes));
        const updatedTab = {
          ...tab,
          zIndexes: { ...tab.zIndexes, [id]: maxZ + 1 }
        };

        return {
          tabs: state.tabs.map(t => t.id === tab.id ? updatedTab : t)
        };
      }),

      arrangeWindows: () => set((state) => {
        const tab = state.tabs.find(t => t.id === state.activeTabId);
        if (!tab) return state;

        const total = tab.windows.length;
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight - 50;
        const cols = Math.ceil(Math.sqrt(total));
        const rows = Math.ceil(total / cols);
        const cellWidth = Math.floor(screenWidth / cols);
        const cellHeight = Math.floor(screenHeight / rows);

        const newWindows = tab.windows.map((win, index) => {
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

        const updatedTab = { ...tab, windows: newWindows };

        return {
          tabs: state.tabs.map(t => t.id === tab.id ? updatedTab : t)
        };
      }),
    }),
    { name: 'layout-storage' }
  )
);
