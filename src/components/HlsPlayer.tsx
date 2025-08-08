import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import styled from "styled-components";

const Wrapper = styled.div<{ backgroundImage?: string; $videoLoaded: boolean }>`
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  background: ${({ $videoLoaded }) => $videoLoaded ? 'black' : 'transparent'};
  display: flex;
  justify-content: center;
  align-items: center;
  background-image: ${(props) =>
    props.backgroundImage ? `url(${props.backgroundImage})` : "none"};
  background-position: center;
  transition: background 0.3s ease, background-image 0.3s ease, opacity 0.3s ease;
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
    
    const newLevelIndex = levels.findIndex((l) => l.height === selected.height);
    
    // Se já estamos no nível correto, não fazer nada
    if (hls.currentLevel === newLevelIndex) return;
    
    // Implementar transição suave
    smoothLevelTransition(newLevelIndex);
  };

  const smoothLevelTransition = async (newLevelIndex: number) => {
    const hls = hlsRef.current;
    const video = videoRef.current;
    if (!hls || !video) return;

    try {
      // Salvar o tempo atual para sincronização
      const currentTime = video.currentTime;
      const wasPlaying = !video.paused;

      // Configurar um buffer maior temporariamente para suavizar a transição
      const originalConfig = {
        maxBufferLength: hls.config.maxBufferLength,
        maxMaxBufferLength: hls.config.maxMaxBufferLength,
        maxBufferSize: hls.config.maxBufferSize,
      };

      // Aumentar buffer temporariamente
      hls.config.maxBufferLength = 60; // 60 segundos
      hls.config.maxMaxBufferLength = 120; // 120 segundos  
      hls.config.maxBufferSize = 60 * 1000 * 1000; // 60MB

      // Forçar a mudança de nível
      hls.currentLevel = newLevelIndex;

      // Aguardar alguns frames para o HLS processar a mudança
      await new Promise(resolve => {
        const checkBuffer = () => {
          if (video.buffered.length > 0) {
            const bufferedEnd = video.buffered.end(video.buffered.length - 1);
            if (bufferedEnd > currentTime + 2) { // 2 segundos de buffer à frente
              resolve(void 0);
              return;
            }
          }
          requestAnimationFrame(checkBuffer);
        };
        
        // Timeout de segurança
        setTimeout(resolve, 1000);
        checkBuffer();
      });

      // Tentar manter a reprodução contínua
      if (wasPlaying && video.paused) {
        try {
          await video.play();
        } catch (error) {
          console.warn('Erro ao retomar reprodução:', error);
        }
      }

      // Restaurar configurações originais após um tempo
      setTimeout(() => {
        if (hls && hls.config) {
          Object.assign(hls.config, originalConfig);
        }
      }, 5000);

    } catch (error) {
      console.warn('Erro na transição suave de qualidade:', error);
      // Fallback: mudança direta sem otimizações
      hls.currentLevel = newLevelIndex;
    }
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
    <Wrapper 
      ref={containerRef} 
      backgroundImage={snapshot || undefined}
      $videoLoaded={videoLoaded}
    >
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
