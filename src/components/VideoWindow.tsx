import React, { useEffect, useRef, useState } from 'react';
import { Rnd } from 'react-rnd';
import { useLayoutStore } from '../store/layout';

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

  const spaces = useLayoutStore((s) => s.spaces);
  const activeSpaceId = useLayoutStore((s) => s.activeSpaceId);
  const activeSpace = spaces.find(t => t.id === activeSpaceId);
  const zIndex = activeSpace?.zIndexes[id] ?? 1;

  // const iframeUrl = `https://chaturbate.com/fullvideo/?campaign=XW3KB&signup_notice=1&tour=dU9X&track=default&disable_sound=0&b=${room}`;
  const iframeUrl = `http://localhost:3000/proxy/${room}`;

  const [minimized, setMinimized] = useState(false);
  const [maximized, setMaximized] = useState(false);

  const toggleMinimize = () => setMinimized(!minimized);
  const toggleMaximize = () => setMaximized(!maximized);
  const togglePin = useLayoutStore(s => s.togglePin);
  const isPinned = pinned ?? false;

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const onIframeLoad = () => {
    try {
      const iframeDoc = iframeRef.current?.contentDocument || iframeRef.current?.contentWindow?.document;
      const closeBtn = iframeDoc?.getElementById('chat-close-btn');
      closeBtn?.click();
    } catch (err) {
      console.warn("Cross-origin - não foi possível acessar o iframe:", err);
    }
  };

  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.addEventListener('load', onIframeLoad);
    }
    return () => {
      if (iframeRef.current) {
        iframeRef.current.removeEventListener('load', onIframeLoad);
      }
    };
  }, []);

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
            <iframe
              ref={iframeRef}
              src={iframeUrl}
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              allowFullScreen
            />
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
