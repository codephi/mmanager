import React from 'react';
import { useRootStore } from '../store/rootStore';
import { VideoWindow } from './VideoWindow';

export const WindowsGrid: React.FC = () => {
    const spaces = useRootStore((s) => s.spaces);
    const activeSpaceId = useRootStore((s) => s.activeSpaceId);
    const filterMode = useRootStore(s => s.filterMode);

    const activeSpace = spaces.find(t => t.id === activeSpaceId);

    if (!activeSpace) return null;

    let windows = activeSpace?.windows ?? [];

    if (activeSpaceId !== 'discovery') {
        if (filterMode === 'online') {
            windows = windows.filter(w => w.isOnline === true);
        } else if (filterMode === 'offline') {
            windows = windows.filter(w => w.isOnline === false);
        }
    }

    return windows.map(win => (
        <VideoWindow key={`${activeSpace?.id}-${win.id}`} {...win} />
    ));
};
