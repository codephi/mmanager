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
export interface Root {
  rooms: Room[];
  total_count: number;
  all_rooms_count: number;
  room_list_id: string;
  bls_payload: string;
}

export interface Room {
  display_age?: number;
  gender: string;
  location: string;
  current_show: string;
  username: string;
  tags: string[];
  is_new: boolean;
  num_users: number;
  num_followers: number;
  start_dt_utc: string;
  country: string;
  has_password: boolean;
  is_gaming: boolean;
  is_age_verified: boolean;
  label: string;
  is_following: boolean;
  source_name: string;
  start_timestamp: number;
  img: string;
  subject: string;
  source_position?: number;
}
