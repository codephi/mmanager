import { useEffect, useRef, useState } from "react";
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

const VideoElement = styled.video<{ $loaded: boolean }>`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  opacity: ${({ $loaded }) => ($loaded ? 1 : 0)};
  transition: opacity 500ms ease-in-out;
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
  const [videoLoaded, setVideoLoaded] = useState(false);

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

    // Reset estado de carregamento ao inicializar novo vídeo
    setVideoLoaded(false);

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    // Adicionar event listeners para detectar quando o vídeo carregou
    const handleLoadedData = () => {
      setVideoLoaded(true);
    };

    const handleCanPlay = () => {
      setVideoLoaded(true);
    };

    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('canplay', handleCanPlay);

    if (Hls.isSupported()) {
      const hls = new Hls({ progressive: true });
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.FRAG_LOADED, async (_event, data) => {
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

      hls.on(Hls.Events.ERROR, (_event, data) => {
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
      // Limpar event listeners
      const video = videoRef.current;
      if (video) {
        video.removeEventListener('loadeddata', () => setVideoLoaded(true));
        video.removeEventListener('canplay', () => setVideoLoaded(true));
      }
      
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
      <VideoElement
        ref={videoRef}
        autoPlay
        playsInline
        controls={false}
        $loaded={videoLoaded}
      />
    </Wrapper>
  );
};
