import type { SpaceConfig } from "./types";

export function generateId(): string {
    return Math.random().toString(36).substring(2, 9);
}

type Padding = {
    top: number;
    bottom: number;
    left: number;
    right: number;
};

export const arrangeWindowsInternal = (
    space: SpaceConfig,
): SpaceConfig => {
    const total = space.windows.length;
    if (total === 0) return space;

    const padding: Padding = { top: 100, bottom: 10, left: 10, right: 10 }


    const screenWidth = window.innerWidth - padding.left - padding.right;
    const screenHeight = window.innerHeight - padding.top - padding.bottom;
    const cols = Math.ceil(Math.sqrt(total));
    const rows = Math.ceil(total / cols);
    const cellWidth = Math.floor(screenWidth / cols);
    const cellHeight = Math.floor(screenHeight / rows);

    const newWindows = space.windows.map((win, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);
        return {
            ...win,
            x: padding.left + col * cellWidth,
            y: padding.top + row * cellHeight,
            width: cellWidth,
            height: cellHeight
        };
    });

    return { ...space, windows: newWindows };
};
