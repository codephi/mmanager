import type { WindowConfig, SpaceConfig } from '../store/spacesStore';

export function arrangeWindows(space: SpaceConfig): SpaceConfig {
    const total = space.windows.length;
    if (total === 0) return space;

    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight - 50; // você já reserva 50px no layout
    const cols = Math.ceil(Math.sqrt(total));
    const rows = Math.ceil(total / cols);
    const cellWidth = Math.floor(screenWidth / cols);
    const cellHeight = Math.floor(screenHeight / rows);

    const newWindows: WindowConfig[] = space.windows.map((win, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);
        return {
            ...win,
            x: col * cellWidth,
            y: row * cellHeight + 50, // reserva da topbar
            width: cellWidth,
            height: cellHeight
        };
    });

    return { ...space, windows: newWindows };
}
