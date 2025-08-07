import { HlsDownloader } from "./HlsDownloader";
import streamSaver from "streamsaver";

export class DownloadManager {
  constructor() {
    this.downloads = new Map();
  }

  startDownload(id, room, hlsSource) {
    if (this.downloads.has(id)) return;

    const now = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `${room}-${now}.ts`;

    const fileStream = streamSaver.createWriteStream(filename);
    const writer = fileStream.getWriter();

    const downloader = new HlsDownloader(hlsSource, writer);

    this.downloads.set(id, {
      id,
      room,
      hlsSource,
      downloader,
      startTime: Date.now(),
    });
  }

  stopDownload(id) {
    const download = this.downloads.get(id);
    if (!download) return;
    download.downloader.stop();
    this.downloads.delete(id);
  }

  listDownloads() {
    return Array.from(this.downloads.values()).map((d) => ({
      id: d.id,
      room: d.room,
      hlsSource: d.hlsSource,
      startTime: d.startTime,
      totalBytes: d.downloader.getTotalBytes(),
    }));
  }

  getLevels(id) {
    const download = this.downloads.get(id);
    if (!download) return [];
    return download.downloader.getLevels() ?? [];
  }

  setLevel(id, levelIndex) {
    const download = this.downloads.get(id);
    if (!download) return;
    download.downloader.setLevel(levelIndex);
  }
}

export const downloadManager = new DownloadManager();
