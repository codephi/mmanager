import { create } from "zustand";
import type { SpaceConfig, WindowConfig } from "./types";
import { arrangeWindowsInternal } from "./utils";
import { persist } from "zustand/middleware";
import { useDiscoveryStore } from "./discoveryStore";

export type FilterMode = "online" | "offline" | "all";

interface SpacesState {
  spaces: SpaceConfig[];
  activeSpaceId: string;
  globalMuted: boolean;
  filterMode: FilterMode;
  pinnedWindows: WindowConfig[];
  getSpaces: () => SpaceConfig[];
  getActiveSpaceId: () => string;
  getCurrentSpace: () => SpaceConfig | undefined;
  getSpace: (id: string) => SpaceConfig | undefined;
  updateSpace: (id: string, updated: SpaceConfig) => void;
  setActiveSpace: (id: string) => void;
  addSpace: (name: string) => void;
  removeSpace: (id: string) => void;
  renameSpace: (id: string, name: string) => void;
  createSpaceFromPinned: (pinnedWindows: WindowConfig[]) => void;
  bringToFront: (id: string) => void;
  arrangeWindows: () => void;
  copyWindowToSpace: (windowId: string, targetSpaceId: string) => void;
  setWindowVolume: (windowId: string, volume: number) => void;
  arrangeFilteredWindows: () => void;
  setFilterMode: (mode: FilterMode) => void;
  toggleGlobalMuted: () => void;
  toggleWindowMute: (windowId: string) => void;
  setGlobalMuted: (muted: boolean) => void;
  togglePin: (windowId: string) => void;
  updatePinnedWindow: (
    windowId: string,
    updates: Partial<WindowConfig>
  ) => void;
  setWindowMaximized: (id: string, maximized: boolean) => void;
}

export const useSpacesStore = create<SpacesState>()(
  persist(
    (set, get) => ({
      spaces: [
        {
          id: "discovery",
          name: "Discovery",
          windows: [],
          zIndexes: {},
          autoArrange: true,
        },
      ],
      activeSpaceId: "discovery",
      pinnedWindows: [],
      globalMuted: false,
      filterMode: "all",

      getSpaces: () => get().spaces,

      getActiveSpaceId: () => get().activeSpaceId,

      getSpace: (id) => {
        const spaces = get().spaces;
        return spaces.find((s) => s.id === id);
      },

      updateSpace: (id, updated) => {
        set((state) => ({
          spaces: state.spaces.map((s) => (s.id === id ? updated : s)),
        }));
      },

      setActiveSpace: (id) => {
        set({ activeSpaceId: id });

        if (id === "discovery") {
          // força o carregamento sempre que ativar discovery
          useDiscoveryStore.getState().loadDiscovery();
        } else {
          get().arrangeFilteredWindows();
        }
      },

      addSpace: (name) => {
        set((state) => {
          const id = Math.random().toString(36).substring(2, 9);
          const totalSpaces = state.spaces.length;
          const finalName =
            name.trim() !== "" ? name : `Space ${totalSpaces + 1}`;

          const newSpace: SpaceConfig = {
            id,
            name: finalName,
            windows: [],
            zIndexes: {},
            autoArrange: true,
          };

          return {
            spaces: [...state.spaces, newSpace],
          };
        });
      },

      removeSpace: (id) => {
        set((state) => {
          if (id === "discovery") return state; // nunca remove discovery

          let newSpaces = state.spaces.filter((s) => s.id !== id);
          if (newSpaces.length === 0) {
            newSpaces = [
              {
                id: "default",
                name: "Space 1",
                windows: [],
                zIndexes: {},
                autoArrange: true,
              },
            ];
          }

          return {
            spaces: newSpaces,
            activeSpaceId: newSpaces[0].id,
          };
        });
      },

      renameSpace: (id, name) => {
        set((state) => ({
          spaces: state.spaces.map((s) => (s.id === id ? { ...s, name } : s)),
        }));
      },

      createSpaceFromPinned: (pinnedWindows) => {
        set((state) => {
          const id = Math.random().toString(36).substring(2, 9);
          const totalSpaces = state.spaces.length;
          const finalName = `Space ${totalSpaces + 1}`;

          const newSpace: SpaceConfig = {
            id,
            name: finalName,
            windows: pinnedWindows.map((w) => ({ ...w, pinned: undefined })),
            zIndexes: Object.fromEntries(
              pinnedWindows.map((w, idx) => [w.id, idx + 1])
            ),
            autoArrange: true,
          };

          return {
            spaces: [...state.spaces, newSpace],
            activeSpaceId: id,
          };
        });
      },

      bringToFront: (id) => {
        set((state) => {
          const activeSpaceId = state.activeSpaceId;
          const activeSpace = state.spaces.find((s) => s.id === activeSpaceId);
          if (!activeSpace) return state;

          const maxZ = Math.max(0, ...Object.values(activeSpace.zIndexes));
          const zIndexes = { ...activeSpace.zIndexes, [id]: maxZ + 1 };
          return {
            spaces: state.spaces.map((s) =>
              s.id === activeSpaceId ? { ...activeSpace, zIndexes } : s
            ),
          };
        });
      },

      arrangeWindows: () => {
        set((state) => {
          const activeSpaceId = state.activeSpaceId;
          const activeSpace = state.spaces.find((s) => s.id === activeSpaceId);
          if (!activeSpace) return state;

          const updatedSpace = arrangeWindowsInternal(activeSpace);
          return {
            spaces: state.spaces.map((s) =>
              s.id === activeSpaceId ? updatedSpace : s
            ),
          };
        });
      },

      copyWindowToSpace: (windowId, targetSpaceId) => {
        set((state) => {
          const activeSpaceId = state.activeSpaceId;
          const activeSpace = state.spaces.find((s) => s.id === activeSpaceId);
          const targetSpace = state.spaces.find((s) => s.id === targetSpaceId);
          if (!activeSpace || !targetSpace) return state;

          // Verifica se o window já existe no targetSpace
          if (targetSpace.windows.some((w) => w.id === windowId)) {
            return state;
          }

          const windowToCopy = activeSpace.windows.find(
            (w) => w.id === windowId
          );
          if (!windowToCopy) return state;

          let newTargetSpace = {
            ...targetSpace,
            windows: [...targetSpace.windows, { ...windowToCopy }], // faz uma cópia para garantir imutabilidade
            zIndexes: {
              ...targetSpace.zIndexes,
              [windowId]:
                Math.max(0, ...Object.values(targetSpace.zIndexes)) + 1,
            },
          };

          if (newTargetSpace.autoArrange) {
            newTargetSpace = arrangeWindowsInternal(newTargetSpace);
          }

          return {
            spaces: state.spaces.map((s) => {
              if (s.id === newTargetSpace.id) return newTargetSpace;
              return s;
            }),
          };
        });
      },

      setWindowVolume: (id, volume) => {
        set((state) => {
          const activeSpaceId = state.activeSpaceId;
          const activeSpace = state.spaces.find((s) => s.id === activeSpaceId);
          if (!activeSpace) return state;

          const windows = activeSpace.windows.map((win) =>
            win.id === id ? { ...win, volume, isMuted: volume === 0 } : win
          );
          const updatedSpace = { ...activeSpace, windows };

          return {
            spaces: state.spaces.map((s) =>
              s.id === activeSpaceId ? updatedSpace : s
            ),
          };
        });
      },

      setFilterMode: (mode) => {
        set((state) => ({ ...state, filterMode: mode }));

        set((state) => {
          const activeSpaceId = state.activeSpaceId;
          const activeSpace = state.spaces.find((s) => s.id === activeSpaceId);
          if (activeSpace?.autoArrange) {
            state.arrangeFilteredWindows();
          }
          return {};
        });
      },

      arrangeFilteredWindows: () => {
        set((state) => {
          const activeSpaceId = state.activeSpaceId;
          const activeSpace = state.spaces.find((s) => s.id === activeSpaceId);
          if (!activeSpace) return state;

          let filteredWindows = activeSpace.windows;
          const filterMode = state.filterMode;

          if (filterMode === "online") {
            filteredWindows = filteredWindows.filter(
              (w) => w.isOnline === true
            );
          } else if (filterMode === "offline") {
            filteredWindows = filteredWindows.filter(
              (w) => w.isOnline === false
            );
          }

          // Se não há janelas filtradas, não reorganiza nada
          if (filteredWindows.length === 0) return state;

          // Cria um novo SpaceConfig apenas com os windows filtrados para passar ao arrangeWindowsInternal
          const tempSpace: SpaceConfig = {
            ...activeSpace,
            windows: filteredWindows,
          };

          const arrangedSpace = arrangeWindowsInternal(tempSpace);
          const arrangedWindows = arrangedSpace.windows;

          // Agora aplicamos as novas posições apenas para os windows filtrados
          const updatedWindows = activeSpace.windows.map((win) => {
            const arranged = arrangedWindows.find((w) => w.id === win.id);
            return arranged ? arranged : win;
          });

          return {
            spaces: state.spaces.map((s) =>
              s.id === activeSpaceId
                ? { ...activeSpace, windows: updatedWindows }
                : s
            ),
          };
        });
      },

      toggleWindowMute: (id) => {
        set((state) => {
          const activeSpaceId = state.activeSpaceId;
          const activeSpace = state.spaces.find((s) => s.id === activeSpaceId);
          if (!activeSpace) return state;

          const windows = activeSpace.windows.map((win) =>
            win.id === id ? { ...win, isMuted: !win.isMuted } : win
          );
          return {
            spaces: state.spaces.map((s) =>
              s.id === activeSpaceId ? { ...activeSpace, windows } : s
            ),
          };
        });
      },

      toggleGlobalMuted: () => {
        set((state) => {
          const newMuted = !state.globalMuted;
          return {
            spaces: state.spaces.map((space) => ({
              ...space,
              windows: space.windows.map((w) => ({ ...w, isMuted: newMuted })),
            })),
            globalMuted: newMuted,
          };
        });
      },

      setGlobalMuted: (muted) =>
        set({
          globalMuted: muted,
          spaces: get().spaces.map((space) => ({
            ...space,
            windows: space.windows.map((w) => ({ ...w, isMuted: muted })),
          })),
        }),

      togglePin: (windowId: string) => {
        set((state) => {
          const activeSpaceId = state.activeSpaceId;
          const activeSpace = state.spaces.find((s) => s.id === activeSpaceId);
          if (!activeSpace) return state;

          const windowToToggle = activeSpace.windows.find(
            (w) => w.id === windowId
          );
          if (!windowToToggle) return state;

          const alreadyPinned = state.pinnedWindows.some(
            (w) => w.id === windowId
          );

          // Se já está pinado, remove do global
          if (alreadyPinned) {
            return {
              pinnedWindows: state.pinnedWindows.filter(
                (w) => w.id !== windowId
              ),
            };
          }

          // Se não está pinado, adiciona ao global mantendo posição/tamanho atual
          return {
            pinnedWindows: [
              ...state.pinnedWindows,
              { ...windowToToggle, pinned: true },
            ],
          };
        });
      },

      updatePinnedWindow: (id, updates) => {
        set((state) => ({
          pinnedWindows: state.pinnedWindows.map((w) =>
            w.id === id ? { ...w, ...updates, zIndex: 100000 } : w
          ),
        }));
      },

      getCurrentSpace: () => {
        const activeSpaceId = get().activeSpaceId;
        return get().spaces.find((s) => s.id === activeSpaceId);
      },

      setWindowMaximized: (id, maximized) => {
        set((state) => {
          const spaces = state.spaces.map((space) => {
            const updatedWindows = space.windows.map((w) =>
              w.id === id ? { ...w, maximized } : w
            );
            return { ...space, windows: updatedWindows };
          });
          return { spaces };
        });
      },
    }),
    {
      name: "spaces-storage",
    }
  )
);
