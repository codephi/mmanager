import React, { useState } from 'react';
import { Rnd } from 'react-rnd';
import { useLayoutStore } from '../store/layout';

interface Props {
  id: string;
  room: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export const VideoWindow: React.FC<Props> = ({ id, room, x, y, width, height }) => {
  const updateWindow = useLayoutStore((s) => s.updateWindow);
  const removeWindow = useLayoutStore((s) => s.removeWindow);
  const bringToFront = useLayoutStore((s) => s.bringToFront);
  const zIndex = useLayoutStore((s) => s.zIndexes[id] ?? 1);

  const iframeUrl = `https://pt.chaturbate.com/fullvideo/?campaign=XW3KB&signup_notice=1&tour=dU9X&track=default&disable_sound=0&b=${room}`;

  const [minimized, setMinimized] = useState(false);
  const [maximized, setMaximized] = useState(false);

  const toggleMinimize = () => setMinimized(!minimized);
  const toggleMaximize = () => setMaximized(!maximized);

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
          onMouseDown={() => bringToFront(id)} // <-- clique normal também traz para frente
        >
          <div>{room}</div>
          <div style={{ display: 'flex', gap: 5 }}>
            <button onClick={toggleMinimize} style={buttonStyle}>{minimized ? '🔼' : '🔽'}</button>
            <button onClick={toggleMaximize} style={buttonStyle}>{maximized ? '🗗' : '🗖'}</button>
            <button onClick={() => removeWindow(id)} style={buttonStyle}>❌</button>
          </div>
        </div>

        {!minimized && (
          <div style={{ width: '100%', height: 'calc(100% - 30px)' }}>
            <iframe
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
