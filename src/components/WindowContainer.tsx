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
  background: #000;
  position: relative;
  border-radius: var(--border-radius);
  overflow: hidden;
  border: 1px solid var(--primary-color);
  box-shadow: 0 0 10px 10px rgba(0, 0, 0, 0.5);
`;

const WindowHeader = styled.div<{ $maximized: boolean; $pinned?: boolean }>`
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px;
  cursor: ${({ $maximized }) => ($maximized ? "default" : "move")};
  font-size: 14px;
  background-color: ${({ $pinned }) =>
    $pinned ? "var(--secundary-color)" : "var(--primary-color)"};

  button {
    background-color: ${({ $pinned }) =>
      $pinned ? "var(--secundary-color)" : "var(--primary-color)"};
  }
  button:hover {
    background-color: ${({ $pinned }) =>
      $pinned ? "var(--secundary-color-hover)" : "var(--primary-color-hover)"};
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
  height: calc(100% - 30px);
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
  background-color: var(--dark-color);
  color: #fff;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  z-index: 9999;
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
  const copyWindowToSpace = useSpacesStore((s) => s.copyWindowToSpace);
  const togglePin = useSpacesStore((s) => s.togglePin);
  const spaces = useSpacesStore((s) => s.spaces);
  const [maximized, setMaximized] = useState(false);
  const isPinned = pinned ?? false;
  const [hlsSource, setHlsSource] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState<boolean>(false);

  const [isPrivate, setIsPrivate] = useState(false);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);

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

  const copyWindowToSpaceLocal = (windowId: string, targetSpaceId: string) => {
    copyWindowToSpace(windowId, targetSpaceId);
    const spaceName = spaces.find((s) => s.id === targetSpaceId)?.name ?? "";
    setCopyMessage(`Room copied to ${spaceName}`);
    setTimeout(() => setCopyMessage(null), 3000);
  };

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
