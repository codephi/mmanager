import Hls from "hls.js";

export class HlsDownloader {
  constructor(url, fileStream) {
    this.fileStream = fileStream;
    this.totalBytes = 0; // Rastrear total de bytes baixados

    this.hls = new Hls({
      enableWorker: false,
      lowLatencyMode: false,
    });

    const dummyVideo = document.createElement("video");
    dummyVideo.muted = true;
    dummyVideo.volume = 0;
    dummyVideo.playsInline = true;
    dummyVideo.autoplay = true;

    this.hls.attachMedia(dummyVideo);
    this.hls.loadSource(url);

    dummyVideo.play().catch((err) => {
      console.warn("Silent autoplay rejected:", err);
    });

    this.hls.on(Hls.Events.FRAG_LOADED, async (event, data) => {
      try {
        const fragUrl = data.frag.url;
        const response = await fetch(fragUrl);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);
        this.totalBytes += buffer.length; // Incrementar o contador de bytes
        await this.fileStream.write(buffer);
      } catch (err) {
        console.error("Erro ao baixar fragmento:", err);
      }
    });
  }

  getLevels() {
    return this.hls.levels;
  }

  setLevel(index) {
    this.hls.currentLevel = index;
  }

  getTotalBytes() {
    return this.totalBytes;
  }

  stop() {
    this.hls.destroy();
    this.fileStream.close();
  }
}
