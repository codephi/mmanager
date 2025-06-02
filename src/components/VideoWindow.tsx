import React, { useState, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import { useLayoutStore } from '../store/layout';
import { HlsPlayer } from './HlsPlayer';

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
  const updateWindow = useLayoutStore((s) => s.updateWindow);
  const removeWindow = useLayoutStore((s) => s.removeWindow);
  const bringToFront = useLayoutStore((s) => s.bringToFront);
  const moveWindowToSpace = useLayoutStore((s) => s.moveWindowToSpace);
  const togglePin = useLayoutStore(s => s.togglePin);
  const spaces = useLayoutStore((s) => s.spaces);
  const activeSpaceId = useLayoutStore((s) => s.activeSpaceId);
  const activeSpace = spaces.find(t => t.id === activeSpaceId);
  const zIndex = activeSpace?.zIndexes[id] ?? 1;

  const [minimized, setMinimized] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const isPinned = pinned ?? false;

  const [hlsSource, setHlsSource] = useState<string | null>(null);

  const toggleMinimize = () => setMinimized(!minimized);
  const toggleMaximize = () => setMaximized(!maximized);

  // Aqui buscamos o HLS source
  useEffect(() => {
    async function fetchHls() {
      try {
        const res = await fetch(`https://chaturbate.com/api/chatvideocontext/${room}/`);
        const data = await res.json();
        if (data.hls_source) {
          setHlsSource(data.hls_source);
        }
      } catch (err) {
        console.error('Erro carregando HLS:', err);
      }
    }

    fetchHls();
  }, [room]);

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
      <div style={{ width: '100%', height: '100%', border: '1px solid #444', background: '#000' }}>
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
          <div style={{ display: 'flex', gap: 5 }}>
            <button onClick={() => togglePin(id)}>
              {isPinned ? "📌" : "📍"}
            </button>
            <button onClick={toggleMinimize} style={buttonStyle}>{minimized ? '🔼' : '🔽'}</button>
            <button onClick={toggleMaximize} style={buttonStyle}>{maximized ? '🗗' : '🗖'}</button>
            <button onClick={() => removeWindow(id)} style={buttonStyle}>❌</button>
            <select
              className="no-drag"
              value={activeSpaceId}
              onChange={(e) => moveWindowToSpace(id, e.target.value)}
              style={{ fontSize: 12 }}
            >
              {spaces.map(space => (
                <option key={space.id} value={space.id}>{space.name}</option>
              ))}
            </select>
          </div>
        </div>

        {!minimized && (
          <div style={{ width: '100%', height: 'calc(100% - 30px)' }}>
            {hlsSource ? (
              <HlsPlayer src={hlsSource} />
            ) : (
              <div style={{ color: '#fff', textAlign: 'center', marginTop: 20 }}>Carregando vídeo...</div>
            )}
          </div>
        )}
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
