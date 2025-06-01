import React, { useState } from 'react';
import './App.css';
import { useLayoutStore } from './store/layout';
import { VideoWindow } from './components/VideoWindow';

function App() {
  const windows = useLayoutStore((s) => s.windows);
  const addWindow = useLayoutStore((s) => s.addWindow);
  const arrangeWindows = useLayoutStore((s) => s.arrangeWindows);
  const [room, setRoom] = useState('');

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#222', position: 'relative' }}>
      <div style={{ padding: 10, display: 'flex', gap: 10 }}>
        <input
          type="text"
          placeholder="Nome da Sala"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
        />
        <button onClick={() => { addWindow(room); setRoom(''); }}>
          Adicionar Stream
        </button>
        <button onClick={arrangeWindows}>
          Organizar em Grid
        </button>
      </div>

      {windows.map(win => (
        <VideoWindow key={win.id} {...win} />
      ))}
    </div>
  );
}

export default App;
