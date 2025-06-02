// store/types.ts


export interface WindowConfig {
    id: string;
    room: string;
    x: number;
    y: number;
    width: number;
    height: number;
    pinned?: boolean;
    isOnline?: boolean;
    isMuted?: boolean;
    volume?: number;
}

export interface SpaceConfig {
    id: string;
    name: string;
    windows: WindowConfig[];
    zIndexes: Record<string, number>;
    autoArrange: boolean;
}

export interface RootState {
    spaces: SpaceConfig[];
    activeSpaceId: string;
    discoveryOffset: number;
    isLoadingDiscovery: boolean;
    discoveryLimit: number;
    globalMuted: boolean;
    filterMode: 'all' | 'online' | 'offline';
    setFilterMode: (mode: 'all' | 'online' | 'offline') => void;
    arrangeFilteredWindows: () => void;
    toggleGlobalMuted: () => void;
    loadDiscovery: () => Promise<void>;
    addSpace: (name: string) => void;
    removeSpace: (id: string) => void;
    renameSpace: (id: string, name: string) => void;
    switchSpace: (id: string) => void;
    addWindow: (room: string) => void;
    updateWindow: (id: string, pos: Partial<WindowConfig>) => void;
    removeWindow: (id: string) => void;
    bringToFront: (id: string) => void;
    arrangeWindows: () => void;
    moveWindowToSpace: (windowId: string, targetSpaceId: string) => void;
    toggleAutoArrange: (spaceId: string) => void;
    loadNextDiscovery: () => Promise<void>;
    loadPrevDiscovery: () => Promise<void>;
    setDiscoveryLimit: (limit: number) => void;
    loadDiscoveryPage: (offset: number, force?: boolean) => Promise<void>;
    togglePin: (windowId: string) => void;
    addSpaceFromPinned: () => void;
    setWindowVolume: (windowId: string, volume: number) => void;
    toggleWindowMute: (windowId: string) => void;
}

export interface SpaceConfig {
    id: string;
    name: string;
    windows: WindowConfig[];
    zIndexes: Record<string, number>;
    autoArrange: boolean;
}
