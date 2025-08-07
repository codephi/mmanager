import { useState, useEffect } from "react";
import { HlsPlayer } from "./HlsPlayer";
import { VolumeControl } from "./VolumeControl";
import { useWindowsStore } from "../store/windowsStore";
import { useSpacesStore } from "../store/spacesStore";
import styled from "styled-components";
import { FavoriteButton } from "./FavoriteButton";
import { Close, Maximize, Minimize, Pin, Unpin } from "../icons";
import RecordButton from "./RecordButton";
import { useDownloadStore } from "../store/downloadStore";

export const WindowContainerWrapper = styled.div`
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
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  overflow: hidden;
  
  /* Esconder o header por padrão */
  .window-header {
    opacity: 0;
    transform: translateY(-100%);
    transition: all 0.3s ease;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 10;
  }
  
  /* Mostrar header no hover */
  &:hover .window-header {
    opacity: 1;
    transform: translateY(0);
  }
  
  /* Indicador de gravação - visível por padrão quando gravando */
  .recording-indicator {
    opacity: 1;
    transform: translateY(0);
    transition: all 0.3s ease;
    position: absolute;
    top: 12px;
    left: 12px;
    z-index: 9;
  }
  
  /* Esconder indicador de gravação no hover */
  &:hover .recording-indicator {
    opacity: 0;
    transform: translateY(-10px);
  }
`;

const WindowHeader = styled.div<{ $maximized: boolean; $pinned?: boolean }>`
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
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.2s ease;
  }
  button:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.2);
  }
`;

const HeaderRight = styled.div`
  display: flex;
  gap: 5px;
  align-items: center;
  justify-content: center;
`;

const WindowContent = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
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

const LoadingText = styled.div`
  color: #fff;
`;

const CopyMessage = styled.div`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
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
  pinned?: boolean;
  isFloating?: boolean;
  onMaximize: () => void;
  onMinimize?: () => void;
}

export const WindowContainer: React.FC<Props> = ({
  id,
  room,
  pinned,
  onMaximize,
  onMinimize,
  isFloating,
}) => {
  const removeWindow = useWindowsStore((s) => s.removeWindow);
  const bringToFront = useSpacesStore((s) => s.bringToFront);
  const togglePin = useSpacesStore((s) => s.togglePin);
  const [maximized, setMaximized] = useState(false);
  const isPinned = pinned ?? false;
  const [hlsSource, setHlsSource] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState<boolean>(false);

  const [isPrivate, setIsPrivate] = useState(false);
  const [copyMessage] = useState<string | null>(null);

  const { start, stop, downloads } = useDownloadStore();
  const isRecording = downloads.some((d) => d.id === id);

  const windowState = useSpacesStore((s) => {
    const activeSpace = s.spaces.find((sp) => sp.id === s.activeSpaceId);
    let window = activeSpace?.windows.find((w) => w.id === id);
    
    // Se não encontrou no space ativo, procura em todos os spaces
    // (isso é necessário para o space "favorites" que não tem os windows localmente)
    if (!window) {
      for (const space of s.spaces) {
        window = space.windows.find((w) => w.id === id);
        if (window) break;
      }
    }
    
    return window;
  });

  const muted = windowState?.isMuted ?? true;
  const volume = windowState?.volume ?? 1.0;

  const toggleMaximize = () => {
    const value = !maximized;
    setMaximized(!maximized);

    if (value) {
      onMaximize();
    } else {
      onMinimize?.();
    }
  };
  const setVolume = (v: number) => {
    // Só atualiza volume se o window existir no space ativo
    const spacesState = useSpacesStore.getState();
    const activeSpace = spacesState.spaces.find((sp) => sp.id === spacesState.activeSpaceId);
    const windowExists = activeSpace?.windows.find((w) => w.id === id);
    
    if (windowExists) {
      spacesState.setWindowVolume(id, v);
    }
  };

  const toggleMute = () => {
    // Só atualiza mute se o window existir no space ativo
    const spacesState = useSpacesStore.getState();
    const activeSpace = spacesState.spaces.find((sp) => sp.id === spacesState.activeSpaceId);
    const windowExists = activeSpace?.windows.find((w) => w.id === id);
    
    if (windowExists) {
      spacesState.toggleWindowMute(id);
    }
  };

  const fetchHls = async (room: string, id: string) => {
    try {
      const res = await fetch(
        `https://api.winturbate.com/chatvideocontext?room=${room}`
      );
      const data = await res.json();

      if (data.hls_source) {
        setHlsSource(data.hls_source);
        useWindowsStore.getState().updateWindow(id, { isOnline: true });
        setIsOffline(false);
      } else if (data.room_status === "private") {
        setHlsSource(null);
        setIsPrivate(true);
        useWindowsStore.getState().updateWindow(id, { isOnline: false });
      } else {
        setHlsSource(null);
        setIsOffline(true);
        setIsPrivate(false);
        useWindowsStore.getState().updateWindow(id, { isOnline: false });
      }
    } catch (err) {
      console.error("Erro carregando HLS:", err);
      setHlsSource(null);
      setIsOffline(true);
      setIsPrivate(false);
      useWindowsStore.getState().updateWindow(id, { isOnline: false });
    }
  };

  useEffect(() => {
    fetchHls(room, id);
  }, [room, id]);


  const toggleRecording = () => {
    if (!hlsSource) {
      alert("Stream não disponível");
      return;
    }

    if (!isRecording) {
      start(id, room, hlsSource);
    } else {
      stop(id);
    }
  };

  return (
    <WindowContainerWrapper onMouseDown={() => bringToFront(id)}>
      {/* Indicador de gravação que aparece quando header está oculto */}
      {isRecording && (
        <RecordingIndicator className="recording-indicator">
          <RecordButton active={true} />
        </RecordingIndicator>
      )}
      
      <WindowHeader
        className="window-header"
        $maximized={maximized}
        onMouseDown={() => bringToFront(id)}
        $pinned={isPinned && isFloating}
      >
        <a
          href={`https://handplayspaces.chaturbate.com/${room}`}
          target="_blank"
          rel="noopener noreferrer"
          className="no-drag"
          style={{ color: "#fff", textDecoration: "underline" }}
        >
          {room}
        </a>
        <HeaderRight>
          <WindowHeaderButton className="no-drag" onClick={toggleRecording}>
            <RecordButton active={isRecording} />
          </WindowHeaderButton>
          <FavoriteButton
            windowId={id}
            className="no-drag"
          />
          <VolumeControl
            muted={muted}
            volume={volume}
            onMuteToggle={toggleMute}
            onVolumeChange={setVolume}
          />
          <WindowHeaderButton onClick={() => togglePin(id)}>
            {isPinned ? <Pin /> : <Unpin />}
          </WindowHeaderButton>

          <WindowHeaderButton className="no-drag" onClick={toggleMaximize}>
            {maximized ? <Minimize /> : <Maximize />}
          </WindowHeaderButton>
          {!isPinned && (
            <WindowHeaderButton
              className="no-drag"
              onClick={() => removeWindow(id)}
            >
              <Close />
            </WindowHeaderButton>
          )}
        </HeaderRight>
      </WindowHeader>
      <WindowContent>
        {isOffline ? (
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
        ) : hlsSource ? (
          <HlsPlayer src={hlsSource} muted={muted} volume={volume} />
        ) : (
          <LoadingText>Carregando vídeo...</LoadingText>
        )}

        {copyMessage && <CopyMessage>{copyMessage}</CopyMessage>}
      </WindowContent>
    </WindowContainerWrapper>
  );
};
