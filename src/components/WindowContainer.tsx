import { useState, useEffect } from "react";
import { HlsPlayer } from "./HlsPlayer";
import { VolumeControl } from "./VolumeControl";
import { AdblockMessage } from "./AdblockMessage";
import { useSpacesStore } from "../store/windowsMainStore";
import styled from "styled-components";
import { Maximize, Minimize } from "../icons";
import RecordButton from "./RecordButton";
import { useDownloadStore } from "../store/downloadStore";
import { trackMaximizeClick, trackRecordingClick, trackChatClick } from "../utils/analytics";

export const WindowContainerWrapper = styled.div<{ $isMobile: boolean; $maximized: boolean }>`
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  position: relative;
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 var(--element-color);
  
  
  /* Indicador de gravação - visível por padrão quando gravando */
  .recording-indicator {
    opacity: ${({ $isMobile, $maximized }) => $isMobile && $maximized ? '0' : '1'};
    transition: opacity 0.3s ease;
    position: absolute;
    top: 12px;
    left: 12px;
    z-index: 9;
  }
  
  /* Esconder indicador de gravação no hover (apenas se não for mobile maximizado) */
  ${({ $isMobile, $maximized }) => !($isMobile && $maximized) && `
    &:hover .recording-indicator {
      opacity: 0;
    }
  `}

    /* Mostrar header no hover (apenas se não for mobile maximizado) */
  ${({ $isMobile, $maximized }) => !($isMobile && $maximized) && `
    &:hover .hidden {
      opacity: 1;
    }
  `}
`;

const WindowHeader = styled.div<{ $maximized: boolean; $isMobile: boolean }>`
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px;
  cursor: ${({ $maximized }) => ($maximized ? "default" : "move")};
  font-size: 14px;
  background: var(--primary-color-alpha);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  border-top-left-radius: var(--border-radius);
  border-top-right-radius: var(--border-radius);
  overflow: hidden;
  
  button {
    background: var(--element-color);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    border: 1px solid var(--element-color);
    transition: all 0.2s ease;
  }
  button:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.2);
  }

  /* Esconder o header por padrão */

    opacity: ${({ $isMobile, $maximized }) => $isMobile && $maximized ? '1' : '0'};
    transition: opacity 0.3s ease;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 10;
    overflow: visible;

  

  
`;

const HeaderRight = styled.div`
  display: flex;
  gap: 5px;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: visible;
  z-index: 999999;
`;

const WindowContent = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  border-radius: var(--border-radius);
  overflow: hidden;
`;

const OfflineText = styled.div`
  color: #fff;
  font-size: 24px;
`;

const PrivateContainer = styled.div`
  color: #fff;
  text-align: center;
`;

const PrivateTitle = styled.div`
  font-size: 24px;
`;

const PrivateLink = styled.a`
  padding: 1rem;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
  position: absolute;
`;

const LoadingSpinner = styled.div`
  width: 32px;
  height: 32px;
  background-color: var(--primary-color-hover);
  border-radius: 8px;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const VideoContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
`;
const CopyMessage = styled.div`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid var(--element-color);
  color: #fff;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  z-index: 9999;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
`;

const RecordingIndicator = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ChatButton = styled.a<{ $isMobile: boolean; $maximized: boolean }>`
  &, &:active {
    background: var(--secundary-color);
    color: #fff;
    padding: 8px 16px;
    border-radius: 16px;
    font-size: 0.9rem;
    font-weight: 600;
    white-space: nowrap;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 
      0 4px 12px rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    transition: opacity 0.3s ease;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    z-index: 11;
    pointer-events: auto;
    bottom: 20px;
    /* Ajusta opacidade baseado no estado mobile/maximized */
    opacity: ${({ $isMobile, $maximized }) => 
      $isMobile && $maximized ? '1' : '0'};
  }

  &:hover {
    background: var(--secundary-color-hover);
    color: #fff;
    box-shadow: 
      0 4px 12px rgba(0, 0, 0, 0.3);
    text-decoration: none;
  }
  
  /* Media query para mobile */
  @media (max-width: 768px) {
    opacity: ${({ $maximized }) => $maximized ? '1' : '0'};
  }
`;


export const WindowHeaderButton = styled.button`
  border: none;
  cursor: pointer;
  width: 26px;
  height: 26px;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  display: flex;
  align-items: center;
  justify-content: center;
`;

interface Props {
  id: string;
  room: string;
  isFloating?: boolean;
  onMaximize: () => void;
  onMinimize?: () => void;
  isMobile?: boolean;
  scrollElementRef?: React.RefObject<HTMLDivElement | null>;
}

export const WindowContainer: React.FC<Props> = ({
  id,
  room,
  onMaximize,
  onMinimize,
  isMobile = false,
  scrollElementRef,
}) => {
  const bringToFront = useSpacesStore((s) => s.bringToFront);
  const setWindowMaximized = useSpacesStore((s) => s.setWindowMaximized);
  const [maximized, setMaximized] = useState(false);
  const [hlsSource, setHlsSource] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState<boolean>(false);

  const [isPrivate, setIsPrivate] = useState(false);
  const [copyMessage] = useState<string | null>(null);
  
  // Estados para detecção de adblock
  const [adblockDetected, setAdblockDetected] = useState(false);

  const { start, stop, downloads } = useDownloadStore();
  const isRecording = downloads.some((d) => d.id === id);

  const windowState = useSpacesStore((s) => {
    return s.windows.find((w) => w.id === id);
  });

  const muted = windowState?.isMuted ?? true;
  const volume = windowState?.volume ?? 1.0;

  // Sincroniza o estado local com o da store
  useEffect(() => {
    const storeMaximized = windowState?.maximized || false;
    if (storeMaximized !== maximized) {
      setMaximized(storeMaximized);
    }
  }, [windowState?.maximized]);

  const toggleMaximize = () => {
    const value = !maximized;
    setMaximized(value);
    
    // Atualiza o estado na store
    setWindowMaximized(id, value);
    
    // Track evento no Google Analytics
    trackMaximizeClick(room, maximized);

    if (value) {
      onMaximize();
    } else {
      onMinimize?.();
    }
  };
  const setVolume = (v: number) => {
    const windowsState = useSpacesStore.getState();
    windowsState.setWindowVolume(id, v);
  };

  const toggleMute = () => {
    const windowsState = useSpacesStore.getState();
    windowsState.toggleWindowMute(id);
  };

  const fetchHls = async (room: string, id: string) => {
    try {
      const res = await fetch(
        `https://api.winturbate.com/chatvideocontext?room=${room}`
      );
      const data = await res.json();

      if (data.hls_source) {
        setHlsSource(data.hls_source);
        useSpacesStore.getState().updateWindow(id, { isOnline: true });
        setIsOffline(false);
      } else if (data.room_status === "private") {
        setHlsSource(null);
        setIsPrivate(true);
        useSpacesStore.getState().updateWindow(id, { isOnline: false });
      } else {
        setHlsSource(null);
        setIsOffline(true);
        setIsPrivate(false);
        useSpacesStore.getState().updateWindow(id, { isOnline: false });
      }
    } catch (err) {
      console.error("Erro carregando HLS:", err);
      setHlsSource(null);
      setIsOffline(true);
      setIsPrivate(false);
      useSpacesStore.getState().updateWindow(id, { isOnline: false });
    }
  };

  useEffect(() => {
    fetchHls(room, id);
  }, [room, id]);

  // Effect para detecção de adblock
  useEffect(() => {
    const checkAdblock = () => {
      // Procura pelo elemento com classe "verify" dentro do componente atual
      const containerElement = document.querySelector(`[data-window-id="${id}"]`);
      if (!containerElement) return;
      
      const verifyElement = containerElement.querySelector('.verify');
      const isAdblockActive = !verifyElement || 
        window.getComputedStyle(verifyElement).display === 'none' ||
        window.getComputedStyle(verifyElement).visibility === 'hidden';
      
      if (isAdblockActive && !adblockDetected) {
        setAdblockDetected(true);
        // Para o vídeo quando adblock é detectado
        setHlsSource(null);
      } else if (!isAdblockActive && adblockDetected) {
        setAdblockDetected(false);
        // Recarrega o HLS quando adblock é removido
        fetchHls(room, id);
      }
    };

    // Verifica imediatamente
    const initialCheck = setTimeout(checkAdblock, 1000);
    
    // Configura um observer para mudanças no DOM
    const observer = new MutationObserver(() => {
      checkAdblock();
    });

    // Observa mudanças no documento inteiro
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });

    // Também verifica periodicamente como fallback
    const interval = setInterval(checkAdblock, 2000);

    return () => {
      clearTimeout(initialCheck);
      clearInterval(interval);
      observer.disconnect();
    };
  }, [id, room, adblockDetected]);


  const toggleRecording = () => {
    if (!hlsSource) {
      alert("Stream não disponível");
      return;
    }
    
    // Track evento no Google Analytics
    trackRecordingClick(room, isRecording);

    if (!isRecording) {
      start(id, room, hlsSource);
    } else {
      stop(id);
    }
  };

  // Função para lidar com clique no conteúdo no mobile
  const handleContentClick = () => {
    // Se é mobile maximizado com pan ativo, não fazer nada (deixar o pan funcionar)
    if (isMobile && maximized) {
      return;
    }
    
    if (isMobile && !maximized) {
      toggleMaximize();
      // Scroll automático para a janela maximizada no mobile
      setTimeout(() => {
        
        // Encontra a janela maximizada
        const maximizedWindow = document.querySelector(`[data-window-id="${id}"]`);
        
        if (maximizedWindow) {
          // Scroll para a janela específica
          maximizedWindow.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
            inline: 'nearest'
          });
        } else {
          // Fallback: scroll para o topo
          if (scrollElementRef?.current) {
            scrollElementRef.current.scrollTo({
              top: 0,
              behavior: 'smooth'
            });
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }
      }, 100); // Aguardar animações do grid layout terminarem
    }
  };

  return (
    <WindowContainerWrapper 
      $isMobile={isMobile} 
      $maximized={maximized}
      onMouseDown={() => bringToFront(id)}
    >
      {/* Indicador de gravação que aparece quando header está oculto */}
      {isRecording && (
        <RecordingIndicator className="recording-indicator">
          <RecordButton active={true} />
        </RecordingIndicator>
      )}
      
      <WindowHeader
        className="no-drager hidden"
        $maximized={maximized}
        onMouseDown={() => bringToFront(id)}
        $isMobile={isMobile}
      >
        <a
          href={`https://chaturbate.com/in/?tour=YrCp&campaign=XW3KB&track=default&room=${typeof room === 'string' ? room : String(room)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="no-drag"
          style={{ color: "#fff", textDecoration: "underline" }}
        >
          {typeof room === 'string' ? room : String(room)}
        </a>
        <HeaderRight>
          <WindowHeaderButton className="no-drag" onClick={toggleRecording} title="Toggle Recording">
            <RecordButton active={isRecording} />
          </WindowHeaderButton>
          <VolumeControl
            muted={muted}
            volume={volume}
            onMuteToggle={toggleMute}
            onVolumeChange={setVolume}
            streamTitle={room}
            className="no-drag"
          />

          <WindowHeaderButton className="no-drag" onClick={toggleMaximize}>
            {maximized ? <Minimize /> : <Maximize />}
          </WindowHeaderButton>
        </HeaderRight>
      </WindowHeader>
      <WindowContent onClick={handleContentClick}>
        {adblockDetected ? (
          <AdblockMessage />
        ) : isOffline ? (
          <OfflineText>OFFLINE</OfflineText>
        ) : isPrivate ? (
          <PrivateContainer>
            <PrivateTitle>SHOW NOW</PrivateTitle>
            <PrivateLink
              className="button"
              href={`https://handplayspaces.chaturbate.com/${room}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View on Chaturbate
            </PrivateLink>
          </PrivateContainer>
        ) : (
          <VideoContainer>
            <LoadingContainer>
              <LoadingSpinner />
            </LoadingContainer>
            {hlsSource && (
              <HlsPlayer 
                src={hlsSource} 
                muted={muted} 
                volume={volume} 
                pannable={isMobile && maximized}
              />
            )}
          </VideoContainer>
        )}
        {copyMessage && <CopyMessage>{copyMessage}</CopyMessage>}
      </WindowContent>
      
      <ChatButton
        className="no-drag verify hidden"
        href={`https://chaturbate.com/in/?tour=YrCp&campaign=XW3KB&track=default&room=${typeof room === 'string' ? room : String(room)}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackChatClick(room)}
        $isMobile={isMobile}
        $maximized={maximized}
      >
        Open live chat
      </ChatButton>
    </WindowContainerWrapper>
  );
};
