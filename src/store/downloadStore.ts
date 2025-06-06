import { create } from "zustand";

interface DownloadEntry {
  id: string;
  room: string;
  stop: () => void;
  startTime: number; // garante que o tempo de início é sempre registrado
}

interface DownloadState {
  downloads: DownloadEntry[];
  startDownload: (windowId: string, room: string, stopFn: () => void) => void;
  stopDownload: (windowId: string) => void;
}

export const useDownloadStore = create<DownloadState>((set) => ({
  downloads: [],

  startDownload: (windowId, room, stopFn) =>
    set((state) => {
      if (state.downloads.find((d) => d.id === windowId)) return state;
      const startTime = Date.now(); // <-- garante sempre aqui
      return {
        downloads: [
          ...state.downloads,
          { id: windowId, room, stop: stopFn, startTime },
        ],
      };
    }),

  stopDownload: (windowId) =>
    set((state) => ({
      downloads: state.downloads.filter((d) => d.id !== windowId),
    })),
}));
