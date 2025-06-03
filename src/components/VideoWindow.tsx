import React, { useState, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import { HlsPlayer } from './HlsPlayer';
import { VolumeControl } from './VolumeControl';
import { useWindowsStore } from '../store/windowsStore';
import { useDiscoveryStore } from '../store/discoveryStore';
import { useSpacesStore } from '../store/spacesStore';
import styled from 'styled-components';

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
  border: 1px solid #444;
  background: #000;
  position: relative;
`;

const WindowHeader = styled.div<{ maximized: boolean }>`
  height: 30px;
  background: #333;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px;
  cursor: ${({ maximized }) => (maximized ? 'default' : 'move')};
  font-size: 14px;
`;

const HeaderRight = styled.div`
  display: flex;
  gap: 5px;
`;

const StyledSelect = styled.select`
  font-size: 12px;
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
  color: #00f;
  text-decoration: underline;
  font-size: 16px;
`;

const LoadingText = styled.div`
  color: #fff;
`;

const CopyMessage = styled.div`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0,0,0,0.7);
  color: #fff;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  z-index: 9999;
`;

const buttonStyle: React.CSSProperties = {
  background: '#444',
  color: '#fff',
  border: 'none',
  borderRadius: 3,
  cursor: 'pointer',
  width: 25,
  height: 25,
  padding: 0,
  fontSize: 16
};

export const VideoWindow: React.FC<Props> = ({ id, room, x, y, width, height, pinned }) => {
  const updateWindow = useWindowsStore((s) => s.updateWindow);
  const removeWindow = useWindowsStore((s) => s.removeWindow);
  const bringToFront = useSpacesStore((s) => s.bringToFront);
  const copyWindowToSpace = useSpacesStore((s) => s.copyWindowToSpace);
  const togglePin = useDiscoveryStore(s => s.togglePin);
  const spaces = useSpacesStore((s) => s.spaces);
  const activeSpaceId = useSpacesStore((s) => s.activeSpaceId);
  const activeSpace = spaces.find(t => t.id === activeSpaceId);
  const zIndex = activeSpace?.zIndexes[id] ?? 1;
  const [maximized, setMaximized] = useState(false);
  const isPinned = pinned ?? false;
  const [hlsSource, setHlsSource] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const toggleMaximize = () => setMaximized(!maximized);
  const [isPrivate, setIsPrivate] = useState(false);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);

  const windowState = useSpacesStore(s => {
    const space = s.spaces.find(sp => sp.id === s.activeSpaceId);
    return space?.windows.find(w => w.id === id);
  });

  const muted = windowState?.isMuted ?? true;
  const volume = windowState?.volume ?? 1.0;

  const setVolume = (v: number) => {
    useSpacesStore.getState().setWindowVolume(id, v);
  };

  const toggleMute = () => {
    useSpacesStore.getState().toggleWindowMute(id);
  };


  useEffect(() => {
    async function fetchHls() {
      try {
        const res = await fetch(`https://chaturbate.com/api/chatvideocontext/${room}/`);
        const data = await res.json();

        if (data.hls_source) {
          setHlsSource(data.hls_source);
          useWindowsStore.getState().updateWindow(id, { isOnline: true });
          setIsOffline(false);
        } else if (data.room_status === 'private') {
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
        console.error('Erro carregando HLS:', err);
        setHlsSource(null);
        setIsOffline(true);
        setIsPrivate(false);
        useWindowsStore.getState().updateWindow(id, { isOnline: false });
      }
    }
    fetchHls();
  }, [room, id]);

  const copyWindowToSpaceLocal = (windowId: string, targetSpaceId: string) => {
    copyWindowToSpace(windowId, targetSpaceId);
    const spaceName = spaces.find(s => s.id === targetSpaceId)?.name ?? '';
    setCopyMessage(`Room copied to ${spaceName}`);
    setTimeout(() => setCopyMessage(null), 3000);
  }

  return (
    <Rnd
      size={maximized ? { width: window.innerWidth, height: window.innerHeight - 50 } : { width, height }}
      position={maximized ? { x: 0, y: 50 } : { x, y }}
      onDragStart={() => bringToFront(id)}
      onResizeStart={() => bringToFront(id)}
      onDragStop={(e, d) => updateWindow(id, { x: d.x, y: d.y })}
      onResizeStop={(e, direction, ref, delta, pos) => {
        updateWindow(id, {
          width: ref.offsetWidth,
          height: ref.offsetHeight,
          x: pos.x,
          y: pos.y
        });
      }}
      bounds="parent"
      dragHandleClassName="window-header"
      cancel=".no-drag"
      minWidth={320}
      minHeight={240}
      disableDragging={maximized}
      enableResizing={!maximized}
      style={{ zIndex }}
    >
      <WindowContainer onMouseDown={() => bringToFront(id)}>
        <WindowHeader
          className="window-header"
          maximized={maximized}
          onMouseDown={() => bringToFront(id)}
        >
          <a
            href={`https://handplayspaces.chaturbate.com/${room}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#fff', textDecoration: 'underline' }}
          >
            {room}
          </a>
          <VolumeControl muted={muted} volume={volume} onMuteToggle={toggleMute} onVolumeChange={setVolume} />
          <HeaderRight>
            <button onClick={() => togglePin(id)}>{isPinned ? "📌" : "📍"}</button>
            <button onClick={toggleMaximize} style={buttonStyle}>{maximized ? '🗗' : '🗖'}</button>
            <button onClick={() => removeWindow(id)} style={buttonStyle}>❌</button>
            <StyledSelect className="no-drag" value={activeSpaceId} onChange={(e) => copyWindowToSpaceLocal(id, e.target.value)}>
              {spaces.map(space => (
                <option key={space.id} value={space.id}>{space.name}</option>
              ))}
            </StyledSelect>
          </HeaderRight>
        </WindowHeader>
        <WindowContent>
          {isOffline ? (
            <OfflineText>OFFLINE</OfflineText>
          ) : isPrivate ? (
            <PrivateContainer>
              <PrivateTitle>SHOW NOW</PrivateTitle>
              <PrivateLink
                href={`https://handplayspaces.chaturbate.com/${room}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Ver no Chaturbate
              </PrivateLink>
            </PrivateContainer>
          ) : hlsSource ? (
            <HlsPlayer src={hlsSource} muted={muted} volume={volume} />
          ) : (
            <LoadingText>Carregando vídeo...</LoadingText>
          )}

          {copyMessage && (
            <CopyMessage>
              {copyMessage}
            </CopyMessage>
          )}
        </WindowContent>
      </WindowContainer>
    </Rnd>
  );
};
