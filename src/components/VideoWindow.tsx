import React, { useState, useEffect, useCallback, useRef } from "react";
import { Rnd } from "react-rnd";
import { HlsPlayer } from "./HlsPlayer";
import { VolumeControl } from "./VolumeControl";
import { useWindowsStore } from "../store/windowsStore";
import { useSpacesStore } from "../store/spacesStore";
import styled from "styled-components";
import { CopyToSpaceDropdown } from "./CopyToSpaceDropdown";
import { Close, Maximize, Minimize, Pin, Unpin } from "../icons";
import { useHlsStreamRecorder } from "../hooks/useHlsDownloader";

interface Props {
  id: string;
  room: string;
  x: number;
  y: number;
  width: number;
  height: number;
  pinned?: boolean;
}

const WindowContainer = styled.div`
  width: 100%;
  height: 100%;
  background: #000;
  position: relative;
  border-radius: var(--border-radius);
  overflow: hidden;
  border: 1px solid var(--primary-color);
  box-shadow: 0 0 10px 10px rgba(0, 0, 0, 0.5);
`;

const WindowHeader = styled.div<{ $maximized: boolean }>`
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px;
  cursor: ${({ $maximized }) => ($maximized ? "default" : "move")};
  font-size: 14px;
  background-color: var(--primary-color);
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

export const VideoWindow: React.FC<Props> = ({
  id,
  room,
  x,
  y,
  width,
  height,
  pinned,
}) => {
  const updateWindow = useWindowsStore((s) => s.updateWindow);
  const removeWindow = useWindowsStore((s) => s.removeWindow);
  const bringToFront = useSpacesStore((s) => s.bringToFront);
  const copyWindowToSpace = useSpacesStore((s) => s.copyWindowToSpace);
  const togglePin = useSpacesStore((s) => s.togglePin);
  const spaces = useSpacesStore((s) => s.spaces);
  const activeSpaceId = useSpacesStore((s) => s.activeSpaceId);
  const activeSpace = spaces.find((t) => t.id === activeSpaceId);
  const zIndex = activeSpace?.zIndexes[id] ?? 10;
  const [maximized, setMaximized] = useState(false);
  const isPinned = pinned ?? false;
  const [hlsSource, setHlsSource] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const toggleMaximize = () => setMaximized(!maximized);
  const [isPrivate, setIsPrivate] = useState(false);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const { start, stop, write } = useHlsStreamRecorder();
  const isRecording = useRef<boolean>(false);

  const windowState = useSpacesStore((s) => {
    const space = s.spaces.find((sp) => sp.id === s.activeSpaceId);
    return space?.windows.find((w) => w.id === id);
  });

  const muted = windowState?.isMuted ?? true;
  const volume = windowState?.volume ?? 1.0;

  const setVolume = (v: number) => {
    useSpacesStore.getState().setWindowVolume(id, v);
  };

  const toggleMute = () => {
    useSpacesStore.getState().toggleWindowMute(id);
  };

  const fetchHls = async (room: string, id: string) => {
    try {
      const res = await fetch(
        `https://chaturbate.com/api/chatvideocontext/${room}/`
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

    if (!isRecording.current) {
      start("file.txt");
      isRecording.current = true;
    } else {
      stop();
      isRecording.current = false;
    }
  };

  const onRecordData = useCallback(
    (data: Uint8Array) => {
      console.log({ isRecording: isRecording.current });
      if (isRecording.current) {
        write(data);
      }
    },
    [isRecording, write]
  );

  return (
    <Rnd
      size={
        maximized
          ? { width: window.innerWidth, height: window.innerHeight - 50 }
          : { width, height }
      }
      position={maximized ? { x: 0, y: 50 } : { x, y }}
      onDragStart={() => bringToFront(id)}
      onResizeStart={() => bringToFront(id)}
      onDragStop={(e, d) => {
        if (isPinned) {
          useSpacesStore.getState().updatePinnedWindow(id, { x: d.x, y: d.y });
        } else {
          updateWindow(id, { x: d.x, y: d.y });
        }
      }}
      onResizeStop={(e, direction, ref, delta, pos) => {
        if (isPinned) {
          useSpacesStore.getState().updatePinnedWindow(id, {
            x: pos.x,
            y: pos.y,
            width: ref.offsetWidth,
            height: ref.offsetHeight,
          });
        } else {
          updateWindow(id, {
            width: ref.offsetWidth,
            height: ref.offsetHeight,
            x: pos.x,
            y: pos.y,
          });
        }
      }}
      bounds="parent"
      dragHandleClassName="window-header"
      cancel=".no-drag"
      minWidth={180}
      minHeight={80}
      disableDragging={maximized}
      enableResizing={!maximized}
      style={{ zIndex }}
    >
      <WindowContainer onMouseDown={() => bringToFront(id)}>
        <WindowHeader
          className="window-header"
          $maximized={maximized}
          onMouseDown={() => bringToFront(id)}
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
              {isRecording.current ? "Parar Download" : "Gravar"}
            </WindowHeaderButton>
            <CopyToSpaceDropdown
              spaces={spaces}
              windowId={id}
              onCopy={copyWindowToSpaceLocal}
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
            <WindowHeaderButton
              className="no-drag"
              onClick={() => removeWindow(id)}
            >
              <Close />
            </WindowHeaderButton>
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
            <HlsPlayer
              src={hlsSource}
              muted={muted}
              volume={volume}
              onData={onRecordData}
            />
          ) : (
            <LoadingText>Carregando vídeo...</LoadingText>
          )}

          {copyMessage && <CopyMessage>{copyMessage}</CopyMessage>}
        </WindowContent>
      </WindowContainer>
    </Rnd>
  );
};
