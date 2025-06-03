import React, { useState, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import { useRootStore } from '../store/rootStore';
import { HlsPlayer } from './HlsPlayer';
import { VolumeControl } from './VolumeControl';
import { useWindowsStore } from '../store/windowsStore';

interface Props {
  id: string;
  room: string;
  x: number;
  y: number;
  width: number;
  height: number;
  pinned?: boolean;
}

export const VideoWindow: React.FC<Props> = ({ id, room, x, y, width, height, pinned }) => {
  const updateWindow = useWindowsStore((s) => s.updateWindow);
  const removeWindow = useWindowsStore((s) => s.removeWindow);
  const bringToFront = useRootStore((s) => s.bringToFront);
  const moveWindowToSpace = useRootStore((s) => s.moveWindowToSpace);
  const togglePin = useRootStore(s => s.togglePin);
  const spaces = useRootStore((s) => s.spaces);
  const activeSpaceId = useRootStore((s) => s.activeSpaceId);
  const activeSpace = spaces.find(t => t.id === activeSpaceId);
  const zIndex = activeSpace?.zIndexes[id] ?? 1;
  const [maximized, setMaximized] = useState(false);
  const isPinned = pinned ?? false;
  const [hlsSource, setHlsSource] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const toggleMaximize = () => setMaximized(!maximized);
  const globalMuted = useRootStore(s => s.globalMuted);
  const [mutedState, setMutedState] = useState(globalMuted);
  const [isPrivate, setIsPrivate] = useState(false);
  const isDiscovery = activeSpaceId === 'discovery';


  const windowState = useRootStore(s => {
    const space = s.spaces.find(sp => sp.id === s.activeSpaceId);
    return space?.windows.find(w => w.id === id);
  });

  const muted = windowState?.isMuted ?? false;
  const volume = windowState?.volume ?? 1.0;
  const effectiveMuted = isDiscovery ? globalMuted : muted;

  const setVolume = (v: number) => {
    useRootStore.getState().setWindowVolume(id, v);
  };

  const toggleMute = () => {
    useRootStore.getState().toggleWindowMute(id);
  };


  useEffect(() => {
    setMutedState(globalMuted);
  }, [globalMuted]);


  useEffect(() => {
    async function fetchHls() {
      try {
        const res = await fetch(`https://chaturbate.com/api/chatvideocontext/${room}/`);
        const data = await res.json();

        if (data.hls_source) {
          setHlsSource(data.hls_source);
          useWindowsStore.getState().updateWindow(id, { isOnline: true });
          setIsOffline(false);  // <== importante
        } else if (data.room_status === 'private') {
          setHlsSource(null);   // importante garantir que é null
          setIsPrivate(true);   // <== novo estado
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
      <div
        style={{ width: '100%', height: '100%', border: '1px solid #444', background: '#000' }}
        onMouseDown={() => bringToFront(id)} >
        <div
          className="window-header"
          style={{
            height: 30,
            background: '#333',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 10px',
            cursor: maximized ? 'default' : 'move',
            fontSize: 14
          }}
          onMouseDown={() => bringToFront(id)}
        >
          <div>{room}</div>
          <VolumeControl muted={effectiveMuted} volume={volume} onMuteToggle={toggleMute} onVolumeChange={setVolume} />


          <div style={{ display: 'flex', gap: 5 }}>
            <button onClick={() => togglePin(id)}>{isPinned ? "📌" : "📍"}</button>
            <button onClick={toggleMaximize} style={buttonStyle}>{maximized ? '🗗' : '🗖'}</button>
            <button onClick={() => removeWindow(id)} style={buttonStyle}>❌</button>
            <select className="no-drag" value={activeSpaceId} onChange={(e) => moveWindowToSpace(id, e.target.value)} style={{ fontSize: 12 }}>
              {spaces.map(space => (
                <option key={space.id} value={space.id}>{space.name}</option>
              ))}
            </select>
          </div>

        </div>

        <div style={{ width: '100%', height: 'calc(100% - 30px)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {isOffline ? (
            <div style={{ color: '#fff', fontSize: 24 }}>OFFLINE</div>
          ) : isPrivate ? (
            <div style={{ color: '#fff', textAlign: 'center' }}>
              <div style={{ fontSize: 24 }}>SHOW NOW</div>
              <a
                href={`https://handplayspaces.chaturbate.com/${room}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#00f', textDecoration: 'underline', fontSize: 16 }}
              >
                Ver no Chaturbate
              </a>
            </div>
          ) : hlsSource ? (
            <HlsPlayer src={hlsSource} muted={effectiveMuted} volume={volume} />
          ) : (
            <div style={{ color: '#fff' }}>Carregando vídeo...</div>
          )}
        </div>
      </div>
    </Rnd>
  );
};

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
