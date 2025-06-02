import React, { useEffect, useRef } from 'react';
import Hls from 'hls.js';

interface Props {
  src: string;
  muted?: boolean;
}

export const HlsPlayer: React.FC<Props> = ({ src, muted = false }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(src);
        hls.attachMedia(videoRef.current);
        return () => hls.destroy();
      } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
        videoRef.current.src = src;
      }
    }
  }, [src]);

  return <video ref={videoRef} style={{ width: '100%', height: '100%' }} autoPlay muted={muted} controls />;
};
