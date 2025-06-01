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

interface SpaceConfig {
  id: string;
  name: string;
  windows: WindowConfig[];
  zIndexes: Record<string, number>;
  autoArrange: boolean;
}

interface LayoutState {
  spaces: SpaceConfig[];
  activeSpaceId: string;
  addSpace: (name: string) => void;
  removeSpace: (id: string) => void;
  renameSpace: (id: string, name: string) => void;
  switchSpace: (id: string) => void;
  addWindow: (room: string) => void;
  updateWindow: (id: string, pos: Partial<WindowConfig>) => void;
  removeWindow: (id: string) => void;
  bringToFront: (id: string) => void;
  arrangeWindows: () => void;
  moveWindowToSpace: (windowId: string, targetSpaceId: string) => void;
  toggleAutoArrange: (spaceId: string) => void;
}

const arrangeWindowsInternal = (space: SpaceConfig): SpaceConfig => {
  const total = space.windows.length;
  if (total === 0) return space;

  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight - 50;
  const cols = Math.ceil(Math.sqrt(total));
  const rows = Math.ceil(total / cols);
  const cellWidth = Math.floor(screenWidth / cols);
  const cellHeight = Math.floor(screenHeight / rows);

  const newWindows = space.windows.map((win, index) => {
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

  return { ...space, windows: newWindows };
};


export const useLayoutStore = create<LayoutState>()(
  persist(
    (set, get) => ({
      spaces: [
        {
          id: 'default',
          name: 'Space 1',
          windows: [],
          zIndexes: {},
          autoArrange: true
        }
      ],
      activeSpaceId: 'default',

      addSpace: (name) => set((state) => {
        const id = Math.random().toString(36).substring(2, 9);
        const totalSpaces = state.spaces.length;
        const finalName = name.trim() !== '' ? name : `Space ${totalSpaces + 1}`;
        return {
          spaces: [...state.spaces, { id, name: finalName, windows: [], zIndexes: {}, autoArrange: false }],
          activeSpaceId: id
        };
      }),

      removeSpace: (id) => set((state) => {
        let newSpaces = state.spaces.filter(t => t.id !== id);
        if (newSpaces.length === 0) {
          newSpaces = [{ id: 'default', name: 'Space 1', windows: [], zIndexes: {}, autoArrange: true }];
        }
        return {
          spaces: newSpaces,
          activeSpaceId: newSpaces[0].id
        };
      }),

      renameSpace: (id, name) => set((state) => ({
        spaces: state.spaces.map(t => t.id === id ? { ...t, name } : t)
      })),

      switchSpace: (id) => set({ activeSpaceId: id }),

      addWindow: (room) => set((state) => {
        const space = state.spaces.find(t => t.id === state.activeSpaceId);
        if (!space) return state;

        const id = Math.random().toString(36).substring(2, 9);
        const maxZ = Math.max(0, ...Object.values(space.zIndexes));

        let updatedSpace = {
          ...space,
          windows: [...space.windows, { id, room, x: 50, y: 50, width: 800, height: 600 }],
          zIndexes: { ...space.zIndexes, [id]: maxZ + 1 }
        };

        if (updatedSpace.autoArrange) {
          updatedSpace = arrangeWindowsInternal(updatedSpace);
        }

        return {
          spaces: state.spaces.map(t => t.id === space.id ? updatedSpace : t)
        };
      }),


      updateWindow: (id, pos) => set((state) => {
        const space = state.spaces.find(t => t.id === state.activeSpaceId);
        if (!space) return state;

        const updatedWindows = space.windows.map(w => w.id === id ? { ...w, ...pos } : w);
        const updatedSpace = { ...space, windows: updatedWindows };

        return {
          spaces: state.spaces.map(t => t.id === space.id ? updatedSpace : t)
        };
      }),

      removeWindow: (id) => set((state) => {
        const space = state.spaces.find(t => t.id === state.activeSpaceId);
        if (!space) return state;

        const { [id]: _, ...newZIndexes } = space.zIndexes;
        const updatedSpace = {
          ...space,
          windows: space.windows.filter(w => w.id !== id),
          zIndexes: newZIndexes
        };

        return {
          spaces: state.spaces.map(t => t.id === space.id ? updatedSpace : t)
        };
      }),

      bringToFront: (id) => set((state) => {
        const space = state.spaces.find(t => t.id === state.activeSpaceId);
        if (!space) return state;

        const maxZ = Math.max(0, ...Object.values(space.zIndexes));
        const updatedSpace = {
          ...space,
          zIndexes: { ...space.zIndexes, [id]: maxZ + 1 }
        };

        return {
          spaces: state.spaces.map(t => t.id === space.id ? updatedSpace : t)
        };
      }),

      arrangeWindows: () => set((state) => {
        const space = state.spaces.find(t => t.id === state.activeSpaceId);
        if (!space) return state;

        const updatedSpace = arrangeWindowsInternal(space);
        return {
          spaces: state.spaces.map(t => t.id === space.id ? updatedSpace : t)
        };
      }),


      moveWindowToSpace: (windowId, targetSpaceId) => set((state) => {
        const activeSpace = state.spaces.find(s => s.id === state.activeSpaceId);
        const targetSpace = state.spaces.find(s => s.id === targetSpaceId);
        if (!activeSpace || !targetSpace) return state;

        const windowToMove = activeSpace.windows.find(w => w.id === windowId);
        if (!windowToMove) return state;

        let newTargetSpace = {
          ...targetSpace,
          windows: [...targetSpace.windows, windowToMove],
          zIndexes: { ...targetSpace.zIndexes, [windowId]: Math.max(0, ...Object.values(targetSpace.zIndexes)) + 1 }
        };

        if (newTargetSpace.autoArrange) {
          newTargetSpace = arrangeWindowsInternal(newTargetSpace);
        }

        const newActiveSpace = {
          ...activeSpace,
          windows: activeSpace.windows.filter(w => w.id !== windowId),
          zIndexes: Object.fromEntries(Object.entries(activeSpace.zIndexes).filter(([id]) => id !== windowId))
        };

        return {
          spaces: state.spaces.map(s => {
            if (s.id === newActiveSpace.id) return newActiveSpace;
            if (s.id === newTargetSpace.id) return newTargetSpace;
            return s;
          })
        };
      }),


      toggleAutoArrange: (spaceId) => set((state) => ({
        spaces: state.spaces.map(space =>
          space.id === spaceId ? { ...space, autoArrange: !space.autoArrange } : space
        )
      })),

    }),
    { name: 'layout-storage' }
  )
);
