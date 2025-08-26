import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import styled from "styled-components";
import PlayerMetricsMonitor from "../utils/playerMetrics";

const Wrapper = styled.div<{ backgroundImage?: string; $videoLoaded: boolean; $pannable?: boolean }>`
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
  
  /* Pan controls quando pannable */
  touch-action: ${({ $pannable }) => $pannable ? 'pan-x' : 'auto'};
  cursor: ${({ $pannable }) => $pannable ? 'grab' : 'default'};
  
  &:active {
    cursor: ${({ $pannable }) => $pannable ? 'grabbing' : 'default'};
  }
  
`;

const VideoElement = styled.video<{ $loaded: boolean; $pannable?: boolean; $translateX?: number; $isDragging?: boolean }>`
  ${({ $pannable }) => !$pannable && `
    object-fit: cover;
  `}

  height: 100%;
  position: absolute;
  display: block;
  min-width: 100%;
  opacity: ${({ $loaded }) => ($loaded ? 1 : 0)};
  transition: ${({ $isDragging }) => 
    $isDragging ? 'none' : 'opacity 500ms ease-in-out, transform 0.3s ease-out'
  };
  transform: translateX(${({ $translateX = 0 }) => $translateX}px);
  will-change: ${({ $pannable }) => $pannable ? 'transform' : 'auto'};
`;

interface Props {
  src: string;
  muted: boolean;
  volume: number;
  pannable?: boolean;
  onError?: () => void;
  onData?: (data: Uint8Array) => void;
}

export const HlsPlayer: React.FC<Props> = ({
  src,
  muted,
  volume,
  pannable = false,
  onError,
  onData,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const initialized = useRef(false);
  const metricsMonitorRef = useRef<PlayerMetricsMonitor | null>(null);
  const [paused, setPaused] = useState(false);
  const [snapshot, setSnapshot] = useState<string | null>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  
  // Estados para pan
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [lastPos, setLastPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

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
    
    // Aplicar mudança de qualidade com transição suave quando apropriado
    const previousHeight = lastHeightRef.current;
    lastHeightRef.current = height;
    
    smoothQualityTransition(newLevelIndex, previousHeight, height);
  };

  const smoothQualityTransition = async (newLevelIndex: number, previousHeight: number, currentHeight: number) => {
    const hls = hlsRef.current;
    const video = videoRef.current;
    if (!hls || !video) return;

    const isMaximizing = currentHeight > previousHeight;
    const heightDifference = Math.abs(currentHeight - previousHeight);
    
    // Só aplicar transição suave se a diferença de altura for significativa (maximização/minimização)
    const shouldTransitionSmoothly = heightDifference > 200;

    if (shouldTransitionSmoothly) {
      try {
        const currentTime = video.currentTime;
        const wasPlaying = !video.paused;

        // Configurar buffer maior apenas quando maximizando para melhor qualidade
        if (isMaximizing) {
          const originalConfig = {
            maxBufferLength: hls.config.maxBufferLength,
            maxMaxBufferLength: hls.config.maxMaxBufferLength,
            maxBufferSize: hls.config.maxBufferSize,
          };

          // Aumentar buffer temporariamente
          hls.config.maxBufferLength = 30;       // 30 segundos
          hls.config.maxMaxBufferLength = 60;    // 60 segundos
          hls.config.maxBufferSize = 60 * 1000 * 1000; // 60MB

          // Forçar a mudança de nível
          hls.currentLevel = newLevelIndex;

          // Aguardar o buffer carregar
          await new Promise(resolve => {
            const checkBuffer = () => {
              if (video.buffered.length > 0) {
                const bufferedEnd = video.buffered.end(video.buffered.length - 1);
                if (bufferedEnd > currentTime + 2) {
                  resolve(void 0);
                  return;
                }
              }
              requestAnimationFrame(checkBuffer);
            };
            
            setTimeout(resolve, 2000); // Timeout de segurança
            checkBuffer();
          });

          // Restaurar configurações originais após 5 segundos
          setTimeout(() => {
            if (hls && hls.config) {
              Object.assign(hls.config, originalConfig);
            }
          }, 5000);
        } else {
          // Para minimização, trocar qualidade diretamente
          hls.currentLevel = newLevelIndex;
        }

        // Tentar manter a reprodução contínua
        if (wasPlaying && video.paused) {
          try {
            await video.play();
          } catch (error) {
            console.warn('Erro ao retomar reprodução:', error);
          }
        }
      } catch (error) {
        console.warn('Erro na transição de qualidade:', error);
        hls.currentLevel = newLevelIndex; // Fallback para mudança direta
      }
    } else {
      // Para mudanças pequenas de tamanho, trocar diretamente
      hls.currentLevel = newLevelIndex;
    }
  };

  // Manter referência da última altura para detectar maximização/minimização
  const lastHeightRef = useRef<number>(0);

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

    // Otimizar detecção de carregamento do vídeo
    let loadTimeout: ReturnType<typeof setTimeout>;

    const handleLoadedMetadata = () => {
      // Usar loadedmetadata ao invés de loadeddata para detecção mais rápida
      setVideoLoaded(true);
      clearTimeout(loadTimeout);
    };

    // Timeout de segurança para casos onde os eventos não disparam
    loadTimeout = setTimeout(() => {
      if (!videoLoaded) setVideoLoaded(true);
    }, 2000);

    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    if (Hls.isSupported()) {
      const hls = new Hls({
        progressive: true,
        // Configurações otimizadas para baixa latência
        maxBufferSize: 30 * 1000 * 1000, // 30MB
        maxBufferLength: 5,              // 5 segundos de buffer
        liveSyncDurationCount: 3,        // Reduz buffer do stream ao vivo
        liveMaxLatencyDurationCount: 5,  // Limita latência máxima
        backBufferLength: 30,            // 30 segundos de buffer anterior
        // Otimizações de qualidade
        startLevel: -1,                  // Auto-select inicial
        abrEwmaFastLive: 3,             // Seleção de qualidade mais rápida
        // Configurações de baixa latência
        lowLatencyMode: true,
        liveDurationInfinity: true,
        liveBackBufferLength: 0
      });
      hlsRef.current = hls;
      
      // Inicializar monitor de métricas
      if (metricsMonitorRef.current) {
        metricsMonitorRef.current.destroy();
      }
      metricsMonitorRef.current = new PlayerMetricsMonitor(hls, video);
      
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

      // Debounce para otimizar mudanças de resolução
      let resizeTimeout: ReturnType<typeof setTimeout>;
      const debouncedResize = (entries: ResizeObserverEntry[]) => {
        for (const entry of entries) {
          selectLevel(entry.contentRect.height);
        }
      };
      
      const resizeObserver = new ResizeObserver((entries) => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => debouncedResize(entries), 150);
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
        video.removeEventListener('loadedmetadata', () => setVideoLoaded(true));
      }
      
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      // Limpar monitor de métricas
      if (metricsMonitorRef.current) {
        metricsMonitorRef.current.destroy();
        metricsMonitorRef.current = null;
      }

      // Resetar referência de altura
      lastHeightRef.current = 0;
    };
  }, [src]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = muted;
      videoRef.current.volume = volume;
    }
  }, [muted, volume]);

  // Reset pan position quando não pannable
  useEffect(() => {
    if (!pannable) {
      setTranslateX(0);
      setLastPos({ x: 0, y: 0 });
    }
  }, [pannable]);

  // Funções de pan
  const getPanLimits = () => {
    if (!containerRef.current || !videoRef.current) return { maxX: 0 };
    
    const container = containerRef.current;
    const video = videoRef.current;
    
    const containerRect = container.getBoundingClientRect();
    const videoRect = video.getBoundingClientRect();
    
    const maxX = Math.max(0, (videoRect.width - containerRect.width) / 2);
    return { maxX };
  };

  const applyPanLimits = (x: number) => {
    const { maxX } = getPanLimits();
    return Math.max(-maxX, Math.min(maxX, x));
  };

  const handleStart = (clientX: number) => {
    if (!pannable) return;
    setIsDragging(true);
    setStartPos({ x: clientX, y: 0 });
    setLastPos({ x: translateX, y: 0 });
  };

  const handleMove = (clientX: number) => {
    if (!pannable || !isDragging || !startPos) return;
    const deltaX = clientX - startPos.x;
    const newX = lastPos.x + deltaX;
    const clampedX = applyPanLimits(newX);
    setTranslateX(clampedX);
  };

  const handleEnd = () => {
    if (!pannable) return;
    setIsDragging(false);
    setStartPos(null);
  };

  const handleDoubleClick = () => {
    if (!pannable) return;
    setTranslateX(0);
    setLastPos({ x: 0, y: 0 });
  };

  // Effect para adicionar event listeners com passive: false
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !pannable) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        handleStart(touch.clientX);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        e.preventDefault(); // Agora funciona!
        const touch = e.touches[0];
        handleMove(touch.clientX);
      }
    };

    const handleTouchEnd = () => {
      handleEnd();
    };

    // Adicionar com passive: false para permitir preventDefault
    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pannable, isDragging, translateX, startPos, lastPos]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Otimizar observer de visibilidade
    const observer = new IntersectionObserver(
      (entries) => {
        const isIntersecting = entries[0]?.isIntersecting ?? false;
        if (!isIntersecting && !paused) {
          setPaused(true);
        } else if (isIntersecting && paused) {
          setPaused(false);
        }
      },
      {
        root: null,
        threshold: [0, 0.1], // Reduzir número de thresholds para melhor performance
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
      $pannable={pannable}
      onMouseDown={pannable ? (e) => {
        e.preventDefault();
        handleStart(e.clientX);
      } : undefined}
      onMouseMove={pannable && isDragging ? (e) => handleMove(e.clientX) : undefined}
      onMouseUp={pannable ? handleEnd : undefined}
      onMouseLeave={pannable ? handleEnd : undefined}
      onDoubleClick={pannable ? handleDoubleClick : undefined}
      onContextMenu={pannable ? (e) => e.preventDefault() : undefined}
    >
      <VideoElement
        ref={videoRef}
        autoPlay
        playsInline
        controls={false}
        $loaded={videoLoaded}
        $pannable={pannable}
        $translateX={translateX}
        $isDragging={isDragging}
      />
    </Wrapper>
  );
};
