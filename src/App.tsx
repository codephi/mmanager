import React, { useState } from 'react';
import './App.css';
import { useLayoutStore } from './store/layout';
import { VideoWindow } from './components/VideoWindow';

function App() {
  const spaces = useLayoutStore((s) => s.spaces);
  const activeSpaceId = useLayoutStore((s) => s.activeSpaceId);
  const addSpace = useLayoutStore((s) => s.addSpace);
  const removeSpace = useLayoutStore((s) => s.removeSpace);
  const renameSpace = useLayoutStore((s) => s.renameSpace);
  const switchSpace = useLayoutStore((s) => s.switchSpace);
  const addWindow = useLayoutStore((s) => s.addWindow);
  const arrangeWindows = useLayoutStore((s) => s.arrangeWindows);

  const activeSpace = spaces.find(t => t.id === activeSpaceId);
  const [room, setRoom] = useState('');
  const [newSpaceName, setNewSpaceName] = useState('');
  const [renamingSpaceId, setRenamingSpaceId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const toggleAutoArrange = useLayoutStore((s) => s.toggleAutoArrange);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#222', position: 'relative' }}>
      {/* Área de abas */}
      <div style={{ padding: 10, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {spaces.map(space => (
          <div key={space.id} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            {renamingSpaceId === space.id ? (
              <>
                <input
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onBlur={() => {
                    renameSpace(space.id, renameValue);
                    setRenamingSpaceId(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      renameSpace(space.id, renameValue);
                      setRenamingSpaceId(null);
                    }
                  }}
                  autoFocus
                />
              </>
            ) : (
              <button
                onClick={() => switchSpace(space.id)}
                style={{ fontWeight: space.id === activeSpaceId ? 'bold' : 'normal' }}
              >
                {space.name}
              </button>
            )}
            <button
              onClick={() => {
                setRenamingSpaceId(space.id);
                setRenameValue(space.name);
              }}
              style={{ fontSize: 12 }}
            >
              ✏️
            </button>

            {/* Checkbox do AutoArrange */}
            <label style={{ fontSize: 12 }}>
              <input
                type="checkbox"
                checked={space.autoArrange}
                onChange={() => toggleAutoArrange(space.id)}
              />
              Auto Grid
            </label>
          </div>
        ))}

        <input
          type="text"
          placeholder="Nova aba"
          value={newSpaceName}
          onChange={(e) => setNewSpaceName(e.target.value)}
        />
        <button onClick={() => { addSpace(newSpaceName); setNewSpaceName(''); }}>
          Adicionar Aba
        </button>
        <button onClick={() => removeSpace(activeSpaceId)}>
          Remover Aba
        </button>
      </div>

      {/* Área de janelas */}
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

      {activeSpace?.windows.map(win => (
        <VideoWindow key={`${activeSpace.id}-${win.id}`} {...win} />
      ))}

    </div>
  );
}

export default App;
