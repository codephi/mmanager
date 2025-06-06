import { create } from "zustand";
import { DownloadManager } from "../utils/DownloadManager.js"; // considerando seu manager atualizado
import type { Level as HlsLevel } from "hls.js";

export const downloadManager = new DownloadManager();

interface Level {
  height: number;
  bitrate: number;
}

interface DownloadEntry {
  id: string;
  room: string;
  hlsSource: string;
  startTime: number;
}

interface DownloadState {
  downloads: DownloadEntry[];
  refresh: () => void;
  start: (id: string, room: string, hlsSource: string) => void;
  stop: (id: string) => void;
  getLevels: (id: string) => Level[];
  setLevel: (id: string, levelIndex: number) => void;
}

export const useDownloadStore = create<DownloadState>((set) => ({
  downloads: [],

  refresh: () => {
    const list = downloadManager.listDownloads();
    set({ downloads: list });
  },

  start: (id, room, hlsSource) => {
    downloadManager.startDownload(id, room, hlsSource);
    set({ downloads: downloadManager.listDownloads() });
  },

  stop: (id) => {
    downloadManager.stopDownload(id);
    set({ downloads: downloadManager.listDownloads() });
  },

  getLevels: (id): Level[] => {
    const levels: HlsLevel[] = downloadManager.getLevels(id);
    if (!levels) return [];
    return levels.map((level) => ({
      height: level.height,
      bitrate: level.bitrate,
    }));
  },

  setLevel: (id, levelIndex) => {
    const levels = downloadManager.getLevels(id);
    if (!levels || levelIndex < 0 || levelIndex >= levels.length) return;
    downloadManager.setLevel(id, levelIndex);
    set({ downloads: downloadManager.listDownloads() });
  },
}));
