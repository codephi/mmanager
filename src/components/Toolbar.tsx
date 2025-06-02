import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useRootStore } from '../store/rootStore';
import { useWindowsStore } from '../store/windowsStore';

// Styled Components
const ToolbarContainer = styled.div`
    padding: 10px;
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
`;

const DiscoveryControls = styled.div`
    display: flex;
    gap: 10px;
`;

const SpaceContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 5px;
`;

const Label = styled.label`
    color: white;
    font-size: 12px;
`;

const RenameInput = styled.input`
    font-size: 14px;
`;

const SpaceButton = styled.button<{ active?: boolean }>`
    font-weight: ${({ active }) => (active ? 'bold' : 'normal')};
`;

const RenameButton = styled.button`
    font-size: 12px;
`;

// Subcomponente de edição de space
function SpaceOption({
    space,
    renamingSpaceId,
    setRenamingSpaceId,
    renameValue,
    setRenameValue,
    renameSpace,
    toggleAutoArrange,
    switchSpace,
    activeSpaceId,
}: any) {
    return (
        <SpaceContainer>
            {renamingSpaceId === space.id ? (
                <RenameInput
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
            ) : (
                <SpaceButton
                    onClick={() => switchSpace(space.id)}
                    active={space.id === activeSpaceId}
                >
                    {space.name}
                </SpaceButton>
            )}
            <RenameButton
                onClick={() => {
                    setRenamingSpaceId(space.id);
                    setRenameValue(space.name);
                }}
            >
                ✏️
            </RenameButton>
            <Label>
                <input
                    type="checkbox"
                    checked={space.autoArrange}
                    onChange={() => toggleAutoArrange(space.id)}
                />
                Auto Grid
            </Label>
        </SpaceContainer>
    );
}

function Toolbar() {
    const spaces = useRootStore((s) => s.spaces);
    const activeSpaceId = useRootStore((s) => s.activeSpaceId);
    const addSpace = useRootStore((s) => s.addSpace);
    const removeSpace = useRootStore((s) => s.removeSpace);
    const renameSpace = useRootStore((s) => s.renameSpace);
    const switchSpace = useRootStore((s) => s.switchSpace);
    const addWindow = useWindowsStore((s) => s.addWindow);
    const arrangeWindows = useRootStore((s) => s.arrangeWindows);
    const discovery = spaces.find(s => s.id === 'discovery');
    const loadDiscovery = useRootStore(s => s.loadDiscovery);
    const [room, setRoom] = useState('');
    const [newSpaceName, setNewSpaceName] = useState('');
    const [renamingSpaceId, setRenamingSpaceId] = useState<string | null>(null);
    const [renameValue, setRenameValue] = useState('');
    const discoveryOffset = useRootStore(s => s.discoveryOffset);
    const isLoadingDiscovery = useRootStore(s => s.isLoadingDiscovery);
    const loadNextDiscovery = useRootStore(s => s.loadNextDiscovery);
    const loadPrevDiscovery = useRootStore(s => s.loadPrevDiscovery);
    const discoveryLimit = useRootStore(s => s.discoveryLimit);
    const setDiscoveryLimit = useRootStore(s => s.setDiscoveryLimit);
    const discoverySpace = spaces.find(s => s.id === 'discovery');
    const pinnedCount = discoverySpace?.windows.filter(w => w.pinned).length ?? 0;
    const addSpaceFromPinned = useRootStore((s) => s.addSpaceFromPinned);
    const arrangeFilteredWindows = useRootStore(s => s.arrangeFilteredWindows);
    const toggleAutoArrange = useRootStore((s) => s.toggleAutoArrange);
    const setFilterMode = useRootStore(s => s.setFilterMode);
    const filterMode = useRootStore(s => s.filterMode);
    const globalMuted = useRootStore(s => s.globalMuted);
    const toggleGlobalMuted = useRootStore(s => s.toggleGlobalMuted);

    useEffect(() => {
        const handleResize = () => {
            const active = spaces.find(t => t.id === activeSpaceId);
            if (active?.autoArrange) {
                if (filterMode === 'all') {
                    arrangeWindows();
                } else {
                    arrangeFilteredWindows();
                }
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [spaces, activeSpaceId, arrangeWindows, arrangeFilteredWindows, filterMode]);

    useEffect(() => {
        if (discovery && discovery.windows.length === 0 && !isLoadingDiscovery) {
            loadDiscovery();
        }
    }, [discovery?.windows.length, isLoadingDiscovery]);

    const selectedSpace = spaces.find(s => s.id === activeSpaceId);

    return (
        <ToolbarContainer>
            {activeSpaceId === 'discovery' && (
                <DiscoveryControls>
                    <Label>
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
                    </Label>

                    <button onClick={() => loadPrevDiscovery()} disabled={discoveryOffset === 0}>
                        Prev
                    </button>
                    <button onClick={() => loadNextDiscovery()}>
                        Next
                    </button>

                    <button onClick={addSpaceFromPinned} disabled={pinnedCount === 0}>
                        Criar Space com Pinned
                    </button>
                </DiscoveryControls>
            )}

            <button onClick={() => toggleGlobalMuted()}>
                {globalMuted ? '🔇 Unmute All' : '🔊 Mute All'}
            </button>

            <select value={filterMode} onChange={e => setFilterMode(e.target.value as any)}>
                <option value="all">Todas as salas</option>
                <option value="online">Somente online</option>
                <option value="offline">Somente offline</option>
            </select>

            {/* Select principal de escolha de space */}
            <select
                value={activeSpaceId}
                onChange={e => switchSpace(e.target.value)}
            >
                {spaces.map(space => (
                    <option key={space.id} value={space.id}>
                        {space.name}
                    </option>
                ))}
            </select>

            {/* Área de renomear/configurar o space */}
            {selectedSpace && (
                <SpaceOption
                    space={selectedSpace}
                    renamingSpaceId={renamingSpaceId}
                    setRenamingSpaceId={setRenamingSpaceId}
                    renameValue={renameValue}
                    setRenameValue={setRenameValue}
                    renameSpace={renameSpace}
                    toggleAutoArrange={toggleAutoArrange}
                    switchSpace={switchSpace}
                    activeSpaceId={activeSpaceId}
                />
            )}

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
            <button onClick={arrangeFilteredWindows}>
                Organizar em Grid
            </button>
        </ToolbarContainer>
    );
}

export default Toolbar;
