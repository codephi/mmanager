import React, { useEffect, useRef } from "react";
import Hls from "hls.js";

interface Props {
  src: string;
  muted: boolean;
  volume: number;
  onError?: () => void;
  onData?: (data: Uint8Array) => void; // <-- Adicionado
}

export const HlsPlayer: React.FC<Props> = ({
  src,
  muted,
  volume,
  onError,
  onData,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const getTargetResolution = (h: number): number => {
    if (h <= 180) return 180;
    if (h <= 240) return 240;
    if (h <= 480) return 480;
    if (h <= 720) return 720;
    return 1080;
  };

  const selectLevel = (height: number) => {
    const hls = hlsRef.current;
    if (!hls) return;

    const levels = hls.levels;
    const targetResolution = getTargetResolution(height);

    // Busca o maior nível que seja <= targetResolution
    const availableLevels = levels.filter((l) => l.height <= targetResolution);
    const selected =
      availableLevels.length > 0
        ? availableLevels[availableLevels.length - 1]
        : levels[0];

    hls.currentLevel = levels.findIndex((l) => l.height === selected.height);
  };

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    let hls: Hls | null = null;
    let resizeObserver: ResizeObserver | null = null;

    if (Hls.isSupported()) {
      hls = new Hls({
        progressive: true,
      });
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.FRAG_LOADED, async (event, data) => {
        const url = data.frag.url;
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();

        const buffer = new Uint8Array(arrayBuffer);
        if (onData) {
          onData(buffer);
        }
      });

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        selectLevel(container.clientHeight);
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal && onError) {
          onError();
        }
      });

      resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const height = entry.contentRect.height;
          selectLevel(height);
        }
      });
      resizeObserver.observe(container);
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    }

    return () => {
      resizeObserver?.disconnect();
      hls?.destroy();
    };
  }, [src, onError]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = muted;
      videoRef.current.volume = volume;
    }
  }, [muted, volume]);

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        controls={false}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
};
