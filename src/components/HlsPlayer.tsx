import React, { useEffect, useRef } from 'react';
import Hls from 'hls.js';

interface Props {
  src: string;
  muted?: boolean;
  volume?: number;
}

export const HlsPlayer: React.FC<Props> = ({ src, muted = false, volume = 1.0 }) => {
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

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = muted;
    }
  }, [muted]);


  return <video ref={videoRef} style={{ width: '100%', height: '100%' }} autoPlay controls={false} />;
};
