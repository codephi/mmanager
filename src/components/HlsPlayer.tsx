import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import styled from "styled-components";

const Wrapper = styled.div<{ backgroundImage?: string }>`
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  background: black;
  display: flex;
  justify-content: center;
  align-items: center;
  background-image: ${(props) =>
    props.backgroundImage ? `url(${props.backgroundImage})` : "none"};
  background-position: center;
  transition: background-image 0.3s ease, opacity 0.3s ease;
  background-repeat: no-repeat;
  background-size: cover;
`;

interface Props {
  src: string;
  muted: boolean;
  volume: number;
  onError?: () => void;
  onData?: (data: Uint8Array) => void;
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
  const initialized = useRef(false);
  const [paused, setPaused] = useState(false);
  const [snapshot, setSnapshot] = useState<string | null>(null);

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
    const availableLevels = levels.filter((l) => l.height <= targetResolution);
    const selected =
      availableLevels.length > 0
        ? availableLevels[availableLevels.length - 1]
        : levels[0];
    hls.currentLevel = levels.findIndex((l) => l.height === selected.height);
  };

  const initializeHls = () => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({ progressive: true });
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.FRAG_LOADED, async (event, data) => {
        const url = data.frag.url;
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);
        if (onData) onData(buffer);
        if (!paused && snapshot) {
          setTimeout(() => {
            setSnapshot(null);
          }, 300);
        }
      });

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        selectLevel(container.clientHeight);
        if (muted && hls.audioTracks.length > 0) {
          hls.audioTrack = -1;
        }
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal && onError) onError();
      });

      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          selectLevel(entry.contentRect.height);
        }
      });
      resizeObserver.observe(container);
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    }

    initialized.current = true;
  };

  useEffect(() => {
    initializeHls();
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src]);

  useEffect(() => {
    // const video = videoRef.current;
    // const hls = hlsRef.current;
    // if (!video || !hls) return;
    // if (paused) {
    //   captureSnapshot(); // captura o frame antes de parar
    //   video.pause();
    //   hls.stopLoad();
    //   initialized.current = false;
    // } else {
    //   if (!initialized.current) {
    //     initializeHls();
    //   }
    // }
  }, [paused]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = muted;
      videoRef.current.volume = volume;
    }
  }, [muted, volume]);

  const captureSnapshot = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/png");
    setSnapshot(dataUrl);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setPaused(!entry.isIntersecting);
      },
      {
        root: null,
        threshold: 0.1,
      }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <Wrapper ref={containerRef} backgroundImage={snapshot || undefined}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        controls={false}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
      />
    </Wrapper>
  );
};
