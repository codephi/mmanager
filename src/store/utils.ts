import type { SpaceConfig } from "./types";

export function generateId(): string {
    return Math.random().toString(36).substring(2, 9);
}

export const arrangeWindowsInternal = (space: SpaceConfig): SpaceConfig => {
    const total = space.windows.length;
    if (total === 0) return space;

    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight - 50;
    const cols = Math.ceil(Math.sqrt(total));
    const rows = Math.ceil(total / cols);
    const cellWidth = Math.floor(screenWidth / cols);
    const cellHeight = Math.floor(screenHeight / rows);

    const newWindows = space.windows.map((win, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);
        return {
            ...win,
            x: col * cellWidth,
            y: row * cellHeight + 50,
            width: cellWidth,
            height: cellHeight
        };
    });

    return { ...space, windows: newWindows };
};