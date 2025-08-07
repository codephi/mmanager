import type { HlsDownloader } from "./HlsDownloader";

export interface InternalDownloadEntry {
  id: string;
  room: string;
  hlsSource: string;
  downloader: HlsDownloader;
  startTime: number;
}
import type { Level } from "hls.js";

export class DownloadManager {
  startDownload(id: string, room: string, hlsSource: string): void;
  stopDownload(id: string): void;
  listDownloads(): PublicDownloadEntry[];
  getLevels(id: string): Level[]; // <-- retorna array de levels
  setLevel(id: string, levelIndex: number): void; // <-- INDEX numérico aqui
}

export interface PublicDownloadEntry {
  id: string;
  room: string;
  hlsSource: string;
  startTime: number;
  totalBytes: number;
}
