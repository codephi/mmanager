import React, { useState } from 'react';
import './App.css';
import { useLayoutStore } from './store/layout';
import { VideoWindow } from './components/VideoWindow';

function App() {
  const tabs = useLayoutStore((s) => s.tabs);
  const activeTabId = useLayoutStore((s) => s.activeTabId);
  const addTab = useLayoutStore((s) => s.addTab);
  const removeTab = useLayoutStore((s) => s.removeTab);
  const renameTab = useLayoutStore((s) => s.renameTab);
  const switchTab = useLayoutStore((s) => s.switchTab);
  const addWindow = useLayoutStore((s) => s.addWindow);
  const arrangeWindows = useLayoutStore((s) => s.arrangeWindows);

  const activeTab = tabs.find(t => t.id === activeTabId);
  const [room, setRoom] = useState('');
  const [newTabName, setNewTabName] = useState('');

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#222', position: 'relative' }}>
      <div style={{ padding: 10, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => switchTab(tab.id)}
            style={{ fontWeight: tab.id === activeTabId ? 'bold' : 'normal' }}
          >
            {tab.name}
          </button>
        ))}

        <input
          type="text"
          placeholder="Nova aba"
          value={newTabName}
          onChange={(e) => setNewTabName(e.target.value)}
        />
        <button onClick={() => { addTab(newTabName); setNewTabName(''); }}>
          Adicionar Aba
        </button>
        <button onClick={() => removeTab(activeTabId)}>
          Remover Aba
        </button>
      </div>

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

      {activeTab?.windows.map(win => (
        <VideoWindow key={win.id} {...win} />
      ))}
    </div>
  );
}

export default App;
