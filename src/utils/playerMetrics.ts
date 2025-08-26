import Hls from 'hls.js';

interface PlayerMetrics {
  latency: number;
  bufferHealth: number;
  qualityLevel: number;
  droppedFrames: number;
  bitrateAverage: number;
  events: {
    timestamp: number;
    type: string;
    data?: any;
  }[];
}

class PlayerMetricsMonitor {
  private metrics: PlayerMetrics;
  private hls: Hls;
  private video: HTMLVideoElement;
  private startTime: number;
  private updateInterval: number;
  private intervalId?: number;

  constructor(hls: Hls, video: HTMLVideoElement) {
    this.hls = hls;
    this.video = video;
    this.startTime = Date.now();
    this.updateInterval = 1000; // 1 segundo

    this.metrics = {
      latency: 0,
      bufferHealth: 0,
      qualityLevel: 0,
      droppedFrames: 0,
      bitrateAverage: 0,
      events: [],
    };

    this.setupEventListeners();
  }

  private setupEventListeners() {
    // Monitorar eventos do HLS.js
    this.hls.on(Hls.Events.FRAG_LOADING, () => {
      this.logEvent('FRAG_LOADING');
    });

    this.hls.on(Hls.Events.FRAG_LOADED, () => {
      this.logEvent('FRAG_LOADED');
      this.updateBitrateMetrics();
    });

    this.hls.on(Hls.Events.ERROR, (_event, data) => {
      this.logEvent('ERROR', data);
    });

    this.hls.on(Hls.Events.LEVEL_SWITCHED, (_event, data) => {
      this.logEvent('QUALITY_CHANGE', {
        level: data.level,
        bitrate: this.hls.levels[data.level]?.bitrate,
      });
    });

    // Iniciar monitoramento contínuo
    this.startMonitoring();
  }

  private startMonitoring() {
    this.intervalId = setInterval(() => {
      this.updateMetrics();
    }, this.updateInterval);
  }

  private updateMetrics() {
    // Atualizar latência (para streams ao vivo)
    if (this.hls.liveSyncPosition) {
      this.metrics.latency = this.hls.liveSyncPosition - this.video.currentTime;
    }

    // Atualizar saúde do buffer
    if (this.video.buffered.length > 0) {
      const bufferedEnd = this.video.buffered.end(this.video.buffered.length - 1);
      this.metrics.bufferHealth = bufferedEnd - this.video.currentTime;
    }

    // Atualizar nível de qualidade atual
    this.metrics.qualityLevel = this.hls.currentLevel;

    // Atualizar frames dropados (se disponível)
    const videoPerf = this.video.getVideoPlaybackQuality?.();
    if (videoPerf) {
      this.metrics.droppedFrames = videoPerf.droppedVideoFrames;
    }

    // Emitir evento de atualização
    this.onMetricsUpdate();
  }

  private updateBitrateMetrics() {
    const currentLevel = this.hls.levels[this.hls.currentLevel];
    if (currentLevel) {
      this.metrics.bitrateAverage = currentLevel.bitrate / 1000; // kbps
    }
  }

  private logEvent(type: string, data?: any) {
    this.metrics.events.push({
      timestamp: Date.now() - this.startTime,
      type,
      data,
    });

    // Manter apenas os últimos 100 eventos
    if (this.metrics.events.length > 100) {
      this.metrics.events.shift();
    }
  }

  private onMetricsUpdate() {
    // Aqui você pode adicionar lógica para enviar métricas para um sistema de monitoramento
    // ou disparar callbacks para atualizar a UI
    if (this.metrics.bufferHealth < 0.5) { // Menos de 500ms de buffer
      console.warn('Buffer crítico:', this.metrics.bufferHealth);
    }

    if (this.metrics.latency > 10) { // Mais de 10 segundos de latência
      console.warn('Latência alta:', this.metrics.latency);
    }
  }

  public getMetrics(): PlayerMetrics {
    return { ...this.metrics };
  }

  public destroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}

export default PlayerMetricsMonitor;
