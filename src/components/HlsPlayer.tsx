import React, { useEffect, useRef } from "react";
import Hls from "hls.js";

interface Props {
  src: string;
  muted: boolean;
  volume: number;
  onError?: () => void; // <-- Adicionamos esse callback
}

export const HlsPlayer: React.FC<Props> = ({ src, muted, volume, onError }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error("HLS error:", data);
        if (data.fatal && onError) {
          onError(); // chama o callback no VideoWindow
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    }

    return () => {
      hlsRef.current?.destroy();
    };
  }, [src]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = muted;
      videoRef.current.volume = volume;
    }
  }, [muted, volume]);

  return (
    <video
      ref={videoRef}
      autoPlay
      controls={false}
      style={{ width: "100%", height: "100%" }}
    />
  );
};
