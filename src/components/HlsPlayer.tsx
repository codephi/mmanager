import React, { useEffect, useRef } from "react";
import Hls from "hls.js";

interface Props {
  src: string;
  muted: boolean;
  volume: number;
  onError?: () => void;
}

export const HlsPlayer: React.FC<Props> = ({ src, muted, volume, onError }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const getTargetResolution = (h: number): number => {
    if (h <= 180) return 180;
    if (h <= 240) return 240;
    if (h <= 480) return 480;
    if (h <= 720) return 720;
    if (h <= 1080) return 1080;
    return Infinity;
  };

  const selectLevel = (height: number) => {
    const hls = hlsRef.current;
    if (!hls) return;

    const levels = hls.levels;
    const targetResolution = getTargetResolution(height);

    let levelIndex = levels.findIndex((l) => l.height >= targetResolution);
    if (levelIndex === -1) {
      levelIndex = levels.length - 1;
    }
    hls.currentLevel = levelIndex;
  };

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        selectLevel(container.clientHeight);
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal && onError) {
          onError();
        }
      });

      // Observe resize no container, não no video
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const height = entry.contentRect.height;
          selectLevel(height);
        }
      });

      resizeObserver.observe(container);

      return () => {
        resizeObserver.disconnect();
        hls.destroy();
      };
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    }
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
        controls={false}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
};
