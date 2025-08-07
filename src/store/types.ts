export interface WindowConfig {
  id: string;
  room: string;
  x: number;
  y: number;
  w: number; // largura em colunas
  h: number; // altura em linhas
  width: number;
  height: number;
  pinned?: boolean;
  isOnline?: boolean;
  isMuted?: boolean;
  volume?: number;
  isPaused?: boolean;
  maximized?: boolean;
  pinnedX: number;
  pinnedY: number;
  pinnedWidth: number;
  pinnedHeight: number;
}

export interface SpaceConfig {
  id: string;
  name: string;
  windows: WindowConfig[];
  zIndexes: Record<string, number>;
  autoArrange: boolean;
}
export interface RoomList {
  rooms: string[];
  total_count: number;
  all_rooms_count: number;
}
