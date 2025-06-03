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