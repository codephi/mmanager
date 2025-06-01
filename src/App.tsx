import React, { useState, useEffect } from 'react';
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
  const toggleAutoArrange = useLayoutStore((s) => s.toggleAutoArrange);
  const discovery = spaces.find(s => s.id === 'discovery');
  const loadDiscovery = useLayoutStore(s => s.loadDiscovery);
  const activeSpace = spaces.find(t => t.id === activeSpaceId);
  const [room, setRoom] = useState('');
  const [newSpaceName, setNewSpaceName] = useState('');
  const [renamingSpaceId, setRenamingSpaceId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const discoveryOffset = useLayoutStore(s => s.discoveryOffset);
  const isLoadingDiscovery = useLayoutStore(s => s.isLoadingDiscovery);
  const loadNextDiscovery = useLayoutStore(s => s.loadNextDiscovery);
  const loadPrevDiscovery = useLayoutStore(s => s.loadPrevDiscovery);
  const discoveryLimit = useLayoutStore(s => s.discoveryLimit);
  const setDiscoveryLimit = useLayoutStore(s => s.setDiscoveryLimit);
  const discoverySpace = spaces.find(s => s.id === 'discovery');
  const pinnedCount = discoverySpace?.windows.filter(w => w.pinned).length ?? 0;
  const addSpaceFromPinned = useLayoutStore((s) => s.addSpaceFromPinned);

  useEffect(() => {
    const handleResize = () => {
      const active = spaces.find(t => t.id === activeSpaceId);
      if (active?.autoArrange) {
        arrangeWindows();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [spaces, activeSpaceId, arrangeWindows]);


  useEffect(() => {
    if (discovery && discovery.windows.length === 0 && !isLoadingDiscovery) {
      loadDiscovery();
    }
  }, [discovery?.windows.length, isLoadingDiscovery]);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#222', position: 'relative' }}>
      {/* Área de Spaces */}
      <div style={{ padding: 10, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {activeSpaceId === 'discovery' && (
          <div style={{ display: 'flex', gap: 10 }}>
            <label style={{ color: 'white' }}>
              Salas por página:
              <select
                value={discoveryLimit}
                onChange={(e) => setDiscoveryLimit(Number(e.target.value))}
              >
                {Array.from({ length: 12 }, (_, i) => i + 1)
                  .filter(value => value >= Math.max(1, pinnedCount))
                  .map(value => (
                    <option key={value} value={value}>{value}</option>
                  ))}
              </select>

            </label>

            <button onClick={() => loadPrevDiscovery()} disabled={isLoadingDiscovery || discoveryOffset === 0}>
              Prev
            </button>
            <button onClick={() => loadNextDiscovery()} disabled={isLoadingDiscovery}>
              Next
            </button>

            <button onClick={addSpaceFromPinned} disabled={pinnedCount === 0}>
              Criar Space com Pinned
            </button>

          </div>
        )}


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
          placeholder="Novo Space"
          value={newSpaceName}
          onChange={(e) => setNewSpaceName(e.target.value)}
        />
        <button onClick={() => { addSpace(newSpaceName); setNewSpaceName(''); }}>
          Adicionar Space
        </button>
        <button onClick={() => removeSpace(activeSpaceId)}>
          Remover Space
        </button>

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
